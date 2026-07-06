import * as THREE from 'three'
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'

export default class ForecastingDemo {
  constructor() {
    this.group = new THREE.Group()
    this.curvePoints = []
    this.forecastPoints = []
    this._build()
  }

  _build() {
    // Generate historical data (sine wave + noise)
    const histLen = 30
    this.histData = []
    for (let i = 0; i < histLen; i++) {
      this.histData.push(Math.sin(i * 0.3) * 0.8 + (Math.random() - 0.5) * 0.2)
    }

    // Generate forecast
    this.forecastData = []
    const lastVal = this.histData[histLen - 1]
    for (let i = 0; i < 10; i++) {
      this.forecastData.push(Math.sin((histLen + i) * 0.3) * 0.8)
    }

    // 3D line chart
    this._drawCurve(this.histData, 0x3b82f6, -1.5)
    this._drawCurve(this.forecastData, 0x00ffaa, -1.5, true)

    // Vertical divider
    const divGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -1.2, -1.5),
      new THREE.Vector3(0, 1.2, -1.5),
    ])
    const divMat = new THREE.LineBasicMaterial({
      color: 0x00ffaa, transparent: true, opacity: 0.15,
      transparent: true,
    })
    const divider = new THREE.Line(divGeo, divMat)
    this.group.add(divider)

    // Labels
    const histDiv = document.createElement('div')
    histDiv.textContent = 'HISTORICAL'
    histDiv.style.cssText = 'color:#3b82f6;font-size:8px;font-weight:600;font-family:system-ui;letter-spacing:0.06em;opacity:0.5;'
    const histLabel = new CSS2DObject(histDiv)
    histLabel.position.set(-1.0, 1.4, -1.5)
    this.group.add(histLabel)

    const fcastDiv = document.createElement('div')
    fcastDiv.textContent = 'FORECAST'
    fcastDiv.style.cssText = 'color:#00ffaa;font-size:8px;font-weight:600;font-family:system-ui;letter-spacing:0.06em;opacity:0.5;'
    const fcastLabel = new CSS2DObject(fcastDiv)
    fcastLabel.position.set(1.0, 1.4, -1.5)
    this.group.add(fcastLabel)

    // Confidence cone (transparent triangles for uncertainty)
    const conePts = []
    for (let i = 0; i < 10; i++) {
      const x = i * 0.1 + 0.05
      const y = this.forecastData[i]
      const spread = 0.1 + i * 0.02
      conePts.push(new THREE.Vector3(x, y + spread, -1.5))
      conePts.push(new THREE.Vector3(x, y - spread, -1.5))
    }

    const metrics = ['MAE: 0.042', 'RMSE: 0.058', 'MAPE: 3.2%']
    metrics.forEach((m, i) => {
      const div = document.createElement('div')
      div.textContent = m
      div.style.cssText = 'color:#00ffaa;font-size:9px;font-family:monospace;padding:2px 8px;border-radius:4px;background:rgba(0,255,170,0.04);border:1px solid rgba(0,255,170,0.06);'
      const label = new CSS2DObject(div)
      label.position.set(i * 1.2 - 1.2, -1.8, 0)
      this.group.add(label)
    })

    // Title
    const titleDiv = document.createElement('div')
    titleDiv.textContent = 'Task 2 — Time-Series Forecasting'
    titleDiv.style.cssText = 'color:#00ffaa;font-size:13px;font-weight:700;font-family:system-ui;letter-spacing:0.04em;text-shadow:0 0 16px rgba(0,255,170,0.2);'
    const titleLabel = new CSS2DObject(titleDiv)
    titleLabel.position.set(0, 2.0, 0)
    this.group.add(titleLabel)

    // Sliding window indicator
    const windowDiv = document.createElement('div')
    windowDiv.textContent = '◄ sliding window (10 steps) ►'
    windowDiv.style.cssText = 'color:rgba(59,130,246,0.3);font-size:8px;font-family:monospace;'
    const windowLabel = new CSS2DObject(windowDiv)
    windowLabel.position.set(-1.0, -0.5, 0)
    this.group.add(windowLabel)
  }

  _drawCurve(data, color, z, dashed = false) {
    const step = 0.1
    const pts = data.map((v, i) => new THREE.Vector3(i * step, v, z))
    const geo = new THREE.BufferGeometry().setFromPoints(pts)
    const mat = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0.6,
    })
    const line = new THREE.Line(geo, mat)
    this.group.add(line)

    // Dots on the curve
    data.forEach((v, i) => {
      const dotGeo = new THREE.SphereGeometry(0.02, 6, 6)
      const dotMat = new THREE.MeshPhysicalMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.3,
      })
      const dot = new THREE.Mesh(dotGeo, dotMat)
      dot.position.set(i * step, v, z)
      this.group.add(dot)
    })
  }
}
