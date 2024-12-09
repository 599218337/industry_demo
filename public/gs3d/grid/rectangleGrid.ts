/*
 * @Descripttion: 平面网格
 * @version:
 * @Author: hejin.gao
 * @Date: 2021-12-21 09:03:11
 * @LastEditors: lzz 599218337@qq.com
 * @LastEditTime: 2024-04-17 15:03:15
 * 
 feature : {
    bbox:  [0, 0, 10, 10]
    geometry: {type: 'Polygon', coordinates: Array(1)}
    properties: {
      id, color, extruded, height
    }
    type: "Feature"
 }
 */
import * as Cesium from 'cesium'
import { common } from '../util/common'
export default class RectangleGrid {
  _v: any
  _s: any
  _boxs: any
  _outlines: any
  _options: any
  _show: boolean
  _boxShow: boolean
  _outlineShow: boolean
  _checkedIds: Array<any>
  constructor(viewer) {
    // super(viewer);
    this._v = viewer
    this._s = viewer.scene
    this._boxs = null
    this._outlines = null
    this._options = null

    this._show = true
    this._boxShow = true
    this._outlineShow = true
    this._checkedIds = []
  }

  /**
   * 绘制二维网格
   * @param {*} options
   * @returns
   */
  draw(options) {
    let me = this
    me.destroy()
    // 数据格式
    if (options.features && options.features.length === 0) {
      console.log('当前平面网格数据为空！')
      return
    }
    me._options = options
    const features = options.features
    const lineWidth = Cesium.defaultValue(options.lineWidth, 1)
    const lineColor = Cesium.defaultValue(options.lineColor, '#00FF00')
    const lineAlpha = Cesium.defaultValue(options.lineAlpha, 0.75)
    const fillClear = Cesium.defaultValue(options.fillClear, '#00FF00')
    const fillAlpha = Cesium.defaultValue(options.fillAlpha, 0)
    const elevation = Cesium.defaultValue(options.elevation, 0.0)
    const clampToGround = Cesium.defaultValue(options.clampToGround, true)
    const ellipsoid = Cesium.defaultValue(options.ellipsoid, Cesium.Ellipsoid.WGS84)

    const solidWhite = Cesium.Color.fromCssColorString(lineColor).withAlpha(Number(lineAlpha))
    const fillColor = Cesium.Color.fromCssColorString(fillClear).withAlpha(Number(fillAlpha))

    let instances = [],
      outlineInstances = []

    features.forEach((geo, i) => {
      const { bbox, id, color, height, extruded } = geo.properties
      const rectangle = Cesium.Rectangle.fromDegrees(...bbox)

      let _height = height ? height + elevation : elevation
      let _extruded = extruded ? Number(extruded) + _height : _height

      // 立体网格盒子
      let param = {
        id: id || common.getUuid(11),
        geometry: new Cesium.RectangleGeometry({
          ellipsoid: ellipsoid,
          rectangle: rectangle,
          height: _height,
          extrudedHeight: _extruded
        }),
        attributes: {
          color: Cesium.ColorGeometryInstanceAttribute.fromColor(color ? Cesium.Color.fromCssColorString(color) : fillColor),
          // color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.fromRandom({alpha: .25})),
        },
      }
      const instance: any = new Cesium.GeometryInstance(param)
      instance.feature = geo
      instances.push(instance)

      // 非贴地线
      let outlineGeomerty = null
      if (clampToGround) {
        const coordinates = [].concat.apply([], geo.geometry.coordinates[0]);
        const positions = Cesium.Cartesian3.fromDegreesArray(coordinates);
        outlineGeomerty = new Cesium.GroundPolylineGeometry({
          positions: positions,
          loop: false,
          width: lineWidth, // 设置轮廓线宽度
          // vertexFormat: Cesium.PolylineMaterialAppearance.VERTEX_FORMAT // 使用默认的轮廓线外观
        });
      } else {
        outlineGeomerty = new Cesium.RectangleOutlineGeometry({
          ellipsoid: ellipsoid,
          rectangle: rectangle,
          height: height,
          extrudedHeight: _extruded
          // vertexFormat: Cesium.PolylineMaterialAppearance.VERTEX_FORMAT, // 使用默认的轮廓线外观
        })
      }

      const outlineInstance = new Cesium.GeometryInstance({
        id: 'line_' + geo.properties.id,
        geometry: outlineGeomerty,
        attributes: {
          color: Cesium.ColorGeometryInstanceAttribute.fromColor(solidWhite)
          // distanceDisplayCondition: new Cesium.DistanceDisplayConditionGeometryInstanceAttribute( 0.0, 3000 )
        }
      })
      outlineInstances.push(outlineInstance)
    })

    const cull = {
      cull: true, // 开启裁剪
      cullEnabled: true,
      cullFace: Cesium.CullFace.BACK, // 只渲染正面
      cullVolume: new Cesium.BoundingSphere(Cesium.Cartesian3.ZERO, 1000) // 设置裁剪球体
    }

    const boxProperties = {
      releaseGeometryInstances: false,
      geometryInstances: instances,
      appearance: new Cesium.PerInstanceColorAppearance({
        translucent: true, // 为每个instance着色
        closed: false
      }),
      show: me._boxShow,
      allowPicking: true,
      ...cull
    }

    const lineProperties = {
      geometryInstances: outlineInstances,
      show: me._outlineShow,
      allowPicking: false,
      ...cull
    }

    if (clampToGround) {
      me._boxs = new Cesium.GroundPrimitive(boxProperties)
      me._outlines = new Cesium.GroundPolylinePrimitive({
        ...lineProperties,
        appearance: new Cesium.PolylineMaterialAppearance({
          material: Cesium.Material.fromType('Color', {
            color: solidWhite
          })
        })
      })
    } else {
      me._boxs = new Cesium.Primitive(boxProperties)
      me._outlines = new Cesium.Primitive({
        ...lineProperties,
        appearance: new Cesium.PerInstanceColorAppearance({
          flat: true,
          translucent: true,
          renderState: {
            lineWidth: Math.min(1.0, me._s.maximumAliasedLineWidth)
          }
        })
      })
    }
    me._s.primitives.add(me._boxs)
    me._s.primitives.add(me._outlines)
  }

  /**
   * 清除网格对象
   */
  destroy() {
    this._boxs && this._s.primitives.remove(this._boxs)
    this._outlines && this._s.primitives.remove(this._outlines)
    this._boxs = null
    this._outlines = null
  }

  /**
   * 控制整体显隐
   * @param {Boolean} bool
   */
  set show(bool: boolean) {
    this._show = bool
    this.boxShow = bool
    this.outlineShow = bool
  }
  get show() {
    return this._show
  }

  /**
   * 填充显隐
   * @param {Boolean} bool
   */
  set boxShow(bool: boolean) {
    this._boxShow = bool
    if (this._boxs) {
      this._boxs.show = bool
    }
  }
  get boxShow() {
    return this._boxShow
  }

  /**
   * 边框显隐
   * @param {Boolean} bool
   */
  set outlineShow(bool: boolean) {
    this._outlineShow = bool
    if (this._outlines) {
      this._outlines.show = bool
    }
  }
  get outlineShow() {
    return this._outlineShow
  }

  private _checked(id, color) {
    let primitive = this._boxs
    let attributes = primitive.getGeometryInstanceAttributes(id)
    if (attributes) attributes.color = Cesium.ColorGeometryInstanceAttribute.toValue(color)
  }

  checkedBoxId(id) {
    if (this._checkedIds.includes(id)) {
      return
    }
    this._checkedIds.push(id)
    const fillColor = Cesium.Color.fromCssColorString(this._options.fillClear).withAlpha(0.5)
    this._checked(id, fillColor)
  }

  checkedBoxIds(ids) {
    let me = this
    ids &&
      ids.forEach(id => {
        me.checkedBoxId(id)
      })
  }

  unChedkedBoxId(id) {
    let me = this
    let _index = me._checkedIds.indexOf(id)
    if (_index != -1) {
      me._checkedIds.splice(_index, 1)
      const fillColor = Cesium.Color.fromCssColorString(this._options.fillClear).withAlpha(Number(this._options.fillAlpha))
      me._checked(id, fillColor)
    }
  }

  clearChedkedBoxId() {
    let me = this
    const clone = [...me._checkedIds]
    clone.forEach(id => {
      me.unChedkedBoxId(id)
    })
  }
}
