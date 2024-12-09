import { breath } from './breath'
import { buildEffect } from './buildEffect'
import { addRoadNet } from './roadNet'
import { bounce } from './bounce'
import { districtName } from './districtName'
import { flyWire } from './flyWire'
import { wall } from './wall'
import { MigrationLine } from './migrationLine'

import { CustomMaterialConfig } from './customMaterialConfig'
import { getRadialGradientCanvas } from './radialGradientCanvas'
import PolylineTrailColorMaterialProperty from './PolylineTrailColorMaterialProperty'
import PolylineTrailMaterialProperty from './PolylineTrailMaterialProperty'

/* 扩散效果 */
// 基于着色器运动像素
import CircleDiffuseMaterialProperty from './ripple/CircleDiffuseMaterialProperty'
// 基于改变半径
import Ripple from './ripple/ripple'

/* billboard加载png，gif动图 */
import { addBillboardPNG, addBillboardGIF1, addBillboardGIF2 } from './addMotionBillboard'

/* 加载shadertoy像素着色器，仅支持Image无纹理的 */
import { ShadertoyLoader } from './shadertoyLoader'

/* 描边 */
import { EdgeTarget } from './target/edgeTarget'
import { BloomTarget } from './target/bloomTarget'
import { BlurTarget } from './target/blurTarget'

/* 天气 */
import { Skyline, Snow, Rain, Foggy } from './weather'

import { InvertMask } from './invertMask'

const describe: string = '三维特效'

export {
  describe,
  breath,
  buildEffect,
  addRoadNet,
  bounce,
  districtName,
  flyWire,
  wall,
  MigrationLine,
  CustomMaterialConfig,
  getRadialGradientCanvas,
  PolylineTrailColorMaterialProperty,
  PolylineTrailMaterialProperty,
  /* 扩散效果 */
  CircleDiffuseMaterialProperty,
  Ripple,
  /* billboard加载png，gif动图 */
  addBillboardPNG,
  addBillboardGIF1,
  addBillboardGIF2,
  /* 加载shadertoy像素着色器，仅支持Image无纹理的 */
  ShadertoyLoader,
  /* 后期处理 */
  EdgeTarget, // 描边
  BloomTarget, // 发光
  BlurTarget, // 模糊
  Skyline, // 天气
  Snow, // 天气
  Rain, // 天气
  Foggy, // 天气
  /* 反选遮罩层 */
  InvertMask
}
