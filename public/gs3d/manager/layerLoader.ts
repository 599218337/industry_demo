import { imageryProvider } from '../core'
/*
支持加载的图层type(为避免Linux系统地址路径问题，统一使用‘_’进行分割)
通用方法加载
  -service
    mapserver             addMapServerLayer               ArcGisMapServerImageryProvider -hu √√
    mapbox                addMapBoxLayer                  MapboxImageryProvider -hu √√
    mapboxstyle           addMapBoxStyleLayer             MapboxStyleImageryProvider -hu √√
    osm                   addOSMLayer                     OpenStreetMapImageryProvider -hu √√
    singletile            addSingleTileLayer              SingleTileImageryProvider -hu √√
    tms                   addTMSLayer                     TileMapServiceImageryProvider -hu √√
    urltemplate           addUrlTemplateLayer             UrlTemplateImageryProvider  -hu √√
    wms                   addWMSLayer                     WebMapServiceImageryProvider      -yang √√
    wmts                  addWMTSLayer                    WebMapTileServiceImageryProvider  -hu √√
  -terrain
    cesium_terrain        addCesiumTerrainLayer           CesiumTerrainProvider -hu √√
    ellipsoid_terrain     addEllipsoidTerrainLayer        EllipsoidTerrainProvider -hu √√
    google_terrain        addGoogleTerrainLayer           GoogleEarthEnterpriseTerrainProvider -hu √√
arcgis系列
  arcgis_mapserver        addArcGisMapServerLayer         (arcgis地图服务)
  arcgis_dynamic          addArcGisDynamicLayer           (arcgis动态服务)
  arcgis_imageserver      addArcGisImageServerLayer       (arcgis影像服务)
  arcgis_tileserver       addArcGisTileServerLayer        (arcgis切片服务)
  arcgis_featurserver     addArcGisFeatureServerLayer     (arcgis要素服务)
  arcgis_terrain          addArcGisTerrainLayer           (arcgis地形服务) -hu √√
  arcgis_wmts             addArcGisWMTSLayer              (geoserver标准)   -hu √
  arcgis_wms              addArcGisWMSLayer               (geoserver标准)  -yang √√
  arcgis_odline           addArcGisOdlineLayer            (额外扩充，arcgis动态矢量在线服务)
geoserver系列
  geoserver_wms           addGeoServerWMSLayer            (web map service)  -yang √√
  geoserver_wmts          addGeoServerWMTSLayer           (web map tile service)  -hu √
  geoserver_tms           addGeoServerTMSLayer            (tile map service)
  geoserver_wfs           addGeoServerWFSLayer            (web feature service)
  geoserver_wcs           addGeoServerWCSLayer            (web coverage service)
mapbox系列
  mapbox_mvt              addMapboxMVTLayer               (mapbox vector tile,mapbox矢量瓦片标准)
skyline系列
  skyline_terrain         addSkylineTerrainLayer          (skyline发布的地形服务)
  skyline_image           addSkylineImageLayer            (skyline发布的影像服务)
  skyline_feature         addSkylineFeatureLayer          (skyline发布的要素服务)
model系列
  model_s3m               addModelS3MLayer                (supermap标准)
  model_i3s               addModelI3SLayer                (arcgis标准)
  model_gltf              addModelGltfLayer               (khronos)
  model_3d_tiles          addModel3dTilesLayer            Cesium3DTileset         (cesium lab,以gltf为基础，增加了lod概念) -yang √√
other地图厂商
  other_gaode             addOtherGaodeLayer              (高德地图)  -yang √√
  other_baidu             addOtherBaiduLayer              (百度地图)
  other_openStreetMap     addOtherOpenStreetMapLayer      (维基地图)
cesium内置系列
  cesium_tileCoord        addTileCoordinatesLayer         TileCoordinatesImageryProvider -hu √√
*/
import * as Cesium from 'cesium'
import * as global from '../global/index'
import { TilingScheme } from '../core/tilingScheme'
const { variable } = global

/**
 * layerLoader中方法无法直接使用，只提供参数类型查看
 */
namespace layerLoader {
  /**
   *
   * 根据参数获取对应的切片方案
   *
   * 'geo',GeographicTilingScheme地理投影切片方案;'web',WebMercatorTilingScheme墨卡托切片方案;'gaode',高德投影切片方案
   *
   * 跳转至参数列表：
   * |接口名|切片方案|
   * |:--|:--|
   * |{@link MapServerLayerOptions}|{@link MapServerLayerOptions#tilingScheme}|
   * |{@link TMSLayerOptions}|{@link TMSLayerOptions#tilingScheme}|
   * |{@link UrlTemplateLayerOptions}|{@link UrlTemplateLayerOptions#tilingScheme}|
   * |{@link WMSLayerOptions}|{@link WMSLayerOptions#tilingScheme}|
   * |{@link WMTSLayerOptions}|{@link WMTSLayerOptions#tilingScheme}|
   * |{@link ArcGisWMSLayerOptions}|{@link ArcGisWMSLayerOptions#tilingScheme}|
   * |{@link GeoServerWMSLayerOptions}|{@link GeoServerWMSLayerOptions#tilingScheme}|
   * |{@link ArcGisWMTSLayerOptions}|{@link ArcGisWMTSLayerOptions#tilingScheme}|
   * |{@link GeoServerWMTSLayerOptions}|{@link GeoServerWMTSLayerOptions#tilingScheme}|
   * |{@link TileCoordinatesLayerOptions}|{@link TileCoordinatesLayerOptions#tilingScheme}|
   * @group 图层参数内部参数
   * @defaultValue geo
   */
  export type OptionsTilingScheme =
    | {
        /**
         * 椭球体，表面平铺的椭球体半径[x,y,z]。默认为 WGS84 椭球体。
         * @example
         * ```
         * ellipsoid:[6378137, 6378137, 6356752.314245179]
         * ```
         */
        ellipsoid?: [x: number, y: number, z: number]
        /**
         * 图块树级别 0 处 X 方向的图块数。默认1。
         */
        numberOfLevelZeroTilesX?: number
        /**
         * 图块树级别 0 处 Y 方向的图块数。默认1。
         */
        numberOfLevelZeroTilesY?: number
        /**
         * 由切片方案覆盖的矩形西南角，以米为单位。如果未指定此参数或矩形东北角，则整个地球将在经度方向上覆盖，在纬度方向上覆盖相等的距离，从而生成正方形投影。
         * @example
         * ```ts
         * rectangleSouthwestInMeters:[11,11]
         * ```
         */
        rectangleSouthwestInMeters?: [south: number, west: number]
        /**
         * 由切片方案覆盖的矩形东北角，以米为单位。如果未指定此参数或矩形西南角，则整个地球将在经度方向上覆盖，在纬度方向上覆盖相等的距离，从而生成正方形投影。
         * @example
         * ```ts
         * rectangleNortheastInMeters:[22,22]
         * ```
         */
        rectangleNortheastInMeters?: [north: number, east: number]
      }
    | 'geo'
    | 'web'
    | 'gaode'
  /**
   *
   *
   * 图层加载：{@link layerManager.addLayer}
   *
   * 图层类型：{@link layerManager.layerTypesMap.mapserver}
   *
   * @group 图层参数
   *
   * @example
   * ```ts
   * //示例
   * //使用图层实例原生API，callback不会返回结果
   * const callback1 = (pickRes) => {
   *   console.log('拾取结果1', pickRes);
   * }
   * let options1 = {
   *  id: "test-mapserver1",
   *  label: "门头沟MS服务",
   *  type: "mapserver",
   *  url: "http://192.168.1.88:6080/arcgis/rest/services/bjmtg1/MapServer",
   *  layers: "1,2,3,4",
   *  _rectangle: [115.83984375000001, 40.078125, 116.01562499999999, 40.25390625],
   *  tilingScheme: 'geo',
   *  enablePickFeatures: true,
   *  callback: callback1,
   *  useProviderGS3D: false
   * }
   * //使用图层实例扩展API，callback返回结果
   * const callback2 = (pickRes) => {
   *   console.log('拾取结果2', pickRes);
   * }
   * let options2={
   *   id: "test-mapserver2",
   *   label: "门头沟MS服务",
   *   type: "mapserver",
   *   url: "http://192.168.1.88:6080/arcgis/rest/services/bjmtg1/MapServer",
   *   layers: "5,6,7,8",
   *   _rectangle: [115.83984375000001, 40.078125, 116.01562499999999, 40.25390625],
   *   tilingScheme: 'geo',
   *   enablePickFeatures: true,
   *   callback: callback2
   * }
   * // 调用示例
   * gs3d.manager.layerManager.addLayer(options2)
   * ```
   */
  export interface MapServerLayerOptions {
    /**
     * 图层ID，必传，用于图层唯一标识，且不能与项目中其他任何图层重复
     * @group 1.必选参数
     */
    id: string
    /**
     * 图层类型，必传，用于告知SDK所加图层属于哪个图层类型，并依据传入类型调用不同的图层加载方法。当前图层加载方法的type:{@link layerManager.layerTypesMap.mapserver}
     * @group 1.必选参数
     */
    type: 'mapserver' | string
    /**
     * 图层地址，必传
     * @group 1.必选参数
     */
    url: string
    /**
     * 图层别名，可选，建议填写，用于图层加载时供用户可快速了解所添加的图层含义
     * @group 2.建议参数
     */
    label?: string
    /**
     * 是否使用扩展的图层实例API，默认使用扩展的图层实例API来加载图层，扩展的实例图层API可通过传入callback回调函数来获取要素拾取结果。
     * @defaultValue true
     * @group 2.建议参数
     */
    useProviderGS3D?: boolean
    /**
     * @internal
     * 用于确定切片是否无效且相应的丢弃策略。如果未指定此值，则默认的DiscardMissingTileImagePolicy将用于平铺的地图服务器，NeverTileDiscardPolicy将用于非平铺地图服务器。在前一种情况下，我们请求最大瓦片级别的瓦片0,0，并检查像素（0,0）、（200,20）、（20,200）、（80,110）和（160,130）。如果所有这些像素都是透明的，则将禁用丢弃检查，并且不会丢弃任何平铺。如果其中任何一个具有不透明颜色，则将丢弃在这些像素位置中具有相同值的任何平铺。这些默认值的最终结果应该是标准ArcGIS服务器的正确瓦片丢弃。为了确保没有瓦片被丢弃，请为此参数构造并传递NeverTileDiscardPolicy。
     * @group 3.可选参数
     */
    tileDiscardPolicy?: Cesium.TileDiscardPolicy
    /**
     * 切片缓存机制，可选，默认true。如果为true，则在可用的情况下使用服务器的切片缓存。
     * @defaultValue true
     * @group 3.可选参数
     */
    usePreCachedTilesIfAvailable?: boolean
    /**
     * 要显示的图层的逗号分隔列表，如果要显示所有图层，则不设置。
     * @group 3.可选参数
     * @example
     * ```ts
     * //语法: [show | hide | include | exclude]:layerId1,layerId2
     * //show：仅导出此列表中指定的图层。
     * //hide：将导出除此列表中指定的图层之外的所有图层。
     * //include：除了默认导出的图层外，还将导出此列表中指定的图层。
     * //exclude：将导出默认情况下导出的图层（不包括此列表中指定的图层）。
     *  layers:"1,2,4,7"//表示加载服务中，1、2、4、7号图层，注：一个地图服务，可包含多个图层。
     * ```
     */
    layers?: string
    /**
     * 如果为 true，即开启服务的要素拾取功能，{@link Cesium.ArcGisMapServerImageryProvider#pickFeatures | Cesium.ArcGisMapServerImageryProvider#pickFeatures} 将调用 MapServer 上的 identify 服务并返回当前鼠标所点击的要素。如果为 false，{@link Cesium.ArcGisMapServerImageryProvider#pickFeatures | Cesium.ArcGisMapServerImageryProvider#pickFeatures}将在不调用 MapServer上的 identify 服务的情况下立即返回结果（表示没有开启要素拾取功能）。如果不希望开启选取功能，请将此属性设置为 false。也可以通过在对象上设置{@link Cesium.ArcGisMapServerImageryProvider#pickFeatures | Cesium.ArcGisMapServerImageryProvider#pickFeatures} 属性来重写。
     * @defaultValue true
     * @group 3.可选参数
     */
    enablePickFeatures?: boolean
    /**
     * 要素拾取回调函数，用于接收点击地图拾取要素后，将要素结果输出。此参数需配合useProviderExtend和enablePickFeatures参数使用，只有useProviderExtend为true，且enablePickFeatures为true时，才可通过传入callback获取要素拾取结果。
     * @group 3.可选参数
     */
    callback?: (result: any) => void
    /**
     * 图层的矩形。访问切片图层时，将忽略此参数。矩形([west, south, east, north]以角度为单位)，影像所覆盖的范围。
     *
     * west - 最西端的经度，以角度为单位，范围为 [-180,180]。
     *
     * south - 最南端的纬度，以角度为单位，范围为 [-90,90]。
     *
     * east - 最东端的经度，以角度为单位，范围为 [-180,180]。
     *
     * north - 最北端的纬度，以角度为单位，范围为 [-90,90]。
     * @defaultValue [0,0,0,0]
     * @group 3.可选参数
     * @example
     * ```ts
     * rectangle:[96.799393, -43.598214999057824, 153.63925700000001, -9.2159219997013]
     * ```
     */
    rectangle?: [west: number, south: number, east: number, north: number]
    /**
     * 用于将地球划分为图块的切片方案。
     * @defaultValue geo
     * @group 3.可选参数
     */
    tilingScheme?: OptionsTilingScheme
    /**
     * 椭球体。如果指定并使用了切片方案tilingScheme，则会忽略此参数，而改用切片方案的椭球体。如果未指定任何参数，则使用 WGS84 椭球体。
     * @group 3.可选参数
     * @example
     * ```ts
     * //表面平铺的椭球体半径[x,y,z]。默认为 WGS84 椭球体。
     * ellipsoid:[6378137, 6378137, 6356752.314245179]
     * ```
     */
    ellipsoid?: [x: number, y: number, z: number]
    /**
     * @internal
     * 数据源的信用，显示在画布上。访问切片服务器时，将忽略此参数。
     * @group 3.可选参数
     */
    credit?: string | Cesium.Credit
    /**
     * 切片宽度，默认256。
     * @defaultValue 256
     * @group 3.可选参数
     */
    tileWidth?: number | 256
    /**
     * 切片高度，默认256。
     * @defaultValue 256
     * @group 3.可选参数
     */
    tileHeight?: number | 256
    /**
     * 影像提供者支持的最大细节层次，如果没有限制，则不定义。
     * @group 3.可选参数
     */
    maximumLevel?: number
    /**
     * Cesium视图，可选，若不传，则使用SDK内默认视图。
     * @group 3.可选参数
     */
    viewer?: Cesium.Viewer
    /**
     * 投影转换
     * 当进行了自定义投影转换参数设置，tilingScheme失效、MapServerLayerOptions.ellipsoid可能失效
     * @group 3.可选参数
     */
    projection?: {
      /**
       * 指定投影的 PROJ4 样式的已知文本。默认为 EPSG：3857（Web 墨卡托）的已知文本。
       */
      wellKnownText?: string
      /**
       * 指定投影的 wkt 样式的已知文本。
       */
      wkt?: string
      /**
       * 指定投影的 wkid 样式的已知文本。
       */
      wkid?: number
      /**
       * 比例以从高度（以米为单位）转换为投影的单位。
       */
      heightScale?: number
      /**
       * 投影有效的制图边界。制图点将在投影之前固定到这些边界。
       *
       * west - 最西端的经度，以角度为单位，范围为 [-180,180]。
       *
       * south - 最南端的纬度，以角度为单位，范围为 [-90,90]。
       *
       * east - 最东端的经度，以角度为单位，范围为 [-180,180]。
       *
       * north - 最北端的纬度，以角度为单位，范围为 [-90,90]。
       * @defaultValue [0,0,0,0]
       * @group 3.可选参数
       * @example
       * ```ts
       * rectangle:[96.799393, -43.598214999057824, 153.63925700000001, -9.2159219997013]
       * ```
       */
      wgs84Bounds?: [west: number, south: number, east: number, north: number]
      /**
       * 逆投影有效的投影边界。投影点将在取消投影之前被钳制到这些边界。
       *
       * west - 最西端的经度，以角度为单位，范围为 [-180,180]。
       *
       * south - 最南端的纬度，以角度为单位，范围为 [-90,90]。
       *
       * east - 最东端的经度，以角度为单位，范围为 [-180,180]。
       *
       * north - 最北端的纬度，以角度为单位，范围为 [-90,90]。
       * @defaultValue [0,0,0,0]
       * @group 3.可选参数
       * @example
       * ```ts
       * rectangle:[96.799393, -43.598214999057824, 153.63925700000001, -9.2159219997013]
       * ```
       */
      projectedBounds?: [west: number, south: number, east: number, north: number]
      /**
       * 椭球体。如果指定并使用了切片方案tilingScheme，则会忽略此参数，而改用切片方案的椭球体。如果未指定任何参数，则使用 WGS84 椭球体。
       * @group 3.可选参数
       * @example
       * ```ts
       * //表面平铺的椭球体半径[x,y,z]。默认为 WGS84 椭球体。
       * ellipsoid:[6378137, 6378137, 6356752.314245179]
       * ```
       */
      ellipsoid?: [x: number, y: number, z: number]
    }
  }
  /**
   * 图层加载：{@link layerManager.addLayer}
   *
   * 图层类型：{@link layerManager.layerTypesMap.mapbox}
   * @group 图层参数
   */
  export interface MapBoxLayerOptions {
    /**
     * 图层ID，必传，用于图层唯一标识，且不能与项目中其他任何图层重复
     * @group 1.必选参数
     */
    id: string
    /**
     * 图层类型，必传，用于告知SDK所加图层属于哪个图层类型，并依据传入类型调用不同的图层加载方法。当前图层加载方法的type:{@link layerManager.layerTypesMap.mapbox}
     * @group 1.必选参数
     */
    type: 'mapbox'
    /**
     * Mapbox 地图 ID，必传
     * @group 1.必选参数
     */
    mapId: string
    /**
     * 影像的公共访问令牌，必传
     * @group 1.必选参数
     */
    accessToken: string
    /**
     * 图层别名，可选，建议填写，用于图层加载时供用户可快速了解所添加的图层含义
     * @group 2.建议参数
     */
    label?: string
    /**
     * Mapbox 服务 URL
     * @defaultValue 'https://api.mapbox.com/v4/'
     * @group 3.可选参数
     */
    url?: string
    /**
     * Cesium视图，可选，若不传，则使用SDK内默认视图。
     * @group 3.可选参数
     */
    viewer?: Cesium.Viewer
    /**
     * 图像请求的格式。
     * @defaultValue 'png'
     * @group 3.可选参数
     */
    format?: string
    /**
     * 椭球体。如果指定并使用了切片方案tilingScheme，则会忽略此参数，而改用切片方案的椭球体。如果未指定任何参数，则使用 WGS84 椭球体。
     * @group 3.可选参数
     * @example
     * ```ts
     * //表面平铺的椭球体半径[x,y,z]。默认为 WGS84 椭球体。
     * ellipsoid:[6378137, 6378137, 6356752.314245179]
     * ```
     */
    ellipsoid?: [x: number, y: number, z: number]
    /**
     * 影像提供程序支持的最低细节层次。指定此选项时请注意，最小级别的切片数量较少，例如四个或更少。较大的数字可能会导致呈现问题。
     * @defaultValue 0
     * @group 3.可选参数
     */
    minimumLevel?: number
    /**
     * 影像提供者支持的最大细节层次，如果没有限制，则不定义。
     * @group 3.可选参数
     */
    maximumLevel?: number
    /**
     * 图层的矩形。访问切片图层时，将忽略此参数。矩形([west, south, east, north]以角度为单位)，影像所覆盖的范围。
     *
     * west - 最西端的经度，以角度为单位，范围为 [-180,180]。
     *
     * south - 最南端的纬度，以角度为单位，范围为 [-90,90]。
     *
     * east - 最东端的经度，以角度为单位，范围为 [-180,180]。
     *
     * north - 最北端的纬度，以角度为单位，范围为 [-90,90]。
     * @defaultValue [0,0,0,0]
     * @group 3.可选参数
     * @example
     * ```ts
     * rectangle:[96.799393, -43.598214999057824, 153.63925700000001, -9.2159219997013]
     * ```
     */
    rectangle?: [west: number, south: number, east: number, north: number]
    /**
     * @internal
     * 数据源的信用，显示在画布上。访问切片服务器时，将忽略此参数。
     * @group 3.可选参数
     */
    credit?: string | Cesium.Credit
  }
  /**
   * 图层加载：{@link layerManager.addLayer}
   *
   * 图层类型：{@link layerManager.layerTypesMap.mapboxstyle}
   * @group 图层参数
   */
  export interface MapBoxStyleLayerOptions {
    /**
     * 图层ID，必传，用于图层唯一标识，且不能与项目中其他任何图层重复
     * @group 1.必选参数
     */
    id: string
    /**
     * 图层类型，必传，用于告知SDK所加图层属于哪个图层类型，并依据传入类型调用不同的图层加载方法。当前图层加载方法的type:{@link layerManager.layerTypesMap.mapbox}
     * @group 1.必选参数
     */
    type: 'mapboxstyle'
    /**
     * Mapbox 样式 ID，必传
     * @group 1.必选参数
     */
    styleId: string
    /**
     * 影像的公共访问令牌，必传
     * @group 1.必选参数
     */
    accessToken: string
    /**
     * 图层别名，可选，建议填写，用于图层加载时供用户可快速了解所添加的图层含义
     * @group 2.建议参数
     */
    label?: string
    /**
     * Mapbox 服务 URL
     * @defaultValue 'https://api.mapbox.com/styles/v1/'
     * @group 3.可选参数
     */
    url?: string
    /**
     * 地图帐户的用户名。
     * @defaultValue 'mapbox'
     * @group 3.可选参数
     */
    username?: string
    /**
     * Cesium视图，可选，若不传，则使用SDK内默认视图。
     * @group 3.可选参数
     */
    viewer?: Cesium.Viewer
    /**
     * 图像图块的大小。
     * @defaultValue 512
     * @group 3.可选参数
     */
    tilesize?: number
    /**
     * 确定切片是否以@2x比例因子呈现。
     * @group 3.可选参数
     */
    scaleFactor?: boolean
    /**
     * 椭球体。如果指定并使用了切片方案tilingScheme，则会忽略此参数，而改用切片方案的椭球体。如果未指定任何参数，则使用 WGS84 椭球体。
     * @group 3.可选参数
     * @example
     * ```ts
     * //表面平铺的椭球体半径[x,y,z]。默认为 WGS84 椭球体。
     * ellipsoid:[6378137, 6378137, 6356752.314245179]
     * ```
     */
    ellipsoid?: [x: number, y: number, z: number]
    /**
     * 影像提供程序支持的最低细节层次。指定此选项时请注意，最小级别的切片数量较少，例如四个或更少。较大的数字可能会导致呈现问题。
     * @defaultValue 0
     * @group 3.可选参数
     */
    minimumLevel?: number
    /**
     * 影像提供者支持的最大细节层次，如果没有限制，则不定义。
     * @group 3.可选参数
     */
    maximumLevel?: number
    /**
     * 图层的矩形。访问切片图层时，将忽略此参数。矩形([west, south, east, north]以角度为单位)，影像所覆盖的范围。
     *
     * west - 最西端的经度，以角度为单位，范围为 [-180,180]。
     *
     * south - 最南端的纬度，以角度为单位，范围为 [-90,90]。
     *
     * east - 最东端的经度，以角度为单位，范围为 [-180,180]。
     *
     * north - 最北端的纬度，以角度为单位，范围为 [-90,90]。
     * @defaultValue [0,0,0,0]
     * @group 3.可选参数
     * @example
     * ```ts
     * rectangle:[96.799393, -43.598214999057824, 153.63925700000001, -9.2159219997013]
     * ```
     */
    rectangle?: [west: number, south: number, east: number, north: number]
    /**
     * @internal
     * 数据源的信用，显示在画布上。访问切片服务器时，将忽略此参数。
     * @group 3.可选参数
     */
    credit?: string | Cesium.Credit
  }
  /**
   * 图层加载：{@link layerManager.addLayer}
   *
   * 图层类型：{@link layerManager.layerTypesMap.osm}
   * @group 图层参数
   */
  export interface OSMLayerOptions {
    /**
     * 图层ID，必传，用于图层唯一标识，且不能与项目中其他任何图层重复
     * @group 1.必选参数
     */
    id: string
    /**
     * 图层类型，必传，用于告知SDK所加图层属于哪个图层类型，并依据传入类型调用不同的图层加载方法。当前图层加载方法的type:{@link layerManager.layerTypesMap.osm}
     * @group 1.必选参数
     */
    type: 'osm'
    /**
     * 图层别名，可选，建议填写，用于图层加载时供用户可快速了解所添加的图层含义
     * @group 2.建议参数
     */
    label?: string
    /**
     * Cesium视图，可选，若不传，则使用SDK内默认视图。
     * @group 3.可选参数
     */
    viewer?: Cesium.Viewer
    /**
     * OpenStreetMap服务URL，必传，url结构参考{@link UrlTemplateLayerOptions#url | UrlTemplateLayerOptions#url}
     * @defaultValue 'https://tile.openstreetmap.org'
     * @group 3.可选参数
     */
    url?: UrlTemplateLayerOptions['url']
    /**
     * 服务器上图像的文件扩展名。
     * @defaultValue 'png'
     * @group 3.可选参数
     */
    fileExtension?: string
    /**
     * 椭球体。如果指定并使用了切片方案tilingScheme，则会忽略此参数，而改用切片方案的椭球体。如果未指定任何参数，则使用 WGS84 椭球体。
     * @group 3.可选参数
     * @example
     * ```ts
     * //表面平铺的椭球体半径[x,y,z]。默认为 WGS84 椭球体。
     * ellipsoid:[6378137, 6378137, 6356752.314245179]
     * ```
     */
    ellipsoid?: [x: number, y: number, z: number]
    /**
     * 影像提供程序支持的最低细节层次。指定此选项时请注意，最小级别的切片数量较少，例如四个或更少。较大的数字可能会导致呈现问题。
     * @defaultValue 0
     * @group 3.可选参数
     */
    minimumLevel?: number
    /**
     * 影像提供者支持的最大细节层次，如果没有限制，则不定义。
     * @group 3.可选参数
     */
    maximumLevel?: number
    /**
     * 图层的矩形。访问切片图层时，将忽略此参数。矩形([west, south, east, north]以角度为单位)，影像所覆盖的范围。
     *
     * west - 最西端的经度，以角度为单位，范围为 [-180,180]。
     *
     * south - 最南端的纬度，以角度为单位，范围为 [-90,90]。
     *
     * east - 最东端的经度，以角度为单位，范围为 [-180,180]。
     *
     * north - 最北端的纬度，以角度为单位，范围为 [-90,90]。
     * @defaultValue [0,0,0,0]
     * @group 3.可选参数
     * @example
     * ```ts
     * rectangle:[96.799393, -43.598214999057824, 153.63925700000001, -9.2159219997013]
     * ```
     */
    rectangle?: [west: number, south: number, east: number, north: number]
    /**
     * @internal
     * 数据源的信用，显示在画布上。访问切片服务器时，将忽略此参数。
     * @group 3.可选参数
     */
    credit?: string | Cesium.Credit
  }
  /**
   * 图层加载：{@link layerManager.addLayer}
   *
   * 图层类型：{@link layerManager.layerTypesMap.singletile}
   * @group 图层参数
   */
  export interface SingleTileLayerOptions {
    /**
     * 图层ID，必传，用于图层唯一标识，且不能与项目中其他任何图层重复
     * @group 1.必选参数
     */
    id: string
    /**
     * 图层类型，必传，用于告知SDK所加图层属于哪个图层类型，并依据传入类型调用不同的图层加载方法。当前图层加载方法的type:{@link layerManager.layerTypesMap.singletile}
     * @group 1.必选参数
     */
    type: 'singletile'
    /**
     * 图层地址，必传
     * @group 1.必选参数
     */
    url: string
    /**
     * 图层别名，可选，建议填写，用于图层加载时供用户可快速了解所添加的图层含义
     * @group 2.建议参数
     */
    label?: string
    /**
     * Cesium视图，可选，若不传，则使用SDK内默认视图。
     * @group 3.可选参数
     */
    viewer?: Cesium.Viewer
    /**
     * 切片宽度，默认256。
     * @defaultValue 256
     * @group 3.可选参数
     */
    tileWidth?: number | 256
    /**
     * 切片高度，默认256。
     * @defaultValue 256
     * @group 3.可选参数
     */
    tileHeight?: number | 256
    /**
     * 图层的矩形。访问切片图层时，将忽略此参数。矩形([west, south, east, north]以角度为单位)，影像所覆盖的范围。
     *
     * west - 最西端的经度，以角度为单位，范围为 [-180,180]。
     *
     * south - 最南端的纬度，以角度为单位，范围为 [-90,90]。
     *
     * east - 最东端的经度，以角度为单位，范围为 [-180,180]。
     *
     * north - 最北端的纬度，以角度为单位，范围为 [-90,90]。
     * @defaultValue [0,0,0,0]
     * @group 3.可选参数
     * @example
     * ```ts
     * rectangle:[96.799393, -43.598214999057824, 153.63925700000001, -9.2159219997013]
     * ```
     */
    rectangle?: [west: number, south: number, east: number, north: number]
    /**
     * @internal
     * 数据源的信用，显示在画布上。访问切片服务器时，将忽略此参数。
     * @group 3.可选参数
     */
    credit?: string | Cesium.Credit
    /**
     * 椭球体。如果指定并使用了切片方案tilingScheme，则会忽略此参数，而改用切片方案的椭球体。如果未指定任何参数，则使用 WGS84 椭球体。
     * @group 3.可选参数
     * @example
     * ```ts
     * //表面平铺的椭球体半径[x,y,z]。默认为 WGS84 椭球体。
     * ellipsoid:[6378137, 6378137, 6356752.314245179]
     * ```
     */
    ellipsoid?: [x: number, y: number, z: number]
  }
  /**
   * 图层加载：{@link layerManager.addLayer}
   *
   * 图层类型：{@link layerManager.layerTypesMap.tms}
   * @group 图层参数
   */
  export interface TMSLayerOptions {
    /**
     * 图层ID，必传，用于图层唯一标识，且不能与项目中其他任何图层重复
     * @group 1.必选参数
     */
    id: string
    /**
     * 图层类型，必传，用于告知SDK所加图层属于哪个图层类型，并依据传入类型调用不同的图层加载方法。当前图层加载方法的type:{@link layerManager.layerTypesMap.tms}
     * @group 1.必选参数
     */
    type: 'tms'
    /**
     * 图层地址，必传，url结构参考{@link UrlTemplateLayerOptions#url | UrlTemplateLayerOptions#url}
     * @group 1.必选参数
     */
    url: UrlTemplateLayerOptions['url']
    /**
     * 图层别名，可选，建议填写，用于图层加载时供用户可快速了解所添加的图层含义
     * @group 2.建议参数
     */
    label?: string
    /**
     * Cesium视图，可选，若不传，则使用SDK内默认视图。
     * @group 3.可选参数
     */
    viewer?: Cesium.Viewer
    /**
     * 服务器上图像的文件扩展名。
     * @defaultValue 'png'
     * @group 3.可选参数
     */
    fileExtension?: string
    /**
     * @internal
     * 数据源的信用，显示在画布上。访问切片服务器时，将忽略此参数。
     * @group 3.可选参数
     */
    credit?: string | Cesium.Credit
    /**
     * 影像提供程序支持的最低细节层次。指定此选项时请注意，最小级别的切片数量较少，例如四个或更少。较大的数字可能会导致呈现问题。
     * @defaultValue 0
     * @group 3.可选参数
     */
    minimumLevel?: number
    /**
     * 影像提供者支持的最大细节层次，如果没有限制，则不定义。
     * @group 3.可选参数
     */
    maximumLevel?: number
    /**
     * 图层的矩形。访问切片图层时，将忽略此参数。矩形([west, south, east, north]以角度为单位)，影像所覆盖的范围。
     *
     * west - 最西端的经度，以角度为单位，范围为 [-180,180]。
     *
     * south - 最南端的纬度，以角度为单位，范围为 [-90,90]。
     *
     * east - 最东端的经度，以角度为单位，范围为 [-180,180]。
     *
     * north - 最北端的纬度，以角度为单位，范围为 [-90,90]。
     * @defaultValue [0,0,0,0]
     * @group 3.可选参数
     * @example
     * ```ts
     * rectangle:[96.799393, -43.598214999057824, 153.63925700000001, -9.2159219997013]
     * ```
     */
    rectangle?: [west: number, south: number, east: number, north: number]
    /**
     * 用于将地球划分为图块的切片方案。
     * @defaultValue geo
     * @group 3.可选参数
     */
    tilingScheme?: OptionsTilingScheme
    /**
     * 椭球体。如果指定并使用了切片方案tilingScheme，则会忽略此参数，而改用切片方案的椭球体。如果未指定任何参数，则使用 WGS84 椭球体。
     * @group 3.可选参数
     * @example
     * ```ts
     * //表面平铺的椭球体半径[x,y,z]。默认为 WGS84 椭球体。
     * ellipsoid:[6378137, 6378137, 6356752.314245179]
     * ```
     */
    ellipsoid?: [x: number, y: number, z: number]
    /**
     * 切片宽度，默认256。
     * @defaultValue 256
     * @group 3.可选参数
     */
    tileWidth?: number | 256
    /**
     * 切片高度，默认256。
     * @defaultValue 256
     * @group 3.可选参数
     */
    tileHeight?: number | 256
    /**
     * 旧版本的 gdal2tiles.py 翻转了 tilemapresource.xml 中的 X 和 Y 值。
     * @group 3.可选参数
     */
    flipXY?: boolean
    /**
     * @internal
     * 用于确定切片是否无效且相应的丢弃策略。如果未指定此值，则默认的DiscardMissingTileImagePolicy将用于平铺的地图服务器，NeverTileDiscardPolicy将用于非平铺地图服务器。在前一种情况下，我们请求最大瓦片级别的瓦片0,0，并检查像素（0,0）、（200,20）、（20,200）、（80,110）和（160,130）。如果所有这些像素都是透明的，则将禁用丢弃检查，并且不会丢弃任何平铺。如果其中任何一个具有不透明颜色，则将丢弃在这些像素位置中具有相同值的任何平铺。这些默认值的最终结果应该是标准ArcGIS服务器的正确瓦片丢弃。为了确保没有瓦片被丢弃，请为此参数构造并传递NeverTileDiscardPolicy。
     * @group 3.可选参数
     */
    tileDiscardPolicy?: Cesium.TileDiscardPolicy
  }
  /**
   * 图层加载：{@link layerManager.addLayer}
   *
   * 图层类型：{@link layerManager.layerTypesMap.urltemplate}
   * @group 图层参数
   *
   * @example
   * ```ts
   *   //以下参数,更详细解释参照Cesium官网https://cesium.com/learn/cesiumjs/ref-doc/UrlTemplateImageryProvider.html#.ConstructorOptions
   *   {
   *     id:"example",//*string,必须参数,图层Id
   *     label: '示例标题',//string,图层标题
   *     type: 'urltemplate',//*string,图层类型
   *     url:"http://webst{s}.is.autonavi.com/appmaptile?style=8&x={x}&y={y}&z={z}",//*string,必须参数,地图服务URL地址，可能会额外拼接一些地图参数，例如wmts会拼接x,y,z等等。
   *     subdomains:["01", "02", "03", "04"],//string | Array<string> | undefined,要用于 URL 模板中占位符的 {s} 子域。如果此参数是单个字符串，则字符串中的每个字符都是一个子域。如果是数组，则数组中的每个元素都是一个子域。默认'abc'。
   *     minimumLevel:0,//number | undefined,影像提供程序支持的最低细节层次。指定此选项时请注意，最小级别的切片数量较少，例如四个或更少。较大的数字可能会导致呈现问题。默认0。
   *     maximumLevel:,//number | undefined,影像提供者支持的最大细节层次，如果没有限制，则不定义。
   *     rectangle: [96.799393, -43.598214999057824, 153.63925700000001, -9.2159219997013],//Array<number> | undefined,矩形([west, south, east, north]以角度为单位)，影像所覆盖的范围。
   *     tilingScheme:{
   *       ellipsoid: [6378137, 6378137, 6356752.314245179],//Array<number> | undefined,表面平铺的椭球体半径[x,y,z]。默认为 WGS84 椭球体。
   *       numberOfLevelZeroTilesX: 1,//number | undefined,图块树级别 0 处 X 方向的图块数。默认1。
   *       numberOfLevelZeroTilesY: 1,//number | undefined,图块树级别 0 处 Y 方向的图块数。默认1。
   *       rectangleSouthwestInMeters: [11,11],//Array<number> | undefined,由切片方案覆盖的矩形西南角，以米为单位。如果未指定此参数或矩形东北角，则整个地球将在经度方向上覆盖，在纬度方向上覆盖相等的距离，从而生成正方形投影。
   *       rectangleNortheastInMeters: [22,22]//Array<number> | undefined,由切片方案覆盖的矩形东北角，以米为单位。如果未指定此参数或矩形西南角，则整个地球将在经度方向上覆盖，在纬度方向上覆盖相等的距离，从而生成正方形投影。
   *     },//string | object | undefined,指定如何将椭球体表面分解为切片的切片方案。string格式下接收三个值'geo'、'web'和'gaode',分别指代GeographicTilingScheme地理投影切片方案/WebMercatorTilingScheme墨卡托切片方案/高德投影切片方案，object格式下由用户自定义参数，不定义此参数时默认为WebMercatorTilingScheme。
   *     tileWidth:256,//number | undefined,切片宽度，默认256。
   *     tileHeight:256,//number | undefined,切片高度，默认256。
   *   }
   *   //示例
   *     let options = {
   *       id: 'tdtyx-zjfw',
   *       label: '天地图影像带注记服务',
   *       type: 'urltemplate',
   *       subdomains: ['01', '02', '03', '04'],
   *       url: 'http://webst{s}.is.autonavi.com/appmaptile?style=8&x={x}&y={y}&z={z}'
   *     }
   *     let options1 = {
   *       id: 'cesium-example1',
   *       label: 'cesium官方示例服务',
   *       type: 'urltemplate',
   *       url: 'https://programs.communications.gov.au/geoserver/ows?tiled=true&transparent=true& format=image%2Fpngexceptions=application%2Fvnd.ogc.se_xml&styles=&service=WMS&version=1.1.1&request=GetMaplayers=public%3AMyBroadband_Availability&srs=EPSG%3A3857&bbox={westProjected}%2C{southProjected}%2C{eastProjected}%2C{northProjected}&width=256&height=256',
   *       rectangle: [96.799393, -43.598214999057824, 153.63925700000001, -9.2159219997013]
   *     }
   *     let options2 = {
   *       id: 'cesium-example2',
   *       label: 'cesium官方示例服务-单张图片',
   *       type: 'urltemplate',
   *       url: 'http://localhost:5173/node_modules/cesium/Build/Cesium/Assets/Textures/NaturalEarthII/{z}/{x}/{reverseY}.jpg',
   *       tilingScheme: 'geo',
   *       maximumLevel: 5,
   *     }
   *     // 调用示例
   *     gs3d.manager.layerManager.addLayer(options)
   * ```
   */
  export interface UrlTemplateLayerOptions {
    /**
     * 图层ID，必传，用于图层唯一标识，且不能与项目中其他任何图层重复
     * @group 1.必选参数
     */
    id: string
    /**
     * 图层地址，必传
     *
     * 跳转回：{@link OSMLayerOptions#url | OSMLayerOptions#url}、{@link TMSLayerOptions#url | TMSLayerOptions#url}
     *
     * 用于请求切片的 URL 模板。它具有以下关键字：
     * |关键字|释义|
     * |:---|:---|
     * |{z}|切片方案中切片的标高。零级是四叉树金字塔的根。|
     * |{x}|切片方案中的切片 X 坐标，其中 0 是最西端的切片。|
     * |{y}|切片方案中的切片 Y 坐标，其中 0 是最北端的切片。|
     * |{s}|可用的子域之一，用于克服浏览器对每个主机同时请求数的限制。|
     * |{reverseX}|切片方案中的切片 X 坐标，其中 0 是最东端的切片。|
     * |{reverseY}|切片方案中的切片 Y 坐标，其中 0 是最南端的切片。|
     * |{reverseZ}|片方案中瓷砖的级别，其中级别 0 是四叉树金字塔的最大级别。为了使用反向Z，必须定义最大级别。|
     * |{westDegrees}|图块的西边（以大地测量度为单位）。|
     * |{southDegrees}|以大地测量度数表示的图块的南边缘。|
     * |{eastDegrees}|图块的东部边缘，以大地测量度为单位。|
     * |{northDegrees}|图块的北边缘（以大地测量度为单位）。|
     * |{westProjected}|切片方案投影坐标中切片的西边缘。|
     * |{southProjected}|切片方案投影坐标中切片的南边缘。|
     * |{eastProjected}|切片方案投影坐标中切片的东部边缘。|
     * |{northProjected}|切片方案投影坐标中的切片的北边缘。|
     * |{width}|每个磁贴的宽度（以像素为单位）。|
     * |{height}|每个磁贴的高度（以像素为单位）。|
     * @group 1.必选参数
     */
    url: string
    /**
     * 图层类型，必传，用于告知SDK所加图层属于哪个图层类型，并依据传入类型调用不同的图层加载方法。当前图层加载方法的type:{@link layerManager.layerTypesMap.urltemplate}
     * @group 1.必选参数
     */
    type: 'urltemplate'
    /**
     * 图层别名，可选，建议填写，用于图层加载时供用户可快速了解所添加的图层含义
     * @group 2.建议参数
     */
    label?: string
    /**
     * @internal
     *  用于选取要素的 URL 模板。如果未指定此属性，将立即返回未定义， {@link Cesium.UrlTemplateImageryProvider#pickFeatures | Cesium.UrlTemplateImageryProvider#pickFeatures}表示未选取任何特征。
     * @group 3.可选参数
     */
    pickFeaturesUrl?: Cesium.Resource | string
    /**
     * @internal
     * 获取每个切片坐标的 URL 方案零填充。格式为“000”，其中每个坐标将在左侧填充零，以匹配传递的零字符串的宽度。例如，设置：urlSchemeZeroPadding ： { '{x}' ： '0000'} 将导致 'x' 值 12 返回生成的 URL 中 {x} 的字符串 '0012'。
     * @group 3.可选参数
     */
    urlSchemeZeroPadding?: object
    /**
     * @internal
     * 要用于 URL 模板中占位符的 {s} 子域。如果此参数是单个字符串，则字符串中的每个字符都是一个子域。如果是数组，则数组中的每个元素都是一个子域。
     * @defaultVaule 'abc'
     * @group 3.可选参数
     */
    subdomains?: string[] | string
    /**
     * @internal
     * 数据源的信用，显示在画布上。访问切片服务器时，将忽略此参数。
     * @group 3.可选参数
     */
    credit?: Cesium.Credit | string
    /**
     * 影像提供程序支持的最低细节层次。指定此选项时请注意，最小级别的切片数量较少，例如四个或更少。较大的数字可能会导致呈现问题。
     * @defaultValue 0
     * @group 3.可选参数
     */
    minimumLevel?: number
    /**
     * 影像提供者支持的最大细节层次，如果没有限制，则不定义。
     * @group 3.可选参数
     */
    maximumLevel?: number
    /**
     * 图层的矩形。访问切片图层时，将忽略此参数。矩形([west, south, east, north]以角度为单位)，影像所覆盖的范围。
     *
     * west - 最西端的经度，以角度为单位，范围为 [-180,180]。
     *
     * south - 最南端的纬度，以角度为单位，范围为 [-90,90]。
     *
     * east - 最东端的经度，以角度为单位，范围为 [-180,180]。
     *
     * north - 最北端的纬度，以角度为单位，范围为 [-90,90]。
     * @defaultValue [0,0,0,0]
     * @group 3.可选参数
     * @example
     * ```ts
     * rectangle:[96.799393, -43.598214999057824, 153.63925700000001, -9.2159219997013]
     * ```
     */
    rectangle?: [west: number, south: number, east: number, north: number]
    /**
     * 用于将地球划分为图块的切片方案。
     * @defaultValue geo
     * @group 3.可选参数
     */
    tilingScheme?: OptionsTilingScheme
    /**
     * 椭球体。如果指定并使用了切片方案tilingScheme，则会忽略此参数，而改用切片方案的椭球体。如果未指定任何参数，则使用 WGS84 椭球体。
     * @group 3.可选参数
     * @example
     * ```ts
     * //表面平铺的椭球体半径[x,y,z]。默认为 WGS84 椭球体。
     * ellipsoid:[6378137, 6378137, 6356752.314245179]
     * ```
     */
    ellipsoid?: [x: number, y: number, z: number]
    /**
     * 切片宽度，默认256。
     * @defaultValue 256
     * @group 3.可选参数
     */
    tileWidth?: number
    /**
     * 切片高度，默认256。
     * @defaultValue 256
     * @group 3.可选参数
     */
    tileHeight?: number
    /**
     * @internal
     * 如果此图像提供程序提供的图像包含 Alpha 通道，则为 true;否则，为假。如果此属性为 false，则将忽略 alpha 通道（如果存在）。如果此属性为 true，则任何没有 Alpha 通道的图像都将被视为其 alpha 在任何地方都是 1.0。当此属性为 false 时，内存使用量和纹理上传时间可能会减少。
     * @group 3.可选参数
     */
    hasAlphaChannel?: boolean
    /**
     * @internal
     * 调用时 {@link Cesium.UrlTemplateImageryProvider#pickFeatures|Cesium.UrlTemplateImageryProvider#pickFeatures} 用于获取特定位置的特征信息的格式。如果未指定此参数，则禁用要素选取。
     * @group 3.可选参数
     */
    getFeatureInfoFormats?: Cesium.GetFeatureInfoFormat
    /**
     * 如果为 true，即开启服务的要素拾取功能，{@link Cesium.ArcGisMapServerImageryProvider#pickFeatures | Cesium.ArcGisMapServerImageryProvider#pickFeatures} 将调用 MapServer 上的 identify 服务并返回当前鼠标所点击的要素。如果为 false，{@link Cesium.ArcGisMapServerImageryProvider#pickFeatures | Cesium.ArcGisMapServerImageryProvider#pickFeatures}将在不调用 MapServer上的 identify 服务的情况下立即返回结果（表示没有开启要素拾取功能）。如果不希望开启选取功能，请将此属性设置为 false。也可以通过在对象上设置{@link Cesium.ArcGisMapServerImageryProvider#pickFeatures | Cesium.ArcGisMapServerImageryProvider#pickFeatures} 属性来重写。
     * @defaultValue true
     * @group 3.可选参数
     */
    enablePickFeatures?: boolean
    /**
     * @internal
     * 用于确定切片是否无效且相应的丢弃策略。如果未指定此值，则默认的DiscardMissingTileImagePolicy将用于平铺的地图服务器，NeverTileDiscardPolicy将用于非平铺地图服务器。在前一种情况下，我们请求最大瓦片级别的瓦片0,0，并检查像素（0,0）、（200,20）、（20,200）、（80,110）和（160,130）。如果所有这些像素都是透明的，则将禁用丢弃检查，并且不会丢弃任何平铺。如果其中任何一个具有不透明颜色，则将丢弃在这些像素位置中具有相同值的任何平铺。这些默认值的最终结果应该是标准ArcGIS服务器的正确瓦片丢弃。为了确保没有瓦片被丢弃，请为此参数构造并传递NeverTileDiscardPolicy。
     * @group 3.可选参数
     */
    tileDiscardPolicy?: Cesium.TileDiscardPolicy
    /**
     * 允许替换 URL 模板中的自定义关键字。对象必须具有字符串作为键，函数作为值。
     * <p style="color:red">当为string时，有多个选项，用","分隔，如："ry,time"</p>
     * @group 3.可选参数
     * @example
     * ```ts
     * customTags:"time"
     * customTags:"time,speed"
     * customTags:{
     *  time: (imageryProvider: Cesium.ImageryProvider, x: number, y: number, level: number)=> {
     *   return new Date()
     *  }
     * }
     * ```
     */
    customTags?: object | string
    /**
     * Cesium视图，可选，若不传，则使用SDK内默认视图。
     * @group 3.可选参数
     */
    viewer?: Cesium.Viewer
  }
  /**
   * 图层加载：{@link layerManager.addLayer}
   *
   * 图层类型：{@link layerManager.layerTypesMap.wms}
   * @group 图层参数
   */
  export interface WMSLayerOptions {
    /**
     * 图层ID，必传，用于图层唯一标识，且不能与项目中其他任何图层重复
     * @group 1.必选参数
     */
    id: string
    /**
     * 图层类型，必传，用于告知SDK所加图层属于哪个图层类型，并依据传入类型调用不同的图层加载方法。当前图层加载方法的type:{@link layerManager.layerTypesMap.wms}
     * @group 1.必选参数
     */
    type: 'wms'
    /**
     * 图层地址，必传
     * @group 1.必选参数
     */
    url: string
    /**
     * 要显示的图层的逗号分隔列表。
     * @group 1.必选参数
     * @example
     * ```ts
     *  layers:"1,2,4,7"//表示加载服务中，1、2、4、7号图层，注：一个地图服务，可包含多个图层。
     * ```
     */
    layers: string
    /**
     * 图层别名，可选，建议填写，用于图层加载时供用户可快速了解所添加的图层含义
     * @group 2.建议参数
     */
    label?: string
    /**
     * Cesium视图，可选，若不传，则使用SDK内默认视图。
     * @group 3.可选参数
     */
    viewer?: Cesium.Viewer
    /**
     * 要在 GetMap URL 中传递给 WMS 服务器的其他参数。
     * @group 3.可选参数
     */
    parameters?: {
      /**
       * 服务类型
       * @defaultValue 'WMS'
       */
      service: 'WMS'
      /**
       * 透明
       * @defaultValue true
       */
      transparent?: boolean
      /**
       * 格式
       * @defaultValue 'image/png'
       */
      format?: string
      /**
       * 版本
       * @defaultValue '1.1.1'
       */
      version?: string
    }
    /**
     * 要传递给 WMS 服务器的其他参数在 GetFeatureInfo URL 中。
     * @group 3.可选参数
     */
    getFeatureInfoParameters?: object
    /**
     * 如果为 true，则将在 WMS 服务器上调用 GetFeatureInfo 操作，  {@link Cesium.WebMapServiceImageryProvider#pickFeatures | Cesium.WebMapServiceImageryProvider#pickFeatures}并返回响应中包含的功能。如果为 false， {@link Cesium.WebMapServiceImageryProvider#pickFeatures | Cesium.WebMapServiceImageryProvider#pickFeatures} 将立即返回未定义（指示没有可选取的特征），而不与服务器通信。如果您知道 WMS 服务器不支持 GetFeatureInfo，或者您不希望此提供程序的功能可选取，请将此属性设置为 false。请注意，可以通过修改 {@link Cesium.WebMapServiceImageryProvider#pickFeatures | Cesium.WebMapServiceImageryProvider#pickFeatures} 属性来动态覆盖此设置。
     * @defaultValue true
     * @group 3.可选参数
     */
    enablePickFeatures?: boolean
    /**
     * @internal
     * 尝试 WMS 获取功能信息请求的格式。
     * @group 3.可选参数
     */
    getFeatureInfoFormats?: Cesium.GetFeatureInfoFormat
    /**
     * 图层的矩形。访问切片图层时，将忽略此参数。矩形([west, south, east, north]以角度为单位)，影像所覆盖的范围。
     *
     * west - 最西端的经度，以角度为单位，范围为 [-180,180]。
     *
     * south - 最南端的纬度，以角度为单位，范围为 [-90,90]。
     *
     * east - 最东端的经度，以角度为单位，范围为 [-180,180]。
     *
     * north - 最北端的纬度，以角度为单位，范围为 [-90,90]。
     * @defaultValue [0,0,0,0]
     * @group 3.可选参数
     * @example
     * ```ts
     * rectangle:[96.799393, -43.598214999057824, 153.63925700000001, -9.2159219997013]
     * ```
     */
    rectangle?: [west: number, south: number, east: number, north: number]
    /**
     * 用于将地球划分为图块的切片方案。
     * @defaultValue geo
     * @group 3.可选参数
     */
    tilingScheme?: OptionsTilingScheme
    /**
     * 椭球体。如果指定并使用了切片方案tilingScheme，则会忽略此参数，而改用切片方案的椭球体。如果未指定任何参数，则使用 WGS84 椭球体。
     * @group 3.可选参数
     * @example
     * ```ts
     * //表面平铺的椭球体半径[x,y,z]。默认为 WGS84 椭球体。
     * ellipsoid:[6378137, 6378137, 6356752.314245179]
     * ```
     */
    ellipsoid?: [x: number, y: number, z: number]
    /**
     * 切片宽度，默认256。
     * @defaultValue 256
     * @group 3.可选参数
     */
    tileWidth?: number
    /**
     * 切片高度，默认256。
     * @defaultValue 256
     * @group 3.可选参数
     */
    tileHeight?: number
    /**
     * 影像提供程序支持的最低细节层次。指定此选项时请注意，最小级别的切片数量较少，例如四个或更少。较大的数字可能会导致呈现问题。
     * @defaultValue 0
     * @group 3.可选参数
     */
    minimumLevel?: number
    /**
     * 影像提供者支持的最大细节层次，如果没有限制，则不定义。
     * @group 3.可选参数
     */
    maximumLevel?: number
    /**
     * @internal
     * CRS 规范，用于 WMS 规范 >= 1.3.0。
     * @group 3.可选参数
     */
    crs?: string
    /**
     * @internal
     * SRS 规范，用于 WMS 规范 1.1.0 或 1.1.1
     * @group 3.可选参数
     */
    srs?: string
    /**
     * @internal
     * 数据源的信用，显示在画布上。访问切片服务器时，将忽略此参数。
     * @group 3.可选参数
     */
    credit?: Cesium.Credit | string
    /**
     * @internal
     * 要用于 URL 模板中占位符的 {s} 子域。如果此参数是单个字符串，则字符串中的每个字符都是一个子域。如果是数组，则数组中的每个元素都是一个子域。
     * @defaultVaule 'abc'
     * @group 3.可选参数
     */
    subdomains?: string[] | string
    /**
     * @internal
     * 确定时间维度的值时使用的 Clock 实例。指定“时间”时为必填项。
     * @group 3.可选参数
     */
    clock?: Cesium.Clock
    /**
     * @internal
     * TimeIntervalCollection，其数据属性是包含时间动态维度及其值的对象。
     * @group 3.可选参数
     */
    times?: Cesium.TimeIntervalCollection
    /**
     * @internal
     * WMS 服务的 getFeatureInfo URL。如果未定义属性，则使用 url 的属性值。
     * @group 3.可选参数
     */
    getFeatureInfoUrl?: Cesium.Resource | string
  }
  /**
   * 图层加载：{@link layerManager.addLayer}
   *
   * 图层类型：{@link layerManager.layerTypesMap.wmts}
   * @group 图层参数
   * @example
   * ```ts
   * //示例
   * //使用 kvpair 参数方式访问WMTS瓦片 除了url还需要 name、style、format、tileMatrixSetID、tileMatrixLabels
   * let options1 = {
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
   *
   * // 使用RESTful方式访问WMTS瓦片 除了url还需要 name、style、tileMatrixSetID、tileMatrixLabels至少4个访问参数。少了format参数的原因是这个参数已经在url中指定过了。
   * let options2 = {
   *  id:"wmts-restful",
   *  type:"wmts",
   *  label:"wmts服务restful访问方式",
   *  urlMethod:"restful",
   *  url:"http://127.0.0.1:8081/geoserver/gwc/service/wmts",//会被拼接为'http://127.0.0.1:8081/geoserver/gwc/service/wmts/rest/gisdata:mtg_dem/{style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}?format=image/png'
   *  name:"gisdata:mtg_dem",
   *  style: 'default', //default/raster
   *  // tileMatrixSetID: 'EPSG:4326',
   *  // tileMatrixLabels: ['EPSG:4326:0','EPSG:4326:1','EPSG:4326:2','EPSG:4326:3','EPSG:4326:4','EPSG:4326:5','EPSG:4326:6','EPSG:4326:7','EPSG:4326:8','EPSG:4326:9','EPSG:4326:10','EPSG:4326:11','EPSG:4326:12','EPSG:4326:13','EPSG:4326:14','EPSG:4326:15','EPSG:4326:16','EPSG:4326:17','EPSG:4326:18','EPSG:4326:19','EPSG:4326:20','EPSG:4326:21'],
   *  // maximumLevel: 21,
   *  // tilingScheme: 'geo',
   *  tileMatrixSetID: 'EPSG:900913',
   *  tileMatrixLabels: ['EPSG:900913:0','EPSG:900913:1','EPSG:900913:2','EPSG:900913:3','EPSG:900913:4','EPSG:900913:5','EPSG:900913:6','EPSG:900913:7','EPSG:900913:8','EPSG:900913:9','EPSG:900913:10','EPSG:900913:11','EPSG:900913:12','EPSG:900913:13','EPSG:900913:14','EPSG:900913:15','EPSG:900913:16','EPSG:900913:17','EPSG:900913:18','EPSG:900913:19','EPSG:900913:20','EPSG:900913:21','EPSG:900913:22','EPSG:900913:23','EPSG:900913:24','EPSG:900913:25','EPSG:900913:26','EPSG:900913:27','EPSG:900913:28','EPSG:900913:29','EPSG:900913:30'],
   *  maximumLevel: 30
   * }
   *
   * //GeoServer WMTS服务专用RESTful访问方式 在这个url中，只是将{TileMatrix}替换成了{TileMatrixSet}:{TileMatrix}，但是却可以再也不用重新定义冗长的tileMatrixLabels，只需要 name、style、tileMatrixSetID
   * let options3 = {
   *  id:"wmts-georestful",
   *  type:"wmts",
   *  label:"wmts服务georestful访问方式",
   *  urlMethod:"georestful",
   *  url:"http://127.0.0.1:8081/geoserver/gwc/service/wmts",//会被拼接为'http://127.0.0.1:8081/geoserver/gwc/service/wmts/rest/gisdata:mtg_dem/{style}/{TileMatrixSet}/{TileMatrixSet}:{TileMatrix}/{TileRow}/{TileCol}?format=image/png'
   *  name:"gisdata:mtg_dem",
   *  style: 'default', //default/raster
   *  // tileMatrixSetID: 'EPSG:4326',
   *  // maximumLevel: 21,
   *  // tilingScheme: 'geo',
   *  tileMatrixSetID: 'EPSG:900913',
   *  maximumLevel: 30
   * }
   * // 调用示例
   * gs3d.manager.layerManager.addLayer(options1)
   * ```
   */
  export interface WMTSLayerOptions {
    /**
     * 图层ID，必传，用于图层唯一标识，且不能与项目中其他任何图层重复
     * @group 1.必选参数
     */
    id: string
    /**
     * 图层类型，必传，用于告知SDK所加图层属于哪个图层类型，并依据传入类型调用不同的图层加载方法。当前图层加载方法的type:{@link layerManager.layerTypesMap.wmts}
     * @group 1.必选参数
     */
    type: 'wmts' | string
    /**
     * 图层地址，必传
     *
     * WMTS GetTile操作（用于KVP编码的请求）或 切片URL模板（用于RESTful请求）的基本URL。切片URL模板应包含以下变量：{style}、{TileMatrixSet}、{TileMatrix}、{TileRow}、{TileCol}。如果实际值是硬编码的或服务器不需要，则前两个是可选的。{s} 关键字可用于指定子域。
     *
     * @group 1.必选参数
     */
    url: string
    /**
     * WMTS 请求的层名称。
     * @group 1.必选参数
     * @example
     * ```ts
     *  name:"gisdata:mtg_dem"
     * ```
     */
    name: string
    /**
     * WMTS 请求的样式名称。
     * @group 1.必选参数
     */
    style: string
    /**
     * 用于 WMTS 请求的 TileMatrixSet 的标识符。
     * @group 1.必选参数
     */
    tileMatrixSetID: string
    /**
     * 图层别名，可选，建议填写，用于图层加载时供用户可快速了解所添加的图层含义
     * @group 2.建议参数
     */
    label?: string
    /**
     * 是否使用扩展的图层实例API，默认不使用扩展的图层实例API来加载图层。
     * @defaultValue false
     * @group 2.建议参数
     */
    useProviderGS3D?: boolean
    /**
     * 配置wmts服务参数访问方式
     * ```ts
     * // kvpair
     * // 使用键值对参数方式访问WMTS瓦片 除了url还需要 name、style、format、tileMatrixSetID、tileMatrixLabels
     * // restful把传入的 url:http://127.0.0.1:8081/geoserver/gwc/service/wmts 不进行任何拼接，但所需参数缺一不可
     * ```
     * ```ts
     * // restful
     * // 使用RESTful方式访问WMTS瓦片 除了url还需要 name、style、tileMatrixSetID、tileMatrixLabels至少4个访问参数。少了format参数的原因是这个参数已经在url中指定过了。
     * // restful会把传入的url:'http://127.0.0.1:8081/geoserver/gwc/service/wmts'拼接为'http://127.0.0.1:8081/geoserver/gwc/service/wmts/rest/gisdata:mtg_dem/{style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}?format=image/png'
     * ```
     * ```ts
     * // georestful
     * // GeoServer WMTS服务专用RESTful访问方式 在这个url中，与restful相比，只是将{TileMatrix}替换成了{TileMatrixSet}:{TileMatrix}，但是却可以再也不用重新定义冗长的tileMatrixLabels，只需要 name、style、tileMatrixSetID
     * // georestful会把传入的url:'http://127.0.0.1:8081/geoserver/gwc/service/wmts'拼接为'http://127.0.0.1:8081/geoserver/gwc/service/wmts/rest/gisdata:mtg_dem/{style}/{TileMatrixSet}/{TileMatrixSet}:{TileMatrix}/{TileRow}/{TileCol}?format=image/png'
     * ```
     * ```ts
     * // custom
     * // 对url不进行任何处理，传入什么url就是什么url，那么对加载图层需要的配置参数，需要自行确定
     * ```
     * @defaultValue 'custom'
     * @group 2.建议参数
     */
    urlMethod?: 'kvpair' | 'restful' | 'georestful' | 'custom'
    /**
     * Cesium视图，可选，若不传，则使用SDK内默认视图。
     * @group 3.可选参数
     */
    viewer?: Cesium.Viewer
    /**
     * 要从服务器检索的图像的 MIME 类型。
     * @defaultValue 'image/jpeg'
     * @group 3.可选参数
     */
    format?: string
    /**
     * TileMatrix 中用于 WMTS 请求的标识符列表，每个 TileMatrix 级别一个。
     * @group 3.可选参数
     */
    tileMatrixLabels?: any[]
    /**
     * @internal
     * 确定时间维度的值时使用的 Clock 实例。指定“时间”时为必填项。
     * @group 3.可选参数
     */
    clock?: Cesium.Clock
    /**
     * @internal
     * TimeIntervalCollection，其 data 属性是包含时间动态维度及其值的对象。
     * @group 3.可选参数
     */
    times?: Cesium.TimeIntervalCollection
    /**
     * @internal
     * 包含静态维度及其值的对象。
     * @group 3.可选参数
     */
    dimensions?: object
    /**
     * 切片宽度，默认256。
     * @defaultValue 256
     * @group 3.可选参数
     */
    tileWidth?: number | 256
    /**
     * 切片高度，默认256。
     * @defaultValue 256
     * @group 3.可选参数
     */
    tileHeight?: number | 256
    /**
     * 用于将地球划分为图块的切片方案。
     * @defaultValue geo
     * @group 3.可选参数
     */
    tilingScheme?: OptionsTilingScheme
    /**
     * 图层的矩形。访问切片图层时，将忽略此参数。矩形([west, south, east, north]以角度为单位)，影像所覆盖的范围。
     *
     * west - 最西端的经度，以角度为单位，范围为 [-180,180]。
     *
     * south - 最南端的纬度，以角度为单位，范围为 [-90,90]。
     *
     * east - 最东端的经度，以角度为单位，范围为 [-180,180]。
     *
     * north - 最北端的纬度，以角度为单位，范围为 [-90,90]。
     * @defaultValue [0,0,0,0]
     * @group 3.可选参数
     * @example
     * ```ts
     * rectangle:[96.799393, -43.598214999057824, 153.63925700000001, -9.2159219997013]
     * ```
     */
    rectangle?: [west: number, south: number, east: number, north: number]
    /**
     * 影像提供程序支持的最低细节层次。指定此选项时请注意，最小级别的切片数量较少，例如四个或更少。较大的数字可能会导致呈现问题。
     * @defaultValue 0
     * @group 3.可选参数
     */
    minimumLevel?: number
    /**
     * 影像提供者支持的最大细节层次，如果没有限制，则不定义。
     * @group 3.可选参数
     */
    maximumLevel?: number
    /**
     * 椭球体。如果指定并使用了切片方案tilingScheme，则会忽略此参数，而改用切片方案的椭球体。如果未指定任何参数，则使用 WGS84 椭球体。
     * @group 3.可选参数
     * @example
     * ```ts
     * //表面平铺的椭球体半径[x,y,z]。默认为 WGS84 椭球体。
     * ellipsoid:[6378137, 6378137, 6356752.314245179]
     * ```
     */
    ellipsoid?: [x: number, y: number, z: number]
    /**
     * @internal
     * 数据源的信用，显示在画布上。访问切片服务器时，将忽略此参数。
     * @group 3.可选参数
     */
    credit?: string | Cesium.Credit
    /**
     * @internal
     * 要用于 URL 模板中占位符的 {s} 子域。如果此参数是单个字符串，则字符串中的每个字符都是一个子域。如果是数组，则数组中的每个元素都是一个子域。
     * @defaultVaule 'abc'
     * @group 3.可选参数
     */
    subdomains?: string[] | string
    /**
     * 投影转换
     * 当进行了自定义投影转换参数设置，WMTSLayerOptions.tilingScheme失效、WMTSLayerOptions.ellipsoid可能失效
     * @group 3.可选参数
     */
    projection?: {
      /**
       * 指定投影的 PROJ4 样式的已知文本。默认为 EPSG：3857（Web 墨卡托）的已知文本。
       * @group 3.可选参数
       */
      wellKnownText?: string
      /**
       * 指定投影的 wkt 样式的已知文本。
       * @group 3.可选参数
       */
      wkt?: string
      /**
       * 指定投影的 wkid 样式的已知文本。
       * @group 3.可选参数
       */
      wkid?: number
      /**
       * 比例以从高度（以米为单位）转换为投影的单位。
       * @group 3.可选参数
       */
      heightScale?: number
      /**
       * 投影有效的制图边界。制图点将在投影之前固定到这些边界。
       *
       * west - 最西端的经度，角度制下，范围为 [-180,180]。
       *
       * south - 最南端的纬度，角度制下，范围为 [-90,90]。
       *
       * east - 最东端的经度，角度制下，范围为 [-180,180]。
       *
       * north - 最北端的纬度，角度制下，范围为 [-90,90]。
       * @group 3.可选参数
       * @example
       * ```ts
       * wgs84Bounds:[96.799393, -43.598214999057824, 153.63925700000001, -9.2159219997013]
       * ```
       */
      wgs84Bounds?: [west: number, south: number, east: number, north: number]
      /**
       * 逆投影有效的投影边界。投影点将在取消投影之前被钳制到这些边界。
       *
       * west - 最西端的经度，角度制下，范围为 [-180,180]。
       *
       * south - 最南端的纬度，角度制下，范围为 [-90,90]。
       *
       * east - 最东端的经度，角度制下，范围为 [-180,180]。
       *
       * north - 最北端的纬度，角度制下，范围为 [-90,90]。
       * @group 3.可选参数
       * @example
       * ```ts
       * projectedBounds:[96.799393, -43.598214999057824, 153.63925700000001, -9.2159219997013]
       * ```
       */
      projectedBounds?: [west: number, south: number, east: number, north: number]
      /**
       * 椭球体。如果指定并使用了切片方案tilingScheme，则会忽略此参数，而改用切片方案的椭球体。如果未指定任何参数，则使用 WGS84 椭球体。
       * @group 3.可选参数
       * @example
       * ```ts
       * //表面平铺的椭球体半径[x,y,z]。默认为 WGS84 椭球体。
       * ellipsoid:[6378137, 6378137, 6356752.314245179]
       * ```
       */
      ellipsoid?: [x: number, y: number, z: number]
    }
    /**
     * 分辨率，地图服务中查看Tile Info下的 Resolution
     * @group 3.可选参数
     */
    resolutions?: number[]
    /**
     * 比例尺，地图服务中查看Tile Info下的 Scale
     * @group 3.可选参数
     */
    scales?: number[]
    /**
     * 原点，地图服务中查看Origin
     * @group 3.可选参数
     */
    origin?: [x: number, y: number]
    /**
     * 四至矩形范围，地图服务中查看FullExtent
     * @group 3.可选参数
     */
    extent?: [XMin: number, YMin: number, XMax: number, YMax: number]
    /**
     * @internal
     * 用于确定切片是否无效且相应的丢弃策略。如果未指定此值，则默认的DiscardMissingTileImagePolicy将用于平铺的地图服务器，NeverTileDiscardPolicy将用于非平铺地图服务器。在前一种情况下，我们请求最大瓦片级别的瓦片0,0，并检查像素（0,0）、（200,20）、（20,200）、（80,110）和（160,130）。如果所有这些像素都是透明的，则将禁用丢弃检查，并且不会丢弃任何平铺。如果其中任何一个具有不透明颜色，则将丢弃在这些像素位置中具有相同值的任何平铺。这些默认值的最终结果应该是标准ArcGIS服务器的正确瓦片丢弃。为了确保没有瓦片被丢弃，请为此参数构造并传递NeverTileDiscardPolicy。
     * @group 3.可选参数
     */
    tileDiscardPolicy?: Cesium.TileDiscardPolicy
  }
  /**
   * 图层加载：{@link layerManager.addLayer}
   *
   * 图层类型：{@link layerManager.layerTypesMap.cesium_terrain}
   * @group 图层参数
   */
  export interface CesiumTerrainLayerOptions {
    /**
     * 图层ID，必传，用于图层唯一标识，且不能与项目中其他任何图层重复
     * @group 1.必选参数
     */
    id: string
    /**
     * 图层类型，必传，用于告知SDK所加图层属于哪个图层类型，并依据传入类型调用不同的图层加载方法。当前图层加载方法的type:{@link layerManager.layerTypesMap.cesium_terrain}
     * @group 1.必选参数
     */
    type: 'cesium_terrain'
    /**
     * 图层地址
     * <p style="color:red">注意：url和assetId，两参数二选一，或者均不传，禁止同时传递。当均不传递时，使用Cesium内置地形。</p>
     * @group 2.建议参数 地址
     */
    url?: string | Cesium.Resource | Promise<Cesium.Resource> | Promise<string>
    /**
     * Cesium资产ID
     * <p style="color:red">注意：url和assetId，两参数二选一，或者均不传，禁止同时传递。当均不传递时，使用Cesium内置地形。</p>
     * @group 2.建议参数 地址
     */
    assetId?: number
    /**
     * url的额外追加参数。
     * 当有此需求时，进行添加，比如请求头内的token信息
     * @group 2.建议参数
     * @example
     * ```ts
     * resource: {
     *  headers: {
     *   Authorization:'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9我是token信息啊！'
     *  }
     * }
     * ```
     */
    resource?: object | Cesium.Resource
    /**
     * 图层别名，可选，建议填写，用于图层加载时供用户可快速了解所添加的图层含义
     * @group 2.建议参数
     */
    label?: string
    /**
     * Cesium视图，可选，若不传，则使用SDK内默认视图。
     * @group 3.可选参数
     */
    viewer?: Cesium.Viewer
    /**
     * 开启水面波纹。指示客户端是否从服务器请求每个切片遮罩（如果可用）的标志。
     * @defaultValue false
     * @group 3.可选参数
     */
    requestWaterMask?: boolean
    /**
     * 开启地形光照。指示客户端是否从服务器请求其他照明信息的标志，如果可用，则以每个顶点法线的形式提供。
     * @defaultValue false
     * @group 3.可选参数
     */
    requestVertexNormals?: boolean
    /**
     * @internal
     * 指示客户端是否从服务器请求每个切片元数据（如果可用）的标志。
     * @defaultValue true
     * @group 3.可选参数
     */
    requestMetadata?: boolean
    /**
     * 椭球体。如果指定并使用了切片方案tilingScheme，则会忽略此参数，而改用切片方案的椭球体。如果未指定任何参数，则使用 WGS84 椭球体。
     * @group 3.可选参数
     * @example
     * ```ts
     * //表面平铺的椭球体半径[x,y,z]。默认为 WGS84 椭球体。
     * ellipsoid:[6378137, 6378137, 6356752.314245179]
     * ```
     */
    ellipsoid?: [x: number, y: number, z: number]
    /**
     * @internal
     * 数据源的信用，显示在画布上。访问切片服务器时，将忽略此参数。
     * @group 3.可选参数
     */
    credit?: string | Cesium.Credit
    /**
     * @internal
     * 用于夸大地形的标量。默认为1.0（不夸张）。值2.0将地形缩放 2 倍。的值0.0使地形完全平坦。请注意，地形夸大不会修改任何其他图元，因为它们是相对于椭圆体定位的。
     * @group 3.可选参数
     */
    terrainExaggeration?: number
    /**
     * @internal
     * 夸大地形的高度。默认为0.0（相对于椭球表面缩放）。高于此高度的地形将向上缩放，低于此高度的地形将向下缩放。请注意，地形夸大不会修改任何其他图元，因为它们是相对于椭圆体定位的。如果Globe#terrainExaggeration是1.0这个值将没有效果。
     * @group 3.可选参数
     */
    terrainExaggerationRelativeHeight?: number
  }
  /**
   * 图层加载：{@link layerManager.addLayer}
   *
   * 图层类型：{@link layerManager.layerTypesMap.ellipsoid_terrain}
   * @group 图层参数
   */
  export interface EllipsoidTerrainLayerOptions {
    /**
     * 图层ID，必传，用于图层唯一标识，且不能与项目中其他任何图层重复
     * @group 1.必选参数
     */
    id: string
    /**
     * 图层类型，必传，用于告知SDK所加图层属于哪个图层类型，并依据传入类型调用不同的图层加载方法。当前图层加载方法的type:{@link layerManager.layerTypesMap.ellipsoid_terrain}
     * @group 1.必选参数
     */
    type: 'ellipsoid_terrain'
    /**
     * 图层别名，可选，建议填写，用于图层加载时供用户可快速了解所添加的图层含义
     * @group 2.建议参数
     */
    label?: string
    /**
     * Cesium视图，可选，若不传，则使用SDK内默认视图。
     * @group 3.可选参数
     */
    viewer?: Cesium.Viewer
    /**
     * 用于将地球划分为图块的切片方案。
     * @defaultValue geo
     * @group 3.可选参数
     */
    tilingScheme?: OptionsTilingScheme
    /**
     * 椭球体。如果指定并使用了切片方案tilingScheme，则会忽略此参数，而改用切片方案的椭球体。如果未指定任何参数，则使用 WGS84 椭球体。
     * @group 3.可选参数
     * @example
     * ```ts
     * //表面平铺的椭球体半径[x,y,z]。默认为 WGS84 椭球体。
     * ellipsoid:[6378137, 6378137, 6356752.314245179]
     * ```
     */
    ellipsoid?: [x: number, y: number, z: number]
  }
  /**
   * 图层加载：{@link layerManager.addLayer}
   *
   * 图层类型：{@link layerManager.layerTypesMap.google_terrain}
   * @group 图层参数
   */
  export interface GoogleTerrainLayerOptions {
    /**
     * 图层ID，必传，用于图层唯一标识，且不能与项目中其他任何图层重复
     * @group 1.必选参数
     */
    id: string
    /**
     * 图层类型，必传，用于告知SDK所加图层属于哪个图层类型，并依据传入类型调用不同的图层加载方法。当前图层加载方法的type:{@link layerManager.layerTypesMap.google_terrain}
     * @group 1.必选参数
     */
    type: 'google_terrain'
    /**
     * 图层数据，必传
     * @group 1.必选参数
     */
    url: string
    /**
     * 图层别名，可选，建议填写，用于图层加载时供用户可快速了解所添加的图层含义
     * @group 2.建议参数
     */
    label?: string
    /**
     * Cesium视图，可选，若不传，则使用SDK内默认视图。
     * @group 3.可选参数
     */
    viewer?: Cesium.Viewer
    /**
     * 椭球体。如果指定并使用了切片方案tilingScheme，则会忽略此参数，而改用切片方案的椭球体。如果未指定任何参数，则使用 WGS84 椭球体。
     * @group 3.可选参数
     * @example
     * ```ts
     * //表面平铺的椭球体半径[x,y,z]。默认为 WGS84 椭球体。
     * ellipsoid:[6378137, 6378137, 6356752.314245179]
     * ```
     */
    ellipsoid?: [x: number, y: number, z: number]
    /**
     * @internal
     * 数据源的信用，显示在画布上。访问切片服务器时，将忽略此参数。
     * @group 3.可选参数
     */
    credit?: string | Cesium.Credit
  }
  /**
   * 图层加载：{@link layerManager.addLayer}
   *
   * 图层类型：{@link layerManager.layerTypesMap.arcgis_terrain}
   * @group 图层参数
   */
  export interface ArcGisTerrainLayerOptions {
    /**
     * 图层ID，必传，用于图层唯一标识，且不能与项目中其他任何图层重复
     * @group 1.必选参数
     */
    id: string
    /**
     * 图层类型，必传，用于告知SDK所加图层属于哪个图层类型，并依据传入类型调用不同的图层加载方法。当前图层加载方法的type:{@link layerManager.layerTypesMap.arcgis_terrain}
     * @group 1.必选参数
     */
    type: 'arcgis_terrain'
    /**
     * 图层地址，必传
     * @group 1.必选参数
     */
    url: string
    /**
     * 图层别名，可选，建议填写，用于图层加载时供用户可快速了解所添加的图层含义
     * @group 2.建议参数
     */
    label?: string
    /**
     * Cesium视图，可选，若不传，则使用SDK内默认视图。
     * @group 3.可选参数
     */
    viewer?: Cesium.Viewer
    /**
     * 用于连接到服务的授权令牌。
     * @group 3.可选参数
     */
    token?: string
    /**
     * 椭球体。如果指定并使用了切片方案tilingScheme，则会忽略此参数，而改用切片方案的椭球体。如果未指定任何参数，则使用 WGS84 椭球体。
     * @group 3.可选参数
     * @example
     * ```ts
     * //表面平铺的椭球体半径[x,y,z]。默认为 WGS84 椭球体。
     * ellipsoid:[6378137, 6378137, 6356752.314245179]
     * ```
     */
    ellipsoid?: [x: number, y: number, z: number]
  }
  /**
   * 图层加载：{@link layerManager.addLayer}
   *
   * 图层类型：{@link layerManager.layerTypesMap.arcgis_mapserver}
   * @group 图层参数
   */
  export interface ArcGisMapServerLayerOptions extends MapServerLayerOptions {
    /**
     * 图层类型，必传，用于告知SDK所加图层属于哪个图层类型，并依据传入类型调用不同的图层加载方法。当前图层加载方法的type:{@link layerManager.layerTypesMap.arcgis_mapserver}
     * @group 1.必选参数
     */
    type: 'arcgis_mapserver'
  }
  /**
   * 图层加载：{@link layerManager.addLayer}
   *
   * 图层类型：{@link layerManager.layerTypesMap.arcgis_dynamic}
   * @group 图层参数
   */
  export interface ArcGisDynamicLayerOptions {
    /**
     * 图层ID，必传，用于图层唯一标识，且不能与项目中其他任何图层重复
     * @group 1.必选参数
     */
    id: string
    /**
     * 图层类型，必传，用于告知SDK所加图层属于哪个图层类型，并依据传入类型调用不同的图层加载方法。当前图层加载方法的type:{@link layerManager.layerTypesMap.arcgis_dynamic}
     * @group 1.必选参数
     */
    type: 'arcgis_dynamic'
    /**
     * 图层地址，必传
     * @group 1.必选参数
     */
    url: string
    /**
     * 图层别名，可选，建议填写，用于图层加载时供用户可快速了解所添加的图层含义
     * @group 2.建议参数
     */
    label?: string
    /**
     * Cesium视图，可选，若不传，则使用SDK内默认视图。
     * @group 3.可选参数
     */
    viewer?: Cesium.Viewer
  }
  /**
   * 图层加载：{@link layerManager.addLayer}
   *
   * 图层类型：{@link layerManager.layerTypesMap.arcgis_imageserver}
   * @group 图层参数
   */
  export interface ArcGisImageServerLayerOptions {
    /**
     * 图层ID，必传，用于图层唯一标识，且不能与项目中其他任何图层重复
     * @group 1.必选参数
     */
    id: string
    /**
     * 图层类型，必传，用于告知SDK所加图层属于哪个图层类型，并依据传入类型调用不同的图层加载方法。当前图层加载方法的type:{@link layerManager.layerTypesMap.arcgis_imageserver}
     * @group 1.必选参数
     */
    type: 'arcgis_imageserver'
    /**
     * 图层地址，必传
     * @group 1.必选参数
     */
    url: string
    /**
     * 图层别名，可选，建议填写，用于图层加载时供用户可快速了解所添加的图层含义
     * @group 2.建议参数
     */
    label?: string
    /**
     * Cesium视图，可选，若不传，则使用SDK内默认视图。
     * @group 3.可选参数
     */
    viewer?: Cesium.Viewer
  }
  /**
   * 图层加载：{@link layerManager.addLayer}
   *
   * 图层类型：{@link layerManager.layerTypesMap.arcgis_tileserver}
   * @group 图层参数
   */
  export interface ArcGisTileServerLayerOptions {
    /**
     * 图层ID，必传，用于图层唯一标识，且不能与项目中其他任何图层重复
     * @group 1.必选参数
     */
    id: string
    /**
     * 图层类型，必传，用于告知SDK所加图层属于哪个图层类型，并依据传入类型调用不同的图层加载方法。当前图层加载方法的type:{@link layerManager.layerTypesMap.arcgis_tileserver}
     * @group 1.必选参数
     */
    type: 'arcgis_tileserver'
    /**
     * 图层地址，必传
     * @group 1.必选参数
     */
    url: string
    /**
     * 图层别名，可选，建议填写，用于图层加载时供用户可快速了解所添加的图层含义
     * @group 2.建议参数
     */
    label?: string
    /**
     * Cesium视图，可选，若不传，则使用SDK内默认视图。
     * @group 3.可选参数
     */
    viewer?: Cesium.Viewer
  }
  /**
   * 图层加载：{@link layerManager.addLayer}
   *
   * 图层类型：{@link layerManager.layerTypesMap.arcgis_featurserver}
   * @group 图层参数
   */
  export interface ArcGisFeatureServerLayerOptions {
    /**
     * 图层ID，必传，用于图层唯一标识，且不能与项目中其他任何图层重复
     * @group 1.必选参数
     */
    id: string
    /**
     * 图层类型，必传，用于告知SDK所加图层属于哪个图层类型，并依据传入类型调用不同的图层加载方法。当前图层加载方法的type:{@link layerManager.layerTypesMap.arcgis_featurserver}
     * @group 1.必选参数
     */
    type: 'arcgis_featurserver'
    /**
     * 图层地址，必传
     * @group 1.必选参数
     */
    url: string
    /**
     * 图层别名，可选，建议填写，用于图层加载时供用户可快速了解所添加的图层含义
     * @group 2.建议参数
     */
    label?: string
    /**
     * Cesium视图，可选，若不传，则使用SDK内默认视图。
     * @group 3.可选参数
     */
    viewer?: Cesium.Viewer
  }
  /**
   * 图层加载：{@link layerManager.addLayer}
   *
   * 图层类型：{@link layerManager.layerTypesMap.arcgis_wmts}
   * @group 图层参数
   */
  export interface ArcGisWMTSLayerOptions extends WMTSLayerOptions {
    /**
     * 图层类型，必传，用于告知SDK所加图层属于哪个图层类型，并依据传入类型调用不同的图层加载方法。当前图层加载方法的type:{@link layerManager.layerTypesMap.arcgis_wmts}
     * @group 1.必选参数
     */
    type: 'arcgis_wmts'
  }
  /**
   * 图层加载：{@link layerManager.addLayer}
   *
   * 图层类型：{@link layerManager.layerTypesMap.arcgis_wms}
   * @group 图层参数
   */
  export interface ArcGisWMSLayerOptions {
    /**
     * 图层ID，必传，用于图层唯一标识，且不能与项目中其他任何图层重复
     * @group 1.必选参数
     */
    id: string
    /**
     * 图层类型，必传，用于告知SDK所加图层属于哪个图层类型，并依据传入类型调用不同的图层加载方法。当前图层加载方法的type:{@link layerManager.layerTypesMap.arcgis_wms}
     * @group 1.必选参数
     */
    type: 'arcgis_wms'
    /**
     * 图层地址，必传
     * @group 1.必选参数
     */
    url: string
    /**
     * 要显示的图层的逗号分隔列表。
     * @group 1.必选参数
     * @example
     * ```ts
     *  layers:"1,2,4,7"//表示加载服务中，1、2、4、7号图层，注：一个地图服务，可包含多个图层。
     * ```
     */
    layers: string
    /**
     * 图层别名，可选，建议填写，用于图层加载时供用户可快速了解所添加的图层含义
     * @group 2.建议参数
     */
    label?: string
    /**
     * Cesium视图，可选，若不传，则使用SDK内默认视图。
     * @group 3.可选参数
     */
    viewer?: Cesium.Viewer
    /**
     * 追加参数
     *    let options = {
     *     format: 'image/png', //格式，可选，默认'image/png'
     *     version: '1.1.1' //版本，可选，默认'1.1.1'
     *   }
     */
    parameters?: {
      /**
       * 服务类型
       * @defaultValue 'WMS'
       */
      service: 'WMS'
      /**
       * 透明
       * @defaultValue true
       */
      transparent?: boolean
      /**
       * 格式
       * @defaultValue 'image/png'
       */
      format?: string
      /**
       * 版本
       * @defaultValue '1.1.1'
       */
      version?: string
    }
    /**
     * 要传递给 WMS 服务器的其他参数在 GetFeatureInfo URL 中。
     *  @group 3.可选参数
     */
    getFeatureInfoParameters?: object
    /**
     * 如果为 true，则将在 WMS 服务器上调用 GetFeatureInfo 操作，  {@link Cesium.WebMapServiceImageryProvider#pickFeatures | Cesium.WebMapServiceImageryProvider#pickFeatures}并返回响应中包含的功能。如果为 false， {@link Cesium.WebMapServiceImageryProvider#pickFeatures | Cesium.WebMapServiceImageryProvider#pickFeatures} 将立即返回未定义（指示没有可选取的特征），而不与服务器通信。如果您知道 WMS 服务器不支持 GetFeatureInfo，或者您不希望此提供程序的功能可选取，请将此属性设置为 false。请注意，可以通过修改 {@link Cesium.WebMapServiceImageryProvider#pickFeatures | Cesium.WebMapServiceImageryProvider#pickFeatures} 属性来动态覆盖此设置。
     * @defaultValue true
     * @group 3.可选参数
     */
    enablePickFeatures?: boolean
    /**
     * @internal
     * 尝试 WMS 获取功能信息请求的格式。
     * @group 3.可选参数
     */
    getFeatureInfoFormats?: Cesium.GetFeatureInfoFormat
    /**
     * 图层的矩形。访问切片图层时，将忽略此参数。矩形([west, south, east, north]以角度为单位)，影像所覆盖的范围。
     *
     * west - 最西端的经度，以角度为单位，范围为 [-180,180]。
     *
     * south - 最南端的纬度，以角度为单位，范围为 [-90,90]。
     *
     * east - 最东端的经度，以角度为单位，范围为 [-180,180]。
     *
     * north - 最北端的纬度，以角度为单位，范围为 [-90,90]。
     * @defaultValue [0,0,0,0]
     * @group 3.可选参数
     * @example
     * ```ts
     * rectangle:[96.799393, -43.598214999057824, 153.63925700000001, -9.2159219997013]
     * ```
     */
    rectangle?: [west: number, south: number, east: number, north: number]
    /**
     * 用于将地球划分为图块的切片方案。
     * @defaultValue geo
     * @group 3.可选参数
     */
    tilingScheme?: OptionsTilingScheme
    /**
     * 椭球体。如果指定并使用了切片方案tilingScheme，则会忽略此参数，而改用切片方案的椭球体。如果未指定任何参数，则使用 WGS84 椭球体。
     * @group 3.可选参数
     * @example
     * ```ts
     * //表面平铺的椭球体半径[x,y,z]。默认为 WGS84 椭球体。
     * ellipsoid:[6378137, 6378137, 6356752.314245179]
     * ```
     */
    ellipsoid?: [x: number, y: number, z: number]
    /**
     * 切片宽度，默认256。
     * @defaultValue 256
     * @group 3.可选参数
     */
    tileWidth?: number
    /**
     * 切片高度，默认256。
     * @defaultValue 256
     * @group 3.可选参数
     */
    tileHeight?: number
    /**
     * 影像提供程序支持的最低细节层次。指定此选项时请注意，最小级别的切片数量较少，例如四个或更少。较大的数字可能会导致呈现问题。
     * @defaultValue 0
     * @group 3.可选参数
     */
    minimumLevel?: number
    /**
     * 影像提供者支持的最大细节层次，如果没有限制，则不定义。
     * @group 3.可选参数
     */
    maximumLevel?: number
    /**
     * @internal
     * CRS 规范，用于 WMS 规范 >= 1.3.0。
     * @group 3.可选参数
     */
    crs?: string
    /**
     * @internal
     * SRS 规范，用于 WMS 规范 1.1.0 或 1.1.1
     * @group 3.可选参数
     */
    srs?: string
    /**
     * @internal
     * 数据源的信用，显示在画布上。访问切片服务器时，将忽略此参数。
     * @group 3.可选参数
     */
    credit?: Cesium.Credit | string
    /**
     * @internal
     * 要用于 URL 模板中占位符的 {s} 子域。如果此参数是单个字符串，则字符串中的每个字符都是一个子域。如果是数组，则数组中的每个元素都是一个子域。
     * @defaultVaule 'abc'
     * @group 3.可选参数
     */
    subdomains?: string[] | string
    /**
     * @internal
     * 确定时间维度的值时使用的 Clock 实例。指定“时间”时为必填项。
     * @group 3.可选参数
     */
    clock?: Cesium.Clock
    /**
     * @internal
     * TimeIntervalCollection，其数据属性是包含时间动态维度及其值的对象。
     * @group 3.可选参数
     */
    times?: Cesium.TimeIntervalCollection
    /**
     * @internal
     * WMS 服务的 getFeatureInfo URL。如果未定义属性，则我们使用 url 的属性值。
     * @group 3.可选参数
     */
    getFeatureInfoUrl?: Cesium.Resource | string
  }
  /**
   * 图层加载：{@link layerManager.addLayer}
   *
   * 图层类型：{@link layerManager.layerTypesMap.arcgis_odline}
   * @group 图层参数
   */
  export interface ArcGisOdlineLayerOptions {
    /**
     * 图层ID，必传，用于图层唯一标识，且不能与项目中其他任何图层重复
     * @group 1.必选参数
     */
    id: string
    /**
     * 图层类型，必传，用于告知SDK所加图层属于哪个图层类型，并依据传入类型调用不同的图层加载方法。当前图层加载方法的type:{@link layerManager.layerTypesMap.arcgis_odline}
     * @group 1.必选参数
     */
    type: 'arcgis_odline'
    /**
     * 图层地址，必传
     * @group 1.必选参数
     */
    url: string
    /**
     * 图层别名，可选，建议填写，用于图层加载时供用户可快速了解所添加的图层含义
     * @group 2.建议参数
     */
    label?: string
    /**
     * Cesium视图，可选，若不传，则使用SDK内默认视图。
     * @group 3.可选参数
     */
    viewer?: Cesium.Viewer
  }
  /**
   * 图层加载：{@link layerManager.addLayer}
   *
   * 图层类型：{@link layerManager.layerTypesMap.geoserver_wms}
   * @group 图层参数
   */
  export interface GeoServerWMSLayerOptions {
    /**
     * 图层ID，必传，用于图层唯一标识，且不能与项目中其他任何图层重复
     * @group 1.必选参数
     */
    id: string
    /**
     * 图层类型，必传，用于告知SDK所加图层属于哪个图层类型，并依据传入类型调用不同的图层加载方法。当前图层加载方法的type:{@link layerManager.layerTypesMap.geoserver_wms}
     * @group 1.必选参数
     */
    type: 'geoserver_wms'
    /**
     * 图层地址，必传
     * @group 1.必选参数
     */
    url: string
    /**
     * 要显示的图层的逗号分隔列表。
     * @group 1.必选参数
     * @example
     * ```ts
     *  layers:"1,2,4,7"//表示加载服务中，1、2、4、7号图层，注：一个地图服务，可包含多个图层。
     * ```
     */
    layers: string
    /**
     * 图层别名，可选，建议填写，用于图层加载时供用户可快速了解所添加的图层含义
     * @group 2.建议参数
     */
    label?: string
    /**
     * Cesium视图，可选，若不传，则使用SDK内默认视图。
     * @group 3.可选参数
     */
    viewer?: Cesium.Viewer
    /**
     * 追加参数
     *    let options = {
     *     format: 'image/png', //格式，可选，默认'image/png'
     *     version: '1.1.1' //版本，可选，默认'1.1.1'
     *   }
     */
    parameters?: {
      /**
       * 服务类型
       * @defaultValue 'WMS'
       */
      service: 'WMS'
      /**
       * 透明
       * @defaultValue true
       */
      transparent?: boolean
      /**
       * 格式
       * @defaultValue 'image/png'
       */
      format?: string
      /**
       * 版本
       * @defaultValue '1.1.1'
       */
      version?: string
    }
    /**
     * 要传递给 WMS 服务器的其他参数在 GetFeatureInfo URL 中。
     *  @group 3.可选参数
     */
    getFeatureInfoParameters?: object
    /**
     * 如果为 true，则将在 WMS 服务器上调用 GetFeatureInfo 操作，  {@link Cesium.WebMapServiceImageryProvider#pickFeatures | Cesium.WebMapServiceImageryProvider#pickFeatures}并返回响应中包含的功能。如果为 false， {@link Cesium.WebMapServiceImageryProvider#pickFeatures | Cesium.WebMapServiceImageryProvider#pickFeatures} 将立即返回未定义（指示没有可选取的特征），而不与服务器通信。如果您知道 WMS 服务器不支持 GetFeatureInfo，或者您不希望此提供程序的功能可选取，请将此属性设置为 false。请注意，可以通过修改 {@link Cesium.WebMapServiceImageryProvider#pickFeatures | Cesium.WebMapServiceImageryProvider#pickFeatures} 属性来动态覆盖此设置。
     * @defaultValue true
     * @group 3.可选参数
     */
    enablePickFeatures?: boolean
    /**
     * @internal
     * 尝试 WMS 获取功能信息请求的格式。
     * @group 3.可选参数
     */
    getFeatureInfoFormats?: Cesium.GetFeatureInfoFormat
    /**
     * 图层的矩形。访问切片图层时，将忽略此参数。矩形([west, south, east, north]以角度为单位)，影像所覆盖的范围。
     *
     * west - 最西端的经度，以角度为单位，范围为 [-180,180]。
     *
     * south - 最南端的纬度，以角度为单位，范围为 [-90,90]。
     *
     * east - 最东端的经度，以角度为单位，范围为 [-180,180]。
     *
     * north - 最北端的纬度，以角度为单位，范围为 [-90,90]。
     * @defaultValue [0,0,0,0]
     * @group 3.可选参数
     * @example
     * ```ts
     * rectangle:[96.799393, -43.598214999057824, 153.63925700000001, -9.2159219997013]
     * ```
     */
    rectangle?: [west: number, south: number, east: number, north: number]
    /**
     * 用于将地球划分为图块的切片方案。
     * @defaultValue geo
     * @group 3.可选参数
     */
    tilingScheme?: OptionsTilingScheme
    /**
     * 椭球体。如果指定并使用了切片方案tilingScheme，则会忽略此参数，而改用切片方案的椭球体。如果未指定任何参数，则使用 WGS84 椭球体。
     * @group 3.可选参数
     * @example
     * ```ts
     * //表面平铺的椭球体半径[x,y,z]。默认为 WGS84 椭球体。
     * ellipsoid:[6378137, 6378137, 6356752.314245179]
     * ```
     */
    ellipsoid?: [x: number, y: number, z: number]
    /**
     * 切片宽度，默认256。
     * @defaultValue 256
     * @group 3.可选参数
     */
    tileWidth?: number
    /**
     * 切片高度，默认256。
     * @defaultValue 256
     * @group 3.可选参数
     */
    tileHeight?: number
    /**
     * 影像提供程序支持的最低细节层次。指定此选项时请注意，最小级别的切片数量较少，例如四个或更少。较大的数字可能会导致呈现问题。
     * @defaultValue 0
     * @group 3.可选参数
     */
    minimumLevel?: number
    /**
     * 影像提供者支持的最大细节层次，如果没有限制，则不定义。
     * @group 3.可选参数
     */
    maximumLevel?: number
    /**
     * @internal
     * CRS 规范，用于 WMS 规范 >= 1.3.0。
     * @group 3.可选参数
     */
    crs?: string
    /**
     * @internal
     * SRS 规范，用于 WMS 规范 1.1.0 或 1.1.1
     * @group 3.可选参数
     */
    srs?: string
    /**
     * @internal
     * 数据源的信用，显示在画布上。访问切片服务器时，将忽略此参数。
     * @group 3.可选参数
     */
    credit?: Cesium.Credit | string
    /**
     * @internal
     * 要用于 URL 模板中占位符的 {s} 子域。如果此参数是单个字符串，则字符串中的每个字符都是一个子域。如果是数组，则数组中的每个元素都是一个子域。
     * @defaultVaule 'abc'
     * @group 3.可选参数
     */
    subdomains?: string[] | string
    /**
     * @internal
     * 确定时间维度的值时使用的 Clock 实例。指定“时间”时为必填项。
     * @group 3.可选参数
     */
    clock?: Cesium.Clock
    /**
     * @internal
     * TimeIntervalCollection，其数据属性是包含时间动态维度及其值的对象。
     * @group 3.可选参数
     */
    times?: Cesium.TimeIntervalCollection
    /**
     * @internal
     * WMS 服务的 getFeatureInfo URL。如果未定义属性，则我们使用 url 的属性值。
     * @group 3.可选参数
     */
    getFeatureInfoUrl?: Cesium.Resource | string
  }
  /**
   * 图层加载：{@link layerManager.addLayer}
   *
   * 图层类型：{@link layerManager.layerTypesMap.geoserver_wmts}
   * @group 图层参数
   */
  export interface GeoServerWMTSLayerOptions extends WMTSLayerOptions {
    /**
     * 图层类型，必传，用于告知SDK所加图层属于哪个图层类型，并依据传入类型调用不同的图层加载方法。当前图层加载方法的type:{@link layerManager.layerTypesMap.geoserver_wmts}
     * @group 1.必选参数
     */
    type: 'geoserver_wmts'
  }
  /**
   * 图层加载：{@link layerManager.addLayer}
   *
   * 图层类型：{@link layerManager.layerTypesMap.geoserver_tms}
   * @group 图层参数
   */
  export interface GeoServerTMSLayerOptions {
    /**
     * 图层ID，必传，用于图层唯一标识，且不能与项目中其他任何图层重复
     * @group 1.必选参数
     */
    id: string
    /**
     * 图层类型，必传，用于告知SDK所加图层属于哪个图层类型，并依据传入类型调用不同的图层加载方法。当前图层加载方法的type:{@link layerManager.layerTypesMap.geoserver_tms}
     * @group 1.必选参数
     */
    type: 'geoserver_tms'
    /**
     * 图层地址，必传
     * @group 1.必选参数
     */
    url: string
    /**
     * 图层别名，可选，建议填写，用于图层加载时供用户可快速了解所添加的图层含义
     * @group 2.建议参数
     */
    label?: string
    /**
     * Cesium视图，可选，若不传，则使用SDK内默认视图。
     * @group 3.可选参数
     */
    viewer?: Cesium.Viewer
  }
  /**
   * 图层加载：{@link layerManager.addLayer}
   *
   * 图层类型：{@link layerManager.layerTypesMap.geoserver_wfs}
   * @group 图层参数
   */
  export interface GeoServerWFSLayerOptions {
    /**
     * 图层ID，必传，用于图层唯一标识，且不能与项目中其他任何图层重复
     * @group 1.必选参数
     */
    id: string
    /**
     * 图层类型，必传，用于告知SDK所加图层属于哪个图层类型，并依据传入类型调用不同的图层加载方法。当前图层加载方法的type:{@link layerManager.layerTypesMap.geoserver_wfs}
     * @group 1.必选参数
     */
    type: 'geoserver_wfs'
    /**
     * 图层地址，必传
     * @group 1.必选参数
     */
    url: string
    /**
     * 图层别名，可选，建议填写，用于图层加载时供用户可快速了解所添加的图层含义
     * @group 2.建议参数
     */
    label?: string
    /**
     * Cesium视图，可选，若不传，则使用SDK内默认视图。
     * @group 3.可选参数
     */
    viewer?: Cesium.Viewer
  }
  /**
   * 图层加载：{@link layerManager.addLayer}
   *
   * 图层类型：{@link layerManager.layerTypesMap.geoserver_wcs}
   * @group 图层参数
   */
  export interface GeoServerWCSLayerOptions {
    /**
     * 图层ID，必传，用于图层唯一标识，且不能与项目中其他任何图层重复
     * @group 1.必选参数
     */
    id: string
    /**
     * 图层类型，必传，用于告知SDK所加图层属于哪个图层类型，并依据传入类型调用不同的图层加载方法。当前图层加载方法的type:{@link layerManager.layerTypesMap.geoserver_wcs}
     * @group 1.必选参数
     */
    type: 'geoserver_wcs'
    /**
     * 图层地址，必传
     * @group 1.必选参数
     */
    url: string
    /**
     * 图层别名，可选，建议填写，用于图层加载时供用户可快速了解所添加的图层含义
     * @group 2.建议参数
     */
    label?: string
    /**
     * Cesium视图，可选，若不传，则使用SDK内默认视图。
     * @group 3.可选参数
     */
    viewer?: Cesium.Viewer
  }
  /**
   * 图层加载：{@link layerManager.addLayer}
   *
   * 图层类型：{@link layerManager.layerTypesMap.mapbox_mvt}
   * @group 图层参数
   */
  export interface MapboxMVTLayerOptions {
    /**
     * 图层ID，必传，用于图层唯一标识，且不能与项目中其他任何图层重复
     * @group 1.必选参数
     */
    id: string
    /**
     * 图层类型，必传，用于告知SDK所加图层属于哪个图层类型，并依据传入类型调用不同的图层加载方法。当前图层加载方法的type:{@link layerManager.layerTypesMap.mapbox_mvt}
     * @group 1.必选参数
     */
    type: 'mapbox_mvt'
    /**
     * 图层地址，必传
     * @group 1.必选参数
     */
    url: string
    /**
     * 图层别名，可选，建议填写，用于图层加载时供用户可快速了解所添加的图层含义
     * @group 2.建议参数
     */
    label?: string
    /**
     * Cesium视图，可选，若不传，则使用SDK内默认视图。
     * @group 3.可选参数
     */
    viewer?: Cesium.Viewer
  }
  /**
   * 图层加载：{@link layerManager.addLayer}
   *
   * 图层类型：{@link layerManager.layerTypesMap.skyline_terrain}
   * @group 图层参数
   */
  export interface SkylineTerrainLayerOptions {
    /**
     * 图层ID，必传，用于图层唯一标识，且不能与项目中其他任何图层重复
     * @group 1.必选参数
     */
    id: string
    /**
     * 图层类型，必传，用于告知SDK所加图层属于哪个图层类型，并依据传入类型调用不同的图层加载方法。当前图层加载方法的type:{@link layerManager.layerTypesMap.skyline_terrain}
     * @group 1.必选参数
     */
    type: 'skyline_terrain'
    /**
     * 图层地址，必传
     * @group 1.必选参数
     */
    url: string
    /**
     * 图层别名，可选，建议填写，用于图层加载时供用户可快速了解所添加的图层含义
     * @group 2.建议参数
     */
    label?: string
    /**
     * Cesium视图，可选，若不传，则使用SDK内默认视图。
     * @group 3.可选参数
     */
    viewer?: Cesium.Viewer
  }
  /**
   * 图层加载：{@link layerManager.addLayer}
   *
   * 图层类型：{@link layerManager.layerTypesMap.skyline_image}
   * @group 图层参数
   */
  export interface SkylineImageLayerOptions {
    /**
     * 图层ID，必传，用于图层唯一标识，且不能与项目中其他任何图层重复
     * @group 1.必选参数
     */
    id: string
    /**
     * 图层类型，必传，用于告知SDK所加图层属于哪个图层类型，并依据传入类型调用不同的图层加载方法。当前图层加载方法的type:{@link layerManager.layerTypesMap.skyline_image}
     * @group 1.必选参数
     */
    type: 'skyline_image'
    /**
     * 图层地址，必传
     * @group 1.必选参数
     */
    url: string
    /**
     * 图层别名，可选，建议填写，用于图层加载时供用户可快速了解所添加的图层含义
     * @group 2.建议参数
     */
    label?: string
    /**
     * Cesium视图，可选，若不传，则使用SDK内默认视图。
     * @group 3.可选参数
     */
    viewer?: Cesium.Viewer
  }
  /**
   * 图层加载：{@link layerManager.addLayer}
   *
   * 图层类型：{@link layerManager.layerTypesMap.skyline_feature}
   * @group 图层参数
   */
  export interface SkylineFeatureLayerOptions {
    /**
     * 图层ID，必传，用于图层唯一标识，且不能与项目中其他任何图层重复
     * @group 1.必选参数
     */
    id: string
    /**
     * 图层类型，必传，用于告知SDK所加图层属于哪个图层类型，并依据传入类型调用不同的图层加载方法。当前图层加载方法的type:{@link layerManager.layerTypesMap.skyline_feature}
     * @group 1.必选参数
     */
    type: 'skyline_feature'
    /**
     * 图层地址，必传
     * @group 1.必选参数
     */
    url: string
    /**
     * 图层别名，可选，建议填写，用于图层加载时供用户可快速了解所添加的图层含义
     * @group 2.建议参数
     */
    label?: string
    /**
     * Cesium视图，可选，若不传，则使用SDK内默认视图。
     * @group 3.可选参数
     */
    viewer?: Cesium.Viewer
  }
  /**
   * 图层加载：{@link layerManager.addLayer}
   *
   * 图层类型：{@link layerManager.layerTypesMap.model_s3m}
   * @group 图层参数
   */
  export interface ModelS3MLayerOptions {
    /**
     * 图层ID，必传，用于图层唯一标识，且不能与项目中其他任何图层重复
     * @group 1.必选参数
     */
    id: string
    /**
     * 图层类型，必传，用于告知SDK所加图层属于哪个图层类型，并依据传入类型调用不同的图层加载方法。当前图层加载方法的type:{@link layerManager.layerTypesMap.model_s3m}
     * @group 1.必选参数
     */
    type: 'model_s3m'
    /**
     * 图层地址，必传
     * @group 1.必选参数
     */
    url: string
    /**
     * 图层别名，可选，建议填写，用于图层加载时供用户可快速了解所添加的图层含义
     * @group 2.建议参数
     */
    label?: string
    /**
     * Cesium视图，可选，若不传，则使用SDK内默认视图。
     * @group 3.可选参数
     */
    viewer?: Cesium.Viewer
  }
  /**
   * 图层加载：{@link layerManager.addLayer}
   *
   * 图层类型：{@link layerManager.layerTypesMap.model_i3s}
   * @group 图层参数
   */
  export interface ModelI3SLayerOptions {
    /**
     * 图层ID，必传，用于图层唯一标识，且不能与项目中其他任何图层重复
     * @group 1.必选参数
     */
    id: string
    /**
     * 图层类型，必传，用于告知SDK所加图层属于哪个图层类型，并依据传入类型调用不同的图层加载方法。当前图层加载方法的type:{@link layerManager.layerTypesMap.model_i3s}
     * @group 1.必选参数
     */
    type: 'model_i3s'
    /**
     * 图层地址，必传
     * @group 1.必选参数
     */
    url: string
    /**
     * 图层别名，可选，建议填写，用于图层加载时供用户可快速了解所添加的图层含义
     * @group 2.建议参数
     */
    label?: string
    /**
     * Cesium视图，可选，若不传，则使用SDK内默认视图。
     * @group 3.可选参数
     */
    viewer?: Cesium.Viewer
  }
  /**
   * 图层加载：{@link layerManager.addLayer}
   *
   * 图层类型：{@link layerManager.layerTypesMap.model_gltf}
   * @group 图层参数
   */
  export interface ModelGltfLayerOptions {
    /**
     * 图层ID，必传，用于图层唯一标识，且不能与项目中其他任何图层重复
     * @group 1.必选参数
     */
    id: string
    /**
     * 图层类型，必传，用于告知SDK所加图层属于哪个图层类型，并依据传入类型调用不同的图层加载方法。当前图层加载方法的type:{@link layerManager.layerTypesMap.model_gltf}
     * @group 1.必选参数
     */
    type: 'model_gltf'
    /**
     * 图层地址，必传
     * @group 1.必选参数
     */
    url: string
    /**
     * 图层别名，可选，建议填写，用于图层加载时供用户可快速了解所添加的图层含义
     * @group 2.建议参数
     */
    label?: string
    /**
     * Cesium视图，可选，若不传，则使用SDK内默认视图。
     * @group 3.可选参数
     */
    viewer?: Cesium.Viewer
  }
  /**
   * 图层加载：{@link layerManager.addLayer}
   *
   * 图层类型：{@link layerManager.layerTypesMap.model_3d_tiles}
   * @group 图层参数
   */
  export interface Model3dTilesLayerOptions {
    /**
     * 图层ID，必传，用于图层唯一标识，且不能与项目中其他任何图层重复
     * @group 1.必选参数
     */
    id: string
    /**
     * 图层类型，必传，用于告知SDK所加图层属于哪个图层类型，并依据传入类型调用不同的图层加载方法。当前图层加载方法的type:{@link layerManager.layerTypesMap.model_3d_tiles}
     * @group 1.必选参数
     */
    type: 'model_3d_tiles'
    /**
     * 图层地址，必传
     * @group 1.必选参数
     */
    url: string
    /**
     * 图层别名，可选，建议填写，用于图层加载时供用户可快速了解所添加的图层含义
     * @group 2.建议参数
     */
    label?: string
    /**
     * Cesium视图，可选，若不传，则使用SDK内默认视图。
     * @group 3.可选参数
     */
    viewer?: Cesium.Viewer
    /**
     * 设置定位位置lng经度，lat纬度，height高度，默认位置为模型原始位置，默认高度0
     */
    setPosition: {
      /**经度 */
      lng: number
      /**纬度 */
      lat: number
      /**高度 */
      height?: number
    }
    /**
     * 模型平移参数平移，可选值，默认xyz值均为0
     */
    translation: {
      /**x方向 */
      x?: number
      /**y方向 */
      y?: number
      /**z方向 */
      z?: number
    }
    /**
     * 模型旋转参数，可选值，默认xyz值均为0
     */
    rotate: {
      /**x方向 */
      x?: number
      /**y方向 */
      y?: number
      /**z方向 */
      z?: number
    }
    /**
     * 缩放，可选值，默认1
     */
    scale?: number
    /**
     * 是否定位到模型，可选值，默认false
     */
    islocation?: boolean
    /**
     * 是否显示模型原始中心点，可选值，默认false
     */
    isShowOriginPoint?: boolean
  }
  /**
   * 图层加载：{@link layerManager.addLayer}
   *
   * 图层类型：{@link layerManager.layerTypesMap.other_gaode}
   * @group 图层参数
   */
  export interface OtherGaodeLayerOptions {
    /**
     * 图层ID，必传，用于图层唯一标识，且不能与项目中其他任何图层重复
     * @group 1.必选参数
     */
    id: string
    /**
     * 图层类型，必传，用于告知SDK所加图层属于哪个图层类型，并依据传入类型调用不同的图层加载方法。当前图层加载方法的type:{@link layerManager.layerTypesMap.other_gaode}
     * @group 1.必选参数
     */
    type: 'other_gaode'
    /**
     * 图层地址，必传
     * @group 1.必选参数
     */
    url: string
    /**
     * 图层别名，可选，建议填写，用于图层加载时供用户可快速了解所添加的图层含义
     * @group 2.建议参数
     */
    label?: string
    /**
     * Cesium视图，可选，若不传，则使用SDK内默认视图。
     * @group 3.可选参数
     */
    viewer?: Cesium.Viewer
    /**
     * 影像提供程序支持的最低细节层次。指定此选项时请注意，最小级别的切片数量较少，例如四个或更少。较大的数字可能会导致呈现问题。
     * @defaultValue 0
     */
    minimumLevel?: number
    /**
     * 影像提供者支持的最大细节层次，如果没有限制，则不定义。
     * @group 3.可选参数
     */
    maximumLevel?: number
  }
  /**
   * 图层加载：{@link layerManager.addLayer}
   *
   * 图层类型：{@link layerManager.layerTypesMap.other_baidu}
   * @group 图层参数
   */
  export interface OtherBaiduLayerOptions {
    /**
     * 图层ID，必传，用于图层唯一标识，且不能与项目中其他任何图层重复
     * @group 1.必选参数
     */
    id: string
    /**
     * 图层类型，必传，用于告知SDK所加图层属于哪个图层类型，并依据传入类型调用不同的图层加载方法。当前图层加载方法的type:{@link layerManager.layerTypesMap.other_baidu}
     * @group 1.必选参数
     */
    type: 'other_baidu'
    /**
     * 图层地址，必传
     * @group 1.必选参数
     */
    url: string
    /**
     * 图层别名，可选，建议填写，用于图层加载时供用户可快速了解所添加的图层含义
     * @group 2.建议参数
     */
    label?: string
    /**
     * Cesium视图，可选，若不传，则使用SDK内默认视图。
     * @group 3.可选参数
     */
    viewer?: Cesium.Viewer
  }
  /**
   * 图层加载：{@link layerManager.addLayer}
   *
   * 图层类型：{@link layerManager.layerTypesMap.other_openStreetMap}
   * @group 图层参数
   */
  export interface OtherOpenStreetMapLayerOptions {
    /**
     * 图层ID，必传，用于图层唯一标识，且不能与项目中其他任何图层重复
     * @group 1.必选参数
     */
    id: string
    /**
     * 图层类型，必传，用于告知SDK所加图层属于哪个图层类型，并依据传入类型调用不同的图层加载方法。当前图层加载方法的type:{@link layerManager.layerTypesMap.other_openStreetMap}
     * @group 1.必选参数
     */
    type: 'other_openStreetMap'
    /**
     * 图层地址，必传
     * @group 1.必选参数
     */
    url: string
    /**
     * 图层别名，可选，建议填写，用于图层加载时供用户可快速了解所添加的图层含义
     * @group 2.建议参数
     */
    label?: string
    /**
     * Cesium视图，可选，若不传，则使用SDK内默认视图。
     * @group 3.可选参数
     */
    viewer?: Cesium.Viewer
  }
  /**
   * 图层加载：{@link layerManager.addLayer}
   *
   * 图层类型：{@link layerManager.layerTypesMap.cesium_tileCoord}
   * @group 图层参数
   */
  export interface TileCoordinatesLayerOptions {
    /**
     * 图层ID，必传，用于图层唯一标识，且不能与项目中其他任何图层重复
     * @group 1.必选参数
     */
    id: string
    /**
     * 图层类型，必传，用于告知SDK所加图层属于哪个图层类型，并依据传入类型调用不同的图层加载方法。当前图层加载方法的type:{@link layerManager.layerTypesMap.cesium_tileCoord}
     * @group 1.必选参数
     */
    type: 'cesium_tileCoord'
    /**
     * 图层别名，可选，建议填写，用于图层加载时供用户可快速了解所添加的图层含义
     * @group 2.建议参数
     */
    label?: string
    /**
     * Cesium视图，可选，若不传，则使用SDK内默认视图。
     * @group 3.可选参数
     */
    viewer?: Cesium.Viewer
    /**
     * 用于将地球划分为图块的切片方案。
     * @defaultValue geo
     * @group 3.可选参数
     */
    tilingScheme?: OptionsTilingScheme
    /**
     * 椭球体。如果指定并使用了切片方案tilingScheme，则会忽略此参数，而改用切片方案的椭球体。如果未指定任何参数，则使用 WGS84 椭球体。
     * @group 3.可选参数
     * @example
     * ```ts
     * //表面平铺的椭球体半径[x,y,z]。默认为 WGS84 椭球体。
     * ellipsoid:[6378137, 6378137, 6356752.314245179]
     * ```
     */
    ellipsoid?: [x: number, y: number, z: number]
    /**
     * 用于绘制切片框和标签的颜色。
     * @defaultValue Color.YELLOW 黄色
     * @group 3.可选参数
     */
    color?: string
    /**
     * 切片宽度，默认256。
     * @defaultValue 256
     * @group 3.可选参数
     */
    tileWidth?: number
    /**
     * 切片高度，默认256。
     * @defaultValue 256
     * @group 3.可选参数
     */
    tileHeight?: number
  }
}
namespace layerLoader {
  export const describe: string = '图层读取'
  // 通用参数设定
  /**
   * @description 根据参数获取对应的切片方案
   * @param {OptionsTilingScheme} tilingScheme
   * @return {*}
   * @example
   * ```ts
   * //tilingScheme
   * //string | object | undefined,指定如何将椭球体表面分解为切片的切片方案。string格式下接收三个值'geo'、'web'和'gaode',分别指代GeographicTilingScheme地理投影切片方案/WebMercatorTilingScheme墨卡托切片方案/高德投影切片方案，object格式下由用户自定义参数，不定义此参数时默认为WebMercatorTilingScheme。
   * {
   *  ellipsoid: [6378137, 6378137, 6356752.314245179],//Array<number> | undefined,表面平铺的椭球体半径[x,y,z]。默认为 WGS84 椭球体。
   *  numberOfLevelZeroTilesX: 1,//number | undefined,图块树级别 0 处 X 方向的图块数。默认1。
   *  numberOfLevelZeroTilesY: 1,//number | undefined,图块树级别 0 处 Y 方向的图块数。默认1。
   *  rectangleSouthwestInMeters: [11,11],//Array<number> | undefined,由切片方案覆盖的矩形西南角，以米为单位。如果未指定此参数或矩形东北角，则整个地球将在经度方向上覆盖，在纬度方向上覆盖相等的距离，从而生成正方形投影。
   *   rectangleNortheastInMeters: [22,22]//Array<number> | undefined,由切片方案覆盖的矩形东北角，以米为单位。如果未指定此参数或矩形西南角，则整个地球将在经度方向上覆盖，在纬度方向上覆盖相等的距离，从而生成正方形投影。
   * }
   * ```
   */
  const _getOptionsTilingScheme = (tilingScheme: OptionsTilingScheme): Cesium.TilingScheme | undefined => {
    // 判断传入tilingScheme的数据类型
    let optionsTilingSchemeType = Object.prototype.toString.call(tilingScheme)
    // 由tilingScheme生成对应的切片方案
    let optionsTilingSchemeMap: { [key: string]: () => Cesium.TilingScheme | undefined } = {
      '[object String]': (): Cesium.TilingScheme => {
        // 切片方案类型
        const tilingSchemeMap = {
          geo: new Cesium.GeographicTilingScheme(),
          web: new Cesium.WebMercatorTilingScheme(),
          gaode: new TilingScheme.AmapMercatorTilingScheme()
        }
        return tilingSchemeMap[tilingScheme as OptionsTilingScheme & string]
      },
      // custom 用户自定义的投影方案
      '[object Object]': (): Cesium.TilingScheme => {
        let { ellipsoid, numberOfLevelZeroTilesX, numberOfLevelZeroTilesY, rectangleSouthwestInMeters, rectangleNortheastInMeters } = tilingScheme as OptionsTilingScheme & object
        let customParam = {
          ellipsoid: ellipsoid ? new Cesium.Ellipsoid(...ellipsoid) : Cesium.Ellipsoid.WGS84,
          numberOfLevelZeroTilesX,
          numberOfLevelZeroTilesY,
          rectangleSouthwestInMeters: rectangleSouthwestInMeters ? new Cesium.Cartesian2(...rectangleSouthwestInMeters) : void 0,
          rectangleNortheastInMeters: rectangleNortheastInMeters ? new Cesium.Cartesian2(...rectangleNortheastInMeters) : void 0
        }
        let customTilingScheme = new Cesium.WebMercatorTilingScheme(customParam)
        return customTilingScheme
      },
      '[object Undefined]': () => void 0
    }
    return optionsTilingSchemeMap[optionsTilingSchemeType]()
  }

  // 通用图层加载方法
  /**
   * @internal
   * 返回图层加载方法：{@link  layerManager.addLayer} ；返回图层类型定义：{@link layerManager.layerTypesMap.mapserver}。
   * @description 加载MS服务
   * @Remarks 备注
   * @param {MapServerLayerOptions} options - 配置信息
   * @return {*}
   */
  export const addMapServerLayer = async (options: MapServerLayerOptions): Promise<Cesium.ImageryLayer> => {
    // 解构参数，将需要特殊处理，以及非Cesium API所需要的参数拎出来
    const { viewer = variable.viewer, id, type, label, useProviderGS3D = true, url, rectangle, tilingScheme, ellipsoid, projection, callback, ...argsOptions } = options
    // 重新构建Cesium API所需参数，并定义类型约束
    let providerParam: imageryProvider.ArcGisMapServerImageryProviderGS3D.ConstructorOptions = {
      ...argsOptions
    }
    // 特殊处理的参数
    if (rectangle) providerParam.rectangle = Cesium.Rectangle.fromDegrees(...rectangle)
    //投影服务 转换参数
    if (projection) {
      const { ellipsoid, wgs84Bounds, projectedBounds, ...argsOptions } = projection
      providerParam.projection = { ...argsOptions }
      if (ellipsoid) providerParam.projection.ellipsoid = new Cesium.Ellipsoid(...ellipsoid)
      if (wgs84Bounds) providerParam.projection.wgs84Bounds = new Cesium.Rectangle(...wgs84Bounds)
      if (projectedBounds) providerParam.projection.projectedBounds = new Cesium.Rectangle(...projectedBounds)
    } else {
      if (tilingScheme) providerParam.tilingScheme = _getOptionsTilingScheme(tilingScheme)
      if (ellipsoid) providerParam.ellipsoid = new Cesium.Ellipsoid(...ellipsoid)
    }
    //使用了扩展的图层实例API、开启了要素拾取、传入了回调函数，三者同时，才能获取要素拾取的结果
    if (useProviderGS3D && argsOptions.enablePickFeatures && callback) providerParam.callback = callback
    // 实例服务
    // const provider = await Cesium.ArcGisMapServerImageryProvider.fromUrl(url, providerParam)
    // const provider = useProviderGS3D ? await imageryProvider.ArcGisMapServerImageryProviderExt.fromUrl(url, providerParam) : await Cesium.ArcGisMapServerImageryProvider.fromUrl(url, providerParam)
    const provider = (
      useProviderGS3D ? await imageryProvider.ArcGisMapServerImageryProviderGS3D.fromUrl(url, providerParam) : await Cesium.ArcGisMapServerImageryProvider.fromUrl(url, providerParam)
    ) as Cesium.ArcGisMapServerImageryProvider
    // 添加服务
    let lyr_ms = viewer.imageryLayers.addImageryProvider(provider)
    // 自定义扩展 callback已经返回拾取结果，后续操作交给业务上处理
    //拾取要素回调 已通过图层扩展实现数据回调
    // if (argsOptions.enablePickFeatures && options.callback) {
    //   let Feature = {
    //     type: 'Feature',
    //     properties: {},
    //     geometry: {
    //       type: 'Polygon',
    //       coordinates: []
    //     }
    //   }
    //   let FeatureCollection = {
    //     type: 'FeatureCollection',
    //     features: [],
    //     crs: {
    //       type: 'name',
    //       properties: {
    //         name: 'EPSG:4326'
    //       }
    //     }
    //   }
    //   let geojsonDataSource = new Cesium.GeoJsonDataSource('MapServerLayer_highLight')
    //   function getLevel(height: number) {
    //     if (height > 48000000) {
    //       return 0
    //     } else if (height > 24000000) {
    //       return 1
    //     } else if (height > 12000000) {
    //       return 2
    //     } else if (height > 6000000) {
    //       return 3
    //     } else if (height > 3000000) {
    //       return 4
    //     } else if (height > 1500000) {
    //       return 5
    //     } else if (height > 750000) {
    //       return 6
    //     } else if (height > 375000) {
    //       return 7
    //     } else if (height > 187500) {
    //       return 8
    //     } else if (height > 93750) {
    //       return 9
    //     } else if (height > 46875) {
    //       return 10
    //     } else if (height > 23437.5) {
    //       return 11
    //     } else if (height > 11718.75) {
    //       return 12
    //     } else if (height > 5859.38) {
    //       return 13
    //     } else if (height > 2929.69) {
    //       return 14
    //     } else if (height > 1464.84) {
    //       return 15
    //     } else if (height > 732.42) {
    //       return 16
    //     } else if (height > 366.21) {
    //       return 17
    //     } else {
    //       return 18
    //     }
    //   }
    //   // 注册屏幕点击事件
    //   let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
    //   handler.setInputAction(function (event: any) {
    //     //拾取图层
    //     let pickRay = viewer.camera.getPickRay(event.position)
    //     const featuresPromise = viewer.imageryLayers.pickImageryLayerFeatures(pickRay, viewer.scene)
    //     if (!Cesium.defined(featuresPromise)) {
    //       console.log('没有影像图层要素信息选中')
    //     } else {
    //       Promise.resolve(featuresPromise).then(function (features) {
    //         if (features.length > 0) {
    //           console.log(`%c 要素拾取结果`, `Color:springgreen`, features)
    //           FeatureCollection.features = features.map(feature => {
    //             return {
    //               type: 'Feature',
    //               properties: feature.data.attributes,
    //               geometry: {
    //                 type: feature.data.attributes.Shape,
    //                 coordinates: feature.data.geometry.rings
    //               }
    //             }
    //           })
    //           console.log('要素拾取结果FeatureCollection', FeatureCollection)

    //           // 移除之前底图上添加的要素
    //           viewer.dataSources.remove(geojsonDataSource)
    //           // 读取拾取的要素
    //           geojsonDataSource.load(FeatureCollection)
    //           // 要素追加绘制到底图上
    //           viewer.dataSources.add(geojsonDataSource)
    //           // 结果回调
    //           options.callback(features)
    //         }
    //       })
    //     }

    //     //拾取图层2
    //     // const ray = viewer.camera.getPickRay(event.position)
    //     // const cartesian = viewer.scene.globe.pick(ray, viewer.scene)
    //     // if (cartesian) {
    //     //   var cartographic = Cesium.Cartographic.fromCartesian(cartesian)
    //     //   if (cartographic) {
    //     //     var xy = new Cesium.Cartesian2()
    //     //     var alti = viewer.camera.positionCartographic.height
    //     //     var level = getLevel(alti)
    //     //     if (provider) {
    //     //       xy = provider.tilingScheme.positionToTileXY(cartographic, level, xy)
    //     //       let featuresPromise = provider.pickFeatures(xy.x, xy.y, level, cartographic.longitude, cartographic.latitude)
    //     //       Promise.resolve(featuresPromise).then(function (features) {
    //     //         if (features.length > 0) {
    //     //           console.log(`%c 要素拾取结果`, `Color:springgreen`, features)
    //     //           FeatureCollection.features = features.map(feature => {
    //     //             return {
    //     //               type: 'Feature',
    //     //               properties: feature.data.attributes,
    //     //               geometry: {
    //     //                 type: feature.data.attributes.Shape,
    //     //                 coordinates: feature.data.geometry.rings
    //     //               }
    //     //             }
    //     //           })
    //     //           console.log('要素拾取结果FeatureCollection', FeatureCollection)

    //     //           // 移除之前底图上添加的要素
    //     //           viewer.dataSources.remove(geojsonDataSource)
    //     //           // 读取拾取的要素
    //     //           geojsonDataSource.load(FeatureCollection)
    //     //           // 要素追加绘制到底图上
    //     //           viewer.dataSources.add(geojsonDataSource)
    //     //           // 结果回调
    //     //           options.callback(features)
    //     //           //这里就得到了查询结果
    //     //           // renderPopup(features, event.position)
    //     //         }
    //     //       })
    //     //     }
    //     //   }
    //     // }
    //   }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
    // }
    // 返回服务
    return lyr_ms
  }
  /**
   * @internal
   * 返回图层加载方法：{@link  layerManager.addLayer} ；返回图层类型定义：{@link layerManager.layerTypesMap.mapbox}。
   */
  export const addMapBoxLayer = (options: MapBoxLayerOptions): Cesium.ImageryLayer => {
    const { viewer = variable.viewer, id, type, label, rectangle, ellipsoid, ...argsOptions } = options
    // 生成provider所传入参数
    let providerParam: Cesium.MapboxImageryProvider.ConstructorOptions = {
      ...argsOptions
    }
    // 特殊处理的参数
    if (rectangle) providerParam.rectangle = Cesium.Rectangle.fromDegrees(...rectangle)
    if (ellipsoid) providerParam.ellipsoid = new Cesium.Ellipsoid(...ellipsoid)
    // 实例服务
    const provider = new Cesium.MapboxImageryProvider(providerParam)
    // 将影像加载到视图
    const lyr_mapbox = viewer.imageryLayers.addImageryProvider(provider)
    return lyr_mapbox
  }
  /**
   * @internal
   * 返回图层加载方法：{@link  layerManager.addLayer} ；返回图层类型定义：{@link layerManager.layerTypesMap.mapboxstyle}。
   */
  export const addMapBoxStyleLayer = (options: MapBoxStyleLayerOptions): Cesium.ImageryLayer => {
    const { viewer = variable.viewer, id, type, label, rectangle, ellipsoid, ...argsOptions } = options
    // 生成provider所传入参数
    let providerParam: Cesium.MapboxStyleImageryProvider.ConstructorOptions = {
      ...argsOptions
    }
    // 特殊处理的参数
    if (rectangle) providerParam.rectangle = Cesium.Rectangle.fromDegrees(...rectangle)
    if (ellipsoid) providerParam.ellipsoid = new Cesium.Ellipsoid(...ellipsoid)
    // 实例服务
    const provider = new Cesium.MapboxStyleImageryProvider(providerParam)
    // 将影像加载到视图
    const lyr_mapboxstyle = viewer.imageryLayers.addImageryProvider(provider)
    return lyr_mapboxstyle
  }
  /**
   * @internal
   * 返回图层加载方法：{@link  layerManager.addLayer} ；返回图层类型定义：{@link layerManager.layerTypesMap.osm}。
   */
  export const addOSMLayer = (options: OSMLayerOptions): Cesium.ImageryLayer => {
    const { viewer = variable.viewer, id, type, label, rectangle, ellipsoid, ...argsOptions } = options
    // 生成provider所传入参数
    let providerParam: Cesium.OpenStreetMapImageryProvider.ConstructorOptions = {
      ...argsOptions
    }
    // 特殊处理的参数
    if (rectangle) providerParam.rectangle = Cesium.Rectangle.fromDegrees(...rectangle)
    if (ellipsoid) providerParam.ellipsoid = new Cesium.Ellipsoid(...ellipsoid)
    // 实例服务
    const provider = new Cesium.OpenStreetMapImageryProvider(providerParam)
    // 将影像加载到视图
    const lyr_osm = viewer.imageryLayers.addImageryProvider(provider)
    return lyr_osm
  }
  /**
   * @internal
   * 返回图层加载方法：{@link  layerManager.addLayer} ；返回图层类型定义：{@link layerManager.layerTypesMap.singletile}。
   */
  export const addSingleTileLayer = (options: SingleTileLayerOptions): Cesium.ImageryLayer => {
    const { viewer = variable.viewer, id, type, label, rectangle, ellipsoid, ...argsOptions } = options
    // 生成provider所传入参数
    let providerParam: Cesium.SingleTileImageryProvider.ConstructorOptions = {
      ...argsOptions
    }
    // 特殊处理的参数
    if (rectangle) providerParam.rectangle = Cesium.Rectangle.fromDegrees(...rectangle)
    if (ellipsoid) providerParam.ellipsoid = new Cesium.Ellipsoid(...ellipsoid)
    // 实例服务
    const provider = new Cesium.SingleTileImageryProvider(providerParam)
    // 将影像加载到视图
    const lyr_singletile = viewer.imageryLayers.addImageryProvider(provider)
    return lyr_singletile
  }
  /**
   * @internal
   * 返回图层加载方法：{@link  layerManager.addLayer} ；返回图层类型定义：{@link layerManager.layerTypesMap.tms}。
   */
  export const addTMSLayer = async (options: TMSLayerOptions): Promise<Cesium.ImageryLayer> => {
    const { viewer = variable.viewer, id, url, type, label, rectangle, tilingScheme, ellipsoid, ...argsOptions } = options
    // 生成provider所传入参数
    let providerParam: Cesium.TileMapServiceImageryProvider.ConstructorOptions = {
      ...argsOptions
    }
    // 特殊处理的参数
    if (rectangle) providerParam.rectangle = Cesium.Rectangle.fromDegrees(...rectangle)
    if (ellipsoid) providerParam.ellipsoid = new Cesium.Ellipsoid(...ellipsoid)
    if (tilingScheme) providerParam.tilingScheme = _getOptionsTilingScheme(tilingScheme)
    // 实例服务
    const provider = await Cesium.TileMapServiceImageryProvider.fromUrl(url, providerParam)
    // 将影像加载到视图
    const lyr_tms = viewer.imageryLayers.addImageryProvider(provider)
    return lyr_tms
  }
  /**
   * @internal
   * 添加以URL为主的地图服务
   *
   * 返回图层加载方法：{@link  layerManager.addLayer} ；返回图层类型定义：{@link layerManager.layerTypesMap.urltemplate}。
   * @param {UrlTemplateLayerOptions} options - 服务参数，请点击 UrlTemplateLayerOptions 查看
   * @return {Cesium.ImageryLayer}
   */
  export const addUrlTemplateLayer = (options: UrlTemplateLayerOptions): Cesium.ImageryLayer => {
    const { viewer = variable.viewer, id, type, label, rectangle, tilingScheme, getFeatureInfoFormats, ellipsoid, customTags, ...argsOptions } = options
    // 生成provider所传入参数
    let providerParam: Cesium.UrlTemplateImageryProvider.ConstructorOptions = {
      ...argsOptions
    }
    // 特殊处理的参数
    if (rectangle) providerParam.rectangle = Cesium.Rectangle.fromDegrees(...rectangle)
    if (tilingScheme) providerParam.tilingScheme = _getOptionsTilingScheme(tilingScheme)
    if (ellipsoid) providerParam.ellipsoid = new Cesium.Ellipsoid(...ellipsoid)
    //#region customTags处理
    let customTagsType = Object.prototype.toString.call(customTags)
    //保护性策略，进行内置，减少配置里加入。后面维护，有多少特殊，就进行多少兼容。
    let customTagsMap = {
      ry: (imageryProvider: Cesium.ImageryProvider, x: number, y: number, level: number) => {
        return (1 << level) - 1 - y
      }
      // time: function (imageryProvider: Cesium.ImageryProvider, x: number, y: number, level: number) {
      //   return new Date()
      // }
    }
    // 未进行兼容的，通过对象传递。但不要直接在配置文件中配置（当配置文件为json时，就无法配置），应在代码逻辑中去添加customTags参数
    if (customTagsType === '[object Object]') {
      providerParam.customTags = customTags
    } else if (customTagsType === '[object String]') {
      let customTagsEmpty: { [key: string]: any } = {}
      ;(customTags as string).split(',').forEach((key: string) => {
        //防止"ry,"形式字符串造成空参数
        key && (customTagsEmpty[key] = customTagsMap[key])
      })
      providerParam.customTags = customTagsEmpty
    }
    //#endregion
    // 实例服务
    const provider = new Cesium.UrlTemplateImageryProvider(providerParam)
    // 将影像加载到视图
    const lyr_urlt = viewer.imageryLayers.addImageryProvider(provider)
    return lyr_urlt
  }
  /**
   * @internal
   * 返回图层加载方法：{@link  layerManager.addLayer} ；返回图层类型定义：{@link layerManager.layerTypesMap.wms}。
   * @description 添加WMS服务
   * @param {WMSLayerOptions} options - 配置项
   * @return {Cesium.ImageryLayer}
   * @example
   * ```ts
   * let options = {
   *  viewer: viewer, //viewer,可缺省
   *  url: '', //wms服务地址，必填，string
   *  layers: '', //图层名，必填，string
   *  format: 'image/png', //格式，可选，默认'image/png'
   *  version: '1.1.1' //版本，可选，默认'1.1.1'
   * }
   * // 调用示例
   * gs3d.manager.layerManager.addLayer(options)
   * ```
   */
  export const addWMSLayer = (options: WMSLayerOptions): Cesium.ImageryLayer => {
    const { id, type, label, viewer = variable.viewer, rectangle, tilingScheme, ellipsoid, getFeatureInfoFormats, ...argsOptions } = options
    // 生成provider所传入参数
    let providerParam: Cesium.WebMapServiceImageryProvider.ConstructorOptions = {
      ...argsOptions
    }
    // 特殊处理的参数
    if (rectangle) providerParam.rectangle = Cesium.Rectangle.fromDegrees(...rectangle)
    if (tilingScheme) providerParam.tilingScheme = _getOptionsTilingScheme(tilingScheme)
    if (ellipsoid) providerParam.ellipsoid = new Cesium.Ellipsoid(...ellipsoid)
    let provider = new Cesium.WebMapServiceImageryProvider(providerParam)
    let lyr_wms = viewer.imageryLayers.addImageryProvider(provider)
    return lyr_wms
  }
  /**
   * @internal
   * 返回图层加载方法：{@link layerManager.addLayer} ；返回图层类型定义：{@link layerManager.layerTypesMap.wmts}。
   */
  export const addWMTSLayer = (options: WMTSLayerOptions): Cesium.ImageryLayer => {
    const {
      viewer = variable.viewer,
      id,
      type,
      url,
      label,
      format = 'image/jpeg',
      urlMethod = 'custom',
      name,
      rectangle,
      tilingScheme,
      ellipsoid,
      useProviderGS3D = false,
      projection,
      ...argsOptions
    } = options
    //处理url，针对不同的瓦片请求方式进行地址拼接映射，即采用不同的geoserver标准进行瓦片请求
    let urlLinkMap = {
      kvpair: url, //url、style、tileMatrixSetID、tileMatrixLabels、name、format
      restful: `${url}/rest/${name}/{style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}?format=${format}`, //url、style、tileMatrixSetID、tileMatrixLabels
      georestful: `${url}/rest/${name}/{style}/{TileMatrixSet}/{TileMatrixSet}:{TileMatrix}/{TileRow}/{TileCol}?format=${format}`, //url、style、tileMatrixSetID
      custom: url
    }
    // 生成provider所传入参数
    let providerParam: imageryProvider.WebMapTileServiceImageryProviderGS3D.ConstructorOptions = {
      url: urlLinkMap[urlMethod],
      layer: name,
      ...argsOptions
    }
    // 特殊处理的参数
    if (rectangle) providerParam.rectangle = Cesium.Rectangle.fromDegrees(...rectangle)
    //投影服务 转换参数
    if (projection) {
      const { ellipsoid, wgs84Bounds, projectedBounds, ...argsOptions } = projection
      providerParam.projection = { ...argsOptions }
      if (ellipsoid) providerParam.projection.ellipsoid = new Cesium.Ellipsoid(...ellipsoid)
      if (wgs84Bounds) providerParam.projection.wgs84Bounds = new Cesium.Rectangle(...wgs84Bounds)
      if (projectedBounds) providerParam.projection.projectedBounds = new Cesium.Rectangle(...projectedBounds)
    } else {
      if (tilingScheme) providerParam.tilingScheme = _getOptionsTilingScheme(tilingScheme)
      if (ellipsoid) providerParam.ellipsoid = new Cesium.Ellipsoid(...ellipsoid)
    }
    // 实例服务
    const provider = useProviderGS3D ? new imageryProvider.WebMapTileServiceImageryProviderGS3D(providerParam) : new Cesium.WebMapTileServiceImageryProvider(providerParam)
    // 添加服务
    let lyr_wmts = viewer.imageryLayers.addImageryProvider(provider)
    // 返回服务
    return lyr_wmts
  }
  /**
   * @internal
   * 返回图层加载方法：{@link  layerManager.addLayer} ；返回图层类型定义：{@link layerManager.layerTypesMap.cesium_terrain}。
   */
  export const addCesiumTerrainLayer = async (options: CesiumTerrainLayerOptions): Promise<Cesium.TerrainProvider> => {
    const { id, type, label, viewer = variable.viewer, url, assetId, ellipsoid, resource, terrainExaggeration = 1, terrainExaggerationRelativeHeight = 0, ...argsOptions } = options
    // 生成provider所传入参数
    let providerParam: Cesium.CesiumTerrainProvider.ConstructorOptions = {
      ...argsOptions
    }

    // 特殊处理的参数
    if (ellipsoid) providerParam.ellipsoid = new Cesium.Ellipsoid(...ellipsoid)

    // provider不同情况
    let provider: Cesium.TerrainProvider
    if (!url && !assetId && assetId !== 0) {
      //默认地形
      provider = await Cesium.createWorldTerrainAsync(providerParam)
    } else if (url) {
      //url地形
      // url处理
      let resourceParam: any = {
        url: url,
        ...resource
      }
      let Resource = new Cesium.Resource(resourceParam)
      // 地形实例
      provider = await Cesium.CesiumTerrainProvider.fromUrl(Resource, providerParam)
    } else if (assetId) {
      //cesiumLab ID地形
      provider = await Cesium.CesiumTerrainProvider.fromIonAssetId(assetId, providerParam)
    }
    // 添加服务
    viewer.terrainProvider = provider
    //用于夸大地形的标量。默认为1.0（不夸张）。值2.0将地形缩放 2 倍。的值0.0使地形完全平坦。请注意，地形夸大不会修改任何其他图元，因为它们是相对于椭圆体定位的。
    viewer.scene.globe.terrainExaggeration = terrainExaggeration
    //夸大地形的高度。默认为0.0（相对于椭球表面缩放）。高于此高度的地形将向上缩放，低于此高度的地形将向下缩放。请注意，地形夸大不会修改任何其他图元，因为它们是相对于椭圆体定位的。如果Globe#terrainExaggeration是1.0这个值将没有效果。
    viewer.scene.globe.terrainExaggerationRelativeHeight = terrainExaggerationRelativeHeight
    return provider
  }
  /**
   * @internal
   * 返回图层加载方法：{@link  layerManager.addLayer} ；返回图层类型定义：{@link layerManager.layerTypesMap.ellipsoid_terrain}。
   */
  export const addEllipsoidTerrainLayer = (options: EllipsoidTerrainLayerOptions): Cesium.EllipsoidTerrainProvider => {
    const { viewer = variable.viewer, id, type, label, tilingScheme, ellipsoid } = options
    type pickType = {
      tilingScheme?: ReturnType<typeof _getOptionsTilingScheme>
      ellipsoid?: Cesium.Ellipsoid
    }
    // 生成provider所传入参数
    let providerParam: pickType = {}
    // 特殊处理的参数
    if (tilingScheme) providerParam.tilingScheme = _getOptionsTilingScheme(tilingScheme)
    if (ellipsoid) providerParam.ellipsoid = new Cesium.Ellipsoid(...ellipsoid)
    // 实例服务
    const provider = new Cesium.EllipsoidTerrainProvider(providerParam)
    // 添加服务
    viewer.terrainProvider = provider
    return provider
  }
  /**
   * @internal
   * 返回图层加载方法：{@link  layerManager.addLayer} ；返回图层类型定义：{@link layerManager.layerTypesMap.google_terrain}。
   */
  export const addGoogleTerrainLayer = async (options: GoogleTerrainLayerOptions): Promise<Cesium.GoogleEarthEnterpriseTerrainProvider> => {
    const { viewer = variable.viewer, id, type, label, url, ellipsoid, ...argsOptions } = options
    // 生成provider所传入参数
    let providerParam: Cesium.GoogleEarthEnterpriseTerrainProvider.ConstructorOptions = {
      ...argsOptions
    }
    // 特殊处理的参数
    if (ellipsoid) providerParam.ellipsoid = new Cesium.Ellipsoid(...ellipsoid)
    //获取数据
    const metadata = await Cesium.GoogleEarthEnterpriseMetadata.fromUrl(url)
    // 实例服务
    const provider = Cesium.GoogleEarthEnterpriseTerrainProvider.fromMetadata(metadata, providerParam)
    // 添加服务
    viewer.terrainProvider = provider
    return provider
  }

  // 系列图层加载方法 注意后续4490兼容
  /**
   * @internal
   * 返回图层加载方法：{@link  layerManager.addLayer} ；返回图层类型定义：{@link layerManager.layerTypesMap.arcgis_mapserver}。
   */
  export const addArcGisMapServerLayer = async (options: ArcGisMapServerLayerOptions): Promise<Cesium.ImageryLayer> => {
    const { type, ...argsOptions } = options
    let lyr_arcgis_mapserver = await addMapServerLayer({
      type: 'mapserver',
      ...argsOptions
    })
    return lyr_arcgis_mapserver
  }
  /**
   * @internal
   * 返回图层加载方法：{@link  layerManager.addLayer} ；返回图层类型定义：{@link layerManager.layerTypesMap.arcgis_dynamic}。
   */
  export const addArcGisDynamicLayer = async (options: ArcGisDynamicLayerOptions): Promise<Cesium.ImageryLayer> => {
    const { type, ...argsOptions } = options
    let lyr_arcgis_dynamic = await addMapServerLayer({
      type: 'mapserver',
      ...argsOptions
    })
    return lyr_arcgis_dynamic
  }
  /**
   * @internal
   * 返回图层加载方法：{@link  layerManager.addLayer} ；返回图层类型定义：{@link layerManager.layerTypesMap.arcgis_imageserver}。
   */
  export const addArcGisImageServerLayer = (options: ArcGisImageServerLayerOptions) => {
    const viewer = options.viewer ?? variable.viewer
  }
  /**
   * @internal
   * 返回图层加载方法：{@link  layerManager.addLayer} ；返回图层类型定义：{@link layerManager.layerTypesMap.arcgis_tileserver}。
   */
  export const addArcGisTileServerLayer = (options: ArcGisTileServerLayerOptions) => {
    const viewer = options.viewer ?? variable.viewer
  }
  /**
   * @internal
   * 返回图层加载方法：{@link  layerManager.addLayer} ；返回图层类型定义：{@link layerManager.layerTypesMap.arcgis_featurserver}。
   */
  export const addArcGisFeatureServerLayer = (options: ArcGisFeatureServerLayerOptions) => {
    const viewer = options.viewer ?? variable.viewer
  }
  /**
   * @internal
   * 返回图层加载方法：{@link  layerManager.addLayer} ；返回图层类型定义：{@link layerManager.layerTypesMap.arcgis_terrain}。
   */
  export const addArcGisTerrainLayer = async (options: ArcGisTerrainLayerOptions): Promise<Cesium.ArcGISTiledElevationTerrainProvider> => {
    const { viewer = variable.viewer, id, type, label, url, ellipsoid, ...argsOptions } = options
    // 生成provider所传入参数
    let providerParam: Cesium.ArcGISTiledElevationTerrainProvider.ConstructorOptions = {
      ...argsOptions
    }
    // 特殊处理的参数
    if (ellipsoid) providerParam.ellipsoid = new Cesium.Ellipsoid(...ellipsoid)
    // 实例服务
    const terrainProvider = await Cesium.ArcGISTiledElevationTerrainProvider.fromUrl(url, providerParam)
    // 添加服务
    viewer.terrainProvider = terrainProvider
    return terrainProvider
  }
  /**
   * @internal
   * 返回图层加载方法：{@link  layerManager.addLayer} ；返回图层类型定义：{@link layerManager.layerTypesMap.arcgis_wmts}。
   */
  export const addArcGisWMTSLayer = (options: ArcGisWMTSLayerOptions) => {
    const { type, ...argsOptions } = options
    let lyr_arcgis_wmts = addWMTSLayer({
      type: 'wmts',
      ...argsOptions
    })
    return lyr_arcgis_wmts
  }
  /**
   * @internal
   * 返回图层加载方法：{@link  layerManager.addLayer} ；返回图层类型定义：{@link layerManager.layerTypesMap.arcgis_wms}。
   */
  export const addArcGisWMSLayer = (options: ArcGisWMSLayerOptions) => {
    // const { viewer = variable.viewer, url, layers, transparent = true, format = 'image/png', version = '1.1.1' } = options
    // let lyr_wmsLayer = addWMSLayer(options)
    let lyr_wmsLayer = addWMSLayer({
      ...options,
      type: 'wms'
    })
    return lyr_wmsLayer
  }
  /**
   * @internal
   * 返回图层加载方法：{@link  layerManager.addLayer} ；返回图层类型定义：{@link layerManager.layerTypesMap.arcgis_odLine}。
   */
  export const addArcGisOdlineLayer = (options: ArcGisOdlineLayerOptions) => {
    const viewer = options.viewer ?? variable.viewer
  }
  /**
   * @internal
   * 返回图层加载方法：{@link  layerManager.addLayer} ；返回图层类型定义：{@link layerManager.layerTypesMap.geoserver_wms}。
   */
  export const addGeoServerWMSLayer = (options: GeoServerWMSLayerOptions) => {
    // const { viewer = variable.viewer, url, layers, transparent = true, format = 'image/png', version = '1.1.1' } = options
    // let lyr_wmsLayer = addWMSLayer(options)
    // return lyr_wmsLayer
    let lyr = addWMSLayer({
      ...options,
      type: 'wms'
    })
    return lyr
  }
  /**
   * @internal
   * 返回图层加载方法：{@link  layerManager.addLayer} ；返回图层类型定义：{@link layerManager.layerTypesMap.geoserver_wmts}。
   */
  export const addGeoServerWMTSLayer = (options: GeoServerWMTSLayerOptions) => {
    const { type, ...argsOptions } = options
    let lyr_geoserver_wmts = addWMTSLayer({
      type: 'wmts',
      ...argsOptions
    })
    return lyr_geoserver_wmts
  }
  /**
   * @internal
   * 返回图层加载方法：{@link  layerManager.addLayer} ；返回图层类型定义：{@link layerManager.layerTypesMap.geoserver_tms}。
   */
  export const addGeoServerTMSLayer = (options: GeoServerTMSLayerOptions) => {
    const viewer = options.viewer ?? variable.viewer
  }
  /**
   * @internal
   * 返回图层加载方法：{@link  layerManager.addLayer} ；返回图层类型定义：{@link layerManager.layerTypesMap.geoserver_wfs}。
   */
  export const addGeoServerWFSLayer = (options: GeoServerWFSLayerOptions) => {
    const viewer = options.viewer ?? variable.viewer
  }
  /**
   * @internal
   * 返回图层加载方法：{@link  layerManager.addLayer} ；返回图层类型定义：{@link layerManager.layerTypesMap.geoserver_wcs}。
   */
  export const addGeoServerWCSLayer = (options: GeoServerWCSLayerOptions) => {
    const viewer = options.viewer ?? variable.viewer
  }
  /**
   * @internal
   * 返回图层加载方法：{@link  layerManager.addLayer} ；返回图层类型定义：{@link layerManager.layerTypesMap.mapbox_mvt}。
   */
  export const addMapboxMVTLayer = (options: MapboxMVTLayerOptions) => {
    const viewer = options.viewer ?? variable.viewer
  }
  /**
   * @internal
   * 返回图层加载方法：{@link  layerManager.addLayer} ；返回图层类型定义：{@link layerManager.layerTypesMap.skyline_terrain}。
   */
  export const addSkylineTerrainLayer = (options: SkylineTerrainLayerOptions) => {
    const viewer = options.viewer ?? variable.viewer
  }
  /**
   * @internal
   * 返回图层加载方法：{@link  layerManager.addLayer} ；返回图层类型定义：{@link layerManager.layerTypesMap.skyline_image}。
   */
  export const addSkylineImageLayer = (options: SkylineImageLayerOptions) => {
    const viewer = options.viewer ?? variable.viewer
  }
  /**
   * @internal
   * 返回图层加载方法：{@link  layerManager.addLayer} ；返回图层类型定义：{@link layerManager.layerTypesMap.skyline_feature}。
   */
  export const addSkylineFeatureLayer = (options: SkylineFeatureLayerOptions) => {
    const viewer = options.viewer ?? variable.viewer
  }
  /**
   * @internal
   * 返回图层加载方法：{@link  layerManager.addLayer} ；返回图层类型定义：{@link layerManager.layerTypesMap.model_s3m}。
   */
  export const addModelS3MLayer = (options: ModelS3MLayerOptions) => {
    const viewer = options.viewer ?? variable.viewer
  }
  /**
   * @internal
   * 返回图层加载方法：{@link  layerManager.addLayer} ；返回图层类型定义：{@link layerManager.layerTypesMap.model_i3s}。
   */
  export const addModelI3SLayer = (options: ModelI3SLayerOptions) => {
    const viewer = options.viewer ?? variable.viewer
  }
  /**
   * @internal
   * 返回图层加载方法：{@link  layerManager.addLayer} ；返回图层类型定义：{@link layerManager.layerTypesMap.model_gltf}。
   */
  export const addModelGltfLayer = (options: ModelGltfLayerOptions) => {
    const viewer = options.viewer ?? variable.viewer
  }
  /**
   * @internal
   * 返回图层加载方法：{@link  layerManager.addLayer} ；返回图层类型定义：{@link layerManager.layerTypesMap.model_3d_tiles}。
   * @description 加载3dtiles
   * @param {any} options - 配置项
   * @param {string} options.id - 图层id,必传
   * @param {string} options.type - 图层类型,必传
   * @param {string} options.url - 图层地址，必传
   * @param {string} options.label - 图层标题
   * @return {*}
   * @example
   * ```ts
   *   let options = {
   *     id: 'dayanta',//唯一值id
   *     label: '大雁塔3dtiles',//标签名
   *     type: 'model_3d_tiles',//类型
   *     url: 'https://earthsdk.com/v/last/Apps/assets/dayanta/tileset.json',//模型地址
   *     setPosition: {//设置位置和高度，可选值，默认位置为模型原始位置，默认高度0
   *       lng: 123.3918,
   *       lat: 41.7947,
   *       height: 100//数字
   *     },
   *     translation: {//平移，可选值，默认xyz值均为0
   *       x: 200,
   *       y: 0,
   *       z: -430
   *     },
   *     rotate: {//旋转，可选值，默认xyz值均为0
   *       x: 0,
   *       y: 0,
   *       z: 0
   *     },
   *     scale: 1,//缩放，可选值，默认1
   *     islocation: true,//是否定位到模型，可选值，默认false
   *     isShowOriginPoint: true//是否显示模型原始中心点，可选值，默认false
   *   }
   *   // 调用示例
   *   gs3d.manager.layerManager.addLayer(options)
   * ```
   */
  export const addModel3dTilesLayer = async (options: Model3dTilesLayerOptions) => {
    const viewer = options.viewer ?? variable.viewer
    const tileSet = await Cesium.Cesium3DTileset.fromUrl(options.url)
    let originEntity = null
    const { lng, lat, height = 0 } = options.setPosition || {}
    const { x: tx = 0, y: ty = 0, z: tz = 0 } = options.translation || {}
    const { x: rx = 0, y: ry = 0, z: rz = 0 } = options.rotate || {}
    const { scale = 1, islocation = false, isShowOriginPoint = false } = options || {}

    const originCartographic = Cesium.Cartographic.fromCartesian(tileSet.boundingSphere.center)
    const originSurface = Cesium.Cartesian3.fromRadians(originCartographic.longitude, originCartographic.latitude, 0.0)
    //原点
    if (isShowOriginPoint) {
      originEntity = {
        id: 'tilesetOrigin',
        point: new Cesium.PointGraphics({
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          color: Cesium.Color.fromCssColorString('#ff0033'),
          pixelSize: 30,
          outlineColor: Cesium.Color.fromCssColorString('#ff0033'),
          outlineWidth: 1
        }),
        label: {
          text: options.label + '原始中心点'
        },
        position: originSurface
      }
      viewer.entities.add(originEntity)
    }
    //设置位置和高度
    if (options.setPosition && Object.keys(options.setPosition).length) {
      // if (height == 'clampToGround') {
      //   const position = cartographic // Cesium.Cartographic.fromRadians(cartographic.longitude, cartographic.latitude)
      //   Cesium.sampleTerrainMostDetailed(viewer.terrainProvider, [position]).then(function (updatedPositions) {
      //     height = updatedPositions[0].height
      //     setModelMatrix()
      //   })
      // } else {
      //   setModelMatrix()
      // }
      setModelMatrix()
      function setModelMatrix() {
        const offset = Cesium.Cartesian3.fromRadians(Cesium.Math.toRadians(lng) || originCartographic.longitude, Cesium.Math.toRadians(lat) || originCartographic.latitude, height)
        const translation = Cesium.Cartesian3.subtract(offset, originSurface, new Cesium.Cartesian3())
        tileSet.modelMatrix = Cesium.Matrix4.fromTranslation(translation)
      }
    }

    const cartographic = Cesium.Cartographic.fromCartesian(tileSet.boundingSphere.center)
    const surface = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, cartographic.height)
    const m = Cesium.Transforms.eastNorthUpToFixedFrame(surface)

    //平移
    const _tx = tx ? tx : 0
    const _ty = ty ? ty : 0
    const _tz = tz ? tz : 0
    const tempTranslation = new Cesium.Cartesian3(_tx, _ty, _tz)
    const offset = Cesium.Matrix4.multiplyByPoint(m, tempTranslation, new Cesium.Cartesian3(0, 0, 0))
    const translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3())
    tileSet.modelMatrix = Cesium.Matrix4.fromTranslation(translation)

    //旋转
    if (rx) {
      const mx = Cesium.Matrix3.fromRotationX(Cesium.Math.toRadians(rx))
      const rotate = Cesium.Matrix4.fromRotationTranslation(mx)
      Cesium.Matrix4.multiply(m, rotate, m)
    }
    if (ry) {
      const my = Cesium.Matrix3.fromRotationY(Cesium.Math.toRadians(ry))
      const rotate = Cesium.Matrix4.fromRotationTranslation(my)
      Cesium.Matrix4.multiply(m, rotate, m)
    }
    if (rz) {
      const mz = Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(rz))
      const rotate = Cesium.Matrix4.fromRotationTranslation(mz)
      Cesium.Matrix4.multiply(m, rotate, m)
    }

    //缩放
    if (scale) {
      const _scale = Cesium.Matrix4.fromUniformScale(scale)
      Cesium.Matrix4.multiply(m, _scale, m)
    }

    tileSet.root.transform = m

    // tileSet.style = new Cesium.Cesium3DTileStyle({
    //   color: `color('rgba(255,255,255,${alpha})')`,
    // })

    viewer.scene.primitives.add(tileSet)

    //定位
    if (islocation) {
      viewer.zoomTo(tileSet)
    }
    return {
      tileSet: tileSet,
      originEntity: originEntity
    }
  }
  /**
   * @internal
   * 返回图层加载方法：{@link  layerManager.addLayer} ；返回图层类型定义：{@link layerManager.layerTypesMap.other_gaode}。
   * @description 高德服务加载
   * @param {any} options - 配置项
   * @return {*}
   * @example
   * ```ts
   *   let options={
   *     id: 'gdyx-fw',//唯一标识
   *     label: '高德矢量服务',//标签名
   *     type: 'other_gaode',//类型
   *     url: 'https://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}',//服务地址
   *     minimumLevel: 3,//number | undefined,可选，影像提供程序支持的最低细节层次
   *     maximumLevel: 18,//number | undefined,可选，影像提供程序支持的最高细节层次
   *   }
   *   // 调用示例
   *   gs3d.manager.layerManager.addLayer(options)
   * ```
   */
  export const addOtherGaodeLayer = (options: OtherGaodeLayerOptions): Cesium.ImageryLayer => {
    const { viewer = variable.viewer } = options
    let argsOptions: any = {}
    if (options.minimumLevel) argsOptions.minimumLevel = options.minimumLevel
    if (options.maximumLevel) argsOptions.maximumLevel = options.maximumLevel
    const lyr = addUrlTemplateLayer({
      viewer,
      id: options.id,
      type: 'urltemplate',
      label: options.label,
      url: options.url,
      ...argsOptions,
      tilingScheme: 'gaode'
    })
    return lyr
  }
  /**
   * @internal
   * 返回图层加载方法：{@link  layerManager.addLayer} ；返回图层类型定义：{@link layerManager.layerTypesMap.other_baidu}。
   */
  export const addOtherBaiduLayer = (options: OtherBaiduLayerOptions) => {
    const viewer = options.viewer ?? variable.viewer
  }
  /**
   * @internal
   * 返回图层加载方法：{@link  layerManager.addLayer} ；返回图层类型定义：{@link layerManager.layerTypesMap.other_openStreetMap}。
   */
  export const addOtherOpenStreetMapLayer = (options: OtherOpenStreetMapLayerOptions) => {
    const viewer = options.viewer ?? variable.viewer
  }
  /**
   * @internal
   * 返回图层加载方法：{@link  layerManager.addLayer} ；返回图层类型定义：{@link layerManager.layerTypesMap.cesium_tileCoord}。
   */
  export const addTileCoordinatesLayer = (options: TileCoordinatesLayerOptions) => {
    const { id, type, label, viewer = variable.viewer, tilingScheme, color, ellipsoid, ...argsOptions } = options
    // 生成provider所传入参数
    let providerParam: Cesium.TileCoordinatesImageryProvider.ConstructorOptions = {
      ...argsOptions
    }
    // 特殊处理的参数
    if (tilingScheme) providerParam.tilingScheme = _getOptionsTilingScheme(tilingScheme)
    if (ellipsoid) providerParam.ellipsoid = new Cesium.Ellipsoid(...ellipsoid)
    if (color) providerParam.color = Cesium.Color.fromCssColorString(color)
    // 影像实例
    const provider = new Cesium.TileCoordinatesImageryProvider(providerParam)
    let lyr_cesium_tileCoord = viewer.imageryLayers.addImageryProvider(provider)
    return lyr_cesium_tileCoord
  }
}

export { layerLoader }
