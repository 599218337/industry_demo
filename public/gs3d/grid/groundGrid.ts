/*
 * @Description: <北斗二维平面网格>
 * @version: 1.0.0
 * @Author: YangYuzhuo
 * @Date: 2023-08-29 09:24:27
 * @LastEditors GS3D
 * @LastEditTime 2023-12-19 17:17:59
 * Copyright 2023
 * listeners
 * @Descripttion: <文件用途说明>
 * @FilePath \\geogrid3d\\packages\\sdk\\gs3d\\grid\\groundGrid.ts
 */
import * as Cesium from 'cesium'
// import axios from 'axios'
import { axios } from '../util/axios'
import { levelSize } from './util/levelSize'
export namespace groundGrid {
  export const describe: string = '北斗二维平面网格'
  let viewer: any
  let drawGridOnMapUrl: string = '/engine/iwhereEngine-geosot-3/grid/drawGridOnMap'
  let primitiveLine: any
  let lineOptions = {
    lngLine: [],
    latLine: [],
    lineColor: '#FFA500',
    lineAlpha: 0.5,
    lineWidth: 1
  }

  let primitiveFlat: any
  let flatOptions = {
    rectangle: [115.81, 39.3, 116.82, 40.31],
    lineCount: [120, 60],
    color: '#FFA500',
    lineAlpha: 0.5,
    fillAlpha: 0.0
  }
  /**
   * @description 绘制北斗二维平面网格
   * @param {any} v - viewer
   * @param {string} url - drawGridOnMapUrl接口地址，支持伏羲接口和自研接口
   * @param {string} color - 网格线颜色，默认"#FFA500"
   * @return {*}
   * @example
   * ```ts
   * gs3d.grid.groundGrid.draw(viewer, "/engine/iwhereEngine-geosot-3/grid/drawGridOnMap", "#FFA500")
   * ```
   */
  export const draw = (v: any, url: string, color?: string) => {
    viewer = v
    if (!viewer) {
      console.log('请传入viewer')
      return
    }
    drawGridOnMapUrl = url ? url : drawGridOnMapUrl
    flatOptions.color = color ? color : flatOptions.color
    lineOptions.lineColor = color ? color : lineOptions.lineColor
    const gridOption = getBaseGridsOption()
    let { geo_level } = gridOption

    // 绘制二维网格
    showFlatGrid(false)
    if (geo_level < 10) {
      showLineGrid(false)
      if (geo_level > 8) {
        flatOptions.lineCount = [60, 30]
      } else {
        flatOptions.lineCount = [geo_level * 4, geo_level * 2]
      }
      if (geo_level < 6) {
        flatOptions.lineCount = [geo_level * 2, geo_level]
      } else {
        flatOptions.lineCount = [60, 30]
      }
      const range = viewer.scene.camera.computeViewRectangle()
      const west = (range.west / Math.PI) * 180
      const east = (range.east / Math.PI) * 180
      const north = (range.north / Math.PI) * 180
      const south = (range.south / Math.PI) * 180
      flatOptions.rectangle = [west, south, east, north]
      drawFlatGrid(flatOptions)
    } else {
      showFlatGrid(false)
      // axios({
      //   method: 'GET',
      //   url: drawGridOnMapUrl,
      //   params: gridOption
      // })
      axios
        .aGet({
          url: drawGridOnMapUrl,
          data: gridOption
        })
        .then(res => {
          let lngs = res.data.lngs || res.data.data.lngs // 经度值
          let lats = res.data.lats || res.data.data.lats // 纬度值
          if (!lngs?.length || !lats?.length) {
            return
          }

          // 横线上纬度值相同
          let maxLat = Math.max.apply(null, lats)
          let minLat = Math.min.apply(null, lats)
          let horizontal = lngs.map((lng: number, index: number) => {
            return index % 2 === 1 ? [lng, minLat, lng, maxLat] : [lng, maxLat, lng, minLat]
          })
          var lngLine = [].concat.apply([], horizontal)

          // 纵线上经度值相同
          let vertical = lats.map((lat: number) => {
            let ary = lngs.map((lng: number) => {
              return [lng, lat]
            })
            lngs.reverse()
            return [].concat.apply([], ary)
          })
          var latLine = [].concat.apply([], vertical)

          lineOptions.lngLine = lngLine
          lineOptions.latLine = latLine
          drawLineGrid(lineOptions)
        })
        .catch(err => {
          console.log('请求失败，请检查接口！错误原因：' + err)
        })
    }
  }

  let toggleGroundGridHandler: Function | undefined
  /**
   * @description 二维网格切换显示
   * @param {object} options - 参照example示例说明
   * @example
   * ```ts
   * {
   *   viewer:Cesium.Viewer,//viewer视图
   *   drawGridOnMapUrl:'/engine/iwhereEngine-geosot-3/grid/drawGridOnMap',//网格引擎地址，默认，支持伏羲接口和自研接口
   *   color:'#FFA500',//网格线颜色，默认
   *   toggleFlag:false,//切换二维网格显示标志，默认
   * }
   * ```
   * @return {*}
   */
  export const toggleGroundGrid = (options: { [key: string]: any }) => {
    const { drawGridOnMapUrl = '/engine/iwhereEngine-geosot-3/grid/drawGridOnMap', color = '#FFA500', toggleFlag = false } = options
    if (toggleFlag) {
      toggleGroundGridHandler = () => {
        draw(options.viewer, drawGridOnMapUrl, color)
      }
      options.viewer.camera.moveEnd.addEventListener(toggleGroundGridHandler)
      draw(options.viewer, drawGridOnMapUrl, color)
    } else {
      toggleGroundGridHandler && options.viewer.camera.moveEnd.removeEventListener(toggleGroundGridHandler)
      toggleGroundGridHandler = void 0
      clear()
    }
  }

  /**
   * @description 清除北斗二维平面网格
   * @return {*}
   * @example
   * ```ts
   * gs3d.grid.groundGrid.clear()
   * ```
   */
  export const clear = () => {
    showLineGrid(false)
    showFlatGrid(false)
  }
  const getBaseGridsOption = () => {
    // 获取当前相机高度
    const params = { minx: 0, miny: 0, maxx: 0, maxy: 0 }
    // let url="/engine/iwhereEngine/grid/drawGridOnMap";
    const { height } = viewer.camera.positionCartographic
    // 获取当前相机高度先
    const extend = viewer.camera.computeViewRectangle()
    if (typeof extend === 'undefined') {
      // 2D下会可能拾取不到坐标，extend返回undefined,所以做以下转换
      const { canvas } = viewer.scene
      const upperLeft = new Cesium.Cartesian2(0, 0) // canvas左上角坐标转2d坐标
      const lowerRight = new Cesium.Cartesian2(canvas.clientWidth, canvas.clientHeight) // canvas右下角坐标转2d坐标
      const { ellipsoid } = viewer.scene.globe
      const upperLeft3 = viewer.camera.pickEllipsoid(upperLeft, ellipsoid) // 2D转3D世界坐标
      const lowerRight3 = viewer.camera.pickEllipsoid(lowerRight, ellipsoid) // 2D转3D世界坐标
      const upperLeftCartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(upperLeft3) // 3D世界坐标转弧度
      const lowerRightCartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(lowerRight3) // 3D世界坐标转弧度
      const minx = Cesium.Math.toDegrees(upperLeftCartographic.longitude) // 弧度转经纬度
      const maxx = Cesium.Math.toDegrees(lowerRightCartographic.longitude) // 弧度转经纬度
      const miny = Cesium.Math.toDegrees(lowerRightCartographic.latitude) // 弧度转经纬度
      const maxy = Cesium.Math.toDegrees(upperLeftCartographic.latitude) // 弧度转经纬度

      params.minx = minx
      params.maxx = maxx
      params.miny = miny
      params.maxy = maxy
    } else {
      params.maxx = Cesium.Math.toDegrees(extend.east)
      params.maxy = Cesium.Math.toDegrees(extend.north)
      params.minx = Cesium.Math.toDegrees(extend.west)
      params.miny = Cesium.Math.toDegrees(extend.south)
    }
    const geo_level = levelSize.calculateMapLevel(height)
    // eslint-disable-next-line camelcase
    const grid_size = levelSize.calculateGridRangeWithMapLevel(geo_level)

    // 现场参数
    // let option={lb_lng:params.minx,lb_lat:params.miny,rt_lng: params.maxx, rt_lat: params.maxy,geo_level: geo_level}

    // wuzhen 参数
    const op = {
      lb_lng: params.minx,
      lb_lat: params.miny,
      rt_lng: params.maxx === 180 ? 179.9999 : params.maxx,
      rt_lat: params.maxy,
      geo_level,
      // eslint-disable-next-line camelcase
      grid_size
    }

    return op // 返回屏幕所在经纬度范围
    // return {lb_Lng:params.minx,lb_Lat:params.miny,rtLng: params.maxx, rtLat: params.maxy,geoLevel: geo_level};//返回屏幕所在经纬度范围
  }

  const showLineGrid = (visible: boolean) => {
    if (primitiveLine) {
      primitiveLine.show = visible
    }
  }
  const drawLineGrid = (options: any) => {
    if (primitiveLine) {
      viewer.scene.primitives.remove(primitiveLine)
    }
    let lngLine = Cesium.defaultValue(options.lngLine, [])
    let latLine = Cesium.defaultValue(options.latLine, [])
    let lineColor = Cesium.defaultValue(options.lineColor, '#00FF00')
    let lineWidth = Cesium.defaultValue(options.lineWidth, 1)
    let lineAlpha = Cesium.defaultValue(options.lineAlpha, 0.5)

    let instances = []
    const horizontalInstance = new Cesium.GeometryInstance({
      geometry: new Cesium.GroundPolylineGeometry({
        positions: Cesium.Cartesian3.fromDegreesArray(lngLine),
        width: lineWidth // 设置轮廓线宽度
      }),
      attributes: {
        color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.RED)
      }
    })
    instances.push(horizontalInstance)

    const verticalInstance = new Cesium.GeometryInstance({
      geometry: new Cesium.GroundPolylineGeometry({
        positions: Cesium.Cartesian3.fromDegreesArray(latLine),
        width: lineWidth // 设置轮廓线宽度
      }),
      attributes: {
        color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.RED)
      }
    })
    instances.push(verticalInstance)

    const solidWhite = Cesium.Color.fromCssColorString(lineColor).withAlpha(Number(lineAlpha))
    primitiveLine = new Cesium.GroundPolylinePrimitive({
      geometryInstances: instances,
      appearance: new Cesium.PolylineMaterialAppearance({
        material: Cesium.Material.fromType('Color', {
          color: solidWhite
        })
      })
    })
    viewer.scene.primitives.add(primitiveLine)
  }

  const showFlatGrid = (visible: boolean) => {
    if (primitiveFlat) {
      primitiveFlat.show = visible
    }
  }
  const drawFlatGrid = (options: any) => {
    if (primitiveFlat) {
      viewer.scene.primitives.remove(primitiveFlat)
    }

    if (!options.rectangle) {
      return
    }
    let rectangle = options.rectangle
    let lineCount = Cesium.defaultValue(options.lineCount, [10, 10])
    let ellipsoid = Cesium.defaultValue(options.ellipsoid, Cesium.Ellipsoid.WGS84)
    let color = Cesium.defaultValue(options.color, '#00FF00')
    let lineAlpha = Cesium.defaultValue(options.lineAlpha, 0.5)
    let fillAlpha = Cesium.defaultValue(options.fillAlpha, 0.0)

    const material = Cesium.Material.fromType('Grid', {
      lineCount: new Cesium.Cartesian2(Number(lineCount[0]), Number(lineCount[1])),
      color: Cesium.Color.fromAlpha(Cesium.Color.fromCssColorString(color), Number(lineAlpha)),
      cellAlpha: fillAlpha
    })

    const instance = new Cesium.GeometryInstance({
      geometry: new Cesium.RectangleGeometry({
        ellipsoid: ellipsoid,
        rectangle: Cesium.Rectangle.fromDegrees(Number(rectangle[0]), Number(rectangle[1] < -75 ? -75 : rectangle[1]), Number(rectangle[2]), Number(rectangle[3] > 75 ? 75 : rectangle[3])),
        height: 0.0
      })
    })

    primitiveFlat = new Cesium.GroundPrimitive({
      geometryInstances: instance,
      appearance: new Cesium.MaterialAppearance({
        material: material,
        translucent: false,
        closed: true
      })
    })
    viewer.scene.primitives.add(primitiveFlat)
  }
}
