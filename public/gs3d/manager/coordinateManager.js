/* eslint-disable array-callback-return */
/* eslint-disable no-sequences */
/* eslint-disable no-redeclare */
/* eslint-disable eqeqeq */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
/*
 * @Descripttion:
 * @version: 1.0
 * @Author: hejin.gao
 * @Date: 2019-09-20 09:36:14
 * @LastEditors: YangYuzhuo
 * @LastEditTime: 2023-08-29 13:35:50
 */
/**
 * 拾取坐标
 * 坐标转换
 * 基础类
 */

//定义一些常量
var x_PI = (3.14159265358979324 * 3000.0) / 180.0
var PI = 3.1415926535897932384626
var a = 6378245.0
var ee = 0.00669342162296594323

export default class coordinateManager {
  constructor(viewer) {
    this._v = viewer
    /**
     * 相机
     */
    this.c = viewer.camera

    /**
     * 场景
     */
    this.s = viewer.scene

    /**
     * 当前球体
     */
    this.ellipsoid = this.s.globe.ellipsoid
  }

  /**
   * 获取当前相机的坐标
   */
  cameraPosition() {
    let sObj = {}
    let pos = this.c.position
    sObj.x = pos.x
    sObj.y = pos.y
    sObj.z = pos.z

    pos = this.c.positionCartographic
    sObj.longitude = (pos.longitude * 180) / Math.PI
    sObj.latitude = (pos.latitude * 180) / Math.PI
    sObj.height = pos.height

    sObj.heading = (this.c.heading * 180) / Math.PI
    sObj.pitch = (this.c.pitch * 180) / Math.PI
    sObj.roll = (this.c.roll * 180) / Math.PI
    return sObj
  }

  /**
   * 二维坐标，获取椭球体表面的经纬度坐标
   * @param {*} cartesian
   */
  pickEllipsoid(position) {
    let cartesian = this.c.pickEllipsoid(position, this.s.globe.ellipsoid)
    if (!cartesian) {
      return false
    }
    let cartographic = Cesium.Cartographic.fromCartesian(cartesian)
    let lng = Cesium.Math.toDegrees(cartographic.longitude) //经度值
    let lat = Cesium.Math.toDegrees(cartographic.latitude) //纬度值
    return { lng: lng, lat: lat, alt: cartographic.height } //cartographic.height的值始终为零。
  }
  /**
   * 三维坐标，获取地形表面的经纬度高程坐标：
   * @param {*} cartesian
   */
  pickRay(position) {
    let cartesian = this.screenToWorld(position)
    let cartographic = Cesium.Cartographic.fromCartesian(cartesian)
    let lng = Cesium.Math.toDegrees(cartographic.longitude) //经度值
    let lat = Cesium.Math.toDegrees(cartographic.latitude) //纬度值
    //height结果与cartographic.height相差无几，注意：cartographic.height可以为0，也就是说，可以根据经纬度计算出高程。
    let height = this.s.globe.getHeight(cartographic)
    return { lng: lng, lat: lat, alt: height } //height的值为地形高度。
  }
  /**
   * 三维坐标，获取模型表面的经纬度高程坐标（此方法借鉴于官方示例）：
   * @param {*} cartesian
   */
  pick(position) {
    if (this.s.mode !== Cesium.SceneMode.MORPHING) {
      var pickedObject = this.s.pick(position)
      if (this.s.pickPositionSupported && Cesium.defined(pickedObject) && pickedObject.node) {
        var cartesian = this.s.pickPosition(position)
        if (Cesium.defined(cartesian)) {
          var cartographic = Cesium.Cartographic.fromCartesian(cartesian)
          var lng = Cesium.Math.toDegrees(cartographic.longitude)
          var lat = Cesium.Math.toDegrees(cartographic.latitude)
          var height = cartographic.height //模型高度
          return { lng: lng, lat: lat, alt: height }
        }
      } else {
        let cartesian = this.s.pickPosition(position)
        return this.worldToLonlat(cartesian)
      }
    }
  }

  /**
   * 拾取对象
   */
  piObj(position) {
    return this.s.pick(position)
  }

  /**
   * 拾取屏幕坐标（空间坐标）
   */
  piScreen(position) {
    return this.c.pickEllipsoid(position, this.ellipsoid)
  }

  /**
   * 判断坐标
   * 判断地形和模型，0:地形或其他, 1:模型
   * 并返回相应坐标
   * @param {*} cartesian
   */
  piTerrainToModule(position, type = '0') {
    //点击的屏幕坐标
    try {
      if (position == undefined) {
        return false
      }
      let world = this.screenToWorld(position)
      if (world == undefined) {
        return false
      }
      let lon = undefined,
        lat = undefined,
        height = undefined
      let feature = this.piObj(position)
      if (feature == undefined) {
        let WGS84_p = Cesium.Ellipsoid.WGS84.cartesianToCartographic(world)
        if (WGS84_p == undefined) return false
        lon = Cesium.Math.toDegrees(WGS84_p.longitude)
        lat = Cesium.Math.toDegrees(WGS84_p.latitude)
        height = WGS84_p.height
      }
      if (feature != undefined) {
        if (feature instanceof Cesium.Cesium3DTileFeature || feature.id != undefined) {
          //3dtiles
          let cartesian = this.s.pickPosition(position)
          if (cartesian == undefined) return false
          if (Cesium.defined(cartesian)) {
            var cartographic = Cesium.Cartographic.fromCartesian(cartesian)
            if (cartographic.height < 0) return false
            lon = Cesium.Math.toDegrees(cartographic.longitude)
            lat = Cesium.Math.toDegrees(cartographic.latitude)
            height = cartographic.height //模型高度
          }
        }
      }
      //判断是否有值
      if (lon == undefined) return false
      let result = null
      if (type == '1') {
        result = { lon: lon, lat: lat, height: height }
      } else {
        result = Cesium.Cartesian3.fromDegrees(lon, lat, height)
      }
      return result
    } catch (error) {
      // Log.debug(error);
    }
  }

  /**
   * 屏幕高程坐标转经纬度坐标
   * @param {*} position
   */
  screenToLonlat(position) {
    let cartesian = this.screenToWorld(position) //屏幕坐标转世界坐标
    if (!cartesian) return
    let cartographic = Cesium.Cartographic.fromCartesian(cartesian)
    let lng = Cesium.Math.toDegrees(cartographic.longitude) //经度值
    let lat = Cesium.Math.toDegrees(cartographic.latitude) //纬度值
    let height = this.s.globe.getHeight(cartographic)
    return { lon: lng, lat: lat, height: height }
  }

  /**
   * 经纬度转换为世界坐标
   */
  lonlatToWorld(cartesian) {
    return Cesium.Cartesian3.fromDegrees(cartesian.longitude, cartesian.latitude, cartesian.height || 0, this.ellipsoid)
  }

  /**
   * 世界坐标转换为经纬度
   */
  worldToLonlat(cartesian) {
    if (!cartesian) return false
    let cartographic = this.ellipsoid.cartesianToCartographic(cartesian)
    let lat = Cesium.Math.toDegrees(cartographic.latitude)
    let lng = Cesium.Math.toDegrees(cartographic.longitude)
    let height = cartographic.height
    return { lat: lat, lon: lng, alt: height }
  }

  /**
   * 经度转弧度
   */
  latToRadian(degrees) {
    return Cesium.CesiumMath.toRadians(degrees)
  }

  /**
   * 弧度转经度
   */
  radianToLat(radians) {
    return Cesium.CesiumMath.toDegrees(radians)
  }

  /**
   * 屏幕坐标转世界坐标
   */
  screenToWorld(position) {
    return this.s.globe.pick(this.c.getPickRay(position), this.s)
  }

  /**
   * 地表坐标
   * @author hejin 2019-11-26
   * @param {[Cesium.Cartographic.fromDegrees(87.0, 28.0)]} cartographic  弧度值
   */
  worldToSurface = cartographic => {
    let me = this
    return new Promise((resolve, reject) => {
      if (this._v.terrainProvider instanceof Cesium.EllipsoidTerrainProvider) {
        resolve(0)
      } else {
        var promise = Cesium.sampleTerrainMostDetailed(this._v.terrainProvider, [cartographic])
        promise.then(updatedPositions => {
          // height = updatedPositions[0].height.toFixed(2);
          let elevation = updatedPositions[0].height
          resolve(elevation)
        })
      }
    })
  }

  /**
   * 世界坐标转屏幕坐标
   */
  worldToScreen(cartesian) {
    return Cesium.SceneTransforms.wgs84ToWindowCoordinates(this.s, cartesian)
  }

  /**
   * 世界坐标转地理坐标(经纬度)
   */
  worldToGeom(cartesian) {
    let cartographic = this.ellipsoid.cartesianToCartographic(cartesian)
    return {
      longitude: Cesium.Math.toDegrees(cartographic.longitude),
      latitude: Cesium.Math.toDegrees(cartographic.latitude),
      height: cartographic.height
    }
  }

  /***
   * 地理坐标(经纬度)转世界坐标
   */
  geomToWorld(position) {
    return Cesium.Cartesian3.fromDegrees(position.longitude, position.latitude, position.height)
  }

  /**************************
   *
   *       其他转换
   *
   * ***********************/

  /**
   * 百度坐标系 (BD-09) 与 火星坐标系 (GCJ-02)的转换
   * 即 百度 转 谷歌、高德
   * @param bd_lon
   * @param bd_lat
   * @returns {*[]}
   */
  bd09togcj02(bd_lon, bd_lat) {
    var x_pi = (3.14159265358979324 * 3000.0) / 180.0
    var x = bd_lon - 0.0065
    var y = bd_lat - 0.006
    var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi)
    var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi)
    var gg_lng = z * Math.cos(theta)
    var gg_lat = z * Math.sin(theta)
    return [gg_lng, gg_lat]
  }

  /**
   * 火星坐标系 (GCJ-02) 与百度坐标系 (BD-09) 的转换
   * 即谷歌、高德 转 百度
   * @param lng
   * @param lat
   * @returns {*[]}
   */
  gcj02tobd09(lng, lat) {
    var z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * x_PI)
    var theta = Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * x_PI)
    var bd_lng = z * Math.cos(theta) + 0.0065
    var bd_lat = z * Math.sin(theta) + 0.006
    return [bd_lng, bd_lat]
  }

  /**
   * WGS84转GCj02
   * @param lng
   * @param lat
   * @returns {*[]}
   */
  wgs84togcj02(lng, lat) {
    if (this.out_of_china(lng, lat)) {
      return [lng, lat]
    } else {
      var dlat = this.transformlat(lng - 105.0, lat - 35.0)
      var dlng = this.transformlng(lng - 105.0, lat - 35.0)
      var radlat = (lat / 180.0) * PI
      var magic = Math.sin(radlat)
      magic = 1 - ee * magic * magic
      var sqrtmagic = Math.sqrt(magic)
      dlat = (dlat * 180.0) / (((a * (1 - ee)) / (magic * sqrtmagic)) * PI)
      dlng = (dlng * 180.0) / ((a / sqrtmagic) * Math.cos(radlat) * PI)
      var mglat = lat + dlat
      var mglng = lng + dlng
      return [mglng, mglat]
    }
  }

  /**
   * GCJ02 转换为 WGS84
   * @param lng
   * @param lat
   * @returns {*[]}
   */
  gcj02towgs84(lng, lat) {
    if (this.out_of_china(lng, lat)) {
      return [lng, lat]
    } else {
      var dlat = this.transformlat(lng - 105.0, lat - 35.0)
      var dlng = this.transformlng(lng - 105.0, lat - 35.0)
      var radlat = (lat / 180.0) * PI
      var magic = Math.sin(radlat)
      magic = 1 - ee * magic * magic
      var sqrtmagic = Math.sqrt(magic)
      dlat = (dlat * 180.0) / (((a * (1 - ee)) / (magic * sqrtmagic)) * PI)
      dlng = (dlng * 180.0) / ((a / sqrtmagic) * Math.cos(radlat) * PI)
      let mglat = lat + dlat
      let mglng = lng + dlng
      return [lng * 2 - mglng, lat * 2 - mglat]
    }
  }

  transformlat(lng, lat) {
    var ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng))
    ret += ((20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0) / 3.0
    ret += ((20.0 * Math.sin(lat * PI) + 40.0 * Math.sin((lat / 3.0) * PI)) * 2.0) / 3.0
    ret += ((160.0 * Math.sin((lat / 12.0) * PI) + 320 * Math.sin((lat * PI) / 30.0)) * 2.0) / 3.0
    return ret
  }

  transformlng(lng, lat) {
    var ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng))
    ret += ((20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0) / 3.0
    ret += ((20.0 * Math.sin(lng * PI) + 40.0 * Math.sin((lng / 3.0) * PI)) * 2.0) / 3.0
    ret += ((150.0 * Math.sin((lng / 12.0) * PI) + 300.0 * Math.sin((lng / 30.0) * PI)) * 2.0) / 3.0
    return ret
  }

  /**
   * 判断是否在国内，不在国内则不做偏移
   * @param lng
   * @param lat
   * @returns {boolean}
   */
  out_of_china(lng, lat) {
    return lng < 72.004 || lng > 137.8347 || lat < 0.8293 || lat > 55.8271 || false
  }
}
