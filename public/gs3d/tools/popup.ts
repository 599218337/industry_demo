import * as Cesium from 'cesium'
import CesiumPopup from './CesiumPopup'
import { common } from '../store/common'
import './popup.css'
export namespace popup {
  export const describe: string = '气泡窗'
  let popupDiv: any
  /**
   * @description 创建气泡窗
   * @param {any} options - 配置项，详见示例
   * @return {*}
   * @example
   * ```ts
   * let options = {
   *   viewer,
   *   position: Cesium.Cartesian3.fromDegrees(125.3247893, 43.8868593, 10),//支持geojson、geometry、Cartesian3
   *   data: {
   *     title: "资产统计",
   *     content: [
   *       { label: "提升前价值", value: 1000 },
   *       { label: "提升后价值", value: 10000 }
   *     ]
   *   }
   *   openCallback: () => {
   *     console.log("弹窗被打开");
   *   },
   *   closeCallback: () => {
   *     console.log("弹窗被关闭")
   *   }
   * }
   * gs3d.tools.popup.createPopup(options)
   * ```
   */
  export const createPopup = (options: any) => {
    let { viewer, position, data = {}, openCallback = () => {}, closeCallback = () => {} } = options || {}
    if (!viewer || !position) {
      console.log('【createPopup】缺失viewer或position！')
      return
    }
    //geojson
    if (position.features && position.features.length && position.features[position.features.length - 1].geometry) {
      let center: any = common.getCenterGeometry(position.features[position.features.length - 1].geometry)
      let coordinates: [number, number] = center.coordinates
      position = Cesium.Cartesian3.fromDegrees(...coordinates, 10)
    }
    //geometry
    if (position.type && position.geometry) {
      let center: any = common.getCenterGeometry(position.geometry)
      let coordinates: [number, number] = center.coordinates
      position = Cesium.Cartesian3.fromDegrees(...coordinates, 10)
    }
    //Cartesian3
    var html = ''
    data.content &&
      data.content.forEach((item: any) => {
        html += '<div>' + item.label + ': ' + item.value + '</div>' + '<br>'
      })
    popupDiv = new (CesiumPopup as any)({})
      .setPosition(position)
      .setHTML(html)
      .addTo(viewer)
      .setTitle(data.title || '标题')
    popupDiv.on('open', function () {
      openCallback('open')
    })
    popupDiv.on('close', function () {
      closeCallback('close')
    })
  }
  /**
   * @description 关闭气泡窗
   * @return {*}
   * @example
   * ```ts
   * gs3d.tools.popup.closePopup()
   * ```
   */
  export const closePopup = () => {
    popupDiv && popupDiv.closeHander()
  }
}
