/*
 * @Description: <网格热力图>
 * @version: 1.0.0
 * @Author: YangYuzhuo
 * @Date: 2023-08-29 09:24:27
 * @LastEditors GS3D
 * @LastEditTime 2023-11-25 14:55:35
 * Copyright 2023
 * listeners
 * @Descripttion: <文件用途说明>
 * @FilePath \\geogrid3d\\packages\\sdk\\gs3d\\grid\\gridHeatMap.ts
 */

// import axios from "axios";
import * as Cesium from 'cesium'
import { levelSize } from './util/levelSize'
import { common } from '../util/common'
import { color } from '../util/color'
export namespace gridHeatMap {
  export const describe: string = '网格热力图'
  let viewer: any
  let gridHeatmapOption = {
    data: [],
    is3D: false,
    colorType: 'step', //网格内部线性渐变"gradient"||分段颜色"step"
    gradientColor: ['#e5ffe5', '#ffe5e5'], //渐变色[最小值颜色,最大值颜色]
    stepColor: [
      [0, 50, 'rgba(0, 255, 255,0.2)'],
      [50, 100, 'rgba(255, 255, 0,0.2)'],
      [100, 150, 'rgba(0, 255, 0,0.2)'],
      [150, 500, 'rgba(204, 51, 0,0.2)']
    ],
    outLinecolor: 'rgb(51, 204, 204)', //网格边框线
    isLocation: true, //是否定位到网格热力图所在范围
    distance: { near: 0, far: 1500000 }
  }
  let heatmapPrimitiveList: Array<any> = []
  // //网格热力图
  // //旧接口(测试用)
  // const initGridHeatmap = (v: any, option: any) => {
  //   viewer = v;
  //   if (!viewer) {
  //     console.log("请传入viewer");
  //     return;
  //   }
  //   if (!!option) {
  //     gridHeatmapOption = option;
  //   }
  //   let param = {
  //     statisticsStr: JSON.stringify({
  //       id: "countData",
  //       bucket: {
  //         type: "grid",
  //         field: "dataIndex",
  //       },
  //     }),
  //     dataIndex: "pepoinfo",
  //     dataIndexLibraryId: "AYVRd0rDOksQVJfz2VP3",
  //     geometry: JSON.stringify({
  //       coordinates: [
  //         [
  //           [125.39513867011362, 43.82535822310359],
  //           [125.38938639136893, 43.8213194028682],
  //           [125.38642561994652, 43.81924024584072],
  //           [125.38344822095871, 43.81712139363748],
  //           [125.38284257252678, 43.81709731339038],
  //           [125.38272326126958, 43.8170925703659],
  //           [125.381314371661, 43.81703653900513],
  //           [125.38070721146869, 43.81701238681228],
  //           [125.3799796689267, 43.81698344303152],
  //           [125.37912737962495, 43.81694952869782],
  //           [125.37864573421336, 43.8169303623464],
  //           [125.37823231586879, 43.81691392543735],
  //           [125.37710357497008, 43.81686904117339],
  //           [125.37710297602155, 43.816869016891644],
  //           [125.37314186890217, 43.81671142509225],
  //           [125.37272091963484, 43.81669466622594],
  //           [125.37249498565518, 43.81668748693801],
  //           [125.37189399930867, 43.81666838263982],
  //           [125.37111098928074, 43.81664348760694],
  //           [125.37110646928818, 43.816643342816064],
  //           [125.37109739063214, 43.81664305503301],
  //           [125.37109863709247, 43.816644085656094],
  //           [125.37109628806331, 43.816658115979294],
  //           [125.37109534557385, 43.816663744836035],
  //           [125.37209863734233, 43.817426876249385],
  //           [125.37227079456159, 43.817557822035894],
  //           [125.37264257609411, 43.817837986034306],
  //           [125.37264620845576, 43.81784057158518],
  //           [125.37336040146147, 43.81834941519338],
  //           [125.3756060589725, 43.81994929382489],
  //           [125.37561367892818, 43.81995436150464],
  //           [125.37590691097523, 43.82014935880591],
  //           [125.37597572979621, 43.82019573414584],
  //           [125.37679374503534, 43.82077318433505],
  //           [125.37939052845024, 43.82268666735587],
  //           [125.38059360820853, 43.82357311740549],
  //           [125.3827407962508, 43.8252883089084],
  //           [125.38274040774365, 43.825288566114466],
  //           [125.38251240262537, 43.82543154393068],
  //           [125.3820858020182, 43.82569905716582],
  //           [125.38205994381144, 43.82571460194737],
  //           [125.38204043212033, 43.825726333603484],
  //           [125.3819945990715, 43.82575184467197],
  //           [125.38194721199432, 43.825776220796],
  //           [125.38189834463299, 43.82579938373465],
  //           [125.38184809591291, 43.82582127143456],
  //           [125.38179655396789, 43.82584181914467],
  //           [125.38174517659866, 43.825856827930295],
  //           [125.38160374201914, 43.82589815087903],
  //           [125.3815626205186, 43.825910284532085],
  //           [125.38152070401736, 43.825919874902354],
  //           [125.38148226519445, 43.82593061640489],
  //           [125.38144342707255, 43.82594072118741],
  //           [125.38140420853745, 43.825950182055294],
  //           [125.38136465095795, 43.82595898641813],
  //           [125.38132477861575, 43.82596712528266],
  //           [125.3812846283829, 43.82597458875631],
  //           [125.38124422634007, 43.82598137234254],
  //           [125.38120360935909, 43.82598746794736],
  //           [125.38116281790974, 43.82599287107422],
  //           [125.3787947186014, 43.825976851450605],
  //           [125.37829616773399, 43.82597347179836],
  //           [125.37091303410932, 43.825869181017936],
  //           [125.37088267209765, 43.82586879071215],
  //           [125.3708825147163, 43.82587590255093],
  //           [125.37082672527322, 43.82839495396399],
  //           [125.37082667581046, 43.82839717169219],
  //           [125.37082635655122, 43.828411593220494],
  //           [125.37082630708846, 43.82841381094869],
  //           [125.37082446887416, 43.828496783299954],
  //           [125.37082442660608, 43.82849868356743],
  //           [125.37082440861957, 43.82849960986914],
  //           [125.37082893490754, 43.828499706096636],
  //           [125.3708367742978, 43.828499871571864],
  //           [125.37083673113034, 43.82850213156814],
  //           [125.37083657554763, 43.82851007438046],
  //           [125.37084109554019, 43.82851021017814],
  //           [125.37090254891359, 43.828512069976114],
  //           [125.3709070761007, 43.82851220757237],
  //           [125.37946091838671, 43.82877062146707],
  //           [125.38106256508536, 43.82875717930045],
  //           [125.38135105230924, 43.82866166500389],
  //           [125.38142586960828, 43.828636894077476],
  //           [125.38146213836706, 43.828624885430145],
  //           [125.38187891747816, 43.82834795899117],
  //           [125.38194059388331, 43.82827529466914],
  //           [125.38241994422515, 43.82771055100119],
  //           [125.38311050124867, 43.8272049332611],
  //           [125.38312797417677, 43.82719214040503],
  //           [125.38368625261853, 43.82713119334994],
  //           [125.38487955584685, 43.82700091036378],
  //           [125.38487952886726, 43.82700088518277],
  //           [125.3850098019609, 43.82698666060594],
  //           [125.38504401666808, 43.826982926620815],
  //           [125.38712689059355, 43.82688919837784],
  //           [125.3875690395796, 43.826869298179645],
  //           [125.3895868853266, 43.827353700912624],
  //           [125.38987919287047, 43.82742386961593],
  //           [125.39040250657047, 43.82747628929934],
  //           [125.39079651484735, 43.82738676808492],
  //           [125.39080200610772, 43.82738552072527],
  //           [125.39114164047442, 43.82725151544514],
  //           [125.39146576153576, 43.82707132458199],
  //           [125.39413162277629, 43.82544398964848],
  //           [125.3941473860931, 43.825434366003265],
  //           [125.3949005755012, 43.82526425114435],
  //           [125.39490506401751, 43.82526323670908],
  //           [125.39490509369523, 43.82526325919213],
  //           [125.39490870717111, 43.82526577999181],
  //           [125.39502919024494, 43.82534986480448],
  //           [125.3950493035826, 43.825363902322295],
  //           [125.39505031801787, 43.8253638375711],
  //           [125.39505576341287, 43.82536349223142],
  //           [125.39513867011362, 43.82535822310359],
  //         ],
  //       ],
  //       type: "Polygon",
  //     }),
  //     scopeFlg: true,
  //   };
  //   axios({
  //     method: "GET",
  //     url: "/engine/iwhereEngine-statistics-3/data/datastatistics/statistics",
  //     params: param,
  //   })
  //     .then((res) => {
  //       console.log(res);
  //       if (!!res.data && !!res.data.countData && !!res.data.countData.length) {
  //         let data: Array<any> = [];
  //         res.data.countData.forEach((item: any) => {
  //           let bucketKeyFormat = item.bucketKey.split("|");
  //           let bucketKeyCoord = bucketKeyFormat[1].split(",");
  //           data.push({
  //             count: item.metrics.docCount,
  //             grid: bucketKeyCoord
  //           })
  //         })
  //         drawGridHeatmap(data);
  //       }
  //     })
  //   // .catch((err) => {
  //   //   console.log("获取行政区划geometry：" + err);
  //   // });
  // }
  export const drawGridHeatmap = (v: any, option: any) => {
    viewer = v
    if (!viewer) {
      console.log('请传入viewer')
      return
    }
    if (!!option) {
      gridHeatmapOption = { ...gridHeatmapOption, ...option }
    }
    let { is3D, colorType, gradientColor, stepColor, outLinecolor, isLocation, distance } = gridHeatmapOption || {}
    let countData: Array<any> = gridHeatmapOption.data || []
    let innerInstanceList: Array<any> = []
    let outlineInstanceList: Array<any> = []

    // let minExtentLatArray: Array<any> = []
    // let minExtentLngArray: Array<any> = []
    // let maxExtentLatArray: Array<any> = []
    // let maxExtentLngArray: Array<any> = []

    let minmaxCounter = new common.MinMaxCounter()
    countData.forEach(item => {
      // item.count = parseInt(Math.random() * 1000);
      minmaxCounter.update(item.count)
    })
    let [minCount, maxCount = 1] = minmaxCounter.result()
    console.log('最大最小值：', maxCount, minCount)

    let gradient: any
    if (colorType == 'gradient') {
      gradient = color.gradientColor(
        gradientColor[0] || '#e5ffe5', //绿
        // "#008000",

        gradientColor[1] || '#ffe5e5', //红
        // "#ff0000",

        maxCount - minCount + 1
      )
    }

    let bboxCounter = new levelSize.BBOXCounter()
    countData.forEach(item => {
      // let bucketKeyFormat = item.bucketKey.split("|");
      // let bucketKeyCoord = bucketKeyFormat[1].split(",");
      let bucketKeyCoord = item.grid
      let minlat = Math.min(bucketKeyCoord[1], bucketKeyCoord[3])
      let minlng = Math.min(bucketKeyCoord[0], bucketKeyCoord[2])
      let maxlat = Math.max(bucketKeyCoord[1], bucketKeyCoord[3])
      let maxlng = Math.max(bucketKeyCoord[0], bucketKeyCoord[2])

      bboxCounter.update(minlng, minlat)
      bboxCounter.update(maxlng, maxlat)
      // if (minlat > 10) {
      // minExtentLatArray.push(minlat)
      // minExtentLngArray.push(minlng)
      // maxExtentLatArray.push(maxlat)
      // maxExtentLngArray.push(maxlng)
      // }
      let height = is3D ? (100 * (item.count - minCount)) / (maxCount - minCount) + 5 : 0
      let rectangle = Cesium.Rectangle.fromDegrees(minlng, minlat, maxlng, maxlat)
      let rectangleOutlineInstance = new Cesium.GeometryInstance({
        geometry: new Cesium.RectangleOutlineGeometry({
          rectangle: rectangle,
          height: height,
          extrudedHeight: 0
        }),
        attributes: {
          color: Cesium.ColorGeometryInstanceAttribute.fromColor(
            // Cesium.Color.GREEN
            Cesium.Color.fromCssColorString(outLinecolor || 'rgb(0, 204, 255)')
          ),
          distanceDisplayCondition: new Cesium.DistanceDisplayConditionGeometryInstanceAttribute(distance.near, distance.far)
        },
        id: 'gridHeatmap'
      })
      let rectangleInnerInstance = new Cesium.GeometryInstance({
        geometry: new Cesium.RectangleGeometry({
          rectangle: rectangle,
          height: height,
          extrudedHeight: 0
        }),
        attributes: {
          color: Cesium.ColorGeometryInstanceAttribute.fromColor(
            // Cesium.Color.GREEN.withAlpha((1 * item.metrics.docCount) / maxCount)
            colorType == 'gradient' ? Cesium.Color.fromCssColorString(gradient[item.count - minCount]) : getStepColor(item.count, stepColor)
          ),
          distanceDisplayCondition: new Cesium.DistanceDisplayConditionGeometryInstanceAttribute(distance.near, distance.far)
        },
        id: 'gridHeatmap'
      })

      outlineInstanceList.push(rectangleOutlineInstance)
      innerInstanceList.push(rectangleInnerInstance)
    })
    if (!!isLocation) {
      let [minExtentLng, minExtentLat, maxExtentLng, maxExtentLat] = bboxCounter.result()

      const diff_lat = maxExtentLat - minExtentLat
      const diff_lng = maxExtentLng - minExtentLng
      // const length = countData.length
      let extentRectangle = Cesium.Rectangle.fromDegrees(minExtentLng - diff_lng / 3, minExtentLat - diff_lat / 3, maxExtentLng + diff_lng / 3, maxExtentLat + diff_lat / 3)
      // let offset = 0.001;
      // let extentRectangle = Cesium.Rectangle.fromDegrees(
      //   minExtentLng - offset,
      //   minExtentLat - offset,
      //   maxExtentLng + offset,
      //   maxExtentLat + offset
      // );
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
    let bprimitive = new Cesium.Primitive({
      geometryInstances: outlineInstanceList, //格子们的instance
      allowPicking: false,
      releaseGeometryInstances: false,
      appearance: new Cesium.PerInstanceColorAppearance({
        flat: true, //为true 无光照
        // translucent: false, //透明配置，false是不透明
        renderState: {
          lineWidth: Math.min(1.0, viewer.scene.maximumAliasedLineWidth)
        }
      })
    })

    let innerprimitive = new Cesium.Primitive({
      geometryInstances: innerInstanceList, //格子们的instance
      allowPicking: false,
      releaseGeometryInstances: false,
      appearance: new Cesium.PerInstanceColorAppearance({
        flat: true //为true 无光照
        // translucent: false, //透明配置，false是不透明
        // renderState: {
        //   lineWidth: Math.min(4.0, viewer.scene.maximumAliasedLineWidth),
        // },
      })
    })

    viewer.scene.primitives.add(bprimitive)
    viewer.scene.primitives.add(innerprimitive)
    let rqPrimitive = [bprimitive, innerprimitive]
    heatmapPrimitiveList.push({ rqPrimitive: rqPrimitive })
  }
  const getStepColor = (count: number, stepColor: Array<any>) => {
    let colorItem = stepColor.find(item => {
      return count >= item[0] && count < item[1]
    })
    return Cesium.Color.fromCssColorString(colorItem[2])
  }
  const getBaseGridsOption = () => {
    //获取当前相机高度
    let height = viewer.camera.positionCartographic.height
    let geo_level = levelSize.calculateMapLevel(height)

    //现场参数
    let option = {
      geo_level: geo_level
    }
    return option //返回屏幕所在经纬度范围
  }
  export const clearGridHeatmap = () => {
    if (!!heatmapPrimitiveList[0] && !!heatmapPrimitiveList[0].rqPrimitive[0]) {
      heatmapPrimitiveList[0].rqPrimitive[0].show = false
      heatmapPrimitiveList[0].rqPrimitive[1].show = false
      heatmapPrimitiveList = []
    }
  }
}
