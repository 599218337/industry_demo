import * as Cesium from 'cesium'
import { CustomMaterialConfig } from './customMaterialConfig'
export function addRoadNet({ viewer, features, options }: { viewer: any; features: any; options?: any }) {
  const { width = 2, color = 'rgba(255,255,255,0.1)', flowColor = 'green', speed = 5, repeat = 3, headsize = 0.5, tailsize = 0.5, widthoffset = 0.5, coresize = 0.05 } = options || {}
  const instances = []
  for (let i = 0; i < features.length; i++) {
    for (let j = 0; j < features[i].geometry.coordinates.length; j++) {
      const positions = Cesium.Cartesian3.fromDegreesArray(features[i].geometry.coordinates[j].flat())
      const polyline = new Cesium.PolylineGeometry({
        positions: positions,
        width,
        vertexFormat: Cesium.PolylineMaterialAppearance.VERTEX_FORMAT
      })
      const polygon = new Cesium.GeometryInstance({
        geometry: polyline,
        id: i
      })
      instances.push(polygon)
    }
  }
  let material = new Cesium.Material({
    fabric: {
      uniforms: {
        speed,
        repeat,
        color: Cesium.Color.fromCssColorString(color), // 线段颜色
        flowColor: Cesium.Color.fromCssColorString(flowColor) // 流光颜色
        // headsize, // 0.0 < headsize < 1.0
        // tailsize, // 0.0 < tailsize < 1.0
        // widthoffset // 0.0 < widthoffset < 1.0
      },
      source: /* glsl */ `
      uniform vec4 color;
      uniform vec4 flowColor;
      uniform float speed;
      uniform float repeat;
      czm_material czm_getMaterial(czm_materialInput materialInput) {
        czm_material material = czm_getDefaultMaterial(materialInput);

        //st.s纵向 st.t横向
        vec2 st = materialInput.st;
        float time = fract(czm_frameNumber * speed / 1000.0 );
        float offset = fract(st.x * repeat - time);
        // float offset = fract(st.x * repeat);
        //mix混合 smoothstep样条插值
        // vec4 mixColor = mix(color, flowColor, smoothstep(1.0 - offset, 1.0 + offset, st.s));
        float lineRepeat = smoothstep(1.0 - offset, 1.0 + offset, st.s);
        // float lineLength = smoothstep(time + headsize, time, st.x) - smoothstep(time, time - tailsize, st.x);
        // float lineLength = smoothstep(1.0 + headsize, 1.0, st.x) - smoothstep(1.0, 1.0 - tailsize, st.x);
        // float lineWidth = smoothstep(widthoffset, 0.5, st.y) - smoothstep(0.5, 1.0 - widthoffset, st.y);
        vec4 ackColor = mix(color, flowColor, lineRepeat );

        // material.diffuse = flowColor.xyz+ackColor.rgb;
        material.diffuse = flowColor.xyz + ackColor.xyz * ackColor.w * 0.8 ;
        material.alpha = ackColor.a;
        material.emission = ackColor.rgb * 0.8;
        return material;
      }
  `
    }
  })

  let flowLightLineP = new Cesium.Primitive({
    geometryInstances: instances,
    appearance: new Cesium.PolylineMaterialAppearance({
      material: material
    })
  })

  viewer.scene.primitives.add(flowLightLineP)

  //         let material = new Cesium.Material({
  //           fabric: {
  //             uniforms: {
  //               color: Cesium.Color.fromCssColorString(color), // light color
  //               speed, // flowing speed, speed > 0.0
  //               headsize, // 0.0 < headsize < 1.0
  //               tailsize, // 0.0 < tailsize < 1.0
  //               widthoffset, // 0.0 < widthoffset < 1.0
  //               coresize // 0.0 < coresize < 1.0
  //             },
  //             source: `
  //             float SPEED_STEP = 0.01;

  // vec4 drawLight(float xPos, vec2 st, float headOffset, float tailOffset, float widthOffset) {

  //   float lineLength = smoothstep(xPos + headOffset, xPos, st.x) - smoothstep(xPos, xPos - tailOffset, st.x);
  //   float lineWidth = smoothstep(widthOffset, 0.5, st.y) - smoothstep(0.5, 1.0 - widthOffset, st.y);
  //   float time = fract(czm_frameNumber * speed * SPEED_STEP);
  //   float offset = fract(st.s*3.0 - time);
  //   float lineRepeat = smoothstep(1.0 - offset, 1.0 + offset, st.s);
  //   return vec4(lineLength * lineWidth*lineRepeat);
  // }

  // czm_material czm_getMaterial(czm_materialInput materialInput) {
  //   vec4 v4_core;
  //   vec4 v4_color;
  //   float xPos = 0.0;

  //   czm_material m = czm_getDefaultMaterial(materialInput);
  //   float sinTime = sin(czm_frameNumber * SPEED_STEP * speed);
  //   if(sinTime < 0.0) {
  //     xPos = cos(czm_frameNumber * SPEED_STEP * speed) + 1.0 - tailsize;
  //   } else {
  //     xPos = -cos(czm_frameNumber * SPEED_STEP * speed) + 1.0 - tailsize;
  //   }

  //   v4_color = drawLight(xPos, materialInput.st, headsize, tailsize, widthoffset);
  //   v4_core = drawLight(xPos, materialInput.st, coresize, coresize * 2.0, widthoffset * 2.0);

  //   m.diffuse = color.xyz + v4_core.xyz * v4_core.w * 0.8;
  //   m.alpha = pow(v4_color.w, 3.0);
  //   return m;
  // }

  //             `
  //           }
  //         })

  //         let flowLightLineP = new Cesium.Primitive({
  //           geometryInstances: instances,
  //           appearance: new Cesium.PolylineMaterialAppearance({
  //             material: material
  //           })
  //         })

  //         viewer.scene.primitives.add(flowLightLineP)

  // let material = new Cesium.Material({
  //   fabric: {
  //     uniforms: {
  //       // color: new Cesium.Color(0.0, 1.0, 0.0, 0.5), // light color
  //       color: Cesium.Color.fromCssColorString('rgba(255,0,0,.2)'), // 线段颜色
  //       flowColor: Cesium.Color.fromCssColorString('rgba(255, 255, 0,1)'), // 流光颜色
  //       speed: 0.2, // flowing speed, speed > 0.0
  //       headsize: 0.01, // 0.0 < headsize < 1.0
  //       tailsize: 0.2, // 0.0 < tailsize < 1.0
  //       widthoffset: 0.1, // 0.0 < widthoffset < 1.0
  //       coresize: 0.05, // 0.0 < coresize < 1.0
  //       repeat: 3
  //     },
  //     source: /* glsl */          `
  //     float SPEED_STEP = 0.01;

  //     vec4 drawLight(float xPos, vec2 st, float headOffset, float tailOffset, float widthOffset) {

  //       float lineLength = smoothstep(xPos + headOffset, xPos, st.x) - smoothstep(xPos, xPos - tailOffset, st.x);
  //       float lineWidth = smoothstep(widthOffset, 0.5, st.y) - smoothstep(0.5, 1.0 - widthOffset, st.y);
  //       // float lineRepeat = fract(st.s*3.0 - fract(czm_frameNumber * SPEED_STEP * speed ));

  //       return vec4(lineLength * lineWidth);
  //     }

  //     czm_material czm_getMaterial(czm_materialInput materialInput) {
  //       vec4 v4_core;
  //       vec4 v4_color;
  //       float xPos = 0.0;

  //       czm_material m = czm_getDefaultMaterial(materialInput);
  //       float sinTime = sin(czm_frameNumber * SPEED_STEP * speed);
  //       if(sinTime < 0.0) {
  //         xPos = cos(czm_frameNumber * SPEED_STEP * speed) + 1.0 - tailsize;
  //       } else {
  //         xPos = -cos(czm_frameNumber * SPEED_STEP * speed) + 1.0 - tailsize;
  //       }

  //       v4_color = drawLight(xPos, materialInput.st, headsize, tailsize, widthoffset);
  //       v4_core = drawLight(xPos, materialInput.st, coresize, coresize * 2.0, widthoffset * 2.0);
  //       m.diffuse = color.xyz + v4_core.xyz * v4_core.w * 0.8;
  //       m.alpha = pow(v4_color.w, 3.0);
  //       return m;
  //     } `
  //   }
  // })

  // let flowLightLineP = new Cesium.Primitive({
  //   geometryInstances: instances,
  //   appearance: new Cesium.PolylineMaterialAppearance({
  //     material: material
  //   })
  // })

  // viewer.scene.primitives.add(flowLightLineP)

  // // 创建材质，在MaterialAppearance中若不添加基础材质，模型将会透明
  // let material = new Cesium.Material({
  //   fabric: {
  //     type: 'Color',
  //     uniforms: {
  //       color: Cesium.Color.fromCssColorString('rgba(255,255,255,.2)'), // 线段颜色
  //       flowColor: Cesium.Color.fromCssColorString('rgba(255, 255, 0,1)'), // 流光颜色
  //       speed: 0.1, // flowing speed, speed > 0.0
  //       headsize: 0.01, // 0.0 < headsize < 1.0
  //       tailsize: 0.2, // 0.0 < tailsize < 1.0
  //       widthoffset: 0.1, // 0.0 < widthoffset < 1.0
  //       coresize: 0.05, // 0.0 < coresize < 1.0
  //       repeat: 3
  //     }
  //   }
  // })
  // let flowLightLine = new Cesium.Primitive({
  //   geometryInstances: instances,
  //   appearance: new Cesium.PolylineMaterialAppearance({
  //     material: material,
  //     translucent: true,
  //     vertexShaderSource: `
  //       #define CLIP_POLYLINE
  //       void clipLineSegmentToNearPlane(
  //           vec3 p0,
  //           vec3 p1,
  //           out vec4 positionWC,
  //           out bool clipped,
  //           out bool culledByNearPlane,
  //           out vec4 clippedPositionEC
  //       ) {
  //           culledByNearPlane = false;
  //           clipped = false;
  //           vec3 p0ToP1 = p1 - p0;
  //           float magnitude = length(p0ToP1);
  //           vec3 direction = normalize(p0ToP1);
  //           float endPoint0Distance = czm_currentFrustum.x + p0.z;
  //           float denominator = -direction.z;
  //           if(endPoint0Distance > 0.0 && abs(denominator) < czm_epsilon7) {
  //               culledByNearPlane = true;
  //           } else if(endPoint0Distance > 0.0) {
  //               float t = endPoint0Distance / denominator;
  //               if(t < 0.0 || t > magnitude) {
  //                   culledByNearPlane = true;
  //               } else {
  //                   p0 = p0 + t * direction;
  //                   p0.z = min(p0.z, -czm_currentFrustum.x);
  //                   clipped = true;
  //               }
  //           }
  //           clippedPositionEC = vec4(p0, 1.0);
  //           positionWC = czm_eyeToWindowCoordinates(clippedPositionEC);
  //       }
  //       vec4 getPolylineWindowCoordinatesEC(vec4 positionEC, vec4 prevEC, vec4 nextEC, float expandDirection, float width, bool usePrevious, out float angle) {
  //       #ifdef POLYLINE_DASH
  //           vec4 positionWindow = czm_eyeToWindowCoordinates(positionEC);
  //           vec4 previousWindow = czm_eyeToWindowCoordinates(prevEC);
  //           vec4 nextWindow = czm_eyeToWindowCoordinates(nextEC);
  //           vec2 lineDir;
  //           if(usePrevious) {
  //               lineDir = normalize(positionWindow.xy - previousWindow.xy);
  //           } else {
  //               lineDir = normalize(nextWindow.xy - positionWindow.xy);
  //           }
  //           angle = atan(lineDir.x, lineDir.y) - 1.570796327;
  //           angle = floor(angle / czm_piOverFour + 0.5) * czm_piOverFour;
  //       #endif
  //           vec4 clippedPrevWC, clippedPrevEC;
  //           bool prevSegmentClipped, prevSegmentCulled;
  //           clipLineSegmentToNearPlane(prevEC.xyz, positionEC.xyz, clippedPrevWC, prevSegmentClipped, prevSegmentCulled, clippedPrevEC);
  //           vec4 clippedNextWC, clippedNextEC;
  //           bool nextSegmentClipped, nextSegmentCulled;
  //           clipLineSegmentToNearPlane(nextEC.xyz, positionEC.xyz, clippedNextWC, nextSegmentClipped, nextSegmentCulled, clippedNextEC);
  //           bool segmentClipped, segmentCulled;
  //           vec4 clippedPositionWC, clippedPositionEC;
  //           clipLineSegmentToNearPlane(positionEC.xyz, usePrevious ? prevEC.xyz : nextEC.xyz, clippedPositionWC, segmentClipped, segmentCulled, clippedPositionEC);
  //           if(segmentCulled) {
  //               return vec4(0.0, 0.0, 0.0, 1.0);
  //           }
  //           vec2 directionToPrevWC = normalize(clippedPrevWC.xy - clippedPositionWC.xy);
  //           vec2 directionToNextWC = normalize(clippedNextWC.xy - clippedPositionWC.xy);
  //           if(prevSegmentCulled) {
  //               directionToPrevWC = -directionToNextWC;
  //           } else if(nextSegmentCulled) {
  //               directionToNextWC = -directionToPrevWC;
  //           }
  //           vec2 thisSegmentForwardWC, otherSegmentForwardWC;
  //           if(usePrevious) {
  //               thisSegmentForwardWC = -directionToPrevWC;
  //               otherSegmentForwardWC = directionToNextWC;
  //           } else {
  //               thisSegmentForwardWC = directionToNextWC;
  //               otherSegmentForwardWC = -directionToPrevWC;
  //           }
  //           vec2 thisSegmentLeftWC = vec2(-thisSegmentForwardWC.y, thisSegmentForwardWC.x);
  //           vec2 leftWC = thisSegmentLeftWC;
  //           float expandWidth = width * 0.5;
  //           if(!czm_equalsEpsilon(prevEC.xyz - positionEC.xyz, vec3(0.0), czm_epsilon1) && !czm_equalsEpsilon(nextEC.xyz - positionEC.xyz, vec3(0.0), czm_epsilon1)) {
  //               vec2 otherSegmentLeftWC = vec2(-otherSegmentForwardWC.y, otherSegmentForwardWC.x);
  //               vec2 leftSumWC = thisSegmentLeftWC + otherSegmentLeftWC;
  //               float leftSumLength = length(leftSumWC);
  //               leftWC = leftSumLength < czm_epsilon6 ? thisSegmentLeftWC : (leftSumWC / leftSumLength);
  //               vec2 u = -thisSegmentForwardWC;
  //               vec2 v = leftWC;
  //               float sinAngle = abs(u.x * v.y - u.y * v.x);
  //               expandWidth = clamp(expandWidth / sinAngle, 0.0, width * 2.0);
  //           }
  //           vec2 offset = leftWC * expandDirection * expandWidth * czm_pixelRatio;
  //           return vec4(clippedPositionWC.xy + offset, -clippedPositionWC.z, 1.0) * (czm_projection * clippedPositionEC).w;
  //       }
  //       vec4 getPolylineWindowCoordinates(vec4 position, vec4 previous, vec4 next, float expandDirection, float width, bool usePrevious, out float angle) {
  //           vec4 positionEC = czm_modelViewRelativeToEye * position;
  //           vec4 prevEC = czm_modelViewRelativeToEye * previous;
  //           vec4 nextEC = czm_modelViewRelativeToEye * next;
  //           return getPolylineWindowCoordinatesEC(positionEC, prevEC, nextEC, expandDirection, width, usePrevious, angle);
  //       }

  //       in vec3 position3DHigh;
  //       in vec3 position3DLow;
  //       in vec3 prevPosition3DHigh;
  //       in vec3 prevPosition3DLow;
  //       in vec3 nextPosition3DHigh;
  //       in vec3 nextPosition3DLow;
  //       in vec2 expandAndWidth;
  //       in vec2 st;
  //       in float batchId;

  //       out float v_width;
  //       out vec2 v_st;
  //       out float v_polylineAngle;

  //       out vec4 v_positionEC;
  //       out vec3 v_normalEC;
  //       void main() {
  //           float expandDir = expandAndWidth.x;
  //           float width = abs(expandAndWidth.y) + 0.5;
  //           bool usePrev = expandAndWidth.y < 0.0;

  //           vec4 p = czm_computePosition();
  //           vec4 prev = czm_computePrevPosition();
  //           vec4 next = czm_computeNextPosition();

  //           float angle;
  //           vec4 positionWC = getPolylineWindowCoordinates(p, prev, next, expandDir, width, usePrev, angle);
  //           gl_Position = czm_viewportOrthographic * positionWC;

  //           v_width = width;
  //           v_st.s = st.s;
  //           v_st.t = st.t;
  //           // v_st.t = czm_writeNonPerspective(st.t, gl_Position.w);
  //           v_polylineAngle = angle;

  //           vec4 eyePosition = czm_modelViewRelativeToEye * p;
  //           v_positionEC = czm_inverseModelView * eyePosition;      // position in eye coordinates
  //           //v_normalEC = czm_normal * normal;                         // normal in eye coordinates
  //       }
  //     `,
  //     fragmentShaderSource: `
  //       in vec2 v_st;
  //       void main()
  //       {
  //           vec2 st = v_st;

  //           float xx = fract(st.s - czm_frameNumber/60.0 );
  //           float r = xx;
  //           float g = 200.0;
  //           float b = 200.0;
  //           float a = xx;

  //           out_FragColor = vec4(r,g,b,a);
  //       }
  //     `
  //   })
  // })

  // viewer.scene.primitives.add(flowLightLine)

  /*
    let flowLightLineP = new Cesium.Primitive({
      geometryInstances: instances,
      appearance: getFlylineMaterial(4),
      depthFailAppearance: getFlylineMaterial(),
      releaseGeometryInstances: false,
      compressVertices: false
    })

    viewer.scene.primitives.add(flowLightLineP)
    // 用着色器实例飞线材质
    function getFlylineMaterial (data) {
      // 创建材质，在MaterialAppearance中若不添加基础材质，模型将会透明
      let material = new Cesium.Material.fromType('Color')
      material.uniforms.color = Cesium.Color.ORANGE
      let fragmentShaderSource
      if (data === 1) {
        // 飞线效果-飞线间隔，宽度2
        fragmentShaderSource = `         
          in vec2 v_st;    
          void main()
          {
              vec2 st = v_st;

              float xx = fract(st.s - czm_frameNumber/60.0);
              float r = xx;
              float g = 200.0;
              float b = 200.0;
              float a = xx;

              out_FragColor = vec4(r,g,b,a);
          }
        `
      } else if (data === 2) {
        fragmentShaderSource = `
          in vec2 v_st;
          void main()
          {
              vec2 st = v_st;
              float xx = fract(st.s*2.0 - czm_frameNumber/60.0);
              float r = xx;
              float g = sin(czm_frameNumber/30.0);
              float b = cos(czm_frameNumber/30.0);
              float a = xx;
        
              out_FragColor = vec4(r,g,b,a);
          }
        `
      } else if (data === 3) {
        fragmentShaderSource = `
          in vec2 v_st;
          void main()
          {
              vec2 st = v_st;
              float xx = sin(st.s*6.0 -czm_frameNumber/5.0) - cos(st.t*6.0);
              float r = 0.0;
              float g = xx;
              float b = xx;
              float a = xx;
        
              out_FragColor = vec4(r,g,b,a);
          }
        `
      } else if (data === 4) {
        fragmentShaderSource = `
          in vec2 v_st;
          void main()
          {
              vec2 st = v_st;
              float xx = fract(st.s*10.0 + st.t  - czm_frameNumber/60.0);
              if (st.t<0.5) {
                  xx = fract(st.s*10.0 - st.t - czm_frameNumber/60.0);
              }
              float r = 0.0;
              float g = xx;
              float b = xx;
              float a = xx;
              if (st.t>0.8||st.t<0.2) {
                  g = 1.0;
                  b = 1.0;
                  a = 0.4;
              }
              out_FragColor = vec4(r,g,b,a);
          }
        `
      }
      // 自定义材质
      const aper = new Cesium.PolylineMaterialAppearance({
        material: material,
        translucent: true,
        vertexShaderSource: `
          #define CLIP_POLYLINE 
          void clipLineSegmentToNearPlane(
              vec3 p0,
              vec3 p1,
              out vec4 positionWC,
              out bool clipped,
              out bool culledByNearPlane,
              out vec4 clippedPositionEC
          ) {
              culledByNearPlane = false;
              clipped = false;
              vec3 p0ToP1 = p1 - p0;
              float magnitude = length(p0ToP1);
              vec3 direction = normalize(p0ToP1);
              float endPoint0Distance = czm_currentFrustum.x + p0.z;
              float denominator = -direction.z;
              if(endPoint0Distance > 0.0 && abs(denominator) < czm_epsilon7) {
                  culledByNearPlane = true;
              } else if(endPoint0Distance > 0.0) {
                  float t = endPoint0Distance / denominator;
                  if(t < 0.0 || t > magnitude) {
                      culledByNearPlane = true;
                  } else {
                      p0 = p0 + t * direction;
                      p0.z = min(p0.z, -czm_currentFrustum.x);
                      clipped = true;
                  }
              }
              clippedPositionEC = vec4(p0, 1.0);
              positionWC = czm_eyeToWindowCoordinates(clippedPositionEC);
          }
          vec4 getPolylineWindowCoordinatesEC(vec4 positionEC, vec4 prevEC, vec4 nextEC, float expandDirection, float width, bool usePrevious, out float angle) {
          #ifdef POLYLINE_DASH
              vec4 positionWindow = czm_eyeToWindowCoordinates(positionEC);
              vec4 previousWindow = czm_eyeToWindowCoordinates(prevEC);
              vec4 nextWindow = czm_eyeToWindowCoordinates(nextEC);
              vec2 lineDir;
              if(usePrevious) {
                  lineDir = normalize(positionWindow.xy - previousWindow.xy);
              } else {
                  lineDir = normalize(nextWindow.xy - positionWindow.xy);
              }
              angle = atan(lineDir.x, lineDir.y) - 1.570796327;
              angle = floor(angle / czm_piOverFour + 0.5) * czm_piOverFour;
          #endif
              vec4 clippedPrevWC, clippedPrevEC;
              bool prevSegmentClipped, prevSegmentCulled;
              clipLineSegmentToNearPlane(prevEC.xyz, positionEC.xyz, clippedPrevWC, prevSegmentClipped, prevSegmentCulled, clippedPrevEC);
              vec4 clippedNextWC, clippedNextEC;
              bool nextSegmentClipped, nextSegmentCulled;
              clipLineSegmentToNearPlane(nextEC.xyz, positionEC.xyz, clippedNextWC, nextSegmentClipped, nextSegmentCulled, clippedNextEC);
              bool segmentClipped, segmentCulled;
              vec4 clippedPositionWC, clippedPositionEC;
              clipLineSegmentToNearPlane(positionEC.xyz, usePrevious ? prevEC.xyz : nextEC.xyz, clippedPositionWC, segmentClipped, segmentCulled, clippedPositionEC);
              if(segmentCulled) {
                  return vec4(0.0, 0.0, 0.0, 1.0);
              }
              vec2 directionToPrevWC = normalize(clippedPrevWC.xy - clippedPositionWC.xy);
              vec2 directionToNextWC = normalize(clippedNextWC.xy - clippedPositionWC.xy);
              if(prevSegmentCulled) {
                  directionToPrevWC = -directionToNextWC;
              } else if(nextSegmentCulled) {
                  directionToNextWC = -directionToPrevWC;
              }
              vec2 thisSegmentForwardWC, otherSegmentForwardWC;
              if(usePrevious) {
                  thisSegmentForwardWC = -directionToPrevWC;
                  otherSegmentForwardWC = directionToNextWC;
              } else {
                  thisSegmentForwardWC = directionToNextWC;
                  otherSegmentForwardWC = -directionToPrevWC;
              }
              vec2 thisSegmentLeftWC = vec2(-thisSegmentForwardWC.y, thisSegmentForwardWC.x);
              vec2 leftWC = thisSegmentLeftWC;
              float expandWidth = width * 0.5;
              if(!czm_equalsEpsilon(prevEC.xyz - positionEC.xyz, vec3(0.0), czm_epsilon1) && !czm_equalsEpsilon(nextEC.xyz - positionEC.xyz, vec3(0.0), czm_epsilon1)) {
                  vec2 otherSegmentLeftWC = vec2(-otherSegmentForwardWC.y, otherSegmentForwardWC.x);
                  vec2 leftSumWC = thisSegmentLeftWC + otherSegmentLeftWC;
                  float leftSumLength = length(leftSumWC);
                  leftWC = leftSumLength < czm_epsilon6 ? thisSegmentLeftWC : (leftSumWC / leftSumLength);
                  vec2 u = -thisSegmentForwardWC;
                  vec2 v = leftWC;
                  float sinAngle = abs(u.x * v.y - u.y * v.x);
                  expandWidth = clamp(expandWidth / sinAngle, 0.0, width * 2.0);
              }
              vec2 offset = leftWC * expandDirection * expandWidth * czm_pixelRatio;
              return vec4(clippedPositionWC.xy + offset, -clippedPositionWC.z, 1.0) * (czm_projection * clippedPositionEC).w;
          }
          vec4 getPolylineWindowCoordinates(vec4 position, vec4 previous, vec4 next, float expandDirection, float width, bool usePrevious, out float angle) {
              vec4 positionEC = czm_modelViewRelativeToEye * position;
              vec4 prevEC = czm_modelViewRelativeToEye * previous;
              vec4 nextEC = czm_modelViewRelativeToEye * next;
              return getPolylineWindowCoordinatesEC(positionEC, prevEC, nextEC, expandDirection, width, usePrevious, angle);
          }

          in vec3 position3DHigh;
          in vec3 position3DLow;
          in vec3 prevPosition3DHigh;
          in vec3 prevPosition3DLow;
          in vec3 nextPosition3DHigh;
          in vec3 nextPosition3DLow;
          in vec2 expandAndWidth;
          in vec2 st;
          in float batchId;

          out float v_width;
          out vec2 v_st;
          out float v_polylineAngle;

          out vec4 v_positionEC;
          out vec3 v_normalEC;
          void main() {
              float expandDir = expandAndWidth.x;
              float width = abs(expandAndWidth.y) + 0.5;
              bool usePrev = expandAndWidth.y < 0.0;

              vec4 p = czm_computePosition();
              vec4 prev = czm_computePrevPosition();
              vec4 next = czm_computeNextPosition();

              float angle;
              vec4 positionWC = getPolylineWindowCoordinates(p, prev, next, expandDir, width, usePrev, angle);
              gl_Position = czm_viewportOrthographic * positionWC;

              v_width = width;
              v_st.s = st.s;
              v_st.t = st.t;
              // v_st.t = czm_writeNonPerspective(st.t, gl_Position.w);
              v_polylineAngle = angle;

              vec4 eyePosition = czm_modelViewRelativeToEye * p;
              v_positionEC = czm_inverseModelView * eyePosition;      // position in eye coordinates
              //v_normalEC = czm_normal * normal;                         // normal in eye coordinates
          }
        `,
        fragmentShaderSource: fragmentShaderSource
      })
      return aper
    }
    */
}
