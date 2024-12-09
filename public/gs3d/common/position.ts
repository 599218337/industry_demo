import * as turf from '@turf/turf'
import * as Cesium from 'cesium'

export namespace position {
  /**
   * @description 定位实体
   * @param {any} v - viewer
   * @param {any} entity - entity,支持对象和数组，以及深层嵌套多数组
   * @param {object} option - 配置
   * @return {*}
   * @example
   * ```ts
   * let option = {
   *   type: "flyTo",//类型，可选"flyTo"||"zoomTo"，默认"flyTo"
   *   duration: 2,//飞行持续时间（秒），可选，默认2秒
   *   maximumHeight: 10000,//飞行高峰时的最大高度，可选，无默认值
   *   offset: {//角度偏移量，可选，无默认值
   *     heading: 0,//单位(度)
   *     pitch: -30,//单位(度)
   *     range: 50000,//单位(米)
   *   },
   *   moveOffset: {//上下左右偏移量，可选，无默认值，待实现
   *     top: 0,
   *     bottom: 0,
   *     left: 0,
   *     right: 0
   *   }
   * }
   * gs3d.common.position.locationEntity(viewer, entity, option)
   * ```
   */
  export const locationEntity = (v: any, entity: any, option?: { [prop: string]: any }) => {
    let viewer = v
    if (!viewer) {
      console.log('请传入viewer')
      return
    }
    let e: Array<any> = []
    formatEntitiesArray(entity, e)
    let { type = 'flyTo', offset = null, duration = 2, maximumHeight = null } = option || {}
    if (offset) {
      offset.heading = Cesium.Math.toRadians(offset.heading || 0)
      offset.pitch = Cesium.Math.toRadians(offset.pitch || 0)
      offset.range ||= 0
    } else {
      offset = null
    }

    switch (type) {
      case 'flyTo':
        viewer.flyTo(e, { offset, duration, maximumHeight })
        break
      case 'zoomTo':
        viewer.zoomTo(e, offset)
        break
      default:
        break
    }
  }
  const formatEntitiesArray = (entity: any, e: any) => {
    let isArray = Array.isArray(entity)
    if (isArray) {
      entity.forEach((item: any) => {
        formatEntitiesArray(item, e)
      })
    } else {
      e.push(entity)
    }
  }
  /**
   * @description 定位到接口结果dataList所在范围
   * @param {any} v - viewer
   * @param {Array} dataList - 接口返回的dataList数据
   * @param {number} offset - 定位范围偏移量(即四周留白距离)
   * @return {*}
   * @example
   * ```ts
   * let dataList = [{
   *   "iwhereGeometry": {
   *     "coordinates": [
   *       125.37309576840005,
   *       43.82650035842283
   *     ],
   *     "type": "Point"
   *   }
   * },
   * {
   *   "iwhereGeometry": {
   *     "coordinates": [
   *       125.37992411686133,
   *       43.82840936317525
   *     ],
   *     "type": "Point"
   *   }
   * }]
   * gs3d.common.position.locationResultData(viewer, dataList)
   * ```
   */
  export function locationResultData(v: any, dataList: Array<any>, offset?: number) {
    let viewer = v
    if (!viewer) {
      console.log('请传入viewer')
      return
    }
    let centerArray: Array<any> = getCenterArray(dataList)
    let latArray: Array<any> = []
    let lngArray: Array<any> = []
    centerArray.forEach(item => {
      latArray.push(item[1])
      lngArray.push(item[0])
    })

    let minExtentLat = Math.min(...latArray)
    let minExtentLng = Math.min(...lngArray)
    let maxExtentLat = Math.max(...latArray)
    let maxExtentLng = Math.max(...lngArray)

    offset = offset || 0.003
    let extentRectangle = Cesium.Rectangle.fromDegrees(minExtentLng - offset, minExtentLat - offset, maxExtentLng + offset, maxExtentLat + offset)
    viewer.camera.flyTo({
      destination: extentRectangle
      // orientation: {
      //     heading: 6.28318530717956,
      //     pitch: -0.7853988554907718,
      //     roll: 0,
      // }
      // new Cesium.HeadingPitchRange(6.28318530717956, -0.7853988554907718, 50)
    })
  }

  const getCenterArray = (dataList: Array<any>) => {
    let centerArray: Array<any> = []
    dataList.forEach((item: any) => {
      if (!!item.iwhereGeometry && !!item.iwhereGeometry.coordinates.length) {
        let center: any, polygon
        if (item.iwhereGeometry.type != 'Point') {
          if (item.iwhereGeometry.type != 'MultiPolygon') {
            polygon = turf.polygon(item.iwhereGeometry.coordinates)
          } else {
            polygon = turf.multiPolygon(item.iwhereGeometry.coordinates)
          }
          center = turf.centerOfMass(polygon)
        } else {
          center = { geometry: item.iwhereGeometry }
        }
        if (!!center.geometry.coordinates.length) {
          centerArray.push(center.geometry.coordinates)
        }
      }
    })
    return centerArray
  }
}
