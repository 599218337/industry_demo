/*
 * @Description: <文件用途说明>
 * @version: 1.0.0
 * @Author: GS3D
 * @Date: 2023-09-07 11:11:54
 * @LastEditors: GS3D
 * @LastEditTime: 2023-10-23 13:55:49
 * Copyright 2023
 * listeners
 * @Descripttion: <文件用途说明>
 * @FilePath: \\geogrid3d\\packages\\sdk\\gs3d\\manager\\drawManager.ts
 */
/**
 * 封装绘制功能
 * 点线面矩形
 */

/* eslint-disable */
import * as Cesium from 'cesium'
import DrawDynamic from '../core/drawDynamic'
class drawManager {
  drawDynamic: any
  constructor(core: any) {
    this.drawDynamic = new DrawDynamic(core)
  }
  remove() {
    if (this.drawDynamic == null) return false
    this.drawDynamic.remove()
    // this.drawDynamic = null;
  }
  /**
   * 拾取点
   */
  pickPoint(fn: any) {
    let _self = this
    _self.drawDynamic.pickPoint((position: any) => {
      if (!position) {
        typeof fn == 'function' && fn(false)
        return
      }
      var wgs84_point = _self.drawDynamic.Cartesian3_to_WGS84({
        x: position.x,
        y: position.y,
        z: position.z
      })
      if (typeof fn == 'function') fn(wgs84_point)
    })
  }
  //点
  drawPoint(fn: any, option = {}) {
    let _self = this
    _self.drawDynamic.drawPoint(function (positions: Array<any>, entities: any) {
      var wgs84_positions = []
      for (var i = 0; i < positions.length; i++) {
        var wgs84_point = _self.drawDynamic.Cartesian3_to_WGS84({
          x: positions[i].x,
          y: positions[i].y,
          z: positions[i].z
        })
        wgs84_positions.push(wgs84_point)
      }
      if (typeof fn == 'function') fn(wgs84_positions, entities)
    }, option)
  }
  //线
  drawLine(fn: any, option = { clampToGround: true, material: Cesium.Color.CHARTREUSE, width: 2 }) {
    let _self = this
    this.drawDynamic.drawLineString(function (positions: Array<any>, entities: any) {
      var wgs84_positions = []
      for (var i = 0; i < positions.length; i++) {
        var wgs84_point = _self.drawDynamic.Cartesian3_to_WGS84({
          x: positions[i].x,
          y: positions[i].y,
          z: positions[i].z
        })
        wgs84_positions.push(wgs84_point)
      }
      if (typeof fn == 'function') fn(wgs84_positions, entities)
    }, option)
  }
  //圆
  drawCircle(fn: any) {
    this.drawDynamic.circleDraw(function (positions: any, entities: any, center: any, radius: any) {
      if (typeof fn == 'function') fn(positions, entities, center, radius)
    })
  }
  //矩形
  drawRect(fn: any, optins = {}) {
    let _self = this
    _self.drawDynamic.drawRectangle(function (positions: Array<any>, entities: any) {
      var wgs84_positions = []
      for (var i = 0; i < positions.length; i++) {
        var wgs84_point = _self.drawDynamic.Cartesian3_to_WGS84({
          x: positions[i].x,
          y: positions[i].y,
          z: positions[i].z
        })
        wgs84_positions.push(wgs84_point)
      }
      if (typeof fn == 'function') fn(wgs84_positions, entities)
    }, optins)
  }
  //多边形
  drawPolygon(fn: any, optins = {}) {
    let _self = this
    _self.drawDynamic.drawPolygon(function (positions: Array<any>, entities: any) {
      var wgs84_positions = []
      for (var i = 0; i < positions.length; i++) {
        var wgs84_point = _self.drawDynamic.Cartesian3_to_WGS84({
          x: positions[i].x,
          y: positions[i].y,
          z: positions[i].z
        })
        wgs84_positions.push(wgs84_point)
      }
      if (typeof fn == 'function') fn(wgs84_positions, entities)
    }, optins)
  }
  // 绘制视网
  drawSketch(fn: any) {
    let _self = this
    _self.drawDynamic.drawSketch(function (positions: Array<any>, entities: any) {
      var wgs84_positions = []
      for (var i = 0; i < positions.length; i++) {
        var wgs84_point = _self.drawDynamic.Cartesian3_to_WGS84({
          x: positions[i].x,
          y: positions[i].y,
          z: positions[i].z
        })
        wgs84_positions.push(wgs84_point)
      }
      if (typeof fn == 'function') fn(wgs84_positions, entities)
    })
  }
  // 绘制视锥
  drawFrustum(fn: any) {
    let _self = this
    _self.drawDynamic.drawFrustum(function (positions: Array<any>, entities: any, frustum: any) {
      var wgs84_positions = []
      for (var i = 0; i < positions.length; i++) {
        var wgs84_point = _self.drawDynamic.Cartesian3_to_WGS84({
          x: positions[i].x,
          y: positions[i].y,
          z: positions[i].z
        })
        wgs84_positions.push(wgs84_point)
      }
      if (typeof fn == 'function') fn(wgs84_positions, entities, frustum)
    })
  }
}
export default drawManager
