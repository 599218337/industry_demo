import * as Cesium from 'cesium'

/* 基类，用于继承方法，不实例化 */
/* chart系列相同的方法和初始化在此类中 */
export class Chart {
  /* 相同 */
  viewer: Cesium.Viewer
  labelEntityOpt: any
  labelEntities: any
  titleEntityOpt: any
  titleEntities: any
  ctxOpt: any
  legend: HTMLElement
  detail: HTMLElement
  handler: any
  maxLength: number
  state: string

  /* 不同 */
  opt: any

  constructor(viewer) {
    /* 相同 */
    this.viewer = viewer
    this.labelEntityOpt = {
      label: {
        font: '18px Helvetica',
        fillColor: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 500000)
      }
    }
    this.labelEntities = []
    this.titleEntityOpt = {
      rectangle: {
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 500000)
      }
    }
    this.titleEntities = []
    this.ctxOpt = {
      width: 1189,
      height: 300,
      fillStyleBKG: 'transparent', // 背景色
      font: '100px Avenir',
      fillStyle: 'white', // 字体填充
      strokeStyle: 'black' // 字体边线
    }

    this.legend
    this.detail
    this.handler
    this.maxLength = 0 // 依照最大的数据长度制作图例
    this.state = 'init'
  }

  /* 相同 */
  createTitleURL(title) {
    let { width, height, font, fillStyle, strokeStyle, fillStyleBKG } = this.ctxOpt
    let canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    let ctx = canvas.getContext('2d')

    // 背景色
    ctx.fillStyle = fillStyleBKG
    ctx.fillRect(0, 0, width, height)
    // 加载文字
    ctx.font = font
    ctx.fillStyle = fillStyle
    ctx.strokeStyle = strokeStyle
    // 文字居中
    ctx.textAlign = 'center'
    ctx.fillText(title, canvas.width / 2, canvas.height / 2)
    ctx.strokeText(title, canvas.width / 2, canvas.height / 2)

    let url = canvas.toDataURL('image/jpg')
    return url
  }

  createLegendDiv() {
    this.legend = document.createElement('div')
    this.legend.className = 'chart-legend'
    let { category, series } = this.opt
    let innerLegend = ''
    for (let i = 0; i < this.maxLength; i++) {
      innerLegend += `
    <div class='chart-legend-item' ><div class='chart-legend-color' style='background-color:${category[i][0]};' ></div><div class='chart-legend-text'>${category[i][1]}</div></div>
  `
    }
    this.legend.innerHTML = innerLegend
    this.viewer.cesiumWidget.container.appendChild(this.legend)
  }

  createDetail(shapeEntities, labelEntities) {
    let { series } = this.opt
    this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas)
    this.handler.setInputAction(movement => {
      const pick = this.viewer.scene.pick(movement.position)

      if (Cesium.defined(pick)) {
        let pickedObj = pick.id ? pick.id : pick.primitive
        let isIn1 = shapeEntities.indexOf(pickedObj)
        let num = isIn1 != -1 ? isIn1 : 'undefined'

        if (num === 'undefined') {
          let isIn2 = labelEntities.indexOf(pickedObj)
          num = isIn2 != -1 ? isIn2 : 'undefined'
        }
        if (num !== 'undefined') {
          let entity = shapeEntities[num]

          this.viewer.scene.screenSpaceCameraController.enableInputs = false

          // entity.box.outline = true;
          // entity.box.outlineColor = Cesium.Color.WHITE;
          // entity.box.outlineWidth = 100;

          let detail = this.createDetailDiv()
          let text = labelEntities[num].label.text
          let length = 0
          let dict = []
          series.forEach((item, index) => {
            dict.push([length, length + item.data.length - 1])
            length += item.data.length
          })
          let count = null
          dict.forEach((item, index) => {
            if (num >= item[0] && num <= item[1]) count = index
          })
          if (series[count].detail) text = series[count].detail(text)
          detail.innerText = `${text}`

          detail.style.left = movement.position.x + 'px'
          detail.style.top = movement.position.y + 'px'
          this.viewer.cesiumWidget.container.appendChild(detail)

          labelEntities[num].show = false

          let outlineTimer = setTimeout(() => {
            this.viewer.scene.screenSpaceCameraController.enableInputs = true

            // entity.box.outline = undefined;
            // entity.box.outlineColor = undefined;
            // entity.box.outlineWidth = undefined;

            labelEntities[num].show = this.opt.show
            this.viewer.cesiumWidget.container.removeChild(detail)
            clearTimeout(outlineTimer)
          }, 1500)
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
  }

  createDetailDiv() {
    this.detail = document.createElement('div')
    this.detail.className = 'chart-detail'
    return this.detail
  }

  changeShow(listArr, bool) {
    if (this.opt.show != bool) {
      listArr.forEach(arr => {
        arr.forEach(single => {
          single.show = bool
        })
      })

      if (this.opt.hasLegend) this.legend.style.display = bool ? 'block' : 'none'

      /* 效果隐藏 */
      // if (bool) {
      //   // 加载效果
      // } else {
      //   // 隐藏效果
      // }

      this.opt.show = bool
    }
  }

  clearType(viewer, arr, place) {
    if (arr.length) {
      arr.forEach(entity => {
        place.remove(entity)
      })
      arr = []
    }
  }

  clearGeneral() {
    this.clearType(this.viewer, this.labelEntities, this.viewer.entities)
    this.clearType(this.viewer, this.titleEntities, this.viewer.entities)

    if (this.opt.hasLegend) {
      this.viewer.cesiumWidget.container.removeChild(this.legend)
      this.legend = undefined
    }

    // this.viewer.cesiumWidget.container.removeChild(this.detail)

    this.handler.destroy()
    this.handler = undefined

    this.state = 'clear'
  }
}
