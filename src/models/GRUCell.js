import * as THREE from 'three'
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'

export default class GRUCell {
  constructor() {
    this.group = new THREE.Group()
    this._build()
  }

  _build() {
    // Cell body
    const boxGeo = new THREE.BoxGeometry(1.8, 1.0, 1.0)
    const boxMat = new THREE.MeshPhysicalMaterial({
      color: 0x111827, transparent: true, opacity: 0.7,
      roughness: 0.3, metalness: 0.1, side: THREE.DoubleSide,
    })
    const body = new THREE.Mesh(boxGeo, boxMat)
    body.position.x = 0.9
    this.group.add(body)

    // Wireframe
    const edges = new THREE.EdgesGeometry(boxGeo)
    const edgeMat = new THREE.LineBasicMaterial({ color: 0x14b8a6, transparent: true, opacity: 0.25 })
    const wire = new THREE.LineSegments(edges, edgeMat)
    wire.position.copy(body.position)
    this.group.add(wire)

    // Hidden state sphere
    const hGeo = new THREE.SphereGeometry(0.18, 12, 12)
    const hMat = new THREE.MeshPhysicalMaterial({
      color: 0x14b8a6, emissive: 0x14b8a6,
      emissiveIntensity: 0.3, transparent: true, opacity: 0.9,
    })
    this.hiddenState = new THREE.Mesh(hGeo, hMat)
    this.hiddenState.position.set(0.9, 0, 0)
    this.group.add(this.hiddenState)

    // Gate labels (only 2 for GRU)
    const gates = ['Update', 'Reset']
    const colors = ['#f59e0b', '#ef4444']
    const xPositions = [0.5, 1.3]

    gates.forEach((name, i) => {
      const gateDiv = document.createElement('div')
      gateDiv.textContent = name
      gateDiv.style.cssText = `color:${colors[i]};font-size:8px;font-weight:600;font-family:monospace;text-shadow:0 0 4px ${colors[i]}40;`
      const gateLabel = new CSS2DObject(gateDiv)
      gateLabel.position.set(xPositions[i], -0.6, 0)
      this.group.add(gateLabel)

      // Gate dot
      const dotGeo = new THREE.SphereGeometry(0.04, 8, 8)
      const dotMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(colors[i]),
        emissive: new THREE.Color(colors[i]),
        emissiveIntensity: 0.4,
      })
      const dot = new THREE.Mesh(dotGeo, dotMat)
      dot.position.set(xPositions[i], -0.35, 0)
      this.group.add(dot)
    })

    // x_t label
    const xDiv = document.createElement('div')
    xDiv.textContent = 'xₜ'
    xDiv.style.cssText = 'color:#14b8a6;font-size:11px;font-weight:600;font-family:monospace;text-shadow:0 0 8px rgba(20,184,166,0.5);'
    const xLabel = new CSS2DObject(xDiv)
    xLabel.position.set(-0.2, 0.6, 0)
    this.group.add(xLabel)

    // h_t label
    const hDiv = document.createElement('div')
    hDiv.textContent = 'hₜ'
    hDiv.style.cssText = 'color:rgba(20,184,166,0.4);font-size:9px;font-weight:600;font-family:monospace;'
    const hLabel = new CSS2DObject(hDiv)
    hLabel.position.set(0.9, -0.6, 0)
    this.group.add(hLabel)
  }

  update(time) {
    const pulse = 0.8 + Math.sin(time * 2.5) * 0.2
    this.hiddenState.scale.set(pulse, pulse, pulse)
    this.hiddenState.material.emissiveIntensity = 0.2 + Math.sin(time * 2.5) * 0.15

    this.group.children.forEach(child => {
      if (child.type === 'Mesh' && child.material && child.material.emissiveIntensity !== undefined && child.geometry.type === 'SphereGeometry' && child.geometry.parameters.radius === 0.04) {
        const idx = this.group.children.indexOf(child)
        const phase = idx * 0.8
        child.material.emissiveIntensity = 0.2 + Math.sin(time * 3 + phase) * 0.3
      }
    })
  }
}
