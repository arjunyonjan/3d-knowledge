import * as THREE from 'three'
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'

export default class CompareModel {
  constructor() {
    this.group = new THREE.Group()
    this._build()
  }

  _build() {
    // LSTM side (purple)
    const lstmGroup = this._makeModel(2.0, 1.2, 0xa855f7, ['Forget', 'Input', 'Cell', 'Output'])
    lstmGroup.position.set(-2.5, 0, 0)
    this.group.add(lstmGroup)

    // GRU side (teal)
    const gruGroup = this._makeModel(1.8, 1.0, 0x14b8a6, ['Update', 'Reset'])
    gruGroup.position.set(2.5, 0, 0)
    this.group.add(gruGroup)

    // VS label
    const vsDiv = document.createElement('div')
    vsDiv.textContent = 'VS'
    vsDiv.style.cssText = 'color:rgba(255,255,255,0.15);font-size:20px;font-weight:900;font-family:system-ui;letter-spacing:0.1em;'
    const vsLabel = new CSS2DObject(vsDiv)
    vsLabel.position.set(0, 0.8, 0)
    this.group.add(vsLabel)

    // LSTM label
    const lDiv = document.createElement('div')
    lDiv.textContent = 'LSTM — 3 gates + cell state'
    lDiv.style.cssText = 'color:#a855f7;font-size:10px;font-weight:600;font-family:system-ui;text-shadow:0 0 12px rgba(168,85,247,0.3);'
    const lLabel = new CSS2DObject(lDiv)
    lLabel.position.set(-2.5, -1.2, 0)
    this.group.add(lLabel)

    // GRU label
    const gDiv = document.createElement('div')
    gDiv.textContent = 'GRU — 2 gates, fewer params'
    gDiv.style.cssText = 'color:#14b8a6;font-size:10px;font-weight:600;font-family:system-ui;text-shadow:0 0 12px rgba(20,184,166,0.3);'
    const gLabel = new CSS2DObject(gDiv)
    gLabel.position.set(2.5, -1.2, 0)
    this.group.add(gLabel)

    // Faster badge
    const fDiv = document.createElement('div')
    fDiv.textContent = '⚡ Faster'
    fDiv.style.cssText = 'color:#14b8a6;font-size:9px;padding:2px 8px;border-radius:6px;background:rgba(20,184,166,0.1);border:1px solid rgba(20,184,166,0.2);font-family:system-ui;'
    const fLabel = new CSS2DObject(fDiv)
    fLabel.position.set(3.5, 0.3, 0)
    this.group.add(fLabel)

    // Memory badge
    const mDiv = document.createElement('div')
    mDiv.textContent = '🧠 More memory'
    mDiv.style.cssText = 'color:#a855f7;font-size:9px;padding:2px 8px;border-radius:6px;background:rgba(168,85,247,0.1);border:1px solid rgba(168,85,247,0.2);font-family:system-ui;'
    const mLabel = new CSS2DObject(mDiv)
    mLabel.position.set(-3.5, 0.3, 0)
    this.group.add(mLabel)
  }

  _makeModel(w, h, color, gates) {
    const g = new THREE.Group()

    // Body
    const boxGeo = new THREE.BoxGeometry(w, h, 0.8)
    const boxMat = new THREE.MeshPhysicalMaterial({
      color: 0x111827, transparent: true, opacity: 0.7,
      roughness: 0.3, metalness: 0.1, side: THREE.DoubleSide,
    })
    const body = new THREE.Mesh(boxGeo, boxMat)
    body.position.x = w / 2
    g.add(body)

    // Wireframe
    const edges = new THREE.EdgesGeometry(boxGeo)
    const edgeMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.25 })
    const wire = new THREE.LineSegments(edges, edgeMat)
    wire.position.copy(body.position)
    g.add(wire)

    // Hidden state
    const hGeo = new THREE.SphereGeometry(0.15, 12, 12)
    const hMat = new THREE.MeshPhysicalMaterial({
      color, emissive: color, emissiveIntensity: 0.3, transparent: true, opacity: 0.9,
    })
    const hs = new THREE.Mesh(hGeo, hMat)
    hs.position.set(w / 2, 0, 0)
    g.add(hs)
    g.userData.hiddenState = hs

    // Gate labels
    const xPositions = gates.map((_, i) => (i + 0.5) * (w / gates.length))
    gates.forEach((name, i) => {
      const div = document.createElement('div')
      div.textContent = name
      div.style.cssText = `color:${new THREE.Color(color).getStyle()};font-size:7px;font-weight:600;font-family:monospace;`
      const label = new CSS2DObject(div)
      label.position.set(xPositions[i], -h / 2 - 0.3, 0)
      g.add(label)

      const dotGeo = new THREE.SphereGeometry(0.03, 6, 6)
      const dotMat = new THREE.MeshPhysicalMaterial({ color, emissive: color, emissiveIntensity: 0.3 })
      const dot = new THREE.Mesh(dotGeo, dotMat)
      dot.position.set(xPositions[i], -h / 2 + 0.15, 0)
      g.add(dot)
    })

    return g
  }

  update(time) {
    this.group.children.forEach(child => {
      if (child.userData && child.userData.hiddenState) {
        const pulse = 0.8 + Math.sin(time * 2 + (child.position.x > 0 ? 0.5 : 0)) * 0.2
        child.userData.hiddenState.scale.set(pulse, pulse, pulse)
      }
    })
  }
}
