import { createCanvas } from 'canvas'
import fs from 'fs'

// Trans flag colors: blue, pink, white, pink, blue stripes
function drawTransFlag(canvas) {
  const ctx = canvas.getContext('2d')
  const w = canvas.width
  const h = canvas.height
  const stripeH = h / 5

  const colors = ['#55CDFC', '#F7A8B8', '#FFFFFF', '#F7A8B8', '#55CDFC']
  colors.forEach((c, i) => {
    ctx.fillStyle = c
    ctx.fillRect(0, i * stripeH, w, stripeH + 1)
  })
}

// 192x192
const c192 = createCanvas(192, 192)
drawTransFlag(c192)
fs.writeFileSync('public/icon-192.png', c192.toBuffer('image/png'))

// 512x512
const c512 = createCanvas(512, 512)
drawTransFlag(c512)
fs.writeFileSync('public/icon-512.png', c512.toBuffer('image/png'))

// 180x180 apple touch
const c180 = createCanvas(180, 180)
drawTransFlag(c180)
fs.writeFileSync('public/apple-touch-icon.png', c180.toBuffer('image/png'))

console.log('Icons generated!')
