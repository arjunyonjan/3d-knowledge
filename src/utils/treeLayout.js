import * as THREE from 'three'

export function computeTreePositions(count) {
  const positions = []
  if (count === 0) return positions

  const ySpacing = 2.5
  const xSpacing = 4.0
  const zSpread = 1.5

  for (let i = 0; i < count; i++) {
    const d = Math.floor(Math.log2(i + 1))
    const levelMax = Math.pow(2, d)
    const idxInLevel = i - (levelMax - 1)
    const offset = idxInLevel - (levelMax - 1) / 2
    const x = offset * xSpacing * (1 - d * 0.08)
    const y = d * ySpacing - 5
    const z = Math.sin(i * 1.7) * zSpread
    positions.push(new THREE.Vector3(x, y, z))
  }

  return positions
}
