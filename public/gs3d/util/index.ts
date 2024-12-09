import { axios } from './axios'
import { canvas2image } from './canvas2image'
import { color } from './color'
import { common } from './common'
import { GS3Dfetch } from './GS3Dfetch'
import { html2canvas } from './html2canvas'
import { imageryProviderList } from './imageryProviderList'
import { windowUtil } from './windowUtil'
import type { typeExt } from './typeExt'
const describe: string = '前端通用工具'
/**
 * @description 代码分支优化示例
 * @param {string} name - 分支名称
 * @example
 * ```ts
 *
 * ```
 * @return {*}
 */
const branchReform = (name: string): void => {
  //#region 条件分支改造一 分支内做的事件逻辑【一样】
  // 1.原始分支逻辑
  // if (name === '汽车') {
  //   console.log('汽车四个轮');
  // } else if (name === '单车') {
  //   console.log('单车两个轮');
  // } else if (name === '电车') {
  //   console.log('电车履带式');
  // } else {
  //   console.log('不知道什么轮');
  // }
  // 2.分支逻辑改造
  // 映射方式
  const mapSame: { [key: string]: string } = {
    汽车: '汽车四个轮',
    单车: '单车两个轮',
    电车: '电车履带式'
  }
  // 重构分支
  if (mapSame[name]) {
    console.log('mapSame->', mapSame[name]) //事件逻辑
  } else {
    console.log('mapSame->不知道什么方式')
  }
  //#endregion

  //#region 条件分支改造二 分支内做的事件逻辑【不一样】
  // 1.原始分支逻辑
  // if (name === '汽车') {
  //   //做个输出
  // } else if (name === '单车') {
  //   //执行上传文件逻辑
  // } else if (name === '电车') {
  //   //执行上传服务器逻辑
  // } else {
  //   //打开一个网页逻辑
  // }
  // 2.分支逻辑改造
  // 映射方式
  const mapDiff: { [key: string]: () => void } = {
    汽车: () => {
      console.log('mapDiff->汽车四个轮')
    },
    单车: () => {
      console.log('写入文件：', 'mapDiff->单车两个轮')
    },
    电车: () => {
      console.log('上传到服务器', 'mapDiff->电车履带式')
    },
    火车: () => {
      console.log('打开网页', 'mapDiff->用飞的')
    }
  }
  // 重构分支
  if (mapDiff[name]) {
    mapDiff[name]() //直接调用分支的方法，实现不同的事件逻辑
  } else {
    console.log('mapDiff->不知道什么方式')
  }
  //#endregion

  //#region 条件分支改造三 分支内的条件逻辑和事件逻辑均不一样时
  // 1.原始分支逻辑
  // 此条件方式可以改成元组映射
  // if (name.includes('汽')) {
  //   console.log(name, '四个轮');
  // } else if (name.endsWith('单') && name.length <= 3) {
  //   console.log(name, '两个轮');
  // } else if (name.endsWith('电') && !name.includes('火')) {
  //   console.log(name, '履带');
  // } else {
  //   console.log('不知道什么方式');
  // }
  // 2.分支逻辑改造
  // 元组映射方式
  const mapArr = [
    [() => name.includes('汽'), () => console.log(name, 'mapArr->四个轮')],
    [() => name.endsWith('单') && name.length <= 3, () => console.log(name, 'mapArr->两个轮')],
    [() => name.endsWith('电') && !name.includes('火'), () => console.log(name, 'mapArr->履带')]
  ]
  let target = mapArr.find(m => m[0]()) //找到目标条件
  // 重构分支
  if (target) {
    target[1]()
  } else {
    console.log('mapArr->不知道什么方式')
  }
  //#endregion
}
/**
 * @group 前端通用工具
 */
export { axios, canvas2image, color, common, GS3Dfetch, html2canvas, imageryProviderList, windowUtil, typeExt, describe, branchReform }
