import * as Cesium from 'cesium'
import { variable } from '../global/variable'
import { axios } from '../util/axios'
import { AxiosResponse } from 'axios'
import areaFeaturePick from '../tools/areaFeaturePick'

/**
 * @description arcgis查询
 */
export namespace arcgisQuery {
  /**
   * @description 查询基类
   */
  export class Base {
    /**
     * viewer 地球
     */
    viewer: Cesium.Viewer & { [key: string]: any }
    constructor(options: any) {
      this.viewer = options?.viewer ?? variable.viewer
    }
    //根据矩形对角坐标计算包络矩形geometry  positions[{lng:123,lat:37},{lng:125,lat:39}]
    /**
     *
     * @param positions 位置
     * @returns
     */
    protected toExtent(positions: { [key: string]: any }[]) {
      let xmin = Math.min(...positions.map(p => p.lng))
      let xmax = Math.max(...positions.map(p => p.lng))
      let ymin = Math.min(...positions.map(p => p.lat))
      let ymax = Math.max(...positions.map(p => p.lat))
      let spatialReference = {
        wkid: 4326
      }
      let geometryType = 'esriGeometryEnvelope'
      let geometry = { xmin, ymin, xmax, ymax, spatialReference }
      return geometry
    }
    //根据query返回结果组织Polygon的geometry
    protected toPolygon(queryRes: { [key: string]: any }) {
      let rings = []
      queryRes?.features.forEach((f: { [key: string]: any }) => {
        f?.geometry?.rings.forEach((r: any[]) => {
          rings.push(r)
        })
      })
      let geometry = {
        rings,
        spatialReference: queryRes?.spatialReference ?? { wkid: 4326 }
      }
      return geometry
    }
    //组织服务query过滤条件
    protected async getLayerDefs(serviceItem: { [key: string]: any }) {
      let layerDefsStr = '' //"0":a>1 AND c=1,"1":b=2
      // express = "", //"0":a>1 AND c=1
      // where = "", //a>1 AND c=1
      if (serviceItem.isQueryAllLayers === false) {
        let layers = serviceItem.layers
        layers.forEach((layersItem: { [key: string]: any }, i: number) => {
          let express = '',
            where = ''
          where = this.getWhereStr(layersItem)
          express = `"${layersItem.layerId}":"${where}"`
          let endStr = i == layers.length - 1 ? '' : ','
          layerDefsStr += express + endStr
        })
      } else {
        let layerJson: { [key: string]: any } = await this.getServiceLayers(serviceItem.url)
        layerJson = layerJson?.data
        let express = '',
          where = ''
        let allLayers = serviceItem.allLayers
        where = this.getWhereStr(allLayers)
        layerJson?.layers.forEach((item: { [key: string]: any }, k: number) => {
          express = `"${item.id}":"${where}"`
          let endStr = k == layerJson.layers.length - 1 ? '' : ','
          layerDefsStr += express + endStr
        })
      }
      return `{${layerDefsStr}}`
    }
    //组织where语句
    private getWhereStr(layersItem?: { [key: string]: any }) {
      let where = ''
      if (!layersItem || !Object.keys(layersItem).length) {
        where = '1=1'
        return where
      }
      let def = layersItem.layerDefs
      let isOrAnd = layersItem.isOrAnd || 'AND'
      def?.forEach((item: { [key: string]: any }, idx: number) => {
        // let link = idx == 0 ? '' : ' ' + isOrAnd + ' '
        let link = idx == 0 ? '' : ` ${isOrAnd} `
        item.conditionType = item?.conditionType ? item.conditionType : '='
        switch (item.conditionType) {
          case 'BETWEEN':
            // where += link + item.field + ' ' + item.conditionType + ' ' + item.value + ' AND ' + item.value2
            where += `${link}${item.field} ${item.conditionType} ${item.value} AND ${item.value2}`
            break
          default:
            // where += link + item.field + item.conditionType + item.value
            where += `${link}${item.field} ${item.conditionType} ${item.value}`
            break
        }
      })
      where = !!where ? where : '1=1'
      return where
    }
    //获取服务json
    private getServiceLayers(url: string) {
      return axios.aGet({
        url,
        data: { f: 'pjson' }
      })
      // return new Promise((resovle, reject) => {
      //   $.ajax({
      //     async: true,
      //     url: url,
      //     type: 'GET',
      //     dataType: 'json',
      //     // contentType: "application/json",
      //     data: { f: 'json' },
      //     success: res => {
      //       resovle(res)
      //     },
      //     error: res => {
      //       reject(res)
      //     }
      //   })
      // })
    }

    //数组分割
    protected getNewArray(array: any[], subGroupLength: number) {
      let index = 0
      let newArray = []
      while (index < array.length) {
        newArray.push(array.slice(index, (index += subGroupLength)))
      }
      return newArray
    }
    //下载json
    protected download(data: { [key: string]: any }, name: string, isFormat: boolean) {
      isFormat = isFormat || false
      name = name || 'json'
      let nowTime = this.getNowTimeFormat1()
      name = name + '_' + nowTime
      let a = document.createElement('a')
      a.download = name
      a.style.display = 'none'
      let jsonblob: Blob
      //大于100000条时，序列化会失败，此时采用分段序列化只下载features
      if (data.features.length > 100000) {
        // let d = isFormat ? this.stringify(data.features, null, 4) : this.stringify(data.features)
        let d = this.stringify(data.features)
        // let d = (isFormat ? JSON.stringify(data.features, null, 4) : this.stringify(data.features)) as BlobPart[]
        jsonblob = new Blob(d, { type: 'Application/json' })
      } else {
        let dat = isFormat ? JSON.stringify(data, null, 4) : JSON.stringify(data)
        jsonblob = new Blob([dat], { type: 'Application/json' })
      }
      a.href = URL.createObjectURL(jsonblob)
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      return true
    }
    // 处理超大数据量 10万条数据以上的序列化方式
    private stringify(data: any) {
      // 使用数组储存文件数据
      let resultArray = []
      // 定义数组项的分隔字符
      let split = ','
      // 在数组开头添加数组的开始符号
      resultArray.push('[')
      // 循环添加每一个结果，以及分割字符
      for (const result of data) {
        // resultArray.push(JSON.stringify(result, null, 4));
        resultArray.push(JSON.stringify(result))
        resultArray.push(split)
      }
      // 删除最后一个分隔符（不去掉的话会导致格式错误）
      resultArray.pop()
      // 在数组末尾添加数组的结束符号
      resultArray.push(']')
      return resultArray
    }
    //获取当前时间(格式1：2023-06-26_140425)
    private getNowTimeFormat1() {
      let time = this.getNowTime()
      let { year, month, day, hour, minute, second } = time
      let nowTime = `${year}-${month}-${day}_${hour}${minute}${second}`

      return nowTime
    }
    //获取当前时间
    private getNowTime() {
      let now = new Date()
      let year = now.getFullYear() //获取完整的年份(4位,1970-????)
      let month = now.getMonth() + 1 //获取当前月份(0-11,0代表1月)
      let day = now.getDate() //获取当前日(1-31)
      let hour = now.getHours() //获取当前小时数(0-23)
      let minute = now.getMinutes() //获取当前分钟数(0-59)
      let second = now.getSeconds() //获取当前秒数(0-59)
      let time = {
        year,
        month: this.fillZero(month),
        day: this.fillZero(day),
        hour: this.fillZero(hour),
        minute: this.fillZero(minute),
        second: this.fillZero(second)
      }
      return time
    }
    //时间补0
    private fillZero(str: number) {
      let realNum: number | string
      if (str < 10) {
        realNum = '0' + str
      } else {
        realNum = str
      }
      return realNum
    }
  }

  /**
   * @description arcgis查询类
   */
  export class Arcgis extends Base {
    constructor(options: any) {
      super(options?.viewer ?? variable.viewer)
    }

    //多图层查询(url不需加图层号，图层过滤条件在参数中组织)，支持多服务、多图层、多条件
    public async multiQuery(condition: { [key: string]: any }) {
      let defaultCondition = {
        serviceParam: [
          {
            url: '/130server/geoscene/rest/services/Hosted/boshuo_xqd_point/FeatureServer',
            isQueryAllLayers: true, //是否查询所有图层，默认true
            //当isQueryAllLayers=false时，过滤条件读取layers，可针对部分图层进行过滤查询，若某图层不需过滤条件其layerDefs置空即可
            layers: [
              {
                layerId: '0', //图层号
                isOrAnd: 'AND', //图层多过滤条件连接方式：且或，默认'AND'，可选：'AND' | 'OR'
                layerDefs: [
                  {
                    field: 'town', //属性名
                    value: "'净月街道'", //属性值
                    value2: '', //属性值2，当conditionType为'BETWEEN'或时使用，[ NOT ] BETWEEN <value> AND <value2>
                    conditionType: '=' //默认'='，可选：'<=' | '>=' | '<' | '>' | '=' | '<>'| 'LIKE' | 'NOT LIKE' | 'IN' | 'NOT IN' | 'BETWEEN' | 'NOT BETWEEN'
                  },
                  {
                    field: 'origin',
                    value: "'2020年普查'",
                    conditionType: '='
                  }
                ]
              },
              {
                layerId: '3',
                isOrAnd: 'AND',
                layerDefs: [
                  {
                    field: 'name', //属性名
                    value: "'复地嘉年华'", //属性值
                    value2: '', //属性值2，当conditionType为'BETWEEN'或时使用，[ NOT ] BETWEEN <value> AND <value2>
                    conditionType: '<>' //默认'='，可选：'<=' | '>=' | '<' | '>' | '=' | '<>'| 'LIKE' | 'NOT LIKE' | 'IN' | 'NOT IN' | 'BETWEEN' | 'NOT BETWEEN'
                  }
                ]
              }
            ],
            //当isQueryAllLayers=true时，过滤条件读取allLayers，对服务内所有图层进行过滤查询，若不需过滤条件allLayers不传或置空即可
            allLayers: {
              isOrAnd: 'AND', //图层多过滤条件连接方式：且或，默认'AND'，可选：'AND' | 'OR'
              layerDefs: [
                {
                  field: 'name',
                  value: "'复地嘉年华'",
                  value2: '',
                  conditionType: '<>'
                }
              ]
            }
          }
        ],
        geometry: null, //查询范围geometry
        geometryType: '',
        returnGeometry: 'true',
        returnCountOnly: 'false',
        // f: 'json',
        returnIdsOnly: 'false',
        objectIds: 'null'
      }
      condition = Object.assign(defaultCondition, condition)
      if (!condition.serviceParam || !condition.serviceParam.length) {
        console.warn('ArcGIS multiQuery:查询参数serviceParam为空!')
        return
      }
      let geometry = typeof condition.geometry == 'string' ? condition.geometry : JSON.stringify(condition.geometry)
      let allPromise = []
      for (let i = 0; i < condition.serviceParam.length; i++) {
        let item = condition.serviceParam[i]
        item.layerDefsStr = await this.getLayerDefs(item)
        // item.layerDefsStr = item.layerDefsStr?.data
        let url = item.url
        let queryParams = {
          layerDefs: item.layerDefsStr,
          geometry: geometry,
          geometryType: condition.geometryType || 'esriGeometryEnvelope',
          returnGeometry: condition.returnGeometry,
          // f: condition.f || 'json',//多图层查询 f只能位html或json
          returnCountOnly: condition.returnCountOnly || 'false'
        }
        let promise = axios.aGet({
          url: `${url}/query`,
          data: {
            f: 'json',
            ...queryParams
          }
        })
        // let promise = new Promise((resovle, reject) => {
        //   $.ajax({
        //     async: true,
        //     url: url + '/query',
        //     type: 'GET',
        //     dataType: 'json',
        //     // contentType: "application/json",
        //     data: queryParams,
        //     success: res => {
        //       resovle(res)
        //     },
        //     error: res => {
        //       reject(res)
        //     }
        //   })
        // })
        allPromise.push(promise)
        // return Promise.all(allPromise)
      }
      let queryRes = await Promise.allSettled(allPromise)
      queryRes = queryRes.map((i: any) => i?.value)?.map(k => k?.data)
      return queryRes
    }

    //单图层查询
    public async query(queryParams: { [key: string]: any }): Promise<AxiosResponse<any, any>> {
      let url = queryParams.url,
        layerId = queryParams.layerId
      if (!url || layerId == null) {
        console.warn('ArcGIS query:请传入有效的服务地址和图层号!')
        return
      }
      if (!!queryParams.geometry && typeof queryParams.geometry !== 'string') {
        queryParams.geometry = JSON.stringify(queryParams.geometry)
      }
      let defaultQueryParams = {
        where: '1=1',
        geometry: 'null',
        geometryType: 'esriGeometryEnvelope',
        returnGeometry: 'true',
        outFields: '*',
        f: 'json',
        // f: 'geojson',
        returnCountOnly: 'false',
        returnIdsOnly: 'false',
        objectIds: 'null'
      }
      queryParams = Object.assign(defaultQueryParams, queryParams)
      // return new Promise((resovle, reject) => {
      //   $.ajax({
      //     async: true,
      //     url: url + '/' + layerId + '/query',
      //     type: 'GET',
      //     dataType: 'json',
      //     // contentType: "application/json",
      //     data: queryParams,
      //     success: res => {
      //       resovle(res)
      //     },
      //     error: res => {
      //       reject(res)
      //     }
      //   })
      // })
      let queryRes = await axios.aGet({
        url: `${url}/${layerId}/query`,
        data: {
          f: 'json',
          ...queryParams
        }
      })
      return queryRes?.data
    }

    //服务单图层GeoJSON数据下载(支持超过2000条数据的并发下载)
    public async geojsonDownload({ url, layerId, name, length, isFormat }: { [key: string]: any }, callback: Function) {
      let result: { [key: string]: any }
      let response = {}
      length = length ?? 1000
      let queryRes = (await this.query({
        url: url,
        layerId: layerId,
        returnIdsOnly: 'true'
      })) as { [key: string]: any }
      // console.log("res11111", queryRes);
      let objectIdFieldName = queryRes.objectIdFieldName
      let objectIds = queryRes.objectIds
      if (objectIds.length > length) {
        let newObjectIdsArray = this.getNewArray(objectIds, length)
        let allPromise = []
        newObjectIdsArray.forEach(item => {
          // let promise = new Promise((resovle, reject) => {
          //   this.query({
          //     url: url,
          //     layerId: layerId,
          //     f: 'geojson',
          //     objectIds: item.toString()
          //   })
          // })
          let promise = this.query({
            url: url,
            layerId: layerId,
            f: 'geojson',
            objectIds: item.toString()
          })
          allPromise.push(promise)
        })

        // Promise.allSettled(allPromise)
        //   .then(res2 => {
        let res2 = await Promise.allSettled(allPromise)
        res2 = res2.map((i: any) => i?.value) //Promise.allSettled返回结构与Promise.all不同，需把索要结果从value取出
        // console.log("res22222", res2);
        result = res2[0]
        let features = []
        res2.forEach((item: { [key: string]: any }) => {
          features = features.concat(item.features)
        })
        result.features = features
        // let downloadState = this.download(result, name, isFormat)
        // response = {
        //   downloadState,
        //   result
        // }
        // callback(response)
        // })
        // .catch(err => {
        //   callback(err)
        // })
      } else {
        // new Promise((resovle, reject) => {
        //   this.query({
        //     url: url,
        //     layerId: layerId,
        //     f: 'geojson'
        //   }).then(res => {
        // resovle(res);
        result = await this.query({
          url: url,
          layerId: layerId,
          f: 'geojson'
        })
        // let downloadState = this.download(result, name, isFormat)
        // response = {
        //   downloadState,
        //   result
        // }
        // callback(response)
        // })
        // .catch(err => {
        //   callback(err)
        // })
        // })
      }
      let downloadState = this.download(result, name, isFormat)
      response = {
        downloadState,
        result
      }
      callback(response)
    }
  }

  /**
   * @description 选择查询类
   */
  export class Select extends Base {
    // polygons: any[]
    arcgisQuery: Arcgis
    areaFeaturePick: areaFeaturePick
    constructor(options: any) {
      super(options?.viewer ?? variable.viewer)
      // this.polygons = []
      this.arcgisQuery = new Arcgis(this.viewer)
      this.areaFeaturePick = new areaFeaturePick({
        callback:
          options?.callback ??
          function (res: any, type: any) {
            console.log('arcgisQuery Select', res)
          }
      })
    }

    // 鼠标框选
    public mouseSelect(fn: Function) {
      // let queryGeometry = null
      // this.drawManager.drawRect(
      //   (positions: any, entities: any[]) => {
      //     let _entitys = entities.map((entity: Cesium.Entity, index: number) => {
      //       let _clone = Cesium.clone(entity)
      //       return _clone
      //     })

      //     this.drawManager.remove();
      //     _entitys.map((e: Cesium.Entity) => {
      //       this.viewer.entities.add(e)
      //     })
      //     this.polygons = this.polygons.concat(_entitys)
      //     if (positions.length) {
      //       queryGeometry = this.toExtent(positions)
      //     }
      //     if (typeof fn == 'function') fn(queryGeometry)
      //     // this.viewer.flyTo(_entitys);
      //   },
      //   false,
      //   true
      // )

      // this.areaFeaturePick.clear()
      this.areaFeaturePick.activate({
        type: 'rectangle'
      })
    }

    //行政区划切换  参照Arcgis类中query方法的queryParams
    public async xzqhSelect(queryParams: { [key: string]: any }) {
      // return new Promise((resovle, reject) => {
      //   this.query({
      //     url: url,
      //     where: filter
      //   }).then(res => {
      //     // console.log(res);
      //     let geo = this.toPolygon(res)
      //     resovle(geo)
      //   })
      // })
      // filter  "xzqhmc = '北京市'"
      let queryRes = await this.arcgisQuery.query({
        ...queryParams
      })
      let geo = this.toPolygon(queryRes)
      return geo
    }
    //查询
    // private query({ url, geometry, geometryType, where }: { [key: string]: any }): Promise<AxiosResponse<any, any>> {
    //   return this.arcgisQuery.query({
    //     url,
    //     geometry,
    //     geometryType,
    //     ...where
    //   })
    // }
    // 实现清除
    public destroy() {
      this.areaFeaturePick?.clear()
      // this.polygons.map(e => {
      //   this.viewer.entities.remove(e)
      // })
    }
  }
}
