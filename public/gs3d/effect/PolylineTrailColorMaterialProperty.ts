/*
 * 与PolylineTrailMaterialProperty类似
 * 区别：传入颜色，效果与颜色进行混合，效果色为混合色
 */
import * as Cesium from 'cesium'

class PolylineTrailColorMaterialProperty {
  _definitionChanged: Cesium.Event
  _color: any
  _colorSubscription: any
  _image: any
  _imageSubscription: any
  _duration: any
  _durationSubscription: any

  image: any
  color: any
  duration: any
  _time: any

  constructor(options) {
    Object.defineProperties(this, {
      isConstant: {
        get: function () {
          return (Cesium.Property as any).isConstant(this._image)
        }
      },

      definitionChanged: {
        get: function () {
          return this._definitionChanged
        }
      },

      image: (Cesium as any).createPropertyDescriptor('image'),

      color: (Cesium as any).createPropertyDescriptor('color'),

      duration: (Cesium as any).createPropertyDescriptor('duration')
    })

    options = Cesium.defaultValue(options, (Cesium.defaultValue as any).EMPTY_OBJECT)

    this._definitionChanged = new Cesium.Event()

    this._image = undefined
    this._imageSubscription = undefined
    this._color = undefined
    this._colorSubscription = undefined
    this._duration = undefined
    this._durationSubscription = undefined

    this.image = options.image
    this.color = options.color
    this.duration = options.duration

    this._time = performance.now()
  }

  getType(time) {
    return 'PolylineTrailColor'
  }

  getValue(time, result) {
    if (!Cesium.defined(result)) {
      result = {}
    }

    result.image = (Cesium.Property as any).getValueOrUndefined(this._image, time)
    result.color = (Cesium.Property as any).getValueOrClonedDefault(this._color, time, Cesium.Color.WHITE, result.color)
    result.duration = (Cesium.Property as any).getValueOrDefault(this._duration, time, 1000)

    result.time = ((performance.now() - this._time) % this.duration) / this.duration

    return result
  }

  equals(other) {
    return (
      this === other ||
      (other instanceof PolylineTrailColorMaterialProperty &&
        (Cesium.Property as any).equals(this._image, other._image) &&
        (Cesium.Property as any).equals(this._color, other._color) &&
        (Cesium.Property as any).equals(this._duration, other._duration))
    )
  }
}

;(Cesium.Material as any)._materialCache.addMaterial('PolylineTrailColor', {
  fabric: {
    type: 'PolylineTrailColor',
    uniforms: {
      color: Cesium.Color.WHITE,
      image: '',
      time: 0
    },
    /* 传入颜色混合图片颜色，效果一 */
    source: `
    czm_material czm_getMaterial(czm_materialInput materialInput){
      czm_material material = czm_getDefaultMaterial(materialInput);
      vec2 st = materialInput.st;
      vec4 colorImage = texture(image, vec2(fract(st.s - time), st.t));
      material.alpha = colorImage.a * color.a;
      material.diffuse = (colorImage.rgb+color.rgb)/2.0;
      return material;
    }
    `
    /* 传入颜色混合图片颜色，效果二 */
    // source: `
    // czm_material czm_getMaterial(czm_materialInput materialInput){
    //     czm_material material = czm_getDefaultMaterial(materialInput);
    //     vec2 st = materialInput.st;

    //     if(texture(image, vec2(0.0, 0.0)).a == 1.0){
    //         discard;
    //     }else{
    //         material.alpha = texture(image, vec2(1.0 - fract(time - st.s), st.t)).a * color.a;
    //     }

    //     material.diffuse = max(color.rgb * material.alpha * 3.0, color.rgb);
    //     return material;
    // }
    // `,
  },
  translucent: function () {
    return true
  }
})

export default PolylineTrailColorMaterialProperty
