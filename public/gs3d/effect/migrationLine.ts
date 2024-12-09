import PolylineTrailColorMaterialProperty from './PolylineTrailColorMaterialProperty'
import redimage from '../gs3d-assets/image/effect/trail_red.png'

import * as Cesium from 'cesium'
export class MigrationLine {
  viewer: Cesium.Viewer
  opt: any
  shapeEntities: any[]
  state: string
  constructor(viewer, opt = {}) {
    this.viewer = viewer
    this.opt = {
      show: true,
      center: {
        lon: 114.302312702,
        lat: 30.598026044,
        pixelSize: 20,
        color: Cesium.Color.PINK
      },
      points: [
        {
          lon: 115.028495718,
          lat: 30.200814617,
          pixelSize: 5,
          color: Cesium.Color.PINK
        },
        {
          lon: 110.795000473,
          lat: 32.638540762,
          pixelSize: 5,
          color: Cesium.Color.PINK
        }
      ],
      polyline: {
        width: 2,
        material: {
          color: Cesium.Color.RED,
          duration: 3000,
          image: redimage
        }
      },
      ...opt
    }

    this.shapeEntities = []

    this.state = 'init'
  }

  draw() {
    let { show, center, points, polyline } = this.opt

    const startPoint = Cesium.Cartesian3.fromDegrees(center.lon, center.lat, 0)
    let startPointEntity = this.viewer.entities.add({
      position: startPoint,
      show,
      point: {
        pixelSize: center.pixelSize,
        color: center.color
      }
    })
    this.shapeEntities.push(startPointEntity)

    this.viewer.entities.suspendEvents() // 大批量操作时，临时禁用事件可以提高性能
    points.map(point => {
      const endPoint = Cesium.Cartesian3.fromDegrees(point.lon, point.lat, 0)
      let endPointEntity = this.viewer.entities.add({
        position: endPoint,
        show,
        point: {
          pixelSize: point.pixelSize,
          color: point.color
        }
      })
      this.shapeEntities.push(endPointEntity)

      let material = new PolylineTrailColorMaterialProperty({
        color: polyline.material.color,
        duration: polyline.material.duration,
        image: polyline.material.image
      })
      let polylineEntity = this.viewer.entities.add({
        show,
        polyline: {
          positions: this.generateCurve(startPoint, endPoint),
          width: polyline.width,
          material: material as any
        }
      })
      this.shapeEntities.push(polylineEntity)
    })
    this.viewer.entities.resumeEvents()

    this.state = 'draw'
  }

  generateCurve(startPoint, endPoint) {
    let addPointCartesian = new Cesium.Cartesian3()
    // 开始点和结束点笛卡尔3求和，放入addPointCartesian
    Cesium.Cartesian3.add(startPoint, endPoint, addPointCartesian)

    let midPointCartesian = new Cesium.Cartesian3()
    // 假设开始点和结束点连线，中心点就是大致/2，放入addPointCartesian
    Cesium.Cartesian3.divideByScalar(addPointCartesian, 2, midPointCartesian)

    // 中心点笛卡尔3转wgs84弧度
    let midPointCartographic = Cesium.Cartographic.fromCartesian(midPointCartesian)
    // 中心点高度为开始点和结束点连线距离/5
    midPointCartographic.height = Cesium.Cartesian3.distance(startPoint, endPoint) / 5

    // 求中心点的
    let midPoint = new Cesium.Cartesian3()
    Cesium.Ellipsoid.WGS84.cartographicToCartesian(midPointCartographic, midPoint)
    // 样条插值
    let spline = new Cesium.CatmullRomSpline({
      times: [0.0, 0.5, 1.0],
      points: [startPoint, midPoint, endPoint]
    })
    let curvePoints = []
    for (let i = 0, len = 200; i < len; i++) {
      curvePoints.push(spline.evaluate(i / len))
    }

    return curvePoints
  }

  flyTo() {
    this.viewer.flyTo(this.shapeEntities)
  }

  show() {
    this.changeShow([this.shapeEntities], true)
  }

  hide() {
    this.changeShow([this.shapeEntities], false)
  }

  clear() {
    this.shapeEntities.forEach(item => {
      this.viewer.entities.remove(item)
    })
    this.shapeEntities = []

    this.state = 'clear'
  }

  changeShow(listArr, bool) {
    if (this.opt.show != bool) {
      listArr.forEach(arr => {
        arr.forEach(single => {
          single.show = bool
        })
      })

      this.opt.show = bool
    }
  }
}
