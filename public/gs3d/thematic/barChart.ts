import * as Cesium from 'cesium'

import { Chart } from './chart'
import * as util from '../util'
const {
  color: { randColor },
  common: { MinMaxCounter }
} = util
/**
 * @description 三维柱状图，不传参的话实例内部自带默认用例
 * @param {Cesium.Viewer} viewer - Cesium.Viewer
 * @param {object} opt - 三维柱状图的参数
 * @return {object} - 三维柱状图实例，用于控制，绘制，定位，显，隐，清除，重绘
 */
export class BarChart extends Chart {
  shapeEntityOpt: any
  shapeEntities: any

  constructor(viewer, opt) {
    super(viewer)

    /* 不同 */
    this.opt = {
      distance: {
        isLng: true, // true：柱状图x轴与纬线平行 false： 柱状图x轴与经线平行
        value: 0.05
      },

      time: 1000,
      hasLegend: true,
      hasDetail: true,
      show: true,
      category: [
        [randColor(), '数据类型'],
        [randColor(), '数据类型'],
        [randColor(), '数据类型'],
        [randColor(), '数据类型'],
        [randColor(), '数据类型'],
        [randColor(), '数据类型'],
        [randColor(), '数据类型'],
        [randColor(), '数据类型'],
        [randColor(), '数据类型'],
        [randColor(), '数据类型']
      ],
      series: [
        {
          title: '北京市',
          center: [116.3, 39.9],
          data: [120, 200, 150, 80, 70, 110, 130],
          detail: text => {
            return `这是详细的具体数据内容：${text}`
          }
        },
        {
          // title: "西安市",
          center: [115.3, 39.9],
          data: [120, 200, 150, 80, 70, 110, 211]
        }
      ],
      ...opt
    }
    this.shapeEntityOpt = {
      // point: {
      //   pixelSize: 6,
      //   color: Cesium.Color.AQUA.withAlpha(0.8),
      //   outlineWidth: 1,
      //   outlineColor: Cesium.Color.WHITE.withAlpha(0.8),
      //   disableDepthTestDistance: Number.POSITIVE_INFINITY,
      // },
      box: {
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
      }
    }
    this.shapeEntities = []
  }

  /* 不同 */

  draw() {
    let { series, distance, category, time } = this.opt
    let { isLng, value } = distance

    let minmaxCounter = new MinMaxCounter()
    series.forEach(item => {
      let { center, data } = item
      if (data) {
        for (let i = 0; i < data.length; i++) {
          minmaxCounter.update(data[i])
        }
        if (data.length > this.maxLength) this.maxLength = data.length
      }
    })
    let [, maxNum] = minmaxCounter.result()

    series.forEach((item, index) => {
      let { center, data } = item

      /* 计算点位
                isLng:true x轴与纬线平行 value 计算经度
                isLng:false x轴与经线平行 value 计算纬度
                */
      let total = data.length
      let num = Math.trunc(total / 2) // 如果是偶数，绘制的中心点会错开一位
      let list = [] // [[lon,lat],...]
      let listC3 = [] // [Cartesian3,...]
      if (!isLng) {
        let top_last = [center[0], center[1] + num * value] // 计算最后一个点的位置
        for (let i = 0; i < data.length; i++) {
          let lon = top_last[0]
          let lat = top_last[1] - value * (total - i - 1)
          let current = [lon, lat]
          list.push(current)
          let currentc3 = Cesium.Cartesian3.fromDegrees(lon, lat)
          listC3.push(currentc3)
        }
      } else {
        let right_last = [center[0] + num * value, center[1]]
        for (let i = 0; i < data.length; i++) {
          let lon = right_last[0] - value * (total - i - 1)
          let lat = right_last[1]
          let current = [lon, lat]
          list.push(current)
          let currentc3 = Cesium.Cartesian3.fromDegrees(lon, lat)
          listC3.push(currentc3)
        }
      }

      /* 计算柱状间距 */
      let c3distance = Cesium.Cartesian3.distance(listC3[0], listC3[1])
      let radius = c3distance / 3 // 有自然间距

      /* 计算高度比例 */
      let xAxisLength = (c3distance * total) / 2
      let unit = xAxisLength / maxNum

      /* 准备绘制 */
      let interval = 100
      let timerList = []
      let promiseList = []
      listC3.forEach((pos, index) => {
        let promiseItem = new Promise((res, rej) => {
          let shapeOpt = {
            position: pos,
            // point: this.shapeEntityOpt.point,
            box: {
              ...this.shapeEntityOpt.box,
              material: Cesium.Color.fromCssColorString(category[index][0]),
              dimensions: new Cesium.Cartesian3(
                radius * 2,
                radius * 2,
                0
                // unit * data[index]
              )
            },
            show: this.opt.show
          }
          let shapeEntity = this.viewer.entities.add(shapeOpt)
          this.shapeEntities.push(shapeEntity)
          /* 加载效果time毫秒完成 */
          let height = 0
          let grow = (unit * data[index]) / (time / interval)
          let timer = setInterval(() => {
            if (height <= unit * data[index]) {
              shapeEntity.box.dimensions = new Cesium.Cartesian3(radius * 2, radius * 2, height) as any
              height += grow
            } else {
              res(index)
            }
          }, interval)
          timerList.push(timer)
        })
        promiseList.push(promiseItem)
      })
      /* 绘制开始 */
      Promise.all(promiseList).then(result => {
        /* 清除长高效果定时器 */
        timerList.forEach(timer => {
          clearInterval(timer)
        })
        /* 添加柱状体的label */
        result.forEach((itemIndex, index) => {
          let labelOpt = {
            position: Cesium.Cartesian3.fromDegrees(list[itemIndex][0], list[itemIndex][1], (unit * data[itemIndex]) / 2),
            // position: pos,
            label: {
              text: `${data[itemIndex]}`,
              ...this.labelEntityOpt.label
            },
            show: this.opt.show
          }
          this.labelEntities.push(this.viewer.entities.add(labelOpt))
        })

        /* 数据如果有title，添加 */
        let { title } = item
        if (title) {
          let rightTop, leftBot
          if (isLng) {
            rightTop = list[list.length - 1]
            rightTop = [rightTop[0], rightTop[1] - value]
            leftBot = list[0]
            leftBot = [leftBot[0], leftBot[1] - 2 * value]
          } else {
            rightTop = list[list.length - 1]
            rightTop = [rightTop[0] - value, rightTop[1]]
            leftBot = list[0]
            leftBot = [leftBot[0] - 2 * value, leftBot[1]]
          }

          let url = this.createTitleURL(title)

          let stRotation = isLng ? {} : { stRotation: Cesium.Math.toRadians(-90) }
          let titleEntity = this.viewer.entities.add({
            rectangle: {
              coordinates: Cesium.Rectangle.fromDegrees(leftBot[0], leftBot[1], rightTop[0], rightTop[1]),
              height: 0,
              material: new Cesium.ImageMaterialProperty({
                image: `${url}`,
                transparent: true
              }),
              ...stRotation,
              // stRotation: Cesium.Math.toRadians(-90),
              ...this.titleEntityOpt.rectangle
            },
            show: false
          })
          this.titleEntities.push(titleEntity)
          let titleTimer = setTimeout(() => {
            titleEntity.show = this.opt.show
            clearTimeout(titleTimer)
          }, 100)
        }
      })
    })

    if (this.opt.hasLegend) this.createLegendDiv()

    if (this.opt.hasDetail) {
      this.createDetail(this.shapeEntities, this.labelEntities)
    }

    this.state = 'draw'
  }

  flyTo() {
    this.viewer.flyTo(this.shapeEntities)
  }

  show() {
    this.changeShow([this.labelEntities, this.shapeEntities, this.titleEntities], true)
  }

  hide() {
    this.changeShow([this.labelEntities, this.shapeEntities, this.titleEntities], false)
  }

  clear() {
    this.clearType(this.viewer, this.shapeEntities, this.viewer.entities)

    this.clearGeneral()
  }
}
