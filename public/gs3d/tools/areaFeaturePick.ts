/*
 * @Descripttion: 点、线、面、网格拾取，输出geojson
 * @version: 1.0.0
 * @Author: yangyuzhuo
 * @Date: 2023-08-14 10:14:41
 * @LastEditors GS3D
 * @LastEditTime 2024-01-11 09:36:15
 * Copyright 2023
 * listeners
 */
import * as Cesium from 'cesium'
import { axios } from '../util/axios'
import * as turf from '@turf/turf'
import { levelSize } from '../grid/util/levelSize'
import drawManager from '../manager/drawManager'
import { variable } from '../global/variable'
class areaFeaturePick {
  viewer: Cesium.Viewer & { [key: string]: any }
  GridPick: any
  dm: any
  rectangles: Array<any>
  polygons: Array<any>
  lines: Array<any>
  points: Array<any>
  drawGraphicsOpt: Array<any>
  isCheckGrid: boolean
  getGeoNumByGeometryUrl: string
  // isZy: boolean
  gridPrimitive: Array<any>
  geoLevel: any
  maxGridNumber: number

  constructor(params: any = {}) {
    this.viewer = params?.viewer ?? variable.viewer
    this.GridPick = params
    this.dm = new drawManager(this.viewer)

    this.rectangles = []
    this.polygons = []
    this.lines = []
    this.points = []
    this.drawGraphicsOpt = []
    this.isCheckGrid = false
    this.getGeoNumByGeometryUrl = '/engine/iwhereEngine-geosot-3/grid/getGeoNumByGeometry'
    // this.isZy = false
    this.gridPrimitive = []
    this.geoLevel = null
    this.maxGridNumber = 100000
  }

  activate(options: any) {
    if (!options || !options.type) {
      console.log("请传入绘制类型:【type:'point'||'line'||'polygon'||'rectangle'】")
      return
    }
    let _this = this
    this.viewer.scene.globe.depthTestAgainstTerrain = false
    if (!options.option) {
      options.option = {
        graphicName: '',
        geoLevel: null, //网格层级，可选，若不传或值为null会自动取当前地图的网格层级
        maxGridNumber: 100000, //最大网格数，可选，默认为100000
        color: '#ff0000', //颜色(适用于：点、线、面、矩形)
        opacity: 1, //不透明度(适用于：点、线、面、矩形)
        width: 2, //尺寸(适用于：点、线)
        fill: true, //是否填充内部(适用于：面、矩形),
        outline: true, //外边线(适用于：面、矩形)
        outlineColor: '#ff0000', //外边线颜色(适用于：点、面、矩形)
        outlineWidth: 1, ////外边线宽度(适用于：点、矩形)
        height: 0, //底部高度(适用于：面)
        extrudedHeight: 0, //实体高度(适用于：面)
        isDiscontinuous: false, //是否不连续点击，默认false，即默认连续点击(适用于：点)
        showLabel: true, //是否显示label，默认true(适用于：点)
        clampToGround: false, //是否贴地，默认false(适用于：线、面)
        showImage: true, //是否显示为图片，默认true(适用于：点)
        imageOption: {
          distance: { near: 0, far: 30000000 }, //图标显示距离范围,默认near:0,far:30000000
          url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAA3NJREFUWEetlk1oE0EUx/9vY5U2m9ZaQQU/2k3VfuxGoRUFPejFouDBD/Sg56og9iZ6Um96E0X8wJseBBWhglREvCjiR7FkoxVsdosUaaVWbTbWpuk+2dSKNjs7Sdq5znv//2/ezJsZQpFjtNZoIIWaQ8zLsuBKAEMhwqBLyutIMv6lSDlQIQnfVxrVoXncoRC1MWOTKIcInZMuPai04zcK0fVipABpLXaUwR0A1hYqCuCJy3Sx0o53ynICAZy62G0QH5CJCCsCPhO2EmeD8oUAjmY8BLCjVPPpPIX4eEUycUkM6TOT0vQzBDo9W/PpfGbsj9jmHT+9vAqko0Y7M67Nlfm0DhFaw0mze6ZuHoCjGW8AtEgABgh4wUSf4HILKBcfCcphxvWIbR4OBHA04yCAW8UK/dLWrcmyew2ErUG5WYXrF/Ylkv/G/FcBRzM8cw/CfzBvV+3EY9G0oxnnAZwI6IqjYStxNQjgK4BFAoFzqmWekp0NJ6p3ganNL46B+xHL3OMLMNrQUKNkyoYDVr9OtRNxGUBa048w6IogzlQtM+YL4GiGAUBkMKRa5lKZuTfv1DathxJ66xvL+Kra5mJfgJ/R5s0uK88EJt2qZbYWAsD19ZVpt/yHoOcnwpY53xcgtUpvpBC9F5mElbEq6usblUE4tc1tUJQuQVxeJf92gVOnLwHRoLABQPsiVvyeDCDwFiX0qkmzybcCb1payhq+ZTLiQ5i/fzNjnTp9O4geBSziecSKbxG3oeT1I9DzCuXnTr+tGK9vbppwlXdBFSKw5B6QrGBKnIbB7rlJVp5V9cdfpqPGDpd5o+zxIsCpcEMrqL/nu7ACuTbSjFcANsj2uth5Ai6HLfPYzLy8xyhVq28lhby/QHmxJqJ4Al6GLdP3K+f7IfkD8XSOAEZUy6wJgPOfmhMIQlZNmmXBBzNgdpYQ6Q/V86tbu7snSgbwEkuBYGBEzajLaeDFmGwbpd9yT8BrNWZ4B1M+CJ/HaayxpoBrO9fUcsWpiJQW20vgu5J4O5xxW2ng3UihugUD5O6IOv0QiG76ihN64fI21U4MFWpeVAWmRVNRo53yfs3UM65gV01ffKAY85IAcpXQYh0AX5gy456QO293eX9Pf7HmJQNMQRgnvQ/sJLJ7qqzej6WYzwrASx5frTcu+JjoLdXcy/sNddw9MPLcyvEAAAAASUVORK5CYII=',
          width: 40, //图片宽，默认40，
          height: 40 //图片高，默认40
        },
        scaleByDistance: null, //根据距离缩放点的属性值，数组中依次[近距，近距缩放比例，远距，远距缩放比例]，比如点的原始属性width：10，outlineWidth：10，那么根据[1000,1,10000,0.5]表示为，当点视角在1000米高度时，点的属性值缩放比例为1，即width：10，outlineWidth：10；当视角在10000米高度时，点的属性值缩放比例为0.5，即width：5，outlineWidth：5，默认null。(适用于：点)
        translucencyByDistance: null, //根据与相机的距离设置半透明性。数组中依次[近距，近距缩放比例，远距，远距缩放比例]，比如[1000,0.5,10000,1]，那么在1000米高度时，所看到的图形透明度为0.5，高于10000时，透明度为1，默认null。(适用于：点)
        distanceDisplayCondition: [0, Number.MAX_VALUE], //在距离相机多远的地方显示此点，数组中依次[最小高度，最大高度]，比如[1000,10000]，即在1000-10000米范围内才能看到图形数据。默认[0, Number.MAX_VALUE]。(适用于：点,线,面,矩形)
        disableDepthTestDistance: Number.POSITIVE_INFINITY //指定要禁用深度测试的相机与相机之间的距离。比如disableDepthTestDistance：50000，即对象在高度50000下不再受深度的影响而显示离。默认永远不受深度影响。(适用于：点)
      }
    }

    // 通用样式配置(适用于：点、线、面、矩形)
    let normalOptions: { [key: string]: any } = {
      graphicName: options.option.graphicName || '',
      clampToGround: options.option.clampToGround ?? false,
      scaleByDistance: options.option?.scaleByDistance ?? null, //点
      translucencyByDistance: options.option?.translucencyByDistance ?? null, //点
      distanceDisplayCondition: options.option?.distanceDisplayCondition ?? [0, Number.MAX_VALUE], //点,线,面,矩形
      disableDepthTestDistance: options.option?.disableDepthTestDistance ?? Number.POSITIVE_INFINITY //点
    }
    this.geoLevel = options?.option?.geoLevel ?? null
    this.maxGridNumber = options?.option?.maxGridNumber ?? 100000

    switch (options.type) {
      case 'point':
        this.dm.drawPoint(
          (positions: Array<any>, entities: Array<any>) => {
            let _entitys = this.setDraw(positions, entities)
            this.points = this.points.concat(_entitys)

            let turfPositions
            positions.forEach((item, index) => {
              turfPositions = turf.point([item.longitude, item.latitude])
              _this.drawGraphicsOpt.push({
                feature: turfPositions,
                entityId: entities[index].id,
                graphicName: entities[index].graphicName
              })
            })
            this.getResult().then(res => {
              this.GridPick.callback(res, 'draw')
            })
          },
          {
            graphicName: options.option.graphicName || '',
            clampToGround: options.option.clampToGround ?? false,
            pixelSize: options.option.width || 2,
            color: Cesium.Color.fromCssColorString(options.option.color || '#ff0000').withAlpha(options.option.opacity || 1) || Cesium.Color.RED,
            outlineColor: Cesium.Color.fromCssColorString(options.option.outlineColor || '#ff0000'),
            outlineWidth: options.option.outlineWidth || 1,
            isContinuous: options.option.isContinuous ?? true,
            // isPerCallBack: options.option.isPerCallBack ?? false,
            showLabel: options.option.showLabel ?? true,
            showImage: options.option.showImage ?? true,
            imageOption: options.option?.imageOption || {},
            scaleByDistance: options.option?.scaleByDistance ?? null, //根据距离缩放点的 Property。
            translucencyByDistance: options.option?.translucencyByDistance ?? null, //用于根据与相机的距离设置半透明性。
            distanceDisplayCondition: options.option?.distanceDisplayCondition ?? [0, Number.MAX_VALUE], //指定在距离相机多远的地方显示此点。
            disableDepthTestDistance: options.option?.disableDepthTestDistance ?? Number.POSITIVE_INFINITY //指定要禁用深度测试的相机与相机之间的距离。
          }
        )
        break
      case 'line':
        this.dm.drawLine(
          (positions: Array<any>, entities: Array<any>) => {
            let _entitys = this.setDraw(positions, entities)
            this.lines = this.lines.concat(_entitys)

            let _lines: Array<any> = []
            positions.forEach(item => {
              let point = [item.longitude, item.latitude]
              _lines.push(point)
            })
            let turfPositions = turf.lineString(_lines)
            this.drawGraphicsOpt.push({
              feature: turfPositions,
              entityId: entities[0].id,
              graphicName: entities[0].graphicName
            })
            this.getResult().then(res => {
              this.GridPick.callback(res, 'draw')
            })
          },
          {
            graphicName: options.option.graphicName || '',
            clampToGround: options.option.clampToGround ?? false,
            width: options.option.width || 2,
            material: Cesium.Color.fromCssColorString(options.option.color || '#ff0000').withAlpha(options.option.opacity || 1) || Cesium.Color.RED,
            distanceDisplayCondition: options.option?.distanceDisplayCondition ?? [0, Number.MAX_VALUE] //指定在距离相机多远的地方显示此点。
          }
        )
        break
      case 'polygon':
        this.dm.drawPolygon(
          (positions: Array<any>, entities: Array<any>) => {
            let _entitys = this.setDraw(positions, entities)
            this.polygons = this.polygons.concat(_entitys)

            let _polygons = []
            positions.forEach((item, index) => {
              let point = [item.longitude, item.latitude]
              _polygons.push(point)
            })
            _polygons.push([positions[0].longitude, positions[0].latitude])
            let turfPositions = turf.polygon([_polygons])
            this.drawGraphicsOpt.push({
              feature: turfPositions,
              entityId: entities[0].id,
              graphicName: entities[0].graphicName
            })
            this.getResult().then(res => {
              this.GridPick.callback(res, 'draw')
            })
          },
          {
            graphicName: options.option.graphicName || '',
            clampToGround: options.option.clampToGround ?? false,
            outline: options.option.outline === false ? false : true,
            fill: options.option.fill === false ? false : true,
            outlineColor: Cesium.Color.fromCssColorString(options.option.outlineColor || '#ff0000') || Cesium.Color.RED,
            material: Cesium.Color.fromCssColorString(options.option.color || '#ff0000').withAlpha(options.option.opacity || 0.5),
            height: options.option.height,
            extrudedHeight: options.option.extrudedHeight,
            distanceDisplayCondition: options.option?.distanceDisplayCondition ?? [0, Number.MAX_VALUE] //指定在距离相机多远的地方显示此点。
          }
        )
        break
      case 'rectangle':
        this.dm.drawRect(
          (positions: Array<any>, entities: Array<any>) => {
            let _entitys = this.setDraw(positions, entities)
            this.rectangles = this.rectangles.concat(_entitys)

            let _rectangles = [
              [positions[0].longitude, positions[0].latitude],
              [positions[0].longitude, positions[1].latitude],
              [positions[1].longitude, positions[1].latitude],
              [positions[1].longitude, positions[0].latitude],
              [positions[0].longitude, positions[0].latitude]
            ]
            let turfPositions = turf.polygon([_rectangles])
            this.drawGraphicsOpt.push({
              feature: turfPositions,
              entityId: entities[0].id,
              graphicName: entities[0].graphicName
            })
            this.getResult().then(res => {
              this.GridPick.callback(res, 'draw')
            })
          },
          {
            graphicName: options.option.graphicName || '',
            clampToGround: options.option.clampToGround ?? false,
            showFill: options.option.fill ?? true,
            showLine: options.option.outline ?? true,
            material: Cesium.Color.fromCssColorString(options.option.color || '#ff0000').withAlpha(options.option.opacity || 0.5),
            outlineMaterial: Cesium.Color.fromCssColorString(options.option.outlineColor || '#ff0000'),
            outlineWidth: options.option.outlineWidth || 1,
            distanceDisplayCondition: options.option?.distanceDisplayCondition ?? [0, Number.MAX_VALUE] //指定在距离相机多远的地方显示此点。
          }
        )
        break
      default:
        break
    }
  }
  setDraw(positions: Array<any>, entities: Array<any>) {
    // console.log(positions);
    let _entitys = entities.map((entity, index) => {
      let _clone = Cesium.clone(entity)
      return _clone
    })
    this.dm.remove()
    _entitys.map(e => {
      this.viewer.entities.add(e)
    })
    return _entitys
  }
  getResult() {
    return new Promise((resolve, reject) => {
      if (!!this.isCheckGrid) {
        let notHasGridArray = this.drawGraphicsOpt.filter(item => {
          return !item.gridList
        })

        let { height } = this.viewer.camera.positionCartographic
        this.geoLevel = Number(this.geoLevel) || levelSize.calculateMapLevel(height)
        this.maxGridNumber = this.maxGridNumber ?? 100000

        notHasGridArray.forEach((item: any) => {
          let pass = levelSize.verifyOverflow(item.feature.geometry, levelSize.geosotlevelTobdlevel(this.geoLevel), this.maxGridNumber)
          // console.log('pass', pass)
          item.isOverflow = !pass
          item.isOverflow && (item.gridList = [])
        })
        // console.log('notHasGridArray', notHasGridArray)
        let notHasGridAndNotOverflowArray = notHasGridArray.filter((item: any) => {
          return !item.isOverflow
        })
        // console.log('notHasGridAndNotOverflowArray', notHasGridAndNotOverflowArray)

        let allPromise = this.getGrid(notHasGridAndNotOverflowArray)
        allPromise.then(res => {
          res.forEach((item, index) => {
            if (item.server_status == 200 || item.code == 0) {
              notHasGridAndNotOverflowArray[index].gridList = item.list || item.data || []
            } else {
              console.warn('接口查询失败')
            }
          })
          this.drawGrid(notHasGridAndNotOverflowArray)
          let result = this.toGeojson()
          resolve(result)
        })
      } else {
        let result = this.toGeojson()
        resolve(result)
      }
    })
  }
  toGeojson() {
    // console.log('drawGraphicsOpt', this.drawGraphicsOpt)
    let features: Array<any> = []
    this.drawGraphicsOpt.forEach(item => {
      item.feature.properties.graphicName = item.graphicName
      item.feature.properties.entityId = item.entityId
      item.feature.isOverflow = item.isOverflow ?? null
      item.feature.gridList = item.gridList ?? null
      let _feature = JSON.parse(JSON.stringify(item.feature))
      if (!this.isCheckGrid) {
        delete _feature.gridList
        delete _feature.isOverflow
      }
      features.push(_feature)
    })
    // if (!!this.isCheckGrid) {
    //   this.drawGrid(this.drawGraphicsOpt)
    // }
    let featureCollectionData = {
      type: 'FeatureCollection',
      features: features,
      crs: {
        type: 'name',
        properties: {
          name: 'urn:ogc:def:crs:EPSG::4326'
        }
      }
    }
    return featureCollectionData
  }
  clear() {
    this.dm.remove()
    this.clearGrid()
    this.rectangles.map(e => {
      this.viewer.entities.remove(e)
    })
    this.polygons.map(e => {
      this.viewer.entities.remove(e)
    })
    this.lines.map(e => {
      this.viewer.entities.remove(e)
    })
    this.points.map(e => {
      this.viewer.entities.remove(e)
    })
    this.drawGraphicsOpt = []
    this.getResult().then(res => {
      this.GridPick.callback(res, 'clear')
    })
  }
  clearByGraphicName(graphicName: string) {
    this.dm.remove()
    this.clearGridByGraphicName(graphicName)
    let _this = this
    let allEntities = [...this.rectangles, ...this.polygons, ...this.lines, ...this.points]
    allEntities.forEach(item => {
      if (item._graphicName == graphicName) {
        _this.viewer.entities.remove(item)
      }
    })
    this.rectangles = this.rectangles.filter(item => {
      return item._graphicName !== graphicName
    })
    this.polygons = this.polygons.filter(item => {
      return item._graphicName !== graphicName
    })
    this.lines = this.lines.filter(item => {
      return item._graphicName !== graphicName
    })
    this.points = this.points.filter(item => {
      return item._graphicName !== graphicName
    })
    this.drawGraphicsOpt = this.drawGraphicsOpt.filter(item => {
      return item.graphicName !== graphicName
    })
    this.getResult().then(res => {
      this.GridPick.callback(res, 'clearByGraphicName')
    })
  }
  clearById(entityId: string) {
    this.dm.remove()
    this.clearGridById(entityId)
    let _this = this
    let allEntities = [...this.rectangles, ...this.polygons, ...this.lines, ...this.points]
    allEntities.forEach(item => {
      if (item.id == entityId) {
        _this.viewer.entities.remove(item)
      }
    })
    this.rectangles = this.rectangles.filter(item => {
      return item.id !== entityId
    })
    this.polygons = this.polygons.filter(item => {
      return item.id !== entityId
    })
    this.lines = this.lines.filter(item => {
      return item.id !== entityId
    })
    this.points = this.points.filter(item => {
      return item.id !== entityId
    })
    this.drawGraphicsOpt = this.drawGraphicsOpt.filter(item => {
      return item.entityId !== entityId
    })
    this.getResult().then(res => {
      this.GridPick.callback(res, 'clearByEntityId')
    })
  }
  removeHandle() {
    this.dm.remove()
    // let element = document.getElementById('mapContainer')
    // var rightClickEvent = new MouseEvent("contextmenu", {
    //   bubbles: true,
    //   cancelable: true,
    //   view: window,
    //   button: 2
    // });
    // element.dispatchEvent(rightClickEvent);
  }
  checkGrid(val: boolean, url?: string) {
    this.isCheckGrid = val
    this.getGeoNumByGeometryUrl = url
    // this.isZy = isZy || false;
    this.getResult().then(res => {
      this.GridPick.callback(res, 'checkGrid')
    })
  }
  getGrid(list: Array<any>) {
    let geo_level = this.geoLevel
    let allPromise: Array<any> = []
    list.forEach(item => {
      let option: any = {
        geometry: JSON.stringify(item.feature.geometry),
        // geoJson: JSON.stringify({
        //   type: 'FeatureCollection',
        //   features: [item.feature],
        //   crs: {
        //     type: 'name',
        //     properties: {
        //       name: 'urn:ogc:def:crs:EPSG::4326'
        //     }
        //   }
        // }),
        gsotLevel: geo_level,
        geo_level: geo_level,
        // codeLevel: geo_level
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
        //   method: 'POST',
        //   url: this.getGeoNumByGeometryUrl,
        //   data: formData //this.isZy ? option : formData,
        // })
        axios
          .aPost({
            url: this.getGeoNumByGeometryUrl,
            data: formData //this.isZy ? option : formData,
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
  drawGrid(opt: Array<any>, option: any = {}) {
    // this.clearGrid()
    opt.forEach(optItem => {
      let gridList = optItem.gridList
      let outlineInstanceList: Array<any> = []
      let innerInstanceList: Array<any> = []
      gridList &&
        gridList.forEach((item: any) => {
          let rectangle
          if (item.geoNumScope) {
            rectangle = Cesium.Rectangle.fromDegrees(item.geoNumScope[1], item.geoNumScope[0], item.geoNumScope[3], item.geoNumScope[2])
          } else {
            rectangle = Cesium.Rectangle.fromDegrees(item.lbLng, item.lbLat, item.rtLng, item.rtLat)
          }

          let id = Math.random()
          let rectangleOutlineInstance = new Cesium.GeometryInstance({
            geometry: new Cesium.RectangleOutlineGeometry({
              rectangle: rectangle,
              height: 0,
              extrudedHeight: 0
            }),
            attributes: {
              color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.fromCssColorString(option.outlineColor || 'yellow'))
            },
            id: id + 'gridPickOutline'
          })
          let rectangleInnerInstance = new Cesium.GeometryInstance({
            geometry: new Cesium.RectangleGeometry({
              rectangle: rectangle,
              height: 0,
              extrudedHeight: 0
            }),
            attributes: {
              color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.fromCssColorString(option.innerColor || 'rgba(255, 255, 0,0.4)'))
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
            lineWidth: Math.min(4.0, this.viewer.scene.maximumAliasedLineWidth)
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
            lineWidth: Math.min(4.0, this.viewer.scene.maximumAliasedLineWidth)
          }
        })
      })
      outlineprimitive.entityId = optItem.entityId
      innerprimitive.entityId = optItem.entityId
      outlineprimitive.graphicName = optItem.graphicName
      innerprimitive.graphicName = optItem.graphicName
      this.viewer.scene.primitives.add(innerprimitive)
      this.viewer.scene.primitives.add(outlineprimitive)
      this.gridPrimitive.push([outlineprimitive, innerprimitive])
    })
  }
  clearGrid() {
    this.gridPrimitive &&
      this.gridPrimitive[0] &&
      this.gridPrimitive.forEach(item => {
        this.viewer.scene.primitives.remove(item[0])
        this.viewer.scene.primitives.remove(item[1])
      })
    this.gridPrimitive = []
  }
  clearGridByGraphicName(graphicName: string) {
    let _this = this
    this.gridPrimitive &&
      this.gridPrimitive[0] &&
      this.gridPrimitive.forEach(item => {
        if (item[0].graphicName == graphicName) {
          _this.viewer.scene.primitives.remove(item[0])
          _this.viewer.scene.primitives.remove(item[1])
        }
      })
    this.gridPrimitive = this.gridPrimitive.filter((item, index) => {
      return item[0].graphicName !== graphicName
    })
  }
  clearGridById(entityId: string) {
    let _this = this
    this.gridPrimitive &&
      this.gridPrimitive[0] &&
      this.gridPrimitive.forEach(item => {
        if (item[0].entityId == entityId) {
          _this.viewer.scene.primitives.remove(item[0])
          _this.viewer.scene.primitives.remove(item[1])
        }
      })
    this.gridPrimitive = this.gridPrimitive.filter((item, index) => {
      return item[0].entityId !== entityId
    })
  }
}

export default areaFeaturePick
