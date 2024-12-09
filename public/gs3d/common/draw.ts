/*
 * @Description: <geometry绘制>
 * @version: 1.0.0
 * @Author: YangYuzhuo
 * @Date: 2023-08-29 09:24:27
 * @LastEditors: yangyzZWYL yangyz@zhiwyl.com
 * @LastEditTime: 2024-04-15 14:09:29
 * Copyright 2023
 * listeners
 * @Descripttion: <文件用途说明>
 * @FilePath \\geogrid3d\\packages\\sdk\\gs3d\\common\\draw.ts
 */

import * as Cesium from 'cesium'
import * as turf from '@turf/turf'
//billboard样式配置，当showBillBoard为true时生效

import red_position_2 from '../gs3d-assets/image/red_position.png'
import { common } from '../util/common'
export namespace draw {
  export const describe = '通用绘制'
  let defaultBillBoardOption = {
    text: '目的地', //文字
    font: '16px Helvetica', //字体，默认"16px Helvetica"
    style: 'FILL', //样式，默认"FILL"，可选"FILL"||"OUTLINE"||"FILL_AND_OUTLINE"
    fillColor: '#ffffff', //文字填充颜色，默认"#ffffff"
    outlineWidth: 1, //文字描边宽度,默认1
    outlineColor: '#ffffff', //文字描边颜色，默认"#ffffff"
    showBackground: false, //是否显示文字背景，默认false
    backgroundColor: '#000000', //文字填充颜色，默认"BLACK"
    pixelOffset: [0, 20], //文本偏移量，默认[0,20]
    distance: { near: 0, far: 30000000 }, //文本及图标显示距离范围,默认near:0,far:30000000
    url: red_position_2, //图标路径
    width: 40, //图片宽，默认40
    height: 40 //图片高，默认40
  }
  //点
  let optionPoint = {
    graphicName: '', //点的标识名，自定义
    pixelSize: 10, //点尺寸，默认10
    color: '#ff0000', //点颜色，默认红色
    showBillBoard: true, //是否显示中心点billboard(图片、文字)
    billBoardOption: defaultBillBoardOption,
    entityProperties: {} //点上关联的业务属性
  }
  //线
  let optionLineString = {
    graphicName: '', //线的标识名，自定义
    width: 5, //线宽，默认5
    color: '#ff0000', //线颜色，默认红色
    showBillBoard: true, //是否显示中心点billboard(图片、文字)
    billBoardOption: defaultBillBoardOption,
    entityProperties: {} //线上关联的业务属性
  }
  //面
  let optionPolygon = {
    graphicName: '', //面的标识名，自定义
    pixelSize: 10, //面尺寸，默认10
    color: 'rgba(255,0,0,0.3)', //面颜色，默认红色
    outline: true, //面是否显示边界线，默认false
    outlineColor: '#ff0000', //边界线颜色，默认"#ff0000"
    outlineWidth: 1, //边界线宽度,默认1，此属性无效
    height: 0, //指定多边形的恒定高度
    extrudedHeight: 0, //指定多边形的凸出面相对于椭球面的高度
    distance: { near: 0, far: 1500000 }, //面显示距离范围,默认near:0,far:1500000
    isWall: false, //是否绘制为wall(立体墙)
    wallOption: {
      //wall样式配置，当isWall为true时生效
      maximumHeights: 5000, //立体墙的最大高度，默认5000
      minimumHeights: 0 //立体墙的最小高度，默认0
    },
    showBillBoard: true, //是否显示中心点billboard(图片、文字)
    billBoardOption: defaultBillBoardOption,
    entityProperties: {} //面上关联的业务属性
  }
  let allEntities: Array<any> = []

  //
  /**
   * @param {Object} geometry 需要绘制的图形
   * @param {Object} option      需要绘制的样式
   */
  /**
 * @description: 绘制图形

 * @msg: 备注
 * @param {any} viewer - viewer
 * @param {any} geometry - 需要绘制的图形，geojson中的geomery
 * @param {any} option - 需要绘制的样式
 * @return {*}
 * @author: YangYuzhuo
 * Copyright (c) 2023 by SKXX-SDKGroup, All Rights Reserved. 

 * @Remarks: 备注

 * @example
```ts
//billboard样式配置，当showBillBoard为true时生效
let billBoardOption = { 
  text: "目的地",//文字
  font: "16px Helvetica",//字体，默认"16px Helvetica"
  style: "FILL",//样式，默认"FILL"，可选"FILL"||"OUTLINE"||"FILL_AND_OUTLINE"
  fillColor: "#ffffff",//文字填充颜色，默认"#ffffff"
  outlineWidth: 1,//文字描边宽度,默认1
  outlineColor: "#ffffff",//文字描边颜色，默认"#ffffff"
  showBackground: false,//是否显示文字背景，默认false
  backgroundColor: "#000000",//文字填充颜色，默认"BLACK"
  pixelOffset: [0, 20],//文本偏移量，默认[0,20]
  distance: { near: 0, far: 30000000 },//文本及图标显示距离范围,默认near:0,far:30000000
  url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAA3NJREFUWEetlk1oE0EUx/9vY5U2m9ZaQQU/2k3VfuxGoRUFPejFouDBD/Sg56og9iZ6Um96E0X8wJseBBWhglREvCjiR7FkoxVsdosUaaVWbTbWpuk+2dSKNjs7Sdq5znv//2/ezJsZQpFjtNZoIIWaQ8zLsuBKAEMhwqBLyutIMv6lSDlQIQnfVxrVoXncoRC1MWOTKIcInZMuPai04zcK0fVipABpLXaUwR0A1hYqCuCJy3Sx0o53ynICAZy62G0QH5CJCCsCPhO2EmeD8oUAjmY8BLCjVPPpPIX4eEUycUkM6TOT0vQzBDo9W/PpfGbsj9jmHT+9vAqko0Y7M67Nlfm0DhFaw0mze6ZuHoCjGW8AtEgABgh4wUSf4HILKBcfCcphxvWIbR4OBHA04yCAW8UK/dLWrcmyew2ErUG5WYXrF/Ylkv/G/FcBRzM8cw/CfzBvV+3EY9G0oxnnAZwI6IqjYStxNQjgK4BFAoFzqmWekp0NJ6p3ganNL46B+xHL3OMLMNrQUKNkyoYDVr9OtRNxGUBa048w6IogzlQtM+YL4GiGAUBkMKRa5lKZuTfv1DathxJ66xvL+Kra5mJfgJ/R5s0uK88EJt2qZbYWAsD19ZVpt/yHoOcnwpY53xcgtUpvpBC9F5mElbEq6usblUE4tc1tUJQuQVxeJf92gVOnLwHRoLABQPsiVvyeDCDwFiX0qkmzybcCb1payhq+ZTLiQ5i/fzNjnTp9O4geBSziecSKbxG3oeT1I9DzCuXnTr+tGK9vbppwlXdBFSKw5B6QrGBKnIbB7rlJVp5V9cdfpqPGDpd5o+zxIsCpcEMrqL/nu7ACuTbSjFcANsj2uth5Ai6HLfPYzLy8xyhVq28lhby/QHmxJqJ4Al6GLdP3K+f7IfkD8XSOAEZUy6wJgPOfmhMIQlZNmmXBBzNgdpYQ6Q/V86tbu7snSgbwEkuBYGBEzajLaeDFmGwbpd9yT8BrNWZ4B1M+CJ/HaayxpoBrO9fUcsWpiJQW20vgu5J4O5xxW2ng3UihugUD5O6IOv0QiG76ihN64fI21U4MFWpeVAWmRVNRo53yfs3UM65gV01ffKAY85IAcpXQYh0AX5gy456QO293eX9Pf7HmJQNMQRgnvQ/sJLJ7qqzej6WYzwrASx5frTcu+JjoLdXcy/sNddw9MPLcyvEAAAAASUVORK5CYII=",//图标路径
  width: 40,//图片宽，默认40
  height: 40//图片高，默认40
}
一、点
let geometry = {type:"Point",coordinates:[lng,lat]}
let option = {
  graphicName: "", //点的标识名，自定义
  pixelSize: 10,//点尺寸，默认10
  color: "#ff0000", //点颜色，默认红色
  showBillBoard: true,//是否显示中心点billboard(图片、文字)
  billBoardOption: billBoardOption,
  entityProperties: {}, //点上关联的业务属性
}

二、线
let geometry={type:"LineString",coordinates:[[lng1,lat1],[lng2,lat2],...]}
let option = {
  graphicName: "", //线的标识名，自定义
  width: 5,//线宽，默认5
  color: "#ff0000", //线颜色，默认红色
  showBillBoard: true,//是否显示中心点billboard(图片、文字)
  billBoardOption: billBoardOption,
  entityProperties: {}, //线上关联的业务属性
}
三、面
let geometry={type:"Polygon",coordinates:[[[lng1,lat1],[lng2,lat2],...]]}
let option = {
  graphicName: "", //面的标识名，自定义
  pixelSize: 10,//面尺寸，默认10
  color: "rgba(255,0,0,0.3)", //面颜色，默认红色
  outline: true,//面是否显示边界线，默认false
  outlineColor: "#ff0000",//边界线颜色，默认"#ff0000"
  outlineWidth: 1,//边界线宽度,默认1，此属性无效
  height: 0,//指定多边形的恒定高度
  extrudedHeight: 0,//指定多边形的凸出面相对于椭球面的高度
  distance: { near: 0, far: 1500000 },//面显示距离范围,默认near:0,far:1500000
  isWall: false,//是否绘制为wall(立体墙)
  wallOption: { //wall样式配置，当isWall为true时生效
    maximumHeights: 5000,//立体墙的最大高度，默认5000
    minimumHeights: 0//立体墙的最小高度，默认0
  },
  showBillBoard: true,//是否显示中心点billboard(图片、文字)
  billBoardOption: billBoardOption,
  entityProperties: {}, //面上关联的业务属性
}
四、多点
let geometry = {type:"MultiPoint",coordinates:[[lng1,lat1],[lng2,lat2],...]}
option同点
五、多线
let geometry={type:"MultiLineString",coordinates:[[[lng1,lat1],[lng2,lat2],...],[[lng1,lat1],[lng2,lat2],...],...]}
option同线
五、多面
let geometry={type:"MultiPolygon",coordinates:[[[[lng1,lat1],[lng2,lat2],...]],[[[lng1,lat1],[lng2,lat2],...]]]}
option同面

gs3d.common.draw.drawGraphic(viewer, geometry, option)
```
 */
  export const drawGraphic = (viewer: any, geometry: any, option: any) => {
    let returnEntities
    switch (geometry.type) {
      case 'Point':
        returnEntities = drawPoint(viewer, geometry, { ...optionPoint, ...option })
        break
      case 'MultiPoint':
        returnEntities = drawMultiPoint(viewer, geometry, { ...optionPoint, ...option })
        break
      case 'LineString':
        returnEntities = drawPolyline(viewer, geometry, { ...optionLineString, ...option })
        break
      case 'MultiLineString':
        returnEntities = drawMultiPolyline(viewer, geometry, { ...optionLineString, ...option })
        break
      case 'Polygon':
        returnEntities = drawPolygon(viewer, geometry, { ...optionPolygon, ...option })
        break
      case 'MultiPolygon':
        returnEntities = drawMultiPolygon(viewer, geometry, { ...optionPolygon, ...option })
        break
    }
    allEntities = allEntities.concat(returnEntities)
    return returnEntities
  }
  //绘制点
  const drawMultiPoint = (viewer: any, geometry: any, option: any) => {
    let entityId = common.getUuid(10)
    let entities: Array<any> = []
    geometry.coordinates.forEach((item: any) => {
      let returnEntities = drawPoint(viewer, { coordinates: item, type: 'Point' }, option, entityId)
      if (Array.isArray(returnEntities)) {
        entities = entities.concat(returnEntities)
      } else {
        entities.push(returnEntities)
      }
    })
    return entities
  }
  const drawPoint = (viewer: any, geometry: any, option: any, entityId?: string) => {
    entityId = entityId || common.getUuid(10)
    if (option) {
      if (option.showBillBoard) {
        let entity = drawBillBoard(viewer, geometry, option, entityId)
        entity.graphicType = 'point'
        return [entity]
      }
    }
    let entity = viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(geometry.coordinates[0], geometry.coordinates[1]),
      point: {
        pixelSize: option.pixelSize || 10,
        color: option.color ? Cesium.Color.fromCssColorString(option.color) : Cesium.Color.RED,
        heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND
      }
    })
    entity.graphicType = 'point'
    entity.graphicName = option.graphicName
    entity.entityId = entityId
    entity.entityProperties = option.entityProperties //entityProperties
    return [entity]
    // viewer.zoomTo(entity);
  }

  //绘制线
  const drawMultiPolyline = (viewer: any, geometry: any, option: any) => {
    let entityId = common.getUuid(10)
    let entities: Array<any> = []
    geometry.coordinates.forEach((item: any) => {
      let returnEntities = drawPolyline(viewer, { coordinates: item, type: 'LineString' }, option, entityId)
      if (Array.isArray(returnEntities)) {
        entities = entities.concat(returnEntities)
      } else {
        entities.push(returnEntities)
      }
    })
    return entities
  }
  const drawPolyline = (viewer: any, geometry: any, option: any, entityId?: string) => {
    entityId = entityId || common.getUuid(10)
    let coordArray: Array<any> = []
    geometry.coordinates.forEach((item: any) => {
      item.forEach((i:number)=>{
        coordArray.push(i)
      })
    })
    // dashed solid 增加绘制虚线或实线
    let material: any
    if (option?.lineStyleTpe === 'dashed') {
      material = new Cesium.PolylineDashMaterialProperty({
        color: option.color ? Cesium.Color.fromCssColorString(option.color) : Cesium.Color.RED,
        dashLength: option.dashLength ? option.dashLength : 20 //短划线长度
      })
    } else {
      material = option.color ? Cesium.Color.fromCssColorString(option.color) : Cesium.Color.RED
    }
    let polylineOption: any ={
        positions:  geometry.coordinates[0]?.length==3?Cesium.Cartesian3.fromDegreesArrayHeights(coordArray):Cesium.Cartesian3.fromDegreesArray(coordArray),
        width: option.width ? parseInt(option.width) : 5,
        material: material,
      }
    if (option.clampToGround) {
      polylineOption.clampToGround = true;
    }
    var entity = viewer.entities.add({
      polyline: polylineOption,
    });
    entity.graphicType = 'polyline'
    entity.graphicName = option.graphicName
    entity.entityId = entityId
    entity.entityProperties = option.entityProperties //entityProperties

    let returnEntities = [entity]
    let billboardEntity: any
    if (option.showBillBoard) {
      let centerGeometry = getCenterGeometry(geometry)
      billboardEntity = drawBillBoard(viewer, centerGeometry, option, entityId, entity)
      // returnEntities.push(billboardEntity)
    }
    return returnEntities
    // viewer.zoomTo(entity);
  }

  //绘制面
  const drawMultiPolygon = (viewer: any, geometry: any, option: any) => {
    let entityId = common.getUuid(10)
    let entities: Array<any> = []
    geometry.coordinates.forEach((item: any) => {
      let returnEntities = drawPolygon(viewer, { coordinates: item, type: 'Polygon' }, option, entityId)
      if (Array.isArray(returnEntities)) {
        entities = entities.concat(returnEntities)
      } else {
        entities.push(returnEntities)
      }
    })
    return entities
  }
  const drawPolygon = (viewer: any, geometry: any, option: any, entityId?: string) => {
    entityId = entityId || common.getUuid(10)
    let coordinates: Array<any> = []
    let holes: Array<any> = []
    geometry.coordinates.forEach((item: Array<any>, index: number) => {
      if (index == 0) {
        item.forEach(coord => {
          coordinates.push(coord[0])
          coordinates.push(coord[1])
        })

        // let lastIndex = geometry.coordinates.length - 1;
        // let _coordinates = geometry.coordinates;
        // if (_coordinates[lastIndex][0] != item[0] && _coordinates[lastIndex][1] != item[1]) {

        // }
      } else {
        let hole: Array<any> = []
        item.forEach(coord => {
          hole.push(coord[0])
          hole.push(coord[1])
        })
        let holeInfo = {
          positions: Cesium.Cartesian3.fromDegreesArray(hole)
        }
        holes.push(holeInfo)
      }
    })
    let entity
    if (option.isWall) {
      entity = drawWall(viewer, geometry, option, holes, entityId)
      entity.graphicType = 'polygon'
    } else {
      let polygonOption: any = {
        //box，ellipse，cylinder.......
        hierarchy: {
          positions: Cesium.Cartesian3.fromDegreesArray(coordinates),
          holes: holes
        },
        outline: option.outline || false,
        outlineColor: option.outlineColor ? Cesium.Color.fromCssColorString(option.outlineColor) : Cesium.Color.RED,
        outlineWidth: option.outlineWidth || 1,
        material: option.color ? Cesium.Color.fromCssColorString(option.color) : Cesium.Color.fromCssColorString('rgba(255,0,0,0.3)'),
        height: option.height ? parseFloat(option.height) : 0,
        extrudedHeight: option.extrudedHeight ? parseFloat(option.extrudedHeight) : 0,
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(option.distance.near || 0, option.distance.far || 30000000),
        // classificationType: Cesium.ClassificationType.TERRAIN
        // heightReference: Cesium.HeightReference.CLAMP_TO_GROUND//设置HeightReference高度参考类型为CLAMP_TO_GROUND贴地类型
        // shadows:Cesium.ShadowMode.ENABLED
      }
      if (option.clampToGround) {
        delete polygonOption.height
        delete polygonOption.extrudedHeight
        polygonOption.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND
      }
      entity = viewer.entities.add({
        polygon: polygonOption
      })

      entity.graphicType = 'polygon'
      entity.graphicName = option.graphicName
      entity.entityId = entityId
      entity.entityProperties = option.entityProperties //entityProperties
      // viewer.zoomTo(entity);
      entity.geometry = geometry
    }
    let returnEntities = [entity]
    let billboardEntity
    if (option.showBillBoard) {
      let centerGeometry = getCenterGeometry(geometry)
      billboardEntity = drawBillBoard(viewer, centerGeometry, option, entityId, entity)
      // returnEntities.push(billboardEntity)
    }
    return returnEntities
  }

  //墙体渐变色
  const getColorRamp = (val: any) => {
    if (val == null) {
      val = { 0.0: 'blue', 0.1: 'cyan', 0.37: 'lime', 0.54: 'yellow', 1: 'red' }
    }
    var ramp = document.createElement('canvas')
    ramp.width = 1
    ramp.height = 100
    var ctx: any = ramp.getContext('2d')
    var grd = ctx.createLinearGradient(0, 0, 0, 100)
    for (var key in val) {
      grd.addColorStop(1 - Number(key), val[key])
    }
    ctx.fillStyle = grd
    ctx.fillRect(0, 0, 1, 100)
    return ramp
  }
  //绘制墙
  const  drawWall = (viewer: any, geometry: any, option: any, holes: any, entityId?: string) => {
    entityId = entityId || common.getUuid(10)
    let { maximumHeights, minimumHeights,clampToGround } = option.wallOption || {}
    let coordinates: Array<any> = []
    let length = geometry.coordinates[0].length
    let maximumHeight:Array<any> = new Array(length).fill(maximumHeights || 50)
    let minimumHeight:Array<any> = new Array(length).fill(minimumHeights || 0)
    var rgba = option.color ? Cesium.Color.fromCssColorString(option.color) : Cesium.Color.fromCssColorString('#00FF33')

    let cartesians: Array<any>=[]

    geometry.coordinates.forEach((item: Array<any>, index: number) => {
      item.forEach((coord: Array<any>) => {
        cartesians.push(Cesium.Cartographic.fromDegrees(coord[0], coord[1], 0))
        coord.forEach((i:number)=>{
          coordinates.push(i)
          // coordinates.push(coord[0])
          // coordinates.push(coord[1])
          // coordinates.push(option.height)
        })
      })
    })

    // 绘制贴地墙，方法可行，但有异步传染，影响值存储-清除图形
    // if (clampToGround) {
    //   maximumHeight = [];
    //   minimumHeight = [];
    //   let clampedCartesians = await Cesium.sampleTerrainMostDetailed(viewer.terrainProvider, cartesians);
    //   if (clampedCartesians.length) {
    //     clampedCartesians.forEach((item: any) => {
    //       item && minimumHeight.push(item.height + minimumHeights);
    //       item && maximumHeight.push(item.height + maximumHeights);
    //     });
    //   }
    // }
    
    var entity = viewer.entities.add({
      wall: {
        // hierarchy:{
        //   positions: Cesium.Cartesian3.fromDegreesArrayHeights(coordinates),
        //   holes:holes
        // },
        // positions: Cesium.Cartesian3.fromDegreesArrayHeights(coordinates),
        positions:
          geometry.coordinates[0][0].length == 3
            ? Cesium.Cartesian3.fromDegreesArrayHeights(coordinates)
            : Cesium.Cartesian3.fromDegreesArray(coordinates),
        maximumHeights: maximumHeight,
        minimumHeights: minimumHeight,
        material: new Cesium.ImageMaterialProperty({
          transparent: true, //设置透明
          image: getColorRamp({
            0.0: rgba.withAlpha(1.0).toCssColorString().replace(")", ",1.0)"),
            0.045: rgba.withAlpha(0.8).toCssColorString(),
            0.1: rgba.withAlpha(0.6).toCssColorString(),
            0.15: rgba.withAlpha(0.4).toCssColorString(),
            0.37: rgba.withAlpha(0.2).toCssColorString(),
            0.54: rgba.withAlpha(0.1).toCssColorString(),
            1.0: rgba.withAlpha(0).toCssColorString(),
          }), //Canvas
        }),
      },
      polyline: {
        positions:
          geometry.coordinates[0][0].length == 3
            ? Cesium.Cartesian3.fromDegreesArrayHeights(coordinates)
            : Cesium.Cartesian3.fromDegreesArray(coordinates),
        width: option.width || 5,
        material: rgba,
        clampToGround: clampToGround ?? true,
        zIndex: 10,
      },
    });
    // entity.graphicType = 'wall'
    entity.graphicName = option.graphicName
    entity.entityId = entityId
    entity.entityProperties = option.entityProperties //entityProperties
    return entity
  }
  
  //绘制billboard
  const drawBillBoard = (viewer: any, geometry: any, option: any, entityId?: string, entity?: any) => {
    entityId = entityId || common.getUuid(10)
    if (option && option.billBoardOption) {
      var billBoardOption = { ...defaultBillBoardOption, ...option.billBoardOption }
    }
    let param = {
      // position : Cesium.Cartesian3.fromDegrees(geometry.coordinates[0], geometry.coordinates[1]),
      position: Cesium.Cartesian3.fromDegrees(geometry.coordinates[0], geometry.coordinates[1], geometry.coordinates[2]),
      label: {
        //   heightReference:Cesium.HeightReference.CLAMP_TO_GROUND,
        //   disableDepthTestDistance:99000000,
        text: billBoardOption.text || '',
        font: billBoardOption.font || '16px Helvetica',
        style: Cesium.LabelStyle[billBoardOption.style || 'FILL'] || Cesium.LabelStyle.FILL,
        outlineWidth: billBoardOption.outlineWidth || 1,
        verticalOrigin: Cesium.VerticalOrigin.TOP,
        fillColor: billBoardOption.fillColor ? Cesium.Color.fromCssColorString(billBoardOption.fillColor) : Cesium.Color.WHITE, //字体颜色
        outlineColor: billBoardOption.outlineColor ? Cesium.Color.fromCssColorString(billBoardOption.outlineColor) : Cesium.Color.WHITE,
        showBackground: billBoardOption.showBackground || false,
        backgroundColor: billBoardOption.backgroundColor ? Cesium.Color.fromCssColorString(billBoardOption.backgroundColor) : Cesium.Color.BLACK, //背景颜色
        pixelOffset: billBoardOption.pixelOffset ? new Cesium.Cartesian2(billBoardOption.pixelOffset[0], billBoardOption.pixelOffset[1]) : new Cesium.Cartesian2(0, 20), //偏移
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        // height: geometry.coordinates[2] + 40,
        // heightReference:Cesium.HeightReference.CLAMP_TO_GROUND,
        //heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
        //   pixelOffset :new Cesium.Cartesian2(1, 20)|| new Cesium.Cartesian2(0, 10),
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(billBoardOption.distance.near || 0, billBoardOption.distance.far || 30000000)
      }
    }
    if (entity) {
      entity.position = param.position
      entity.label = param.label
    } else {
      entity = viewer.entities.add(param)
    }

    // entity.graphicType = 'billboard'
    entity.graphicName = option.graphicName
    entity.entityId = entityId
    entity.entityProperties = option.entityProperties //entityProperties
    if (billBoardOption.url) {
      entity.billboard = {
        image: billBoardOption.url || red_position_2,
        width: billBoardOption.width || 20,
        height: billBoardOption.height || 20,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(billBoardOption.distance.near || 0, billBoardOption.distance.far || 30000000)
      }
    }
    return entity

    //viewer.zoomTo(entity);
  }

  const drawPolygonWithRing = (viewer: any, geometry: any, option: any) => {
    drawPolygon(viewer, geometry, option)
  }
  /**
 * @description: 清除指定graphicName的一类图形

 * @msg: 备注
 * @param {any} viewer - viewer
 * @param {string} graphicName - 需清除图形的标识名
 * @return {*}
 * @author: GS3D
 * Copyright (c) 2023 by SKXX-SDKGroup, All Rights Reserved. 

 * @Remarks: 备注

 * @example
```ts
gs3d.common.draw.clearGraphicByGraphicName(viewer, "graphicName")
```
 */
  export const clearGraphicByGraphicName = (viewer: any, graphicName: string) => {
    allEntities.forEach(item => {
      if (item.graphicName == graphicName) {
        viewer.entities.remove(item)
      }
    })
    allEntities = allEntities.filter(item => {
      return item.graphicName !== graphicName
    })
  }
  /**
 * @description: 清除指定entityId的一个图形

 * @msg: 备注
 * @param {any} viewer - viewer
 * @param {string} entityId - 需清除图形的标识名
 * @return {*}
 * @author: GS3D
 * Copyright (c) 2023 by SKXX-SDKGroup, All Rights Reserved. 

 * @Remarks: 备注

 * @example
```ts
gs3d.common.draw.clearGraphicById(viewer, "entityId")
```
 */
  export const clearGraphicById = (viewer: any, entityId: string) => {
    allEntities.forEach(item => {
      if (item.entityId == entityId) {
        viewer.entities.remove(item)
      }
    })
    allEntities = allEntities.filter(item => {
      return item.entityId !== entityId
    })
  }

  /**
 * @description: 清除全部图形

 * @msg: 备注
 * @param {any} viewer - viewer
 * @return {*}
 * @author: YangYuzhuo
 * Copyright (c) 2023 by SKXX-SDKGroup, All Rights Reserved. 

 * @Remarks: 备注

 * @example
```ts
gs3d.common.draw.clearAllGraphic(viewer)
```
 */
  export const clearAllGraphic = (viewer: any) => {
    allEntities.forEach(item => {
      viewer.entities.remove(item)
    })
    allEntities = []
  }
  const getHeightByLonLat = async (points: any) => {
    let viewer: any
    let positions: Array<any> = []
    points.forEach((point: Array<any>) => {
      positions.push(Cesium.Cartographic.fromDegrees(point[0], point[1]))
    })
    let sampleTerrain: any = Cesium.sampleTerrain
    var promise = new sampleTerrain(viewer.terrainProvider, 13, positions)
    let heights: Array<any> = []
    await promise.then((res: Array<any>) => {
      res.forEach((item: any) => {
        heights.push(item.height)
      })
      return heights
    })
    return heights
  }
  //获取geometry中心点
  const getCenterGeometry = (geometry: any) => {
    let center: any, polygon, centerGeometry
    center = turf.centerOfMass(geometry)
    centerGeometry = center.geometry
    return centerGeometry
  }
}
