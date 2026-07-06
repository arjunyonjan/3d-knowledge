import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import TopicCard from './cards/TopicCard.js'
import { TOPICS } from './theme.js'

const scene = new THREE.Scene()
scene.background = new THREE.Color(0x030712)

const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 100)
camera.position.set(8, 3, 16)

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.outputColorSpace = THREE.SRGBColorSpace
document.getElementById('app').appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.dampingFactor = 0.08
controls.minDistance = 4
controls.maxDistance = 20
controls.target.set(0, 2.5, 0)
controls.autoRotate = true
controls.autoRotateSpeed = 0.4

const ambient = new THREE.AmbientLight(0x404060, 0.4)
scene.add(ambient)
const dirLight = new THREE.DirectionalLight(0xffffff, 1.0)
dirLight.position.set(5, 10, 7)
scene.add(dirLight)
const fillLight = new THREE.DirectionalLight(0x00ffaa, 0.3)
fillLight.position.set(-5, 0, 5)
scene.add(fillLight)

// Stars
const starsGeo = new THREE.BufferGeometry()
const starPos = new Float32Array(800 * 3)
for (let i = 0; i < 800 * 3; i++) starPos[i] = (Math.random() - 0.5) * 120
starsGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
const stars = new THREE.Points(starsGeo, new THREE.PointsMaterial({ color: 0x00ffaa, size: 0.025 }))
scene.add(stars)

// Tree positions (wider spread, no overlap)
const treePositions = [
  new THREE.Vector3(0, -5, 0),
  new THREE.Vector3(0, -2.5, 0),
  new THREE.Vector3(-3, 0, 0),
  new THREE.Vector3(-4.5, 2.5, 0),
  new THREE.Vector3(-2, 5, 0.8),
  new THREE.Vector3(0.5, 7.5, 1.5),
  new THREE.Vector3(-6.5, 3, 0),
  new THREE.Vector3(2.5, 10, 2.5),
  new THREE.Vector3(3.5, 0, 1.5),
]

// Cards
const cards = TOPICS.map((t, i) => {
  const pos = treePositions[i]
  const card = new TopicCard(t, i, TOPICS.length, pos)
  scene.add(card.group)
  return card
})

// Tree connecting edges
const treeEdges = [[0,1],[1,2],[1,8],[2,3],[3,4],[3,6],[4,5],[5,7]]
const edgeMat = new THREE.LineBasicMaterial({ color: 0x00ffaa, transparent: true, opacity: 0.2 })
treeEdges.forEach(([a, b]) => {
  const p1 = treePositions[a], p2 = treePositions[b]
  const mid = p1.clone().add(p2).multiplyScalar(0.5).add(new THREE.Vector3(0, 0.3, 0))
  const pts = new THREE.QuadraticBezierCurve3(p1, mid, p2).getPoints(16)
  scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), edgeMat))
})

// 0 marker (floor ring under first card)
const zeroMat = new THREE.MeshBasicMaterial({ color: 0x00ffaa, transparent: true, opacity: 0.12, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })
const zeroRing = new THREE.Mesh(new THREE.RingGeometry(0.5, 1.0, 32), zeroMat)
zeroRing.rotation.x = -Math.PI / 2
zeroRing.position.set(0, -5.3, 0)
scene.add(zeroRing)

// Hero marker (pulsing rings around last card)
const heroMat1 = new THREE.MeshBasicMaterial({ color: 0x00ffaa, transparent: true, opacity: 0.15, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })
const heroRing1 = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.9, 32), heroMat1)
heroRing1.rotation.x = -Math.PI / 2
heroRing1.position.copy(treePositions[7]).add(new THREE.Vector3(0, -0.4, 0))
scene.add(heroRing1)
const heroMat2 = new THREE.MeshBasicMaterial({ color: 0x00ffaa, transparent: true, opacity: 0.08, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })
const heroRing2 = new THREE.Mesh(new THREE.RingGeometry(0.8, 1.3, 32), heroMat2)
heroRing2.rotation.x = -Math.PI / 2
heroRing2.position.copy(treePositions[7]).add(new THREE.Vector3(0, -0.4, 0))
scene.add(heroRing2)

// Orbital particles
const pCount = 200
const pGeo = new THREE.BufferGeometry()
const pPos = new Float32Array(pCount * 3)
const pDat = []
for (let i = 0; i < pCount; i++) {
  const ph = Math.random() * Math.PI * 2, sp = 0.12 + Math.random() * 0.2, r = 2 + Math.random() * 5, h = -2 + Math.random() * 7
  pDat.push({ ph, sp, r, h })
  pPos[i*3] = Math.cos(ph) * r
  pPos[i*3+1] = h
  pPos[i*3+2] = Math.sin(ph) * r
}
pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3))
const pMat = new THREE.PointsMaterial({ color: 0x00ffaa, size: 0.03, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false })
const particles = new THREE.Points(pGeo, pMat)
scene.add(particles)

// Code panel
const codePanel = document.getElementById('code-panel')
const codeTitle = document.getElementById('code-title')
const codeContent = document.getElementById('code-content')

function showCode(idx) {
  const t = TOPICS[idx]
  codeTitle.textContent = `STEP ${idx + 1}  ·  ${t.title.toUpperCase()}`
  codeContent.textContent = t.code || ''
  codePanel.classList.add('visible')
}

function hideCode() {
  codePanel.classList.remove('visible')
}

// Raycaster
const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()
let hovered = null

renderer.domElement.addEventListener('pointermove', (e) => {
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1
})

function deselectAll() {
  cards.forEach(c => c.setExpanded(false))
  hideCode()
}

renderer.domElement.addEventListener('click', () => {
  if (hovered !== null) {
    if (cards[hovered].expanded) { deselectAll(); return }
    deselectAll()
    cards[hovered].setExpanded(true)
    showCode(hovered)
  } else {
    deselectAll()
  }
})

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') deselectAll()
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { nextStep(); e.preventDefault() }
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { prevStep(); e.preventDefault() }
})

// Tour system
let tourActive = false
let tourStep = 0
let tourTimer = 0
const TOUR_DELAY = 3.0
const startBtn = document.getElementById('start-btn')

function startTour() {
  tourActive = true
  tourStep = 0
  tourTimer = 0
  startBtn.classList.add('hidden')
  controls.autoRotate = false
  goToStep(0)
}

function goToStep(idx) {
  if (idx < 0 || idx >= cards.length) return
  tourStep = idx
  tourTimer = 0
  deselectAll()
  cards[idx].setExpanded(true)
  showCode(idx)
}

function nextStep() {
  if (!tourActive) return
  if (tourStep < cards.length - 1) goToStep(tourStep + 1)
}
function prevStep() {
  if (!tourActive) return
  if (tourStep > 0) goToStep(tourStep - 1)
}

startBtn.addEventListener('click', startTour)

// Camera fly target for tour
const flyTarget = new THREE.Vector3()
const flyOffset = new THREE.Vector3(4, 2, 6)

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

let animTime = 0

function animate() {
  animTime += 0.016
  requestAnimationFrame(animate)
  controls.update()
  stars.rotation.y += 0.0001

  // Animate orbital particles
  const pa = particles.geometry.attributes.position
  for (let i = 0; i < pCount; i++) {
    const a = pDat[i].ph + animTime * pDat[i].sp
    pa.array[i*3] = Math.cos(a) * pDat[i].r
    pa.array[i*3+2] = Math.sin(a) * pDat[i].r
  }
  pa.needsUpdate = true

  // Pulse hero rings
  const hp = 0.5 + Math.sin(animTime * 1.5) * 0.5
  heroMat1.opacity = 0.08 + hp * 0.12
  heroMat2.opacity = 0.04 + hp * 0.08
  heroRing1.scale.setScalar(1 + Math.sin(animTime * 2) * 0.04)
  heroRing2.scale.setScalar(1 + Math.sin(animTime * 1.6 + 1) * 0.06)

  // Pulse zero marker
  zeroMat.opacity = 0.08 + Math.sin(animTime * 0.8) * 0.06

  // Tour: camera fly + auto-advance
  if (tourActive) {
    const pos = treePositions[tourStep]
    flyTarget.copy(pos).add(flyOffset)
    camera.position.lerp(flyTarget, 0.035)
    controls.target.lerp(pos, 0.04)
    tourTimer += 0.016
    if (tourTimer >= TOUR_DELAY && tourStep < cards.length - 1) {
      goToStep(tourStep + 1)
    }
  }

  raycaster.setFromCamera(pointer, camera)
  const meshes = cards.map(c => c.card)
  const intersects = raycaster.intersectObjects(meshes)

  cards.forEach((c, i) => {
    c.update()
    if (c.expanded) return
    if (intersects.length && intersects[0].object === c.card) {
      if (hovered !== i) {
        if (hovered !== null) cards[hovered].setHover(false)
        hovered = i
        c.setHover(true)
      }
    } else {
      if (hovered === i) { c.setHover(false); hovered = null }
    }
  })

  renderer.render(scene, camera)
}
animate()
