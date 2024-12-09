import * as Cesium from 'cesium'

class CircleDiffuseMaterialProperty {
  _definitionChanged: Cesium.Event
  _color: any
  _colorSubscription: any
  _speed: any
  _speedSubscription: any

  color: any
  speed: any

  _time: any

  constructor(options) {
    Object.defineProperties(this, {
      isConstant: {
        get: function () {
          return (Cesium.Property as any).isConstant(this._color)
        }
      },
      definitionChanged: {
        get: function () {
          return this._definitionChanged
        }
      },
      color: (Cesium as any).createPropertyDescriptor('color'),
      speed: (Cesium as any).createPropertyDescriptor('speed')
    })

    this._definitionChanged = new Cesium.Event()

    this._color = undefined
    this._colorSubscription = undefined
    this._speed = undefined
    this._speedSubscription = undefined

    this.color = options.color
    this.speed = options.speed

    this._time = performance.now()
  }

  getType(time) {
    return 'CircleDiffuse'
  }

  getValue(time, result) {
    if (!Cesium.defined(result)) {
      result = {}
    }

    result.color = (Cesium.Property as any).getValueOrClonedDefault(this._color, time, Cesium.Color.WHITE, result.color)
    result.speed = (Cesium.Property as any).getValueOrDefault(this._speed, time, 1000)

    return result
  }

  equals(other) {
    return (
      this === other || (other instanceof CircleDiffuseMaterialProperty && (Cesium.Property as any).equals(this._speed, other._speed) && (Cesium.Property as any).equals(this._color, other._color))
    )
  }
}

;(Cesium.Material as any)._materialCache.addMaterial('CircleDiffuse', {
  fabric: {
    type: 'CircleDiffuse',
    uniforms: {
      color: Cesium.Color.RED,
      speed: 500,

      percent: 5,
      center: {
        x: 0.5,
        y: 0.5
      }
    },
    source: `
    czm_material czm_getMaterial(czm_materialInput materialInput){
        czm_material material = czm_getDefaultMaterial(materialInput);
        vec2 st = materialInput.st; 
        
        vec2 center = vec2(center.x,center.y);
        float dis = distance(st, center); 

        material.diffuse = color.rgb;

        material.alpha = pow(fract(dis*1.0-fract(czm_frameNumber/speed)),float(percent));
        
        return material;
    }
    `
  },
  translucent: function () {
    return true
  }
})

export default CircleDiffuseMaterialProperty
