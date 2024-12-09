/*
 * @Description: <绘制geometry网格>
 * @version: 1.0.0
 * @Author: YangYuzhuo
 * @Date: 2023-08-29 09:24:27
 * @LastEditors GS3D
 * @LastEditTime 2023-11-25 16:48:37
 * Copyright 2023
 * listeners
 * @Descripttion: <文件用途说明>
 * @FilePath \\geogrid3d\\packages\\sdk\\gs3d\\grid\\gridDraw.ts
 */

import * as Cesium from 'cesium'
// import axios from "axios";
import { axios } from '../util/axios'
import { levelSize } from './util/levelSize'
export namespace gridDraw {
  export const describe: string = '网格绘制'
  let viewer: any
  let gridPrimitive: Array<any> = []

  /**
   * @description 获取geometry的grid
   * @param {Array} list - geometry数组
   * @param {any} v - viewer
   * @param {string} getGeoNumByGeometryUrl - 使用伏羲接口获取geometry的grid，默认"/engine/iwhereEngine-geosot-3/grid/getGeoNumByGeometry"
   * @param {number} geo_level - grid层级
   * @return {*}
   * @example
   * ```ts
   * gs3d.grid.gridDraw.getGrid([{
   *     "type": "LineString",
   *     "coordinates": [
   *       [124.95005768082369, 44.098787972255984],
   *       [125.08873644406869, 44.10800489107782],
   *       [125.13621833632031, 44.07232691864034],
   *       [125.11497285990575, 44.035754072255905],
   *       [124.96857791967699, 44.034642201800665]
   *     ]
   *   }], viewer).then((res) => {
   *   console.log("res", res);
   * });
   * ```
   */
  export const getGrid = (list: Array<any>, v?: any, getGeoNumByGeometryUrl?: string, geo_level?: number) => {
    if (!geo_level) {
      viewer = v
      if (!viewer) {
        console.log('请传入viewer')
        return
      }
      let { height } = viewer.camera.positionCartographic
      geo_level = levelSize.calculateMapLevel(height)
    }
    let allPromise: Array<any> = []
    list.forEach(item => {
      let option: any = {
        geometry: JSON.stringify(item),
        gsotLevel: geo_level,
        geo_level: geo_level,
        agg_flag: false,
        is_show_scope: true,
        scope_flag: true
      }
      let formData = new URLSearchParams()
      for (let i in option) {
        formData.append(i, option[i])
      }
      let promise = new Promise((resolve, reject) => {
        // axios({
        //   method: "POST",
        //   url: getGeoNumByGeometryUrl || "/engine/iwhereEngine-geosot-3/grid/getGeoNumByGeometry",
        //   data: formData,
        // })
        axios
          .aPost({
            url: getGeoNumByGeometryUrl || '/engine/iwhereEngine-geosot-3/grid/getGeoNumByGeometry',
            data: formData
          })
          .then(res => {
            resolve(res.data)
          })
          .catch(err => {
            // reject(err.data)
            resolve('异常')
          })
      })
      allPromise.push(promise)
    })
    return Promise.all(allPromise)
  }
  /**
   * @description 绘制grid
   * @param {any} v - viewer
   * @param {Array} data - 需要绘制的grid数组，支持伏羲格式和自研格式
   * @param {any} option - 配置
   * @return {*}
   * @example
   * ```ts
   * //伏羲网格格式
   * let gridFX = [{
   *   "geoNumScope": [43.8, 124.66666666666667, 43.833333333333336, 124.7],
   *   "geoNum": "537820615168491520-14",
   *   "geoNum4": "G00131312232100"
   * }]
   * //自研网格格式
   * let gridZY = [{
   *   "left": 116.80083333333333,
   *   "top": 33.949869791666664,
   *   "right": 116.80084201388888,
   *   "bottom": 33.94986111111111
   * }]
   * let data = gridFX || gridZY
   * let option = {
   *   graphicName: "graphicName",//标识名，可供clearGridByGraphicName(viewer,graphicName)使用
   *   outlineColor: "rgb(255,255,0)",//网格边框颜色，默认rgb(255,255,0)
   *   innerColor: "rgba(255,255,0,0.4)",//网格填充颜色，默认rgba(255,255,0,0.4)
   *   height:0,//网格底部距离地面高度，默认0
   *   extrudedHeight:3,//网格高度，默认0
   * }
   * gs3d.grid.gridDraw.drawGrid(
   *   viewer,
   *   data,
   *   option
   * )
   * ```
   */
  export const drawGrid = (v: any, data: Array<any>, option: any = {}) => {
    viewer = v
    if (!viewer) {
      console.log('请传入viewer')
      return
    }
    let gridList = data
    let outlineInstanceList: Array<any> = []
    let innerInstanceList: Array<any> = []

    gridList.forEach((item: any) => {
      let rectangle
      if (item.geoNumScope) {
        rectangle = Cesium.Rectangle.fromDegrees(item.geoNumScope[1], item.geoNumScope[0], item.geoNumScope[3], item.geoNumScope[2])
      } else if (item.bottom && item.left) {
        rectangle = Cesium.Rectangle.fromDegrees(item.left, item.bottom, item.right, item.top)
      } else {
        rectangle = Cesium.Rectangle.fromDegrees(item.lbLng, item.lbLat, item.rtLng, item.rtLat)
      }
      let id = Math.random()
      let rectangleOutlineInstance = new Cesium.GeometryInstance({
        geometry: new Cesium.RectangleOutlineGeometry({
          rectangle: rectangle,
          height: option.height || 0,
          extrudedHeight: option.extrudedHeight || 0
        }),
        attributes: {
          color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.fromCssColorString(option.outlineColor || 'rgb(255,255,0)') || Cesium.Color.YELLOW)
        },
        id: id + 'gridPickOutline'
      })
      let rectangleInnerInstance = new Cesium.GeometryInstance({
        geometry: new Cesium.RectangleGeometry({
          rectangle: rectangle,
          height: option.height || 0,
          extrudedHeight: option.extrudedHeight || 0
        }),
        attributes: {
          color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.fromCssColorString(option.innerColor || 'rgba(255,255,0,0.4)') || Cesium.Color.YELLOW.withAlpha(0.4))
        },
        id: id + 'gridPickInner'
      })
      outlineInstanceList.push(rectangleOutlineInstance)
      innerInstanceList.push(rectangleInnerInstance)
    })
    let outlineprimitive: any = new Cesium.Primitive({
      geometryInstances: outlineInstanceList, //格子们的instance
      allowPicking: true,
      releaseGeometryInstances: option.releaseGeometryInstances || false,
      appearance: new Cesium.PerInstanceColorAppearance({
        flat: true, //为true 无光照
        translucent: false, //透明配置，false是不透明
        renderState: {
          lineWidth: Math.min(4.0, viewer.scene.maximumAliasedLineWidth)
        }
      })
    })
    let innerprimitive: any = new Cesium.Primitive({
      geometryInstances: innerInstanceList, //格子们的instance
      allowPicking: true,
      releaseGeometryInstances: option.releaseGeometryInstances || false,
      appearance: new Cesium.PerInstanceColorAppearance({
        flat: true, //为true 无光照
        translucent: true, //透明配置，false是不透明
        renderState: {
          lineWidth: Math.min(4.0, viewer.scene.maximumAliasedLineWidth)
        }
      })
    })
    outlineprimitive.graphicName = option.graphicName || ''
    innerprimitive.graphicName = option.graphicName || ''
    viewer.scene.primitives.add(innerprimitive)
    viewer.scene.primitives.add(outlineprimitive)
    gridPrimitive.push({
      graphicName: option.graphicName,
      primitive: [outlineprimitive, innerprimitive]
    })
    return gridPrimitive
  }
  /**
   * @description 清除指定的网格图形
   * @param {any} v - viewer
   * @param {string} graphicName - 需清除图形的标识名
   * @return {*}
   * @example
   * ```ts
   * gs3d.grid.gridDraw.clearGridByGraphicName(viewer, "graphicName")
   * ```
   */
  export const clearGridByGraphicName = (v: any, graphicName: string) => {
    viewer ||= v
    if (!viewer) {
      console.log('请传入viewer')
      return
    }
    gridPrimitive.forEach(item => {
      if (item.graphicName == graphicName) {
        viewer.scene.primitives.remove(item.primitive[0])
        viewer.scene.primitives.remove(item.primitive[1])
      }
    })
    gridPrimitive = gridPrimitive.filter((item, index) => {
      return item.graphicName !== graphicName
    })
  }
  /**
   * @description 清除所有网格图形
   * @param {any} v - viewer
   * @return {*}
   * @example
   * ```ts
   * gs3d.grid.gridDraw.clearAllGrid(viewer)
   * ```
   */
  export const clearAllGrid = (v: any) => {
    viewer = v
    if (!viewer) {
      console.log('请传入viewer')
      return
    }
    gridPrimitive &&
      gridPrimitive[0] &&
      gridPrimitive.forEach((item: any) => {
        viewer.scene.primitives.remove(item.primitive[0])
        viewer.scene.primitives.remove(item.primitive[1])
      })
    gridPrimitive = []
  }
}
