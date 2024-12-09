export namespace color {
  export const describe: string = 'color通用方法'
  /**
   * @description 随机一个颜色
   * @return {*}
   * @example
   * ```ts
   *   let random = gs3d.util.color.randColor();
   * ```
   */
  export function randColor() {
    return (
      '#' +
      Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, '0')
        .toUpperCase()
    )
  }

  /**
   * @description 生成线性渐变的颜色数组
   * @param {string} startColor - 起始颜色
   * @param {string} endColor - 结束颜色
   * @param {number} step - 分段数
   * @return {Array<string>}
   * @example
   * ```ts
   *   let gradient = gs3d.util.color.gradientColor("#e5ffe5", "#ffe5e5", 50);
   * ```
   */
  export const gradientColor = (startColor: string, endColor: string, step: number) => {
    let startRGB = rgbToArray(colorRgb(startColor)) //转换为rgb数组模式
    let startR = startRGB[0]
    let startG = startRGB[1]
    let startB = startRGB[2]

    let endRGB = rgbToArray(colorRgb(endColor))
    let endR = endRGB[0]
    let endG = endRGB[1]
    let endB = endRGB[2]

    let sR = (endR - startR) / step //总差值
    let sG = (endG - startG) / step
    let sB = (endB - startB) / step

    let colorArr = []
    for (let i = 0; i < step; i++) {
      //计算每一步的hex值
      let hex = colorHex('rgb(' + parseInt(String(sR * i + startR)) + ',' + parseInt(String(sG * i + startG)) + ',' + parseInt(String(sB * i + startB)) + ')')
      colorArr.push(hex)
    }
    return colorArr
  }
  /**
   * @description 将hex表示方式转换为rgb表示方式
   * @param {string} sColor - 需要转换的hex颜色
   * @return {string}
   * @example
   * ```ts
   * gs3d.util.color.colorRgb('#ff0000')
   * ```
   */
  export const colorRgb = (sColor: string) => {
    var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/
    var sColor = sColor.toLowerCase()
    if (sColor && reg.test(sColor)) {
      if (sColor.length === 4) {
        var sColorNew = '#'
        for (var i = 1; i < 4; i += 1) {
          sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1))
        }
        sColor = sColorNew
      }
      //处理六位的颜色值
      var sColorChange = []
      for (var i = 1; i < 7; i += 2) {
        sColorChange.push(parseInt('0x' + sColor.slice(i, i + 2)))
      }
      return 'rgb(' + sColorChange[0] + ',' + sColorChange[1] + ',' + sColorChange[2] + ')'
    } else {
      return sColor
    }
  }
  /**
   * @description 将rgb表示方式转换为hex表示方式
   * @param {string} rgb - 需要转换的rgb颜色
   * @return {string}
   * @example
   * ```ts
   * gs3d.util.color.colorHex('rgb(255,0,0)')
   * ```
   */
  export const colorHex = (rgb: string) => {
    var _this = rgb
    var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/
    if (/^(rgb|RGB)/.test(_this)) {
      var aColor = _this.replace(/(?:(|)|rgb|RGB)*/g, '').split(',')
      var strHex = '#'
      for (var i = 0; i < aColor.length; i++) {
        var hex = Number(aColor[i]).toString(16)
        hex = Number(hex) < 10 ? 0 + '' + hex : hex // 保证每个rgb的值为2位
        if (hex === '0') {
          hex += hex
        }
        strHex += hex
      }
      if (strHex.length !== 7) {
        strHex = _this
      }
      return strHex
    } else if (reg.test(_this)) {
      var aNum = _this.replace(/#/, '').split('')
      if (aNum.length === 6) {
        return _this
      } else if (aNum.length === 3) {
        var numHex = '#'
        for (var i = 0; i < aNum.length; i += 1) {
          numHex += aNum[i] + aNum[i]
        }
        return numHex
      }
    } else {
      return _this
    }
  }

  /**
   * @description 将rgb表示方式转换为rgb数组模式
   * @param {string} rgb - 需要转换的rgb颜色
   * @return {Array<number>}
   * @example
   * ```ts
   * gs3d.util.color.rgbToArray('rgb(255,0,0)')
   * ```
   */
  export const rgbToArray = (rgb: string) => {
    const rgbArray: Array<number> = []
    let strArray = rgb.split('rgb(')[1].split(',')
    strArray.forEach((item: string) => {
      rgbArray.push(parseFloat(item))
    })
    return rgbArray
  }
}
