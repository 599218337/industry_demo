import * as Cesium from 'cesium'
import { GS3DConfig } from '../gs3d-assets/gs3dConfig'

export namespace variable {
  export let viewer = {} as Cesium.Viewer & { [key: string]: any }
  export let gs3dAllLayer: any[] = []
  export let gs3dConfig = GS3DConfig
  export const describe: string = '变量'
}
