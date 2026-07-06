import * as THREE from 'three'
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'

export default class LSTMCell {
  constructor() {
    this.group = new THREE.Group()
    this._build()
  }

  _build() {
    // Cell body
    const boxGeo = new THREE.BoxGeometry(2.0, 1.2, 1.0)
    const boxMat = new THREE.MeshPhysicalMaterial({
      color: 0x111827, transparent: true, opacity: 0.7,
      roughness: 0.3, metalness: 0.1, side: THREE.DoubleSide,
    })
    const body = new THREE.Mesh(boxGeo, boxMat)
    body.position.x = 1
    this.group.add(body)

    // Wireframe
    const edges = new THREE.EdgesGeometry(boxGeo)
    const edgeMat = new THREE.LineBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.25 })
    const wire = new THREE.LineSegments(edges, edgeMat)
    wire.position.copy(body.position)
    this.group.add(wire)

    // Cell state track (horizontal bar across top)
    const trackGeo = new THREE.BoxGeometry(2.4, 0.06, 0.06)
    const trackMat = new THREE.MeshPhysicalMaterial({
      color: 0xa855f7, emissive: 0xa855f7,
      emissiveIntensity: 0.2, transparent: true, opacity: 0.6,
    })
    this.track = new THREE.Mesh(trackGeo, trackMat)
    this.track.position.set(1, 0.5, 0)
    this.group.add(this.track)

    // Cell state label
    const cDiv = document.createElement('div')
    cDiv.textContent = 'Cₜ (cell state)'
    cDiv.style.cssText = 'color:#a855f7;font-size:9px;font-weight:600;font-family:monospace;text-shadow:0 0 8px rgba(168,85,247,0.5);'
    const cLabel = new CSS2DObject(cDiv)
    cLabel.position.set(1, 0.9, 0)
    this.group.add(cLabel)

    // Hidden state sphere
    const hGeo = new THREE.SphereGeometry(0.15, 12, 12)
    const hMat = new THREE.MeshPhysicalMaterial({
      color: 0xa855f7, emissive: 0xa855f7,
      emissiveIntensity: 0.3, transparent: true, opacity: 0.9,
    })
    this.hiddenState = new THREE.Mesh(hGeo, hMat)
    this.hiddenState.position.set(1, -0.25, 0)
    this.group.add(this.hiddenState)

    // Gate labels
    const gates = ['Forget', 'Input', 'Cell', 'Output']
    const colors = ['#ef4444', '#22c55e', '#3b82f6', '#f59e0b']
    const xPositions = [0.2, 0.6, 1.0, 1.4]

    gates.forEach((name, i) => {
      const gateDiv = document.createElement('div')
      gateDiv.textContent = name
      gateDiv.style.cssText = `color:${colors[i]};font-size:8px;font-weight:600;font-family:monospace;text-shadow:0 0 4px ${colors[i]}40;`
      const gateLabel = new CSS2DObject(gateDiv)
      gateLabel.position.set(xPositions[i], -0.7, 0)
      this.group.add(gateLabel)

      // Small gate indicator dot
      const dotGeo = new THREE.SphereGeometry(0.04, 8, 8)
      const dotMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(colors[i]),
        emissive: new THREE.Color(colors[i]),
        emissiveIntensity: 0.4,
      })
      const dot = new THREE.Mesh(dotGeo, dotMat)
      dot.position.set(xPositions[i], -0.5, 0)
      this.group.add(dot)
    })

    // x_t label
    const xDiv = document.createElement('div')
    xDiv.textContent = 'xₜ'
    xDiv.style.cssText = 'color:#a855f7;font-size:11px;font-weight:600;font-family:monospace;text-shadow:0 0 8px rgba(168,85,247,0.5);'
    const xLabel = new CSS2DObject(xDiv)
    xLabel.position.set(-0.3, 0.6, 0)
    this.group.add(xLabel)

    // h_t label
    const hDiv = document.createElement('div')
    hDiv.textContent = 'hₜ'
    hDiv.style.cssText = 'color:rgba(168,85,247,0.4);font-size:9px;font-weight:600;font-family:monospace;'
    const hLabel = new CSS2DObject(hDiv)
    hLabel.position.set(1, -0.55, 0)
    this.group.add(hLabel)
  }

  update(time) {
    const pulse = 0.8 + Math.sin(time * 1.5) * 0.2
    this.hiddenState.scale.set(pulse, pulse, pulse)
    this.hiddenState.material.emissiveIntensity = 0.2 + Math.sin(time * 1.5) * 0.15

    // Gate dots pulse sequentially
    this.group.children.forEach(child => {
      if (child.type === 'Mesh' && child.material && child.material.emissiveIntensity !== undefined && child.geometry.type === 'SphereGeometry' && child.geometry.parameters.radius === 0.04) {
        const idx = this.group.children.indexOf(child)
        const phase = idx * 0.5
        child.material.emissiveIntensity = 0.2 + Math.sin(time * 2 + phase) * 0.3
      }
    })

    // Cell state particles flow
    this.track.material.emissiveIntensity = 0.15 + Math.sin(time * 0.5) * 0.1
  }
}
