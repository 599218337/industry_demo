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
  WebMercatorTilingScheme
} from 'cesium'
import { ProjectionGS3D } from './ProjectionGS3D'
import { CGCS2000TilingScheme, WebMercatorTilingSchemeExt, CGCS4490TilingScheme, CGCS2000Ellipsoid } from './TilingSchemeExt'

function ImageryProviderBuilder(options) {
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

/**
 * Complete ArcGisMapServerImageryProvider creation based on builder values.
 *
 * @private
 *
 * @param {ArcGisMapServerImageryProvider} provider
 */
ImageryProviderBuilder.prototype.build = function (provider) {
  provider._useTiles = this.useTiles
  provider._tilingScheme = this.tilingScheme
  provider._rectangle = this.rectangle
  provider._credit = this.credit
  provider._tileCredits = this.tileCredits
  provider._tileDiscardPolicy = this.tileDiscardPolicy
  provider._tileWidth = this.tileWidth
  provider._tileHeight = this.tileHeight
  provider._maximumLevel = this.maximumLevel

  // Install the default tile discard policy if none has been supplied.
  if (this.useTiles && !CesiumDefined(this.tileDiscardPolicy)) {
    provider._tileDiscardPolicy = new DiscardMissingTileImagePolicy({
      missingImageUrl: buildImageResource(provider, 0, 0, this.maximumLevel).url,
      pixelsToCheck: [new Cartesian2(0, 0), new Cartesian2(200, 20), new Cartesian2(20, 200), new Cartesian2(80, 110), new Cartesian2(160, 130)],
      disableCheckIfAllPixelsAreTransparent: true
    })
  }
}
// √
function metadataSuccess(data, imageryProviderBuilder) {
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
      imageryProviderBuilder.tilingScheme = new WebMercatorTilingSchemeExt({
        ellipsoid: imageryProviderBuilder.ellipsoid,
        tileInfo: tileInfo,
        rectangle: imageryProviderBuilder._rectangle
      })
    } else if (data.tileInfo.spatialReference.wkid === 4326) {
      imageryProviderBuilder.tilingScheme = new GeographicTilingScheme({
        ellipsoid: imageryProviderBuilder.ellipsoid
      })
    } else if (data.tileInfo.spatialReference.wkid === 4490) {
      imageryProviderBuilder._tilingScheme = new CGCS4490TilingScheme({
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
      imageryProviderBuilder._tilingScheme = new CGCS2000TilingScheme({
        ellipsoid: CGCS2000Ellipsoid,
        projection: projection,
        rectangle: imageryProviderBuilder._rectangle,
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
          imageryProviderBuilder._rectangle = new Rectangle(sw.longitude, sw.latitude, ne.longitude, ne.latitude)
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
        imageryProviderBuilder._rectangle = new Rectangle(sw.longitude, sw.latitude, ne.longitude, ne.latitude)
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
// √
function metadataFailure(resource, error) {
  let message = `An error occurred while accessing ${resource.url}`
  if (CesiumDefined(error) && CesiumDefined(error.message)) {
    message += `: ${error.message}`
  }

  throw new RuntimeError(message)
}
// √
async function requestMetadata(resource, imageryProviderBuilder) {
  const jsonResource = resource.getDerivedResource({
    queryParameters: {
      f: 'json'
    }
  })

  try {
    const data = await jsonResource.fetchJson()
    metadataSuccess(data, imageryProviderBuilder)
  } catch (error) {
    metadataFailure(resource, error)
  }
}

export function ArcGisMapServerImageryProviderExt(options) {
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

  let credit = options.credit
  if (typeof credit === 'string') {
    credit = new Credit(credit)
  }

  this.enablePickFeatures = defaultValue(options.enablePickFeatures, true)

  this._errorEvent = new CesiumEvent()
}

ArcGisMapServerImageryProviderExt.fromBasemapType = async function (style, options) {
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

  return ArcGisMapServerImageryProviderExt.fromUrl(server, {
    ...options,
    token: accessToken,
    credit: warningCredit,
    usePreCachedTilesIfAvailable: true // ArcGIS Base Map Service Layers only support Tiled views
  })
}
// √
function buildImageResource(imageryProvider, x, y, level, request?: any) {
  let resource
  if (imageryProvider._useTiles) {
    resource = imageryProvider._resource.getDerivedResource({
      url: `tile/${level}/${y}/${x}`,
      request: request
    })
  } else {
    const nativeRectangle = imageryProvider._tilingScheme.tileXYToNativeRectangle(x, y, level)
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
      size: `${imageryProvider._tileWidth},${imageryProvider._tileHeight}`,
      format: 'png32',
      transparent: true,
      f: 'image'
    }

    if (imageryProvider._tilingScheme.projection instanceof GeographicProjection) {
      query.bboxSR = 4326
      query.imageSR = 4326
    } else {
      query.bboxSR = 3857
      query.imageSR = 3857
    }
    if (imageryProvider.layers) {
      query.layers = `show:${imageryProvider.layers}`
    }

    resource = imageryProvider._resource.getDerivedResource({
      url: 'export',
      request: request,
      queryParameters: query
    })
  }
  return resource
}

Object.defineProperties(ArcGisMapServerImageryProviderExt.prototype, {
  url: {
    get: function () {
      return this._resource._url
    }
  },

  token: {
    get: function () {
      return this._resource.queryParameters.token
    }
  },

  proxy: {
    get: function () {
      return this._resource.proxy
    }
  },

  tileWidth: {
    get: function () {
      return this._tileWidth
    }
  },

  tileHeight: {
    get: function () {
      return this._tileHeight
    }
  },

  maximumLevel: {
    get: function () {
      return this._maximumLevel
    }
  },

  minimumLevel: {
    get: function () {
      return 0
    }
  },

  tilingScheme: {
    get: function () {
      return this._tilingScheme
    }
  },

  rectangle: {
    get: function () {
      return this._rectangle
    }
  },

  tileDiscardPolicy: {
    get: function () {
      return this._tileDiscardPolicy
    }
  },

  errorEvent: {
    get: function () {
      return this._errorEvent
    }
  },

  credit: {
    get: function () {
      return this._credit
    }
  },

  usingPrecachedTiles: {
    get: function () {
      return this._useTiles
    }
  },

  hasAlphaChannel: {
    get: function () {
      return true
    }
  },

  layers: {
    get: function () {
      return this._layers
    }
  }
})

ArcGisMapServerImageryProviderExt.fromUrl = async function (url, options) {
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

  const provider = new ArcGisMapServerImageryProviderExt(options)
  provider._resource = resource
  const imageryProviderBuilder = new ImageryProviderBuilder(options)
  const useTiles = defaultValue(options.usePreCachedTilesIfAvailable, true)
  if (useTiles) {
    await requestMetadata(resource, imageryProviderBuilder)
  }

  imageryProviderBuilder.build(provider)
  return provider
}
// √
ArcGisMapServerImageryProviderExt.prototype.getTileCredits = function (x, y, level) {
  return this._tileCredits
}
// √
ArcGisMapServerImageryProviderExt.prototype.requestImage = function (x, y, level, request) {
  return ImageryProvider.loadImage(this, buildImageResource(this, x, y, level, request))
}
// √
ArcGisMapServerImageryProviderExt.prototype.pickFeatures = function (x, y, level, longitude, latitude) {
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
ArcGisMapServerImageryProviderExt._metadataCache = {}
