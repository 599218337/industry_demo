import * as Cesium from 'cesium'

import { Target } from './target'
import { createBlur } from './target'

/*
是可以不通过合成后处理，直接修改高斯模糊的片元着色器达到模糊单个
但高斯模糊是一个常用的用来处理的步骤，没有选择直接去改它，这样其他时候也可以用这段高斯模糊
*/
export class BlurTarget extends Target {
  constructor(viewer) {
    super(viewer)

    const mask = new Cesium.PostProcessStage({
      name: `mask`,
      fragmentShader: `
                    uniform sampler2D colorTexture;
                    in vec2 v_textureCoordinates;
                    void main(){

                      #ifdef CZM_SELECTED_FEATURE
                      if(!czm_selected()){
                        discard;
                      };
                      #endif
                      out_FragColor=texture(colorTexture, v_textureCoordinates);
                    }
                    `
    })
    const blur = createBlur('first')
    const mask_blur = new Cesium.PostProcessStageComposite({
      name: `mask_blue`,
      stages: [mask, blur]
    })
    const combine = new Cesium.PostProcessStage({
      name: 'combine',
      uniforms: {
        myTexture: mask_blur.name
      },
      fragmentShader: `
                    uniform sampler2D colorTexture;
                    uniform sampler2D myTexture;
                    in vec2 v_textureCoordinates;

                    void main(void) {
                        vec4 color1 = texture(colorTexture, v_textureCoordinates);
                        vec4 bloom = texture(myTexture, v_textureCoordinates);

                        #ifdef CZM_SELECTED_FEATURE
                        if(!czm_selected()){
                          out_FragColor = color1;
                        }else{
                          out_FragColor = bloom;
                        };
                        #endif
                    }
                    `
    })
    const final = new Cesium.PostProcessStageComposite({
      name: `final`,
      stages: [mask_blur, combine],
      inputPreviousStageTexture: false
    })

    this.init(final)
  }
}
