import { coordinateTransform } from '../store/coordinateTransform'
import {
  Ellipsoid,
  defaultValue,
  defined as CesiumDefined,
  Rectangle,
  Cartesian2,
  Cartesian3,
  WebMercatorTilingScheme,
  WebMercatorProjection,
  GeographicTilingScheme,
  Math as CesiumMath,
  Cartographic,
  MapProjection
} from 'cesium'

export namespace TilingScheme {
  export interface CGCS2000TilingSchemeConstructorOptions {
    ellipsoid?: Ellipsoid
    numberOfLevelZeroTilesX?: number
    numberOfLevelZeroTilesY?: number
    rectangleSouthwestInMeters?: Cartesian2
    rectangleNortheastInMeters?: Cartesian2
    projection?: MapProjection
    rectangle?: { [key: string]: any }
    tileInfo?: { [key: string]: any }
  }
  export interface CGCS4490TilingSchemeConstructorOptions {
    ellipsoid?: Ellipsoid
    rectangle?: Rectangle
    numberOfLevelZeroTilesX?: number
    numberOfLevelZeroTilesY?: number
    tileInfo?: { [key: string]: any }
  }

  export interface WebMercatorTilingSchemeGS3DConstructorOptions {
    rectangleNortheastInMeters?: Cartesian3
    rectangleSouthwestInMeters?: Cartesian3
    tileInfo?: { [key: string]: any }
    numberOfLevelZeroTilesY?: number
    numberOfLevelZeroTilesX?: number
    ellipsoid?: Ellipsoid
    rectangle?: Rectangle
  }
}

export namespace TilingScheme {
  export const describe: string = '切片方案'
  /**
   * 高德服务切片方案
   */
  export class AmapMercatorTilingScheme extends WebMercatorTilingScheme {
    constructor(options?: any) {
      super(options)
      let projection = new WebMercatorProjection()
      this.projection.project = function (cartographic, result: any) {
        result = coordinateTransform.WGS84ToGCJ02(CesiumMath.toDegrees(cartographic.longitude), CesiumMath.toDegrees(cartographic.latitude))
        result = projection.project(new Cartographic(CesiumMath.toRadians(result[0]), CesiumMath.toRadians(result[1])))
        return new Cartesian3(result.x, result.y)
      }
      this.projection.unproject = function (cartesian, result: any) {
        let cartographic = projection.unproject(cartesian)
        result = coordinateTransform.GCJ02ToWGS84(CesiumMath.toDegrees(cartographic.longitude), CesiumMath.toDegrees(cartographic.latitude))
        return new Cartographic(CesiumMath.toRadians(result[0]), CesiumMath.toRadians(result[1]))
      }
    }
  }

  /**
   * CGCS2000 椭球体
   */
  export const CGCS2000Ellipsoid = new Ellipsoid(6378137.0, 6378137.0, 6356752.31414)

  /**
   * CGCS2000 投影切片方案
   */
  export class CGCS2000TilingScheme extends WebMercatorTilingScheme {
    private _options: { [key: string]: any }
    private _tileInfo: { [key: string]: any }
    private _numberOfLevelZeroTilesX: number
    private _projection: any
    private _rectangle: any
    constructor(options?: CGCS2000TilingSchemeConstructorOptions) {
      super(options)
      this._options = options || {}
      this.init()
    }

    init() {
      this._projection = this._options.projection //创建新的投影对象
      this._rectangle = this._options.rectangle //重置新的边界矩阵
      this._tileInfo = this._options.tileInfo //设置切片信息
    }

    getNumberOfXTilesAtLevel(level: number): number {
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
      // return this.numberOfLevelZeroTilesX << level;
    }

    // rectangleToNativeRectangle(rectangle, result) {
    //     let projection = this._projection;
    //     let southwest = projection.project(Rectangle.southwest(rectangle));
    //     let northeast = projection.project(Rectangle.northeast(rectangle));

    //     if (!defined(result)) {
    //         return new Rectangle(southwest.x, southwest.y, northeast.x, northeast.y);
    //     }

    //     result.west = southwest.x;
    //     result.south = southwest.y;
    //     result.east = northeast.x;
    //     result.north = northeast.y;
    //     return result;
    // }
    tileXYToNativeRectangle(x: number, y: number, level: number, result: any): Rectangle {
      let west: number,
        east: number,
        north: number,
        south: number = 0
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

    positionToTileXY(position: Cartographic, level: number, result: Cartesian2): Cartesian2 {
      let rectangle = this.rectangle
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
      let projection = this.projection
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

  /**
   * CGCS2000 地理切片方案
   */
  export class CGCS4490TilingScheme extends GeographicTilingScheme {
    _options: any
    _tileInfo: any
    _numberOfLevelZeroTilesX: any
    _numberOfLevelZeroTilesY: any
    _rectangle: any
    constructor(options?: CGCS4490TilingSchemeConstructorOptions) {
      super(options)
      this._options = options || {}
      this.init()
    }
    init() {
      // this._projection = this.options.projection; //创建新的投影对象
      // this._rectangle = this.options.rectangle; //重置新的边界矩阵
      this._tileInfo = this._options.tileInfo //设置切片信息
    }

    getNumberOfXTilesAtLevel(level: number): number {
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

    getNumberOfYTilesAtLevel(level: number): number {
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
    tileXYToRectangle(x: number, y: number, level: number, result: any): Rectangle {
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
    positionToTileXY(position: Cartographic, level: any, result: any): Cartesian2 {
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
   * 参考 {@link WebMercatorProjection} 的几何图形的切片方案，EPSG：3857。 这是 Google 地图、Microsoft Bing 地图和大多数 ESRI ArcGIS Online 使用的切片方案。
   */
  export class WebMercatorTilingSchemeGS3D {
    private _ellipsoid: Ellipsoid
    private _numberOfLevelZeroTilesX: number
    private _numberOfLevelZeroTilesY: number
    private _tileInfo: { [key: string]: any }
    private _projection: WebMercatorProjection
    private _rectangleSouthwestInMeters: Cartesian3
    private _rectangleNortheastInMeters: Cartesian3
    private _rectangle: Rectangle
    /**
     * 其表面被平铺的椭球体。默认为 WGS84 椭圆体。
     */
    ellipsoid: Ellipsoid
    /**
     * 获取此平铺方案覆盖的矩形（以弧度为单位）。
     */
    rectangle: Rectangle
    /**
     * 获取此切片方案使用的地图投影。
     */
    projection: WebMercatorProjection
    /**
     * 磁贴树第 0 层 X 方向上的磁贴数量。
     */
    numberOfLevelZeroTilesX: number
    /**
     * 在图块树的零级处 Y 方向上的图块数。
     */
    numberOfLevelZeroTilesY: number
    tileInfo: { [key: string]: any }
    /**
     * 平铺方案覆盖的矩形的西南角，以米为单位。 如果未指定此参数或 rectangleNortheastInMeters，则在经度方向上覆盖整个地球，在纬度方向上覆盖相等的距离，从而产生方形投影。
     */
    rectangleSouthwestInMeters: Cartesian3
    /**
     * 平铺方案覆盖的矩形的东北角，以米为单位。 如果未指定此参数或 rectangleSouthwestInMeters，则在经度方向上覆盖整个地球，在纬度方向上覆盖相等的距离，从而产生方形投影。
     */
    rectangleNortheastInMeters: Cartesian3
    constructor(options?: WebMercatorTilingSchemeGS3DConstructorOptions) {
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
        this._rectangleSouthwestInMeters = new Cartesian3(-semimajorAxisTimesPi, -semimajorAxisTimesPi)
        this._rectangleNortheastInMeters = new Cartesian3(semimajorAxisTimesPi, semimajorAxisTimesPi)
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
     * 获取指定细节层次的 X 方向上的图块总数。
     *
     * @param {Number} level 详细程度。
     * @returns {Number} 给定级别上 X 方向上的图块数。
     */
    getNumberOfXTilesAtLevel(level: number): number {
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
     * 获取 Y 方向上指定详细层次的图块总数。
     *
     * @param {Number} level 详细程度。
     * @returns {Number} 给定级别上 Y 方向上的图块数。
     */
    getNumberOfYTilesAtLevel(level: number): number {
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
     * 将以大地弧度指定的矩形转换为此切片方案的原生坐标系。
     *
     * @param {Rectangle} rectangle 要转换的矩形。
     * @param {Rectangle} [result] 要将结果复制到的实例，如果应创建新实例，则为 undefined。
     * @returns {Rectangle} 指定的“result”，如果“result”未定义，则包含本机矩形的新对象。
     */
    rectangleToNativeRectangle(rectangle: Rectangle, result: Rectangle): Rectangle {
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
     * 将切片 x、y 坐标和标高转换为以切片方案的原生坐标表示的矩形。
     *
     * @param {Number} x 图块的整数 x 坐标。
     * @param {Number} y 图块的整数 y 坐标。
     * @param {Number} level 磁贴细节级别。 零是最不详细的。
     * @param {Object} [result] 要将结果复制到的实例，如果应创建新实例，则为 undefined。
     * @returns {Rectangle} 指定的“result”，如果“result”未定义，则包含矩形的新对象。
     */
    tileXYToNativeRectangle(x: number, y: number, level: number, result?: any): Rectangle {
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

      let west: number,
        east: number,
        north: number,
        south: number = 0
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
     * 将图块 x、y 坐标和标高转换为以弧度为单位的制图矩形。
     *
     * @param {Number} x 图块的整数 x 坐标。
     * @param {Number} y 图块的整数 y 坐标。
     * @param {Number} level 磁贴细节级别。 零是最不详细的。
     * @param {Object} [result] 要将结果复制到的实例，如果应创建新实例，则为 undefined。
     * @returns {Rectangle} 指定的“result”，如果“result”未定义，则包含矩形的新对象。
     */
    tileXYToRectangle(x: number, y: number, level: number, result: any): Rectangle {
      let nativeRectangle = this.tileXYToNativeRectangle(x, y, level, result)
      let projection = this.projection
      let southwest = projection.unproject(new Cartesian3(nativeRectangle.west, nativeRectangle.south))
      let northeast = projection.unproject(new Cartesian3(nativeRectangle.east, nativeRectangle.north))
      nativeRectangle.west = southwest.longitude
      nativeRectangle.south = southwest.latitude
      nativeRectangle.east = northeast.longitude
      nativeRectangle.north = northeast.latitude
      return nativeRectangle
    }

    /**
     * 计算包含给定制图位置的图块的图块 x、y 坐标。
     *
     * @param {Cartographic} position 位置。
     * @param {Number} level 磁贴细节级别。 零是最不详细的。
     * @param {Cartesian2} [result] 要将结果复制到的实例，如果应创建新实例，则为 undefined。
     * @returns {Cartesian2} 指定的“result”，或者如果“result”未定义，则包含图块 x、y 坐标的新对象。
     */
    positionToTileXY(position: Cartographic, level: number, result: Cartesian2): Cartesian2 {
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
      // console.log(xTileCoordinate, yTileCoordinate)
      if (!CesiumDefined(result)) {
        return new Cartesian2(xTileCoordinate, yTileCoordinate)
      }
      result.x = xTileCoordinate
      result.y = yTileCoordinate
      return result
    }
  }
}
