import * as global from '../global/index'
import { layerLoader } from './layerLoader'
import * as Cesium from 'cesium'
const {
  variable,
  variable: { gs3dConfig, gs3dAllLayer }
} = global
export namespace layerManager {
  export const describe: string = '图层管理'

  type layerOptionType = {
    id: string
    label?: string
    type: string
    layer: any
    data?: any
  }

  let layerOption = {
    id: void 0 || '未配置服务ID',
    label: '未配置服务名称',
    type: void 0 || '未配置服务类型',
    layer: void 0,
    data: void 0
  } as layerOptionType

  /**
   * 图层类型映射,type取值从下表中选择
   * [[include:/manager/layerManager/layerTypesMap.md]]
   */
  export enum layerTypesMap {
    /**
     * 添加地图服务，使用Cesium API - ArcGisMapServerImageryProvider.
     *
     * 方法参数：{@link  layerLoader.MapServerLayerOptions}
     *
     * 图层类型：{@link layerTypesMap}
     *
     * 图层加载：{@link addLayer}
     *
     * @example
     * ```ts
     * //以下参数详细释义，请点击上面连接【方法参数】进行查看。
     * //示例
     * let options = {
     *  id: "test-mapserver1",
     *  label: "门头沟MS服务",
     *  type: "mapserver",
     *  url: "http://192.168.1.88:6080/arcgis/rest/services/bjmtg1/MapServer",
     *  layers: "1,2,3,4",
     *  _rectangle: [115.83984375000001, 40.078125, 116.01562499999999, 40.25390625],
     *  tilingScheme: 'geo',
     *  enablePickFeatures: true,
     *  callback: callback1,
     *  useProviderExtend: false
     * }
     * // 调用示例
     * gs3d.manager.layerManager.addLayer(options)
     * ```
     */
    mapserver = 'addMapServerLayer',
    /**
     * 方法参数：{@link layerLoader.MapBoxLayerOptions}
     *
     * 图层类型：{@link layerTypesMap}
     *
     * 图层加载：{@link addLayer}
     */
    mapbox = 'addMapBoxLayer',
    /**
     * 方法参数：{@link layerLoader.MapBoxStyleLayerOptions}
     *
     * 图层类型：{@link layerTypesMap}
     *
     * 图层加载：{@link addLayer}
     */
    mapboxstyle = 'addMapBoxStyleLayer',
    /**
     * 方法参数：{@link layerLoader.OSMLayerOptions}
     *
     * 图层类型：{@link layerTypesMap}
     *
     * 图层加载：{@link addLayer}
     */
    osm = 'addOSMLayer',
    /**
     * 方法参数：{@link layerLoader.SingleTileLayerOptions}
     *
     * 图层类型：{@link layerTypesMap}
     *
     * 图层加载：{@link addLayer}
     */
    singletile = 'addSingleTileLayer',
    /**
     * 方法参数：{@link layerLoader.TMSLayerOptions}
     *
     * 图层类型：{@link layerTypesMap}
     *
     * 图层加载：{@link addLayer}
     */
    tms = 'addTMSLayer',
    /**
     * 方法参数：{@link layerLoader.UrlTemplateLayerOptions}
     *
     * 图层类型：{@link layerTypesMap}
     *
     * 图层加载：{@link addLayer}
     *
     * @example
     * ```ts
     * //以下参数详细释义，请点击上面连接【方法参数】进行查看。
     * //示例
     * let options = {
     *  id: 'tdtyx-zjfw',
     *  label: '天地图影像带注记服务',
     *  type: 'urltemplate',
     *  subdomains: ['01', '02', '03', '04'],
     *  url: 'http://webst{s}.is.autonavi.com/appmaptile?style=8&x={x}&y={y}&z={z}'
     * }
     * // 调用示例
     * gs3d.manager.layerManager.addLayer(options)
     * ```
     */
    urltemplate = 'addUrlTemplateLayer',
    /**
     * 方法参数：{@link layerLoader.WMSLayerOptions}
     *
     * 图层类型：{@link layerTypesMap}
     *
     * 图层加载：{@link addLayer}
     *
     * @example
     * ```ts
     * //以下参数详细释义，请点击上面连接【方法参数】进行查看。
     * //示例
     * let options = {
     *  id: 'mtg_wms',
     *  label: '门头沟_wms【mtg_wms】',
     *  type: 'wms',
     *  layers: '1',
     *  url: 'http://192.168.1.88:6080/arcgis/services/bjmtg1/MapServer/WMSServer'
     * }
     * // 调用示例
     * gs3d.manager.layerManager.addLayer(options)
     * ```
     */
    wms = 'addWMSLayer',
    /**
     * 方法参数：{@link layerLoader.WMTSLayerOptions}
     *
     * 图层类型：{@link layerTypesMap}
     *
     * 图层加载：{@link addLayer}
     *
     * @example
     * ```ts
     * //以下参数详细释义，请点击上面连接【方法参数】进行查看。
     * //示例
     * let options = {
     *  id:"wmts-kvpair",
     *  type:"wmts",
     *  label:"wmts服务kvpair访问方式",
     *  urlMethod:"kvpair",
     *  url: 'http://127.0.0.1:8081/geoserver/gwc/service/wmts',
     *  name: 'gisdata:mtg_dem',
     *  style: 'default', //default/raster
     *  format: 'image/png',
     *  // tileMatrixSetID: 'EPSG:4326',
     *  // tileMatrixLabels: ['EPSG:4326:0','EPSG:4326:1','EPSG:4326:2','EPSG:4326:3','EPSG:4326:4','EPSG:4326:5','EPSG:4326:6','EPSG:4326:7','EPSG:4326:8','EPSG:4326:9','EPSG:4326:10','EPSG:4326:11','EPSG:4326:12','EPSG:4326:13','EPSG:4326:14','EPSG:4326:15','EPSG:4326:16','EPSG:4326:17','EPSG:4326:18','EPSG:4326:19','EPSG:4326:20','EPSG:4326:21'],
     *  // maximumLevel: 21,
     *  // tilingScheme: 'geo',
     *  tileMatrixSetID: 'EPSG:900913',
     *  tileMatrixLabels: ['EPSG:900913:0','EPSG:900913:1','EPSG:900913:2','EPSG:900913:3','EPSG:900913:4','EPSG:900913:5','EPSG:900913:6','EPSG:900913:7','EPSG:900913:8','EPSG:900913:9','EPSG:900913:10','EPSG:900913:11','EPSG:900913:12','EPSG:900913:13','EPSG:900913:14','EPSG:900913:15','EPSG:900913:16','EPSG:900913:17','EPSG:900913:18','EPSG:900913:19','EPSG:900913:20','EPSG:900913:21','EPSG:900913:22','EPSG:900913:23','EPSG:900913:24','EPSG:900913:25','EPSG:900913:26','EPSG:900913:27','EPSG:900913:28','EPSG:900913:29','EPSG:900913:30'],
     *  maximumLevel: 30
     * }
     * // 调用示例
     * gs3d.manager.layerManager.addLayer(options)
     * ```
     */
    wmts = 'addWMTSLayer',
    /**
     * 方法参数：{@link layerLoader.CesiumTerrainLayerOptions}
     *
     * 图层类型：{@link layerTypesMap}
     *
     * 图层加载：{@link addLayer}
     */
    cesium_terrain = 'addCesiumTerrainLayer',
    /**
     * 方法参数：{@link layerLoader.EllipsoidTerrainLayerOptions}
     *
     * 图层类型：{@link layerTypesMap}
     *
     * 图层加载：{@link addLayer}
     */
    ellipsoid_terrain = 'addEllipsoidTerrainLayer',
    /**
     * 方法参数：{@link layerLoader.GoogleTerrainLayerOptions}
     *
     * 图层类型：{@link layerTypesMap}
     *
     * 图层加载：{@link addLayer}
     */
    google_terrain = 'addGoogleTerrainLayer',
    /**
     * 方法参数：{@link layerLoader.ArcGisMapServerLayerOptions}
     *
     * 图层类型：{@link layerTypesMap}
     *
     * 图层加载：{@link addLayer}
     */
    arcgis_mapserver = 'addArcGisMapServerLayer',
    /**
     * 方法参数：{@link layerLoader.ArcGisDynamicLayerOptions}
     *
     * 图层类型：{@link layerTypesMap}
     *
     * 图层加载：{@link addLayer}
     */
    arcgis_dynamic = 'addArcGisDynamicLayer',
    /**
     * 方法参数：{@link layerLoader.ArcGisImageServerLayerOptions}
     *
     * 图层类型：{@link layerTypesMap}
     *
     * 图层加载：{@link addLayer}
     */
    arcgis_imageserver = 'addArcGisImageServerLayer',
    /**
     * 方法参数：{@link layerLoader.ArcGisTileServerLayerOptions}
     *
     * 图层类型：{@link layerTypesMap}
     *
     * 图层加载：{@link addLayer}
     */
    arcgis_tileserver = 'addArcGisTileServerLayer',
    /**
     * 方法参数：{@link layerLoader.ArcGisFeatureServerLayerOptions}
     *
     * 图层类型：{@link layerTypesMap}
     *
     * 图层加载：{@link addLayer}
     */
    arcgis_featurserver = 'addArcGisFeatureServerLayer',
    /**
     * 方法参数：{@link layerLoader.ArcGisTerrainLayerOptions}
     *
     * 图层类型：{@link layerTypesMap}
     *
     * 图层加载：{@link addLayer}
     */
    arcgis_terrain = 'addArcGisTerrainLayer',
    /**
     * 方法参数：{@link layerLoader.ArcGisWMTSLayerOptions}
     *
     * 图层类型：{@link layerTypesMap}
     *
     * 图层加载：{@link addLayer}
     */
    arcgis_wmts = 'addArcGisWMTSLayer',
    /**
     * 方法参数：{@link layerLoader.ArcGisWMSLayerOptions}
     *
     * 图层类型：{@link layerTypesMap}
     *
     * 图层加载：{@link addLayer}
     *
     * @example
     * ```ts
     * //以下参数详细释义，请点击上面连接【方法参数】进行查看。
     * //示例
     * let options = {
     *  id: 'mtg_arcgis_wms',
     *  label: '门头沟_arcgis_wms【mtg_arcgis_wms】',
     *  type: 'arcgis_wms',
     *  layers: '0',
     *  url: 'http://192.168.1.88:6080/arcgis/services/bjmtg1/MapServer/WMSServer'
     * }
     * // 调用示例
     * gs3d.manager.layerManager.addLayer(options)
     * ```
     */
    arcgis_wms = 'addArcGisWMSLayer',
    /**
     * 方法参数：{@link layerLoader.ArcGisOdlineLayerOptions}
     *
     * 图层类型：{@link layerTypesMap}
     *
     * 图层加载：{@link addLayer}
     */
    arcgis_odline = 'addArcGisOdlineLayer',
    /**
     * 方法参数：{@link layerLoader.GeoServerWMSLayerOptions}
     *
     * 图层类型：{@link layerTypesMap}
     *
     * 图层加载：{@link addLayer}
     *
     * @example
     * ```ts
     * //以下参数详细释义，请点击上面连接【方法参数】进行查看。
     * //示例
     * let options = {
     *  id: 'anhui_geoserver_wms',
     *  label: '安徽省_geoserver_wms【anhui_geoserver_wms】',
     *  type: 'geoserver_wms',
     *  layers: 'anhui:安徽省',
     *  url: 'http://192.168.1.88:8081/geoserver/anhui/wms'
     * }
     * // 调用示例
     * gs3d.manager.layerManager.addLayer(options)
     * ```
     */
    geoserver_wms = 'addGeoServerWMSLayer',
    /**
     * 方法参数：{@link layerLoader.GeoServerWMTSLayerOptions}
     *
     * 图层类型：{@link layerTypesMap}
     *
     * 图层加载：{@link addLayer}
     */
    geoserver_wmts = 'addGeoServerWMTSLayer',
    /**
     * 方法参数：{@link layerLoader.GeoServerTMSLayerOptions}
     *
     * 图层类型：{@link layerTypesMap}
     *
     * 图层加载：{@link addLayer}
     */
    geoserver_tms = 'addGeoServerTMSLayer',
    /**
     * 方法参数：{@link layerLoader.GeoServerWFSLayerOptions}
     *
     * 图层类型：{@link layerTypesMap}
     *
     * 图层加载：{@link addLayer}
     */
    geoserver_wfs = 'addGeoServerWFSLayer',
    /**
     * 方法参数：{@link layerLoader.GeoServerWCSLayerOptions}
     *
     * 图层类型：{@link layerTypesMap}
     *
     * 图层加载：{@link addLayer}
     */
    geoserver_wcs = 'addGeoServerWCSLayer',
    /**
     * 方法参数：{@link layerLoader.MapboxMVTLayerOptions}
     *
     * 图层类型：{@link layerTypesMap}
     *
     * 图层加载：{@link addLayer}
     */
    mapbox_mvt = 'addMapboxMVTLayer',
    /**
     * 方法参数：{@link layerLoader.SkylineTerrainLayerOptions}
     *
     * 图层类型：{@link layerTypesMap}
     *
     * 图层加载：{@link addLayer}
     */
    skyline_terrain = 'addSkylineTerrainLayer',
    /**
     * 方法参数：{@link layerLoader.SkylineImageLayerOptions}
     *
     * 图层类型：{@link layerTypesMap}
     *
     * 图层加载：{@link addLayer}
     */
    skyline_image = 'addSkylineImageLayer',
    /**
     * 方法参数：{@link layerLoader.SkylineFeatureLayerOptions}
     *
     * 图层类型：{@link layerTypesMap}
     *
     * 图层加载：{@link addLayer}
     */
    skyline_feature = 'addSkylineFeatureLayer',
    /**
     * 方法参数：{@link layerLoader.ModelS3MLayerOptions}
     *
     * 图层类型：{@link layerTypesMap}
     *
     * 图层加载：{@link addLayer}
     */
    model_s3m = 'addModelS3MLayer',
    /**
     * 方法参数：{@link layerLoader.ModelI3SLayerOptions}
     *
     * 图层类型：{@link layerTypesMap}
     *
     * 图层加载：{@link addLayer}
     */
    model_i3s = 'addModelI3SLayer',
    /**
     * 方法参数：{@link layerLoader.ModelGltfLayerOptions}
     *
     * 图层类型：{@link layerTypesMap}
     *
     * 图层加载：{@link addLayer}
     */
    model_gltf = 'addModelGltfLayer',
    /**
     * 方法参数：{@link layerLoader.Model3dTilesLayerOptions}
     *
     * 图层类型：{@link layerTypesMap}
     *
     * 图层加载：{@link addLayer}
     *
     * @example
     * ```ts
     *   //以下参数详细释义，请点击上面连接【方法参数】进行查看。
     *   //示例
     *     let options = {
     *       id: 'dayanta',//唯一值id
     *       label: '大雁塔3dtiles',//标签名
     *       type: 'model_3d_tiles',//类型
     *       url: 'https://earthsdk.com/v/last/Apps/assets/dayanta/tileset.json',//模型地址
     *       setPosition: {//设置位置和高度，可选值，默认位置为模型原始位置，默认高度0
     *         lng: 123.3918,
     *         lat: 41.7947,
     *         height: 100//数字
     *       },
     *       translation: {//平移，可选值，默认xyz值均为0
     *         x: 200,
     *         y: 0,
     *         z: -430
     *       },
     *       rotate: {//旋转，可选值，默认xyz值均为0
     *         x: 0,
     *         y: 0,
     *         z: 0
     *       },
     *       scale: 1,//缩放，可选值，默认1
     *       islocation: true,//是否定位到模型，可选值，默认false
     *       isShowOriginPoint: true//是否显示模型原始中心点，可选值，默认false
     *     }
     *     // 调用示例
     *     gs3d.manager.layerManager.addLayer(options)
     * ```
     */
    model_3d_tiles = 'addModel3dTilesLayer',
    /**
     * 方法参数：{@link layerLoader.OtherGaodeLayerOptions}
     *
     * 图层类型：{@link layerTypesMap}
     *
     * 图层加载：{@link addLayer}
     *
     * @example
     * ```ts
     * //以下参数详细释义，请点击上面连接【方法参数】进行查看。
     * //示例
     * let options = {
     *  id: 'gdyx-fw',//唯一标识
     *  label: '高德矢量服务',//标签名
     *  type: 'other_gaode',//类型
     *  url: 'https://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}',//服务地址
     *  minimumLevel: 3,//number | undefined,可选，影像提供程序支持的最低细节层次
     *  maximumLevel: 18,//number | undefined,可选，影像提供程序支持的最高细节层次
     * }
     * // 调用示例
     * gs3d.manager.layerManager.addLayer(options)
     * ```
     */
    other_gaode = 'addOtherGaodeLayer',
    /**
     * 方法参数：{@link layerLoader.OtherBaiduLayerOptions}
     *
     * 图层类型：{@link layerTypesMap}
     *
     * 图层加载：{@link addLayer}
     */
    other_baidu = 'addOtherBaiduLayer',
    /**
     * 方法参数：{@link layerLoader.OtherOpenStreetMapLayerOptions}
     *
     * 图层类型：{@link layerTypesMap}
     *
     * 图层加载：{@link addLayer}
     */
    other_openStreetMap = 'addOtherOpenStreetMapLayer',
    /**
     * <p style='color:blue'>在 ImageryProvider 平铺方案中的每个渲染图块周围绘制一个框，并在其中绘制一个标签，指示图块的 X、Y 和级别坐标。这对于调试地形和影像渲染问题非常有用。</p>
     *
     * 方法参数：{@link layerLoader.TileCoordinatesLayerOptions}
     *
     * 图层类型：{@link layerTypesMap}
     *
     * 图层加载：{@link addLayer}
     */
    cesium_tileCoord = 'addTileCoordinatesLayer'
  }
  // 函数参数类型声明
  type methodOptionsType = {
    AddLayer: string | object | string[] | object[]
    RemoveLayer?: string | object | string[] | object[]
    SetLayerAlpha: object | object[]
  }
  // 函数重载，用于声明方法被调用时，提示列举调用的集中传参方式
  interface Overloads {
    AddLayer: AddLayer
    RemoveLayer: RemoveLayer
    SetLayerAlpha: SetLayerAlpha
  }
  // addLayer方法的函数重载
  interface AddLayer {
    (layerId: string): Promise<any[] | void>
    (layerConfig: object): Promise<any[] | void>
    (layerIdArray: Array<string>): Promise<any[] | void>
    (layerConfigArray: Array<object>): Promise<any[] | void>
  }
  // removeLayer方法的函数重载
  interface RemoveLayer {
    (): any[]
    (layerId: string): any[]
    (layerConfig: object): any[]
    (layerIdArray: Array<string>): any[]
    (layerConfigArray: Array<object>): any[]
  }
  // setLayerAlpha方法的函数重载
  interface SetLayerAlpha {
    (layerIdAndAlpha: object): void
    (layerIdAndAlphaArray: Array<object>): void
  }

  /**
   * 递归搜索函数，按id检索
   * @param {any} layerConfig - 图层配置
   * @param {string} id - 当前搜索节点的id
   */
  const __getLayerOptionsByID = (layerConfig: any, id: string) => {
    if (layerConfig.id == id) return layerConfig
    if (layerConfig.children && layerConfig.children.length > 0) {
      for (let i = 0; i < layerConfig.children.length; i++) {
        let item = layerConfig.children[i]
        let targetOptions: any = __getLayerOptionsByID(item, id)
        if (targetOptions != null) return targetOptions
      }
    } else {
      return null
    }
  }

  // 根据图层配置id获取图层属性
  const _getLayerOptionsByID = (id: string) => {
    if (id == null) return null
    let treeData = gs3dConfig.layerTree.treeData
    for (let i = 0; i < treeData.length; i++) {
      let item = treeData[i]
      let targetOptions = __getLayerOptionsByID(item, id)
      if (targetOptions != null) return targetOptions
    }
  }

  // 辅助 图层参数归一化
  const _paramformatNormalize = (options?: any) => {
    let optionsType = Object.prototype.toString.call(options)
    const mapDataTypes: any = {
      '[object Number]': () => {
        return [{ id: String(options) }]
      },
      '[object String]': () => {
        return [{ id: options }]
      },
      '[object Object]': () => {
        return [options]
      },
      '[object Array]': () => {
        if (!options.length) {
          throw new Error('Array must have elements')
        }
        let optionsType = Object.prototype.toString.call(options[0])
        const mapDataTypes: any = {
          '[object Number]': () => {
            options = options.map((item: number) => {
              return { id: String(item) }
            })
            return options
          },
          '[object String]': () => {
            options = options.map((item: string) => {
              return { id: item }
            })
            return options
          },
          '[object Object]': () => {
            return options
          }
        }
        return mapDataTypes[optionsType]()
      },
      '[object Undefined]': () => void 0
    }
    if (mapDataTypes[optionsType]) {
      return mapDataTypes[optionsType]() //直接调用分支的方法，实现不同的事件逻辑
    } else {
      console.log('mapDataTypes->不知道什么图层')
      return options
    }
  }

  //#region 添加图层
  /**
   * @description 添加图层
   * @overload
   * @param {string} layerId 图层Id
   * @return {Promise<any[] | void>}
   * @example
   * ```ts
   *   // 添加单个图层
   *   let options1 = 'tdtyx-zjfw';//通过单个id进行图层加载，此时会检索图层配置文件，找到id对应的配置进行图层加载
   *   // 调用方式
   *   gs3d.manager.layerManager.addLayer(options1)
   * ```
   */
  export async function addLayer(layerId: string): Promise<any[] | void>
  /**
   * 不同类型的图层详细参数，请查看{@link layerTypesMap}枚举，根据下方 Parameters 中的 type 进行检索。
   * @overload
   * @param {object} layerConfig 图层配置项
   * @param {string} layerConfig.type 图层类型
   * @return {Promise<any[] | void>}
   * @example
   * ```ts
   *   // 添加单个图层
   *   let options2 = {id:'tdtyx-zjfw',type:'wmts',url:'',...};//通过详细的图层配置进行图层加载
   *   // 调用方式
   *   gs3d.manager.layerManager.addLayer(options2)
   * ```
   */
  export async function addLayer<T>(layerConfig: T & { type: keyof typeof layerTypesMap & string }): Promise<any[] | void>
  /**
   * @Remarks 不同type的图层参数配置，参考【layerLoader】部分解释说明
   * @overload
   * @param {Array} layerOptionArray - 添加单个或多个图层参数数组
   * @return {Promise<any[] | void>}
   * @example
   * ```ts
   *  // 添加单个图层
   *  let options3 = ['tdtyx-zjfw']
   *  let options4 = [{id:'tdtyx-zjfw',type:'wmts',url:'',...}]
   *  // 添加多个图层
   *  let options5 = ['tdtyx-zjfw','tdtyx-fw']
   *  let options6 = [{id:'tdtyx-zjfw',type:'wmts',url:'',...},{id:'tdtyx-fw',type:'wms',url:'',...}]
   *  // 调用方式
   *  gs3d.manager.layerManager.addLayer(options3)
   * ```
   */
  export async function addLayer(layerOptionArray: any[]): Promise<any[] | void>
  export async function addLayer(options: unknown): Promise<any[] | void> {
    let normalOptions: any[] = _paramformatNormalize(options)
    await _addLayerByArray(normalOptions)
    return gs3dAllLayer
  }
  // 辅助 数组对象方式添加图层
  const _addLayerByArray = async (options: any[]) => {
    if (!options) {
      throw new Error('添加图层必须传入参数')
    }
    for (let idx = 0; idx < options.length; idx++) {
      const option = options[idx]
      let opt = _getLayerOptionsByID(option.id) ?? {} //从配置中获取id对应的配置参数
      let mixOption = { ...opt, ...option }
      await _loadLayer(mixOption)
      mixOption = {}
    }
    console.log('_addLayerByArray-gs3dAllLayer', gs3dAllLayer)
  }

  // 辅助 读取图层
  const _loadLayer = async (options: any) => {
    console.log(`_loadLayer-${options.label}-${options.id}的入参`, options)
    let layer = gs3dAllLayer.find((lyr: any) => lyr.id === options.id && !options.type.includes('terrain'))
    if (layer) {
      console.log(`当前地球上已存在【${layer.id},${layer.label}】图层,请勿重复添加！！！`, gs3dAllLayer)
      return
    }
    let terrain = gs3dAllLayer.find((lyr: any) => lyr.type.includes('terrain'))
    if (terrain) {
      console.log(`当前地球上已存在【${terrain.id},${terrain.label}】地形,请勿重复添加！！！`, gs3dAllLayer)
      return
    }

    if (layerTypesMap[options.type]) {
      layerOption.id = options.id
      layerOption.label = options.label
      layerOption.type = options.type
      // layerOption.layer = await layerTypesMap[options.type](options)
      layerOption.layer = await layerLoader[layerTypesMap[options.type]](options)
      console.log(`${options.label}-${options.id}图层实例`, layerOption.layer)
      gs3dAllLayer.unshift(layerOption)
      layerOption = {
        id: void 0 || '未配置服务ID',
        label: '未配置服务名称',
        type: void 0 || '未配置服务类型',
        layer: void 0,
        data: void 0
      }
    } else {
      console.log('layerTypesMap->不知道添加什么图层')
    }
  }
  //#endregion

  //#region 移除图层
  /**
   * @description 根据图层id移除单个图层
   * @Remarks 不传/string/object/Array。不传参数，则移除所有图层，若为Array时，请保持Array内的元素类型一致
   * @param {string} layerId - 图层id
   * @return {any[]} 移除图层后的图层数组
   * @example
   * ```ts
   * let layerId = 'tdtyx-zjfw'
   * // 调用方式
   * gs3d.manager.layerManager.removeLayer(layerId)
   * ```
   */
  export function removeLayer(layerId: string): any[]
  /**
   * @description 根据图层配置移除单个图层
   * @param {object} layerConfig - 图层配置
   * @return {any[]} 移除图层后的图层数组
   * @example
   * ```ts
   * let layerConfig = {id:'tdtyx-zjfw',...}
   * // 调用方式
   * gs3d.manager.layerManager.removeLayer(layerConfig)
   * ```
   */
  export function removeLayer(layerConfig: object): any[]
  /**
   * @description 移除多个图层
   * @param {any} layerOptionArray - 移除多图层,请保持Array内的元素类型一致
   * @return {any[]} 移除图层后的图层数组
   * @example
   * ```ts
   * // 移除多个图层，接收参数为图层id数组
   * let layerOptionArray = ['tdtyx-zjfw','tdtyx-fw']
   * let layerOptionArray1 = [{id:'tdtyx-zjfw',...},{id:'tdtyx-fw',...}]
   * // 调用方式
   * gs3d.manager.layerManager.removeLayer(layerOptionArray)
   * ```
   */
  export function removeLayer(layerOptionArray: any[]): any[]
  /**
   * @description 移除所有图层
   * @return {any[]} 移除图层后的图层数组
   * @example
   * ```ts
   * // 调用方式
   * gs3d.manager.layerManager.removeLayer()
   * ```
   */
  export function removeLayer(): any[]
  export function removeLayer(options?: unknown): any[] {
    let normalOptions: any[] = _paramformatNormalize(options)
    console.log('removeLayer-归一化后参数', normalOptions)
    return _removeLayerByArray(normalOptions)
  }

  // 辅助 数组对象方式移除图层
  const _removeLayerByArray = (options?: any[]) => {
    console.log('_removeLayerByArray', options)
    // const { viewer, gs3dAllLayer } = variable
    let currentLyrIdx: number,
      removeAllLayerFlag: boolean = false //移除所有图层标志
    if (!options) {
      //当没有参数时意味着清除所有图层
      options = gs3dAllLayer
      removeAllLayerFlag = true
    }
    options.forEach((option: any) => {
      // 找到配置图层
      let lyr = gs3dAllLayer.find((lyrOpt: any, lyrIdx: number) => {
        currentLyrIdx = lyrIdx
        return lyrOpt.id === option.id
      })
      if (!lyr) {
        console.log(`当前地球上不存在【${option.id},${option.label}】图层,无法移除！！！`, gs3dAllLayer)
        return
      }
      _unloadLayer(lyr)
      // 根据id把图层数组中对应得图层数据删除
      // let idx = gs3dAllLayer.findIndex((lyrOpt: any) => lyrOpt.id === option.id)
      if (!removeAllLayerFlag) gs3dAllLayer.splice(currentLyrIdx, 1)
    })
    if (removeAllLayerFlag) {
      gs3dAllLayer.length = 0
      removeAllLayerFlag = false
    }
    console.log('_removeLayerByOption-gs3dAllLayer', gs3dAllLayer)
    return gs3dAllLayer
  }

  // 辅助 卸载图层
  const _unloadLayer = (option?: any) => {
    const { viewer } = variable
    const lyr = option.layer
    switch (option.type) {
      case 'arcgis_terrain':
      case 'cesium_terrain':
      case 'ellipsoid_terrain':
      case 'google_terrain':
      case 'skyline_terrain':
        viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider()
        viewer.scene.globe.terrainExaggeration = 1.0
        viewer.scene.globe.terrainExaggerationRelativeHeight = 0.0
        break
      case 'model_3d_tiles':
        if (viewer.scene.primitives.contains(lyr.tileSet)) {
          viewer.scene.primitives.remove(lyr.tileSet)
          if (lyr.tileSet.isDestroyed() == false) {
            lyr.tileSet.destroy()
          }
          if (lyr.originEntity) {
            viewer.entities.remove(lyr.originEntity)
          }
        }
        break
      default:
        // 移除图层
        viewer.imageryLayers.contains(lyr) && viewer.imageryLayers.remove(lyr)
        break
    }
  }
  //#endregion

  /**
   * @description 图层顺序调整
   * @param {any} options - 参照示例，一次仅支持对单个图层进行顺序调整，不支持多图层同时调整
   * @return {*}
   * @example
   * ```ts
   * let option ={
   *  id:'tdtyx_fw',//string,图层id
   *  layerType:'urltemplate',//string,图层类型，对'terrain', 'model'类型禁止调整顺序
   *  type:'lower',//string,调整顺序类型,可选lower(下降)/bottom(置底)/raise(上升)/top(置顶)，默认lower
   *  index:1,//number,调整顺序层数,支持一次调整多个层级，默认1
   * }
   * // 调用方式
   * gs3d.manager.layerManager.moveLayer(option)
   * ```
   */
  export const moveLayer = (options: any): null | undefined | ErrorConstructor => {
    const { viewer } = variable
    let defaultOptons: { [key: string]: any } = {
      index: 1,
      type: 'lower'
    }
    defaultOptons = { ...defaultOptons, ...options }
    if (!defaultOptons.id || !defaultOptons.layerType) {
      throw new Error('移动图层,参数必须传入图层id和图层类型layerType')
    }
    const filterLayerTypes = ['terrain', 'model'] //禁止图层顺序移动的服务类型
    if (filterLayerTypes.includes(defaultOptons.layerType)) {
      console.log(`【${defaultOptons.layerType}】图层类型不允许进行图层移动`)
      return
    }
    // 内置图层数组中查找目标图层
    let layer = gs3dAllLayer.find((lyr: any) => lyr.id === options.id).layer
    if (!viewer.imageryLayers.contains(layer)) {
      throw new Error(`Viewer图层集中没有此图层【${layer.label}】`)
    }
    // 图层顺序移动方式映射
    const moveLayerMap = {
      lower: () => {
        for (let i = 0; i < defaultOptons.index; i++) viewer.imageryLayers.lower(layer)
      },
      bottom: () => viewer.imageryLayers.lowerToBottom(layer),
      raise: () => {
        for (let i = 0; i < defaultOptons.index; i++) viewer.imageryLayers.raise(layer)
      },
      top: () => viewer.imageryLayers.raiseToTop(layer)
    }
    if (moveLayerMap[options.type]) {
      moveLayerMap[options.type]()
    } else {
      throw new Error(`未知的图层移动类型【${defaultOptons.type}】`)
    }
  }

  /**
   * @description 设置图层透明度
   * @param {any} options - 需传入图层id及所要设置的透明度参数alpha，可设置单个，或同时设置多个
   * @return {*}
   * @example
   *```ts
   *  // 设置单个图层透明度
   *  let options1 = {
   *    id:"tdtyx-zjfw",//string,所加图层id，需与当前地球上所加图层的id保持一致
   *    alpha:0.5,//number,透明度值
   *  }
   *  // 设置多个图层透明度
   *  let options2 = [
   *    {
   *      id:"tdtyx-zjfw",//string
   *      alpha:0.5
   *    },
   *    {
   *      id:"tdtyx-fw",
   *      alpha:0.7
   *    }
   *  ]
   *  // 调用方式
   *  gs3d.manager.layerManager.setLayerAlpha(options1)
   *```
   */
  export const setLayerAlpha = (options: methodOptionsType['SetLayerAlpha']): void => {
    let normalOptions: any[] = _paramformatNormalize(options)
    console.log('setLayerAlpha-归一化后参数', normalOptions)
    if (!options) {
      throw new Error('设置图层透明度必须传入参数')
    }
    normalOptions.forEach((option: any) => {
      let lyr = gs3dAllLayer.find(lyrOpt => lyrOpt.id === option.id)
      lyr && (lyr.layer.alpha = option.alpha)
    })
  }
}
