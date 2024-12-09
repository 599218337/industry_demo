import * as Cesium from 'cesium'
import { levelSize } from '../grid/util/levelSize'

export class InvertMask {
  viewer: Cesium.Viewer
  opt: any
  dataSource: Cesium.DataSource
  bbox: any
  state: string
  constructor(viewer, opt) {
    this.viewer = viewer
    this.opt = {
      extent: { xmin: 73.0, xmax: 136.0, ymin: 3.0, ymax: 59.0 },
      fill: Cesium.Color.fromCssColorString('rgb(2,26,79)').withAlpha(0.8),
      ...opt
    }

    this.dataSource
    this.bbox

    this.state = 'init'
  }
  draw() {
    if (!this.opt.data || this.opt.data.length <= 3) return
    let { extent, data, fill } = this.opt
    let geojson = {
      type: 'Feature',
      geometry: {
        type: 'MultiPolygon',
        coordinates: [
          [
            [
              [extent.xmin, extent.ymin],
              [extent.xmax, extent.ymin],
              [extent.xmax, extent.ymax],
              [extent.xmin, extent.ymax],
              [extent.xmin, extent.ymin]
            ], // 实际绘面
            data // 实际挖空面
          ]
        ]
      }
    }
    let geoPromise = Cesium.GeoJsonDataSource.load(geojson, {
      fill,
      clampToGround: true
    })
    geoPromise.then(dataSource => {
      // 添加geojson
      this.viewer.dataSources.add(dataSource)
      this.dataSource = dataSource

      // 视角跳转至geojson
      // viewer.flyTo(dataSource.entities.values);

      this.state = 'draw'
    })
  }

  flyTo() {
    if (!this.bbox && this.state === 'draw') {
      let bboxCounter = new levelSize.BBOXCounter()
      let { data } = this.opt
      data.forEach(item => {
        bboxCounter.update(item[0], item[1])
      })
      this.bbox = bboxCounter.result()
    }
    if (this.bbox) {
      function flyToBBOX(viewer, bboxArr, offset = 0.03) {
        let [minLng, minLat, maxLng, maxLat] = bboxArr
        let extentRectangle = Cesium.Rectangle.fromDegrees(minLng - offset, minLat - offset, maxLng + offset, maxLat + offset)
        viewer.camera.flyTo({
          destination: extentRectangle
        })
      }
      flyToBBOX(this.viewer, this.bbox)
    }
  }

  clear() {
    this.viewer.dataSources.remove(this.dataSource)
    this.dataSource = undefined
    this.state = 'clear'
  }
}
