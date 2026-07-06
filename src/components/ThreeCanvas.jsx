import { useEffect, useRef } from 'preact/hooks'
import * as THREE from 'three'
import SceneManager from '../three/SceneManager.js'
import TreeManager from '../three/TreeManager.js'
import TourController from '../three/TourController.js'

export default function ThreeCanvas({ onTourStep, topics, positions, edges, speed, onTimerTick }) {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const sm = new SceneManager(container)
    const tree = new TreeManager(sm.scene, topics, positions, edges)
    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()

    const onPointer = (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    sm.renderer.domElement.addEventListener('pointermove', onPointer)

    const tourStepCallback = (idx) => { if (onTourStep) onTourStep(idx >= 0 ? idx : -1) }
    const tour = new TourController(sm, tree, tourStepCallback)
    tour.setSpeed(speed || 'mid')
    window.__startTour = () => tour.start()
    window.__goToStep = (idx) => { if (tour.active) tour._go(idx) }
    window.__tourNext = () => tour.next()
    window.__tourPrev = () => tour.prev()

    const onClick = () => {
      const h = tree.hovered
      if (h !== null) {
        if (tree.cards[h].expanded) { tree.deselectAll(); tourStepCallback(-1); return }
        tree.deselectAll()
        tree.cards[h].setExpanded(true)
        tree.cards.forEach((c, i) => { if (i !== h) c.setDimmed(true) })
        tourStepCallback(h)
      } else {
        tree.deselectAll()
        tourStepCallback(-1)
      }
    }
    sm.renderer.domElement.addEventListener('click', onClick)

    const onKey = (e) => {
      if (e.key === 'Escape') { tree.deselectAll(); tourStepCallback(-1) }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { tour.next(); e.preventDefault() }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { tour.prev(); e.preventDefault() }
    }
    document.addEventListener('keydown', onKey)

    const onResize = () => sm.resize(window.innerWidth, window.innerHeight)
    window.addEventListener('resize', onResize)

    let animId
    function animate() {
      if (!sm.running) return
      sm.update()
      tree.updateMarkers(sm.animTime)
      tour.update(0.016)
      tree.updateRaycaster(raycaster, pointer, sm.camera)
      if (onTimerTick && tour.active) onTimerTick(tour.getProgress())
      sm.render()
      animId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(animId)
      sm.destroy()
      sm.renderer.domElement.removeEventListener('click', onClick)
      sm.renderer.domElement.removeEventListener('pointermove', onPointer)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onResize)
    }
  }, [topics, positions, edges, speed])

  return <div ref={containerRef} id="three-container" style={{ width:'100%', height:'100%' }} />
}
