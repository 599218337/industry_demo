import { color } from '../util/color'
export namespace buildEffect {
  export const describe: string = '场景白膜渐变与动态光环'

  let handler = null

  /**
   * @description 打开场景白膜渐变与动态光环
   * @msg 备注
   * @param {any} options -配置项
   * @return {*}
   * @author YangYuzhuo
   * @remarks 备注
   *
   * @example
   * ```ts
   * let options = 
   * {
        tileset: tileSet,//3dtiles加载完成后输出的tileSet，必传
        color: 'rgb(0,127,255)',//白模基底色，可选，默认'rgb(0,127,255)'
        showRing: true,//是否显示动态光环，可选，默认true
        maxHeight: 80//建筑群最大高度，可选，默认80
      }
   * gs3d.effect.buildEffect.open(options)
   * ```
   */
  export const open = (options: any) => {
    let { tileset, color: buildColor = 'rgb(0,127,255)', showRing = true, maxHeight = 80, ringWidth = 0.015, frequency = 720.0 } = options || {}

    if (!tileset) {
      console.log('请传入tileset')
      return
    }
    let rgbArrayColor = color.rgbToArray(color.colorRgb(buildColor))
    console.log('rgbArrayColor', rgbArrayColor)
    buildColor = `vec4(${rgbArrayColor[0].toFixed(1)}/255.,${rgbArrayColor[1].toFixed(1)}/255.,${rgbArrayColor[2].toFixed(1)}/255.,1.)`
    console.log('buildColor', buildColor)

    maxHeight = maxHeight.toFixed(1)
    ringWidth = ringWidth.toFixed(3)
    frequency = frequency.toFixed(1)
    let ringStr = ''
    showRing && (ringStr = 'out_FragColor.rgb += out_FragColor.rgb * (1.0 - diffuse );')

    // tileset.style = new Cesium.Cesium3DTileStyle({
    //   color: {
    //     conditions: [['true', 'rgba(0, 127.5, 255 ,1)']]
    //   }
    // })
    //改变shader
    handler = function (res: any) {
      let content = res.content
      let featuresLength = content.featuresLength
      for (let i = 0; i < featuresLength; i += 2) {
        let feature = content.getFeature(i)
        let model = feature.content._model
        if (model && model._pipelineResources) {
          let program = model._pipelineResources[1]
          // const buildColor = `vec4(0,127.5/255.,1.,1.)`
          // i == 0 && console.log('shader', program._fragmentShaderSource.sources[0])

          program._fragmentShaderSource.sources[0] = `
            uniform vec2 model_iblFactor;
            uniform mat3 model_iblReferenceFrameMatrix;
            uniform float model_luminanceAtZenith;
            uniform float u_metallicFactor;
            uniform float u_roughnessFactor;
            uniform int model_featuresLength;
            uniform sampler2D model_batchTexture;
            uniform vec4 model_textureStep;
            uniform vec2 model_textureDimensions;
            uniform float model_colorBlend;
            uniform bool model_commandTranslucent;
            uniform sampler2D model_pickTexture;
            in vec3 v_positionWC;
            in vec3 v_positionEC;
            in vec3 v_normalEC;
            in vec3 v_positionMC;
            in float v_featureId_0;
            struct SelectedFeature
            {
              int id;
              vec2 st;
              vec4 color;
            };
            struct FeatureIds
            {
              int featureId_0;
            };
            vec2 computeSt(float featureId)
            {
              float stepX = model_textureStep.x;
              float centerX = model_textureStep.y;

              #ifdef MULTILINE_BATCH_TEXTURE
              float stepY = model_textureStep.z;
              float centerY = model_textureStep.w;

              float xId = mod(featureId, model_textureDimensions.x);
              float yId = floor(featureId / model_textureDimensions.x);

              return vec2(centerX + (xId * stepX), centerY + (yId * stepY));
              #else
              return vec2(centerX + (featureId * stepX), 0.5);
              #endif
            }

            void selectedFeatureIdStage(out SelectedFeature feature, FeatureIds featureIds) {
              int featureId = featureIds.SELECTED_FEATURE_ID;

              if(featureId < model_featuresLength) {
                vec2 featureSt = computeSt(float(featureId));

                feature.id = featureId;
                feature.st = featureSt;
                feature.color = texture(model_batchTexture, featureSt);
              }
              else {
                feature.id = model_featuresLength + 1;
                feature.st = vec2(0.0);
                feature.color = vec4(1.0);
              }

              #ifdef HAS_NULL_FEATURE_ID
              if(featureId == model_nullFeatureId) {
                feature.id = featureId;
                feature.st = vec2(0.0);
                feature.color = vec4(1.0);
              }
              #endif
            }
            SelectedFeature selectedFeature;

            void main() {
              vec4 position = czm_inverseModelView * vec4(v_positionEC,1.);//获取模型的世界坐标
              float buildMaxHeight = ${maxHeight};//建筑群最高高度 配渐变色
              out_FragColor = ${buildColor};//赋予基础底色
              out_FragColor *= vec4(vec3(position.z / buildMaxHeight ), 1.0);//根据楼层高度比例渲染渐变色
              float time = abs(fract(czm_frameNumber / ${frequency})-0.5)*2.;//动画频率 约束在(0,1) 更改频率修改360.0
              float diffuse = step(${ringWidth}, abs(clamp(position.z / buildMaxHeight, 0.0, 1.0) - time));//根据帧数变化,光圈颜色白色,由底部朝上一丢丢(0.05)开始逐渐上移显现.
              ${ringStr}//单纯叠加颜色 感兴趣的可以mix混合下
            }
          `
        }
      }
    }
    tileset.tileVisible.addEventListener(handler)
  }
  // export const close = (tileset: any) => {
  //   tileset && handler && tileset.tileVisible.addEventListener.removeEventListener(handler)
  // }
}
