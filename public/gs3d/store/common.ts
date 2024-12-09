import * as turf from '@turf/turf'
export namespace common {
  export const describe = '通用GIS方法'

  /**
   * @description  获取geometry中心点
   * @param {any} geometry - GeoJSON中的geometry格式
   * @return {*}
   * @example
   * ```ts
   * let center=gs3d.store.common.getCenterGeometry(geometry);
   * ```
   */
  export const getCenterGeometry = (geometry: any): any => {
    let center: any, centerGeometry: any
    center = turf.centerOfMass(geometry)
    centerGeometry = center.geometry
    return centerGeometry
  }
}
