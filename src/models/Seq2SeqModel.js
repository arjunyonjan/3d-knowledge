import * as THREE from 'three'
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'

export default class Seq2SeqModel {
  constructor() {
    this.group = new THREE.Group()
    this._build()
  }

  _build() {
    const cellW = 0.6, cellH = 0.4, depth = 0.6

    // Encoder tower (left)
    const encGroup = new THREE.Group()
    encGroup.position.set(-2.5, 0, 0)

    const encColor = 0xf97316
    for (let i = 0; i < 3; i++) {
      const cell = this._makeCell(cellW, cellH, depth, encColor, 'ENC', i)
      cell.position.y = i * 0.6 - 0.6
      encGroup.add(cell)
    }

    // Encoder label
    const encDiv = document.createElement('div')
    encDiv.textContent = 'ENCODER'
    encDiv.style.cssText = 'color:#f97316;font-size:10px;font-weight:700;letter-spacing:0.08em;font-family:system-ui;text-shadow:0 0 12px rgba(249,115,22,0.3);'
    const encLabel = new CSS2DObject(encDiv)
    encLabel.position.set(-2.5, 1.2, 0)
    this.group.add(encLabel)

    this.group.add(encGroup)

    // Context vector (glowing beam in center)
    const beamGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.2, 8)
    const beamMat = new THREE.MeshPhysicalMaterial({
      color: 0xf97316, emissive: 0xf97316,
      emissiveIntensity: 0.3, transparent: true, opacity: 0.6,
    })
    const beam = new THREE.Mesh(beamGeo, beamMat)
    beam.position.set(0, 0, 0)
    beam.rotation.z = Math.PI / 2
    this.group.add(beam)
    this.beam = beam

    // Context vector label
    const ctxDiv = document.createElement('div')
    ctxDiv.textContent = 'context vector'
    ctxDiv.style.cssText = 'color:#f97316;font-size:8px;font-weight:600;font-family:monospace;opacity:0.5;'
    const ctxLabel = new CSS2DObject(ctxDiv)
    ctxLabel.position.set(0, -0.8, 0)
    this.group.add(ctxLabel)

    // Decoder tower (right)
    const decGroup = new THREE.Group()
    decGroup.position.set(2.5, 0, 0)

    const decColor = 0xf97316
    for (let i = 0; i < 3; i++) {
      const cell = this._makeCell(cellW, cellH, depth, decColor, 'DEC', i)
      cell.position.y = i * 0.6 - 0.6
      decGroup.add(cell)
    }

    // Decoder label
    const decDiv = document.createElement('div')
    decDiv.textContent = 'DECODER'
    decDiv.style.cssText = 'color:#f97316;font-size:10px;font-weight:700;letter-spacing:0.08em;font-family:system-ui;text-shadow:0 0 12px rgba(249,115,22,0.3);'
    const decLabel = new CSS2DObject(decDiv)
    decLabel.position.set(2.5, 1.2, 0)
    this.group.add(decLabel)

    this.group.add(decGroup)

    // Arrow from encoder to context
    const arrow1 = new THREE.ArrowHelper(
      new THREE.Vector3(1, 0, 0), new THREE.Vector3(-1.2, 0, 0), 1.2, 0xf97316, 0.2, 0.15
    )
    arrow1.line.material.transparent = true
    arrow1.line.material.opacity = 0.3
    arrow1.cone.material.transparent = true
    arrow1.cone.material.opacity = 0.3
    this.group.add(arrow1)

    // Arrow from context to decoder
    const arrow2 = new THREE.ArrowHelper(
      new THREE.Vector3(1, 0, 0), new THREE.Vector3(0.6, 0, 0), 1.2, 0xf97316, 0.2, 0.15
    )
    arrow2.line.material.transparent = true
    arrow2.line.material.opacity = 0.3
    arrow2.cone.material.transparent = true
    arrow2.cone.material.opacity = 0.3
    this.group.add(arrow2)

    // Input/output labels
    const inDiv = document.createElement('div')
    inDiv.textContent = '⟨sentence⟩'
    inDiv.style.cssText = 'color:rgba(249,115,22,0.3);font-size:9px;font-family:monospace;'
    const inLabel = new CSS2DObject(inDiv)
    inLabel.position.set(-3.5, -0.6, 0)
    this.group.add(inLabel)

    const outDiv = document.createElement('div')
    outDiv.textContent = '⟨translation⟩'
    outDiv.style.cssText = 'color:rgba(249,115,22,0.3);font-size:9px;font-family:monospace;'
    const outLabel = new CSS2DObject(outDiv)
    outLabel.position.set(3.5, -0.6, 0)
    this.group.add(outLabel)
  }

  _makeCell(w, h, d, color, prefix, idx) {
    const g = new THREE.Group()

    const geo = new THREE.BoxGeometry(w, h, d)
    const mat = new THREE.MeshPhysicalMaterial({
      color: 0x111827, transparent: true, opacity: 0.7,
      roughness: 0.3, metalness: 0.1,
    })
    g.add(new THREE.Mesh(geo, mat))

    const edges = new THREE.EdgesGeometry(geo)
    const edgeMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.3 })
    g.add(new THREE.LineSegments(edges, edgeMat))

    return g
  }

  update(time) {
    this.beam.material.emissiveIntensity = 0.2 + Math.sin(time * 1.2) * 0.15
    this.beam.scale.x = 1 + Math.sin(time * 0.8) * 0.05
  }
}
