import * as Cesium from 'cesium'

const WeatherConfig = {
  rain: {
    webgl1: {
      name: 'rain_webgl1',
      fragmentShader: `
                uniform sampler2D colorTexture;//输入的场景渲染照片
                varying vec2 v_textureCoordinates;
                uniform float vrain;
      
                float hash(float x){
                    return fract(sin(x*133.3)*13.13);
                }
      
                void main(void){
                    float time = czm_frameNumber / vrain;
                    vec2 resolution = czm_viewport.zw;
      
                    vec2 uv=(gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);
                    vec3 c=vec3(.6,.7,.8);
                    float a=0.4;
                    float si=sin(a),co=cos(a);
                    uv*=mat2(co,-si,si,co);
                    uv*=length(uv+vec2(0,4.9))*.3+1.;
      
                    float v=1.-sin(hash(floor(uv.x*100.))*2.);
                    float b=clamp(abs(sin(20.*time*v+uv.y*(5./(2.+v))))-.95,0.,1.)*20.;
      
                    c*=v*b; //屏幕上雨的颜色
                    gl_FragColor = mix(texture2D(colorTexture, v_textureCoordinates), vec4(c,1), 0.5); //将雨和三维场景融合
                }
      `,
      uniforms: {
        vrain: function () {
          return 30 // 时间
        }
      }
    },
    webgl2: {
      name: 'rain_webgl2',
      fragmentShader:
        'uniform sampler2D colorTexture;\n\
      in vec2 v_textureCoordinates;\n\
      uniform float tiltAngle;\n\
      uniform float rainSize;\n\
      uniform float rainSpeed;\n\
      float hash(float x) {\n\
          return fract(sin(x * 133.3) * 13.13);\n\
      }\n\
      out vec4 fragColor;\n\
      void main(void) {\n\
          float time = czm_frameNumber / rainSpeed;\n\
          vec2 resolution = czm_viewport.zw;\n\
          vec2 uv = (gl_FragCoord.xy * 2. - resolution.xy) / min(resolution.x, resolution.y);\n\
          vec3 c = vec3(.6, .7, .8);\n\
          float a = tiltAngle;\n\
          float si = sin(a), co = cos(a);\n\
          uv *= mat2(co, -si, si, co);\n\
          uv *= length(uv + vec2(0, 4.9)) * rainSize + 1.;\n\
          float v = 1. - sin(hash(floor(uv.x * 100.)) * 2.);\n\
          float b = clamp(abs(sin(20. * time * v + uv.y * (5. / (2. + v)))) - .95, 0., 1.) * 20.;\n\
          c *= v * b;\n\
          fragColor = mix(texture(colorTexture, v_textureCoordinates), vec4(c, 1), .5);\n\
      }\n\
      ',
      uniforms: {
        tiltAngle: () => {
          return -0.6
        },
        rainSize: () => {
          return 0.3
        },
        rainSpeed: () => {
          return 60.0
        }
      }
      // name: 'rain_webgl2',
      // fragmentShader: `
      //               uniform sampler2D colorTexture; // 输入的场景渲染照片
      //               in vec2 v_textureCoordinates;
      //               uniform float vrain;

      //               float hash(float x){
      //                   return fract(sin(x*133.3)*13.13);
      //               }
      //               out vec4 vFragColor;
      //               void main(void){
      //                   float time = czm_frameNumber / vrain;
      //                   vec2 resolution = czm_viewport.zw;

      //                   vec2 uv=(gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);
      //                   vec3 c=vec3(.6,.7,.8);
      //                   float a=0.4;
      //                   float si=sin(a),co=cos(a);
      //                   uv*=mat2(co,-si,si,co);
      //                   uv*=length(uv+vec2(0,4.9))*.3+1.;

      //                   float v=1.-sin(hash(floor(uv.x*100.))*2.);
      //                   float b=clamp(abs(sin(20.*time*v+uv.y*(5./(2.+v))))-.95,0.,1.)*20.;

      //                   c*=v*b; //屏幕上雨的颜色
      //                   vFragColor = mix(texture(colorTexture, v_textureCoordinates), vec4(c,1), 0.5); //将雨和三维场景融合
      //               }
      //     `,
      // uniforms: {
      //   vrain: function () {
      //     return 30 // 时间
      //   }
      // },
    }
  },
  snow: {
    webgl1: {
      name: 'snow_webgl1',
      //   fragmentShader: `
      //     uniform sampler2D colorTexture;
      //     varying vec2 v_textureCoordinates;
      //     uniform float vsnow;

      //     float snow(vec2 uv,float scale)
      //     {   float time = czm_frameNumber / vsnow;
      //         float w=smoothstep(1.,0.,-uv.y*(scale/10.));if(w<.1)return 0.;
      //         uv+=time/scale;uv.y+=time*2./scale;uv.x+=sin(uv.y+time*.5)/scale;
      //         uv*=scale;vec2 s=floor(uv),f=fract(uv),p;float k=3.,d;
      //         p=.5+.35*sin(11.*fract(sin((s+p+scale)*mat2(7,3,6,5))*5.))-f;d=length(p);k=min(d,k);
      //         k=smoothstep(0.,k,sin(f.x+f.y)*0.01);
      //         return k*w;
      //     }
      //     void main(void){
      //         vec2 resolution = czm_viewport.zw;
      //         vec2 uv=(gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);
      //         vec3 finalColor=vec3(0);
      //         float c = 0.0;
      //         c+=snow(uv,30.)*.0;
      //         c+=snow(uv,20.)*.0;
      //         c+=snow(uv,15.)*.0;
      //         c+=snow(uv,10.);
      //         c+=snow(uv,8.);
      //         c+=snow(uv,6.);
      //         c+=snow(uv,5.);
      //         finalColor=(vec3(c));
      //         gl_FragColor = mix(texture2D(colorTexture, v_textureCoordinates), vec4(finalColor,1), 0.5);
      //     }
      // `,
      fragmentShader:
        'uniform sampler2D colorTexture;\n\
          varying vec2 v_textureCoordinates;\n\
          \n\
          float snow(vec2 uv,float scale){\n\
              float time = czm_frameNumber / 60.0;\n\
              float w=smoothstep(1.,0.,-uv.y*(scale/10.));\n\
              if(w<.1)return 0.;\n\
              uv+=time/scale;\n\
              uv.y+=time*2./scale;\n\
              uv.x+=sin(uv.y+time*.5)/scale;\n\
              uv*=scale;\n\
              vec2 s=floor(uv),f=fract(uv),p;\n\
              float k=3.,d;\n\
              p=.5+.35*sin(11.*fract(sin((s+p+scale)*mat2(7,3,6,5))*5.))-f;\n\
              d=length(p);\n\
              k=min(d,k);\n\
              k=smoothstep(0.,k,sin(f.x+f.y)*0.01);\n\
              return k*w;\n\
          }\n\
          \n\
          void main(){\n\
              vec2 resolution = czm_viewport.zw;\n\
              vec2 uv=(gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);\n\
              vec3 finalColor=vec3(0);\n\
              float c = 0.0;\n\
              c+=snow(uv,30.)*.0;\n\
              c+=snow(uv,20.)*.0;\n\
              c+=snow(uv,15.)*.0;\n\
              c+=snow(uv,10.);\n\
              c+=snow(uv,8.);\n\
              c+=snow(uv,6.);\n\
              c+=snow(uv,5.);\n\
              finalColor=(vec3(c));\n\
              gl_FragColor = mix(texture2D(colorTexture, v_textureCoordinates), vec4(finalColor,1), 0.3);\n\
              \n\
          }\n\
          ',
      uniforms: {
        vsnow: function () {
          return 60 // 时间
        }
      }
    },
    webgl2: {
      // name: 'snow_webgl2',
      // fragmentShader:
      //   'uniform sampler2D colorTexture;\n\
      //     in vec2 v_textureCoordinates;\n\
      //     \n\
      //     float snow(vec2 uv,float scale){\n\
      //         float time = czm_frameNumber / 60.0;\n\
      //         float w=smoothstep(1.,0.,-uv.y*(scale/10.));\n\
      //         if(w<.1)return 0.;\n\
      //         uv+=time/scale;\n\
      //         uv.y+=time*2./scale;\n\
      //         uv.x+=sin(uv.y+time*.5)/scale;\n\
      //         uv*=scale;\n\
      //         vec2 s=floor(uv),f=fract(uv),p;\n\
      //         float k=3.,d;\n\
      //         p=.5+.35*sin(11.*fract(sin((s+p+scale)*mat2(7,3,6,5))*5.))-f;\n\
      //         d=length(p);\n\
      //         k=min(d,k);\n\
      //         k=smoothstep(0.,k,sin(f.x+f.y)*0.01);\n\
      //         return k*w;\n\
      //     }\n\
      //     \n\
      //     out vec4 vFragColor;\n\
      //     void main(){\n\
      //         vec2 resolution = czm_viewport.zw;\n\
      //         vec2 uv=(gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);\n\
      //         vec3 finalColor=vec3(0);\n\
      //         float c = 0.0;\n\
      //         c+=snow(uv,30.)*.0;\n\
      //         c+=snow(uv,20.)*.0;\n\
      //         c+=snow(uv,15.)*.0;\n\
      //         c+=snow(uv,10.);\n\
      //         c+=snow(uv,8.);\n\
      //         c+=snow(uv,6.);\n\
      //         c+=snow(uv,5.);\n\
      //         finalColor=(vec3(c));\n\
      //         vFragColor = mix(texture(colorTexture, v_textureCoordinates), vec4(finalColor,1), 0.3);\n\
      //         \n\
      //     }\n\
      //     ',
      // uniforms: {
      //   vsnow: function () {
      //     return 60 // 时间
      //   }
      // },
      name: 'snow_webgl2',
      fragmentShader:
        'uniform sampler2D colorTexture;\n\
      in vec2 v_textureCoordinates;\n\
      uniform float snowSpeed;\n\
              uniform float snowSize;\n\
      float snow(vec2 uv,float scale)\n\
      {\n\
          float time=czm_frameNumber/snowSpeed;\n\
          float w=smoothstep(1.,0.,-uv.y*(scale/10.));if(w<.1)return 0.;\n\
          uv+=time/scale;uv.y+=time*2./scale;uv.x+=sin(uv.y+time*.5)/scale;\n\
          uv*=scale;vec2 s=floor(uv),f=fract(uv),p;float k=3.,d;\n\
          p=.5+.35*sin(11.*fract(sin((s+p+scale)*mat2(7,3,6,5))*5.))-f;d=length(p);k=min(d,k);\n\
          k=smoothstep(0.,k,sin(f.x+f.y)*snowSize);\n\
          return k*w;\n\
      }\n\
      out vec4 fragColor;\n\
      void main(void){\n\
          vec2 resolution=czm_viewport.zw;\n\
          vec2 uv=(gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);\n\
          vec3 finalColor=vec3(0);\n\
          //float c=smoothstep(1.,0.3,clamp(uv.y*.3+.8,0.,.75));\n\
          float c=0.;\n\
          c+=snow(uv,30.)*.0;\n\
          c+=snow(uv,20.)*.0;\n\
          c+=snow(uv,15.)*.0;\n\
          c+=snow(uv,10.);\n\
          c+=snow(uv,8.);\n\
          c+=snow(uv,6.);\n\
          c+=snow(uv,5.);\n\
          finalColor=(vec3(c));\n\
          fragColor=mix(texture(colorTexture,v_textureCoordinates),vec4(finalColor,1),.5);\n\
          }\n\
          ',
      uniforms: {
        // ❄️大小，最好小于0.02
        snowSize: () => {
          return 0.02
        },
        // 速度
        snowSpeed: () => {
          return 60.0
        }
      }
    }
  },
  foggy: {
    webgl1: {
      name: 'foggy_webgl1',
      fragmentShader: `
            uniform sampler2D colorTexture;
            uniform sampler2D depthTexture;
            varying vec2 v_textureCoordinates;
            uniform float vfog;
            
            void main(void)
            {
                vec4 origcolor=texture2D(colorTexture, v_textureCoordinates);
                vec4 fogcolor=vec4(0.8,0.8,0.8,0.5);
                float depth = czm_readDepth(depthTexture, v_textureCoordinates);
                vec4 depthcolor=texture2D(depthTexture, v_textureCoordinates);
                float f=(depthcolor.r-0.22)/vfog;
                if(f<0.0) f=0.0;
                else if(f>1.0) f=1.0;
                gl_FragColor = mix(origcolor,fogcolor,f);
            }
            `,
      uniforms: {
        vfog: function () {
          return 0.5 // 强度
        }
      }
    },
    webgl2: {
      name: 'foggy_webgl2',
      fragmentShader:
        'uniform sampler2D colorTexture;\n\
      uniform sampler2D depthTexture;\n\
      uniform float visibility;\n\
      uniform vec4 fogColor;\n\
      in vec2 v_textureCoordinates; \n\
      out vec4 fragColor;\n\
      void main(void) \n\
      { \n\
         vec4 origcolor = texture(colorTexture, v_textureCoordinates); \n\
         float depth = czm_readDepth(depthTexture, v_textureCoordinates); \n\
         vec4 depthcolor = texture(depthTexture, v_textureCoordinates); \n\
         float f = visibility * (depthcolor.r - 0.3) / 0.2; \n\
         if (f < 0.0) f = 0.0; \n\
         else if (f > 1.0) f = 1.0; \n\
         fragColor = mix(origcolor, fogColor, f); \n\
      }\n',
      uniforms: {
        visibility: () => {
          return 0.1
        },
        fogColor: () => {
          return new Cesium.Color(0.8, 0.8, 0.8, 0.5)
        }
      }
      // name: 'foggy_webgl2',
      // fragmentShader: `
      //       uniform sampler2D colorTexture;
      //       uniform sampler2D depthTexture;
      //       in vec2 v_textureCoordinates;
      //       uniform float vfog;

      //       void main(void)
      //       {
      //           vec4 origcolor=texture(colorTexture, v_textureCoordinates);
      //           vec4 fogcolor=vec4(0.8,0.8,0.8,0.5);
      //           float depth = czm_readDepth(depthTexture, v_textureCoordinates);
      //           vec4 depthcolor=texture(depthTexture, v_textureCoordinates);
      //           float f=(depthcolor.r-0.22)/vfog;
      //           if(f<0.0) f=0.0;
      //           else if(f>1.0) f=1.0;
      //           out_FragColor = mix(origcolor,fogcolor,f);
      //       }
      //       `,
      // uniforms: {
      //   vfog: function () {
      //     return 0.5 // 强度
      //   }
      // },
    }
  }
}

class BasePostProcessStage {
  viewer: Cesium.Viewer
  state: string
  postProcessStage: Cesium.PostProcessStageComposite | Cesium.PostProcessStage
  name: string

  constructor(viewer) {
    this.viewer = viewer
  }

  init() {
    // this.postProcessStage.enabled = false;
    this.enabled = false

    this.viewer.scene.postProcessStages.add(this.postProcessStage)

    this.state = 'init'
  }

  set enabled(newvVal) {
    this.postProcessStage.enabled = newvVal
  }

  get enabled() {
    return this.postProcessStage.enabled
  }

  clear() {
    this.viewer.scene.postProcessStages.remove(this.postProcessStage)
    this.postProcessStage = undefined

    this.state = 'clear'
  }
}

export class Skyline extends BasePostProcessStage {
  constructor(viewer) {
    super(viewer)

    let edgeDetection = Cesium.PostProcessStageLibrary.createEdgeDetectionStage()
    let extractGlobe = new Cesium.PostProcessStage({
      fragmentShader: `
        uniform sampler2D colorTexture;
        uniform sampler2D depthTexture;
        in vec2 v_textureCoordinates;

        out vec4 fragColor;

        void main(void) {

            float depth = czm_readDepth(depthTexture, v_textureCoordinates);
            vec4 color = texture(colorTexture, v_textureCoordinates);
            if(depth < 1.0 - 0.000001) {
                fragColor = color;
            } else {
                fragColor = vec4(1.0, 0.0, 0.0, 1.0);
            }

        }
        `
    })
    let synthesizer = new Cesium.PostProcessStage({
      uniforms: {
        redTexture: extractGlobe.name,
        silhouetteTexture: edgeDetection.name
      },
      fragmentShader: `
        uniform sampler2D colorTexture;
        in vec2 v_textureCoordinates;

        uniform sampler2D redTexture;
        uniform sampler2D silhouetteTexture;

        out vec4 fragColor;

        void main(void) {

            vec4 redcolor = texture(redTexture, v_textureCoordinates);
            vec4 silhouetteColor = texture(silhouetteTexture, v_textureCoordinates);
            vec4 color = texture(colorTexture, v_textureCoordinates);

            if(redcolor.r == 1.0) {
                fragColor = mix(color, vec4(1.0, 0.0, 0.0, 1.0), silhouetteColor.a);
            } else {
                fragColor = color;
            }
        }
        `
    })
    this.postProcessStage = new Cesium.PostProcessStageComposite({
      stages: [edgeDetection, extractGlobe, synthesizer],
      inputPreviousStageTexture: false,
      uniforms: edgeDetection.uniforms
    })

    this.name = 'skyline'
    this.init()
  }
}

export class Rain extends BasePostProcessStage {
  constructor(viewer) {
    super(viewer)

    this.postProcessStage = new Cesium.PostProcessStage(WeatherConfig.rain.webgl2)

    this.name = 'rain'
    this.init()
  }
}

export class Snow extends BasePostProcessStage {
  constructor(viewer) {
    super(viewer)

    this.postProcessStage = new Cesium.PostProcessStage(WeatherConfig.snow.webgl2)

    this.name = 'snow'
    this.init()
  }
}

export class Foggy extends BasePostProcessStage {
  constructor(viewer) {
    super(viewer)

    this.postProcessStage = new Cesium.PostProcessStage(WeatherConfig.foggy.webgl2)

    this.name = 'foggy'
    this.init()
  }
}
