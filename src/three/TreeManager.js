import * as THREE from 'three'
import Card3D from './Card3D.js'
import { TOPICS } from '../data/theme.js'
import { treePositions, treeEdges } from '../data/tree.js'

export default class TreeManager {
  constructor(scene, topics, positions, edges) {
    this.scene = scene
    this.cards = []
    this.hovered = null
    this.topics = topics || TOPICS
    this.positions = positions || treePositions
    this.edges = edges || treeEdges
    this._createCards()
    this._createEdges()
    this._createMarkers()
  }

  rebuild(topics, positions, edges) {
    this._clear()
    this.topics = topics
    this.positions = positions
    this.edges = edges
    this._createCards()
    this._createEdges()
    this._createMarkers()
  }

  _clear() {
    this.cards.forEach(c => this.scene.remove(c.group))
    this.cards = []
    this.edges.forEach(() => {}) // edges are added directly to scene
    // remove edge objects from scene
    if (this._edgeObjects) this._edgeObjects.forEach(o => this.scene.remove(o))
    if (this.zeroRing) this.scene.remove(this.zeroRing)
    if (this.heroRing1) this.scene.remove(this.heroRing1)
    if (this.heroRing2) this.scene.remove(this.heroRing2)
  }

  _createCards() {
    this.cards = this.topics.map((t, i) => {
      const card = new Card3D(t, i, this.topics.length, this.positions[i])
      this.scene.add(card.group)
      return card
    })
  }

  _createEdges() {
    this._edgeObjects = []
    const mat = new THREE.LineBasicMaterial({ color: 0x00ffaa, transparent: true, opacity: 0.2 })
    this.edges.forEach(([a, b]) => {
      const p1 = this.positions[a], p2 = this.positions[b]
      if (!p1 || !p2) return
      const mid = p1.clone().add(p2).multiplyScalar(0.5).add(new THREE.Vector3(0, 0.3, 0))
      const pts = new THREE.QuadraticBezierCurve3(p1, mid, p2).getPoints(16)
      const obj = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat)
      this.scene.add(obj)
      this._edgeObjects.push(obj)
    })
  }

  _createMarkers() {
    const bmat = (c, o) => new THREE.MeshBasicMaterial({ color: new THREE.Color(c), transparent: true, opacity: o, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })
    this.zeroMat = bmat(0x00ffaa, 0.12)
    this.zeroRing = new THREE.Mesh(new THREE.RingGeometry(0.5, 1.0, 32), this.zeroMat)
    this.zeroRing.rotation.x = -Math.PI / 2
    this.zeroRing.position.set(0, this.positions[0]?.y - 0.3 || -5.3, 0)
    this.scene.add(this.zeroRing)

    const lastIdx = this.positions.length - 1
    this.heroMat1 = bmat(0x00ffaa, 0.15)
    this.heroRing1 = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.9, 32), this.heroMat1)
    this.heroRing1.rotation.x = -Math.PI / 2
    this.heroRing1.position.copy(this.positions[lastIdx]).add(new THREE.Vector3(0, -0.4, 0))
    this.scene.add(this.heroRing1)

    this.heroMat2 = bmat(0x00ffaa, 0.08)
    this.heroRing2 = new THREE.Mesh(new THREE.RingGeometry(0.8, 1.3, 32), this.heroMat2)
    this.heroRing2.rotation.x = -Math.PI / 2
    this.heroRing2.position.copy(this.positions[lastIdx]).add(new THREE.Vector3(0, -0.4, 0))
    this.scene.add(this.heroRing2)
  }

  updateMarkers(t) {
    const hp = 0.5 + Math.sin(t * 1.5) * 0.5
    this.heroMat1.opacity = 0.08 + hp * 0.12
    this.heroMat2.opacity = 0.04 + hp * 0.08
    this.heroRing1.scale.setScalar(1 + Math.sin(t * 2) * 0.04)
    this.heroRing2.scale.setScalar(1 + Math.sin(t * 1.6 + 1) * 0.06)
    this.zeroMat.opacity = 0.08 + Math.sin(t * 0.8) * 0.06
  }

  deselectAll() {
    this.cards.forEach(c => { c.setExpanded(false); c.setDimmed(false) })
  }

  updateRaycaster(raycaster, pointer, camera) {
    raycaster.setFromCamera(pointer, camera)
    const meshes = this.cards.map(c => c.card)
    const intersects = raycaster.intersectObjects(meshes)

    this.cards.forEach((c, i) => {
      c.update(camera.quaternion)
      if (c.expanded) return
      if (intersects.length && intersects[0].object === c.card) {
        if (this.hovered !== i) {
          if (this.hovered !== null) this.cards[this.hovered].setHover(false)
          this.hovered = i
          c.setHover(true)
        }
      } else {
        if (this.hovered === i) { c.setHover(false); this.hovered = null }
      }
    })
    return this.hovered
  }
}
