// 此聚合方法即将废弃，请使用gs3d.thematic.Cluster
import * as turf from '@turf/turf'
import * as Cesium from 'cesium'

import { levelSize } from '../grid/util/levelSize'

import colored_user from '../gs3d-assets/image/colored_user.png'
import light_blue_bkg from '../gs3d-assets/image/light_blue_bkg.png'
import dark_blue_bkg from '../gs3d-assets/image/dark_blue_bkg.png'
import orange_bkg from '../gs3d-assets/image/orange_bkg.png'
import red_bkg from '../gs3d-assets/image/red_bkg.png'
export namespace clusterChart {
  export const describe: string = '聚合图（此聚合方法即将废弃，请使用gs3d.thematic.Cluster）'
  let viewer: any
  let dataSource: any
  let centerArray: Array<any> = []
  let clusterOption: any = {
    pixelRange: 60, //聚合范围
    minimumClusterSize: 2, //最小聚合数
    originImageSize: 64, //背景图片原始尺寸
    interval: [
      {
        id: 0, //id为0时为配置低于最小聚合数时的气泡效果
        interval: [1, 2], //聚合区间，min =< num < max
        image: colored_user || '/cluster/icons/poi.png', //聚合气泡背景图片
        width: 32, //聚合气泡宽
        height: 32, //聚合气泡高
        label: {
          //仅当id为0时生效
          enabled: true, //是否显示label
          text: 'name', //属性字段
          font: 'bold 15px Microsoft YaHei', //字体
          verticalOrigin: 'Cesium.VerticalOrigin.CENTER', // 竖直对齐方式
          horizontalOrigin: 'Cesium.HorizontalOrigin.LEFT', // 水平对齐方式
          pixelOffset: 'new Cesium.Cartesian2(15, 0)', // 偏移量
          style: 'Cesium.LabelStyle.FILL', //文本样式
          showBackground: true, //设置文本背景
          backgroundColor: "Cesium.Color.fromCssColorString('#50b2b7')" //设置文本背景颜色,
        }
      },
      {
        id: 1,
        interval: [2, 10],
        image: light_blue_bkg || '/cluster/icons/cluster_1.png',
        width: 40,
        height: 40
      },
      {
        id: 2,
        interval: [11, 50],
        image: dark_blue_bkg || '/cluster/icons/cluster_2.png',
        width: 48,
        height: 48
      },
      {
        id: 3,
        interval: [51, 100],
        image: orange_bkg || '/cluster/icons/cluster_3.png',
        width: 56,
        height: 56
      },
      {
        id: 4,
        interval: [101, 9999999999],
        image: red_bkg || '/cluster/icons/cluster_4.png',
        width: 72,
        height: 72
      }
    ],
    isLocation: true, //是否定位到聚合图所在范围
    offset: 0.003 //定位范围偏移量(即四周留白距离)
  }

  /**
 * @description: 绘制点聚合

 * @msg: 备注
 * @param {any} v - viewer
 * @param {Array} dataList - 接口返回的dataList数据
 * @param {object} option - 点聚合配置项
 * @return {*}
 * @author: YangYuzhuo
 * Copyright (c) 2023 by SKXX-SDKGroup, All Rights Reserved. 

 * @Remarks: 备注

 * @example
```ts
let option = {
  pixelRange: 60, //聚合范围
  minimumClusterSize: 2, //最小聚合数
  originImageSize: 64, //背景图片原始尺寸
  interval: [
    {
      id: 0, //id为0时为配置低于最小聚合数时的气泡效果
      interval: [1, 2], //聚合区间，min =< num < max
      image:
        "data:image/png;base64,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" ||
        "/cluster/icons/poi.png", //聚合气泡背景图片
      width: 32, //聚合气泡宽
      height: 32, //聚合气泡高
      label: {
        //仅当id为0时生效
        enabled: true, //是否显示label
        text: "name", //属性字段
        font: "bold 15px Microsoft YaHei", //字体
        verticalOrigin: "CENTER", // 竖直对齐方式，默认"CENTER"，可选"CENTER"||"BOTTOM"||"BASELINE"||"TOP"
        horizontalOrigin: "LEFT", // 水平对齐方式，默认"LEFT"，可选"CENTER"||"LEFT"||"RIGHT"
        pixelOffset: [15, 0], // 偏移量
        style: "FILL",//文本样式，默认"FILL"，可选"FILL"||"OUTLINE"||"FILL_AND_OUTLINE"
        showBackground: true, //设置文本背景
        backgroundColor: '#50b2b7', //设置文本背景颜色,
      },
    },
    {
      id: 1,
      interval: [2, 10],
      image:
        "data:image/png;base64,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" ||
        "/cluster/icons/cluster_1.png",
      width: 40,
      height: 40,
    },
    {
      id: 2,
      interval: [11, 50],
      image:
        "data:image/png;base64,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" ||
        "/cluster/icons/cluster_2.png",
      width: 48,
      height: 48,
    },
    {
      id: 3,
      interval: [51, 100],
      image:
        "data:image/png;base64,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" ||
        "/cluster/icons/cluster_3.png",
      width: 56,
      height: 56,
    },
    {
      id: 4,
      interval: [101, 9999999999],
      image:
        "data:image/png;base64,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" ||
        "/cluster/icons/cluster_4.png",
      width: 72,
      height: 72,
    },
  ],
};
let dataList = [{
                "iwhereGeometry": {
                    "coordinates": [
                        125.37992411686133,
                        43.82840936317525
                    ],
                    "type": "Point"
                },
                "geometry": {
                    "coordinates": [
                        125.37992411686133,
                        43.82840936317525
                    ],
                    "type": "Point"
                },//iwhereGeometry或geometry均可
                "dqc": "3",
                "lg": "30.28",
                 "zcs": "10",
                "userName": "李悦麒",
            }]
gs3d.thematic.clusterChart.draw(viewer, dataList, option)
```
 */
  export function draw(v: any, dataList: Array<any>, option?: object) {
    viewer = v
    if (!viewer) {
      console.log('请传入viewer')
      return
    }
    centerArray = []
    if (!dataList || !dataList.length) {
      console.log('请传入聚合数据')
      return
    }
    /* 
    let clusterFeature = [];
    let dataSource = {
        "type": "FeatureCollection",
        "features": clusterFeature
    }
    resultList.value.forEach((item) => {
        let center, polygon;
        if (item.iwhereGeometry.type != "Point") {
            if (item.iwhereGeometry.type != "MultiPolygon") {
                polygon = turf.polygon(item.iwhereGeometry.coordinates);
            } else {
                polygon = turf.multiPolygon(item.iwhereGeometry.coordinates);
            }
            center = turf.centerOfMass(polygon);
        } else {
            center = { geometry: item.iwhereGeometry };
        }
        let clusterGeometry = {
            "type": "Feature",
            "properties": {},
            "geometry": center.geometry
        };
        clusterFeature.push(clusterGeometry)
    })
    initCluster1(dataSource);
    */
    if (!!option) {
      clusterOption = option
    }

    dataSource = new Cesium.CustomDataSource('dataSource') //自定义一个名为dataSource的空数据集

    dataList.forEach(item => {
      if (!item?.iwhereGeometry && item?.geometry) {
        item.iwhereGeometry = item.geometry
      }
      if (item?.iwhereGeometry?.coordinates?.length) {
        let center, polygon
        if (item.iwhereGeometry.type != 'Point') {
          if (item.iwhereGeometry.type != 'MultiPolygon') {
            polygon = turf.polygon(item.iwhereGeometry.coordinates)
          } else {
            polygon = turf.multiPolygon(item.iwhereGeometry.coordinates)
          }
          center = turf.centerOfMass(polygon)
        } else {
          center = { geometry: item.iwhereGeometry }
        }
        let properties = item
        if (!properties.zcs || properties.zcs == '0' || properties.zcs == 0) {
          properties.zcs = 1
        }
        if (typeof properties.dqc == 'string') {
          properties.dqc = parseFloat(properties.dqc)
        }
        properties.dqc = properties.dqc || 1
        properties.lg = properties.lg || properties.zcs * 3
        let singleFloorHeight = properties.lg / properties.zcs
        let height = (properties.dqc - 0.5) * singleFloorHeight
        let param = {
          name: item.userName || item.name,
          poiName: 'clusterPoi',
          poiProperties: item,
          position: Cesium.Cartesian3.fromDegrees(center.geometry.coordinates[0], center.geometry.coordinates[1], height),
          billboard: {
            // show: false,
            image: '/cluster/icons/poi.png',
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            scale: 1, // 标注点icon缩放比例
            width: 26, // 设置标注点icon的高和宽，单位默认时px
            height: 36
          }
        }
        if (!!center.geometry.coordinates.length) {
          centerArray.push(center.geometry.coordinates)
          dataSource.entities.add(new Cesium.Entity(param))
        }
      } else {
        console.log('无坐标数据')
      }
    })
    clear()
    let dataSourcePromise = viewer.dataSources.add(dataSource)
    dataSourcePromise.then(function (e: any) {
      dataSource = e
      initCluster()
      if (!window.hasSetMarker && !!clusterOption.isLocation) {
        let offset = clusterOption.offset
        locationCluster(centerArray, offset)
      }
    })
  }
  /**
 * @description: 清除点聚合

 * @msg: 备注
 * @return {*}
 * @author: YangYuzhuo
 * Copyright (c) 2023 by SKXX-SDKGroup, All Rights Reserved. 

 * @Remarks: 备注

 * @example
```ts
gs3d.thematic.clusterChart.clear()
```
 */
  export function clear() {
    if (!!dataSource) {
      viewer.dataSources.remove(dataSource)
    }
  }
  // 聚合效果(cesium自带图标，比较丑)
  function initCluster1(dataSource: any) {
    const pixelRange = 20
    const minimumClusterSize = 5
    const enabled = true

    dataSource.clustering.enabled = enabled //聚合开启
    dataSource.clustering.pixelRange = pixelRange //设置像素范围，以扩展显示边框
    dataSource.clustering.minimumClusterSize = minimumClusterSize //设置最小的聚合点数目，超过此数目才能聚合

    let removeListener: any

    //按聚合层级创建对应图标
    const pinBuilder = new Cesium.PinBuilder()
    var pin100 = pinBuilder.fromText('100+', Cesium.Color.BLUE, 48).toDataURL()
    var pin50 = pinBuilder.fromText('50+', Cesium.Color.BLUE, 48).toDataURL()
    var pin40 = pinBuilder.fromText('40+', Cesium.Color.RED, 48).toDataURL()
    var pin30 = pinBuilder.fromText('30+', Cesium.Color.RED, 48).toDataURL()
    var pin20 = pinBuilder.fromText('20+', Cesium.Color.RED, 48).toDataURL()
    var pin10 = pinBuilder.fromText('10+', Cesium.Color.RED, 48).toDataURL()

    // 10以内聚合图标
    const singleDigitPins = new Array(8)
    for (let i = 0; i < singleDigitPins.length; ++i) {
      singleDigitPins[i] = pinBuilder.fromText(`${i + 2}`, Cesium.Color.VIOLET, 48).toDataURL()
    }

    customStyle()

    function customStyle() {
      if (Cesium.defined(removeListener)) {
        removeListener()
        removeListener = undefined
      } else {
        removeListener = dataSource.clustering.clusterEvent.addEventListener(function (clusteredEntities: Array<any>, cluster: any) {
          cluster.label.show = false
          cluster.billboard.show = true
          cluster.billboard.id = cluster.label.id
          cluster.billboard.verticalOrigin = Cesium.VerticalOrigin.BOTTOM
          if (clusteredEntities.length >= 100) {
            cluster.billboard.image = pin100
          } else if (clusteredEntities.length >= 50) {
            cluster.billboard.image = pin50
          } else if (clusteredEntities.length >= 40) {
            cluster.billboard.image = pin40
          } else if (clusteredEntities.length >= 30) {
            cluster.billboard.image = pin30
          } else if (clusteredEntities.length >= 20) {
            cluster.billboard.image = pin20
          } else if (clusteredEntities.length >= 10) {
            cluster.billboard.image = pin10
          } else {
            cluster.billboard.image = singleDigitPins[clusteredEntities.length - 2]
          }
        })
      }

      // force a re-cluster with the new styling
      const pixelRange = dataSource.clustering.pixelRange
      dataSource.clustering.pixelRange = 0
      dataSource.clustering.pixelRange = pixelRange
    }
  }

  /**
   * @description: 点聚合功能效果
   * @param {*} viewer
   * @return {*}
   */
  function initCluster() {
    // let _this = this;
    // viewer.dataSources.add(dataSource);

    // 设置聚合参数
    dataSource.clustering.enabled = true
    dataSource.clustering.pixelRange = clusterOption.pixelRange || 60
    dataSource.clustering.minimumClusterSize = clusterOption.minimumClusterSize || 2
    let defaultCluster = clusterOption.interval.find((item: any) => {
      return item.id == 0
    })
    let otherCluster = clusterOption.interval.filter((item: any) => {
      return item.id != 0
    })
    // foreach用于调用数组的每个元素，并将元素传递给回调函数。
    dataSource.entities.values.forEach((entity: any) => {
      // 将点拉伸一定高度，防止被地形压盖
      //   entity.position._value.z += 10.0;
      // 使用大小为64*64的icon，缩小展示poi
      entity.billboard = {
        image: defaultCluster.image || '/cluster/icons/poi.png',
        width: defaultCluster.width || 32,
        height: defaultCluster.height || 32
      }
      if (defaultCluster.label && defaultCluster.label.enabled) {
        let labelOption = defaultCluster.label
        entity.label = {
          text: entity[labelOption.text],
          font: labelOption.font || 'bold 15px Microsoft YaHei',
          verticalOrigin: Cesium.VerticalOrigin[labelOption.verticalOrigin || 'CENTER'] || Cesium.VerticalOrigin.CENTER, // 竖直对齐方式
          horizontalOrigin: Cesium.HorizontalOrigin[labelOption.horizontalOrigin || 'LEFT'] || Cesium.HorizontalOrigin.LEFT, // 水平对齐方式
          pixelOffset: new Cesium.Cartesian2(...(labelOption.pixelOffset || [15, 0])), // 偏移量
          style: Cesium.LabelStyle[labelOption.style || 'FILL'] || Cesium.LabelStyle.FILL,
          showBackground: labelOption.showBackground || true, //设置文本背景
          backgroundColor: Cesium.Color.fromCssColorString(labelOption.backgroundColor || '#50b2b7') //设置文本背景颜色,
        }
      }

      entity.billboard.disableDepthTestDistance = Number.POSITIVE_INFINITY //防止billboard被建筑遮盖
      entity.label.disableDepthTestDistance = Number.POSITIVE_INFINITY //防止label被建筑遮盖
    })

    // 添加监听函数
    dataSource.clustering.clusterEvent.addEventListener(function (clusteredEntities: any, cluster: any) {
      // 关闭自带的显示聚合数量的标签
      cluster.label.show = false
      cluster.billboard.show = true
      cluster.billboard.verticalOrigin = Cesium.VerticalOrigin.BOTTOM

      // 根据聚合数量的多少设置不同层级的图片以及大小
      otherCluster.forEach((item: any) => {
        if (clusteredEntities.length >= item.interval[0] && clusteredEntities.length < item.interval[1]) {
          cluster.billboard.image = combineIconAndLabel(item.image || '/cluster/icons/cluster_1.png', clusteredEntities.length, clusterOption.originImageSize || 64)
          cluster.billboard.width = item.width || 48
          cluster.billboard.height = item.height || 48
        }
      })
      cluster.billboard.disableDepthTestDistance = Number.POSITIVE_INFINITY //防止billboard被建筑遮盖
    })
  }
  /**
   * @description: 将图片和文字合成新图标使用（参考Cesium源码）
   * @param {*} url：图片地址
   * @param {*} label：文字
   * @param {*} size：画布大小
   * @return {*} 返回canvas
   */
  function combineIconAndLabel(url: any, label: string, size: number) {
    // 创建画布对象
    let canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    let ctx: any = canvas.getContext('2d')
    let resource = Cesium.Resource as any
    let promise = new resource.fetchImage(url).then((image: any) => {
      // 异常判断
      try {
        ctx.drawImage(image, 0, 0)
      } catch (e) {
        console.log(e)
      }

      // 渲染字体
      // font属性设置顺序：font-style, font-variant, font-weight, font-size, line-height, font-family
      ctx.fillStyle = Cesium.Color.WHITE.toCssColorString()
      ctx.font = 'bold 20px Microsoft YaHei'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(label, size / 2, size / 2)

      return canvas
    })
    return promise
  }
  function locationCluster(centerArray: Array<any>, offset: number) {
    // let latArray: Array<any> = []
    // let lngArray: Array<any> = []

    let bboxCounter = new levelSize.BBOXCounter()
    centerArray.forEach(item => {
      bboxCounter.update(item[0], item[1])
      // latArray.push(item[1])
      // lngArray.push(item[0])
    })

    let [minExtentLng, minExtentLat, maxExtentLng, maxExtentLat] = bboxCounter.result()
    // let minExtentLng = Math.min(...lngArray)
    // let minExtentLat = Math.min(...latArray)
    // let maxExtentLng = Math.max(...lngArray)
    // let maxExtentLat = Math.max(...latArray)

    offset = 0.003
    let extentRectangle = Cesium.Rectangle.fromDegrees(minExtentLng - offset, minExtentLat - offset, maxExtentLng + offset, maxExtentLat + offset)
    viewer.camera.flyTo({
      destination: extentRectangle
      // orientation: {
      //     heading: 6.28318530717956,
      //     pitch: -0.7853988554907718,
      //     roll: 0,
      // }
      // new Cesium.HeadingPitchRange(6.28318530717956, -0.7853988554907718, 50)
    })
  }
}
