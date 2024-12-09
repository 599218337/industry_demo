import CesiumRenderPass from './CesiumRenderPass.js'
import createBlurStage from './createBlurStage.js'
import * as Cesium from 'cesium'
export default function createEdgeStage(name = 'OutlineEffect') {
  let thresholdAngle = (12 * Math.PI) / 180,
    showOutlineOnly = false,
    outlineWidth = 2,
    visibleEdgeColor = Cesium.Color.WHITE.clone(),
    hiddenEdgeColor = Cesium.Color.DARKRED.clone(),
    useSingleColor = false,
    //
    showGlow = false,
    edgeGlow = 1,
    edgeStrength = 3,
    edgeOnly = false

  /* 1. 创建后期渲染通道 */
  let normalDepthPass = new CesiumRenderPass({
    name: name + 'Pass',
    vertexShader: `
        out vec3 vOutlineNormal;
        void main(){
            #ifdef HAS_NORMAL
                vOutlineNormal = normal;
            #else
                #ifdef HAS_V_NORMAL
                    vOutlineNormal = v_normal;
                #else
                    vOutlineNormal=vec3(0.);
                #endif
            #endif
        }
        `,
    // webgl1
    // vertexShader: `
    //     varying vec3 vOutlineNormal;
    //     void main(){
    //         #ifdef HAS_NORMAL
    //             vOutlineNormal = normal;
    //         #else
    //             #ifdef HAS_V_NORMAL
    //                 vOutlineNormal = v_normal;
    //             #else
    //                 vOutlineNormal=vec3(0.);
    //             #endif
    //         #endif
    //     }
    //     `,
    // webgl1
    fragmentShader: `
        in vec3 vOutlineNormal;
        void main(){
            if(!czm_selected())discard;
            if(length(vOutlineNormal)>0.)out_FragColor=vec4( vOutlineNormal ,out_FragColor.a);
        }
        `,
    // webgl1
    // fragmentShader: `
    //     varying vec3 vOutlineNormal;
    //     void main(){
    //         if(!czm_selected())discard;
    //         if(length(vOutlineNormal)>0.)gl_FragColor=vec4( vOutlineNormal ,gl_FragColor.a);
    //     }
    //     `,
    // webgl1
    sampler: new (Cesium as any).Sampler({
      /* 
      TextureMinificationFilter 
      Enumerates all possible filters used when minifying WebGL textures.
      */
      /*
      TextureMagnificationFilter
      Enumerates all possible filters used when magnifying WebGL textures.
      */
      minificationFilter: Cesium.TextureMinificationFilter.LINEAR,
      magnificationFilter: Cesium.TextureMagnificationFilter.LINEAR
    })
  })

  const maskStage = new Cesium.PostProcessStage({
    name: name + 'Mask',
    uniforms: {
      maskTexture() {
        return normalDepthPass.texture
      },
      maskDepthTexture() {
        return normalDepthPass.depthTexture
      },
      thresholdAngle: function () {
        return thresholdAngle
      },
      showOutlineOnly: function () {
        return showOutlineOnly
      },
      outlineWidth() {
        return outlineWidth
      },
      devicePixelRatio: devicePixelRatio,
      visibleEdgeColor: function () {
        return visibleEdgeColor
      },
      hiddenEdgeColor: function () {
        return hiddenEdgeColor
      },
      useSingleColor: function () {
        return useSingleColor
      }
    },
    fragmentShader: `
        uniform sampler2D colorTexture;
        uniform vec2 colorTextureDimensions;
        uniform sampler2D depthTexture;

        uniform sampler2D maskTexture;
        uniform sampler2D maskDepthTexture;

        uniform float thresholdAngle;
        uniform bool showOutlineOnly;

        uniform float outlineWidth;
        uniform float devicePixelRatio;
        uniform vec3 visibleEdgeColor;
        uniform vec3 hiddenEdgeColor;
        uniform bool useSingleColor;

        in vec2 v_textureCoordinates;

        float lengthSq(vec3 v){
            return v.x * v.x + v.y * v.y + v.z * v.z;
        }
        float normal_angleTo(vec3 a,vec3 b){
            float denominator =  sqrt(  lengthSq(a) * lengthSq(b) );
            if ( denominator == 0. ) return czm_pi / 2.;
            float theta = dot(a, b ) / denominator;
            // clamp, to handle numerical problems
            return  acos(  clamp( theta, - 1., 1. ) );
        }

        float compareNormal(vec4 n1,vec4 n2){
              if(  abs (  normal_angleTo( n1.xyz , n2.xyz ) ) < thresholdAngle ){
                  return 0.;
              }else{
                  return 1.;
              }
        }

        float compareDepth(const in vec2 uv){
            // 获取深度值
            float maskDepth = czm_readDepth( maskDepthTexture, uv);
            float nonDepth = czm_readDepth( depthTexture, uv);
            return maskDepth>nonDepth?1.:0.;
        }

        void main(){

            vec2 vUv=v_textureCoordinates;

            // vec4 color = texture( colorTexture, vUv);
            vec4 maskColor = texture( maskTexture, vUv);

            if( maskColor.a < 0.0001){
                // out_FragColor =color;
                discard;
                return;
            }

            vec2 invSize = outlineWidth / colorTextureDimensions;
            vec4 uvOffset = vec4(1.0, 0.0, 0.0, 1.0) * vec4(invSize, invSize);

            vec4 c1 = texture( maskTexture, vUv + uvOffset.xy);
            vec4 c2 = texture( maskTexture, vUv - uvOffset.xy);
            vec4 c3 = texture( maskTexture, vUv + uvOffset.yw);
            vec4 c4 = texture( maskTexture, vUv - uvOffset.yw);

            float d;
            if(showOutlineOnly){
                float diff1 = (c1.a - c2.a)*0.5;
                float diff2 = (c3.a - c4.a)*0.5;
                d = length( vec2(diff1, diff2) );
            }
            else{
                float diff1 = compareNormal(c1,c2)*0.5;
                float diff2 = compareNormal(c3,c4)*0.5;
                d = length( vec2(diff1, diff2) );
            }

            if(useSingleColor==false){
                float dp1 = compareDepth( vUv + uvOffset.xy);
                float dp2 = compareDepth( vUv - uvOffset.xy);
                float dp3 = compareDepth( vUv + uvOffset.yw);
                float dp4 = compareDepth( vUv - uvOffset.yw);

                float a1 = min(dp1, dp2);
                float a2 = min(dp3, dp4);
                float visibilityFactor = min(a1, a2);
                vec3 edgeColor = 1.0 - visibilityFactor > 0.001 ? visibleEdgeColor : hiddenEdgeColor;

                // out_FragColor =color+ vec4( edgeColor , 1. ) * vec4(d);
                out_FragColor = vec4( edgeColor , 1. ) * vec4(d);
            }else{
                // out_FragColor =color+ vec4( visibleEdgeColor , 1. ) * vec4(d);
                out_FragColor =  vec4( visibleEdgeColor , 1. ) * vec4(d);
            }
        }
        `
    // webgl1
    // fragmentShader: `
    //     uniform sampler2D colorTexture;
    //     uniform vec2 colorTextureDimensions;
    //     uniform sampler2D depthTexture;

    //     uniform sampler2D maskTexture;
    //     uniform sampler2D maskDepthTexture;
    //     uniform float thresholdAngle;
    //     uniform bool showOutlineOnly;

    //     uniform float outlineWidth;
    //     uniform float devicePixelRatio;
    //     uniform vec3 visibleEdgeColor;
    //     uniform vec3 hiddenEdgeColor;
    //     uniform bool useSingleColor;

    //     varying vec2 v_textureCoordinates;

    //     float lengthSq(vec3 v){
    //         return v.x * v.x + v.y * v.y + v.z * v.z;
    //     }
    //     float normal_angleTo(vec3 a,vec3 b){
    //         float denominator =  sqrt(  lengthSq(a) * lengthSq(b) );
    //         if ( denominator == 0. ) return czm_pi / 2.;
    //         float theta = dot(a, b ) / denominator;
    //         // clamp, to handle numerical problems
    //         return  acos(  clamp( theta, - 1., 1. ) );
    //     }

    //     float compareNormal(vec4 n1,vec4 n2){
    //           if(  abs (  normal_angleTo( n1.xyz , n2.xyz ) ) < thresholdAngle ){
    //               return 0.;
    //           }else{
    //               return 1.;
    //           }
    //     }

    //     float compareDepth(const in vec2 uv){
    //         float maskDepth = czm_readDepth( maskDepthTexture, uv);
    //         float nonDepth = czm_readDepth( depthTexture, uv);
    //         return maskDepth>nonDepth?1.:0.;
    //     }

    //     void main(){

    //         vec2 vUv=v_textureCoordinates;

    //         // vec4 color = texture2D( colorTexture, vUv);
    //         vec4 maskColor = texture2D( maskTexture, vUv);

    //         if( maskColor.a < 0.0001){
    //             // gl_FragColor =color;
    //             discard;
    //             return;
    //         }

    //         vec2 invSize = outlineWidth / colorTextureDimensions;
    //         vec4 uvOffset = vec4(1.0, 0.0, 0.0, 1.0) * vec4(invSize, invSize);

    //         vec4 c1 = texture2D( maskTexture, vUv + uvOffset.xy);
    //         vec4 c2 = texture2D( maskTexture, vUv - uvOffset.xy);
    //         vec4 c3 = texture2D( maskTexture, vUv + uvOffset.yw);
    //         vec4 c4 = texture2D( maskTexture, vUv - uvOffset.yw);

    //         float d;
    //         if(showOutlineOnly){
    //             float diff1 = (c1.a - c2.a)*0.5;
    //             float diff2 = (c3.a - c4.a)*0.5;
    //             d = length( vec2(diff1, diff2) );
    //         }
    //         else{
    //             float diff1 = compareNormal(c1,c2)*0.5;
    //             float diff2 = compareNormal(c3,c4)*0.5;
    //             d = length( vec2(diff1, diff2) );
    //         }

    //         if(useSingleColor==false){
    //             float dp1 = compareDepth( vUv + uvOffset.xy);
    //             float dp2 = compareDepth( vUv - uvOffset.xy);
    //             float dp3 = compareDepth( vUv + uvOffset.yw);
    //             float dp4 = compareDepth( vUv - uvOffset.yw);

    //             float a1 = min(dp1, dp2);
    //             float a2 = min(dp3, dp4);
    //             float visibilityFactor = min(a1, a2);
    //             vec3 edgeColor = 1.0 - visibilityFactor > 0.001 ? visibleEdgeColor : hiddenEdgeColor;

    //             // gl_FragColor =color+ vec4( edgeColor , 1. ) * vec4(d);
    //             gl_FragColor = vec4( edgeColor , 1. ) * vec4(d);
    //         }else{
    //             // gl_FragColor =color+ vec4( visibleEdgeColor , 1. ) * vec4(d);
    //             gl_FragColor =  vec4( visibleEdgeColor , 1. ) * vec4(d);
    //         }
    //     }
    //     `,
    // webgl1
  })
  /* 2. 在后期处理节点中使用 */
  normalDepthPass.stage = maskStage

  const blurStage1 = createBlurStage(name + 'Blur1', 4, 1, 0.75)
  const blurStage2 = createBlurStage(name + 'Blur2', 4, 4, 0.5)

  const blurCompositeStage = new Cesium.PostProcessStageComposite({
    name: name + 'BlurComposite',
    stages: [maskStage, blurStage1, blurStage2],
    inputPreviousStageTexture: true
  })

  const addStage = new Cesium.PostProcessStage({
    name: name + 'Additive',
    uniforms: {
      showGlow: function () {
        return showGlow
      },
      edgeGlow: function () {
        return edgeGlow
      },
      edgeStrength: function () {
        return edgeStrength
      },
      edgeOnly() {
        return edgeOnly
      },
      maskTexture() {
        return normalDepthPass.texture
      },
      lineTexture: maskStage.name,
      edgeTexture1: blurStage1.name,
      edgeTexture2: blurCompositeStage.name
    },
    fragmentShader: `
        uniform sampler2D colorTexture;

        uniform bool showGlow;
        uniform float edgeGlow;
        uniform float edgeStrength;
        uniform bool edgeOnly;

        uniform sampler2D maskTexture;
        uniform sampler2D lineTexture;
        uniform sampler2D edgeTexture1;
        uniform sampler2D edgeTexture2;

        in vec2 v_textureCoordinates;
        void main(){

            vec2 vUv =v_textureCoordinates;
            vec4 edgeColor=texture( lineTexture, vUv);
            vec4 color=texture( colorTexture, vUv);
            float opacity=1.;
            if(edgeOnly){
                vec4 maskColor=texture( maskTexture, vUv);
                opacity=1.-maskColor.a;
                out_FragColor = maskColor;
                return;
            }

            if(showGlow){
                float visFactor= czm_selected()?1.:0.;
                vec4 edgeValue1 = texture(edgeTexture1, vUv);
                vec4 edgeValue2 = texture(edgeTexture2, vUv);
                vec4 glowColor = edgeValue1 + edgeValue2 * edgeGlow;
                out_FragColor = opacity * color + edgeColor + edgeStrength * (1. - edgeColor.r) * glowColor;
            }
            else{
                out_FragColor = opacity * color + edgeColor;
            }
        }
        `
    // webgl1
    // fragmentShader: `
    //     uniform sampler2D colorTexture;
    //     uniform sampler2D edgeTexture1;
    //     uniform sampler2D edgeTexture2;
    //     uniform sampler2D lineTexture;
    //     uniform sampler2D maskTexture;
    //     uniform bool showGlow;
    //     uniform float edgeGlow;
    //     uniform bool edgeOnly;
    //     uniform float edgeStrength;

    //     varying vec2 v_textureCoordinates;
    //     void main(){

    //         vec2 vUv =v_textureCoordinates;
    //         vec4 edgeColor=texture2D( lineTexture, vUv);
    //         vec4 color=texture2D( colorTexture, vUv);
    //         float opacity=1.;
    //         if(edgeOnly){
    //             vec4 maskColor=texture2D( maskTexture, vUv);
    //             opacity=1.-maskColor.a;
    //             gl_FragColor = maskColor;
    //             return;
    //         }

    //         if(showGlow){
    //             float visFactor= czm_selected()?1.:0.;
    //             vec4 edgeValue1 = texture2D(edgeTexture1, vUv);
    //             vec4 edgeValue2 = texture2D(edgeTexture2, vUv);
    //             vec4 glowColor = edgeValue1 + edgeValue2 * edgeGlow;
    //             gl_FragColor = opacity * color + edgeColor + edgeStrength * (1. - edgeColor.r) * glowColor;
    //         }
    //         else{
    //             gl_FragColor = opacity * color + edgeColor;
    //         }
    //     }
    //     `,
    // webgl1
  })

  /* ((通过CesiumRenderPass获取材质及深度材质信息传入提取，提取) -> 高斯第一次 -> 高斯第二次) -> 合并 */
  const compositeStage: any = new Cesium.PostProcessStageComposite({
    name: name + 'Composite',
    stages: [blurCompositeStage, addStage],
    inputPreviousStageTexture: false
  })

  function defUniforms(obj) {
    Object.defineProperties(obj, {
      showGlow: {
        get() {
          return showGlow
        },
        set(val) {
          showGlow = val
        }
      },
      edgeGlow: {
        get() {
          return edgeGlow
        },
        set(val) {
          edgeGlow = val
        }
      },
      edgeStrength: {
        get() {
          return edgeStrength
        },
        set(val) {
          edgeStrength = val
        }
      },
      thresholdAngle: {
        get() {
          return thresholdAngle
        },
        set(val) {
          thresholdAngle = val
        }
      },
      showOutlineOnly: {
        get() {
          return showOutlineOnly
        },
        set(val) {
          showOutlineOnly = val
        }
      },
      edgeOnly: {
        get() {
          return edgeOnly
        },
        set(val) {
          edgeOnly = val
        }
      },
      useSingleColor: {
        get() {
          return useSingleColor
        },
        set(val) {
          useSingleColor = val
        }
      },
      outlineWidth: {
        get() {
          return outlineWidth
        },
        set(val) {
          outlineWidth = val
        }
      },
      visibleEdgeColor: {
        get() {
          return visibleEdgeColor
        },
        set(val) {
          visibleEdgeColor = val
        }
      },
      hiddenEdgeColor: {
        get() {
          return hiddenEdgeColor
        },
        set(val) {
          hiddenEdgeColor = val
        }
      }
    })
  }

  defUniforms(compositeStage)
  compositeStage._uniforms = compositeStage._uniforms || {}
  defUniforms(compositeStage._uniforms)

  return compositeStage
}
