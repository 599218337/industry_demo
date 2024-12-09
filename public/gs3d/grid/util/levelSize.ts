/*
 * @Descripttion: <北斗网格算法规则（级别、尺寸）>
 * @version: 1.0.0
 * @Author: yangyuzhuo
 * @Date: 2023-08-17 13:52:06
 * @LastEditors GS3D
 * @LastEditTime 2024-01-10 17:10:44
 * Copyright 2023
 * listeners
 */
import * as turf from '@turf/turf'
export namespace levelSize {
  export const describe: string = '北斗网格算法规则（级别、尺寸）'

  export const levelHeight = () => {
    return {
      12: 500000,
      13: 210000,
      14: 110000,
      15: 64000,
      16: 30000,
      17: 14000,
      18: 10000,
      19: 4000
    }
  }

  export const getLevelByDistance = (distance: number) => {
    let level = -1
    const count = 25
    if (distance < 2048000 * count && distance > 1024000 * count) {
      level = 6
    } else if (distance < 1024000 * count && distance > 512000 * count) {
      level = 7
    } else if (distance < 512000 * count && distance > 256000 * count) {
      level = 8
    } else if (distance < 256000 * count && distance > 128000 * count) {
      level = 9
    } else if (distance < 128000 * count && distance > 64000 * count) {
      level = 10
    } else if (distance < 64000 * count && distance > 32000 * count) {
      level = 11
    } else if (distance < 32000 * count && distance > 16000 * count) {
      level = 12
    } else if (distance < 16000 * count && distance > 8000 * count) {
      level = 13
    } else if (distance < 8000 * count && distance > 4000 * count) {
      level = 14
    } else if (distance < 4000 * count && distance > 2000 * count) {
      level = 15
    } else if (distance < 2000 * count && distance > 1000 * count) {
      level = 16
    } else if (distance < 1000 * count && distance > 512 * count) {
      level = 17
    } else if (distance < 512 * count && distance > 256 * count) {
      level = 18
    } else if (distance < 256 * count && distance > 128 * count) {
      level = 19
    } else if (distance < 128 * count && distance > 64 * count) {
      level = 20
    } else if (distance < 64 * count && distance > 32 * count) {
      level = 21
    } else if (distance < 32 * count && distance > 16 * count) {
      level = 22
    }
    return level
  }

  export const getLevelByHeight = () => {
    return 1000
  }

  // 根据相机高度获取地图层级
  export const calculateMapLevel = (height: number) => {
    let level
    const x = 93750
    if (height > 8192 * 2 * x) {
      // 24000000
      level = 1
    } else if (height > 8192 * x) {
      level = 2
    } else if (height > 4096 * x) {
      level = 3
    } else if (height > 2048 * x) {
      level = 4
    } else if (height > 1024 * x) {
      level = 5
    } else if (height > 512 * x) {
      level = 6
    } else if (height > 256 * x) {
      // 24000000
      level = 7
    } else if (height > 128 * x) {
      // 1200 0000
      level = 8
    } else if (height > 64 * x) {
      // 600 0000
      level = 9
    } else if (height > 32 * x) {
      // 300 0000
      level = 10
    } else if (height > 16 * x) {
      // 150 0000
      level = 11
    } else if (height > 8 * x) {
      // 75 0000
      level = 12
    } else if (height > 4 * x) {
      // 37 5000
      level = 13
    } else if (height > 2 * x) {
      // 187500
      level = 14
    } else if (height > x) {
      // 93750
      level = 15
    } else if (height > x / 2) {
      level = 16
    } else if (height > x / 4) {
      level = 17
    } else if (height > x / 8) {
      level = 18
    } else if (height > x / 16) {
      level = 19
    } else if (height > x / 32) {
      level = 20
    } else if (height > x / 64) {
      level = 21
    } else if (height > x / 128) {
      level = 22
    } else if (height > x / 256) {
      level = 23
    } else if (height > x / 512) {
      level = 24
    } else if (height > x / 1024) {
      level = 25
    } else if (height > x / 2048) {
      level = 26
    } else if (height > x / 4096) {
      level = 27
    } else if (height > x / (4096 * 2)) {
      level = 28
    } else if (height > x / (4096 * 4)) {
      level = 29
    } else if (height > x / (4096 * 8)) {
      level = 30
    } else if (height > x / (4096 * 16)) {
      level = 31
    } else if (height > x / (4096 * 32)) {
      level = 32
    } else {
      level = 33
    }
    return level - 1 //-1是因为格太密了
  }
  // 根据地图层级获取网格范围，参数level通过calculateMapLevel()获取
  export const calculateGridRangeWithMapLevel = (level: number) => {
    let range = ''
    if (level === 7) {
      range = '512公里'
    } else if (level === 8) {
      range = '256公里'
    } else if (level === 9) {
      range = '128公里'
    } else if (level === 10) {
      range = '64公里'
    } else if (level === 11) {
      range = '32公里'
    } else if (level === 12) {
      range = '16公里'
    } else if (level === 13) {
      range = '8公里'
    } else if (level === 14) {
      range = '4公里'
    } else if (level === 15) {
      range = '2公里'
    } else if (level === 16) {
      range = '1公里'
    } else if (level === 17) {
      range = '512米'
    } else if (level === 18) {
      range = '256米'
    } else if (level === 19) {
      range = '128米'
    } else if (level === 20) {
      range = '64米'
    } else if (level === 21) {
      range = '32米'
    } else if (level === 22) {
      range = '16米'
    } else if (level === 23) {
      range = '8米'
    } else if (level === 24) {
      range = '4米'
    } else if (level === 25) {
      range = '2米'
    } else if (level === 26) {
      range = '1米'
    } else if (level === 27) {
      range = '0.5米'
    } else if (level === 28) {
      range = '25厘米'
    } else if (level === 29) {
      range = '12.5厘米'
    } else if (level === 30) {
      range = '6.2厘米'
    } else if (level === 31) {
      range = '3.1厘米'
    } else if (level === 32) {
      range = '1.5厘米'
    }
    return range
  }

  // 根据地图层级获取高度
  export const calculateHeightWithMapLevel = (level: number) => {
    level += 1
    let height = 0
    const x = 93750
    if (level <= 6) {
      height = 2 ** 10 * x
    } else if (level === 7) {
      height = 2 ** 9 * x
    } else if (level === 8) {
      height = 2 ** 8 * x
    } else if (level === 9) {
      height = 2 ** 7 * x
    } else if (level === 10) {
      height = 2 ** 6 * x
    } else if (level === 11) {
      height = 2 ** 5 * x
    } else if (level === 12) {
      height = 2 ** 4 * x
    } else if (level === 13) {
      height = 2 ** 3 * x
    } else if (level === 14) {
      height = 2 ** 2 * x
    } else if (level === 15) {
      height = 2 ** 1 * x
    } else if (level === 16) {
      height = 2 ** 0 * x
    } else if (level === 17) {
      height = 2 ** -1 * x
    } else if (level === 18) {
      height = 2 ** -2 * x
    } else if (level === 19) {
      height = 2 ** -3 * x
    } else if (level === 20) {
      height = 2 ** -4 * x
    } else if (level === 21) {
      height = 2 ** -5 * x
    } else if (level === 22) {
      height = 2 ** -6 * x
    } else if (level === 23) {
      height = 2 ** -7 * x
    } else if (level === 24) {
      height = 2 ** -8 * x
    } else if (level === 25) {
      height = 2 ** -9 * x
    } else if (level === 26) {
      height = 2 ** -10 * x
    } else if (level === 27) {
      height = 2 ** -11 * x
    } else if (level === 28) {
      height = 2 ** -12 * x
    } else if (level === 29) {
      height = 2 ** -13 * x
    } else if (level === 30) {
      height = 2 ** -14 * x
    } else if (level === 31) {
      height = 2 ** -15 * x
    } else if (level === 32) {
      height = 2 ** -16 * x
    } else if (level >= 33) {
      height = 2 ** -17 * x
    }
    return height
  }

  //geoSot网格层级转北斗网格层级
  export const geosotlevelTobdlevel = (level: number) => {
    let bdlevel
    if (level >= 32) {
      bdlevel = 10
    } else if (level >= 29) {
      bdlevel = 9
    } else if (level >= 26) {
      bdlevel = 8
    } else if (level >= 23) {
      bdlevel = 7
    } else if (level >= 20) {
      bdlevel = 6
    } else if (level >= 19) {
      bdlevel = 5
    } else {
      bdlevel = 4
    }
    // else if (level >= 15) {
    //   bdlevel = 4
    // } else {
    //   bdlevel = 3
    // }
    return bdlevel
  }

  //北斗网格层级转geoSot网格层级
  export const bdlevelTogeosotlevel = (level: number) => {
    let geosotlevel
    if (level == 10) {
      geosotlevel = 32
    } else if (level == 9) {
      geosotlevel = 29
    } else if (level == 8) {
      geosotlevel = 26
    } else if (level == 7) {
      geosotlevel = 23
    } else if (level == 6) {
      geosotlevel = 20
    } else if (level == 5) {
      geosotlevel = 19
    } else {
      geosotlevel = 15
    }
    // else if (level == 4) {
    //   geosotlevel = 15
    // } else {
    //   geosotlevel = 14
    // }
    return geosotlevel
  }

  /**
   * 验证网格数据是否溢出
   * @param geometry 多边形范围
   * @param level 北斗网格层级
   * @param maxGridNumber 最大网格数，默认100000
   * @return {boolean} true是没溢出 false是溢出
   */
  export const verifyOverflow = (geometry: any, level: number, maxGridNumber?: number) => {
    let range: number = -1,
      max = maxGridNumber || 100000
    const area = turf.area(geometry)
    // 匹配对应层级的单网格面积
    switch (level) {
      case 4:
        range = 2000 * 2000
        break
      case 5:
        range = 128 * 128
        break
      case 6:
        range = 64 * 64
        break
      case 7:
        range = 8 * 8
        break
      case 8:
        range = 1 * 1
        break
      case 9:
        range = 0.125 * 0.125
        break
      case 10:
        range = 0.015 * 0.015
        break
      default:
        console.log('range: ', range)
        break
    }
    if (range == -1) {
      console.log('北斗层级错误，验证错误！')
      return false
    }
    return area / range <= max
  }
  /**
   * 获取不会溢出的网格层级
   * @param geometry 多边形范围
   * @param maxGridNumber 最大网格数，默认100000
   * @return {array} 符合条件的网格层级
   */
  export const getNoOverflowLevel = (geometry: any, maxGridNumber?: number) => {
    let max = maxGridNumber || 100000
    const area = turf.area(geometry)
    let range = area / max
    let levelArray = []

    if (range <= 0.015 * 0.015) {
      levelArray = [10, 9, 8, 7, 6, 5, 4]
    } else if (range <= 0.125 * 0.125) {
      levelArray = [9, 8, 7, 6, 5, 4]
    } else if (range <= 1 * 1) {
      levelArray = [8, 7, 6, 5, 4]
    } else if (range <= 8 * 8) {
      levelArray = [7, 6, 5, 4]
    } else if (range <= 64 * 64) {
      levelArray = [6, 5, 4]
    } else if (range <= 128 * 128) {
      levelArray = [5, 4]
    } else if (range <= 2000 * 2000) {
      levelArray = [4]
    } else {
      levelArray = []
    }

    return levelArray
  }

  // 嵌入循环中计算bbox
  export class BBOXCounter {
    minLng: number
    minLat: number
    maxLng: number
    maxLat: number

    constructor() {
      this.minLng = 180
      this.minLat = 90

      this.maxLng = -180
      this.maxLat = -90
    }
    update(lng, lat) {
      if (lng < this.minLng) this.minLng = lng
      if (lat < this.minLat) this.minLat = lat

      if (lng > this.maxLng) this.maxLng = lng
      if (lat > this.maxLat) this.maxLat = lat
    }
    result() {
      return [this.minLng, this.minLat, this.maxLng, this.maxLat]
    }
  }
}
