import * as Cesium from 'cesium'
import * as global from '../global/index'
export namespace bounce {
  export const describe: string = '弹跳'

  let isStopBounce = false

  /**
   * @description 弹跳
   * @msg 备注
   * @param {any} options -配置项
   * @return {*}
   * @author YangYuzhuo
   * @remarks 备注
   *
   * @example
   * ```ts
   * let options = 
   * {
        viewer: viewer,//viewer，可选
        entity: entity,//实体entity，必选
        height: 50,//初始高度，可选，默认entity的自带高度
        maxHeight: 100,//跳动最大高度，可选，默认=(height+50)
        step:0.5 // 跳动速率，可选，默认0.5
      }
   * gs3d.effect.bounce.open(options)
   * ```
   */
  export const open = (options: any) => {
    let { viewer = global?.variable?.viewer, entity, height, maxHeight, step = 0.5 } = options || {}
    if (!entity) {
      console.log('请传入entity')
      return
    }
    isStopBounce = false
    // 跳动反转标记
    let statusForBounce = true
    entity._defaultPosition = entity._position
    let ellipsoid = viewer.scene.globe.ellipsoid
    let cartographic = ellipsoid.cartesianToCartographic(entity._defaultPosition._value)
    let lat = Cesium.Math.toDegrees(cartographic.latitude)
    let lon = Cesium.Math.toDegrees(cartographic.longitude)
    height = height ?? cartographic.height
    maxHeight = maxHeight ?? height + 50
    // 弹跳回调
    entity._position = new Cesium.CallbackProperty(function (time, result) {
      if (isStopBounce) {
        return Cesium.Cartesian3.fromDegrees(lon, lat, cartographic.height)
      }
      if (statusForBounce) {
        height = height - step
        if (height <= 0) {
          height = 0
          statusForBounce = false
        }
      } else {
        height = height + step
        if (height >= maxHeight) {
          height = maxHeight
          statusForBounce = true
        }
      }
      return Cesium.Cartesian3.fromDegrees(lon, lat, height)
    }, false)
  }
  export const close = (options: any) => {
    isStopBounce = true
  }
}
