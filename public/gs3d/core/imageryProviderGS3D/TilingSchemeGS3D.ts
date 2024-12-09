import { Ellipsoid, defaultValue, defined as CesiumDefined, Rectangle, Cartesian2, WebMercatorTilingScheme, WebMercatorProjection, GeographicTilingScheme, Math as CesiumMath } from 'cesium'
/**
 * CGCS2000椭球体
 */
export const CGCS2000Ellipsoid = new Ellipsoid(6378137.0, 6378137.0, 6356752.31414)

export namespace CGCS2000TilingScheme {
  export type ConstructorOptions = {
    tileInfo?: { [key: string]: any }
    rectangle?: Rectangle
    projection?: WebMercatorProjection
    ellipsoid?: Ellipsoid
    numberOfLevelZeroTilesX?: number
    numberOfLevelZeroTilesY?: number
    rectangleSouthwestInMeters?: Cartesian2
    rectangleNortheastInMeters?: Cartesian2
  }
}
export class CGCS2000TilingScheme extends WebMercatorTilingScheme {
  options: any
  _projection: any
  _rectangle: any
  _tileInfo: any
  _numberOfLevelZeroTilesX: any
  constructor(options: CGCS2000TilingScheme.ConstructorOptions = {}) {
    super(options)
    // this.options = options || {}
    this._projection = options.projection //创建新的投影对象
    this._rectangle = options.rectangle //重置新的边界矩阵
    this._tileInfo = options.tileInfo //设置切片信息
  }

  getNumberOfXTilesAtLevel(level) {
    let XNum = 1
    if (!CesiumDefined(this._tileInfo)) {
      XNum = this._numberOfLevelZeroTilesX << level
    } else {
      let currentMatrix = this._tileInfo.lods.filter(item => item.level === level)
      let currentResolution = currentMatrix[0].resolution
      XNum = Math.round(this._tileInfo.extendWidth / (this._tileInfo.cols * currentResolution))
    }

    // console.log(XNum);
    return XNum == 0 ? 1 : XNum
    // return this._numberOfLevelZeroTilesX << level;
  }

  // rectangleToNativeRectangle(rectangle, result) {
  //     let projection = this._projection;
  //     let southwest = projection.project(Rectangle.southwest(rectangle));
  //     let northeast = projection.project(Rectangle.northeast(rectangle));

  //     if (!CesiumDefined(result)) {
  //         return new Rectangle(southwest.x, southwest.y, northeast.x, northeast.y);
  //     }

  //     result.west = southwest.x;
  //     result.south = southwest.y;
  //     result.east = northeast.x;
  //     result.north = northeast.y;
  //     return result;
  // }
  tileXYToNativeRectangle(x, y, level, result) {
    let west,
      east,
      north,
      south = 0
    let currentMatrix = this._tileInfo.lods.filter(item => item.level === level)
    let currentResolution = currentMatrix[0].resolution
    north = this._tileInfo.origin.y - y * (this._tileInfo.cols * currentResolution)
    west = this._tileInfo.origin.x + x * (this._tileInfo.cols * currentResolution)
    south = this._tileInfo.origin.y - (y + 1) * (this._tileInfo.cols * currentResolution)
    east = this._tileInfo.origin.x + (x + 1) * (this._tileInfo.cols * currentResolution)
    if (!CesiumDefined(result)) {
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
  //     let nativeRectangle = this.tileXYToNativeRectangle(x, y, level, result);

  //     let projection = this._projection;
  //     let southwest = projection.unproject(
  //         new Cartesian2(nativeRectangle.west, nativeRectangle.south)
  //     );
  //     let northeast = projection.unproject(
  //         new Cartesian2(nativeRectangle.east, nativeRectangle.north)
  //     );

  //     nativeRectangle.west = southwest.longitude;
  //     nativeRectangle.south = southwest.latitude;
  //     nativeRectangle.east = northeast.longitude;
  //     nativeRectangle.north = northeast.latitude;
  //     return nativeRectangle;
  // }

  positionToTileXY = function (position, level, result) {
    let rectangle = this._rectangle
    if (!Rectangle.contains(rectangle, position)) {
      // outside the bounds of the tiling scheme
      return undefined
    }
    if (!this._tileInfo) {
      return undefined
    }

    // console.log("start positionToTileXY");

    let currentMatrix = this._tileInfo.lods.filter(item => item.level === level)
    let currentResolution = currentMatrix[0].resolution
    let projection = this._projection
    let webMercatorPosition = projection.project(position)

    // console.log(position);

    let xTileCoordinate = Math.floor((webMercatorPosition.x - this._tileInfo.origin.x) / (this._tileInfo.cols * currentResolution))
    let yTileCoordinate = Math.floor((this._tileInfo.origin.y - webMercatorPosition.y) / (this._tileInfo.cols * currentResolution))
    if (xTileCoordinate < 0) {
      xTileCoordinate = 0
    }
    if (yTileCoordinate < 0) {
      yTileCoordinate = 0
    }
    console.log(level, xTileCoordinate, yTileCoordinate)
    if (!CesiumDefined(result)) {
      return new Cartesian2(xTileCoordinate, yTileCoordinate)
    }
    result.x = xTileCoordinate
    result.y = yTileCoordinate
    return result
  }
}

export namespace CGCS4490TilingScheme {
  export type ConstructorOptions = {
    tileInfo?: { [key: string]: any }
    ellipsoid?: Ellipsoid
    rectangle?: Rectangle
    numberOfLevelZeroTilesX?: number
    numberOfLevelZeroTilesY?: number
  }
}

export class CGCS4490TilingScheme extends GeographicTilingScheme {
  options: any
  _tileInfo: any
  _numberOfLevelZeroTilesX: any
  _numberOfLevelZeroTilesY: any
  _rectangle: any
  constructor(options: CGCS4490TilingScheme.ConstructorOptions = {}) {
    super(options)
    // this.options = options || {}
    // this._projection = options.projection; //创建新的投影对象
    // this._rectangle = options.rectangle; //重置新的边界矩阵
    this._tileInfo = options.tileInfo //设置切片信息
  }

  getNumberOfXTilesAtLevel(level) {
    let XNum = 1
    if (!CesiumDefined(this._tileInfo)) {
      XNum = this._numberOfLevelZeroTilesX << level
    } else {
      let currentMatrix = this._tileInfo.lods.filter(item => item.level === level)
      let currentResolution = currentMatrix[0].resolution
      XNum = Math.round(this._tileInfo.extendWidth / (this._tileInfo.cols * currentResolution))
    }
    // return XNum
    // console.log("XNum",level+"level",XNum);
    return XNum == 0 ? 2 : XNum
  }
  getNumberOfYTilesAtLevel(level) {
    let YNum = 1
    if (!CesiumDefined(this._tileInfo)) {
      YNum = this._numberOfLevelZeroTilesY << level
    } else {
      let currentMatrix = this._tileInfo.lods.filter(item => item.level === level)
      let currentResolution = currentMatrix[0].resolution
      YNum = Math.round(this._tileInfo.extendHeight / (this._tileInfo.rows * currentResolution))
    }
    // console.log("YNum",level,YNum);
    return YNum == 0 ? 1 : YNum
  }
  tileXYToRectangle(x, y, level, result) {
    // let west, east, north, south = 0;
    let currentMatrix = this._tileInfo.lods.filter(item => item.level === level)
    let currentResolution = currentMatrix[0].resolution
    let north = this._tileInfo.origin.y - y * (this._tileInfo.rows * currentResolution)
    let west = this._tileInfo.origin.x + x * (this._tileInfo.cols * currentResolution)
    let south = this._tileInfo.origin.y - (y + 1) * (this._tileInfo.rows * currentResolution)
    let east = this._tileInfo.origin.x + (x + 1) * (this._tileInfo.cols * currentResolution)

    // 经纬度转弧度值
    north = CesiumMath.toRadians(north)
    west = CesiumMath.toRadians(west)
    east = CesiumMath.toRadians(east)
    south = CesiumMath.toRadians(south)
    if (!CesiumDefined(result)) {
      result = new Rectangle(west, south, east, north)
    }
    result.west = west
    result.south = south
    result.east = east
    result.north = north
    return result
  }
  positionToTileXY(position, level, result) {
    let rectangle = this._rectangle
    if (!Rectangle.contains(rectangle, position)) {
      // outside the bounds of the tiling scheme
      return undefined
    }

    // let xTiles = this.getNumberOfXTilesAtLevel(level);
    // let yTiles = this.getNumberOfYTilesAtLevel(level);
    let currentMatrix = this._tileInfo.lods.filter(item => item.level === level)
    let currentResolution = currentMatrix[0].resolution

    // 弧度转°
    let latitude = CesiumMath.toDegrees(position.latitude)
    let longitude = CesiumMath.toDegrees(position.longitude)
    let xTileCoordinate = Math.floor((longitude - this._tileInfo.origin.x) / (this._tileInfo.cols * currentResolution))
    let yTileCoordinate = Math.floor((this._tileInfo.origin.y - latitude) / (this._tileInfo.rows * currentResolution))

    // if (xTileCoordinate > xTiles) {
    //     xTileCoordinate = xTiles - 1;
    // }

    // if (yTileCoordinate > yTiles) {
    //     yTileCoordinate = yTiles - 1;
    // }

    console.log('positionToTileXY', level, xTileCoordinate, yTileCoordinate)
    if (!CesiumDefined(result)) {
      return new Cartesian2(xTileCoordinate, yTileCoordinate)
    }
    result.x = xTileCoordinate
    result.y = yTileCoordinate
    return result
  }
}

/**
 * 参数说明
 */
export namespace WebMercatorTilingSchemeGS3D {
  export type ConstructorOptions = {
    /**
     * 获取该平铺方案覆盖的矩形（以弧度为单位）。
     */
    rectangle?: Rectangle
    /**
     * 平铺方案覆盖的矩形的东北角，以米为单位。 如果未指定此参数或 rectangleSouthwestInMeters，则在经度方向上覆盖整个地球，在纬度方向上覆盖相等的距离，从而产生方形投影。
     */
    rectangleNortheastInMeters?: Cartesian2
    /**
     * 平铺方案覆盖的矩形的西南角，以米为单位。 如果未指定此参数或 rectangleNortheastInMeters，则在经度方向上覆盖整个地球，在纬度方向上覆盖相等的距离，从而产生方形投影。
     */
    rectangleSouthwestInMeters?: Cartesian2
    /**
     * 切片信息
     */
    tileInfo?: { [key: string]: any }
    /**
     * 在图块树的零级处 Y 方向上的图块数。
     */
    numberOfLevelZeroTilesY?: number
    /**
     * 磁贴树第 0 层 X 方向上的磁贴数量。
     */
    numberOfLevelZeroTilesX?: number
    /**
     * 其表面被平铺的椭球体。默认为 WGS84 椭圆体。
     */
    ellipsoid?: Ellipsoid
  }
}

/**
 * 参考 {@link WebMercatorProjection} 的几何图形的切片方案，EPSG：3857。 这是 Google 地图、Microsoft Bing 地图和大多数 ESRI ArcGIS Online 使用的切片方案。
 *
 */
export class WebMercatorTilingSchemeGS3D {
  private _ellipsoid: any
  private _numberOfLevelZeroTilesX: any
  private _numberOfLevelZeroTilesY: any
  private _tileInfo: any
  private _projection: any
  private _rectangleSouthwestInMeters: any
  private _rectangleNortheastInMeters: any
  private _rectangle: any
  ellipsoid: any
  rectangle: any
  projection: any
  numberOfLevelZeroTilesX: any
  numberOfLevelZeroTilesY: any
  tileInfo: any
  rectangleSouthwestInMeters: any
  rectangleNortheastInMeters: any
  constructor(options: WebMercatorTilingSchemeGS3D.ConstructorOptions) {
    options = defaultValue(options, Object.freeze({}))
    this._ellipsoid = defaultValue(options.ellipsoid, Ellipsoid.WGS84)
    this._numberOfLevelZeroTilesX = defaultValue(options.numberOfLevelZeroTilesX, 1)
    this._numberOfLevelZeroTilesY = defaultValue(options.numberOfLevelZeroTilesY, 1)
    this._tileInfo = options.tileInfo
    this._projection = new WebMercatorProjection(this._ellipsoid)
    if (CesiumDefined(options.rectangleSouthwestInMeters) && CesiumDefined(options.rectangleNortheastInMeters)) {
      this._rectangleSouthwestInMeters = options.rectangleSouthwestInMeters
      this._rectangleNortheastInMeters = options.rectangleNortheastInMeters
    } else {
      let semimajorAxisTimesPi = this._ellipsoid.maximumRadius * Math.PI
      this._rectangleSouthwestInMeters = new Cartesian2(-semimajorAxisTimesPi, -semimajorAxisTimesPi)
      this._rectangleNortheastInMeters = new Cartesian2(semimajorAxisTimesPi, semimajorAxisTimesPi)
    }
    let southwest = this._projection.unproject(this._rectangleSouthwestInMeters)
    let northeast = this._projection.unproject(this._rectangleNortheastInMeters)
    // let southwest = this._projection.unproject(
    //     new Cartesian3(
    //         16000.177495168415, -45362.90342481643,
    //         0.0
    //     )
    // );
    // let northeast = this._projection.unproject(
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

    this.ellipsoid = this._ellipsoid
    this.rectangle = this._rectangle
    this.projection = this._projection
    this.numberOfLevelZeroTilesX = this._numberOfLevelZeroTilesX
    this.numberOfLevelZeroTilesY = this._numberOfLevelZeroTilesY
    this.tileInfo = this._tileInfo
    this.rectangleSouthwestInMeters = this._rectangleSouthwestInMeters
    this.rectangleNortheastInMeters = this._rectangleNortheastInMeters
  }

  /**
   * Gets the total number of tiles in the X direction at a specified level-of-detail.
   *
   * @param {Number} level The level-of-detail.
   * @returns {Number} The number of tiles in the X direction at the given level.
   */
  getNumberOfXTilesAtLevel(level) {
    let XNum = 1
    if (!CesiumDefined(this._tileInfo)) {
      XNum = this._numberOfLevelZeroTilesX << level
    } else {
      let currentMatrix = this._tileInfo.lods.filter(item => item.level === level)
      let currentResolution = currentMatrix[0].resolution
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
  getNumberOfYTilesAtLevel(level) {
    let YNum = 1
    if (!CesiumDefined(this._tileInfo)) {
      YNum = this._numberOfLevelZeroTilesX << level
    } else {
      let currentMatrix = this._tileInfo.lods.filter(item => item.level === level)
      let currentResolution = currentMatrix[0].resolution
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
  rectangleToNativeRectangle(rectangle, result) {
    let projection = this._projection
    let southwest = projection.project(Rectangle.southwest(rectangle))
    let northeast = projection.project(Rectangle.northeast(rectangle))
    if (!CesiumDefined(result)) {
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
  tileXYToNativeRectangle(x, y, level, result) {
    // let xTiles = this.getNumberOfXTilesAtLevel(level);
    // let yTiles = this.getNumberOfYTilesAtLevel(level);

    // let xTileWidth =
    //     (this._rectangleNortheastInMeters.x - this._rectangleSouthwestInMeters.x) /
    //     xTiles;
    // let west = this._rectangleSouthwestInMeters.x + x * xTileWidth;
    // let east = this._rectangleSouthwestInMeters.x + (x + 1) * xTileWidth;

    // let yTileHeight =
    //     (this._rectangleNortheastInMeters.y - this._rectangleSouthwestInMeters.y) /
    //     yTiles;
    // let north = this._rectangleNortheastInMeters.y - y * yTileHeight;
    // let south = this._rectangleNortheastInMeters.y - (y + 1) * yTileHeight;

    let west,
      east,
      north,
      south = 0
    let currentMatrix = this._tileInfo.lods.filter(item => item.level === level)
    let currentResolution = currentMatrix[0].resolution
    north = this._tileInfo.origin.y - y * (this._tileInfo.cols * currentResolution)
    west = this._tileInfo.origin.x + x * (this._tileInfo.cols * currentResolution)
    south = this._tileInfo.origin.y - (y + 1) * (this._tileInfo.cols * currentResolution)
    east = this._tileInfo.origin.x + (x + 1) * (this._tileInfo.cols * currentResolution)
    if (!CesiumDefined(result)) {
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
  tileXYToRectangle(x, y, level, result) {
    let nativeRectangle = this.tileXYToNativeRectangle(x, y, level, result)
    let projection = this.projection
    let southwest = projection.unproject(new Cartesian2(nativeRectangle.west, nativeRectangle.south))
    let northeast = projection.unproject(new Cartesian2(nativeRectangle.east, nativeRectangle.north))
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
  positionToTileXY(position, level, result) {
    // console.log('start positionToTileXY');
    let rectangle = this._rectangle
    if (!Rectangle.contains(rectangle, position)) {
      // outside the bounds of the tiling scheme
      return undefined
    }

    // let xTiles = this.getNumberOfXTilesAtLevel(level);
    // let yTiles = this.getNumberOfYTilesAtLevel(level);

    // let overallWidth =
    //     this._rectangleNortheastInMeters.x - this._rectangleSouthwestInMeters.x;
    // let xTileWidth = overallWidth / xTiles;
    // let overallHeight =
    //     this._rectangleNortheastInMeters.y - this._rectangleSouthwestInMeters.y;
    // let yTileHeight = overallHeight / yTiles;

    let currentMatrix = this._tileInfo.lods.filter(item => item.level === level)
    let currentResolution = currentMatrix[0].resolution
    let projection = this._projection
    let webMercatorPosition = projection.project(position)
    // let distanceFromWest =
    //     webMercatorPosition.x - this._rectangleSouthwestInMeters.x;
    // let distanceFromNorth =
    //     this._rectangleNortheastInMeters.y - webMercatorPosition.y;
    let xTileCoordinate = Math.floor((webMercatorPosition.x - this._tileInfo.origin.x) / (this._tileInfo.cols * currentResolution))
    let yTileCoordinate = Math.floor((this._tileInfo.origin.y - webMercatorPosition.y) / (this._tileInfo.cols * currentResolution))
    // let xTileCoordinate = (distanceFromWest / xTileWidth) | 0;
    // if (xTileCoordinate >= xTiles) {
    //     xTileCoordinate = xTiles - 1;
    // }
    // // let yTileCoordinate = (distanceFromNorth / yTileHeight) | 0;
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
    if (!CesiumDefined(result)) {
      return new Cartesian2(xTileCoordinate, yTileCoordinate)
    }
    result.x = xTileCoordinate
    result.y = yTileCoordinate
    return result
  }
}
