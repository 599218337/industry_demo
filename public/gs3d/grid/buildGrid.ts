/*
 * @Description: <三维建筑网格绘制(支持绘制、显隐、填充盒显隐、网格线显隐)>
 * @version: 1.0.0
 * @Author: YangYuzhuo
 * @Date: 2023-08-28 09:24:27
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2024-04-11 20:10:33
 * Copyright 2023
 * listeners
 * @Descripttion: <文件用途说明>
 * @FilePath \\geogrid3d\\packages\\sdk\\gs3d\\grid\\buildGrid.ts
 */

import * as Cesium from 'cesium'
export namespace buildGrid {
  export const describe: string = '三维建筑网格'
  let viewer: any = null
  let _boxs: Array<any> = []
  let _outlines: Array<any> = []
  let _options: any = null

  let _show: boolean = false
  let _boxShow: boolean = true
  let _outlineShow: boolean = true

  let _floor: any = null
  let _floors: Array<any> = []

  /**
   * @description 绘制三维建筑网格
   * @param {any} options - 绘制的配置项
   * @param {any} v - viewer
   * @return {*}
   * @example
   * ```ts
   * let options = {
   *       height: 79.76,        // 楼高
   *       floor: 21,            // 楼层数
   *       lineColor: "#FFA500", // 边线色
   *       lineAlpha: 0.5,
   *       outlineShow: true,    // 边线默认值
   *       fillClear: "#0000ff", // 填充色
   *       fillAlpha: 0.05,       // 填充色透明度
   *       boxShow: true,        // 填充默认值
   *       elevation: 0,         // 高程
   *       geometries: [{        // GEO信息 [{ id: String, rectangle:[west, south, east, north] }]
   *           id: geo.geoNum4,
   *           rectangle: [geo.geoNumScope[1], geo.geoNumScope[0], geo.geoNumScope[3], geo.geoNumScope[2]]
   *         }],
   *     }
   * gs3d.grid.buildGrid.draw(options, viewer)
   * ```
   */
  export const draw = (options: any, v: any) => {
    // 数据格式
    viewer = v
    if (!viewer) {
      console.log('请传入viewer')
      return
    }
    let geometries = Cesium.defaultValue(options.geometries, [])
    if (geometries && geometries.length === 0) {
      console.log('当前网格数据为空！')
      return
    }
    const height = Cesium.defaultValue(options.height, 24)
    const floor = Cesium.defaultValue(options.floor, 6)
    const elevation = Cesium.defaultValue(options.elevation, 0)
    const lineColor = Cesium.defaultValue(options.lineColor, '#00FF00')
    const lineAlpha = Cesium.defaultValue(options.lineAlpha, 0.75) // 不起作用
    const fillClear = Cesium.defaultValue(options.fillClear, '#00FF00')
    const fillAlpha = Cesium.defaultValue(options.fillAlpha, 0)
    const ellipsoid = Cesium.defaultValue(options.ellipsoid, Cesium.Ellipsoid.WGS84)
    _boxShow = Cesium.defaultValue(options.boxShow, true)
    _outlineShow = Cesium.defaultValue(options.outlineShow, true)

    const floorHeigh = height / floor

    _options = options
    _options['floorHeigh'] = floorHeigh
    _floor = floor

    const solidWhite = Cesium.Color.fromCssColorString(lineColor).withAlpha(Number(lineAlpha))
    const fillColor = Cesium.Color.fromCssColorString(fillClear).withAlpha(Number(fillAlpha))
    for (var i = 0; i < floor; i++) {
      let instances: any = [],
        outlineInstances: any = []

      geometries.forEach((geo: any) => {
        // const floorHeigh = height / floor
        // 楼层起矢高度
        let _height = elevation + floorHeigh * i
        // 平均层高
        let extrudedHeight = floorHeigh + _height

        const rectangle = Cesium.Rectangle.fromDegrees(geo.rectangle[0], geo.rectangle[1], geo.rectangle[2], geo.rectangle[3])
        let geometry = new Cesium.RectangleGeometry({
          ellipsoid: ellipsoid,
          rectangle: rectangle,
          height: _height,
          vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
          extrudedHeight: extrudedHeight
        })
        // 立体网格盒子
        const instance = new Cesium.GeometryInstance({
          id: 'box_' + i + '_' + geo.id,
          geometry: geometry,
          attributes: {
            color: Cesium.ColorGeometryInstanceAttribute.fromColor(fillColor)
          }
        })
        instances.push(instance)
        // 立体网格盒子外边框
        const outlineInstance = new Cesium.GeometryInstance({
          id: 'outline_' + i + '_' + geo.id,
          geometry: new Cesium.RectangleOutlineGeometry({
            ellipsoid: ellipsoid,
            rectangle: rectangle,
            height: _height,
            extrudedHeight: extrudedHeight
          }),
          attributes: {
            color: Cesium.ColorGeometryInstanceAttribute.fromColor(solidWhite)
          }
        })
        outlineInstances.push(outlineInstance)
      })

      let box = new Cesium.Primitive({
        geometryInstances: instances,
        appearance: new Cesium.PerInstanceColorAppearance({
          // 为每个instance着色
          translucent: true,
          closed: false
        }),
        show: _boxShow
      })
      _boxs.push(box)
      viewer.scene.primitives.add(box)

      let outline = new Cesium.Primitive({
        geometryInstances: outlineInstances,
        appearance: new Cesium.PerInstanceColorAppearance({
          flat: true,
          translucent: true,
          renderState: {
            lineWidth: Math.min(1.0, viewer.scene.maximumAliasedLineWidth)
          }
        }),
        show: _outlineShow
      })
      _outlines.push(outline)
      viewer.scene.primitives.add(outline)
    }
    _show = true
  }

  /**
   * @description 清除三维建筑网格
   * @return {*}
   * @example
   * ```ts
   * gs3d.grid.buildGrid.clear()
   * ```
   */
  export const clear = () => {
    _show = false
    _boxs.length > 0 &&
      _boxs.forEach((_primitive: any) => {
        viewer.scene.primitives.remove(_primitive)
      })
    _outlines.length > 0 &&
      _outlines.forEach((_primitive: any) => {
        viewer.scene.primitives.remove(_primitive)
      })
    _boxs = []
    _outlines = []
    _floors.length = 0
  }
  /**
   * @description  三维建筑网格显隐
   * @return {*}
   * @example
   * ```ts
   * gs3d.grid.buildGrid.changeShow()
   * ```
   */
  export const changeShow = () => {
    _floors.length = 0
    _show = !_show
    _boxs.length > 0 &&
      _boxShow &&
      _boxs.forEach((primitive, n) => {
        let _t = _show ? n : _boxs.length - n
        setTimeout(() => {
          primitive.show = _show && _boxShow
        }, 10 * _t)
      })
    _outlines.length > 0 &&
      _outlineShow &&
      _outlines.forEach((primitive, n) => {
        let _t = _show ? n : _outlines.length - n
        setTimeout(() => {
          primitive.show = _show && _outlineShow
        }, 10 * _t)
      })
  }
  /**
   * @description 三维建筑网格填充盒显隐
   * @return {*}
   * @example
   * ```ts
   * gs3d.grid.buildGrid.changeBoxShow()
   * ```
   */
  export const changeBoxShow = () => {
    _boxShow = !_boxShow
    let isFloors = _floors.length > 0
    _boxs.length > 0 &&
      _boxs.forEach((primitive, n) => {
        if (isFloors) {
          if (_floors.includes(n)) {
            primitive.show = _boxShow
          }
        } else {
          primitive.show = _boxShow
        }
      })
  }
  /**
   * @description 三维建筑网格边框线显隐
   * @return {*}
   * @example
   * ```ts
   * gs3d.grid.buildGrid.changeOutlineShow()
   * ```
   */
  export const changeOutlineShow = () => {
    _outlineShow = !_outlineShow
    let isFloors = _floors.length > 0
    _outlines.length > 0 &&
      _outlines.forEach((primitive, n) => {
        if (isFloors) {
          if (_floors.includes(n)) {
            primitive.show = _outlineShow
          }
        } else {
          primitive.show = _outlineShow
        }
      })
  }
}
