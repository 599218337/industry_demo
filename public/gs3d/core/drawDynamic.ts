/*
 * @Description: <动态绘制图形，返回坐标点>
 * @version: 1.0.0
 * @Author: GS3D
 * @Date: 2023-09-07 11:12:46
 * @LastEditors GS3D
 * @LastEditTime 2023-12-11 16:32:21
 * Copyright 2023
 * listeners
 * @Descripttion: <文件用途说明>
 * @FilePath \\geogrid3d\\packages\\sdk\\gs3d\\core\\drawDynamic.ts
 */

/* eslint-disable */
import * as Cesium from 'cesium'
import Entitys from './entitys'
import { mouseManager } from '../manager/mouseManager'
import { common } from '../util/common'
import red_position_2 from '../gs3d-assets/image/red_position.png'

export default class DrawDynamic {
  viewer: Cesium.Viewer & { [key: string]: any }
  removeObj: Array<any>
  entitys: any
  mouseManager: any
  _resultTip: any
  handleArr: Array<any>
  circle: any
  shape: any
  bufferEntity: any
  removeImageryLayers: any
  constructor(core: any) {
    this.viewer = core
    this.removeObj = []
    /**
     * 实体
     * 创建绘制提示
     */
    this.entitys = new Entitys(core)
    this.mouseManager = new mouseManager(core)
    this._resultTip = this.entitys.createMsgTip()
    this.handleArr = []
  }
  /**
   * 删除
   */
  remove() {
    if (this.handleArr.length > 0) {
      this.handleArr.map(handle => {
        handle.destroy()
      })
      this.entitys.remove(this._resultTip)
      this._resultTip = null
      this.handleArr = []
    }
    if (this.removeObj.length != 0) {
      for (let i in this.removeObj) {
        this.viewer.entities.remove(this.removeObj[i])
      }
      this.removeObj = []
    }
  }
  /**
   * 清除事件
   */
  removeHandle() {
    if (this.handleArr.length > 0) {
      this.handleArr.map(handle => {
        handle.destroy()
      })
      this.entitys.remove(this._resultTip)
      this._resultTip = null
      this.handleArr = []
    }
  }

  pickHandler(tip = '左键创建, 右键结束') {
    var _this = this
    _this.removeHandle()
    var handler = new Cesium.ScreenSpaceEventHandler(_this.viewer.scene.canvas)
    if (!this._resultTip) this._resultTip = this.entitys.createMsgTip()
    this.handleArr.push(handler)

    return new Promise((resolve, reject) => {
      try {
        handler.setInputAction(function (_m: any) {
          _this.removeHandle()
          resolve(_m.position)
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

        handler.setInputAction((_m: any) => {
          let cartesian = null
          var pickObj = _this.mouseManager.piObj(_m.endPosition)
          if (pickObj) {
            cartesian = _this.mouseManager.pick(_m.endPosition)
          } else {
            // cartesian = _this.mouseManager.screenToWorld(_m.endPosition)
            cartesian = _this.getCatesian3FromPX(_m.endPosition)
          }
          _this.entitys.showTip(_this._resultTip, true, cartesian, tip)
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

        handler.setInputAction((_m: any) => {
          _this.removeHandle()
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
      } catch (error) {
        console.error('pick handler: ', error)
      }
    })
  }

  pickPoint(callback: any) {
    try {
      var _this = this
      _this.removeHandle()

      var handler = new Cesium.ScreenSpaceEventHandler(_this.viewer.scene.canvas)
      if (!this._resultTip) this._resultTip = this.entitys.createMsgTip()
      this.handleArr.push(handler)

      //单击鼠标左键画点
      handler.setInputAction(function (movement: any) {
        let cartesian = null
        var pickObj = _this.mouseManager.piObj(movement.position)
        if (pickObj) {
          // 拾取模型
          cartesian = _this.viewer.scene.pickPosition(movement.position)
        } else {
          // 拾取地面
          cartesian = _this.mouseManager.screenToWorld(movement.position)
          cartesian = _this.getCatesian3FromPX(movement.position)
        }
        if (Cesium.defined(cartesian)) {
          _this.removeHandle()
          callback(cartesian)
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

      //鼠标移动
      handler.setInputAction(function (movement: any) {
        let cartesian = null
        var pickObj = _this.mouseManager.piObj(movement.endPosition)
        if (pickObj) {
          // 拾取模型
          cartesian = _this.viewer.scene.pickPosition(movement.endPosition)
        } else {
          // 拾取地面
          // cartesian = _this.mouseManager.screenToWorld(movement.endPosition)
          cartesian = _this.getCatesian3FromPX(movement.endPosition)
        }
        _this.entitys.showTip(_this._resultTip, true, cartesian, '左键创建, 右键结束')
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

      //单击鼠标右键结束画点
      handler.setInputAction(function (movement: any) {
        _this.removeHandle()
        callback(false)
      }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
    } catch (error) {
      // Log.debug(error);
    }
  }

  //画点
  drawPoint(callback: any, option: any) {
    try {
      var _this = this
      _this.removeHandle()
      //坐标存储
      var positions: Array<any> = []

      var handler = new Cesium.ScreenSpaceEventHandler(_this.viewer.scene.canvas)
      if (!this._resultTip) this._resultTip = this.entitys.createMsgTip()
      this.handleArr.push(handler)
      //单击鼠标左键画点
      handler.setInputAction(function (movement: any) {
        let cartesian: any = null
        var pickObj = _this.mouseManager.piObj(movement.position)
        // if (pickObj) {
        //     // 拾取模型
        //     cartesian = _this.viewer.scene.pickPosition(movement.position);
        // } else
        if (_this.viewer.terrainProvider instanceof Cesium.EllipsoidTerrainProvider) {
          //拾取地形平面，不带高度
          cartesian = _this.viewer.scene.camera.pickEllipsoid(movement.position, _this.viewer.scene.globe.ellipsoid)
        } else {
          // 拾取地面
          // cartesian = _this.mouseManager.screenToWorld(movement.position)
          cartesian = _this.getCatesian3FromPX(movement.position)
        }
        if (Cesium.defined(cartesian)) {
          let r = common.getUuid(11)
          positions.push(cartesian)
          let e = {
            id: r,
            entityId: r,
            graphicName: option.graphicName,
            position: cartesian
          }
          let entity: any = _this.viewer.entities.add(e)
          let position = _this.mouseManager.worldToLonlat(cartesian)
          if (option.showLabel) {
            entity.label = _this.entitys.getLabel(
              '经度:' + position.lon.toFixed(6) + '°\n  纬度' + position.lat.toFixed(6) + '°\n 高度:' + position.alt.toFixed(2) + ' m',
              new Cesium.Cartesian2(0, -15)
            )
          }
          !option.showImage && (entity.point = _this.entitys.getPoint())
          if (entity.point) {
            entity.point.pixelSize = option.hasOwnProperty('pixelSize') ? option.pixelSize : 1
            entity.point.color = option.hasOwnProperty('color') ? option.color : Cesium.Color.CHARTREUSE
            entity.point.outlineWidth = option.outlineWidth || 1.0
            entity.point.outlineColor = option.outlineColor || Cesium.Color.CHARTREUSE
            if (option?.scaleByDistance) {
              // entity.point.scaleByDistance = new Cesium.NearFarScalar(0, 0, 1, 0)
              entity.point.scaleByDistance = new Cesium.NearFarScalar(...option?.scaleByDistance)
            }
            if (option?.translucencyByDistance) {
              // entity.point.translucencyByDistance = new Cesium.NearFarScalar(0, 0, 1, 0)
              entity.point.translucencyByDistance = new Cesium.NearFarScalar(...option?.translucencyByDistance)
            }
            if (option?.distanceDisplayCondition) {
              entity.point.distanceDisplayCondition = new Cesium.DistanceDisplayCondition(option?.distanceDisplayCondition[0] || 0, option?.distanceDisplayCondition[1] || Number.MAX_VALUE)
            }
            entity.point.disableDepthTestDistance = option?.disableDepthTestDistance ?? Number.POSITIVE_INFINITY
          }
          if (option.showImage) {
            let options = {
              image: option?.imageOption?.url || red_position_2,
              width: option?.imageOption?.width || 40,
              height: option?.imageOption?.height || 40,
              disableDepthTestDistance: option?.disableDepthTestDistance ?? Number.POSITIVE_INFINITY,
              distanceDisplayCondition: new Cesium.DistanceDisplayCondition(option?.imageOption?.distance?.near || 0, option?.imageOption?.distance?.far || Number.MAX_VALUE)
            }
            entity.billboard = options
          }
          _this.removeObj.push(entity)
        }
        if (!option.isContinuous) {
          //不连续
          _this.removeHandle()
          callback(positions, _this.removeObj)
        }
        // if (option.isContinuous && option.isPerCallBack) {
        //   //当连续绘制时，每绘制一个点就返回这个点
        //   callback([positions[positions.length - 1]], [_this.removeObj[_this.removeObj.length - 1]])
        // }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
      //鼠标移动
      handler.setInputAction(function (movement: any) {
        let cartesian = null
        var pickObj = _this.mouseManager.piObj(movement.endPosition)
        // if (pickObj) {
        //     // 拾取模型
        //     cartesian = _this.viewer.scene.pickPosition(movement.endPosition);
        // } else
        if (_this.viewer.terrainProvider instanceof Cesium.EllipsoidTerrainProvider) {
          //拾取地形平面，不带高度
          cartesian = _this.viewer.scene.camera.pickEllipsoid(movement.endPosition, _this.viewer.scene.globe.ellipsoid)
        } else {
          // 拾取地面
          // cartesian = _this.mouseManager.screenToWorld(movement.endPosition)
          cartesian = _this.getCatesian3FromPX(movement.endPosition)
        }
        // var cartesian = _this.mouseManager.screenToWorld(movement.endPosition);
        // var cartesian = null;
        // if( _this.viewer.terrainProvider instanceof Cesium.EllipsoidTerrainProvider ) {
        //     // 拾取地形平面，不带高度
        //     cartesian = _this.viewer.scene.camera.pickEllipsoid(movement.endPosition, _this.viewer.scene.globe.ellipsoid);
        // } else {
        //     // 拾取地面，带高度
        //     cartesian = _this.mouseManager.piTerrainToModule(movement.endPosition);
        // }
        _this.entitys.showTip(_this._resultTip, true, cartesian, '左键创建, 右键结束')
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
      //单击鼠标右键结束画点
      handler.setInputAction(function (movement: any) {
        // if (option.isContinuous && option.isPerCallBack) {
        //   _this.removeHandle()
        //   return
        // }
        _this.removeHandle()
        callback(positions, _this.removeObj)
      }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
    } catch (error) {
      // Log.debug(error);
    }
  }

  //画线
  drawLineString(callback: any, option: any) {
    var _this = this
    _this.removeHandle()
    let eid = common.getUuid(11)
    var PolyLinePrimitive: any = (function () {
      function _(this: any, positions: any) {
        this.options = {
          id: eid,
          entityId: eid,
          graphicName: option.graphicName,
          polyline: {
            show: true,
            positions: [],
            width: option.hasOwnProperty('width') ? option.width : 2,
            clampToGround: option?.clampToGround ?? false,
            material: option.hasOwnProperty('material') ? option.material : Cesium.Color.CHARTREUSE,
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(option?.distanceDisplayCondition[0] || 0, option?.distanceDisplayCondition[1] || Number.MAX_VALUE)
          }
        }
        this.positions = positions
        this._init()
      }

      _.prototype._init = function () {
        var _self = this
        var _update = function () {
          return _self.positions
        }
        //实时更新polyline.positions
        this.options.polyline.positions = new Cesium.CallbackProperty(_update, false)
        _this.removeObj.push(_this.viewer.entities.add(this.options))
      }
      return _
    })()

    var handler = new Cesium.ScreenSpaceEventHandler(_this.viewer.scene.canvas)
    if (!this._resultTip) this._resultTip = this.entitys.createMsgTip()
    this.handleArr.push(handler)
    var positions: Array<any> = []
    var poly: any = undefined
    //鼠标左键单击画点
    handler.setInputAction(function (movement: any) {
      // var cartesian = _this.mouseManager.screenToWorld(movement.position);
      var cartesian: any = _this.getCatesian3FromPX(movement.position)
      if (positions.length == 0) {
        positions.push(cartesian.clone())
      }
      positions.push(cartesian)
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
    //鼠标移动
    handler.setInputAction(function (movement: any) {
      // var cartesian = _this.mouseManager.screenToWorld(movement.endPosition);
      var cartesian = _this.getCatesian3FromPX(movement.endPosition)
      if (positions.length >= 2) {
        if (!Cesium.defined(poly)) {
          poly = new PolyLinePrimitive(positions)
        } else {
          if (cartesian && cartesian != undefined) {
            positions.pop()
            // cartesian.y += (1 + Math.random());
            positions.push(cartesian)
          }
          _this.entitys.showTip(_this._resultTip, true, cartesian, '鼠标右键结束,平板长按结束')
        }
      } else {
        _this.entitys.showTip(_this._resultTip, true, cartesian, '点击绘制')
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
    //单击鼠标右键结束画线
    handler.setInputAction(function (movement: any) {
      _this.removeHandle()
      positions.pop()
      callback(positions, _this.removeObj)
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
  }

  //画面
  drawPolygon(callback: any, params: any = {}) {
    var _this = this
    var PolygonPrimitive: any = (function () {
      function _(this: any, positions: any) {
        let r = common.getUuid(11)
        this.options = {
          id: r,
          entityId: r,
          graphicName: params.graphicName,
          name: '多边形',
          polygon: {
            hierarchy: [],
            // perPositionHeight: true,
            fill: params.hasOwnProperty('fill') ? params.fill : true,
            outline: params.hasOwnProperty('outline') ? params.outline : true,
            outlineWidth: params.outlineWidth ?? 10.0, //无效
            outlineColor: params.outlineColor || Cesium.Color.CHARTREUSE,
            material: params.material || Cesium.Color.fromCssColorString('#7FFF00').withAlpha(0.5),
            perPositionHeight: params.hasOwnProperty('clampToGround') ? !params.clampToGround : false, //perPositionHeight=true时，取带高度的点，false时为不带高度的点
            height: params.height ?? void 0,
            extrudedHeight: params.extrudedHeight ?? void 0,
            // classificationType: Cesium.ClassificationType.CESIUM_3D_TILE //CESIUM_3D_TILE
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(params?.distanceDisplayCondition[0] || 0, params?.distanceDisplayCondition[1] || Number.MAX_VALUE)
          }
        }
        this.hierarchy = positions
        this._init()
      }
      _.prototype._init = function () {
        var _self = this
        var _update = function () {
          return new Cesium.PolygonHierarchy(_self.hierarchy)
        }
        //实时更新polygon.hierarchy
        this.options.polygon.hierarchy = new Cesium.CallbackProperty(_update, false)
        _this.removeObj.push(_this.viewer.entities.add(this.options))
      }
      return _
    })()

    var handler = new Cesium.ScreenSpaceEventHandler(_this.viewer.scene.canvas)
    if (!this._resultTip) this._resultTip = this.entitys.createMsgTip()
    this.handleArr.push(handler)
    var positions: Array<any> = []
    var poly: any = undefined

    //鼠标单击画点
    handler.setInputAction(function (movement: any) {
      // var cartesian = _this.mouseManager.screenToWorld(movement.position);
      var cartesian: any = _this.getCatesian3FromPX(movement.position)
      if (cartesian != undefined) {
        if (positions.length == 0) {
          positions.push(cartesian.clone())
        }
        positions.push(cartesian)
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
    //鼠标移动
    handler.setInputAction(function (movement: any) {
      // var cartesian = _this.mouseManager.screenToWorld(movement.endPosition);
      var cartesian = _this.getCatesian3FromPX(movement.endPosition)
      if (positions.length >= 2) {
        if (!Cesium.defined(poly)) {
          poly = new PolygonPrimitive(positions)
        } else {
          if (cartesian != undefined) {
            positions.pop()
            // cartesian.y += (1 + Math.random());
            positions.push(cartesian)
          }
          _this.entitys.showTip(_this._resultTip, true, cartesian, '鼠标右键结束,平板长按结束')
        }
      } else {
        _this.entitys.showTip(_this._resultTip, true, cartesian, '点击绘制')
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
    //鼠标右键单击结束绘制
    handler.setInputAction(function (movement: any) {
      _this.removeHandle()
      callback(positions, _this.removeObj)
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
  }

  //画圆
  circleDraw(_callBack: any) {
    let _self = this
    //_self.viewer.scene.globe.depthTestAgainstTerrain = true;
    // if(!_self.circle.entity)_self.entitys.remove(_self.circle.entity);
    _self.circle = {
      points: [],
      rect: null,
      entity: null,
      r: 1
    }
    var tempPosition
    let cartographic1
    let p
    let tempLon: any
    let tempLat: any
    let tempAlt: any
    var handle = new Cesium.ScreenSpaceEventHandler(_self.viewer.scene.canvas)
    if (!this._resultTip) this._resultTip = this.entitys.createMsgTip()
    this.handleArr.push(handle)
    //common.handlerList.push(ShapeEventHandler);
    handle.setInputAction(function (click: any) {
      tempPosition = _self.getPointFromWindowPoint(click.position)
      //选择的点在球面上
      if (tempPosition) {
        function callBackPos() {
          if (_self.circle.points.length == 0) return 0
          const minlon = Cesium.Math.toDegrees(_self.circle.points[0].longitude)
          const minlat = Cesium.Math.toDegrees(_self.circle.points[0].latitude)
          const maxlon = Cesium.Math.toDegrees(_self.circle.points[1].longitude)
          const maxlat = Cesium.Math.toDegrees(_self.circle.points[1].latitude)
          const r: number = _self.getFlatternDistance([
            { lng: minlon, lat: minlat, alt: 0 },
            { lng: maxlon, lat: maxlat, alt: 0 }
          ])
          if (r) {
            return r
          }
          return 1
        }
        if (_self.circle.points.length == 0) {
          p = click.position
          cartographic1 = Cesium.Ellipsoid.WGS84.cartesianToCartographic(tempPosition)
          if (!tempPosition) return false
          _self.circle.points.push(_self.viewer.scene.globe.ellipsoid.cartesianToCartographic(tempPosition))
          _self.circle.points.push(_self.viewer.scene.globe.ellipsoid.cartesianToCartographic(tempPosition))
          tempLon = Cesium.Math.toDegrees(cartographic1.longitude)
          tempLat = Cesium.Math.toDegrees(cartographic1.latitude)
          tempAlt = cartographic1.height
          _self.circle.entity = _self.viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(tempLon, tempLat, tempAlt),
            point: _self.entitys.getPoint(),
            ellipse: {
              semiMinorAxis: new Cesium.CallbackProperty(callBackPos, false),
              semiMajorAxis: new Cesium.CallbackProperty(callBackPos, false),
              outline: true,
              outlineWidth: 10.0,
              material: Cesium.Color.fromCssColorString('#7FFF00').withAlpha(0.5)
              // clampToGround: true
            }
          })
        } else {
          var tempCircle = new Cesium.CircleOutlineGeometry({
            center: Cesium.Cartesian3.fromDegrees(tempLon, tempLat, tempAlt),
            radius: callBackPos(),
            granularity: Math.PI / 2
          })
          var geometry: any = Cesium.CircleOutlineGeometry.createGeometry(tempCircle)
          var float64ArrayPositionsIn = geometry.attributes.position.values
          var positionsIn = [].slice.call(float64ArrayPositionsIn)
          _self.removeHandle()
          if (_self.circle.entity) _self.entitys.remove(_self.circle.entity)

          //画出半径
          // _self.removeObj.push(_self.entitys.createPoint(Cesium.Cartesian3.fromDegrees(tempLon, tempLat),'半径 :' +  parseFloat(callBackPos()).toFixed(2)));
          // _self.circle.entity.label = _self.entitys.getLabel('半径 :' +  parseFloat(callBackPos()).toFixed(2), new Cesium.Cartesian2(0, -15));

          let radius = callBackPos()
          let r = common.getUuid(11)
          let options = {
            id: r,
            entityId: r,
            name: '圆形',
            position: Cesium.Cartesian3.fromDegrees(tempLon, tempLat, tempAlt),
            point: _self.entitys.getPoint(),
            label: _self.entitys.getLabel('半径 :' + callBackPos().toFixed(2) + '米', new Cesium.Cartesian2(0, -15)),
            ellipse: {
              semiMinorAxis: radius,
              semiMajorAxis: radius,
              outline: true,
              outlineWidth: 10.0,
              material: Cesium.Color.fromCssColorString('#7FFF00').withAlpha(0.5),
              clampToGround: true
            }
          }
          let entity = new Cesium.Entity(options)
          _self.removeObj.push(_self.viewer.entities.add(entity))
          _callBack(positionsIn, _self.removeObj, [tempLon, tempLat, tempAlt], callBackPos())
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
    handle.setInputAction(function (movement: any) {
      var moveEndPosition = _self.getPointFromWindowPoint(movement.endPosition)
      if (_self.circle.points.length == 0) {
        _self.entitys.showTip(_self._resultTip, true, moveEndPosition, '点击地图')
        return false
      }
      _self.entitys.showTip(_self._resultTip, true, moveEndPosition, '再次点击结束')
      //选择的点在球面上
      if (moveEndPosition) {
        _self.circle.points.pop()
        _self.circle.points.push(_self.viewer.scene.globe.ellipsoid.cartesianToCartographic(moveEndPosition))
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
  }

  //画矩形 1
  drawRect(callback: any) {
    let _self = this
    let pointsArr: Array<any> = []
    _self.shape = {
      points: [],
      rect: null,
      entity: null
    }
    var tempPosition
    var handle = new Cesium.ScreenSpaceEventHandler(_self.viewer.scene.canvas)
    if (!this._resultTip) if (!this._resultTip) this._resultTip = this.entitys.createMsgTip()
    this.handleArr.push(handle)
    //鼠标左键单击画点
    handle.setInputAction(function (click: any) {
      tempPosition = _self.getPointFromWindowPoint(click.position)
      //选择的点在球面上
      if (tempPosition) {
        if (_self.shape.points.length == 0) {
          pointsArr.push(tempPosition)
          let cartesian = _self.viewer.scene.globe.ellipsoid.cartesianToCartographic(tempPosition)
          _self.shape.points.push(cartesian)
          _self.shape.rect = Cesium.Rectangle.fromCartographicArray(_self.shape.points)
          _self.shape.rect.east += 0.000001
          _self.shape.rect.north += 0.000001
          let r = common.getUuid(11)
          let options = {
            id: r,
            entityId: r,
            rectangle: {
              coordinates: _self.shape.rect,
              //fill:false,
              outline: false,
              outlineWidth: 10.0,
              outlineColor: Cesium.Color.CHARTREUSE,
              material: Cesium.Color.fromCssColorString('#7FFF00').withAlpha(0.5)
              // height:10
              // clampToGround: true
            }
          }
          _self.shape.entity = _self.viewer.entities.add(options)
          _self.bufferEntity = _self.shape.entity
          _self.removeObj.push(_self.shape.entity)
        } else {
          _self.removeHandle()
          callback(pointsArr, _self.removeObj)
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
    //鼠标移动
    handle.setInputAction(function (movement: any) {
      if (!movement.endPosition) return false
      let moveEndPosition = _self.getPointFromWindowPoint(movement.endPosition)
      if (_self.shape.points.length == 0) {
        _self.entitys.showTip(_self._resultTip, true, moveEndPosition, '点击绘制')
        return
      }
      //选择的点在球面上
      if (moveEndPosition) {
        pointsArr[1] = moveEndPosition
        let cartesian = _self.viewer.scene.globe.ellipsoid.cartesianToCartographic(moveEndPosition)
        _self.shape.points[1] = cartesian
        _self.shape.rect = Cesium.Rectangle.fromCartographicArray(_self.shape.points)
        if (_self.shape.rect.west == _self.shape.rect.east) _self.shape.rect.east += 0.000001
        if (_self.shape.rect.south == _self.shape.rect.north) _self.shape.rect.north += 0.000001
        _self.shape.entity.rectangle.coordinates = _self.shape.rect
        _self.entitys.showTip(_self._resultTip, true, moveEndPosition, '再次点击结束')
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
  }

  /**
   * 画矩形 2 （效率高）
   * @param {function} callback 绘制完成回调函数
   * @param {option} showFill  配置项
   */
  drawRectangle(callback: any, option: any) {
    var _self = this
    var isMoving = false
    var positions: Array<any> = []
    var extrudedHeight = 0
    var scene = _self.viewer.scene
    var camera = _self.viewer.camera

    let _showRegion2Map = function () {
      let material = Cesium.Color.fromCssColorString('#ff0').withAlpha(0.5)
      let outlineMaterial = Cesium.Color.fromCssColorString('#00FF00').withAlpha(0.7)
      // let outlineMaterial = new Cesium.PolylineDashMaterialProperty({
      //     dashLength: 16,
      //     color: Cesium.Color.fromCssColorString('#00f').withAlpha(0.7)
      // });

      let dynamicPositions = new Cesium.CallbackProperty(function () {
        if (positions.length > 1 && isMoving) {
          let rect = Cesium.Rectangle.fromCartesianArray(positions)
          return rect
        } else {
          return null
        }
      }, false)

      let outlineDynamicPositions = new Cesium.CallbackProperty(function () {
        if (positions.length > 1 && isMoving) {
          let rect = Cesium.Rectangle.fromCartesianArray(positions)
          let arr = [rect.west, rect.north, rect.east, rect.north, rect.east, rect.south, rect.west, rect.south, rect.west, rect.north]
          let points = Cesium.Cartesian3.fromRadiansArray(arr)
          return points
        } else {
          return null
        }
      }, false)

      let r = common.getUuid(11)
      var bData: any = {
        id: r,
        entityId: r,
        graphicName: option.graphicName,
        rectangle: {
          coordinates: dynamicPositions,
          clampToGround: true,
          material: option.material,
          show: option.showFill,
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(option?.distanceDisplayCondition[0] || 0, option?.distanceDisplayCondition[1] || Number.MAX_VALUE)
        },
        polyline: {
          positions: outlineDynamicPositions,
          clampToGround: true,
          width: option.outlineWidth || 1,
          material: option.outlineMaterial,
          show: option.showLine,
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(option?.distanceDisplayCondition[0] || 0, option?.distanceDisplayCondition[1] || Number.MAX_VALUE)
        }
      }

      if (extrudedHeight > 0) {
        bData.rectangle.extrudedHeight = extrudedHeight
        bData.rectangle.extrudedHeightReference = Cesium.HeightReference.RELATIVE_TO_GROUND
        bData.rectangle.closeTop = true
        bData.rectangle.closeBottom = true
        bData.rectangle.outline = false
        bData.rectangle.outlineWidth = 0
      }
      let _rect = _self.viewer.entities.add(bData)
      return _rect
    }
    var pickedAnchor = _showRegion2Map()
    _self.removeObj.push(pickedAnchor)
    var handle = new Cesium.ScreenSpaceEventHandler(scene.canvas)
    if (!_self._resultTip) _self._resultTip = _self.entitys.createMsgTip()
    _self.handleArr.push(handle)

    handle.setInputAction(function (event: any) {
      var position = event.position
      if (!Cesium.defined(position)) {
        return
      }
      var ray: any = camera.getPickRay(position)
      if (!Cesium.defined(ray)) {
        return
      }
      var cartesian = scene.globe.pick(ray, scene)
      if (!Cesium.defined(cartesian)) {
        return
      }
      if (isMoving) {
        // isMoving = false;
        positions[1] = cartesian
        _self.removeHandle()
        callback(positions, _self.removeObj)
      } else {
        if (!Cesium.defined(pickedAnchor)) {
          return
        }
        positions.push(cartesian)
        positions.push(cartesian)
        isMoving = true
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

    handle.setInputAction(function (event: any) {
      var position = event.endPosition
      if (!Cesium.defined(position)) {
        return
      }
      var ray: any = camera.getPickRay(position)
      if (!Cesium.defined(ray)) {
        return
      }
      var cartesian = scene.globe.pick(ray, scene)
      if (!Cesium.defined(cartesian)) {
        return
      }
      if (!isMoving) {
        _self.entitys.showTip(_self._resultTip, true, cartesian, '点击地图')
        return
      }

      positions[1] = cartesian
      _self.entitys.showTip(_self._resultTip, true, cartesian, '再次点击结束')
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
  }

  //清除所有Entity和ImageryLayers
  clearHandle() {
    //移除所有实体Entity
    this.viewer.entities.removeAll()
    //移除cesium加载的ImageryLayer
    for (var i = 0; i < this.removeImageryLayers.length; i++) {
      this.viewer.imageryLayers.remove(this.removeImageryLayers[i])
    }
  }

  getPointFromWindowPoint(point: any) {
    if (this.viewer.scene.terrainProvider.constructor.name == 'EllipsoidTerrainProvider') {
      return this.viewer.camera.pickEllipsoid(point, this.viewer.scene.globe.ellipsoid)
    } else {
      var ray: any = this.viewer.scene.camera.getPickRay(point)
      return this.viewer.scene.globe.pick(ray, this.viewer.scene)
    }
  }

  // 鼠标拾取三维坐标点
  getCatesian3FromPX(px: any) {
    var picks = this.viewer.scene.drillPick(px)
    this.viewer.render()
    var cartesian
    var isOn3dtiles = false
    for (var i = 0; i < picks.length; i++) {
      if (picks[i].primitive instanceof Cesium.Cesium3DTileset) {
        //模型上拾取
        isOn3dtiles = true
      }
    }
    if (isOn3dtiles) {
      cartesian = this.viewer.scene.pickPosition(px)
    } else {
      var ray = this.viewer.camera.getPickRay(px)
      if (!ray) return null
      cartesian = this.viewer.scene.globe.pick(ray, this.viewer.scene)
    }
    return cartesian
  }

  // getCatesian3FromPX(px) {
  //     let { viewer, WGS84_to_Cartesian3, Cartesian3_to_WGS84 } = this;
  //     let picks = viewer.scene.drillPick(px);
  //     let cartesian = null;
  //     let isOn3dtiles = false,
  //         isOnTerrain = false;
  //     // drillPick
  //     for (let i in picks) {
  //         let pick = picks[i];
  //         if (
  //             (pick && pick.primitive instanceof Cesium.Cesium3DTileFeature) ||
  //             (pick && pick.primitive instanceof Cesium.Cesium3DTileset) ||
  //             (pick && pick.primitive instanceof Cesium.Model)
  //         ) {
  //             //模型上拾取
  //             isOn3dtiles = true;
  //         }
  //         // 3dtilset
  //         if (isOn3dtiles) {
  //             viewer.scene.pick(px);
  //             cartesian = viewer.scene.pickPosition(px);
  //             if (cartesian) {
  //                 let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
  //                 if (cartographic.height < 0) cartographic.height = 0;
  //                 let lon = Cesium.Math.toDegrees(cartographic.longitude),
  //                     lat = Cesium.Math.toDegrees(cartographic.latitude),
  //                     height = cartographic.height;
  //                 cartesian = WGS84_to_Cartesian3({
  //                     lng: lon,
  //                     lat: lat,
  //                     alt: height,
  //                 });
  //             }
  //         }
  //     }

  //     // 是否有地形，没有地形为 true
  //     let boolTerrain = viewer.terrainProvider instanceof Cesium.EllipsoidTerrainProvider;
  //     // 有地形处理
  //     if (!isOn3dtiles && !boolTerrain) {
  //         let ray = viewer.scene.camera.getPickRay(px);
  //         if (!ray) return null;
  //         cartesian = viewer.scene.globe.pick(ray, viewer.scene);
  //         isOnTerrain = true;
  //     }
  //     // 无地形处理
  //     if (!isOn3dtiles && !isOnTerrain && boolTerrain) {
  //         cartesian = viewer.scene.camera.pickEllipsoid(
  //             px,
  //             viewer.scene.globe.ellipsoid
  //         );
  //     }
  //     if (cartesian) {
  //         let position = Cartesian3_to_WGS84(cartesian);
  //         if (position.alt < 0) {
  //             cartesian = WGS84_to_Cartesian3(position);
  //         }
  //         return cartesian;
  //     }
  //     return false;
  // }

  //笛卡尔坐标系转WGS84坐标系
  /**
   *
   * @param {Cesium.Cartesian3} cartesian3
   * @returns
   */
  Cartesian3_to_WGS84(cartesian3: any) {
    // var cartesian3 = new Cesium.Cartesian3(point.x, point.y, point.z);
    var cartographic = Cesium.Cartographic.fromCartesian(cartesian3)
    var latitude = Cesium.Math.toDegrees(cartographic.latitude)
    var longitude = Cesium.Math.toDegrees(cartographic.longitude)
    var height = cartographic.height
    return { longitude, latitude, height }
  }

  //WGS84坐标系转笛卡尔坐标系
  WGS84_to_Cartesian3(point: any) {
    return Cesium.Cartesian3.fromDegrees(point.longitude, point.latitude, point.height)
  }

  // 空间多点距离计算函数(经纬度)
  getFlatternDistance(positions: Array<any>) {
    var distance = 0
    for (var i = 0; i < positions.length - 1; i++) {
      var point1cartographic = Cesium.Cartographic.fromDegrees(positions[i].lng, positions[i].lat, positions[i].alt)
      var point2cartographic = Cesium.Cartographic.fromDegrees(positions[i + 1].lng, positions[i + 1].lat, positions[i + 1].alt)

      // var point1cartographic = Cesium.Cartographic.fromCartesian(positions[i]);
      // var point2cartographic = Cesium.Cartographic.fromCartesian(positions[i+1]);
      /**根据经纬度计算出距离**/
      var geodesic = new Cesium.EllipsoidGeodesic()
      geodesic.setEndPoints(point1cartographic, point2cartographic)
      var s = geodesic.surfaceDistance
      //console.log(Math.sqrt(Math.pow(distance, 2) + Math.pow(endheight, 2)));
      //返回两点之间的距离
      s = Math.sqrt(Math.pow(s, 2) + Math.pow(point2cartographic.height - point1cartographic.height, 2))
      distance = distance + s
    }
    return distance
  }

  // 空间多点距离计算函数
  getSpaceDistance(positions: Array<any>) {
    var distance = 0
    for (var i = 0; i < positions.length - 1; i++) {
      var point1cartographic = Cesium.Cartographic.fromCartesian(positions[i])
      var point2cartographic = Cesium.Cartographic.fromCartesian(positions[i + 1])
      /**根据经纬度计算出距离**/
      var geodesic = new Cesium.EllipsoidGeodesic()
      geodesic.setEndPoints(point1cartographic, point2cartographic)
      var s = geodesic.surfaceDistance
      //console.log(Math.sqrt(Math.pow(distance, 2) + Math.pow(endheight, 2)));
      //返回两点之间的距离
      s = Math.sqrt(Math.pow(s, 2) + Math.pow(point2cartographic.height - point1cartographic.height, 2))
      distance = distance + s
    }
    return distance
  }

  // 绘制视网
  drawSketch(callback: any) {
    var _this = this
    _this.removeHandle()
    let eid = common.getUuid(11)

    let viewPosition: any = null
    let viewPositionEnd: any = null
    let horizontalViewAngle = 90.0
    let verticalViewAngle = 60.0

    var PolyLinePrimitive: any = (function () {
      function _(this: any, positions: any) {
        this.options = {
          id: eid,
          entityId: eid,
          polyline: {
            show: true,
            positions: [],
            material: Cesium.Color.CHARTREUSE,
            width: 1
          }
        }
        this.positions = positions
        this._init()
      }

      _.prototype._init = function () {
        var _self = this
        var _update = function () {
          return _self.positions
        }
        //实时更新polyline.positions
        this.options.polyline.positions = new Cesium.CallbackProperty(_update, false)
        _this.removeObj.push(_this.viewer.entities.add(this.options))
      }
      return _
    })()

    function getHeading(fromPosition: any, toPosition: any) {
      let finalPosition = new Cesium.Cartesian3()
      let matrix4 = Cesium.Transforms.eastNorthUpToFixedFrame(fromPosition)
      Cesium.Matrix4.inverse(matrix4, matrix4)
      Cesium.Matrix4.multiplyByPoint(matrix4, toPosition, finalPosition)
      Cesium.Cartesian3.normalize(finalPosition, finalPosition)
      return Cesium.Math.toDegrees(Math.atan2(finalPosition.x, finalPosition.y))
    }

    function getPitch(fromPosition: any, toPosition: any) {
      let finalPosition = new Cesium.Cartesian3()
      let matrix4 = Cesium.Transforms.eastNorthUpToFixedFrame(fromPosition)
      Cesium.Matrix4.inverse(matrix4, matrix4)
      Cesium.Matrix4.multiplyByPoint(matrix4, toPosition, finalPosition)
      Cesium.Cartesian3.normalize(finalPosition, finalPosition)
      return Cesium.Math.toDegrees(Math.asin(finalPosition.z))
    }

    function getOrientation() {
      let viewHeading = viewPositionEnd ? getHeading(viewPosition, viewPositionEnd) : 0.0
      let viewPitch = viewPositionEnd ? getPitch(viewPosition, viewPositionEnd) : 0.0
      let Transforms = Cesium.Transforms as any
      return new Transforms.headingPitchRollQuaternion(viewPosition, Cesium.HeadingPitchRoll.fromDegrees(viewHeading - horizontalViewAngle, viewPitch, 0.0))
    }

    function getRadii() {
      let viewDistance = viewPositionEnd ? Cesium.Cartesian3.distance(viewPosition, viewPositionEnd) : 100.0
      return new Cesium.Cartesian3(viewDistance, viewDistance, viewDistance)
    }

    var handler = new Cesium.ScreenSpaceEventHandler(_this.viewer.scene.canvas)
    if (!this._resultTip) this._resultTip = this.entitys.createMsgTip()
    this.handleArr.push(handler)
    var positions: Array<any> = []
    var poly: any = undefined
    //鼠标左键单击画点
    handler.setInputAction(function (movement: any) {
      // var cartesian = _this.mouseManager.screenToWorld(movement.position);
      // var cartesian = _this.viewer.scene.pickPosition(movement.position);
      var cartesian: any = _this.getCatesian3FromPX(movement.position)

      if (Cesium.defined(cartesian)) {
        let r = common.getUuid(11)
        let options = {
          id: r,
          entityId: r,
          position: cartesian
        }
        let entity = _this.viewer.entities.add(options)
        entity.label = _this.entitys.getLabel(positions.length > 1 ? '方向' : '视点', new Cesium.Cartesian2(0, -10))
        entity.point = positions.length > 1 ? undefined : _this.entitys.getPoint()
        _this.removeObj.push(entity)
      }
      if (positions.length == 0) {
        positions.push(cartesian.clone())
        viewPosition = positions[0]
        // 创建视网
        let sketch = _this.viewer.entities.add({
          name: 'sketch',
          position: viewPosition,
          orientation: new Cesium.CallbackProperty(getOrientation, false),
          ellipsoid: {
            radii: new Cesium.CallbackProperty(getRadii, false),
            // innerRadii: new Cesium.Cartesian3(2.0, 2.0, 2.0),
            minimumClock: Cesium.Math.toRadians(-horizontalViewAngle / 2),
            maximumClock: Cesium.Math.toRadians(horizontalViewAngle / 2),
            minimumCone: Cesium.Math.toRadians(verticalViewAngle + 7.75),
            maximumCone: Cesium.Math.toRadians(180 - verticalViewAngle - 7.75),
            fill: false,
            outline: true,
            subdivisions: 256,
            stackPartitions: 32,
            slicePartitions: 32,
            outlineColor: Cesium.Color.YELLOWGREEN
          }
        })
        _this.removeObj.push(sketch)
      }
      positions.push(cartesian)
      if (positions.length > 2) {
        _this.removeHandle()
        positions.pop()
        viewPositionEnd = positions[1]
        callback(positions, _this.removeObj)
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
    //鼠标移动
    handler.setInputAction(function (movement: any) {
      var cartesian = _this.viewer.scene.pickPosition(movement.endPosition)
      if (positions.length >= 2) {
        if (!Cesium.defined(poly)) {
          poly = new PolyLinePrimitive(positions)
        } else {
          if (cartesian && cartesian != undefined) {
            positions.pop()
            // cartesian.y += (1 + Math.random());
            positions.push(cartesian)
            viewPositionEnd = cartesian
          }
          _this.entitys.showTip(_this._resultTip, true, cartesian, '点击绘制目标点')
        }
      } else {
        _this.entitys.showTip(_this._resultTip, true, cartesian, '点击绘制起点')
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
    //单击鼠标右键结束画线
    handler.setInputAction(function (movement: any) {
      _this.remove()
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
  }

  //绘制视锥
  drawFrustum(callback: any) {
    var _this = this
    _this.removeHandle()
    let eid = common.getUuid(11)
    let viewPosition: any = null
    let viewPositionEnd: any = null
    let horizontalViewAngle = 90.0
    let verticalViewAngle = 60.0

    var PolyLinePrimitive: any = (function () {
      function _(this: any, positions: any) {
        this.options = {
          id: eid,
          entityId: eid,
          polyline: {
            show: true,
            positions: [],
            material: Cesium.Color.CHARTREUSE,
            width: 1
          }
        }
        this.positions = positions
        this._init()
      }

      _.prototype._init = function () {
        var _self = this
        var _update = function () {
          return _self.positions
        }
        //实时更新polyline.positions
        this.options.polyline.positions = new Cesium.CallbackProperty(_update, false)
        _this.removeObj.push(_this.viewer.entities.add(this.options))
      }
      return _
    })()

    function getHeading(fromPosition: any, toPosition: any) {
      let finalPosition = new Cesium.Cartesian3()
      let matrix4 = Cesium.Transforms.eastNorthUpToFixedFrame(fromPosition)
      Cesium.Matrix4.inverse(matrix4, matrix4)
      Cesium.Matrix4.multiplyByPoint(matrix4, toPosition, finalPosition)
      Cesium.Cartesian3.normalize(finalPosition, finalPosition)
      return Cesium.Math.toDegrees(Math.atan2(finalPosition.x, finalPosition.y))
    }

    function getPitch(fromPosition: any, toPosition: any) {
      let finalPosition = new Cesium.Cartesian3()
      let matrix4 = Cesium.Transforms.eastNorthUpToFixedFrame(fromPosition)
      Cesium.Matrix4.inverse(matrix4, matrix4)
      Cesium.Matrix4.multiplyByPoint(matrix4, toPosition, finalPosition)
      Cesium.Cartesian3.normalize(finalPosition, finalPosition)
      return Cesium.Math.toDegrees(Math.asin(finalPosition.z))
    }

    function getFrustum() {
      let heading = viewPositionEnd ? getHeading(viewPosition, viewPositionEnd) : 0.0
      let pitch = viewPositionEnd ? getPitch(viewPosition, viewPositionEnd) : 0.0
      let distance = _this.getSpaceDistance([viewPosition, viewPositionEnd])
      let wgs84_point = _this.Cartesian3_to_WGS84(viewPosition)
      let position = {
        longitude: wgs84_point.longitude,
        latitude: wgs84_point.latitude,
        height: wgs84_point.height
      }
      return { position, heading, pitch, distance: Number(distance.toFixed(2)) }
    }

    var handler = new Cesium.ScreenSpaceEventHandler(_this.viewer.scene.canvas)
    if (!this._resultTip) this._resultTip = this.entitys.createMsgTip()
    this.handleArr.push(handler)
    var positions: Array<any> = []
    var poly: any = undefined
    //鼠标左键单击画点
    handler.setInputAction(function (movement: any) {
      var cartesian = _this.viewer.scene.pickPosition(movement.position)

      if (Cesium.defined(cartesian)) {
        let r = common.getUuid(11)
        let options = {
          id: r,
          entityId: r,
          position: cartesian
        }
        let entity = _this.viewer.entities.add(options)
        entity.label = _this.entitys.getLabel(positions.length > 1 ? '方向' : '视点', new Cesium.Cartesian2(0, -10))
        entity.point = positions.length > 1 ? undefined : _this.entitys.getPoint()
        _this.removeObj.push(entity)

        if (positions.length == 0) {
          positions.push(cartesian.clone())
          viewPosition = positions[0]
        }
        positions.push(cartesian)
        if (positions.length > 2) {
          _this.removeHandle()
          positions.pop()
          viewPositionEnd = positions[1]
          let frustum = getFrustum()
          callback(positions, _this.removeObj, frustum)
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
    //鼠标移动
    handler.setInputAction(function (movement: any) {
      var cartesian = _this.viewer.scene.pickPosition(movement.endPosition)
      if (positions.length >= 2) {
        if (!Cesium.defined(poly)) {
          poly = new PolyLinePrimitive(positions)
        } else {
          if (cartesian && cartesian != undefined) {
            positions.pop()
            // cartesian.y += (1 + Math.random());
            positions.push(cartesian)
            viewPositionEnd = cartesian
          }
          _this.entitys.showTip(_this._resultTip, true, cartesian, '点击绘制目标点')
        }
      } else {
        _this.entitys.showTip(_this._resultTip, true, cartesian, '点击绘制起点')
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
    //单击鼠标右键结束画线
    handler.setInputAction(function (movement: any) {
      _this.remove()
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
  }
}
