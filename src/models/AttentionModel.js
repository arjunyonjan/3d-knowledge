import * as THREE from 'three'
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'

export default class AttentionModel {
  constructor() {
    this.group = new THREE.Group()
    this.cubes = []
    this._build()
  }

  _build() {
    const rows = 5, cols = 6
    const spacing = 0.3
    const startX = -(cols - 1) * spacing / 2
    const startY = -(rows - 1) * spacing / 2
    const colors = [0xef4444, 0xf97316, 0xf59e0b, 0x22c55e, 0x3b82f6, 0xa855f7]

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const geo = new THREE.BoxGeometry(0.1, 0.1, 0.1)
        const intensity = Math.random() * 0.5 + 0.1
        const mat = new THREE.MeshPhysicalMaterial({
          color: colors[c % colors.length],
          emissive: colors[c % colors.length],
          emissiveIntensity: intensity,
          transparent: true,
          opacity: 0.4 + intensity * 0.6,
        })
        const cube = new THREE.Mesh(geo, mat)
        cube.position.set(startX + c * spacing, startY + r * spacing, 0)
        cube.userData = {
          row: r, col: c,
          baseIntensity: intensity,
          phase: Math.random() * Math.PI * 2,
        }
        this.group.add(cube)
        this.cubes.push(cube)
      }
    }

    // Source labels (bottom)
    const sources = ['I', 'love', 'ML']
    sources.forEach((s, i) => {
      const div = document.createElement('div')
      div.textContent = s
      div.style.cssText = 'color:#ef4444;font-size:9px;font-weight:600;font-family:monospace;opacity:0.6;'
      const label = new CSS2DObject(div)
      label.position.set(startX + (i + 1.5) * spacing, -1.0, 0)
      this.group.add(label)
    })

    // Target labels (left)
    const targets = ['Je', 'adore', 'le', 'ML']
    targets.forEach((t, i) => {
      const div = document.createElement('div')
      div.textContent = t
      div.style.cssText = 'color:#f59e0b;font-size:9px;font-weight:600;font-family:monospace;opacity:0.6;'
      const label = new CSS2DObject(div)
      label.position.set(-1.8, startY + (i + 1) * spacing, 0)
      this.group.add(label)
    })

    // Title
    const titleDiv = document.createElement('div')
    titleDiv.textContent = 'Attention Weights'
    titleDiv.style.cssText = 'color:#ef4444;font-size:11px;font-weight:700;font-family:system-ui;letter-spacing:0.06em;text-shadow:0 0 12px rgba(239,68,68,0.3);'
    const titleLabel = new CSS2DObject(titleDiv)
    titleLabel.position.set(0, 1.2, 0)
    this.group.add(titleLabel)

    // Row/col explanation
    const noteDiv = document.createElement('div')
    noteDiv.textContent = 'source → target alignment'
    noteDiv.style.cssText = 'color:rgba(239,68,68,0.3);font-size:8px;font-family:monospace;'
    const noteLabel = new CSS2DObject(noteDiv)
    noteLabel.position.set(0, -1.5, 0)
    this.group.add(noteLabel)

    // Animate row indicator — current decoding step
    this.currentRow = 0
    this.rowTimer = 0
  }

  update(time) {
    this.rowTimer += 0.008
    if (this.rowTimer > 1) {
      this.rowTimer = 0
      this.currentRow = (this.currentRow + 1) % 5
    }

    this.cubes.forEach(cube => {
      const u = cube.userData
      const rowActive = u.row === this.currentRow
      const rowGlow = 1 - Math.abs(this.rowTimer - 0.5) * 2 // 0→1→0 wave

      if (rowActive) {
        const intensity = u.baseIntensity + rowGlow * 0.5
        cube.material.emissiveIntensity = intensity
        cube.material.opacity = 0.6 + rowGlow * 0.4
        cube.scale.set(1 + rowGlow * 0.5, 1 + rowGlow * 0.5, 1 + rowGlow * 0.5)
      } else {
        cube.material.emissiveIntensity = u.baseIntensity * 0.3
        cube.material.opacity = 0.2
        cube.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1)
      }
    })
  }
}
