import { common } from './common'
import { arcgisQuery } from './arcgisQuery'
import { checkData } from './checkData'
import { coordinateTransform } from './coordinateTransform'
import { esrijson2geojson } from './esrijson2geojson'
import { esrijsonLoader } from './esrijsonLoader'
import { geojson2esrijson } from './geojson2esrijson'
import { geojsonLoader } from './geojsonLoader'
import { fileLoader } from './fileLoader'
import { formatData } from './formatData'
import { serviceRequest } from './serviceRequest'

const describe = '地图GIS共享相关'

export { describe, common, arcgisQuery, checkData, coordinateTransform, esrijson2geojson, esrijsonLoader, geojson2esrijson, geojsonLoader, fileLoader, formatData, serviceRequest }
