import * as Cesium from 'cesium'
class HawkEyeMap {
  _viewer: any
  _hawkEyeMap: any
  _isMainMapTrigger: boolean
  _isEyeMapTrigger: boolean
  constructor(viewer: any) {
    this._viewer = viewer
    this._hawkEyeMap = null
    // 判断事件是主图触发还是鹰眼地图触发
    this._isMainMapTrigger = false
    this._isEyeMapTrigger = false
  }

  // 初始化函数
  init(options?: any) {
    let {
      layer = {
        url: 'http://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
        minimumLevel: 3,
        maximumLevel: 18
      }
    } = options || {}
    this._hawkEyeMap = new Cesium.Viewer('hawkEyeMap', {
      infoBox: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      baseLayerPicker: false,
      navigationHelpButton: false,
      animation: false,
      timeline: false,
      fullscreenButton: false
    })
    const control = this._hawkEyeMap.scene.screenSpaceCameraController
    // control.enableRotate = false
    // control.enableTranslate = false
    control.enableZoom = false
    control.enableTilt = false
    // control.enableLook = false

    this._hawkEyeMap.cesiumWidget.creditContainer.style.display = 'none'
    this._hawkEyeMap.scene.backgroundColor = Cesium.Color.TRANSPARENT
    this._hawkEyeMap.imageryLayers.removeAll()

    // 鹰眼图中添加高德路网中文注记图
    this._hawkEyeMap.imageryLayers.addImageryProvider(new Cesium.UrlTemplateImageryProvider(layer))

    // 引起事件监听的相机变化幅度
    this._viewer.camera.percentageChanged = 0.02
    this._hawkEyeMap.camera.percentageChanged = 0.5

    this._bindEvent()
  }

  // 绑定事件
  _bindEvent() {
    // 鹰眼与主图同步
    this._viewer.camera.changed.addEventListener(this._syncEyeMap, this)
    // 第一次刷新渲染时联动
    this._viewer.scene.preRender.addEventListener(this._syncEyeMap, this)

    // 主图与鹰眼图同步
    this._hawkEyeMap.camera.changed.addEventListener(this._syncMap, this)
    this._hawkEyeMap.scene.preRender.addEventListener(this._syncMap, this)
  }

  // 同步主图与鹰眼地图
  _syncEyeMap() {
    // 监听主图
    new Cesium.ScreenSpaceEventHandler(this._viewer.canvas).setInputAction(() => {
      this._isMainMapTrigger = true
      this._isEyeMapTrigger = false
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

    // 判断是否为主图移动
    if (!this._isMainMapTrigger) {
      return false
    }

    this._hawkEyeMap.camera.flyTo({
      destination: this._viewer.camera.position,
      orientation: {
        heading: this._viewer.camera.heading,
        pitch: this._viewer.camera.pitch,
        roll: this._viewer.camera.roll
      },
      duration: 0.0
    })
  }

  // 鹰眼地图与主图联动效果
  _syncMap() {
    // 监听鹰眼地图
    new Cesium.ScreenSpaceEventHandler(this._hawkEyeMap.canvas).setInputAction(() => {
      this._isMainMapTrigger = false
      this._isEyeMapTrigger = true
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN)

    // 判断是否为鹰眼地图移动
    if (!this._isEyeMapTrigger) {
      return false
    }
    this._viewer.camera.flyTo({
      destination: this._hawkEyeMap.camera.position,
      orientation: {
        heading: this._hawkEyeMap.camera.heading,
        pitch: this._hawkEyeMap.camera.pitch,
        roll: this._hawkEyeMap.camera.roll
      },
      duration: 0.0
    })
  }
  destroy() {
    this._viewer.camera.changed.removeEventListener(this._syncEyeMap, this)
    this._viewer.scene.preRender.removeEventListener(this._syncEyeMap, this)
    this._hawkEyeMap.camera.changed.removeEventListener(this._syncMap, this)
    this._hawkEyeMap.scene.preRender.removeEventListener(this._syncMap, this)
  }
}
export default HawkEyeMap
