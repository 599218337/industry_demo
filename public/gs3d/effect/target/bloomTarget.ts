import * as Cesium from 'cesium'

import { Target } from './target'

import extract from '../glsl/extract.glsl'
import ContrastBias from '../glsl/ContrastBias.glsl'
// import GaussianBlur1D from '../glsl/GaussianBlur1D.glsl'
import { createBlur } from './target'
import blend from '../glsl/blend.glsl'

/* 建议使用Primtive做点击发光效果
 * Entity可能会出现点击到外线的情况
 * 如果需要满足点击Entity和Primitive建议传入用于识别的ID，并修改代码
 */
export class BloomTarget extends Target {
  constructor(viewer) {
    super(viewer)

    const config = {
      contrast: 119,
      brightness: 0.08,

      smoothWidth: 0.01,
      threshold: 0.1,

      delta: 0.9,
      sigma: 3.78,
      stepSize: 5,

      ratio: 8,
      color: {
        red: 1,
        green: 1,
        blue: 1,
        alpha: 1
      }
    }
    const contrast_bias = new Cesium.PostProcessStage({
      name: 'contrast_bias',
      fragmentShader: ContrastBias,
      uniforms: {
        contrast: config.contrast,
        brightness: config.brightness
      }
    })
    const extract_local = new Cesium.PostProcessStage({
      name: 'extract_local',
      fragmentShader: extract,
      uniforms: {
        marsColor: Cesium.Color.BLACK,
        marsOpacity: 1,
        smoothWidth: config.smoothWidth,
        threshold: config.threshold
      }
    })
    // const blur_x = new Cesium.PostProcessStage({
    //   name: 'blur_x',
    //   fragmentShader: GaussianBlur1D,
    //   uniforms: {
    //     delta: config.delta,
    //     sigma: config.sigma,
    //     stepSize: config.stepSize,
    //     direction: 0
    //   },
    //   sampleMode: Cesium.PostProcessStageSampleMode.LINEAR
    // })
    // const blur_y = new Cesium.PostProcessStage({
    //   name: 'blur_y',
    //   fragmentShader: GaussianBlur1D,
    //   uniforms: {
    //     delta: config.delta,
    //     sigma: config.sigma,
    //     stepSize: config.stepSize,
    //     direction: 1
    //   },
    //   sampleMode: Cesium.PostProcessStageSampleMode.LINEAR
    // })
    // const blur_xy = new Cesium.PostProcessStageComposite({
    //   name: 'blur_xy',
    //   stages: [blur_x, blur_y]
    // })
    const blur_xy = createBlur('blur', {
      delta: config.delta,
      sigma: config.sigma,
      stepSize: config.stepSize
    })
    const extract_blur = new Cesium.PostProcessStageComposite({
      name: 'extract_blur',
      stages: [extract_local, blur_xy]
    })
    const contrast_bias_extract_blur = new Cesium.PostProcessStageComposite({
      name: 'contrast_bias_extract_blur',
      stages: [contrast_bias, extract_blur]
    })
    const generate_composite = new Cesium.PostProcessStage({
      name: 'generate_composite',
      fragmentShader: blend,
      uniforms: {
        bloomTexture: 'contrast_bias_extract_blur',
        ratio: config.ratio,
        color: config.color
      }
    })
    const postProcessStage = new Cesium.PostProcessStageComposite({
      stages: [contrast_bias_extract_blur, generate_composite],
      inputPreviousStageTexture: false
    })

    this.init(postProcessStage)
  }
}
