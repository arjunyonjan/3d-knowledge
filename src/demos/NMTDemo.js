import * as THREE from 'three'
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'

export default class NMTDemo {
  constructor() {
    this.group = new THREE.Group()
    this._build()
  }

  _build() {
    // Source sentence
    const srcWords = ['I', 'love', 'machine', 'learning']
    srcWords.forEach((w, i) => {
      const div = document.createElement('div')
      div.textContent = w
      div.style.cssText = 'color:#22c55e;font-size:11px;font-weight:600;font-family:monospace;background:rgba(34,197,94,0.08);padding:3px 8px;border-radius:6px;border:1px solid rgba(34,197,94,0.15);'
      const label = new CSS2DObject(div)
      label.position.set(i * 0.8 - 1.6, 1.8, 0)
      this.group.add(label)
    })

    // Source label
    const srcDiv = document.createElement('div')
    srcDiv.textContent = 'SOURCE (English)'
    srcDiv.style.cssText = 'color:rgba(34,197,94,0.4);font-size:8px;font-weight:600;font-family:system-ui;letter-spacing:0.06em;'
    const srcLabel = new CSS2DObject(srcDiv)
    srcLabel.position.set(-1.6, 2.3, 0)
    this.group.add(srcLabel)

    // Encoder→Decoder arrows in center
    for (let i = 0; i < 4; i++) {
      const arrow = new THREE.ArrowHelper(
        new THREE.Vector3(0, -1, 0), new THREE.Vector3(i * 0.8 - 1.6, 1.2, 0), 0.6, 0x22c55e, 0.1, 0.08
      )
      arrow.line.material.transparent = true
      arrow.line.material.opacity = 0.2
      arrow.cone.material.transparent = true
      arrow.cone.material.opacity = 0.2
      this.group.add(arrow)
    }

    // Target sentence
    const tgtWords = ["J'", 'adore', "l'apprentissage", 'automatique']
    tgtWords.forEach((w, i) => {
      const div = document.createElement('div')
      div.textContent = w
      div.style.cssText = 'color:#f59e0b;font-size:11px;font-weight:600;font-family:monospace;background:rgba(245,158,11,0.08);padding:3px 8px;border-radius:6px;border:1px solid rgba(245,158,11,0.15);'
      const label = new CSS2DObject(div)
      label.position.set(i * 1.0 - 1.8, -1.2, 0)
      this.group.add(label)
    })

    // Target label
    const tgtDiv = document.createElement('div')
    tgtDiv.textContent = 'TARGET (French)'
    tgtDiv.style.cssText = 'color:rgba(245,158,11,0.4);font-size:8px;font-weight:600;font-family:system-ui;letter-spacing:0.06em;'
    const tgtLabel = new CSS2DObject(tgtDiv)
    tgtLabel.position.set(-1.8, -1.7, 0)
    this.group.add(tgtLabel)

    // BLEU badge
    const bleuDiv = document.createElement('div')
    bleuDiv.textContent = 'BLEU: 0.89'
    bleuDiv.style.cssText = 'color:#00ffaa;font-size:10px;font-weight:700;font-family:monospace;padding:4px 12px;border-radius:8px;background:rgba(0,255,170,0.08);border:1px solid rgba(0,255,170,0.2);'
    const bleuLabel = new CSS2DObject(bleuDiv)
    bleuLabel.position.set(0, -2.4, 0)
    this.group.add(bleuLabel)

    // Method badges
    const methods = ['Bahdanau Attention', 'Beam Search (k=3)', 'Teacher Forcing']
    methods.forEach((m, i) => {
      const div = document.createElement('div')
      div.textContent = m
      div.style.cssText = 'color:rgba(0,255,170,0.4);font-size:8px;font-family:monospace;padding:2px 6px;border-radius:4px;background:rgba(0,255,170,0.04);border:1px solid rgba(0,255,170,0.06);'
      const label = new CSS2DObject(div)
      label.position.set(i * 1.5 - 1.5, -3.0, 0)
      this.group.add(label)
    })

    // Title
    const titleDiv = document.createElement('div')
    titleDiv.textContent = 'Task 1 — Neural Machine Translation'
    titleDiv.style.cssText = 'color:#00ffaa;font-size:13px;font-weight:700;font-family:system-ui;letter-spacing:0.04em;text-shadow:0 0 16px rgba(0,255,170,0.2);'
    const titleLabel = new CSS2DObject(titleDiv)
    titleLabel.position.set(0, 3.0, 0)
    this.group.add(titleLabel)
  }
}
