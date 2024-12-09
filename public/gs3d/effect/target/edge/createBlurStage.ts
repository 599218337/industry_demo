import * as Cesium from 'cesium'
import { parseDefines } from './parseDefines.js'
const _shadersSeparableBlur =
  '\n\
in vec2 v_textureCoordinates;\n\
uniform sampler2D colorTexture;\n\
uniform vec2 colorTextureDimensions;\n\
uniform vec2 direction;\n\
uniform float kernelRadius;\n\
\n\
float gaussianPdf(in float x, in float sigma) {\n\
    return 0.39894 * exp( -0.5 * x * x/( sigma * sigma))/sigma;\n\
}\n\
void main() {\
    vec2 vUv=v_textureCoordinates;\n\
    vec2 invSize = 1.0 / colorTextureDimensions;\
    float weightSum = gaussianPdf(0.0, kernelRadius);\
    vec4 diffuseSum = texture( colorTexture, vUv) * weightSum;\
    vec2 delta = direction * invSize * kernelRadius/float(MAX_RADIUS);\
    vec2 uvOffset = delta;\
    for( int i = 1; i <= MAX_RADIUS; i ++ ) {\
        float w = gaussianPdf(uvOffset.x, kernelRadius);\
        vec4 sample1 = texture( colorTexture, vUv + uvOffset);\
        vec4 sample2 = texture( colorTexture, vUv - uvOffset);\
        diffuseSum += ((sample1 + sample2) * w);\
        weightSum += (2.0 * w);\
        uvOffset += delta;\
    }\
    out_FragColor = diffuseSum/weightSum;\
}'
// webgl1
// const _shadersSeparableBlur =
//   "\n\
// varying vec2 v_textureCoordinates;\n\
// uniform sampler2D colorTexture;\n\
// uniform vec2 colorTextureDimensions;\n\
// uniform vec2 direction;\n\
// uniform float kernelRadius;\n\
// \n\
// float gaussianPdf(in float x, in float sigma) {\n\
//     return 0.39894 * exp( -0.5 * x * x/( sigma * sigma))/sigma;\n\
// }\n\
// void main() {\
//     vec2 vUv=v_textureCoordinates;\n\
//     vec2 invSize = 1.0 / colorTextureDimensions;\
//     float weightSum = gaussianPdf(0.0, kernelRadius);\
//     vec4 diffuseSum = texture2D( colorTexture, vUv) * weightSum;\
//     vec2 delta = direction * invSize * kernelRadius/float(MAX_RADIUS);\
//     vec2 uvOffset = delta;\
//     for( int i = 1; i <= MAX_RADIUS; i ++ ) {\
//         float w = gaussianPdf(uvOffset.x, kernelRadius);\
//         vec4 sample1 = texture2D( colorTexture, vUv + uvOffset);\
//         vec4 sample2 = texture2D( colorTexture, vUv - uvOffset);\
//         diffuseSum += ((sample1 + sample2) * w);\
//         weightSum += (2.0 * w);\
//         uvOffset += delta;\
//     }\
//     gl_FragColor = diffuseSum/weightSum;\
// }";
// webgl1

/**
 *
 * @param {string} name
 * @param {number} maxRadius
 * @param {number} kernelRadius
 * @param {number} textureScale
 * @returns {Cesium.PostProcessStageComposite}
 */
export default function createBlurStage(name, maxRadius, kernelRadius, textureScale) {
  let blurDirectionX = new Cesium.Cartesian2(1.0, 0.0)
  let blurDirectionY = new Cesium.Cartesian2(0.0, 1.0)

  let separableBlurShader = {
    defines: {
      MAX_RADIUS: maxRadius
    },
    fragmentShader: _shadersSeparableBlur
  }
  parseDefines(separableBlurShader)

  let blurX = new Cesium.PostProcessStage({
    name: name + '_x_direction',
    fragmentShader: separableBlurShader.fragmentShader,
    textureScale: textureScale,
    forcePowerOfTwo: true,
    uniforms: {
      kernelRadius: kernelRadius,
      direction: blurDirectionX
    },
    sampleMode: Cesium.PostProcessStageSampleMode.LINEAR
  })

  let blurY = new Cesium.PostProcessStage({
    name: name + '_y_direction',
    fragmentShader: separableBlurShader.fragmentShader,
    textureScale: textureScale,
    forcePowerOfTwo: true,
    uniforms: {
      kernelRadius: kernelRadius,
      direction: blurDirectionY
    },
    sampleMode: Cesium.PostProcessStageSampleMode.LINEAR
  })

  let separableBlur = new Cesium.PostProcessStageComposite({
    name: name,
    stages: [blurX, blurY],
    inputPreviousStageTexture: true
  })
  return separableBlur
}
