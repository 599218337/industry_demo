import * as Cesium from 'cesium'

import { common } from '../../util/common'

import rippleImage from '../../gs3d-assets/image/effect/redCircle.png'

class RippleColorMaterialProperty extends Cesium.ImageMaterialProperty {
  constructor(options) {
    super(options)
  }
  getType(time) {
    return 'RippleColor'
  }
}

;(Cesium.Material as any)._materialCache.addMaterial('RippleColor', {
  fabric: {
    type: 'RippleColor',
    uniforms: {
      color: Cesium.Color.WHITE,
      image: ''
    },
    source: `
czm_material czm_getMaterial(czm_materialInput materialInput){
czm_material material = czm_getDefaultMaterial(materialInput);
material.alpha =  color.a;
material.diffuse = color.rgb;
return material;
}
`
  },
  translucent: function () {
    return true
  }
})

export default class Ripple {
  viewer: Cesium.Viewer
  options: any
  entity: Cesium.Entity
  state: string

  constructor(viewer, opt = null) {
    this.viewer = viewer
    this.options = {
      id: common.getUuid(10),
      radius: [0, 3000],
      image: rippleImage,
      height: 0,
      position: [116, 39, 0],
      deviation: 20,
      color: Cesium.Color.BLUE,
      show: true,
      ...opt
    }

    this.entity = undefined
    this.state = 'init'
  }

  /**
   *
   * @param {*} options 配置参数
   * @example
   * draw({
   *  id: uuid,
   *  radius: [min, max],
   *  image: url or base64,
   *  height: 0,
   *  deviation:20,
   *  position: [lng, lat, height]
   *  color:Cesium.Color.BLUE
   * })
   *
   */

  draw() {
    let { id, radius, image, height, position, deviation, show, color } = this.options

    let _r = radius[0]
    const changeRadius = () => {
      _r = _r + deviation
      if (_r >= radius[1]) {
        _r = radius[0]
      }
      return _r
    }
    const getRadius = () => {
      return _r
    }

    this.entity = this.viewer.entities.add({
      id: id,
      position: Cesium.Cartesian3.fromDegrees(position[0], position[1], position.length > 2 ? position[2] : 0),
      show,
      ellipse: {
        semiMinorAxis: new Cesium.CallbackProperty(getRadius, false),
        semiMajorAxis: new Cesium.CallbackProperty(changeRadius, false),
        height,
        material: new RippleColorMaterialProperty({
          image,
          repeat: new Cesium.Cartesian2(1.0, 1.0),
          transparent: true,
          color: new Cesium.CallbackProperty(() => {
            return color.withAlpha(1 - _r / radius[1]) //entity的颜色透明 并不影响材质，并且 entity也会透明哦
          }, false)
        })
        // material: new Cesium.ImageMaterialProperty({
        //   image,
        //   repeat: new Cesium.Cartesian2(1.0, 1.0),
        //   transparent: true,
        //   color: new Cesium.CallbackProperty(() => {
        //     return Cesium.Color.WHITE.withAlpha(1 - _r / radius[1]); //entity的颜色透明 并不影响材质，并且 entity也会透明哦
        //   }, false),
        // }),
      }
    })

    this.state = 'draw'
  }

  flyTo(range = 200) {
    let offset = {
      heading: Cesium.Math.toRadians(0.0),
      pitch: Cesium.Math.toRadians(-45),
      range: range
    }
    this.viewer.flyTo(this.entity, { offset })
  }

  clear() {
    this.entity && this.viewer.entities.remove(this.entity)
    this.entity = null

    this.state = 'clear'
  }

  show() {
    let { show } = this.options
    if (!show && this.entity) {
      this.entity.show = true
      this.options.show = true
    }
  }

  hide() {
    let { show } = this.options
    if (show && this.entity) {
      this.entity.show = false
      this.options.show = false
    }
  }
}
