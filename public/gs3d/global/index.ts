/*
 * @Descripttion: <全局>
 * @version: 1.0.0
 * @Author: GS3D
 * @Date: 2023-08-22 18:18:25
 * @LastEditors: lzz 599218337@qq.com
 * @LastEditTime: 2024-04-30 10:48:41
 * @FilePath \\geogrid3d\\packages\\sdk\\gs3d\\global\\index.ts
 * Copyright 2023
 * listeners
 */

import * as Cesium from 'cesium'
import * as core from '../core'
import { AnnotationExample } from './AnnotationExample'
import { nameSpace } from './nameSpace'
import { variable } from './variable'
import * as util from '../util'
import * as tools from '../tools'
const {
  common: { getUuid }
} = util
const {
  mapBase: { mapCameraMaxHeight, mapCameraMinHeight, mapCameraReset, mapChangeView }
} = tools

const describe: string = '全局'

/**
 * @description 初始化地球
 * @param {HTMLElement} container - 地球容器HTML\地球容器对应的标识String。
 *
 * 跳转至示例方法： @see {@link http://localhost:9536/example?treeCurrentKey=initViewer | 初始化地球}
 *
 * @return {*} - Cesium地图容器
 * @example
 * ```ts
 * //调用示例
 * gs3d.global.initViewer('id')
 * ```
 */
function initViewer(container: HTMLElement | string): Cesium.Viewer
/**
 * @param {HTMLElement} container - 地球容器HTML\地球容器对应的标识String。
 * @param {object} options - Viewer配置项，参照文档设置，默认生成一个纯净的地球。
 * @return {*} - Cesium地图容器
 * @example
 * ```ts
 * //调用示例
 * gs3d.global.initViewer('id',{...})
 * ```
 */
function initViewer(container: HTMLElement | string, options: { [key: string]: any }): Cesium.Viewer
/**
 * @param {HTMLElement} container - 地球容器HTML\地球容器对应的标识String。
 * @param {object} options - Viewer配置项，参照文档设置，默认生成一个纯净的地球。
 * @param {any} config - 自定义配置，默认{}，可缺省。
 * @return {*} - Cesium地图容器
 * @example
 * ```ts
 * // options 可选配置项
 * {
 *   animation: true, //boolean。默认：true,如果设置为 false，则不会创建“动画”构件。
 *   baseLayerPicker: true, //boolean。默认：true,如果设置为 false，则不会创建 BaseLayerPicker 小组件。
 *   fullscreenButton: true, //boolean。默认：true,如果设置为 false，则不会创建 FullscreenButton 小部件。
 *   vrButton: false, //boolean。默认：false,如果设置为 true，则将创建 VRButton 小部件。
 *   geocoder: true, //boolean?|?Array.<GeocoderService>。默认：true,如果设置为 false，则不会创建 Geocoder 微件。
 *   homeButton: false, //boolean。默认：true,如果设置为 false，则不会创建 HomeButton 小部件。
 *   infoBox: true, //boolean。默认：true,如果设置为 false，则不会创建 InfoBox 小部件。
 *   sceneModePicker: true, //boolean。默认：true,如果设置为 false，则不会创建 SceneModePicker 小组件。
 *   selectionIndicator: true, //boolean。默认：true,如果设置为 false，则不会创建 SelectionIndicator 小部件。
 *   timeline: false, //boolean。默认：true,如果设置为 false，则不会创建“时间轴”小组件。
 *   navigationHelpButton: true, //boolean。默认：true,如果设置为 false，则不会创建导航帮助按钮。
 *   navigationInstructionsInitiallyVisible: true, //boolean。默认：true,如果导航指令最初应可见，则为 true;如果在用户显式单击按钮之前不应显示导航指令，则为 false。
 *   scene3DOnly: false, //boolean。默认：false,如果为 true，则每个几何体实例将仅以 3D 形式呈现，以节省 GPU 内存。
 *   shouldAnimate: false, //boolean。默认：false,如果时钟默认应尝试提前模拟时间，则为 true，否则为 false。此选项优先于设置 Viewer#clockViewModel。
 *   clockViewModel: new Cesium.ClockViewModel(), //ClockViewModel。默认：new ClockViewModel(clock),用于控制当前时间的时钟视图模型。
 *   selectedImageryProviderViewModel: void 0, //ProviderViewModel。默认：未设置,当前基础影像图层的视图模型（如果未提供，则使用第一个可用的基础图层）。仅当“baseLayerPicker”设置为 true 时，此值才有效。
 *   imageryProviderViewModels: createDefaultImageryProviderViewModels(), //Array.<ProviderViewModel>。默认： * createDefaultImageryProviderViewModels(),要从 BaseLayerPicker 中选择的 ProviderViewModel 数组。仅当“baseLayerPicker”设置为 true 时，此 * 值才有效。
 *   selectedTerrainProviderViewModel: void 0, //ProviderViewModel。默认：未设置,当前基础地形图层的视图模型，如果未提供，则使用第一个可用的基础图层。仅当“baseLayerPicker”设置为 true 时，此值才有效。
 *   terrainProviderViewModels: createDefaultTerrainProviderViewModels(), //Array.<ProviderViewModel>。默认： * createDefaultTerrainProviderViewModels(),要从 BaseLayerPicker 中选择的 ProviderViewModel 数组。仅当“baseLayerPicker”设置为 true 时，此 * 值才有效。
 *   baseLayer: ImageryLayer.fromWorldImagery(), //ImageryLayer | false。默认：ImageryLayer.fromWorldImagery(),应用于地球的最底部影像图层。如果设置为 false，则不会添加任何影像提供者。仅当“baseLayerPicker”设置为 false 时，此值才有效。
 *   terrainProvider: new Cesium.EllipsoidTerrainProvider(), //TerrainProvider。默认：new EllipsoidTerrainProvider(),要使用的 terrain 提供程序
 *   terrain: void 0, //Terrain。默认：未设置,处理异步 terrain 提供程序的 terrain 对象。只能指定 options.terrainProvider 是否未定义。
 *   skyBox: void 0, //SkyBox | false。默认：未设置,用于渲染星星的天空盒。如果未定义，则使用默认星号。如果设置为 false，则不会添加 skyBox、Sun 或 Moon。
 *   skyAtmosphere: void 0, //SkyAtmosphere | false。默认：未设置,蔚蓝的天空，以及地球边缘的光芒。设置为 false 将其关闭。
 *   fullscreenElement: document.body, //Element?|?string。默认：document.body,按下全屏按钮时要置于全屏模式的元素或 ID。
 *   useDefaultRenderLoop: true, //boolean。默认：true,如果此小部件应控制渲染循环，则为 true，否则为 false。
 *   targetFrameRate: void 0, //number。默认：未设置,使用默认渲染循环时的目标帧速率。
 *   showRenderLoopErrors: true, //boolean。默认：true,如果为 true，则如果发生渲染循环错误，此小组件将自动向用户显示包含错误的 HTML 面板。
 *   useBrowserRecommendedResolution: true, //boolean。默认：true,如果为 true，则以浏览器建议的分辨率呈现，并忽略 window.devicePixelRatio。
 *   automaticallyTrackDataSourceClocks: true, //boolean。默认：true,如果为 true，则此小组件将自动跟踪新添加的 DataSource 的时钟设置，并在DataSource 的时钟发生变化时进行更新。如果要独立配置时钟，请将其设置为 false。
 *   contextOptions: void 0, //ContextOptions。默认：未设置,传递给 Scene 的 Context 和 WebGL 创建属性。
 *   sceneMode: Cesium.SceneMode.SCENE3D, //SceneMode。默认：SceneMode.SCENE3D,初始场景模式。
 *   mapProjection: new Cesium.GeographicProjection(), //MapProjection。默认：new GeographicProjection(),要在 2D 和哥伦布视图模式下使用的地图投影。
 *   globe: new Cesium.Globe(Cesium.MapProjection.Ellipsoid), //Globe | false。默认：new Globe(mapProjection.ellipsoid),要在场景中使用的地球。如果设置为 false，则不会添加地球。
 *   orderIndependentTranslucency: true, //boolean。默认：true,如果为 true，并且配置支持它，请使用与顺序无关的半透明性。
 *   creditContainer: void 0, //Element?|?string。默认：未设置,将包含 CreditDisplay 的 DOM 元素或 ID。如果未指定，则配额将添加到小部件本身的底部。
 *   creditViewport: void 0, //Element?|?string。默认：未设置,DOM 元素或 ID，它将包含由 CreditDisplay 创建的信用弹出窗口。如果未指定，它将出现在小部件本身上。
 *   dataSources: new Cesium.DataSourceCollection(), //DataSourceCollection。默认：new DataSourceCollection(),小组件可视化的数据源集合。如果提供此参数，则假定该实例归调用方所有，并且在销毁查看器时不会销毁。
 *   shadows: false, //boolean。默认：false,确定阴影是否由光源投射。
 *   terrainShadows: Cesium.ShadowMode.RECEIVE_ONLY, //ShadowMode。默认：ShadowMode.RECEIVE_ONLY,确定地形是投射还是接收来自光源的阴影。
 *   mapMode2D: Cesium.MapMode2D.INFINITE_SCROLL, //MapMode2D。默认：MapMode2D.INFINITE_SCROLL,确定 2D 地图是可旋转的，还是可以在水平方向上无限滚动。
 *   projectionPicker: false, //boolean。默认：false,如果设置为 true，则将创建 ProjectionPicker 小部件。
 *   blurActiveElementOnCanvasFocus: true, //boolean。默认：true,如果为 true，则在单击查看器的画布时，活动元素将模糊。如果仅为了检索位置或实体数据而单击画布，而实际上没有将画布设置为活动元素，则将此值设置为 false 非常有用。
 *   requestRenderMode: false, //boolean。默认：false,如果为 true，则仅在需要时渲染帧，具体取决于场景中的更改。启用此选项可降低应用程序的 CPU/GPU 使用率，并减少移动设备上的电池电量，但需要使用 Scene#requestRender 在此模式下显式渲染新帧。在许多情况下，在对 API 的其他部分的场景进行更改后，这将是必要的。请参阅使用显式渲染提高性能。
 *   maximumRenderTimeChange: 0, //number。默认：0,如果 requestRenderMode 为 true，则此值定义在请求渲染之前允许的模拟时间的最大变化。请参阅使用显式渲染提高性能。
 *   depthPlaneEllipsoidOffset: 0, //number。默认：0,调整 DepthPlane 以解决椭圆体零高程以下的渲染伪影。
 *   msaaSamples: 1 //number。默认：1,如果提供，则此值控制多采样抗锯齿的速率。典型的多重采样率为每像素 2、4 个，有时甚至是 8 个样本。较高的 MSAA采样率可能会影响性能，以换取视觉质量的提高。此值仅适用于支持多采样呈现目标的 WebGL2 上下文。
 * }
 * // config 自定义配置参数 完整配置项说明请查看单独的配置文件说明，此处只示例部分配置
 * {
 *   map: {
 *     type: '3d',//2d/3d/custom,默认3d,2d为平面视图，3d为立体视图，(当设置2d/3d时,center中设置pitch无效),custom为自定义视图，此时会遵照center中的配置进行视图初始化
 *     '-lockMouse': true,// 根据地图视图类型确定，当配置为'2d'模式时,若不想锁定鼠标,需要追加配置lockMouse:false,这样在2d模式下,仍然可以转动地球。
 *     center: {
 *       longitude_BJ_desc: '北京-116.38889583805896,39.911103086820084(2d)/40.283103086820084(3d)',
 *       longitude: 116.38889583805896, //number,经度
 *       latitude: 40.283103086820084, //number,纬度
 *       height: 400000, //number,高度
 *       heading: 0, //number,偏航角
 *       pitch: -45, //number,俯仰角
 *       duration: 0 //number,飞行时间
 *     },
 *     '-minHeight': 30000,//number,相机可降低的最小高度,默认不启用。
 *     '-maxHeight': 100000,//number,相机可升高的最大高度，默认不启用
 *     customParam: {//object,用户自定义配置，用于配置初始化地球的样式，默认不启用，将根据上述示例options中的配置项进行配置。若启用，需配置自定义方案
 *       earthType: 'DEFAULT',//string,用户自定义方案选择，与下方earthScheme中的key保持一致
 *       earthScheme: {
 *         DEFAULT: {
 *           useFPS: false,//boolean,是否显示帧率
 *           useImageryLayers: true,//boolean,是否使用影像
 *           useSun: false,//boolean,是否展示太阳
 *           useMoon: false,//boolean,是否展示月亮
 *           useSkybox: false,//boolean,是否使用天空盒
 *           sceneBackgroundcolor: 'black',//ColorString,场景背景颜色，十六进制颜色字符串
 *           useFxaa: false,//boolean,是否使用抗锯齿
 *           useGlobe: true,//boolean,是否使用全球
 *           useGroundAtmosphere: true,//boolean,是否使用地面大气
 *           globalBasecolor: 'black',//ColorString,获取或设置没有可用图像时的地球颜色。
 *           useGlobeTranslucencyenabled: false,//boolean,用于控制地球半球半透明的属性。
 *           globeUndergroundcolor: 'black'//ColorString,当摄像机位于地下或地球仪时，用于渲染地球背面的颜色为半透明，根据摄像机的距离与地球颜色混合。要禁用设置为undefined。
 *         }
 *       }
 *     }
 *   }
 * }
 * //调用示例
 * gs3d.global.initViewer('id',{...},{...})
 * ```
 */
function initViewer(container: HTMLElement | string, options: { [key: string]: any }, config: any): Cesium.Viewer
function initViewer(container: HTMLElement | string, options?: { [key: string]: any }, config: any = {}): Cesium.Viewer {
  const { gs3dConfig } = variable
  // if (!(variable as any)?.gs3dLicense) {
  //   console.log('证书无效或过期,请先核验证书,await gs3d.initLicense()')
  //   return
  // }
  let defaultConfig = { ...gs3dConfig, ...config }
  Cesium.Ion.defaultAccessToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlNTE2ZjQxMC1kM2MzLTQ2ZjYtOWRmMy1iMDI2ZDMzNzk2MjQiLCJpZCI6MTUyOTU4LCJpYXQiOjE2ODkwMzkyNjZ9.XtK5M64XDm9A2DKCvB1orTDETPMZYsVMNyemQ_QjDiA'
  //初始化定位到配置文件中所处于的矩形范围内
  // if (defaultConfig?.map?.rectangle) {
  //   Cesium.Camera.DEFAULT_VIEW_RECTANGLE = Cesium.Rectangle.fromDegrees(...defaultConfig.map.rectangle)
  // }
  let customParam = defaultConfig?.map?.customParam?.earthScheme[defaultConfig?.map?.customParam?.earthType]
  const viewer: Cesium.Viewer & { [key: string]: any } = new core.viewer.gs3dviewer(container, options)
  // 对地球默认参数之外的地球效果进行控制，包括相机、地球样式、地球事件等等
  _setCustomViewerOptions({ viewer, ...customParam, ...options })
  // 追加viewer唯一标识UUID
  viewer.UUID = getUuid(18)
  //设置中键放大缩小
  viewer.scene.screenSpaceCameraController.zoomEventTypes = [Cesium.CameraEventType.WHEEL, Cesium.CameraEventType.MIDDLE_DRAG, Cesium.CameraEventType.PINCH]
  //设置右键旋转
  viewer.scene.screenSpaceCameraController.tiltEventTypes = [
    Cesium.CameraEventType.RIGHT_DRAG,
    Cesium.CameraEventType.PINCH,
    {
      eventType: Cesium.CameraEventType.RIGHT_DRAG,
      modifier: Cesium.KeyboardEventModifier.CTRL
    },
    {
      eventType: Cesium.CameraEventType.MIDDLE_DRAG,
      modifier: Cesium.KeyboardEventModifier.CTRL
    }
  ]
  //右键快速向上拉调三维视角
  // viewer.scene.screenSpaceCameraController.constrainedPitch =
  //   Cesium.Math.toRadians(0)
  viewer.scene.screenSpaceCameraController.minimumPickingTerrainHeight = Cesium.Math.toRadians(0)
  // 去除版权信息
  const creditContainer = viewer.cesiumWidget.creditContainer as HTMLElement
  creditContainer.style.display = 'none'
  // 注意初始化为地球配置视角类型和初始化视角位置一定不能弄混，先设置地球类型，再设置视角
  // 初始化地图为主配置的视角类型
  mapChangeView({ viewer, type: defaultConfig?.map?.type, lockMouse: defaultConfig?.map?.lockMouse })
  // 设置相机最大高度
  mapCameraMaxHeight({ viewer, maxHeight: defaultConfig?.map?.maxHeight })
  // 设置相机可被降低的最小高度
  mapCameraMinHeight({ viewer, minHeight: defaultConfig?.map?.minHeight })
  // 创建底图
  // createMap(CesiumConfig.value.baseMaps.layers[0].children)
  // 初始化视角位置
  mapCameraReset({ viewer, ...defaultConfig?.map?.center })
  variable.viewer = viewer
  console.log('%c GS3D initViewer ==>初始化Viewer完成', `color: #ff145a`, viewer)
  return viewer
}
const _setCustomViewerOptions = (options: any) => {
  let defaultOptions = {
    useFPS: false,
    useImageryLayers: true,
    useSun: void 0,
    useMoon: void 0,
    useSkybox: void 0,
    sceneBackgroundcolor: 'black', // Color.BLACK
    useFxaa: false,
    useGlobe: true,
    useGroundAtmosphere: true,
    globalBasecolor: 'black',
    useGlobeTranslucencyenabled: false,
    globeUndergroundcolor: 'black' //禁用为void 0
  }

  options = { ...defaultOptions, ...options }
  let viewer: Cesium.Viewer & { [key: string]: any } = options.viewer
  // FPS 显示帧率
  viewer.scene.debugShowFramesPerSecond = options?.useFPS //useFPS
  //移除地球默认图层
  options.useImageryLayers === false && viewer.imageryLayers.removeAll() //useImageryLayers
  //地球背景透明
  viewer.scene.sun.show = options?.useSun //useSun
  viewer.scene.moon.show = options?.useMoon //useMoon
  viewer.scene.skyBox.show = options?.useSkybox //useSkybox
  // 背景颜色，仅在没有天空框时才可见
  switch (options.sceneBackgroundcolor) {
    case 'transparent':
      viewer.scene.backgroundColor = Cesium.Color.TRANSPARENT
      break
    case 'undefined':
      viewer.scene.backgroundColor = void 0
      break
    default:
      viewer.scene.backgroundColor = Cesium.Color.fromCssColorString(options.sceneBackgroundcolor)
      break
  }
  // viewer.scene.backgroundColor = Cesium.Color.fromCssColorString(options?.sceneBackgroundcolor) //sceneBackgroundcolor,
  // 开启抗锯齿
  viewer.scene.postProcessStages.fxaa.enabled = options?.useFxaa //useFxaa
  // 地球球体透明
  viewer.scene.globe.show = options?.useGlobe //useGlobe
  // 地球大气
  viewer.scene.globe.showGroundAtmosphere = options?.useGroundAtmosphere //useGroundAtmosphere
  // 地球颜色
  switch (options.globalBasecolor) {
    case 'transparent':
      viewer.scene.globe.baseColor = Cesium.Color.TRANSPARENT
      break
    case 'undefined':
      viewer.scene.globe.baseColor = void 0
      break
    default:
      viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString(options.globalBasecolor)
      break
  }
  // viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString(options?.globalBasecolor) //globalBasecolor,Cesium.Color.TRANSPARENT
  //如果为 true，则地球将渲染为半透明表面。
  viewer.scene.globe.translucency.enabled = options.useGlobeTranslucencyenabled //useGlobeTranslucencyenabled
  // 当摄像机位于地下或地球仪时，用于渲染地球背面的颜色为半透明，根据摄像机的距离与地球颜色混合。要禁用地下着色，请设置为 undefined 。
  // viewer.scene.globe.undergroundColor = Cesium.Color.fromCssColorString(options?.globeUndergroundcolor) //globeUndergroundcolor
  switch (options.globeUndergroundcolor) {
    case 'transparent':
      viewer.scene.globe.undergroundColor = Cesium.Color.TRANSPARENT
      break
    case 'undefined':
      viewer.scene.globe.undergroundColor = void 0
      break
    default:
      viewer.scene.globe.undergroundColor = Cesium.Color.fromCssColorString(options.globeUndergroundcolor)
      break
  }
  // 类型判断
  /*
  //1.不配置属性名称，默认black   
  2.配置属性名称为'undefined'  则禁用
  3.配置属性名称为'transparent'，则为Cesium.Color.TRANSPARENT
  4.配置属性名称为16进制颜色，则进行颜色转化
                            default   transparent   use(16进制任意颜色)    unUse
  sceneBackgroundcolor      black     transparent   fromCssColorString    void 0
  globalBasecolor           black     transparent   fromCssColorString    void 0
  globeUndergroundcolor     black     transparent   fromCssColorString    void 0
    switch (options?.sceneBackgroundcolor) {
      case 'transparent':
        viewer.scene.backgroundColor = Cesium.Color.TRANSPARENT
        break;
      case 'undefined':
        viewer.scene.backgroundColor = void 0
        break;
      default:
        viewer.scene.backgroundColor = Cesium.Color.fromCssColorString(options.sceneBackgroundcolor)
        break;
    }
  */
  // 尝试合并优化代码
  // 背景颜色，仅在没有天空框时才可见
  // 地球颜色
  // 当摄像机位于地下或地球仪时，用于渲染地球背面的颜色为半透明，根据摄像机的距离与地球颜色混合。要禁用地下着色，请设置为 undefined 。
  // _setColor(options, {
  //   sceneBackgroundcolor: ['scene', 'backgroundColor'],
  //   globalBasecolor: ['scene', 'globe', 'baseColor'],
  //   globeUndergroundcolor: ['scene', 'globe', 'undergroundColor']
  // })
}
const _setColor = (options: any, mapAttr: any) => {
  debugger
  let viewer = options.viewer
  // 当所配置的属性为改变颜色时的映射判断，为了代码复用，取出设置颜色的属性位置，故配置上颜色所在位置
  // const attrColorMap = {
  //   sceneBackgroundcolor: ['scene', 'backgroundColor'],
  //   globalBasecolor: ['scene', 'globe', 'baseColor'],
  //   globeUndergroundcolor: ['scene', 'globe', 'undergroundColor']
  // }
  const attrColorMap = mapAttr
  // options
  // {
  //   globalBasecolor: 'black',
  //   useGlobeTranslucencyenabled: false,
  //   globeUndergroundcolor: 'black' //禁用为void 0
  // }
  let viewObj = viewer
  for (const key in options) {
    if (Object.prototype.hasOwnProperty.call(options, key)) {
      // black    ---    globalBasecolor
      const element = options[key]
      // 获取到对应的api对象 baseColor
      attrColorMap[key]?.forEach((ele: any) => {
        viewObj = viewObj[ele]
      })
      // 有映射才会修改对应的值
      if (attrColorMap[key]) {
        switch (element) {
          case 'transparent':
            viewObj = Cesium.Color.TRANSPARENT
            console.log('看这看这', key, viewObj, element)
            break
          case 'undefined':
            viewObj = void 0
            console.log('看这看这', key, viewObj, element)
            break
          default:
            viewObj = Cesium.Color.fromCssColorString(element)
            console.log('看这看这', key, viewObj, element)
            break
        }
      }
      viewObj = viewer
    }
  }
}
export { describe, initViewer, AnnotationExample, nameSpace, variable }
