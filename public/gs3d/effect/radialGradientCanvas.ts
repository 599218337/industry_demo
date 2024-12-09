export function getRadialGradientCanvas(edgeColor, centerColor) {
  let dom = document.createElement('canvas')
  dom.width = 50
  dom.height = 50
  let ctx = dom.getContext('2d')

  let radialGradient = ctx.createRadialGradient(25, 25, 0, 25, 25, 50)
  radialGradient.addColorStop(0, centerColor)
  radialGradient.addColorStop(1, edgeColor)

  ctx.fillStyle = radialGradient
  ctx.fillRect(0, 0, 50, 50)

  return dom
}
