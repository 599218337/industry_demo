import * as Cesium from 'cesium'

const { Viewer } = Cesium
type CesiumViewerType = typeof Cesium.Viewer
export namespace viewer {
  export const describe: string = '视图API封装'
  // 默认地球视图配置项，此配置会构建一个纯净的地球
  const defViewerOpt = {
    selectionIndicator: false, //是否启用地图选择
    sceneMode: Cesium.SceneMode.SCENE3D,
    animation: false, // 动画部件
    fullscreenButton: false, // 全屏按钮部件
    vrButton: false, // vr部件
    geocoder: false, // 位置搜索部件
    homeButton: false, // home按钮
    infoBox: false, // 消息框部件
    sceneModePicker: false, // 二三维切换部件
    timeline: false, // 时间轴部件
    navigationHelpButton: false, // 导航帮助按钮
    navigationInstructionsInitiallyVisible: false, // 导航说明显示
    baseLayerPicker: false // 基础图层部件
  }
  Object.freeze(defViewerOpt) //模块内的变量只可被访问，不可被修改，保持模块的稳固性

  // 不使用此方式，直接对Viewer继承即为Cesium.Viewer类型，只是编辑器中不显示为Cesium.Viewer
  // 创建名为 CesiumViewerType 的类型别名，用于表示 typeof Cesium.Viewer。然后，在继承声明中使用 (Viewer as CesiumViewerType) 把 gs3dviewer 类声明为 typeof Cesium.Viewer 类型。通过这种方式，虽然在编辑器中选择 gs3dviewer 时它仍然显示为 typeof gs3dviewer，但类型检查会正确识别它为 typeof Cesium.Viewer 类型。
  // class gs3dviewer extends (Cesium.Viewer as CesiumViewerType) {
  //   constructor(container: Element | string, options?: object) {
  //     options = { ...defViewerOpt, options }
  //     super(container, options)
  //   }
  // }
  // // 检查 gs3dviewer 类型是否为 typeof Cesium.Viewer
  // const isTypeOfCesiumViewer: boolean =
  //   gs3dviewer.prototype instanceof Cesium.Viewer
  // console.log('isTypeOfCesiumViewer', isTypeOfCesiumViewer) // true or false

  /**
   * @description 初始化视图
   * @Remarks 初始化构建一个纯净的地球视图。系对Cesium.Viewer的扩展。
   * @class Viewer
   * @classdesc This class represents a viewer.
   * @extends Cesium.Viewer
   * @return {*}
   */
  export class gs3dviewer extends Viewer {
    constructor(container: Element | string, options?: object) {
      options = { ...defViewerOpt, ...options }
      console.log('%c GS3D ==> Viewer配置项', `color: #ff145a`, options)
      super(container, options)
    }
  }
}
