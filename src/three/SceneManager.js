import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export default class SceneManager {
  constructor(container) {
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x030712)

    this.camera = new THREE.PerspectiveCamera(30, container.clientWidth / container.clientHeight, 0.1, 100)
    this.camera.position.set(8, 3, 16)

    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setSize(container.clientWidth, container.clientHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    container.appendChild(this.renderer.domElement)

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.08
    this.controls.minDistance = 4
    this.controls.maxDistance = 20
    this.controls.target.set(0, 2.5, 0)
    this.controls.autoRotate = true
    this.controls.autoRotateSpeed = 0.4

    this._addLights()
    this._addStars()
    this._addParticles()

    this.animTime = 0
    this.running = true
  }

  _addLights() {
    this.scene.add(new THREE.AmbientLight(0x404060, 0.4))
    const dl = new THREE.DirectionalLight(0xffffff, 1.0); dl.position.set(5, 10, 7); this.scene.add(dl)
    const fl = new THREE.DirectionalLight(0x00ffaa, 0.3); fl.position.set(-5, 0, 5); this.scene.add(fl)
  }

  _addStars() {
    const geo = new THREE.BufferGeometry()
    const pos = new Float32Array(800 * 3)
    for (let i = 0; i < 800 * 3; i++) pos[i] = (Math.random() - 0.5) * 120
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    this.stars = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0x00ffaa, size: 0.025 }))
    this.scene.add(this.stars)
  }

  _addParticles() {
    this.pCount = 200
    const geo = new THREE.BufferGeometry()
    const pos = new Float32Array(this.pCount * 3)
    this.pDat = []
    for (let i = 0; i < this.pCount; i++) {
      const ph = Math.random() * Math.PI * 2, sp = 0.12 + Math.random() * 0.2, r = 2 + Math.random() * 5, h = -2 + Math.random() * 7
      this.pDat.push({ ph, sp, r, h })
      pos[i*3] = Math.cos(ph) * r; pos[i*3+1] = h; pos[i*3+2] = Math.sin(ph) * r
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    this.particles = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0x00ffaa, size: 0.03, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false }))
    this.scene.add(this.particles)
  }

  update() {
    this.animTime += 0.016
    this.controls.update()
    this.stars.rotation.y += 0.0001

    const pa = this.particles.geometry.attributes.position
    for (let i = 0; i < this.pCount; i++) {
      const a = this.pDat[i].ph + this.animTime * this.pDat[i].sp
      pa.array[i*3] = Math.cos(a) * this.pDat[i].r
      pa.array[i*3+2] = Math.sin(a) * this.pDat[i].r
    }
    pa.needsUpdate = true
  }

  render() {
    this.renderer.render(this.scene, this.camera)
  }

  resize(w, h) {
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(w, h)
  }

  destroy() {
    this.running = false
  }
}
