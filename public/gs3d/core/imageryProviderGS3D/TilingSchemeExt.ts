import { Ellipsoid, defaultValue, defined, Rectangle, Cartesian2, Cartesian3, WebMercatorTilingScheme, WebMercatorProjection, GeographicTilingScheme, Math as CesiumMath } from 'cesium'
/**
 * CGCS2000椭球体
 */
export const CGCS2000Ellipsoid = new Ellipsoid(6378137.0, 6378137.0, 6356752.31414)

export class CGCS2000TilingScheme extends WebMercatorTilingScheme {
  options: any
  _projection: any
  _rectangle: any
  _tileInfo: any
  _numberOfLevelZeroTilesX: any
  constructor(options) {
    super(options)
    this.options = options || {}
    this.init()
  }
  init() {
    this._projection = this.options.projection //创建新的投影对象
    this._rectangle = this.options.rectangle //重置新的边界矩阵
    this._tileInfo = this.options.tileInfo //设置切片信息
  }

  getNumberOfXTilesAtLevel(level) {
    var XNum = 1
    if (!defined(this._tileInfo)) {
      XNum = this._numberOfLevelZeroTilesX << level
    } else {
      var currentMatrix = this._tileInfo.lods.filter(function (item) {
        return item.level === level
      })
      var currentResolution = currentMatrix[0].resolution
      XNum = Math.round(this._tileInfo.extendWidth / (this._tileInfo.cols * currentResolution))
    }

    // console.log(XNum);
    return XNum == 0 ? 1 : XNum
    // return this._numberOfLevelZeroTilesX << level;
  }

  // rectangleToNativeRectangle(rectangle, result) {
  //     var projection = this._projection;
  //     var southwest = projection.project(Rectangle.southwest(rectangle));
  //     var northeast = projection.project(Rectangle.northeast(rectangle));

  //     if (!defined(result)) {
  //         return new Rectangle(southwest.x, southwest.y, northeast.x, northeast.y);
  //     }

  //     result.west = southwest.x;
  //     result.south = southwest.y;
  //     result.east = northeast.x;
  //     result.north = northeast.y;
  //     return result;
  // }
  tileXYToNativeRectangle(x, y, level, result) {
    var west,
      east,
      north,
      south = 0
    var currentMatrix = this._tileInfo.lods.filter(function (item) {
      return item.level === level
    })
    var currentResolution = currentMatrix[0].resolution
    north = this._tileInfo.origin.y - y * (this._tileInfo.cols * currentResolution)
    west = this._tileInfo.origin.x + x * (this._tileInfo.cols * currentResolution)
    south = this._tileInfo.origin.y - (y + 1) * (this._tileInfo.cols * currentResolution)
    east = this._tileInfo.origin.x + (x + 1) * (this._tileInfo.cols * currentResolution)
    if (!defined(result)) {
      return new Rectangle(west, south, east, north)
    }
    result.west = west
    result.south = south
    result.east = east
    result.north = north
    return result
  }

  // tileXYToRectangle(
  //     x,
  //     y,
  //     level,
  //     result
  // ) {
  //     var nativeRectangle = this.tileXYToNativeRectangle(x, y, level, result);

  //     var projection = this._projection;
  //     var southwest = projection.unproject(
  //         new Cartesian2(nativeRectangle.west, nativeRectangle.south)
  //     );
  //     var northeast = projection.unproject(
  //         new Cartesian2(nativeRectangle.east, nativeRectangle.north)
  //     );

  //     nativeRectangle.west = southwest.longitude;
  //     nativeRectangle.south = southwest.latitude;
  //     nativeRectangle.east = northeast.longitude;
  //     nativeRectangle.north = northeast.latitude;
  //     return nativeRectangle;
  // }

  positionToTileXY = function (position, level, result) {
    var rectangle = this._rectangle
    if (!Rectangle.contains(rectangle, position)) {
      // outside the bounds of the tiling scheme
      return undefined
    }
    if (!this._tileInfo) {
      return undefined
    }

    // console.log("start positionToTileXY");

    var currentMatrix = this._tileInfo.lods.filter(function (item) {
      return item.level === level
    })
    var currentResolution = currentMatrix[0].resolution
    var projection = this._projection
    var webMercatorPosition = projection.project(position)

    // console.log(position);

    var xTileCoordinate = Math.floor((webMercatorPosition.x - this._tileInfo.origin.x) / (this._tileInfo.cols * currentResolution))
    var yTileCoordinate = Math.floor((this._tileInfo.origin.y - webMercatorPosition.y) / (this._tileInfo.cols * currentResolution))
    if (xTileCoordinate < 0) {
      xTileCoordinate = 0
    }
    if (yTileCoordinate < 0) {
      yTileCoordinate = 0
    }
    console.log(level, xTileCoordinate, yTileCoordinate)
    if (!defined(result)) {
      return new Cartesian2(xTileCoordinate, yTileCoordinate)
    }
    result.x = xTileCoordinate
    result.y = yTileCoordinate
    return result
  }
}

export class CGCS4490TilingScheme extends GeographicTilingScheme {
  options: any
  _tileInfo: any
  _numberOfLevelZeroTilesX: any
  _numberOfLevelZeroTilesY: any
  _rectangle: any
  constructor(options) {
    super(options)
    this.options = options || {}
    this.init()
  }
  init() {
    // this._projection = this.options.projection; //创建新的投影对象
    // this._rectangle = this.options.rectangle; //重置新的边界矩阵
    this._tileInfo = this.options.tileInfo //设置切片信息
  }

  getNumberOfXTilesAtLevel(level) {
    var XNum = 1
    if (!defined(this._tileInfo)) {
      XNum = this._numberOfLevelZeroTilesX << level
    } else {
      var currentMatrix = this._tileInfo.lods.filter(function (item) {
        return item.level === level
      })
      var currentResolution = currentMatrix[0].resolution
      XNum = Math.round(this._tileInfo.extendWidth / (this._tileInfo.cols * currentResolution))
    }
    // return XNum
    // console.log("XNum",level+"level",XNum);
    return XNum == 0 ? 2 : XNum
  }
  getNumberOfYTilesAtLevel(level) {
    var YNum = 1
    if (!defined(this._tileInfo)) {
      YNum = this._numberOfLevelZeroTilesY << level
    } else {
      var currentMatrix = this._tileInfo.lods.filter(function (item) {
        return item.level === level
      })
      var currentResolution = currentMatrix[0].resolution
      YNum = Math.round(this._tileInfo.extendHeight / (this._tileInfo.rows * currentResolution))
    }
    // console.log("YNum",level,YNum);
    return YNum == 0 ? 1 : YNum
  }
  tileXYToRectangle(x, y, level, result) {
    // var west, east, north, south = 0;
    var currentMatrix = this._tileInfo.lods.filter(function (item) {
      return item.level === level
    })
    var currentResolution = currentMatrix[0].resolution
    var north = this._tileInfo.origin.y - y * (this._tileInfo.rows * currentResolution)
    var west = this._tileInfo.origin.x + x * (this._tileInfo.cols * currentResolution)
    var south = this._tileInfo.origin.y - (y + 1) * (this._tileInfo.rows * currentResolution)
    var east = this._tileInfo.origin.x + (x + 1) * (this._tileInfo.cols * currentResolution)

    // 经纬度转弧度值
    north = CesiumMath.toRadians(north)
    west = CesiumMath.toRadians(west)
    east = CesiumMath.toRadians(east)
    south = CesiumMath.toRadians(south)
    if (!defined(result)) {
      result = new Rectangle(west, south, east, north)
    }
    result.west = west
    result.south = south
    result.east = east
    result.north = north
    return result
  }
  positionToTileXY(position, level, result) {
    var rectangle = this._rectangle
    if (!Rectangle.contains(rectangle, position)) {
      // outside the bounds of the tiling scheme
      return undefined
    }

    // var xTiles = this.getNumberOfXTilesAtLevel(level);
    // var yTiles = this.getNumberOfYTilesAtLevel(level);

    var currentMatrix = this._tileInfo.lods.filter(function (item) {
      return item.level === level
    })
    var currentResolution = currentMatrix[0].resolution

    // 弧度转°
    var latitude = CesiumMath.toDegrees(position.latitude)
    var longitude = CesiumMath.toDegrees(position.longitude)
    var xTileCoordinate = Math.floor((longitude - this._tileInfo.origin.x) / (this._tileInfo.cols * currentResolution))
    var yTileCoordinate = Math.floor((this._tileInfo.origin.y - latitude) / (this._tileInfo.rows * currentResolution))

    // if (xTileCoordinate > xTiles) {
    //     xTileCoordinate = xTiles - 1;
    // }

    // if (yTileCoordinate > yTiles) {
    //     yTileCoordinate = yTiles - 1;
    // }

    console.log('positionToTileXY', level, xTileCoordinate, yTileCoordinate)
    if (!defined(result)) {
      return new Cartesian2(xTileCoordinate, yTileCoordinate)
    }
    result.x = xTileCoordinate
    result.y = yTileCoordinate
    return result
  }
}

/**
 * A tiling scheme for geometry referenced to a {@link WebMercatorProjection}, EPSG:3857.  This is
 * the tiling scheme used by Google Maps, Microsoft Bing Maps, and most of ESRI ArcGIS Online.
 *
 * @alias WebMercatorTilingSchemeExt
 * @constructor
 *
 * @param {Object} [options] Object with the following properties:
 * @param {Ellipsoid} [options.ellipsoid=Ellipsoid.WGS84] The ellipsoid whose surface is being tiled. Defaults to
 * the WGS84 ellipsoid.
 * @param {Number} [options.numberOfLevelZeroTilesX=1] The number of tiles in the X direction at level zero of
 *        the tile tree.
 * @param {Number} [options.numberOfLevelZeroTilesY=1] The number of tiles in the Y direction at level zero of
 *        the tile tree.
 * @param {Cartesian2} [options.rectangleSouthwestInMeters] The southwest corner of the rectangle covered by the
 *        tiling scheme, in meters.  If this parameter or rectangleNortheastInMeters is not specified, the entire
 *        globe is covered in the longitude direction and an equal distance is covered in the latitude
 *        direction, resulting in a square projection.
 * @param {Cartesian2} [options.rectangleNortheastInMeters] The northeast corner of the rectangle covered by the
 *        tiling scheme, in meters.  If this parameter or rectangleSouthwestInMeters is not specified, the entire
 *        globe is covered in the longitude direction and an equal distance is covered in the latitude
 *        direction, resulting in a square projection.
 */
export function WebMercatorTilingSchemeExt(options) {
  options = defaultValue(options, Object.freeze({}))
  this._ellipsoid = defaultValue(options.ellipsoid, Ellipsoid.WGS84)
  this._numberOfLevelZeroTilesX = defaultValue(options.numberOfLevelZeroTilesX, 1)
  this._numberOfLevelZeroTilesY = defaultValue(options.numberOfLevelZeroTilesY, 1)
  this._tileInfo = options.tileInfo
  this._projection = new WebMercatorProjection(this._ellipsoid)
  if (defined(options.rectangleSouthwestInMeters) && defined(options.rectangleNortheastInMeters)) {
    this._rectangleSouthwestInMeters = options.rectangleSouthwestInMeters
    this._rectangleNortheastInMeters = options.rectangleNortheastInMeters
  } else {
    var semimajorAxisTimesPi = this._ellipsoid.maximumRadius * Math.PI
    this._rectangleSouthwestInMeters = new Cartesian2(-semimajorAxisTimesPi, -semimajorAxisTimesPi)
    this._rectangleNortheastInMeters = new Cartesian2(semimajorAxisTimesPi, semimajorAxisTimesPi)
  }
  var southwest = this._projection.unproject(this._rectangleSouthwestInMeters)
  var northeast = this._projection.unproject(this._rectangleNortheastInMeters)
  // var southwest = this._projection.unproject(
  //     new Cartesian3(
  //         16000.177495168415, -45362.90342481643,
  //         0.0
  //     )
  // );
  // var northeast = this._projection.unproject(
  //     new Cartesian3(
  //         50925.24734530811, -23137.858974727525,
  //         0.0
  //     )
  // );
  this._rectangle = defaultValue(options.rectangle, new Rectangle(southwest.longitude, southwest.latitude, northeast.longitude, northeast.latitude))
  // this._rectangle = new Rectangle(
  //     southwest.longitude,
  //     southwest.latitude,
  //     northeast.longitude,
  //     northeast.latitude
  // );
}

Object.defineProperties(WebMercatorTilingSchemeExt.prototype, {
  /**
   * Gets the ellipsoid that is tiled by this tiling scheme.
   * @memberof WebMercatorTilingSchemeExt.prototype
   * @type {Ellipsoid}
   */
  ellipsoid: {
    get: function () {
      return this._ellipsoid
    }
  },
  /**
   * Gets the rectangle, in radians, covered by this tiling scheme.
   * @memberof WebMercatorTilingSchemeExt.prototype
   * @type {Rectangle}
   */
  rectangle: {
    get: function () {
      return this._rectangle
    }
  },
  /**
   * Gets the map projection used by this tiling scheme.
   * @memberof WebMercatorTilingSchemeExt.prototype
   * @type {MapProjection}
   */
  projection: {
    get: function () {
      return this._projection
    }
  }
})

/**
 * Gets the total number of tiles in the X direction at a specified level-of-detail.
 *
 * @param {Number} level The level-of-detail.
 * @returns {Number} The number of tiles in the X direction at the given level.
 */
WebMercatorTilingSchemeExt.prototype.getNumberOfXTilesAtLevel = function (level) {
  var XNum = 1
  if (!defined(this._tileInfo)) {
    XNum = this._numberOfLevelZeroTilesX << level
  } else {
    var currentMatrix = this._tileInfo.lods.filter(function (item) {
      return item.level === level
    })
    var currentResolution = currentMatrix[0].resolution
    XNum = Math.round(this._tileInfo.extendWidth / (this._tileInfo.cols * currentResolution))
  }

  // console.log(XNum);
  return XNum == 0 ? 1 : XNum
}

/**
 * Gets the total number of tiles in the Y direction at a specified level-of-detail.
 *
 * @param {Number} level The level-of-detail.
 * @returns {Number} The number of tiles in the Y direction at the given level.
 */
WebMercatorTilingSchemeExt.prototype.getNumberOfYTilesAtLevel = function (level) {
  var YNum = 1
  if (!defined(this._tileInfo)) {
    YNum = this._numberOfLevelZeroTilesX << level
  } else {
    var currentMatrix = this._tileInfo.lods.filter(function (item) {
      return item.level === level
    })
    var currentResolution = currentMatrix[0].resolution
    YNum = Math.round(this._tileInfo.extendHeight / (this._tileInfo.rows * currentResolution))
  }

  // console.log(XNum);
  return YNum == 0 ? 1 : YNum
}

/**
 * Transforms a rectangle specified in geodetic radians to the native coordinate system
 * of this tiling scheme.
 *
 * @param {Rectangle} rectangle The rectangle to transform.
 * @param {Rectangle} [result] The instance to which to copy the result, or undefined if a new instance
 *        should be created.
 * @returns {Rectangle} The specified 'result', or a new object containing the native rectangle if 'result'
 *          is undefined.
 */
WebMercatorTilingSchemeExt.prototype.rectangleToNativeRectangle = function (rectangle, result) {
  var projection = this._projection
  var southwest = projection.project(Rectangle.southwest(rectangle))
  var northeast = projection.project(Rectangle.northeast(rectangle))
  if (!defined(result)) {
    return new Rectangle(southwest.x, southwest.y, northeast.x, northeast.y)
  }
  result.west = southwest.x
  result.south = southwest.y
  result.east = northeast.x
  result.north = northeast.y
  return result
}

/**
 * Converts tile x, y coordinates and level to a rectangle expressed in the native coordinates
 * of the tiling scheme.
 *
 * @param {Number} x The integer x coordinate of the tile.
 * @param {Number} y The integer y coordinate of the tile.
 * @param {Number} level The tile level-of-detail.  Zero is the least detailed.
 * @param {Object} [result] The instance to which to copy the result, or undefined if a new instance
 *        should be created.
 * @returns {Rectangle} The specified 'result', or a new object containing the rectangle
 *          if 'result' is undefined.
 */
WebMercatorTilingSchemeExt.prototype.tileXYToNativeRectangle = function (x, y, level, result) {
  // var xTiles = this.getNumberOfXTilesAtLevel(level);
  // var yTiles = this.getNumberOfYTilesAtLevel(level);

  // var xTileWidth =
  //     (this._rectangleNortheastInMeters.x - this._rectangleSouthwestInMeters.x) /
  //     xTiles;
  // var west = this._rectangleSouthwestInMeters.x + x * xTileWidth;
  // var east = this._rectangleSouthwestInMeters.x + (x + 1) * xTileWidth;

  // var yTileHeight =
  //     (this._rectangleNortheastInMeters.y - this._rectangleSouthwestInMeters.y) /
  //     yTiles;
  // var north = this._rectangleNortheastInMeters.y - y * yTileHeight;
  // var south = this._rectangleNortheastInMeters.y - (y + 1) * yTileHeight;

  var west,
    east,
    north,
    south = 0
  var currentMatrix = this._tileInfo.lods.filter(function (item) {
    return item.level === level
  })
  var currentResolution = currentMatrix[0].resolution
  north = this._tileInfo.origin.y - y * (this._tileInfo.cols * currentResolution)
  west = this._tileInfo.origin.x + x * (this._tileInfo.cols * currentResolution)
  south = this._tileInfo.origin.y - (y + 1) * (this._tileInfo.cols * currentResolution)
  east = this._tileInfo.origin.x + (x + 1) * (this._tileInfo.cols * currentResolution)
  if (!defined(result)) {
    return new Rectangle(west, south, east, north)
  }
  result.west = west
  result.south = south
  result.east = east
  result.north = north
  return result
}

/**
 * Converts tile x, y coordinates and level to a cartographic rectangle in radians.
 *
 * @param {Number} x The integer x coordinate of the tile.
 * @param {Number} y The integer y coordinate of the tile.
 * @param {Number} level The tile level-of-detail.  Zero is the least detailed.
 * @param {Object} [result] The instance to which to copy the result, or undefined if a new instance
 *        should be created.
 * @returns {Rectangle} The specified 'result', or a new object containing the rectangle
 *          if 'result' is undefined.
 */
WebMercatorTilingSchemeExt.prototype.tileXYToRectangle = function (x, y, level, result) {
  var nativeRectangle = this.tileXYToNativeRectangle(x, y, level, result)
  var projection = this._projection
  var southwest = projection.unproject(new Cartesian2(nativeRectangle.west, nativeRectangle.south))
  var northeast = projection.unproject(new Cartesian2(nativeRectangle.east, nativeRectangle.north))
  nativeRectangle.west = southwest.longitude
  nativeRectangle.south = southwest.latitude
  nativeRectangle.east = northeast.longitude
  nativeRectangle.north = northeast.latitude
  return nativeRectangle
}

/**
 * Calculates the tile x, y coordinates of the tile containing
 * a given cartographic position.
 *
 * @param {Cartographic} position The position.
 * @param {Number} level The tile level-of-detail.  Zero is the least detailed.
 * @param {Cartesian2} [result] The instance to which to copy the result, or undefined if a new instance
 *        should be created.
 * @returns {Cartesian2} The specified 'result', or a new object containing the tile x, y coordinates
 *          if 'result' is undefined.
 */
WebMercatorTilingSchemeExt.prototype.positionToTileXY = function (position, level, result) {
  // console.log('start positionToTileXY');
  var rectangle = this._rectangle
  if (!Rectangle.contains(rectangle, position)) {
    // outside the bounds of the tiling scheme
    return undefined
  }

  // var xTiles = this.getNumberOfXTilesAtLevel(level);
  // var yTiles = this.getNumberOfYTilesAtLevel(level);

  // var overallWidth =
  //     this._rectangleNortheastInMeters.x - this._rectangleSouthwestInMeters.x;
  // var xTileWidth = overallWidth / xTiles;
  // var overallHeight =
  //     this._rectangleNortheastInMeters.y - this._rectangleSouthwestInMeters.y;
  // var yTileHeight = overallHeight / yTiles;

  var currentMatrix = this._tileInfo.lods.filter(function (item) {
    return item.level === level
  })
  var currentResolution = currentMatrix[0].resolution
  var projection = this._projection
  var webMercatorPosition = projection.project(position)
  // var distanceFromWest =
  //     webMercatorPosition.x - this._rectangleSouthwestInMeters.x;
  // var distanceFromNorth =
  //     this._rectangleNortheastInMeters.y - webMercatorPosition.y;
  var xTileCoordinate = Math.floor((webMercatorPosition.x - this._tileInfo.origin.x) / (this._tileInfo.cols * currentResolution))
  var yTileCoordinate = Math.floor((this._tileInfo.origin.y - webMercatorPosition.y) / (this._tileInfo.cols * currentResolution))
  // var xTileCoordinate = (distanceFromWest / xTileWidth) | 0;
  // if (xTileCoordinate >= xTiles) {
  //     xTileCoordinate = xTiles - 1;
  // }
  // // var yTileCoordinate = (distanceFromNorth / yTileHeight) | 0;
  // if (yTileCoordinate >= yTiles) {
  //     yTileCoordinate = yTiles - 1;
  // }
  if (xTileCoordinate < 0) {
    xTileCoordinate = 0
  }
  if (yTileCoordinate < 0) {
    yTileCoordinate = 0
  }
  console.log(xTileCoordinate, yTileCoordinate)
  if (!defined(result)) {
    return new Cartesian2(xTileCoordinate, yTileCoordinate)
  }
  result.x = xTileCoordinate
  result.y = yTileCoordinate
  return result
}
