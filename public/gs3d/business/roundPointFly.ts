import { typeExt } from '../util/typeExt'
export namespace roundPointFly {
  export const describe = '绕点飞行'
  export namespace classB {
    /** A complex generic type.测试描述测试描述测试描述 */
    export type ConstructorOptions = {
      // viewer: Cesium.Viewer & { [key: string]: any }
      nameclassB?: string
      idclassB: string
      attributesclassB?: object
      tileWidthclassB?: number
      tileHeightclassB?: number
      maximumLevelclassB?: number
    }

    /**
     * 构造函数参数类型
     */
    export type options = {
      // viewer: Cesium.Viewer & { [key: string]: any }
      nameclassB: string
      idclassB: string
      attributesclassB: object
      tileWidthclassB: number
      tileHeightclassB: number
      maximumLevelclassB: number
    }

    /** A complex generic type.测试描述测试描述测试描述 */
    export type Optional = typeExt.Optional<options, 'nameclassB' | 'attributesclassB' | 'tileWidthclassB' | 'tileHeightclassB' | 'maximumLevelclassB'>
  }

  /**
   * Geometry instancing allows one {@link classB} .  one {@link classB}.
   * @example
   * // Create geometry for a box, and two instances that refer to it.
   * const geometry = Cesium.BoxGeometry.fromDimensions({
   *   dimensions : new Cesium.Cartesian3(1000000.0, 1000000.0, 500000.0)
   * });
   * @param options - Object with the following properties:
   * @param viewer - The Cesium Viewer.
   * @param name - name.
   * @param id - A  {@link classB.ConstructorOptions} or  with {@link classB.ConstructorOptions}.
   * @param attributes - Per-instance attributes like a show or color attribute shown in the example below.
   */
  export class classB {
    /**
     *  @param nameclassB 名字
     */
    nameclassB: string
    /**
     *  @param speedclassB 速度
     */
    speedclassB: number
    /**
     * Constructor short text.
     *
     * @param options - Object with the following properties:
     * @param viewer - The Cesium Viewer.
     * @param name - name.
     * @param id - A  {@link classB#ConstructorOptions} or  with {@link classB#ConstructorOptions}.
     * @param attributes - Per-instance attributes like a show or color attribute shown in the example below.
     */
    constructor(options?: classB.ConstructorOptions) {
      this.nameclassB = options?.nameclassB
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
    sayclassB(wors: string): void {
      console.log(`${this.nameclassB}: 汪汪汪`)
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
    runclassB(speed: number): void {
      console.log(`${this.speedclassB}: 速度`)
    }
  }
}
