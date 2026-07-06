import * as THREE from 'three'
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'

export default class SequenceFundamentals {
  constructor() {
    this.group = new THREE.Group()
    this.tokens = []
    this._build()
  }

  _build() {
    const words = ['The', 'cat', 'sat', 'on', 'the', 'mat']
    const colors = ['#3b82f6', '#60a5fa', '#93c5fd', '#3b82f6', '#60a5fa', '#93c5fd']

    words.forEach((w, i) => {
      // Token block
      const geo = new THREE.BoxGeometry(0.5, 0.3, 0.3)
      const mat = new THREE.MeshPhysicalMaterial({
        color: 0x111827,
        transparent: true, opacity: 0.8,
        emissive: new THREE.Color(colors[i]),
        emissiveIntensity: 0.1,
      })
      const block = new THREE.Mesh(geo, mat)
      block.position.set(i * 0.7 - 1.8, 0, 0)
      block.userData = { idx: i }
      this.group.add(block)

      // Wireframe
      const edges = new THREE.EdgesGeometry(geo)
      const edgeMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(colors[i]),
        transparent: true, opacity: 0.3,
      })
      const wire = new THREE.LineSegments(edges, edgeMat)
      wire.position.copy(block.position)
      this.group.add(wire)

      // Token label
      const div = document.createElement('div')
      div.textContent = w
      div.style.cssText = `color:${colors[i]};font-size:9px;font-weight:600;font-family:monospace;text-shadow:0 0 8px ${colors[i]}40;`
      const label = new CSS2DObject(div)
      label.position.set(i * 0.7 - 1.8, -0.4, 0)
      this.group.add(label)

      // Step number
      const sDiv = document.createElement('div')
      sDiv.textContent = `t=${i + 1}`
      sDiv.style.cssText = 'color:rgba(255,255,255,0.2);font-size:7px;font-family:monospace;'
      const sLabel = new CSS2DObject(sDiv)
      sLabel.position.set(i * 0.7 - 1.8, 0.35, 0)
      this.group.add(sLabel)
    })

    // Title
    const titleDiv = document.createElement('div')
    titleDiv.textContent = 'Tokenized Sequence'
    titleDiv.style.cssText = 'color:#3b82f6;font-size:11px;font-weight:700;font-family:system-ui;letter-spacing:0.06em;text-shadow:0 0 12px rgba(59,130,246,0.3);'
    const titleLabel = new CSS2DObject(titleDiv)
    titleLabel.position.set(0, 0.8, 0)
    this.group.add(titleLabel)
  }

  update(time) {
    this.group.children.forEach(child => {
      if (child.type === 'Mesh' && child.material && child.material.emissiveIntensity !== undefined) {
        const idx = child.userData.idx || 0
        const phase = idx * 0.4
        child.material.emissiveIntensity = 0.05 + Math.sin(time * 1.5 + phase) * 0.15 + 0.1
      }
    })
  }
}
