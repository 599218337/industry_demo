import * as util from './util/index'
import * as global from './global/index'
import * as analysis from './analysis/index'
import * as business from './business/index'
import * as common from './common/index'
import * as core from './core/index'
import * as effect from './effect/index'
import * as grid from './grid/index'
import * as manager from './manager/index'
import * as store from './store/index'
import * as thematic from './thematic/index'
import * as tools from './tools/index'
import JSEncrypt from 'jsencrypt'
// import * as turf from '@turf/turf'
export * as analysis from './analysis/index'
export * as business from './business/index'
export * as common from './common/index'
export * as core from './core/index'
export * as effect from './effect/index'
export * as global from './global/index'
export * as grid from './grid/index'
export * as manager from './manager/index'
export * as store from './store/index'
export * as thematic from './thematic/index'
export * as tools from './tools/index'
export * as util from './util/index'
export * as Cesium from 'cesium'
/**
 @internal
 */
export * as turf from '@turf/turf'
  // export { turf }
  ; (() => {
    // dsadsadsadsa
    const GS3D_CESIUM_VERSION = '1.108.0'

  })()
const { variable } = global
const { axios } = util

let _gs3dLicenseFlag = false,
  internal = null
// export const initLicense = (url?: string) => {
//   return axios
//     .aGet({
//       url: url ?? '/gs3d-assets/LICENSE.txt',
//       responseType: 'blob'
//     })
//     .then(res => {
//       let reader = new FileReader()
//       reader.readAsText(res.data)
//       return new Promise((resolve, reject) => {
//         reader.onload = () => {
//           resolve(reader.result)
//         }
//       }).then((licenseContent: string) => {
//         // let licenseContent = reader.result as string
//         console.log('证书内容', licenseContent)
//         let licenseContentArr = licenseContent.split('==')
//         const publicKey = licenseContentArr[0] //公钥
//         const encryptedContent = licenseContentArr[1] //加密内容
//         // const privateKey = licenseContentArr[2] //私钥
//         const privateKey = `MIIBVAIBADANBgkqhkiG9w0BAQEFAASCAT4wggE6AgEAAkEAx+EA67XMT5gO8E1zHUL8WQfZjrpnW8IbIqFQm11IhQ1OViRLapUEwvbZxJUijjZwn+RAjmL2SgzYYB7EelqB+QIDAQABAkEAmFKIeRkakq229LqRN4OM++xXh8XWbr8GHuYAn+X/FiUs/nMmsSIGR+iDkZ5Fqfv9ec/MYbpHReV1gPAgiwwi4QIhAOMdg4vVZ8cVZjHdxh+dSKTY9nKXNSbuCqSDn39EVPpnAiEA4Uy4V2fci1VTlIkuw5Xton7QP6BLVEI7jW0tnrXvpJ8CIB0SWRVcMtWMCrHVZpgDZRoc36cZbedWzyvx4UfEMnB/AiBCgNP1MPo/wqsOMEQ2hX4Etiwga99werB7eZu6uneHfwIgF+sYUIcC+yBu8Pi6oRmxh9lKJwNiEA5+n3GnGJxC7Dg` //私钥

//         //制作加密信息
//         function makeMessage(options: { startTime: string; endTime: string }) {
//           const KSSJ = new Date(options.startTime).getTime() //有效期开始时间
//           const JSSJ = new Date(options.endTime).getTime() //有效期结束时间
//           const UUID = util.common.getUuid(16) //设备信息
//           //加密信息
//           const JMXX = `${KSSJ}|${JSSJ}|${UUID}`
//           // console.log('加密信息', JMXX)
//           return JMXX
//         }

//         //定时任务
//         function setScheduledTask(hour: number, minute: number, callTask: Function) {
//           let taskTime = new Date()
//           taskTime.setHours(hour)
//           taskTime.setMinutes(minute)
//           let timeDiff = taskTime.getTime() - new Date().getTime() // 获取时间差
//           timeDiff = timeDiff > 0 ? timeDiff : timeDiff + 24 * 60 * 60 * 1000
//           callTask() // 首次立即执行
//           if (internal) {
//             clearInterval(internal)
//             internal = null
//           }
//           internal = setInterval(callTask, 60 * 60 * 1000) // 1小时 为循环周期

//           //定时器
//           // setTimeout(() => {
//           //   callTask() // 首次执行
//           //   // setInterval(callTask, 24 * 60 * 60 * 1000) // 24小时为循环周期
//           //   setInterval(callTask, 60 * 1000) // 1分支为循环周期
//           // }, timeDiff)
//         }
//         encryption({ key: publicKey, message: makeMessage({ startTime: '2024/1/1', endTime: '2024/1/12 14:00:00' }) })
//         //每天0点执行，验证证书是否有效
//         setScheduledTask(24, 0, () => {
//           let uncrypted = decryption({ key: privateKey, message: encryptedContent })
//           if (!uncrypted) {
//             _gs3dLicenseFlag = false
//             _initModule()
//             console.log('证书无效')
//           }
//           let endTime = Number((uncrypted as string).split('|')[1])
//           const SYSJ = (endTime - new Date().getTime()) / 1000 //剩余时间
//           if (SYSJ <= 0) {
//             _gs3dLicenseFlag = false
//             _initModule()
//             console.log('证书过期')
//           } else if (SYSJ <= 3 * 24 * 60 * 60) {
//             _gs3dLicenseFlag = true
//             console.log(`证书还有：${timestampToTime(SYSJ)}过期`)
//           } else {
//             _gs3dLicenseFlag = true
//             console.log(`证书剩余：${timestampToTime(SYSJ)}过期`)
//           }
//           Object.defineProperty(variable, 'gs3dLicense', {
//             // value: false,
//             // writable: true, //该特性控制该属性是否可以赋值
//             configurable: true, // 该属性不可删除，更不可再次使用defineProperty修改属性描述符
//             enumerable: false, //配置该属性是否可以枚举
//             get() {
//               return _gs3dLicenseFlag
//             }
//           })
//         })
//         //时间戳（秒）转换 n天n时n分n秒
//         function timestampToTime(totalSeconds: number) {
//           totalSeconds = totalSeconds ? totalSeconds : null
//           const days = Math.floor(totalSeconds / 86400)
//           totalSeconds %= 86400
//           const hours = Math.floor(totalSeconds / 3600)
//           totalSeconds %= 3600
//           const minutes = Math.floor(totalSeconds / 60)
//           const seconds = Math.floor(totalSeconds % 60)
//           return `${days}天${hours}时${minutes}分${seconds}秒`
//         }

//         //RSA加密
//         function encryption(options: { key: string; message: string }) {
//           let encrypt = new JSEncrypt()
//           encrypt.setPublicKey(options.key) // 设置公钥
//           let encrypted = encrypt.encrypt(options.message) as string //进行加密
//           // console.log('加密后内容', encrypted) // 输出加密后的内容
//         }

//         //RSA解密
//         function decryption(options: { key: string; message: string }): string | boolean {
//           let encrypt = new JSEncrypt()
//           encrypt.setPrivateKey(options.key) //设置秘钥
//           let uncrypted = encrypt.decrypt(options.message) //解密之前拿公钥加密的内容
//           // console.log('解密后内容', uncrypted) //输出解密后的内容;
//           return uncrypted
//         }
//       })
//     })
// }

//初始化
const _initModule = () => {
  function dealModule(moduleArr: any[]) {
    moduleArr.forEach(module => {
      for (const key in module) {
        if (Object.prototype.hasOwnProperty.call(module, key)) {
          let element = module[key]
          if (Object.prototype.toString.call(element) === '[object Object]') {
            for (const key in element) {
              if (Object.prototype.hasOwnProperty.call(element, key)) {
                delete element[key]
              }
            }
          } else {
            element = null
          }
        }
      }
    })
  }

  dealModule([global, util, analysis, business, common, core, effect, grid, manager, store, thematic, tools])
}
// util.common.dealAsyncInfect(initLicense)
