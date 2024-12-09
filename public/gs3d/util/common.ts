export namespace common {
  export const describe: string = '通用前端方法'
  /**
   * @description 生成一个唯一的uuid方法
   * @param {number} len - uuid长度
   * @param {number} radix - 可选，从62个数字大小写字母中截取radix个作为选择池
   * @return {*}
   * @example
   * ```ts
   *   gs3d.util.common.getUuid(8)
   * ```
   */
  export const getUuid = (len: number, radix?: number) => {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('')
    var uuid = []
    var i
    radix = radix || chars.length
    if (len) {
      // Compact form
      for (i = 0; i < len; i++) uuid[i] = chars[0 | (Math.random() * radix)]
    } else {
      // rfc4122, version 4 form
      var r

      // rfc4122 requires these characters
      uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-'
      uuid[14] = '4'

      // Fill in random data.  At i==19 set the high bits of clock sequence as
      // per rfc4122, sec. 4.1.5
      for (i = 0; i < 36; i++) {
        if (!uuid[i]) {
          r = 0 | (Math.random() * 16)
          uuid[i] = chars[i === 19 ? (r & 0x3) | 0x8 : r]
        }
      }
    }
    return uuid.join('')
  }

  /**
   * @description 下载json文件
   * @param {object} res - 需要下载的json数据
   * @param {string} name - 下载文件名
   * @param {boolean} isFormat - 是否格式化，默认不格式化
   * @return {*}
   * @example
   * ```ts
   * gs3d.util.common.downloadJson({val:1},"文件名","json")
   * ```
   */
  export const downloadJson = (res: object, name?: string, isFormat?: boolean) => {
    isFormat = isFormat || false
    name = name || 'json'
    var a = document.createElement('a')
    a.download = name
    a.style.display = 'none'
    var dat = isFormat ? JSON.stringify(res, null, 4) : JSON.stringify(res)
    var blob = new Blob([dat], { type: 'Application/json' })
    a.href = URL.createObjectURL(blob)
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    return true
  }

  /**
   * @description 消除异步传染性
   * @param {Function} func - 所需要被消除异步传染性的流程方法
   * @return {*}
   * @example
   * ```ts
   *
   * ```
   */
  export const dealAsyncInfect = (func: Function) => {
    // 改动环境
    let cache = {
      status: 'pending',
      value: null
    }
    const oldFeatch = window.fetch
    window.fetch = (...args) => {
      if (cache.status === 'fulfilled') {
        return cache.value
      } else if (cache.status === 'rejected') {
        throw cache.value
      }

      // 1.发送真实请求
      const prom = oldFeatch(...args)
        .then(resp => resp.json())
        .then(
          res => {
            cache.status = 'fulfilled'
            cache.value = res
          },
          err => {
            cache.status = 'rejected'
            cache.value = err
          }
        )
      // 2.抛出错误
      throw prom
    }
    // 执行入口函数
    try {
      func()
    } catch (error) {
      if (Object.prototype.toString.call(error) === '[object Promise]') {
        error.then(func, func).finally(() => {
          window.fetch = oldFeatch
        })
      }
    }
  }

  /**
   * @description 并发请求
   * @Remarks 当前只针对请求为url地址的形式
   * @param {any[string]} urls - 请求的url地址数组
   * @param {number} maxNum - 最大请求数，可缺省,默认3
   * @example
   * ```ts
   *
   * ```
   * @return {*}
   */
  export const concurRequest = (urls: any[string], maxNum?: number): Promise<any[]> => {
    if (!maxNum) {
      maxNum = 3
    }
    return new Promise(resolve => {
      if (urls.length === 0) {
        resolve([])
        return
      }
      const results: any[] = []
      let idx = 0 //下一个请求的下标
      let count = 0 //当前发出请求的个数
      // 发送请求
      const request = async () => {
        if (idx === urls.length) {
          return
        }
        const i = idx //当前请求，在源数组中的下标，用于将请求的结果，对应到源数组的位置
        const url = urls[idx] //当前请求地址
        idx++
        try {
          const resp = await fetch(url)
          results[i] = resp
        } catch (error) {
          results[i] = error
        } finally {
          // 判断所有的请求都已完成
          count++
          if (count === urls.length) {
            resolve(results)
          }
          if (idx < urls.length) {
            request()
          }
        }
      }
      for (let i = 0; i < Math.min(maxNum, urls.length); i++) {
        request()
      }
    })
  }
  export class MinMaxCounter {
    minNum: number
    maxNum: number
    constructor() {
      this.minNum = Number.POSITIVE_INFINITY
      this.maxNum = Number.NEGATIVE_INFINITY
    }
    update(num) {
      if (num > this.maxNum) this.maxNum = num
      if (num < this.minNum) this.minNum = num
    }

    result() {
      return [this.minNum, this.maxNum]
    }
  }
}
