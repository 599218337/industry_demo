import * as Cesium from 'cesium'
import { mapStory } from './mapStory'
import { roundPointFly } from './roundPointFly'

const describe = '业务相关地图功能'
namespace classA {
  /**ClassA 构造函数参数 */
  export type ConstructorOptions = {
    viewer: Cesium.Viewer & { [key: string]: any }
    name: string
    id?: string
    attributes?: object
    tileWidth?: number
    tileHeight?: number
    maximumLevel?: number
  }
}
/**
 * Geometry instancing allows one {@link classA} .  one {@link classA}.
 *
 * This comment _supports_ [测试md链接]("../../gs3dMarkdown/README.md")
 *
 * @example
 * const geometry = Cesium.BoxGeometry.fromDimensions({
 *   dimensions : new Cesium.Cartesian3(1000000.0, 1000000.0, 500000.0)
 * });
 * @param viewer - The Cesium Viewer.
 * @param id - A  {@link classA.ConstructorOptions} or  with {@link roundPointFly.classB.ConstructorOptions}.
 */
class classA {
  /**
   *  @param name 名字
   */
  name: string
  constructor(options?: classA.ConstructorOptions) {
    this.name = options?.name
  }

  /**
   * @description 说话
   * @Remarks 备注
   *
   * @param {string} wors -
   * @return {*}
   * @example
   * ```ts
   *
   * ```
   */
  say(wors: string): void {
    console.log(`${this.name}: 汪汪汪`)
  }

  /**
   * @description 跑
   * @Remarks 备注
   *
   * @param {number} speed - 速度
   * @return {*}
   * @example
   * ```ts
   *
   * ```
   */
  run(speed: number): void {
    console.log(`${speed}: 速度`)
  }
}

export { describe, classA, mapStory, roundPointFly }
