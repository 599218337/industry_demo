import * as Cesium from 'cesium'

import GaussianBlur1D from '../glsl/GaussianBlur1D.glsl'

export function createBlur(name, opt = { delta: 1.0, sigma: 2.0, stepSize: 1.0 }) {
  let blurUni = opt
  let blurFS = GaussianBlur1D
  let blur_x = new Cesium.PostProcessStage({
    name: `${name}_blur_x`,
    fragmentShader: blurFS,
    uniforms: {
      ...blurUni,
      direction: 0.0
    }
  })
  let blur_y = new Cesium.PostProcessStage({
    name: `${name}_blur_y`,
    fragmentShader: blurFS,
    uniforms: {
      ...blurUni,
      direction: 1.0
    }
  })

  return new Cesium.PostProcessStageComposite({
    name: `${name}_blur_com`,
    stages: [blur_x, blur_y]
  })
}

export class Target {
  viewer: Cesium.Viewer
  postProcessStage: Cesium.PostProcessStage | Cesium.PostProcessStageComposite
  state: string
  constructor(viewer) {
    this.viewer = viewer
    this.postProcessStage
    this.state = 'init'
  }
  init(postProcessStage) {
    this.postProcessStage = postProcessStage
    this.postProcessStage.selected = []
    this.postProcessStage.enabled = false // default true，Whether or not to execute this post-process stage when ready

    this.viewer.scene.postProcessStages.add(postProcessStage)
  }
  handleClick(pickedObject) {
    if (Cesium.defined(pickedObject)) {
      const selected = []

      if (pickedObject.id) {
        /* 点击Entity */
        let id = pickedObject.id._id
        pickedObject.primitive._pickIds.forEach(item => {
          if (item.object.id._id === id) {
            selected.push({
              pickId: item
            })
          }
        })
      } else {
        /* 点击Primitive */
        pickedObject.primitive._pickIds.forEach(item => {
          selected.push({
            pickId: item
          })
        })
      }

      this.postProcessStage.selected = selected
      this.postProcessStage.enabled = true
    } else {
      this.postProcessStage.selected = []
      this.postProcessStage.enabled = false
    }
  }
  clear() {
    this.viewer.scene.postProcessStages.remove(this.postProcessStage)
    this.postProcessStage = undefined
    this.state = 'clear'
  }
}
