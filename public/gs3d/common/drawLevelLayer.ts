/*
 * @Description: <行政区划分级加载>
 * @version: 1.0.0
 * @Author: YangYuzhuo
 * @Date: 2023-08-29 09:24:27
 * @LastEditors GS3D
 * @LastEditTime 2023-11-25 16:43:56
 * Copyright 2023
 * listeners
 * @Descripttion: <文件用途说明>
 * @FilePath \\geogrid3d\\packages\\sdk\\gs3d\\common\\drawLevelLayer.ts
 */
import * as Cesium from 'cesium'
import * as turf from '@turf/turf'
import { draw } from './draw'

export namespace drawLevelLayer {
  export const describe = '图层分级绘制'

  let viewer: any
  let xzqhlevelLoadOption = {
    geometryValName: 'iwhereGeometry', //geometry对应的属性字段名
    xzqhValName: 'name', //行政区划名对应的属性字段名
    defaultTile: 11, //初始化默认tile层级
    xzqhInterval: [
      {
        id: 0, //行政区划级别越高，id值越小
        xzqhlevel: '区', //图层标签
        tileLevel: [0, 10], //切片层级 min =< num < max
        // distance: [7000, 100000000], //搭配height用，会受pitch影响效果不好，弃用
        color: '#ff9999', // "#50b2b7", //"#ff9999", //线颜色//"#c4dafa"
        font: 'bold 20px Microsoft YaHei', //字体
        width: 6, //线宽
        data: [], //行政区划dataList数据，需包含geometry和行政区划名
        zIndex: 4 //叠加层级，数字越大越在上
      },
      {
        id: 1,
        xzqhlevel: '街道',
        tileLevel: [10, 13],
        // distance: [5000, 7000],
        color: '#99ccff', //"#50b2b7", //"#99ccff",
        font: 'bold 18px Microsoft YaHei',
        width: 4,
        data: [],
        zIndex: 3
      },
      {
        id: 2,
        xzqhlevel: '社区',
        tileLevel: [13, 15],
        // distance: [3000, 5000],
        color: '#93cfd2', //"#50b2b7", //"#ffffcc",
        font: 'bold 16px Microsoft YaHei',
        width: 3,
        data: [],
        zIndex: 2
      },
      {
        id: 3,
        xzqhlevel: '小区',
        tileLevel: [14, 23],
        // distance: [0, 3000],
        color: '#ffcc99', //"#b3b3b3", //"#50b2b7", //"#cccccc",
        font: 'bold 14px Microsoft YaHei',
        width: 2,
        data: [],
        zIndex: 1
      }
    ]
  }
  let currentLevel: any
  let xzqhEntityList = []
  let handler: any

  /**
   * @description 初始化行政区划分级绘制
   * @param {any} v - viewer
   * @param {any} option - 配置项
   * @return {*}
   * @example
   * ```ts
   * let xzqhData = {
   *   "qu": [
   *     {
   *       "iwhereGeometry": {
   *         "coordinates": [[[],[],[],[]]],
   *         "type": "Polygon"
   *       },
   *       "name": "净月区",
   *     }
   *   ],
   *   "jd": [],
   *   "sq": [],
   *   "xq": []
   * }
   * let option = {
   *   geometryValName: "iwhereGeometry",//geometry对应的属性字段名
   *   xzqhValName: "name",//行政区划名对应的属性字段名
   *   xzqhInterval: [
   *     {
   *       id: 0, //行政区划级别越高，id值越小
   *       xzqhlevel: "区", //图层标签
   *       tileLevel: [0, 10], //切片层级 min =< num < max
   *       color: "#ff9999", // "#50b2b7", //"#ff9999", //线颜色//"#c4dafa"
   *       font: "bold 20px Microsoft YaHei", //字体
   *       width: 6, //线宽
   *       data: xzqhData.qu, //行政区划dataList数据，需包含geometry和行政区划名
   *       zIndex: 4, //叠加层级，数字越大越在上
   *     },
   *     {
   *       id: 1,
   *       xzqhlevel: "街道",
   *       tileLevel: [10, 13],
   *       color: "#99ccff", //"#50b2b7", //"#99ccff",
   *       font: "bold 18px Microsoft YaHei",
   *       width: 4,
   *       data: xzqhData.jd,
   *       zIndex: 3,
   *     },
   *     {
   *       id: 2,
   *       xzqhlevel: "社区",
   *       tileLevel: [13, 15],
   *       color: "#93cfd2", //"#50b2b7", //"#ffffcc",
   *       font: "bold 16px Microsoft YaHei",
   *       width: 3,
   *       data: xzqhData.sq,
   *       zIndex: 2,
   *     },
   *     {
   *       id: 3,
   *       xzqhlevel: "小区",
   *       tileLevel: [14, 23],
   *       color: "#ffcc99", //"#b3b3b3", //"#50b2b7", //"#cccccc",
   *       font: "bold 14px Microsoft YaHei",
   *       width: 2,
   *       data: xzqhData.xq,
   *       zIndex: 1,
   *     },
   *   ]
   * }
   * gs3d.common.drawLevelLayer.initXzqhLevelLoad(viewer, option)
   * ```
   */
  export const initXzqhLevelLoad = (v: any, option: any) => {
    //方法三：监听相机+tile层级
    viewer = v
    if (!viewer) {
      console.log('请传入viewer')
      return
    }
    if (!option.xzqhInterval) {
      console.log('请传入xzqhInterval')
      return
    }
    if (!!option) {
      xzqhlevelLoadOption = { ...xzqhlevelLoadOption, ...option }
    }
    levelLoad()
    handler = function () {
      levelLoad()
    }
    viewer.scene.camera.changed.addEventListener(handler)
  }
  /**
   * @description 清除行政区划分级绘制
   * @return {*}
   * @example
   * ```ts
   * gs3d.common.drawLevelLayer.clear()
   * ```
   */
  export const clear = () => {
    if (handler) {
      viewer.camera.changed.removeEventListener(handler)
      handler = null
    }
    xzqhEntityList.forEach(item => {
      item.entities.forEach((t: any) => {
        viewer.entities.remove(t)
      })
    })
    xzqhEntityList = []
    currentLevel = null
  }
  // //方法二：监听滚轮+tile层级(初始化加载不便，弃用)
  // function initXzqhLevelLoad2() {
  //   // let _this = this;
  //   //debugger;
  //   init();
  //   let handlerWHEEL;
  //   // 获取鼠标当前高度，并根据高度去改变热力图效果
  //   handlerWHEEL =
  //     !handlerWHEEL && new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  //   //监听鼠标滚轮事件
  //   handlerWHEEL.setInputAction((wheelment) => {
  //     levelLoad();
  //   }, Cesium.ScreenSpaceEventType.WHEEL);
  // }
  // function init() {
  //   // let _this = this;
  //   let tile = getTile();
  //   if (tile == -Infinity || tile == 0) {
  //     setTimeout(() => {
  //       init();
  //     }, 100);
  //   } else {
  //     levelLoad();
  //   }
  // }
  // //方法一：监听相机+相机高度(相机高度受pitch影响，效果不好，弃用)
  // function initXzqhLevelLoad1() {
  //   // let _this = this;
  //   viewer.scene.camera.changed.addEventListener(function () {
  //     //获取当前相机高度
  //     let height = Math.ceil(viewer.camera.positionCartographic.height);

  //     // //从Cesium中获取当前相机高度
  //     // let cartographicheight = Cesium.Cartographic.fromCartesian(
  //     //   viewer.camera.position
  //     // );
  //     // let height = Number(cartographicheight.height.toFixed(0));
  //     // console.log(height1,height);

  //     let xzqhItem = xzqhInterval.find((item) => {
  //       return height > item.distance[0] && height <= item.distance[1];
  //     });

  //     //分级加载策略
  //     if (xzqhItem.id == currentLevel) {
  //       console.log(xzqhItem.xzqhlevel);
  //       return;
  //     } else if (xzqhItem.id < currentLevel) {
  //       console.log(xzqhItem.xzqhlevel);
  //       //低级->高级：清除低级xzqh，判断是否已绘制高级行政区划
  //       xzqhInterval.forEach((item) => {
  //         if (item.id > xzqhItem.id) {
  //           removeXzqh(item.xzqhlevel);
  //         }
  //       });
  //       let xzqhEntityItem = xzqhEntityList.find((item) => {
  //         return item.id == xzqhItem.xzqhlevel;
  //       });
  //       if (!xzqhEntityItem) {
  //         getXzqh(xzqhItem);
  //       }
  //       currentLevel = xzqhItem.id;
  //     } else {
  //       console.log(xzqhItem.xzqhlevel);
  //       //高级->低级：绘制低级行政区划
  //       getXzqh(xzqhItem);
  //       currentLevel = xzqhItem.id;
  //     }
  //   });
  // }
  const levelLoad = () => {
    // let _this = this;
    //获取当前切片层级
    let tile = getTile()
    if (tile == Infinity) {
      tile = xzqhlevelLoadOption.defaultTile
    }
    let xzqhItem = xzqhlevelLoadOption.xzqhInterval.find(item => {
      return tile >= item.tileLevel[0] && tile < item.tileLevel[1]
    })
    if (!xzqhItem) {
      return
    }

    //分级加载策略
    //以当前级别为基准，清除比其低的，绘制等于高于其的
    if (xzqhItem.id == currentLevel) {
      // console.log(xzqhItem.xzqhlevel);
      return
    } else {
      xzqhlevelLoadOption.xzqhInterval.forEach((item: any) => {
        if (item.id > xzqhItem.id) {
          removeXzqh(item.xzqhlevel)
        } else {
          let xzqhEntityItem = xzqhEntityList.find(i => {
            return i.id == item.xzqhlevel
          })
          if (!xzqhEntityItem) {
            getXzqh(item)
          }
        }
      })
      currentLevel = xzqhItem.id
    }

    return
    // //分级加载策略
    // if (xzqhItem.id == currentLevel) {
    //   // console.log(xzqhItem.xzqhlevel);
    //   return;
    // } else if (xzqhItem.id < currentLevel) {
    //   // console.log(xzqhItem.xzqhlevel);
    //   //低级->高级：清除低级xzqh，判断是否已绘制高级行政区划，绘制此高级及以上所有
    //   xzqhInterval.forEach((item) => {
    //     if (item.id > xzqhItem.id) {
    //       removeXzqh(item.xzqhlevel);
    //     } else {
    //       let xzqhEntityItem = xzqhEntityList.find((i) => {
    //         return i.id == item.xzqhlevel;
    //       });
    //       if (!xzqhEntityItem) {
    //         getXzqh(item);
    //       }
    //     }
    //   });

    //   currentLevel = xzqhItem.id;
    // } else {
    //   // console.log(xzqhItem.xzqhlevel);
    //   //高级->低级：绘制低级行政区划,判断是否已绘制比其高的行政区划
    //   getXzqh(xzqhItem);
    //   xzqhInterval.forEach((item) => {
    //     if (item.id < xzqhItem.id) {
    //       let xzqhEntityItem = xzqhEntityList.find((i) => {
    //         return i.id == item.xzqhlevel;
    //       });
    //       if (!xzqhEntityItem) {
    //         getXzqh(item);
    //       }
    //     }
    //   });
    //   currentLevel = xzqhItem.id;
    // }
  }
  const getTile = () => {
    //从Cesium中获取当前地图瓦片等级
    let tiles = [],
      tile: number
    let tilesToRender = viewer.scene.globe._surface._tilesToRender
    if (Cesium.defined(tilesToRender)) {
      for (let i = 0; i < tilesToRender.length; i++) {
        tiles.push(tilesToRender[i].level)
      }
      tile = Math.min(...tiles)
      let tile2 = Math.max(...tiles)
      // console.log("当前地图瓦片级别范围为:", tile, tile2);
      return tile
    }
    // // //从Cesium中获取当前相机高度
    // let cartographicheight = Cesium.Cartographic.fromCartesian(
    //   viewer.camera.position
    // );
    // let height = Number(cartographicheight.height.toFixed(0));
    // console.log(height);
  }
  const getXzqh = (xzqhItem: any) => {
    let data = xzqhItem.data
    drawXzqh(data, xzqhItem)
    // console.log("绘制", xzqhItem.xzqhlevel);
  }
  const drawXzqh = (dataList: any, xzqhItem: any) => {
    let entities = []
    dataList.forEach(item => {
      let option = {
        color: 'rgba(255,0,0,0.0001)',
        outline: false,
        outlineColor: xzqhItem.color, //'Cesium.Color.RED',//#041d48//00FF33
        outlineWidth: 1,
        properties: item,
        showBillBoard: false
      }
      let entity = draw.drawGraphic(viewer, item[xzqhlevelLoadOption.geometryValName], option)
      //单独设置线条样式
      entity = entity[0]
      var positions = entity.polygon.hierarchy._value.positions
      entity.polyline = {
        positions: positions,
        width: xzqhItem.width,
        material: Cesium.Color.fromCssColorString(xzqhItem.color),
        clampToGround: true,
        zIndex: xzqhItem.zIndex
      }
      //添加label
      //计算中心
      // var polyCenter = Cesium.BoundingSphere.fromPoints(positions).center; //中心点
      // polyCenter = Cesium.Ellipsoid.WGS84.scaleToGeodeticSurface(polyCenter);
      // entity.position = polyCenter;

      //计算重心
      var value = []
      var center = []
      var a = 0
      var b = 0
      for (var j = 0; j <= entity.polygon._hierarchy._value.positions.length - 1; j++) {
        value[j] = [entity.polygon._hierarchy._value.positions[j].x, entity.polygon._hierarchy._value.positions[j].y]
        a = entity.polygon._hierarchy._value.positions[j].z
        b = b + a
      }
      var polygon = turf.polygon([value])
      var centroid = turf.centroid(polygon)
      center = [centroid.geometry.coordinates[0], centroid.geometry.coordinates[1], b / entity.polygon._hierarchy._value.positions.length]
      var labelpostion = Cesium.Cartesian3.fromArray(center)
      entity.position = labelpostion

      entity.label = {
        text: item[xzqhlevelLoadOption.xzqhValName],
        font: xzqhItem.font || 'bold 15px Microsoft YaHei',
        // 竖直对齐方式
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        // 水平对齐方式
        horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
        // 偏移量
        pixelOffset: new Cesium.Cartesian2(-25, 0),
        style: Cesium.LabelStyle.FILL,
        fillColor: Cesium.Color.fromCssColorString(xzqhItem.color)
        // scale: 1.5,
        // showBackground: true, //设置文本背景
        // backgroundColor: Cesium.Color.fromCssColorString("#50b2b7"), //设置文本背景颜色,
      }
      entity.label.disableDepthTestDistance = Number.POSITIVE_INFINITY //防止label被建筑遮盖
      // entity.id = xzqhItem.xzqhlevel;
      entities.push(entity)
    })
    xzqhEntityList.push({
      id: xzqhItem.xzqhlevel,
      entities: entities
    })
  }
  const removeXzqh = (xzqhlevel: any) => {
    let xzqhEntityItem = xzqhEntityList.find((item: any) => {
      return item.id == xzqhlevel
    })
    xzqhEntityItem &&
      xzqhEntityItem.entities.forEach((item: any) => {
        viewer.entities.remove(item)
      })
    // xzqhEntityItem && console.log("移除", xzqhlevel);
    let index = xzqhEntityList.findIndex((item: any) => {
      return item.id == xzqhlevel
    })
    index !== -1 && xzqhEntityList.splice(index, 1)
  }
}
