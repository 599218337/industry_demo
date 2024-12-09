import * as Cesium from 'cesium'

import { Target } from './target'
import createEdgeStage from './edge/createEdgeStage'

/* 方法内有一套注释是webgl1版的 */
export class EdgeTarget extends Target {
  constructor(viewer) {
    super(viewer)

    const edgeStage = createEdgeStage()
    edgeStage.visibleEdgeColor = Cesium.Color.fromCssColorString('#bf7575') // #a8a8e0
    edgeStage.hiddenEdgeColor = Cesium.Color.fromCssColorString('#75bf9b') // #4d4d4d

    /* 原生描边 */
    // const edgeStage =
    //   Cesium.PostProcessStageLibrary.createSilhouetteStage();
    // edgeStage.selected = [];
    // edgeStage.enabled = false;

    this.init(edgeStage)
  }
  handleClick(picked) {
    /* 设置后期处理的选中目标 */
    this.postProcessStage.selected = []
    this.postProcessStage.enabled = false

    if (picked && picked.primitive) {
      let primitive = picked.primitive
      let pickIds = primitive._pickIds
      let pickId = picked.pickId

      if (!pickId && !pickIds && picked.content) {
        pickIds = picked.content._model._pickIds
      }

      if (!pickId) {
        if (picked.id) {
          pickId = pickIds.find(pickId => {
            return pickId.object == picked
          })
        } else if (pickIds) {
          pickId = pickIds[0]
        }
      }

      if (pickId) {
        let pickObject = {
          pickId: pickId
        }
        this.postProcessStage.selected = [pickObject]
        this.postProcessStage.enabled = true
      } else {
        console.log('未找到pickId')
      }
    }
  }
}
