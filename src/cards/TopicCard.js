import * as THREE from 'three'
import { COLORS, CARD_COLORS } from '../theme.js'

export default class TopicCard {
  constructor(topic, index, total, position) {
    this.topic = topic
    this.index = index
    this.expanded = false
    this.entered = false
    this.enterProgress = 0
    this.startDelay = index * 0.12
    this.startTimer = 0
    this.group = new THREE.Group()
    this.time = 0

    this.targetPos = position
    this.group.position.set(0, 0, 0)

    this._createGlow()
    this._createCard()
    this._createEdges()
    this._createTextLabel()
    this._createStepNumber()
  }

  _createGlow() {
    const color = CARD_COLORS[this.index] || COLORS.primary
    const geo = new THREE.PlaneGeometry(2.6, 2.0)
    const mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    this.glow = new THREE.Mesh(geo, mat)
    this.glow.position.z = -0.05
    this.group.add(this.glow)
  }

  _createCard() {
    const color = CARD_COLORS[this.index] || COLORS.primary
    const w = 2.0, h = 1.4
    const geo = new THREE.PlaneGeometry(w, h)
    const mat = new THREE.MeshBasicMaterial({
      color: 0x0a0e1a,
      transparent: true,
      opacity: 0.92,
      side: THREE.DoubleSide,
    })
    this.card = new THREE.Mesh(geo, mat)
    this.group.add(this.card)

    const innerGeo = new THREE.PlaneGeometry(w - 0.08, h - 0.08)
    const innerMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.04,
      side: THREE.DoubleSide,
    })
    const inner = new THREE.Mesh(innerGeo, innerMat)
    inner.position.z = 0.01
    this.group.add(inner)
  }

  _createEdges() {
    const color = CARD_COLORS[this.index] || COLORS.primary
    const w = 2.0, h = 1.4
    const geo = new THREE.EdgesGeometry(new THREE.PlaneGeometry(w, h))
    this.edgeMat = new THREE.LineBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.25,
    })
    this.edges = new THREE.LineSegments(geo, this.edgeMat)
    this.edges.position.z = 0.01
    this.group.add(this.edges)
  }

  _createTextLabel() {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 200
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = 'rgba(3,7,18,0.7)'
    ctx.fillRect(0, 0, 1024, 200)
    ctx.fillStyle = '#f3f4f6'
    ctx.font = '700 36px monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.shadowColor = 'rgba(0,0,0,0.9)'
    ctx.shadowBlur = 16
    ctx.fillText(this.topic.title, 512, 60)

    ctx.font = '18px monospace'
    ctx.fillStyle = '#d1d5db'
    ctx.shadowBlur = 8
    const exp = this.topic.explanation.length > 80 ? this.topic.explanation.slice(0, 77) + '...' : this.topic.explanation
    ctx.fillText(exp, 512, 120)

    const tex = new THREE.CanvasTexture(canvas)
    tex.needsUpdate = true
    const mat = new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true, opacity: 0.9 })
    this.label = new THREE.Sprite(mat)
    this.label.scale.set(3.0, 0.6, 1)
    this.label.position.set(0, -0.5, 0.2)
    this.group.add(this.label)
  }

  _createStepNumber() {
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64
    const ctx = canvas.getContext('2d')
    const color = CARD_COLORS[this.index] || COLORS.primary
    ctx.fillStyle = color
    ctx.font = '700 28px monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.shadowColor = color
    ctx.shadowBlur = 12
    ctx.fillText(String(this.index + 1).padStart(2, '0'), 32, 34)

    const tex = new THREE.CanvasTexture(canvas)
    tex.needsUpdate = true
    const mat = new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending })
    this.stepNum = new THREE.Sprite(mat)
    this.stepNum.scale.set(0.35, 0.35, 1)
    this.stepNum.position.set(0.9, 0.55, 0.1)
    this.group.add(this.stepNum)
  }

  setHover(hovered) {
    const color = CARD_COLORS[this.index] || COLORS.primary
    this.card.material.color.set(hovered ? color : 0x0a0e1a)
    const s = hovered ? 1.08 : 1
    this.group.scale.lerp(new THREE.Vector3(s, s, s), 0.15)
  }

  setExpanded(expanded) {
    this.expanded = expanded
    const color = CARD_COLORS[this.index] || COLORS.primary
    this.card.material.color.set(expanded ? color : 0x0a0e1a)
  }

  update() {
    this.time += 0.016
    if (this.startTimer < this.startDelay) {
      this.startTimer += 0.016
      return
    }
    if (!this.entered) {
      this.enterProgress = Math.min(this.enterProgress + 0.025, 1)
      const ease = 1 - Math.pow(1 - this.enterProgress, 3)
      this.group.position.copy(this.targetPos.clone().multiplyScalar(ease))
      if (this.enterProgress >= 1) this.entered = true
    }

    const pulse = 0.5 + Math.sin(this.time * 2) * 0.5
    if (this.expanded) {
      this.glow.material.opacity = 0.15 + pulse * 0.15
      this.edgeMat.opacity = 0.5 + pulse * 0.3
    } else {
      this.glow.material.opacity = 0
      this.edgeMat.opacity = 0.25
    }
  }
}
