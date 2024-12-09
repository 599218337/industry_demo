import * as Cesium from 'cesium'
import * as turf from '@turf/turf'

import { Chart } from './chart'
import { levelSize } from '../grid/util/levelSize'
import * as util from '../util'
const {
  color: { randColor }
} = util
/**
 * @description 三维饼状图，不传参的话实例内部自带默认用例
 * @param {Cesium.Viewer} viewer - Cesium.Viewer
 * @param {object} opt - 三维饼状图的参数
 * @return {object} - 三维饼状图实例，用于控制，绘制，定位，显，隐，清除，重绘
 */
export class PieChart extends Chart {
  shapePrimitives: any
  bbox: any
  constructor(viewer, opt) {
    super(viewer)

    this.opt = {
      radius: 14,
      extrudedHeight: 5000,

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
          data: [200, 200, 200, 200],
          detail: text => {
            return `这是详细的具体数据内容：${text}`
          }
          // total // 计算每组数据的total
        },
        {
          // title: "西安市",
          center: [115.3, 39.9],
          data: [120, 50, 250, 80, 160]
        }
      ],
      ...opt
    }
    /* 扇形图元选项 无 */
    this.shapePrimitives = []
    this.bbox
  }

  /* 不同 */

  draw() {
    let { series, radius, extrudedHeight, show, time } = this.opt
    let bboxCounter = new levelSize.BBOXCounter()

    series.forEach(item => {
      let { data, center, total } = item
      if (data && center) {
        /* series每项新增total属性 */
        let total = 0
        data.forEach((value, index) => {
          total += Number(value)
        })
        item.total = total
        if (data.length > this.maxLength) this.maxLength = data.length

        /* 计算定位 */
        bboxCounter.update(center[0], center[1])

        /* 计算圆正东，正西，正南，正北位置 正东与中心点经度差 */
        let eastWestNorthSouth = [],
          lngDiff,
          latDiff
        /* 计算圆正东，正西位置 正东与中心点经度差 */
        let eastList = turf.sector(turf.point(center), radius, 0, 90.05).geometry.coordinates[0]
        let eastPoint = eastList[eastList.length - 2]
        lngDiff = eastPoint[0] - center[0]
        let westPoint = [center[0] - lngDiff, eastPoint[1]]
        eastWestNorthSouth.push(eastPoint)
        eastWestNorthSouth.push(westPoint)

        /* 计算扇形弧度 */
        let bearing1 = 0,
          bearing2 = 0
        data.forEach((value, index) => {
          bearing2 = bearing1 + (value / total) * 360
          let sector = turf.sector(
            turf.point(center),
            radius,
            bearing1,
            (bearing2 - bearing1) % 90 === 0 && (bearing2 - bearing1) / 90 != 4 ? bearing2 + 0.05 : bearing2
            // 避免角度为90度的倍数时，turf计算扇形面不准确
            // 避免角度为360度时，添加导致不是整圆
          )
          bearing1 = bearing2

          let pos = []
          sector.geometry.coordinates[0].forEach((single, ind) => {
            /* 计算圆正南，正北位置 正北与中心点纬度差 */
            if (ind == 1 && index == 0) {
              let northPoint = [single[0], single[1]]
              latDiff = single[1] - item.center[1]
              let southPoint = [single[0], item.center[1] - latDiff]
              eastWestNorthSouth.push(northPoint)
              eastWestNorthSouth.push(southPoint)
            }

            pos.push(single[0])
            pos.push(single[1])
          })

          /* 绘制扇形 加载效果time毫秒完成 */
          let clearPrimitives = []
          let instance = new Cesium.GeometryInstance({
            geometry: Cesium.PolygonGeometry.fromPositions({
              positions: Cesium.Cartesian3.fromDegreesArray(pos),
              extrudedHeight: 0,
              vertexFormat: Cesium.VertexFormat.POSITION_ONLY
            })
          })
          let primitive = new Cesium.Primitive({
            geometryInstances: instance,
            appearance: new Cesium.MaterialAppearance({
              material: new Cesium.Material({
                fabric: {
                  type: 'Color',
                  uniforms: {
                    color: Cesium.Color.fromCssColorString(this.opt.category[index][0])
                  }
                }
              }),
              flat: true
            }),
            show: show
          })
          clearPrimitives.push(primitive)
          this.viewer.scene.primitives.add(primitive)
          let height = 0
          let interval = 100
          let grow = extrudedHeight / (time / interval)
          /* 记录定时器 */
          let timer = setInterval(() => {
            if (height <= extrudedHeight) {
              height += grow
              instance = new Cesium.GeometryInstance({
                geometry: Cesium.PolygonGeometry.fromPositions({
                  positions: Cesium.Cartesian3.fromDegreesArray(pos),
                  extrudedHeight: height,
                  vertexFormat: Cesium.VertexFormat.POSITION_ONLY
                })
              })
              let primitive = new Cesium.Primitive({
                geometryInstances: instance,
                appearance: new Cesium.MaterialAppearance({
                  material: new Cesium.Material({
                    fabric: {
                      type: 'Color',
                      uniforms: {
                        color: Cesium.Color.fromCssColorString(this.opt.category[index][0])
                      }
                    }
                  }),
                  flat: true
                }),
                show: show
              })
              clearPrimitives.push(primitive)
              this.viewer.scene.primitives.add(primitive)
            } else {
              clearPrimitives.forEach((p, index) => {
                if (index != clearPrimitives.length - 1) {
                  this.viewer.scene.primitives.remove(p)
                }
                if (index == clearPrimitives.length - 1) {
                  console.log(instance)
                  this.shapePrimitives.push(p)
                }
              })

              /* 标记label */
              let sectorCenter = turf.centerOfMass(sector.geometry).geometry.coordinates
              let labelOpt = {
                position: Cesium.Cartesian3.fromDegrees(sectorCenter[0], sectorCenter[1], extrudedHeight),
                label: {
                  text: `${value}`,
                  ...this.labelEntityOpt.label
                },
                show
              }
              this.labelEntities.push(this.viewer.entities.add(labelOpt))

              /* 仅支持正南title */
              let { title } = item
              if (title) {
                let url = this.createTitleURL(title)

                /* eastWestNorthSouth latDiff lngDiff 造面 */
                let [east, west, north, south] = eastWestNorthSouth
                let rightTop = [east[0], south[1]]
                let leftBot = [west[0], west[1] - 1.5 * latDiff]
                let titleEntity = this.viewer.entities.add({
                  rectangle: {
                    coordinates: Cesium.Rectangle.fromDegrees(leftBot[0], leftBot[1], rightTop[0], rightTop[1]),
                    height: 0,
                    material: new Cesium.ImageMaterialProperty({
                      image: `${url}`,
                      transparent: true
                    }),
                    ...this.titleEntityOpt.rectangle
                  },
                  show: false
                })
                let titleTimer = setTimeout(() => {
                  titleEntity.show = show
                  clearTimeout(titleTimer)
                }, 100)
                this.titleEntities.push(titleEntity)
              }

              /* 清除定时器 */
              clearInterval(timer)
            }
          }, interval)
        })
      }
    })

    this.bbox = bboxCounter.result()

    if (this.opt.hasLegend) this.createLegendDiv()

    if (this.opt.hasDetail) {
      debugger
      this.createDetail(this.shapePrimitives, this.labelEntities)
    }

    this.state = 'draw'
  }

  flyTo(offset = 0.5) {
    let extentRectangle = Cesium.Rectangle.fromDegrees(this.bbox[0] - offset, this.bbox[1] - offset, this.bbox[2] + offset, this.bbox[3] + offset)
    this.viewer.camera.flyTo({
      destination: extentRectangle
    })
  }

  show() {
    this.changeShow([this.labelEntities, this.shapePrimitives, this.titleEntities], true)
  }

  hide() {
    this.changeShow([this.labelEntities, this.shapePrimitives, this.titleEntities], false)
  }

  clear() {
    this.clearType(this.viewer, this.shapePrimitives, this.viewer.scene.primitives)

    this.clearGeneral()
  }

  /* 相同 */
}
