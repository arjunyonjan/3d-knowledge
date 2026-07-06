import * as THREE from 'three'

const cache = new Map()

export function getIconTexture(pathData, color = '#00ffaa', size = 64) {
  const key = `${pathData}_${color}_${size}`
  if (cache.has(key)) return cache.get(key)

  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')

  const center = size / 2
  const scale = size / 32

  ctx.strokeStyle = color
  ctx.lineWidth = 2.5 * scale
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.fillStyle = 'transparent'

  const commands = pathData.match(/[MmLlCcQqAaZz][\d\s.,-]*/g) || []
  let cx = 0, cy = 0

  ctx.beginPath()
  for (const cmd of commands) {
    const type = cmd[0]
    const nums = cmd.slice(1).trim().split(/[\s,]+/).filter(Boolean).map(Number)
    if (type === 'M') { ctx.moveTo(nums[0] * scale + 2, nums[1] * scale + 2); cx = nums[0]; cy = nums[1] }
    else if (type === 'm') { ctx.moveTo((nums[0] + cx) * scale + 2, (nums[1] + cy) * scale + 2); cx += nums[0]; cy += nums[1] }
    else if (type === 'L') { ctx.lineTo(nums[0] * scale + 2, nums[1] * scale + 2); cx = nums[0]; cy = nums[1] }
    else if (type === 'l') { ctx.lineTo((nums[0] + cx) * scale + 2, (nums[1] + cy) * scale + 2); cx += nums[0]; cy += nums[1] }
    else if (type === 'A') {
      const rx = nums[0] * scale, ry = nums[1] * scale
      ctx.ellipse(nums[5] * scale + 2, nums[6] * scale + 2, rx, ry, 0, 0, Math.PI * 2)
      cx = nums[5]; cy = nums[6]
    } else if (type === 'Z' || type === 'z') { ctx.closePath() }
  }
  ctx.stroke()

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  cache.set(key, texture)
  return texture
}
