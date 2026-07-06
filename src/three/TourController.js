import * as THREE from 'three'

export default class TourController {
  constructor(sceneManager, treeManager, onStepChange) {
    this.sm = sceneManager
    this.tm = treeManager
    this.onStepChange = onStepChange
    this.active = false
    this.step = 0
    this.timer = 0
    this.delay = 12.0
    this.flyTarget = new THREE.Vector3()
    this.flyOffset = new THREE.Vector3(8, 5, 14)
    this.lerpFactor = 0.035
  }

  setSpeed(speed) {
    const delays = { fast: 6, mid: 12, slow: 15 }
    this.delay = delays[speed] || 12
    const lerps = { fast: 0.055, mid: 0.035, slow: 0.02 }
    this.lerpFactor = lerps[speed] || 0.035
  }

  start() {
    this.active = true
    this.step = 0
    this.timer = 0
    this.sm.controls.autoRotate = false
    this._go(0)
  }

  _go(idx) {
    if (idx < 0 || idx >= this.tm.cards.length) return
    this.step = idx
    this.timer = 0
    this.tm.deselectAll()
    this.tm.cards[idx].setExpanded(true)
    this.tm.cards.forEach((c, i) => { if (i !== idx) c.setDimmed(true) })
    if (this.onStepChange) this.onStepChange(idx)
  }

  next() { if (this.active && this.step < this.tm.cards.length - 1) { this._go(this.step + 1); this.timer = 0 } }
  prev() { if (this.active && this.step > 0) { this._go(this.step - 1); this.timer = 0 } }

  getProgress() {
    return { elapsed: this.timer, delay: this.delay, ratio: Math.min(this.timer / this.delay, 1) }
  }

  update(dt) {
    if (!this.active) return
    const pos = this.tm.positions[this.step]
    if (!pos) return
    this.flyTarget.copy(pos).add(this.flyOffset)
    this.sm.camera.position.lerp(this.flyTarget, this.lerpFactor)
    this.sm.controls.target.lerp(pos, this.lerpFactor + 0.005)
    this.timer += dt
    if (this.timer >= this.delay && this.step < this.tm.cards.length - 1) {
      if (this.speechAdvance) { this.timer = 0; return }
      this._go(this.step + 1)
    }
  }
}
