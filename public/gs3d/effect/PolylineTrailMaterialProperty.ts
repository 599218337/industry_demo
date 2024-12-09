/*
 * 与PolylineTrailColorMaterialProperty类似
 * 区别：不传入颜色，效果不与颜色进行混合，效果色以图片色为准
 */
import * as Cesium from 'cesium'

class PolylineTrailMaterialProperty {
  _definitionChanged: Cesium.Event
  _image: any
  _imageSubscription: any
  _rgbMultiple: any
  _rgbMultipleSubscription: any
  _duration: any
  _durationSubscription: any

  image: any
  rgbMultiple: any
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
      rgbMultiple: (Cesium as any).createPropertyDescriptor('rgbMultiple'),
      duration: (Cesium as any).createPropertyDescriptor('duration')
    })

    this._definitionChanged = new Cesium.Event()

    this._image = undefined
    this._imageSubscription = undefined
    this._rgbMultiple = undefined
    this._rgbMultipleSubscription = undefined
    this._duration = undefined
    this._durationSubscription = undefined

    this.image = options.image
    this.rgbMultiple = options.rgbMultiple
    this.duration = options.duration

    this._time = performance.now()
  }

  getType(time) {
    return 'PolylineTrail'
  }

  getValue(time, result) {
    if (!Cesium.defined(result)) {
      result = {}
    }

    result.image = (Cesium.Property as any).getValueOrUndefined(this._image, time)
    result.rgbMultiple = (Cesium.Property as any).getValueOrDefault(this._rgbMultiple, time, 1.0)
    result.duration = (Cesium.Property as any).getValueOrDefault(this._duration, time, 1000)

    result.time = ((performance.now() - this._time) % this.duration) / this.duration

    return result
  }

  equals(other) {
    return (
      this === other ||
      (other instanceof PolylineTrailMaterialProperty &&
        (Cesium.Property as any).equals(this._image, other._image) &&
        (Cesium.Property as any).equals(this._rgbMultiple, other._rgbMultiple) &&
        (Cesium.Property as any).equals(this._duration, other._duration))
    )
  }
}

;(Cesium.Material as any)._materialCache.addMaterial('PolylineTrail', {
  fabric: {
    type: 'PolylineTrail',
    uniforms: {
      image: '',
      rgbMultiple: 1.0,
      time: 0
    },
    source: `
    czm_material czm_getMaterial(czm_materialInput materialInput) {
        czm_material material = czm_getDefaultMaterial(materialInput);

        vec2 st = materialInput.st;
        vec4 colorImage = texture(image, vec2(fract(st.s - time), st.t));
        material.alpha = colorImage.a;

        // material.diffuse入射光 倍率越大线越亮 倍率越小线越暗
        material.diffuse = colorImage.rgb * rgbMultiple ;

        return material;
    }
    `
  },
  translucent: function () {
    return true
  }
})

export default PolylineTrailMaterialProperty
