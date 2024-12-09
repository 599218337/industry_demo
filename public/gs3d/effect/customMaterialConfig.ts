import * as Cesium from 'cesium'

// shader
import flowLineWallUDSource from './glsl/flowLineWallUDSource.glsl'
import flowLineWallLRSource from './glsl/flowLineWallLRSource.glsl'
import flowLightLineSource from './glsl/flowLightLineSource.glsl'
import rippleSource from './glsl/rippleSource.glsl'

// 图片
import flowLineWallImage from '../gs3d-assets/image/effect/trail_red.png'

export namespace CustomMaterialConfig {
  export const flowLineWallUD = {
    uniforms: {
      color: Cesium.Color.fromCssColorString('rgba(0, 255, 255, 1)'),
      speed: 0.5,
      image: flowLineWallImage
    },
    source: flowLineWallUDSource
  }
  export const flowLineWallLR = {
    uniforms: {
      color: Cesium.Color.fromCssColorString('rgba(0, 255, 255, 1)'),
      speed: 0.5,
      image: flowLineWallImage
    },
    source: flowLineWallLRSource
  }
  export const flowLightLine = {
    uniforms: {
      color: Cesium.Color.PINK, // light color
      speed: 0.5, // flowing speed, speed > 0.0
      headsize: 0.05, // 0.0 < headsize < 1.0
      tailsize: 0.5, // 0.0 < tailsize < 1.0
      widthoffset: 0.1, // 0.0 < widthoffset < 1.0
      coresize: 0.05 // 0.0 < coresize < 1.0
    },
    source: flowLightLineSource
  }
  export const radarScan = {
    uniforms: {
      color: Cesium.Color.PINK
    },
    source: `
    #define L      length( c - .1 * vec2(
      // use: L x,y))    
      #define M(v)   max(0., v)
  
      czm_material czm_getMaterial(czm_materialInput materialInput){
        czm_material m = czm_getDefaultMaterial(materialInput);
        vec2 uv = materialInput.st;
        vec2 c = uv + uv - 1.0;
        vec2 k = .1 - .1 * step(.007,abs(c));
  
        // x,y - polar coords
        float x = L 0)) * 25., 
              iTime = czm_frameNumber * 0.01,
              y = mod(atan(c.y, c.x)+iTime, 6.28),
              d = M(.75 - y * .4),
              b = min( min(L -3,-1)), L 6,-4)) ), L 4,5)) ) + .06 - y * .04;
        
        float result = (x < 24. ? .25 + M(cos(x + .8) - .95) * 8.4 + k.x + k.y + d * d+ M(.8 - y * (x + x + .3)): 0.) + M(1. - abs(x + x - 48.));
        
        // m.diffuse = vec3(0.0, result, 0.1);
        m.diffuse = color.rgb;
        m.alpha = result;
        return m;
      }
    `
  }
  export const ripple = {
    uniforms: {
      color: Cesium.Color.PINK
    },
    source: rippleSource
  }
}
