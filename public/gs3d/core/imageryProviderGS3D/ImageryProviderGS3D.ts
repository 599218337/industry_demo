import {
  defaultValue,
  GeographicTilingScheme,
  Credit,
  defined as CesiumDefined,
  DiscardMissingTileImagePolicy,
  Cartesian2,
  WebMercatorProjection,
  Rectangle,
  Cartesian3,
  RuntimeError,
  Event as CesiumEvent,
  DeveloperError,
  Resource,
  ArcGisMapService,
  ImageryProvider,
  Cartographic,
  Math as CesiumMath,
  ImageryLayerFeatureInfo,
  ArcGisBaseMapType,
  GeographicProjection,
  combine,
  Event,
  TimeDynamicImagery,
  Ellipsoid,
  Clock,
  TimeIntervalCollection,
  TilingScheme as CesiumTilingScheme,
  TileDiscardPolicy
} from 'cesium'

import { ProjectionGS3D } from './ProjectionGS3D'
import { TilingScheme } from '../tilingScheme'
import { imageryProvider } from '..'
import { Cesium } from 'gs3d'
const { CGCS2000TilingScheme, CGCS4490TilingScheme, CGCS2000Ellipsoid, WebMercatorTilingSchemeGS3D } = TilingScheme

const _buildImageResource = (imageryProvider: ArcGisMapServerImageryProviderGS3D, x, y, level, request?: any) => {
  let resource
  if (imageryProvider.useTiles) {
    resource = imageryProvider.resource.getDerivedResource({
      url: `tile/${level}/${y}/${x}`,
      request: request
    })
  } else {
    const nativeRectangle = imageryProvider.tilingScheme.tileXYToNativeRectangle(x, y, level)
    const bbox = `${nativeRectangle.west},${nativeRectangle.south},${nativeRectangle.east},${nativeRectangle.north}`

    const query: {
      layers?: string
      imageSR?: number
      bboxSR?: number
      bbox: string
      size: string
      format: string
      transparent: boolean
      f: string
    } = {
      bbox: bbox,
      size: `${imageryProvider.tileWidth},${imageryProvider.tileHeight}`,
      format: 'png32',
      transparent: true,
      f: 'image'
    }

    if (imageryProvider.tilingScheme.projection instanceof GeographicProjection) {
      query.bboxSR = 4326
      query.imageSR = 4326
    } else {
      query.bboxSR = 3857
      query.imageSR = 3857
    }
    if (imageryProvider.layers) {
      query.layers = `show:${imageryProvider.layers}`
    }

    resource = imageryProvider.resource.getDerivedResource({
      url: 'export',
      request: request,
      queryParameters: query
    })
  }
  return resource
}

class ImageryProviderBuilderGS3D {
  useTiles: any
  tilingScheme: any
  rectangle: any
  ellipsoid: any
  credit: any
  tileCredits: any
  tileDiscardPolicy: any
  tileWidth: any
  tileHeight: any
  maximumLevel: any
  callback: any
  private _rectangle: any
  private _tilingScheme: CesiumTilingScheme
  projection: ProjectionGS3D

  constructor(options) {
    this.useTiles = defaultValue(options.usePreCachedTilesIfAvailable, true)

    const ellipsoid = options.ellipsoid
    this.tilingScheme = defaultValue(options.tilingScheme, new GeographicTilingScheme({ ellipsoid: ellipsoid }))
    this.rectangle = defaultValue(options.rectangle, this.tilingScheme.rectangle)
    this.ellipsoid = ellipsoid

    let credit = options.credit
    if (typeof credit === 'string') {
      credit = new Credit(credit)
    }
    this.credit = credit
    this.tileCredits = undefined
    this.tileDiscardPolicy = options.tileDiscardPolicy

    this.tileWidth = defaultValue(options.tileWidth, 256)
    this.tileHeight = defaultValue(options.tileHeight, 256)
    this.maximumLevel = options.maximumLevel

    //增加回调传递要素拾取结果数据
    this.callback = options?.callback ?? function (result) {}
  }

  build(provider: ArcGisMapServerImageryProviderGS3D) {
    provider.useTiles = this.useTiles
    provider.tilingScheme = this.tilingScheme
    provider.rectangle = this.rectangle
    provider.credit = this.credit
    provider.tileCredits = this.tileCredits
    provider.tileDiscardPolicy = this.tileDiscardPolicy
    provider.tileWidth = this.tileWidth
    provider.tileHeight = this.tileHeight
    provider.maximumLevel = this.maximumLevel

    // Install the default tile discard policy if none has been supplied.
    if (this.useTiles && !CesiumDefined(this.tileDiscardPolicy)) {
      provider.tileDiscardPolicy = new DiscardMissingTileImagePolicy({
        missingImageUrl: _buildImageResource(provider, 0, 0, this.maximumLevel).url,
        pixelsToCheck: [new Cartesian2(0, 0), new Cartesian2(200, 20), new Cartesian2(20, 200), new Cartesian2(80, 110), new Cartesian2(160, 130)],
        disableCheckIfAllPixelsAreTransparent: true
      })
    }
  }
}
/**
 * ArcGisMapServerImageryProvider扩展
 */
export namespace ArcGisMapServerImageryProviderGS3D {
  /**
   * ArcGisMapServerImageryProviderGS3D参数
   */
  export type ConstructorOptions = {
    callback?: (result: any) => void
    projection?: ProjectionGS3D.ConstructorOptions

    tileDiscardPolicy?: TileDiscardPolicy
    usePreCachedTilesIfAvailable?: boolean
    layers?: string
    enablePickFeatures?: boolean
    rectangle?: Rectangle
    tilingScheme?: CesiumTilingScheme
    ellipsoid?: Ellipsoid
    credit?: Credit | string
    tileWidth?: number
    tileHeight?: number
    maximumLevel?: number
  }
}

/**
 * ArcGisMapServerImageryProvider扩展
 */
export class ArcGisMapServerImageryProviderGS3D {
  //#region 变量属性
  static _metadataCache: {}
  private _defaultAlpha: any
  private _defaultNightAlpha: any
  private _defaultDayAlpha: any
  private _defaultBrightness: any
  private _defaultContrast: any
  private _defaultHue: any
  private _defaultSaturation: any
  private _defaultGamma: any
  private _defaultMinificationFilter: any
  private _defaultMagnificationFilter: any
  private _tileDiscardPolicy: any
  private _tileWidth: any
  private _tileHeight: any
  private _maximumLevel: any
  private _tilingScheme: any
  private _useTiles: any
  private _rectangle: any
  private _layers: any
  private _credit: any
  private _tileCredits: any
  private _errorEvent: CesiumEvent<(...args: any[]) => void>
  private _callback: Function
  //可获取属性

  credit: any
  enablePickFeatures: any
  url: any
  token: any
  proxy: any
  tileWidth: any
  tileHeight: any
  maximumLevel: any
  minimumLevel: number
  tilingScheme: any
  rectangle: any
  tileDiscardPolicy: any
  errorEvent: CesiumEvent<(...args: any[]) => void>
  usingPrecachedTiles: any
  hasAlphaChannel: boolean
  layers: any
  private _resource: any
  useTiles: any
  public resource: any
  tileCredits: any
  callback: Function
  //#endregion
  constructor(options: ArcGisMapServerImageryProviderGS3D.ConstructorOptions) {
    options = defaultValue(options, Object.freeze({}))

    this._defaultAlpha = undefined
    this._defaultNightAlpha = undefined
    this._defaultDayAlpha = undefined
    this._defaultBrightness = undefined
    this._defaultContrast = undefined
    this._defaultHue = undefined
    this._defaultSaturation = undefined
    this._defaultGamma = undefined
    this._defaultMinificationFilter = undefined
    this._defaultMagnificationFilter = undefined

    this._tileDiscardPolicy = options.tileDiscardPolicy
    this._tileWidth = defaultValue(options.tileWidth, 256)
    this._tileHeight = defaultValue(options.tileHeight, 256)
    this._maximumLevel = options.maximumLevel
    this._tilingScheme = defaultValue(options.tilingScheme, new GeographicTilingScheme({ ellipsoid: options.ellipsoid }))
    this._useTiles = defaultValue(options.usePreCachedTilesIfAvailable, true)
    this._rectangle = defaultValue(options.rectangle, this._tilingScheme.rectangle)
    this._layers = options.layers
    this._credit = options.credit
    this._tileCredits = undefined

    //增加回调传递要素拾取结果数据
    this._callback = options?.callback ?? function (result) {}
    this.callback = this._callback
    this.credit = options.credit
    if (typeof this.credit === 'string') {
      this.credit = new Credit(this.credit)
    }

    this.enablePickFeatures = defaultValue(options.enablePickFeatures, true)

    this._errorEvent = new CesiumEvent()

    this.url = this?._resource?._url
    this.token = this?._resource?.queryParameters?.token
    this.proxy = this?._resource?.proxy
    this.tileWidth = this._tileWidth
    this.tileHeight = this._tileHeight
    this.maximumLevel = this._maximumLevel
    this.minimumLevel = 0
    this.tilingScheme = this._tilingScheme
    this.rectangle = this._rectangle
    this.tileDiscardPolicy = this._tileDiscardPolicy
    this.errorEvent = this._errorEvent
    this.credit = this._credit
    this.usingPrecachedTiles = this._useTiles
    this.hasAlphaChannel = true
    this.layers = this._layers
    this.useTiles = this._useTiles
    this.resource = this._resource
    this.tileCredits = this._tileCredits
  }

  static async fromBasemapType(style, options) {
    //>>includeStart('debug', pragmas.debug);
    // Check.defined('style', style)
    //>>includeEnd('debug');
    function getUndefinedErrorMessage(name) {
      return `${name} is required, actual value was undefined`
    }
    function defined(name, test) {
      if (!CesiumDefined(test)) {
        throw new DeveloperError(getUndefinedErrorMessage(name))
      }
    }
    defined('style', style)
    options = defaultValue(options, Object.freeze({}))
    let accessToken
    let server
    let warningCredit
    function createIfNeeded(resource) {
      if (resource instanceof Resource) {
        return resource.getDerivedResource({
          request: resource.request
        })
      }

      if (typeof resource !== 'string') {
        return resource
      }

      return new Resource({
        url: resource
      })
    }
    switch (style) {
      case ArcGisBaseMapType.SATELLITE:
        {
          accessToken = defaultValue(options.token, ArcGisMapService.defaultAccessToken)
          server = createIfNeeded(ArcGisMapService.defaultWorldImageryServer)
          server.appendForwardSlash()
          const defaultTokenCredit = ArcGisMapService.getDefaultTokenCredit(accessToken) as unknown as Credit
          if (CesiumDefined(defaultTokenCredit)) {
            warningCredit = Credit.clone(defaultTokenCredit)
          }
        }
        break
      case ArcGisBaseMapType.OCEANS:
        {
          accessToken = defaultValue(options.token, ArcGisMapService.defaultAccessToken)
          server = createIfNeeded(ArcGisMapService.defaultWorldOceanServer)
          server.appendForwardSlash()
          const defaultTokenCredit = ArcGisMapService.getDefaultTokenCredit(accessToken) as unknown as Credit
          if (CesiumDefined(defaultTokenCredit)) {
            warningCredit = Credit.clone(defaultTokenCredit)
          }
        }
        break
      case ArcGisBaseMapType.HILLSHADE:
        {
          accessToken = defaultValue(options.token, ArcGisMapService.defaultAccessToken)
          server = createIfNeeded(ArcGisMapService.defaultWorldHillshadeServer)
          server.appendForwardSlash()
          const defaultTokenCredit = ArcGisMapService.getDefaultTokenCredit(accessToken) as unknown as Credit
          if (CesiumDefined(defaultTokenCredit)) {
            warningCredit = Credit.clone(defaultTokenCredit)
          }
        }
        break
      default:
        //>>includeStart('debug', pragmas.debug);
        throw new DeveloperError(`Unsupported basemap type: ${style}`)
      //>>includeEnd('debug');
    }

    return ArcGisMapServerImageryProviderGS3D.fromUrl(server, {
      ...options,
      token: accessToken,
      credit: warningCredit,
      usePreCachedTilesIfAvailable: true // ArcGIS Base Map Service Layers only support Tiled views
    })
  }

  static async fromUrl(url, options) {
    //>>includeStart('debug', pragmas.debug);
    // Check.defined('url', url)
    //>>includeEnd('debug');
    function getUndefinedErrorMessage(name) {
      return `${name} is required, actual value was undefined`
    }
    function defined(name, test) {
      if (!CesiumDefined(test)) {
        throw new DeveloperError(getUndefinedErrorMessage(name))
      }
    }
    defined('url', url)

    options = defaultValue(options, Object.freeze({}))

    function createIfNeeded(resource) {
      if (resource instanceof Resource) {
        return resource.getDerivedResource({
          request: resource.request
        })
      }

      if (typeof resource !== 'string') {
        return resource
      }

      return new Resource({
        url: resource
      })
    }

    const resource = createIfNeeded(url)
    resource.appendForwardSlash()

    if (CesiumDefined(options.token)) {
      resource.setQueryParameters({
        token: options.token
      })
    }
    const provider = new ArcGisMapServerImageryProviderGS3D(options)
    provider._resource = resource
    provider.resource = resource
    const imageryProviderBuilder = new ImageryProviderBuilderGS3D(options)
    const useTiles = defaultValue(options.usePreCachedTilesIfAvailable, true)
    if (useTiles) {
      await this.requestMetadata(resource, imageryProviderBuilder)
    }

    imageryProviderBuilder.build(provider)
    return provider
  }

  getTileCredits(x, y, level) {
    return this.tileCredits
  }
  requestImage(x, y, level, request) {
    return ImageryProvider.loadImage(this, _buildImageResource(this, x, y, level, request))
  }
  pickFeatures(x, y, level, longitude, latitude) {
    if (!this.enablePickFeatures) {
      return undefined
    }

    let that = this
    const rectangle = this._tilingScheme.tileXYToNativeRectangle(x, y, level)

    // const DEGREES_PER_RADIAN = 180.0 / Math.PI;
    // function toDegrees(radians) {
    //   //>>includeStart('debug', pragmas.debug);
    //   if (!defined(radians)) {
    //     throw new DeveloperError("radians is required.");
    //   }
    //   //>>includeEnd('debug');
    //   return radians * DEGREES_PER_RADIAN;
    // }

    let horizontal
    let vertical
    let sr
    if (this._tilingScheme.projection instanceof GeographicProjection) {
      horizontal = CesiumMath.toDegrees(longitude)
      vertical = CesiumMath.toDegrees(latitude)
      sr = '4326'
    } else {
      const projected = this._tilingScheme.projection.project(new Cartographic(longitude, latitude, 0.0))
      horizontal = projected.x
      vertical = projected.y
      sr = '3857'
    }

    let layers = 'visible'
    if (CesiumDefined(this._layers)) {
      layers += `:${this._layers}`
    }

    const query = {
      f: 'json',
      tolerance: 2,
      geometryType: 'esriGeometryPoint',
      geometry: `${horizontal},${vertical}`,
      mapExtent: `${rectangle.west},${rectangle.south},${rectangle.east},${rectangle.north}`,
      imageDisplay: `${this._tileWidth},${this._tileHeight},96`,
      sr: sr,
      layers: layers
    }

    const resource = this._resource.getDerivedResource({
      url: 'identify',
      queryParameters: query
    })

    return resource.fetchJson().then(function (json) {
      const result = []

      const features = json.results
      if (!CesiumDefined(features)) {
        return result
      }

      for (let i = 0; i < features.length; ++i) {
        const feature = features[i]

        const featureInfo: ImageryLayerFeatureInfo & { [key: string]: any } = new ImageryLayerFeatureInfo()
        featureInfo.data = feature
        featureInfo.name = feature.value
        featureInfo.properties = feature.attributes
        featureInfo.configureDescriptionFromProperties(feature.attributes)

        // If this is a point feature, use the coordinates of the point.
        if (feature.geometryType === 'esriGeometryPoint' && feature.geometry) {
          const wkid = feature.geometry.spatialReference && feature.geometry.spatialReference.wkid ? feature.geometry.spatialReference.wkid : 4326
          if (wkid === 4326 || wkid === 4283) {
            featureInfo.position = Cartographic.fromDegrees(feature.geometry.x, feature.geometry.y, feature.geometry.z)
          } else if (wkid === 102100 || wkid === 900913 || wkid === 3857) {
            const projection = new WebMercatorProjection()
            featureInfo.position = projection.unproject(new Cartesian3(feature.geometry.x, feature.geometry.y, feature.geometry.z))
          }
        }

        result.push(featureInfo)
      }
      that._callback(result.map(f => f.data))
      return result
    })
  }

  static metadataSuccess(data: any, imageryProviderBuilder: ImageryProviderBuilderGS3D) {
    const tileInfo = data.tileInfo
    if (!CesiumDefined(tileInfo)) {
      imageryProviderBuilder.useTiles = false
    } else {
      imageryProviderBuilder.tileWidth = tileInfo.rows
      imageryProviderBuilder.tileHeight = tileInfo.cols

      if (tileInfo.spatialReference.wkid === 102100 || tileInfo.spatialReference.wkid === 102113) {
        // API原本逻辑
        // imageryProviderBuilder.tilingScheme = new WebMercatorTilingScheme({
        //   ellipsoid: imageryProviderBuilder.ellipsoid,
        // });
        // 扩展逻辑
        imageryProviderBuilder.tilingScheme = new WebMercatorTilingSchemeGS3D({
          ellipsoid: imageryProviderBuilder.ellipsoid,
          tileInfo: tileInfo,
          rectangle: imageryProviderBuilder.rectangle
        })
      } else if (data.tileInfo.spatialReference.wkid === 4326) {
        imageryProviderBuilder.tilingScheme = new GeographicTilingScheme({
          ellipsoid: imageryProviderBuilder.ellipsoid
        })
      } else if (data.tileInfo.spatialReference.wkid === 4490) {
        imageryProviderBuilder.tilingScheme = new CGCS4490TilingScheme({
          ellipsoid: imageryProviderBuilder.ellipsoid,
          tileInfo: tileInfo
        })
      } else {
        // API原本逻辑
        // const message = `Tile spatial reference WKID ${data.tileInfo.spatialReference.wkid} is not supported.`;
        // throw new RuntimeError(message);
        // 扩展逻辑
        let projection = null
        if (tileInfo.spatialReference.wkt) {
          //一般为投影坐标系
          let wellKnownText = data.fullExtent.spatialReference.wkt.replace('Gauss_Kruger', 'Transverse_Mercator')
          projection =
            imageryProviderBuilder.projection ||
            new ProjectionGS3D({
              wellKnownText: wellKnownText
              // wgs84Bounds: epsg3411Bounds,
            })
        } else if (tileInfo.spatialReference.wkid) {
          projection =
            imageryProviderBuilder.projection ||
            new ProjectionGS3D({
              wkid: tileInfo.spatialReference.wkid
            })
        }
        imageryProviderBuilder.tilingScheme = new CGCS2000TilingScheme({
          ellipsoid: CGCS2000Ellipsoid,
          projection: projection,
          rectangle: imageryProviderBuilder.rectangle,
          tileInfo: tileInfo
        })
      }
      imageryProviderBuilder.maximumLevel = data.tileInfo.lods.length - 1

      if (CesiumDefined(data.fullExtent)) {
        if (CesiumDefined(data.fullExtent.spatialReference) && CesiumDefined(data.fullExtent.spatialReference.wkid)) {
          if (data.fullExtent.spatialReference.wkid === 102100 || data.fullExtent.spatialReference.wkid === 102113) {
            const projection = new WebMercatorProjection()
            const extent = data.fullExtent
            const sw = projection.unproject(
              new Cartesian3(
                Math.max(extent.xmin, -imageryProviderBuilder.tilingScheme.ellipsoid.maximumRadius * Math.PI),
                Math.max(extent.ymin, -imageryProviderBuilder.tilingScheme.ellipsoid.maximumRadius * Math.PI),
                0.0
              )
            )
            const ne = projection.unproject(
              new Cartesian3(
                Math.min(extent.xmax, imageryProviderBuilder.tilingScheme.ellipsoid.maximumRadius * Math.PI),
                Math.min(extent.ymax, imageryProviderBuilder.tilingScheme.ellipsoid.maximumRadius * Math.PI),
                0.0
              )
            )
            imageryProviderBuilder.rectangle = new Rectangle(sw.longitude, sw.latitude, ne.longitude, ne.latitude)
          } else if (data.fullExtent.spatialReference.wkid === 4326 || data.fullExtent.spatialReference.wkid === 4490) {
            imageryProviderBuilder.rectangle = Rectangle.fromDegrees(data.fullExtent.xmin, data.fullExtent.ymin, data.fullExtent.xmax, data.fullExtent.ymax)
          } else {
            //原本逻辑不兼容其他平面投影
            // const extentMessage = `fullExtent.spatialReference WKID ${data.fullExtent.spatialReference.wkid} is not supported.`;
            // throw new RuntimeError(extentMessage);
            //其他平面投影的
            let projection =
              imageryProviderBuilder.projection ||
              new ProjectionGS3D({
                wkid: data.fullExtent.spatialReference.wkid
              })
            let extent = data.fullExtent
            let sw = projection.unproject(new Cartesian3(extent.xmin, extent.ymin, 0.0))
            let ne = projection.unproject(new Cartesian3(extent.xmax, extent.ymax, 0.0))
            imageryProviderBuilder.rectangle = new Rectangle(sw.longitude, sw.latitude, ne.longitude, ne.latitude)
          }
          tileInfo.extendWidth = data.fullExtent.xmax - data.fullExtent.xmin //计算整个区域的宽度
          tileInfo.extendHeight = data.fullExtent.ymax - data.fullExtent.ymin //计算整个区域的宽度
        } else if (CesiumDefined(data.fullExtent.spatialReference.wkt)) {
          let wellKnownText = data.fullExtent.spatialReference.wkt.replace('Gauss_Kruger', 'Transverse_Mercator')
          let projection =
            imageryProviderBuilder.projection ||
            new ProjectionGS3D({
              wellKnownText: wellKnownText
              // wgs84Bounds: epsg3411Bounds,
            })

          let extent = data.fullExtent
          let sw = projection.unproject(new Cartesian3(extent.xmin, extent.ymin, 0.0))
          let ne = projection.unproject(new Cartesian3(extent.xmax, extent.ymax, 0.0))
          imageryProviderBuilder.rectangle = new Rectangle(sw.longitude, sw.latitude, ne.longitude, ne.latitude)
          tileInfo.extendWidth = extent.xmax - extent.xmin //计算整个区域的宽度
          tileInfo.extendHeight = extent.ymax - extent.ymin //计算整个区域的宽度
        }
      } else {
        imageryProviderBuilder.rectangle = imageryProviderBuilder.tilingScheme.rectangle
      }

      imageryProviderBuilder.useTiles = true
    }

    if (CesiumDefined(data.copyrightText) && data.copyrightText.length > 0) {
      if (CesiumDefined(imageryProviderBuilder.credit)) {
        imageryProviderBuilder.tileCredits = [new Credit(data.copyrightText)]
      } else {
        imageryProviderBuilder.credit = new Credit(data.copyrightText)
      }
    }
  }
  static metadataFailure(resource: any, error: any) {
    let message = `An error occurred while accessing ${resource.url}`
    if (CesiumDefined(error) && CesiumDefined(error.message)) {
      message += `: ${error.message}`
    }

    throw new RuntimeError(message)
  }

  private static async requestMetadata(resource: any, imageryProviderBuilder: ImageryProviderBuilderGS3D) {
    const jsonResource = resource.getDerivedResource({
      queryParameters: {
        f: 'json'
      }
    })

    try {
      const data = await jsonResource.fetchJson()
      this.metadataSuccess(data, imageryProviderBuilder)
    } catch (error) {
      this.metadataFailure(resource, error)
    }
  }
}

/**
 * WebMapTileServiceImageryProvider扩展
 */
export namespace WebMapTileServiceImageryProviderGS3D {
  /**
   * WebMapTileServiceImageryProviderGS3D 参数
   */
  export type ConstructorOptions = {
    //原始API
    url: Resource | string
    format?: string
    layer: string
    style: string
    tileMatrixSetID: string
    tileMatrixLabels?: any[]
    clock?: Clock
    times?: TimeIntervalCollection
    dimensions?: any
    tileWidth?: number
    tileHeight?: number
    tilingScheme?: CesiumTilingScheme
    rectangle?: Rectangle
    minimumLevel?: number
    maximumLevel?: number
    ellipsoid?: Ellipsoid
    credit?: Credit | string
    subdomains?: string | string[]
    //扩展新增参数
    resolutions?: number[]
    scales?: number[]
    origin?: [x: number, y: number]
    extent?: [XMin: number, YMin: number, XMax: number, YMax: number]
    projection?: ProjectionGS3D.ConstructorOptions
    tileDiscardPolicy?: Cesium.TileDiscardPolicy
  }
}

/**
 * WebMapTileServiceImageryProvider扩展，暂不考虑有带号情况的投影服务
 */
export class WebMapTileServiceImageryProviderGS3D {
  //#region 变量属性
  private _defaultAlpha: any
  private _defaultNightAlpha: any
  private _defaultDayAlpha: any
  private _defaultBrightness: any
  private _defaultContrast: any
  private _defaultHue: any
  private _defaultSaturation: any
  private _defaultGamma: any
  private _defaultMinificationFilter: any
  private _defaultMagnificationFilter: any
  private _useKvp: boolean
  private _resource: any
  private _layer: any
  private _style: any
  private _tileMatrixSetID: any
  private _tileMatrixLabels: any
  private _format: any
  private _tileDiscardPolicy: any
  private _tilingScheme: any
  private _tileWidth: any
  private _tileHeight: any
  private _minimumLevel: any
  private _maximumLevel: any
  private _rectangle: any
  private _dimensions: any
  private _reload: any
  private _timeDynamicImagery: TimeDynamicImagery
  private _errorEvent: CesiumEvent<(...args: any[]) => void>
  private _credit: any
  private _subdomains: any
  defaultAlpha: any
  defaultNightAlpha: any
  defaultDayAlpha: any
  defaultBrightness: any
  defaultContrast: any
  defaultHue: any
  defaultSaturation: any
  defaultGamma: any
  defaultMinificationFilter: any
  defaultMagnificationFilter: any
  useKvp: boolean
  resource: any
  layer: any
  style: any
  tileMatrixSetID: any
  tileMatrixLabels: any
  format: any
  tileDiscardPolicy: Cesium.TileDiscardPolicy
  tilingScheme: any
  tileWidth: any
  tileHeight: any
  minimumLevel: any
  maximumLevel: any
  rectangle: any
  // dimensions: any
  reload: any
  timeDynamicImagery: TimeDynamicImagery
  errorEvent: CesiumEvent<(...args: any[]) => void>
  credit: any
  subdomains: any
  url: any
  proxy: any
  hasAlphaChannel: boolean
  clock: Clock
  times: TimeIntervalCollection
  //扩展逻辑新增属性
  private _projection: any
  private _extent: any
  private _origin: any
  private _resolutions: any
  private _tileInfo: { [key: string]: any }
  projection: any
  extent: [XMin: number, YMin: number, XMax: number, YMax: number]
  origin: [x: number, y: number]
  resolutions: number[]
  tileInfo: { [key: string]: any }
  //#endregion

  constructor(options: WebMapTileServiceImageryProviderGS3D.ConstructorOptions) {
    options = defaultValue(options, Object.freeze({}))

    //>>includeStart('debug', pragmas.debug);
    if (!CesiumDefined(options.url)) {
      throw new DeveloperError('options.url is required.')
    }
    if (!CesiumDefined(options.layer)) {
      throw new DeveloperError('options.layer is required.')
    }
    if (!CesiumDefined(options.style)) {
      throw new DeveloperError('options.style is required.')
    }
    if (!CesiumDefined(options.tileMatrixSetID)) {
      throw new DeveloperError('options.tileMatrixSetID is required.')
    }
    if (CesiumDefined(options.times) && !CesiumDefined(options.clock)) {
      throw new DeveloperError('options.times was specified, so options.clock is required.')
    }
    //>>includeEnd('debug');

    this._defaultAlpha = undefined
    this._defaultNightAlpha = undefined
    this._defaultDayAlpha = undefined
    this._defaultBrightness = undefined
    this._defaultContrast = undefined
    this._defaultHue = undefined
    this._defaultSaturation = undefined
    this._defaultGamma = undefined
    this._defaultMinificationFilter = undefined
    this._defaultMagnificationFilter = undefined

    function createIfNeeded(resource) {
      if (resource instanceof Resource) {
        return resource.getDerivedResource({
          request: resource.request
        })
      }

      if (typeof resource !== 'string') {
        return resource
      }

      return new Resource({
        url: resource
      })
    }
    const resource = createIfNeeded(options.url) //使用createIfNeeded会生成一个ImageResource，具体返回什么由参数类型决定

    const style = options.style
    const tileMatrixSetID = options.tileMatrixSetID
    const url = resource.url

    const defaultParameters = Object.freeze({
      service: 'WMTS',
      version: '1.0.0',
      request: 'GetTile'
    })
    const bracketMatch = url.match(/{/g)
    if (!CesiumDefined(bracketMatch) || (bracketMatch.length === 1 && /{s}/.test(url))) {
      resource.setQueryParameters(defaultParameters) //组合指定的对象和现有的查询参数。这允许您一次添加多个参数，而不是一次添加一个参数到queryParameters属性。如果已经设置了某个值，则将用新值替换该值。
      this._useKvp = true
    } else {
      const templateValues = {
        style: style,
        Style: style,
        TileMatrixSet: tileMatrixSetID
      }

      resource.setTemplateValues(templateValues)
      this._useKvp = false
    }

    this._resource = resource
    this._layer = options.layer
    this._style = style
    this._tileMatrixSetID = tileMatrixSetID
    this._tileMatrixLabels = options.tileMatrixLabels
    this._format = defaultValue(options.format, 'image/jpeg')
    this._tileDiscardPolicy = options.tileDiscardPolicy

    //Cesium API原本逻辑
    // this._tilingScheme = CesiumDefined(options.tilingScheme) ? options.tilingScheme : new WebMercatorTilingScheme({ ellipsoid: options.ellipsoid })
    this._tileWidth = defaultValue(options.tileWidth, 256)
    this._tileHeight = defaultValue(options.tileHeight, 256)

    this._minimumLevel = defaultValue(options.minimumLevel, 0)
    this._maximumLevel = options.maximumLevel

    //Cesium API原本逻辑
    // this._rectangle = defaultValue(options.rectangle, this._tilingScheme.rectangle)
    this._dimensions = options.dimensions

    //#region 扩展逻辑
    this._projection = new ProjectionGS3D(options.projection) || new WebMercatorProjection(Ellipsoid.WGS84)
    this._extent = options.extent //四至矩形范围，数组
    this._origin = options.origin //原点坐标，数组
    if (options.scales) {
      this._resolutions = options.scales.map(
        (item, index) => item * 0.00028
        // return item * 0.02540005080010160020 * 10000 / 96.0 / ((CesiumMath.PI * 2 * 6378137) / 360)
      )
    } else if (options.resolutions) {
      this._resolutions = options.resolutions //分辨率，数组
    }
    let lods = this._resolutions.map((item, index) => {
      return {
        level: index,
        resolution: item
      }
    })
    // 对extent做大小限制，不然在转换过程中会出现异常
    // 此处如果考虑到加入代号的坐标，则会异常，暂时注释调试
    // let min = -2.0037508342787E7;
    // let max = 2.0037508342787E7;
    // this._extent[0] = Cesium.Math.clamp(this._extent[0], min, max);
    // this._extent[1] = Cesium.Math.clamp(this._extent[1], min, max);
    // this._extent[2] = Cesium.Math.clamp(this._extent[2], min, max);
    // this._extent[3] = Cesium.Math.clamp(this._extent[3], min, max);
    let sw = this._projection.unproject(new Cartesian3(this._extent[0], this._extent[1], 0.0))
    let ne = this._projection.unproject(new Cartesian3(this._extent[2], this._extent[3], 0.0))
    this._rectangle = new Rectangle(sw.longitude, sw.latitude, ne.longitude, ne.latitude)
    this._tileInfo = {
      cols: 256,
      rows: 256,
      origin: {
        x: this._origin[0],
        y: this._origin[1]
      },
      lods: lods,
      extendWidth: this._extent[2] - this._extent[0],
      extendHeight: this._extent[3] - this._extent[1]
    }
    //   核心基于上述参数，构建CGCS2000的切片方案CGCS2000TilingScheme

    this._tilingScheme = CesiumDefined(options.tilingScheme)
      ? options.tilingScheme
      : new CGCS2000TilingScheme({
          ellipsoid: CGCS2000Ellipsoid,
          projection: this._projection,
          rectangle: this._rectangle,
          tileInfo: this._tileInfo
        })
    // this._rectangle = defaultValue(
    //     options.rectangle,
    //     this._tilingScheme.rectangle
    // );
    //#endregion

    const that = this
    this._reload = undefined
    if (CesiumDefined(options.times)) {
      this._timeDynamicImagery = new TimeDynamicImagery({
        clock: options.clock,
        times: options.times,
        requestImageFunction: (x, y, level, request, interval) => that._requestImage(that, x, y, level, request, interval),
        reloadFunction: () => {
          if (CesiumDefined(that._reload)) {
            that._reload()
          }
        }
      })
    }

    // Check the number of tiles at the minimum level.  If it's more than four,
    // throw an exception, because starting at the higher minimum
    // level will cause too many tiles to be downloaded and rendered.
    const swTile = this._tilingScheme.positionToTileXY(Rectangle.southwest(this._rectangle), this._minimumLevel)
    const neTile = this._tilingScheme.positionToTileXY(Rectangle.northeast(this._rectangle), this._minimumLevel)
    const tileCount = (Math.abs(neTile.x - swTile.x) + 1) * (Math.abs(neTile.y - swTile.y) + 1)
    //>>includeStart('debug', pragmas.debug);
    if (tileCount > 4) {
      throw new DeveloperError(
        `The imagery provider's rectangle and minimumLevel indicate that there are ${tileCount} tiles at the minimum level. Imagery providers with more than four tiles at the minimum level are not supported.`
      )
    }
    //>>includeEnd('debug');

    this._errorEvent = new Event()

    const credit = options.credit
    this._credit = typeof credit === 'string' ? new Credit(credit) : credit

    this._subdomains = options.subdomains
    if (Array.isArray(this._subdomains)) {
      this._subdomains = this._subdomains.slice()
    } else if (CesiumDefined(this._subdomains) && this._subdomains.length > 0) {
      this._subdomains = this._subdomains.split('')
    } else {
      this._subdomains = ['a', 'b', 'c']
    }

    this.defaultAlpha = this._defaultAlpha
    this.defaultNightAlpha = this._defaultNightAlpha
    this.defaultDayAlpha = this._defaultDayAlpha
    this.defaultBrightness = this._defaultBrightness
    this.defaultContrast = this._defaultContrast
    this.defaultHue = this._defaultHue
    this.defaultSaturation = this._defaultSaturation
    this.defaultGamma = this._defaultGamma
    this.defaultMinificationFilter = this._defaultMinificationFilter
    this.defaultMagnificationFilter = this._defaultMagnificationFilter
    this.useKvp = this._useKvp
    this.resource = this._resource
    this.layer = this._layer
    this.style = this._style
    this.tileMatrixSetID = this._tileMatrixSetID
    this.tileMatrixLabels = this._tileMatrixLabels
    this.format = this._format
    this.tileDiscardPolicy = this._tileDiscardPolicy
    this.tilingScheme = this._tilingScheme
    this.tileWidth = this._tileWidth
    this.tileHeight = this._tileHeight
    this.minimumLevel = this._minimumLevel
    this.maximumLevel = this._maximumLevel
    this.rectangle = this._rectangle
    this.dimensions = this._dimensions
    this.reload = this._reload
    this.timeDynamicImagery = this._timeDynamicImagery
    this.errorEvent = this._errorEvent
    this.credit = this._credit
    this.subdomains = this._subdomains

    this.url = this._resource.url
    this.proxy = this._resource.proxy
    this.hasAlphaChannel = true
    this.clock = this._timeDynamicImagery?.clock
    this.times = this._timeDynamicImagery?.times

    //扩展逻辑新增属性
    this.projection = this._projection
    this.extent = this._extent
    this.origin = this._origin
    this.resolutions = this._resolutions
    this.tileInfo = this._tileInfo
  }

  get dimensions() {
    return this._dimensions
  }

  set dimensions(value) {
    if (this._dimensions !== value) {
      this._dimensions = value
      if (CesiumDefined(this._reload)) {
        this._reload()
      }
    }
  }

  /**
   * Gets the credits to be displayed when a given tile is displayed.
   *
   * @param {number} x The tile X coordinate.
   * @param {number} y The tile Y coordinate.
   * @param {number} level The tile level;
   * @returns {Credit[]} The credits to be displayed when the tile is displayed.
   */
  getTileCredits(x, y, level) {
    return undefined
  }

  /**
   * Requests the image for a given tile.
   *
   * @param {number} x The tile X coordinate.
   * @param {number} y The tile Y coordinate.
   * @param {number} level The tile level.
   * @param {Request} [request] The request object. Intended for internal use only.
   * @returns {Promise<ImageryTypes>|undefined} A promise for the image that will resolve when the image is available, or
   *          undefined if there are too many active requests to the server, and the request should be retried later.
   */
  requestImage(x, y, level, request) {
    let result
    const timeDynamicImagery = this._timeDynamicImagery
    let currentInterval

    // Try and load from cache
    if (CesiumDefined(timeDynamicImagery)) {
      currentInterval = timeDynamicImagery.currentInterval
      result = timeDynamicImagery.getFromCache(x, y, level, request)
    }

    // Couldn't load from cache
    if (!CesiumDefined(result)) {
      result = this._requestImage(this, x, y, level, request, currentInterval)
    }

    // If we are approaching an interval, preload this tile in the next interval
    if (CesiumDefined(result) && CesiumDefined(timeDynamicImagery)) {
      timeDynamicImagery.checkApproachingInterval(x, y, level, request)
    }

    return result
  }

  /**
   * Picking features is not currently supported by this imagery provider, so this function simply returns
   * undefined.
   *
   * @param {number} x The tile X coordinate.
   * @param {number} y The tile Y coordinate.
   * @param {number} level The tile level.
   * @param {number} longitude The longitude at which to pick features.
   * @param {number} latitude  The latitude at which to pick features.
   * @return {undefined} Undefined since picking is not supported.
   */
  pickFeatures(x, y, level, longitude, latitude) {
    return undefined
  }

  private _requestImage(imageryProvider, col, row, level, request, interval) {
    const labels = imageryProvider._tileMatrixLabels
    const tileMatrix = CesiumDefined(labels) ? labels[level] : level.toString()
    const subdomains = imageryProvider._subdomains
    const staticDimensions = imageryProvider._dimensions
    const dynamicIntervalData = CesiumDefined(interval) ? interval.data : undefined

    let resource
    let templateValues
    if (!imageryProvider._useKvp) {
      templateValues = {
        TileMatrix: tileMatrix,
        TileRow: row.toString(),
        TileCol: col.toString(),
        s: subdomains[(col + row + level) % subdomains.length]
      }

      resource = imageryProvider._resource.getDerivedResource({
        request: request
      })
      resource.setTemplateValues(templateValues)

      if (CesiumDefined(staticDimensions)) {
        resource.setTemplateValues(staticDimensions)
      }

      if (CesiumDefined(dynamicIntervalData)) {
        resource.setTemplateValues(dynamicIntervalData)
      }
    } else {
      // build KVP request
      let query: { [key: string]: any } = {}
      query.tilematrix = tileMatrix
      query.layer = imageryProvider._layer
      query.style = imageryProvider._style
      query.tilerow = row
      query.tilecol = col
      query.tilematrixset = imageryProvider._tileMatrixSetID
      query.format = imageryProvider._format

      if (CesiumDefined(staticDimensions)) {
        query = combine(query, staticDimensions)
      }

      if (CesiumDefined(dynamicIntervalData)) {
        query = combine(query, dynamicIntervalData)
      }

      templateValues = {
        s: subdomains[(col + row + level) % subdomains.length]
      }

      resource = imageryProvider._resource.getDerivedResource({
        queryParameters: query,
        request: request
      })
      resource.setTemplateValues(templateValues)
    }

    return ImageryProvider.loadImage(imageryProvider, resource)
  }
}
