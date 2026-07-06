import * as THREE from 'three'
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'

export default class RNNCell {
  constructor() {
    this.group = new THREE.Group()
    this.tokens = []
    this._build()
  }

  _build() {
    // Main cell body — translucent glass box
    const boxGeo = new THREE.BoxGeometry(1.6, 1.0, 1.0)
    const boxMat = new THREE.MeshPhysicalMaterial({
      color: 0x111827,
      transparent: true,
      opacity: 0.7,
      roughness: 0.3,
      metalness: 0.1,
      side: THREE.DoubleSide,
    })
    this.body = new THREE.Mesh(boxGeo, boxMat)
    this.body.position.x = 0.8
    this.group.add(this.body)

    // Wireframe edge glow
    const edges = new THREE.EdgesGeometry(boxGeo)
    const edgeMat = new THREE.LineBasicMaterial({
      color: 0x22c55e,
      transparent: true,
      opacity: 0.25,
    })
    const wireframe = new THREE.LineSegments(edges, edgeMat)
    wireframe.position.copy(this.body.position)
    this.group.add(wireframe)

    // Hidden state sphere (center of cell)
    const stateGeo = new THREE.SphereGeometry(0.2, 16, 16)
    const stateMat = new THREE.MeshPhysicalMaterial({
      color: 0x22c55e,
      emissive: 0x22c55e,
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.9,
    })
    this.hiddenState = new THREE.Mesh(stateGeo, stateMat)
    this.hiddenState.position.set(0.8, 0, 0)
    this.group.add(this.hiddenState)

    // Input label
    const inputDiv = document.createElement('div')
    inputDiv.textContent = 'xₜ'
    inputDiv.style.color = '#22c55e'
    inputDiv.style.fontSize = '12px'
    inputDiv.style.fontWeight = '600'
    inputDiv.style.fontFamily = 'monospace'
    inputDiv.style.textShadow = '0 0 8px rgba(34,197,94,0.5)'
    const inputLabel = new CSS2DObject(inputDiv)
    inputLabel.position.set(-0.2, 0.7, 0)
    this.group.add(inputLabel)

    // Output label
    const outDiv = document.createElement('div')
    outDiv.textContent = 'yₜ'
    outDiv.style.color = '#22c55e'
    outDiv.style.fontSize = '12px'
    outDiv.style.fontWeight = '600'
    outDiv.style.fontFamily = 'monospace'
    outDiv.style.textShadow = '0 0 8px rgba(34,197,94,0.5)'
    const outLabel = new CSS2DObject(outDiv)
    outLabel.position.set(1.8, 0.7, 0)
    this.group.add(outLabel)

    // Hidden label
    const hDiv = document.createElement('div')
    hDiv.textContent = 'hₜ'
    hDiv.style.color = 'rgba(34,197,94,0.5)'
    hDiv.style.fontSize = '10px'
    hDiv.style.fontWeight = '600'
    hDiv.style.fontFamily = 'monospace'
    const hLabel = new CSS2DObject(hDiv)
    hLabel.position.set(0.8, -0.7, 0)
    this.group.add(hLabel)

    // Arrow helper: input → cell
    this._addArrow(new THREE.Vector3(-0.6, 0, 0), new THREE.Vector3(0, 0, 0), 0x22c55e)

    // Arrow helper: cell → output
    this._addArrow(new THREE.Vector3(1.6, 0, 0), new THREE.Vector3(2.2, 0, 0), 0x22c55e)
  }

  _addArrow(from, to, color) {
    const dir = new THREE.Vector3().copy(to).sub(from)
    const len = dir.length()
    dir.normalize()
    const arrow = new THREE.ArrowHelper(dir, from, len, color, 0.15, 0.1)
    arrow.line.material.transparent = true
    arrow.line.material.opacity = 0.4
    arrow.cone.material.transparent = true
    arrow.cone.material.opacity = 0.4
    this.group.add(arrow)
  }

  animateToken() {
    const geo = new THREE.SphereGeometry(0.06, 8, 8)
    const mat = new THREE.MeshPhysicalMaterial({
      color: 0x22c55e,
      emissive: 0x22c55e,
      emissiveIntensity: 0.5,
    })
    const token = new THREE.Mesh(geo, mat)
    token.position.set(-1.2, 0, 0)
    token.userData = { start: -1.2, end: 2.5, progress: 0 }
    this.group.add(token)
    this.tokens.push(token)
  }

  update(time) {
    // Pulse hidden state
    const pulse = 0.8 + Math.sin(time * 2) * 0.2
    this.hiddenState.scale.set(pulse, pulse, pulse)
    this.hiddenState.material.emissiveIntensity = 0.2 + Math.sin(time * 2) * 0.15

    // Animate tokens
    this.tokens = this.tokens.filter(t => {
      t.userData.progress += 0.012
      const p = t.userData.progress
      t.position.x = t.userData.start + (t.userData.end - t.userData.start) * p
      t.material.opacity = p < 0.1 ? p * 10 : p > 0.9 ? (1 - p) * 10 : 1
      t.material.transparent = true
      if (p >= 1) {
        this.group.remove(t)
        t.geometry.dispose()
        t.material.dispose()
        return false
      }
      return true
    })
  }
}
