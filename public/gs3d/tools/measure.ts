import * as Cesium from 'cesium'
import * as turf from '@turf/turf'
import marker_bg from '../gs3d-assets/image/red_position.png'

export namespace measure {
  export const describe: string = '测量工具'
  /**
   * @description 平面距离测量类
   * @param {Cesium.Viewer} viewer - Cesium容器
   * @param {object} options - 测量的配置选项
   * @return {object}
   */

  //距离测量类
  export class MeasureDistance {
    measureStatus: string
    viewer: Cesium.Viewer & { [key: string]: any }
    initOptions: any
    measureDistanceCollection: Cesium.DataSource & { [key: string]: any }
    positions: any[]
    tempPositions: any[]
    vertexEntities: any[]
    lineEntityArr: any[] | undefined
    labelEntity: object | undefined
    measureDistance: number
    handler: Cesium.ScreenSpaceEventHandler
    MeasureStartEvent: Cesium.Event
    MeasureEndEvent: Cesium.Event
    isMeasure: undefined | boolean
    lineEntity: undefined | any
    moveVertexEntity: Cesium.Entity | undefined

    constructor(viewer: Cesium.Viewer & { [key: string]: any }, options: any) {
      this.measureStatus = ''
      this.viewer = viewer
      this.viewer.GS3D_MODULE_TYPE = 'pc'
      this.initOptions = options
      // 距离测量实体集合
      this.measureDistanceCollection = new Cesium.CustomDataSource('measureDistance')
      this.viewer.dataSources.add(this.measureDistanceCollection)

      // this.initEvents()
      this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas) //cesium创建事件空间，用于存储各类事件
      this.MeasureStartEvent = new Cesium.Event() //开始事件
      this.MeasureEndEvent = new Cesium.Event() //结束事件

      // this.init()
      this.positions = []
      this.tempPositions = []
      this.vertexEntities = []
      this.lineEntityArr = []
      this.labelEntity = void 0 //标签实体
      this.measureDistance = 0 //测量结果
    }
    // init() {}
    // initEvents() {}
    /**
     * @description: <距离测量激活>
     * @msg: 备注
     * @return {*}
     * @author: 歪脖鸡丝儿
     */
    activate(options: any) {
      this.measureStatus = 'start' //测量开启状态
      if (!this.viewer.scene.pickPositionSupported) {
        console.log('This browser does not support pickPosition.')
      }
      this.initOptions.lastClearFlag && this.clear()
      // this.deactivate();
      this.registerEvents() //注册鼠标事件
      //设置鼠标状态
      this.viewer.enableCursorStyle = false
      this.viewer._element.style.cursor = 'crosshair' //鼠标样式十字丝
      this.isMeasure = true //是否启用了测量
      this.measureDistance = 0
      this.viewer.scene.globe.depthTestAgainstTerrain = true //开启深度探测，用于点击取点时让pickPosition获取到值
      console.log(`%c GS3D 距离测量(水平)【active】==> 开始`, `Color:springgreen`)
    }

    //禁用
    deactivate() {
      this.measureStatus = 'end'
      if (!this.isMeasure) return
      this.unRegisterEvents() //解除鼠标事件
      this.viewer._element.style.cursor = 'default' //鼠标样式默认
      this.viewer.enableCursorStyle = true
      this.isMeasure = false
      this.tempPositions = []
      this.positions = []
      this.viewer.scene.globe.depthTestAgainstTerrain = false //还原深度探测
      console.log(`%c GS3D 距离测量(水平)【deactivate】==> 结束`, `Color:springgreen`)
    }

    //清空绘制
    clear() {
      this.measureStatus = 'clear'
      // //清除线对象
      // // this.viewer.entities.remove(this.lineEntity);
      // this.lineEntityArr && this.lineEntityArr.forEach(lineEntity => {
      //   this.viewer.entities.remove(lineEntity);
      // })
      // this.lineEntity = void 0;
      // this.lineEntityArr = void 0;
      // //清除节点
      // this.vertexEntities.forEach(item => {
      //   this.viewer.entities.remove(item);
      // });
      // this.vertexEntities = [];
      // 改造原本的清除方式，使用自定的Cesium.CustomDataSource实体集合
      // 1.把当前创建的实体集合清空
      this.measureDistanceCollection.entities.removeAll()
      // 2.由于反复测量会一直new测量类，导致会建立多个measureDistance实体集合，故只清除当前的实体集合并不会把地图上的测量结果完全清除完，故从viewer上获取所有的measureDistance实体集合
      let ds = this.viewer.dataSources as Cesium.DataSourceCollection & { [key: string]: any }
      ds._dataSources.filter((dataSources: Cesium.DataSource) => dataSources.name === 'measureDistance').forEach((dataSource: Cesium.DataSource) => dataSource.entities.removeAll())
      // 3.各个变量回到初始状态
      this.lineEntity = void 0
      this.lineEntityArr = void 0
      this.vertexEntities = []
      console.log(`%c GS3D 距离测量(水平)【clear】==> 清除`, `Color:springgreen`)
    }

    //创建线对象
    createLineEntity() {
      this.lineEntity = this.measureDistanceCollection.entities.add({
        polyline: {
          positions: new Cesium.CallbackProperty(e => {
            return this.tempPositions
          }, false),
          width: 2,
          clampToGround: true, //贴地
          disableDepthTestDistance: Number.POSITIVE_INFINITY, //获取或设置与相机的距离，在该距离处禁用深度测试，防止对地形进行裁剪。当设置为零时，始终应用深度测试。当设置为 Number.POSITIVE_INFINITY 时，永远不会应用深度测试。
          // distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, Number.MAX_VALUE), //指定在距相机多远的距离处显示此折线。
          material: Cesium.Color.YELLOW,
          depthFailMaterial: Cesium.Color.YELLOW //指定用于在地形下方绘制多段线的材质。
        } as any
      })
    }

    //创建线节点
    createVertex() {
      let vertexEntity: Cesium.Entity & { [key: string]: any } = this.measureDistanceCollection.entities.add({
        position: this.positions[this.positions.length - 1],
        id: 'MeasureDistanceVertex' + this.positions[this.positions.length - 1],
        type: 'MeasureDistanceVertex',
        label: {
          text: this.spaceDistance(this.positions) + '米',
          scale: 0.5,
          font: 'normal 30px MicroSoft YaHei',
          // distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 5000),
          // scaleByDistance: new Cesium.NearFarScalar(1000, 1, 3000, 0.4),
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          pixelOffset: new Cesium.Cartesian2(0, -30),
          fillColor: Cesium.Color.fromCssColorString('#000'),
          outlineWidth: 2,
          outlineColor: Cesium.Color.fromCssColorString('green'),
          disableDepthTestDistance: Number.POSITIVE_INFINITY //直接使用深度探测属性让label不被遮挡
          // eyeOffset: new Cesium.Cartesian3(0, 0, -5000);//通过视线偏离让label不被遮挡，设置高度为负值
        },
        point: {
          color: Cesium.Color.FUCHSIA,
          pixelSize: 8,
          // disableDepthTestDistance: 500,
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        }
      } as { [key: string]: any })
      this.vertexEntities.push(vertexEntity)
    }

    //创建起点
    createStartEntity() {
      let vertexEntity = this.measureDistanceCollection.entities.add({
        position: this.positions[0],
        type: 'MeasureDistanceVertex',
        billboard: {
          // vue-cli框架使用
          // image: require("/public/map/staticData/image/icon/marker_bg.png"),
          // vue-vite框架使用
          image: marker_bg,
          // sizeInMeters:true,
          // scaleByDistance: new Cesium.NearFarScalar(300, 1, 1200, 0.4), //设置随图缩放距离和比例
          // distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 10000), //设置可见距离 10000米可见
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM
        },
        point: {
          color: Cesium.Color.FUCHSIA,
          pixelSize: 6
        }
      } as { [key: string]: any })
      this.vertexEntities.push(vertexEntity)
    }

    //创建终点节点
    createEndEntity() {
      //结束时删除最后一个节点的距离标识
      let lastLabel = this.measureDistanceCollection.entities.getById('MeasureDistanceVertex' + this.positions[this.positions.length - 1])
      lastLabel && this.measureDistanceCollection.entities.remove(lastLabel)
      this.moveVertexEntity && this.measureDistanceCollection.entities.remove(this.moveVertexEntity)
      let vertexEntity = this.measureDistanceCollection.entities.add({
        position: this.positions[this.positions.length - 1],
        type: 'MeasureDistanceVertex',
        label: {
          text: '总距离：' + this.spaceDistance(this.positions) + '米',
          scale: 0.5,
          font: 'normal 30px MicroSoft YaHei',
          // distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 5000),
          // scaleByDistance: new Cesium.NearFarScalar(1000, 1.5, 3000, 0.4),
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          pixelOffset: new Cesium.Cartesian2(0, -50),
          fillColor: Cesium.Color.fromCssColorString('#000'),
          outlineWidth: 2,
          outlineColor: Cesium.Color.fromCssColorString('green'),
          eyeOffset: new Cesium.Cartesian3(0, 0, -10)
        },
        billboard: {
          // vue-cli框架使用
          // image: require("/public/map/staticData/image/icon/marker_bg.png"),
          // vue-vite框架使用
          image: marker_bg,
          // scaleByDistance: new Cesium.NearFarScalar(300, 1, 1200, 0.4), //设置随图缩放距离和比例
          // distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 10000), //设置可见距离 10000米可见
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM
        },
        point: {
          color: Cesium.Color.FUCHSIA,
          pixelSize: 6
        }
      } as { [key: string]: any })
      this.vertexEntities.push(vertexEntity)
    }

    //注册鼠标事件
    registerEvents() {
      this.leftClickEvent()
      switch (this.viewer.GS3D_MODULE_TYPE) {
        case 'mobile':
          // 移动端没有移动事件，没有右键事件
          break
        case 'pc':
          this.initOptions.rightEndFlag && this.rightClickEvent()
          this.mouseMoveEvent()
          break
        default:
          break
      }
    }

    //左键点击事件
    leftClickEvent() {
      //单击鼠标左键画点点击事件
      this.handler.setInputAction((e: { [key: string]: any }) => {
        console.log('measureStatus', this.measureStatus)

        this.viewer._element.style.cursor = 'crosshair'
        // let position = this.viewer.scene.pickPosition(e.position);
        // 兼容低版本cesium api，如果pickPosition没获取到点，使用pickEllipsoid获取
        let position = this.viewer.scene.camera.pickEllipsoid(e.position, this.viewer.scene.globe.ellipsoid)
        if (!position) {
          const pickRay = this.viewer.camera.getPickRay(e.position)
          position = pickRay && this.viewer.scene.globe.pick(pickRay, this.viewer.scene)
          console.log(`%c GS3D 距离测量(水平)【leftClickEvent】==> 使用兼容坐标点,ray方式`, `Color:gold`)
        }
        if (!position) {
          position = this.viewer.scene.pickPosition(e.position)
          console.log(`%c GS3D 距离测量(水平)【leftClickEvent】==> 使用兼容坐标点,pickPosition方式`, `Color:gold`)
        }
        if (!position) {
          console.log(`%c GS3D 距离测量(水平)【leftClickEvent】==> 未获取到点击的点位坐标，直接返回`, `Color:#ff145a`)
          return
        }
        this.positions.push(position)
        if (this.positions.length == 1) {
          //首次点击
          this.createLineEntity()
          this.createStartEntity()
          return
        } else if (this.positions.length > 1 && this.viewer.GS3D_MODULE_TYPE === 'mobile') {
          this.tempPositions = this.positions
        }
        console.log(`%c GS3D 距离测量(水平)【leftClickEvent】==> 测距取点`, `Color:springgreen`)
        this.createVertex()
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
    }

    //鼠标移动事件
    mouseMoveEvent() {
      // 地形深度测试
      this.handler.setInputAction((e: { [key: string]: any }) => {
        if (!this.isMeasure) return
        // this.viewer._element.style.cursor = 'default';
        this.viewer._element.style.cursor = 'crosshair'
        // let position = this.viewer.scene.pickPosition(e.endPosition);
        let position = this.viewer.scene.camera.pickEllipsoid(e.endPosition, this.viewer.scene.globe.ellipsoid)
        if (!position) {
          const pickRay = this.viewer.camera.getPickRay(e.endPosition)
          position = pickRay && this.viewer.scene.globe.pick(pickRay, this.viewer.scene)
          console.log(`%c GS3D 距离测量(水平)【mouseMoveEvent】==> 使用兼容坐标点,ray方式`, `Color:gold`)
        }
        if (!position) {
          position = this.viewer.scene.pickPosition(e.endPosition)
          console.log(`%c GS3D 距离测量(水平)【mouseMoveEvent】==> 使用兼容坐标点,pickPosition方式`, `Color:gold`)
        }
        if (!position) {
          console.log(`%c GS3D 距离测量(水平)【mouseMoveEvent】==> 未获取到点击的点位坐标，直接返回`, `Color:#ff145a`)
          return
        }
        this.handleMoveEvent(position)
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
    }

    //处理鼠标移动
    handleMoveEvent(position: Cesium.Cartesian3) {
      if (this.positions.length < 1) return
      this.tempPositions = this.positions.concat(position)
    }

    //右键事件
    rightClickEvent() {
      this.handler.setInputAction((e: { [key: string]: any }) => {
        this.drawEnd()
        console.log('measureStatus', this.measureStatus)
      }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
    }

    //测量结束
    measureEnd() {
      this.measureStatus = 'end'
      this.deactivate()
      this.MeasureEndEvent.raiseEvent([this.measureDistance]) //触发结束事件 传入结果
    }

    //解除鼠标事件
    unRegisterEvents() {
      this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)
      switch (this.viewer.GS3D_MODULE_TYPE) {
        case 'mobile':
          // 移动端没有移动事件，没有右键事件

          break
        case 'pc':
          this.initOptions.rightEndFlag && this.handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK)
          this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE)
          break
        default:
          break
      }
    }

    // 计算距离
    spaceDistance(pointArr: Cesium.Cartesian3[]) {
      if (pointArr.length < 2) {
        return 0
      }
      let lineLength = 0
      for (let i = 0; i < pointArr.length - 1; i++) {
        const ponitObj = pointArr[i]
        lineLength += Cesium.Cartesian3.distance(pointArr[i], pointArr[i + 1])
      }
      return lineLength.toFixed(3)
    }

    // 结束绘制点  针对移动端适配所提供的结束绘制方法
    drawEnd() {
      if (!this.isMeasure || this.positions.length < 1) {
        this.deactivate()
        this.clear()
      } else {
        this.createEndEntity()
        this.lineEntity &&
          (this.lineEntity.polyline = {
            positions: this.positions,
            width: 2,
            material: Cesium.Color.YELLOW,
            depthFailMaterial: Cesium.Color.YELLOW
          })
        this.lineEntityArr && this.lineEntityArr.push(this.lineEntity)
        this.measureEnd()
      }
    }
  }

  /**
   * @description 平面面积测量类
   * @param {Cesium.Viewer} viewer - Cesium容器
   * @param {object} options - 测量的配置选项
   * @return {object}
   */
  export class MeasureArea {
    viewer: Cesium.Viewer & { [key: string]: any }
    initOptions: any
    measureAreaCollection: Cesium.DataSource & { [key: string]: any }
    mesureResultEntity: any | undefined
    positions: any[]
    tempPositions: any[]
    vertexEntities: any[]
    labelEntity: object | undefined
    measureArea: any
    handler: Cesium.ScreenSpaceEventHandler
    MeasureStartEvent: Cesium.Event
    MeasureEndEvent: Cesium.Event
    isMeasure: undefined | boolean
    height: undefined | number
    polygonEntity: undefined | any
    constructor(viewer: Cesium.Viewer & { [key: string]: any }, options: any) {
      this.viewer = viewer
      this.viewer.GS3D_MODULE_TYPE = 'pc'
      this.initOptions = options
      // 面积测量实体集合
      this.measureAreaCollection = new Cesium.CustomDataSource('measureArea')
      this.viewer.dataSources.add(this.measureAreaCollection)
      this.mesureResultEntity = void 0

      // init
      this.positions = []
      this.tempPositions = []
      this.vertexEntities = []
      this.labelEntity = void 0
      this.measureArea = 0 //测量结果

      // initEvents
      this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas)
      this.MeasureStartEvent = new Cesium.Event() //开始事件
      this.MeasureEndEvent = new Cesium.Event() //结束事件
    }

    //激活
    activate() {
      this.initOptions.lastClearFlag && this.clear()
      this.deactivate()
      this.registerEvents() //注册鼠标事件
      //设置鼠标状态
      this.viewer.enableCursorStyle = false
      this.viewer._element.style.cursor = 'crosshair'
      this.isMeasure = true
      this.measureArea = 0
      this.viewer.scene.globe.depthTestAgainstTerrain = true //开启深度探测，用于点击取点时让pickPosition获取到值
      console.log(`%c GS3D 面积测量(水平)【activate】==> 开始`, `Color:springgreen`)
    }

    //禁用
    deactivate() {
      if (!this.isMeasure) return
      this.unRegisterEvents()
      this.viewer._element.style.cursor = 'default'
      this.viewer.enableCursorStyle = true
      this.isMeasure = false
      this.tempPositions = []
      this.positions = []
      this.height = void 0
      this.mesureResultEntity = void 0
      this.viewer.scene.globe.depthTestAgainstTerrain = false //还原深度探测
      console.log(`%c GS3D 面积测量(水平)【deactivate】==> 结束`, `Color:springgreen`)
    }

    //清空绘制
    clear() {
      //清除线面对象
      // this.viewer.entities.remove(this.polygonEntity);
      // this.polygonEntity = void 0;
      //清除节点
      // this.vertexEntities.forEach(item => {
      //   this.viewer.entities.remove(item);
      // });
      // this.vertexEntities = [];
      // this.viewer.entities.remove(this.mesureResultEntity);
      // this.mesureResultEntity = void 0;
      // this.height = void 0;
      // 改造原本的清除方式，使用自定的Cesium.CustomDataSource实体集合
      // 1.把当前创建的实体集合清空
      this.measureAreaCollection.entities.removeAll()
      // 2.由于反复测量会一直new测量类，导致会建立多个measureArea实体集合，故只清除当前的实体集合并不会把地图上的测量结果完全清除完，故从viewer上获取所有的measureArea实体集合
      let ds = this.viewer.dataSources as Cesium.DataSourceCollection & { [key: string]: any }
      ds._dataSources.filter((dataSources: Cesium.DataSource) => dataSources.name === 'measureArea').forEach((dataSource: Cesium.DataSource) => dataSource.entities.removeAll())
      // 3.各个变量回到初始状态
      this.polygonEntity = void 0
      this.vertexEntities = []
      this.mesureResultEntity = void 0
      this.height = void 0
      console.log(`%c GS3D 面积测量(水平)【clear】==> 清除`, `Color:springgreen`)
    }

    //创建面对象
    createPolygonEntity() {
      // this.polygonEntity = this.viewer.entities.add({
      this.polygonEntity = this.measureAreaCollection.entities.add({
        polygon: {
          hierarchy: new Cesium.CallbackProperty(e => {
            return new Cesium.PolygonHierarchy(this.tempPositions)
            //使用最新1.72的时候 必须返回PolygonHierarchy类型 Cannot read property 'length' of void 0
            //低版本好像都可以
          }, false),
          material: Cesium.Color.RED.withAlpha(0.4),
          perPositionHeight: true //
        },
        polyline: {
          positions: new Cesium.CallbackProperty(e => {
            return this.tempPositions.concat(this.tempPositions[0])
          }, false),
          width: 2,
          material: new Cesium.PolylineDashMaterialProperty({
            color: Cesium.Color.YELLOW
          }),
          depthFailMaterial: new Cesium.PolylineDashMaterialProperty({
            color: Cesium.Color.YELLOW
          }),
          clampToGround: true //贴地
          // disableDepthTestDistance: Number.POSITIVE_INFINITY,
        }
      })
    }

    //创建节点
    createVertex() {
      // let vertexEntity = this.viewer.entities.add({
      let vertexEntity: Cesium.Entity & { [key: string]: any } = this.measureAreaCollection.entities.add({
        position: this.positions[this.positions.length - 1],
        type: `MeasureAreaVertex`,
        point: {
          color: Cesium.Color.FUCHSIA,
          pixelSize: 8,
          // disableDepthTestDistance: 500,
          // Number.POSITIVE_INFINITY无穷大 ，既任何时候都不进行 深度探测
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        }
      } as { [key: string]: any })
      this.vertexEntities.push(vertexEntity)
    }

    //测量结果标签
    createResultLabel() {
      console.log('面积测量-创建结果标签-实体')
      this.mesureResultEntity = new Cesium.Entity({
        position: new Cesium.CallbackProperty(e => {
          return this.getCenterPosition()
        }, false),
        type: `MeasureAreaResult`,
        label: {
          text: new Cesium.CallbackProperty(e => {
            return '面积' + this.computeArea(this.tempPositions) + '平方米'
          }, false),
          scale: 0.5,
          font: 'normal 28px MicroSoft YaHei',
          // distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 5000),
          // scaleByDistance: new Cesium.NearFarScalar(1000, 1, 3000, 0.4),
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          pixelOffset: new Cesium.Cartesian2(0, -30),
          outlineWidth: 9,
          outlineColor: Cesium.Color.YELLOW
        }
      } as { [key: string]: any })
      this.measureAreaCollection.entities.add(this.mesureResultEntity)
      // // this.mesureResultEntity = this.viewer.entities.add({
      // this.mesureResultEntity = this.measureAreaCollection.entities.add({
      //   position: new Cesium.CallbackProperty(e => {
      //     return this.getCenterPosition()
      //   }, false),
      //   type: `MeasureAreaResult`,
      //   label: {
      //     text: new Cesium.CallbackProperty(e => {
      //       return "面积" + this.computeArea(this.tempPositions) + "平方米";
      //     }, false),
      //     scale: 0.5,
      //     font: 'normal 28px MicroSoft YaHei',
      //     // distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 5000),
      //     // scaleByDistance: new Cesium.NearFarScalar(1000, 1, 3000, 0.4),
      //     verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      //     style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      //     pixelOffset: new Cesium.Cartesian2(0, -30),
      //     outlineWidth: 9,
      //     outlineColor: Cesium.Color.YELLOW
      //   },
      // });
    }

    //获取节点的中心点
    getCenterPosition() {
      let points: any[] = []
      if (this.tempPositions.length < 3) return this.tempPositions[0]
      this.tempPositions.forEach(position => {
        const point3d = this.cartesian3ToPoint3D(position)
        points.push([point3d.x, point3d.y])
      })

      //构建turf.js  lineString
      let geo = turf.lineString(points)
      let bbox = turf.bbox(geo)
      let bboxPolygon = turf.bboxPolygon(bbox)
      let pointOnFeature = turf.center(bboxPolygon)
      let lonLat = pointOnFeature.geometry.coordinates

      return Cesium.Cartesian3.fromDegrees(lonLat[0], lonLat[1], this.height!! + 0.3)
    }

    //注册鼠标事件
    registerEvents() {
      this.leftClickEvent()
      switch (this.viewer.GS3D_MODULE_TYPE) {
        case 'mobile':
          // 移动端没有移动事件，没有右键事件
          break
        case 'pc':
          this.initOptions.rightEndFlag && this.rightClickEvent()
          this.mouseMoveEvent()
          break
        default:
          break
      }
    }

    //左键点击事件
    leftClickEvent() {
      let that = this
      let clickIdx = 0
      //单击鼠标左键画点点击事件
      that.handler.setInputAction((e: { [key: string]: any }) => {
        that.viewer._element.style.cursor = 'crosshair'
        // let position = that.viewer.scene.pickPosition(e.position);
        let position = that.viewer.scene.camera.pickEllipsoid(e.position, that.viewer.scene.globe.ellipsoid)
        if (!position) {
          const pickRay = that.viewer.camera.getPickRay(e.position)
          position = pickRay && that.viewer.scene.globe.pick(pickRay, that.viewer.scene)
          console.log(`%c GS3D 面积测量(水平)【leftClickEvent】==> 使用兼容坐标点,ray方式`, `Color:gold`)
        }
        if (!position) {
          position = that.viewer.scene.pickPosition(e.position)
          console.log(`%c GS3D 面积测量(水平)【leftClickEvent】==> 使用兼容坐标点,pickPosition方式`, `Color:gold`)
        }
        if (!position) {
          console.log(`%c GS3D 面积测量(水平)【leftClickEvent】==> 未获取到点击的点位坐标，直接返回`, `Color:#ff145a`)
          return
        }
        that.positions.push(position)
        that.height = that.unifiedHeight(that.positions, that.height)
        clickIdx++
        if (that.positions.length == 1) {
          //首次点击
          console.log(`面积测量点击第${clickIdx}个点`, that.positions)
          that.createPolygonEntity()
        } else if (that.positions.length == 2 && that.viewer.GS3D_MODULE_TYPE == 'mobile') {
          // 第二次点击应该出现面积线
          // that.tempPositions = that.positions.concat(position);
          that.tempPositions = that.positions
          // if (that.tempPositions.length >= 3 && !that.mesureResultEntity) {
          //   that.createResultLabel();
          // }
          console.log(`面积测量点击第${clickIdx}个点`, that.tempPositions)
        } else if (that.positions.length > 2 && that.viewer.GS3D_MODULE_TYPE == 'mobile') {
          // 第三次点击应该出现面积数值
          // that.tempPositions = that.positions.concat(position);
          that.tempPositions = that.positions
          console.log(`面积测量点击第${clickIdx}个点`, that.tempPositions)
          if (that.tempPositions.length >= 3 && !that.mesureResultEntity) {
            console.log(`面积测量创建结果标签`, that.tempPositions)
            that.createResultLabel()
          }
        }
        that.createVertex()
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
    }

    //鼠标移动事件
    mouseMoveEvent() {
      this.handler.setInputAction((e: { [key: string]: any }) => {
        if (!this.isMeasure) return
        this.viewer._element.style.cursor = 'crosshair'
        // let position = this.viewer.scene.pickPosition(e.endPosition);
        let position = this.viewer.scene.camera.pickEllipsoid(e.endPosition, this.viewer.scene.globe.ellipsoid)
        if (!position) {
          const pickRay = this.viewer.camera.getPickRay(e.endPosition)
          position = pickRay && this.viewer.scene.globe.pick(pickRay, this.viewer.scene)
          console.log(`%c GS3D 面积测量(水平)【mouseMoveEvent】==> 使用兼容坐标点,ray方式`, `Color:gold`)
        }
        if (!position) {
          position = this.viewer.scene.pickPosition(e.endPosition)
          console.log(`%c GS3D 面积测量(水平)【mouseMoveEvent】==> 使用兼容坐标点,pickPosition方式`, `Color:gold`)
        }
        if (!position) {
          console.log(`%c GS3D 面积测量(水平)【mouseMoveEvent】==> 未获取到点击的点位坐标，直接返回`, `Color:#ff145a`)
          return
        }
        this.handleMoveEvent(position)
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
    }

    //处理鼠标移动
    handleMoveEvent(position: Cesium.Cartesian3) {
      if (this.positions.length < 1) return
      this.height = this.unifiedHeight(this.positions, this.height)
      this.tempPositions = this.positions.concat(position)
      if (this.tempPositions.length >= 3 && !this.mesureResultEntity) {
        this.createResultLabel()
      }
    }

    //统一节点的高度
    unifiedHeight(positions: Cesium.Cartesian3[], height: undefined | number) {
      if (!height) height = this.getPositionHeight(positions[0]) //如果没有指定高度 就用第一个的高度
      let point3d
      for (let i = 0; i < positions.length; i++) {
        const element = positions[i]
        point3d = this.cartesian3ToPoint3D(element)
        positions[i] = Cesium.Cartesian3.fromDegrees(point3d.x, point3d.y, height)
      }

      return height
    }

    //获取某个点的高度
    getPositionHeight(position: Cesium.Cartesian3) {
      const cartographic = Cesium.Cartographic.fromCartesian(position)
      return cartographic.height
    }
    //笛卡尔坐标转经纬度
    cartesian3ToPoint3D(position: Cesium.Cartesian3) {
      const cartographic = Cesium.Cartographic.fromCartesian(position)
      const lon = Cesium.Math.toDegrees(cartographic.longitude)
      const lat = Cesium.Math.toDegrees(cartographic.latitude)
      return {
        x: lon,
        y: lat,
        z: cartographic.height
      }
    }

    //右键事件
    rightClickEvent() {
      this.handler.setInputAction((e: { [key: string]: any }) => {
        this.drawEnd()
      }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
    }

    // 计算面积
    computeArea(points: any[]) {
      points = points.map(item => {
        return {
          lon: Cesium.Math.toDegrees(Cesium.Cartographic.fromCartesian(item).longitude),
          lat: Cesium.Math.toDegrees(Cesium.Cartographic.fromCartesian(item).latitude),
          hei: Cesium.Cartographic.fromCartesian(item).height
        }
      })
      let radiansPerDegree = Math.PI / 180.0 //角度转化为弧度(rad)
      let degreesPerRadian = 180.0 / Math.PI //弧度转化为角度
      // 角度
      function Angle(p1: any, p2: any, p3: any) {
        let bearing21 = Bearing(p2, p1)
        let bearing23 = Bearing(p2, p3)
        let angle = bearing21 - bearing23
        if (angle < 0) {
          angle += 360
        }
        return angle
      }
      // 方向
      function Bearing(from: any, to: any) {
        let lat1 = from.lat * radiansPerDegree
        let lon1 = from.lon * radiansPerDegree
        let lat2 = to.lat * radiansPerDegree
        let lon2 = to.lon * radiansPerDegree
        let angle = -Math.atan2(Math.sin(lon1 - lon2) * Math.cos(lat2), Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon1 - lon2))
        if (angle < 0) {
          angle += Math.PI * 2.0
        }
        angle = angle * degreesPerRadian //角度
        return angle
      }
      // 距离
      function distance(point1: Cesium.Cartesian3, point2: Cesium.Cartesian3) {
        let point1cartographic = Cesium.Cartographic.fromCartesian(point1)
        let point2cartographic = Cesium.Cartographic.fromCartesian(point2)
        // 根据经纬度计算出距离
        let geodesic = new Cesium.EllipsoidGeodesic()
        geodesic.setEndPoints(point1cartographic, point2cartographic)
        let s = geodesic.surfaceDistance
        //console.log(Math.sqrt(Math.pow(distance, 2) + Math.pow(endheight, 2)));
        //返回两点之间的距离
        // s = Math.sqrt(Math.pow(s, 2) + Math.pow(point2cartographic.height - point1cartographic.height, 2))
        return s
      }

      let res = 0
      //拆分三角曲面

      for (let i = 0; i < points.length - 2; i++) {
        let j = (i + 1) % points.length
        let k = (i + 2) % points.length
        let totalAngle = Angle(points[i], points[j], points[k])

        let dis_temp1 = distance(this.tempPositions[j], this.tempPositions[0])
        let dis_temp2 = distance(this.tempPositions[k], this.tempPositions[0])
        res += (dis_temp1 * dis_temp2 * Math.sin(totalAngle)) / 2
        // console.log(res);
      }
      // return Math.abs((res / 1000000.0).toFixed(4));//平方千米
      return Math.abs(+res.toFixed(4)) //平方米
    }

    // 结束绘制
    drawEnd() {
      if (!this.isMeasure || this.positions.length < 3) {
        this.deactivate()
        this.clear()
      } else {
        this.tempPositions = [...this.positions]
        this.polygonEntity.polyline = {
          positions: this.positions.concat(this.positions[0]),
          width: 2,
          material: Cesium.Color.YELLOW,
          depthFailMaterial: new Cesium.PolylineDashMaterialProperty({
            color: Cesium.Color.YELLOW
          })
        }
        this.polygonEntity.polygon.hierarchy = new Cesium.PolygonHierarchy(this.tempPositions)
        this.mesureResultEntity!!.position = this.getCenterPosition()
        this.mesureResultEntity!!.label.text = '总面积' + this.computeArea(this.positions) + '平方米'
        this.measureEnd()
      }
    }

    //测量结束
    measureEnd() {
      this.deactivate()
      this.MeasureEndEvent.raiseEvent(this.measureArea) //触发结束事件 传入结果
    }

    //解除鼠标事件
    unRegisterEvents() {
      this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)
      switch (this.viewer.GS3D_MODULE_TYPE) {
        case 'mobile':
          // 移动端没有移动事件，没有右键事件
          break
        case 'pc':
          this.initOptions.rightEndFlag && this.handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK)
          this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE)
          break
        default:
          break
      }
    }
  }

  // 坐标拾取：可拾取模型和地形上的坐标
  function getCatesian3FromPX(viewer: Cesium.Viewer, px: any) {
    if (!Cesium.defined(viewer) || !Cesium.defined(px)) return

    let cartesian,
      isOn3dtiles = false, // 点是否在3DTileset上
      picks = viewer.scene.drillPick(px)
    viewer.scene.render()
    for (let i = 0; i < picks.length; i++) {
      if (picks[i] && picks[i].primitive && picks[i].primitive instanceof Cesium.Cesium3DTileset) {
        isOn3dtiles = true // 模型上拾取坐标
        break
      }
    }

    if (isOn3dtiles) {
      cartesian = viewer.scene.pickPosition(px)
    } else {
      let ray = viewer.camera.getPickRay(px)
      if (!Cesium.defined(ray)) return
      if (ray) cartesian = viewer.scene.globe.pick(ray, viewer.scene)
    }
    return cartesian
  }

  function addPointWithLabel(viewer: Cesium.Viewer, position: Cesium.Cartesian3) {
    if (!Cesium.defined(position) || !Cesium.defined(viewer)) return

    let entity = viewer.entities.add({
      position,
      point: {
        show: true,
        outlineColor: Cesium.Color.YELLOW,
        pixelSize: 6,
        outlineWidth: 2,
        disableDepthTestDistance: Number.MAX_VALUE
      },
      label: {
        font: '18px Helvetica',
        fillColor: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        pixelOffset: new Cesium.Cartesian2(0, -60)
      }
    })

    return [entity.id, entity]
  }

  function getLngLatHeiFromCartesian3(cartesian: Cesium.Cartesian3) {
    if (!Cesium.defined(cartesian)) return

    let cartographic = Cesium.Cartographic.fromCartesian(cartesian)
    let { latitude, longitude, height } = cartographic
    return [Cesium.Math.toDegrees(longitude), Cesium.Math.toDegrees(latitude), height]
  }

  function getHeiMidFromCartesian3(p1, p2) {
    if (!Cesium.defined(p1) || !Cesium.defined(p2)) return

    let cartographic1 = Cesium.Cartographic.fromCartesian(p1)
    let cartographic2 = Cesium.Cartographic.fromCartesian(p2)
    let height = Math.abs(cartographic1.height - cartographic2.height)
    let mid = Cesium.Cartesian3.midpoint(p1, p2, new Cesium.Cartesian3())
    return [height, mid]
  }

  // 计算方位角
  function getAzimutht(positions) {
    if (!Cesium.defined(positions) || positions.length < 2) return

    let center = positions[0].clone()
    let mtx = Cesium.Transforms.eastNorthUpToFixedFrame(center.clone())
    let mtxInverse = Cesium.Matrix4.inverse(mtx, new Cesium.Matrix4())
    let aim = positions[1].clone()
    center = Cesium.Matrix4.multiplyByPoint(mtxInverse, center, new Cesium.Cartesian3())
    aim = Cesium.Matrix4.multiplyByPoint(mtxInverse, aim, new Cesium.Cartesian3())

    let newC = Cesium.Cartesian3.subtract(aim, center, new Cesium.Cartesian3())
    newC = Cesium.Cartesian3.normalize(newC, new Cesium.Cartesian3())

    const north = new Cesium.Cartesian3(0, 1, 0)
    const arc_north = Cesium.Cartesian3.dot(north, newC)
    const east = new Cesium.Cartesian3(1, 0, 0) // east用于判断与正北是否大于180度
    const arc_east = Cesium.Cartesian3.dot(east, aim)

    const radians_north = Math.acos(arc_north)
    let dg = Cesium.Math.toDegrees(radians_north)
    if (arc_east < 0) dg = 360 - dg
    return dg
  }

  function addLabel(viewer, position, text = '') {
    if (!Cesium.defined(position) || !Cesium.defined(viewer)) return

    let entity = viewer.entities.add({
      position,
      label: {
        text,
        font: '18px Helvetica',
        fillColor: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        pixelOffset: new Cesium.Cartesian2(0, -20)
      }
    })

    return [entity.id, entity]
  }

  function addPoint(viewer, position) {
    if (!Cesium.defined(position) || !Cesium.defined(viewer)) return

    let entity = viewer.entities.add({
      position,
      point: {
        pixelSize: 6,
        color: Cesium.Color.AQUA.withAlpha(0.8),
        outlineWidth: 1,
        outlineColor: Cesium.Color.WHITE.withAlpha(0.8),
        disableDepthTestDistance: Number.POSITIVE_INFINITY
      },
      show: false
    })

    return [entity.id, entity]
  }
  function addPolyline(viewer, positions, clampToGround = false, hasArrow = false) {
    if (!Cesium.defined(positions) || !Cesium.defined(viewer)) return

    let material = hasArrow
      ? new Cesium.PolylineArrowMaterialProperty(Cesium.Color.GOLD)
      : new Cesium.PolylineOutlineMaterialProperty({
          color: Cesium.Color.GOLD,
          outlineWidth: 1,
          outlineColor: Cesium.Color.BLACK
        })

    let entity = viewer.entities.add({
      polyline: {
        positions,
        show: true,
        material,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        width: hasArrow ? 6 : 3,
        clampToGround: clampToGround
      }
    })

    return [entity.id, entity]
  }

  // class MeasureLngLatHei {
  //   viewer: Cesium.Viewer & { [key: string]: any }
  //   handler: Cesium.ScreenSpaceEventHandler
  //   description:string
  //   point:any
  //   state:string
  //   userCursor:string

  //   constructor(viewer: Cesium.Viewer & { [key: string]: any }, options: any) {
  //     this.viewer = viewer;
  //     this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);

  //     this.point = null;

  //     this.description =
  //       "经纬度高度：未加载地形时，计算的高度将会是相对于椭球体（默认为WGS84椭球体）的海拔高度";

  //     this.userCursor=this.viewer.canvas.style.cursor
  //     this.state = "";
  //     let val=this.state
  //     Object.defineProperty(this,'state',{
  //       get:()=>{
  //         return val
  //       },
  //       set:(newVal)=>{
  //         val=newVal
  //       }
  //     })

  //   }

  //   start() {
  //     this.state = "start";

  //     this.handler.setInputAction(() => {
  //       if (this.handler) {
  //         this.state = "end";
  //         this.handler.destroy();
  //       }
  //     }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  //     this.handler.setInputAction((evt:any) => {
  //       let cartesian = getCatesian3FromPX(this.viewer, evt.endPosition);
  //       if (!cartesian) return;

  //       !this.point
  //         ? ([, this.point] = addPointWithLabel(this.viewer, cartesian))
  //         : (this.point.position = cartesian);

  //       let [lng, lat, hei] = getLngLatHeiFromCartesian3(cartesian);
  //       this.point.label.text =
  //         `经度：${lng.toFixed(6)}°\n` +
  //         `纬度：${lat.toFixed(6)}°\n` +
  //         `高度：${hei.toFixed(2)}m`;
  //     }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  //   }

  //   destroy() {
  //     this.state = "destroy";

  //     if (this.point)
  //       this.viewer.entities.remove(this.point) && (this.point = null);

  //     /* 控制插件 */
  //     if (this.handler) this.handler.destroy();
  //   }
  // }
  class MeasureTwoPoint {
    viewer: Cesium.Viewer & { [key: string]: any }
    handler: Cesium.ScreenSpaceEventHandler
    polylineClampToGround: undefined | any
    controlPoints: any[]
    positions: any[]
    polyline: any
    floatLabel: any
    hasArrow: boolean

    constructor(viewer) {
      this.viewer = viewer
      this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas)
      // this.prompt = null
      // this.promptStyle = {
      //   show: true,
      //   offset: {
      //     x: 20,
      //     y: 20
      //   }
      // }
      this.polylineClampToGround = !!this.viewer.terrainProvider.availability // 有地形则贴地
      // this.hasArrow = false;

      this.controlPoints = []
      this.positions = []
      this.polyline = null
      this.floatLabel = null
    }

    start() {
      // if (this.promptStyle.show) this.prompt = new Prompt(this.viewer, this.promptStyle)

      this.handler.setInputAction(evt => {
        let cartesian = getCatesian3FromPX(this.viewer, evt.position)
        if (!cartesian) return

        let [, point] = addPoint(this.viewer, cartesian.clone())
        this.controlPoints.push(point)

        if (this.positions.length == 2) {
          this.positions[1] = cartesian.clone()
          this.end()
        } else {
          this.positions.push(cartesian.clone())
          let positionsCallbackProperty = new Cesium.CallbackProperty(() => this.positions, false)
          ;[, this.polyline] = addPolyline(this.viewer, positionsCallbackProperty, this.polylineClampToGround, this.hasArrow)
          ;[, this.floatLabel] = addLabel(this.viewer, cartesian.clone())
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

      this.handler.setInputAction(evt => {
        if (this.positions.length < 1) return
        // if (this.positions.length < 1) return this.prompt.update(evt.endPosition, '单击开始测量')
        // this.prompt.update(evt.endPosition, '单击结束')

        let cartesian = getCatesian3FromPX(this.viewer, evt.endPosition)
        if (!cartesian) return
        this.positions.length < 2 ? this.positions.push(cartesian.clone()) : (this.positions[1] = cartesian.clone())

        this.updateText()
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
    }

    end() {
      if (this.handler) this.handler.destroy()

      // if (this.prompt) this.prompt.destroy() && (this.prompt = null)
    }

    destroy() {
      if (this.polyline) this.viewer.entities.remove(this.polyline) && (this.polyline = null)

      if (this.floatLabel) this.viewer.entities.remove(this.floatLabel) && (this.floatLabel = null)

      this.controlPoints.forEach(point => {
        this.viewer.entities.remove(point)
      })
      this.controlPoints = []

      this.positions = []
    }
    updateText() {}
  }
  export class MeasureAzimutht extends MeasureTwoPoint {
    constructor(viewer) {
      super(viewer)
      this.hasArrow = true
    }

    updateText() {
      let azimutht = getAzimutht(this.positions)
      this.floatLabel.label.text = `方位角：${azimutht.toFixed(2)}`
    }
  }

  // MeasureLngLatHei
}
