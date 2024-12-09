<!--
 * @Author: lzz 599218337@qq.com
 * @Date: 2024-04-30 09:13:56
 * @LastEditors: lzz 599218337@qq.com
 * @LastEditTime: 2024-07-17 16:05:53
 * @FilePath: /industry_demo/src/App.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<script setup lang="ts">
import * as gs3d from '../public/gs3d/index'
import tileJson from './static/3DTile';
import { grid23Json, grid22Json, grid21Json, grid20Json } from './static/gridJson'
import { onMounted, ref } from 'vue'

const { Cesium } = gs3d
let viewer: any
let selectedFeature = ref();


const selectFeature = (feature: any) => {
  console.log('feature：', feature);
  const element = feature.getProperty("deviceName");
  console.log('element：', element);
  setElementColor(element, Cesium.Color.YELLOW);
  selectedFeature.value = feature;
}

const unselectFeature = (feature: any) => {
  if (!Cesium.defined(feature)) {
    return;
  }
  const element = feature.getProperty("element");
  setElementColor(element, Cesium.Color.WHITE);
  if (feature === selectedFeature.value) {
    selectedFeature.value = undefined;
  }
}
onMounted(async () => {
  const defopt = {
    msaaSamples: 4,
    infoBox: true
    // terrain: Cesium.Terrain.fromWorldTerrain(),
  }
  viewer = gs3d.global.initViewer('mapContainer', defopt)
  // Sandcastle.addToggleButton("Per-feature selection", false, function (
  //   checked
  // ) {
  //   picking = checked;
  //   if (!picking) {
  //     unselectFeature(selectedFeature);
  //   }
  // });
  try {
    // const resource = await Cesium.Cesium3DTileset.fromUrl(testResource);
    const url = 'https://assets.ion.cesium.com/ap-northeast-1/2464651/tileset.json?v=1'
    const resource = Cesium.Resource.createIfNeeded(url);
    const tileset = new Cesium.Cesium3DTileset({});
    tileset._resource = resource;
    tileset._url = resource.url;
    tileset._geometricError = undefined;
    tileset._scaledGeometricError = undefined;
    tileset._asset = tileJson.asset;
    tileset._credits = [];
    tileset._properties = undefined;
    tileset._extensionsUsed = tileJson.extensionsUsed;
    tileset._extensions = undefined;
    tileset._modelUpAxis = Cesium.Axis.Y;
    tileset._modelForwardAxis = Cesium.Axis.X;
    tileset._root = tileset.loadTileset(resource, tileJson);
    console.log('tileset：', tileset);
    const boundingVolume = tileset._root.createBoundingVolume(
      tileJson.root.boundingVolume,
      Cesium.Matrix4.IDENTITY
    );
    const clippingPlanesOrigin = boundingVolume.boundingSphere.center;
    const originCartographic = tileset._ellipsoid.cartesianToCartographic(
      clippingPlanesOrigin
    );
    if (
      Cesium.defined(originCartographic) &&
      originCartographic.height >
      Cesium.ApproximateTerrainHeights._defaultMinTerrainHeight
    ) {
      tileset._initialClippingPlanesOriginMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(
        clippingPlanesOrigin
      );
    }
    tileset._clippingPlanesOriginMatrix = Cesium.Matrix4.clone(
      tileset._initialClippingPlanesOriginMatrix
    );


    viewer.scene.primitives.add(tileset);

    viewer.zoomTo(
      tileset,
      new Cesium.HeadingPitchRange(
        0.5,
        -0.2,
        tileset.boundingSphere.radius * 4.0
      )
    );

    tileset.colorBlendMode = Cesium.Cesium3DTileColorBlendMode.REPLACE;
    tileset.tileLoad.addEventListener(function (tile: any) {
      processTileFeatures(tile, loadFeature);
    });

    tileset.tileUnload.addEventListener(function (tile: any) {
      processTileFeatures(tile, unloadFeature);
    });
  } catch (error) {
    console.log(`Error loading tileset: ${error}`);
  }
  openPick()
})

const openPick = () => {
  let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)

  handler.setInputAction(function (movement: { endPosition: any; }) {

    const feature = viewer.scene.pick(movement.endPosition);
    unselectFeature(selectedFeature.value);

    if (feature instanceof Cesium.Cesium3DTileFeature) {

      selectFeature(feature);
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

  handler.setInputAction(async (e: any) => {
    let position = e.position
    let pick = viewer.scene.pick(position)
    console.log('pick：', pick, e);
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
}

const elementMap = {} as any; // Build a map of elements to features.
const hiddenElements = [
  112001,
  113180,
  131136,
  113167,
  71309,
  109652,
  111178,
  113156,
  113170,
  124846,
  114076,
  131122,
  113179,
  114325,
  131134,
  113164,
  113153,
  113179,
  109656,
  114095,
  114093,
  39225,
  39267,
  113149,
  113071,
  112003,
  39229,
  113160,
  39227,
  39234,
  113985,
  39230,
  112004,
  39223,
];

const getElement = (feature: any) => {
  return parseInt(feature.getProperty("element"), 10);
}

const setElementColor = (element: any, color: any) => {
  const featuresToColor = elementMap[element];
  const length = featuresToColor.length;
  for (let i = 0; i < length; ++i) {
    const feature = featuresToColor[i];
    feature.color = Cesium.Color.clone(color, feature.color);
  }
}

const unloadFeature = (feature: any) => {
  unselectFeature(feature);
  const element = getElement(feature);
  const features = elementMap[element];
  const index = features.indexOf(feature);
  if (index > -1) {
    features.splice(index, 1);
  }
}

const loadFeature = (feature: any) => {
  const element = getElement(feature);
  let features = elementMap[element];
  if (!Cesium.defined(features)) {
    features = [];
    elementMap[element] = features;
  }
  features.push(feature);

  if (hiddenElements.indexOf(element) > -1) {
    feature.show = false;
  }
}

const processContentFeatures = (content: any, callback: Function) => {
  const featuresLength = content.featuresLength;
  for (let i = 0; i < featuresLength; ++i) {
    const feature = content.getFeature(i);
    callback(feature);
  }
}

const processTileFeatures = (tile: any, callback: Function) => {
  const content = tile.content;
  const innerContents = content.innerContents;
  if (Cesium.defined(innerContents)) {
    const length = innerContents.length;
    for (let i = 0; i < length; ++i) {
      processContentFeatures(innerContents[i], callback);
    }
  } else {
    processContentFeatures(content, callback);
  }
}

const addGrid = () => {
  let options: any = {
    height: gridLevel.value === 23 ? 40 : gridLevel.value === 22 ? 80 : gridLevel.value === 21 ? 100 : gridLevel.value === 20 ? 150 : 100,
    floor: gridLevel.value === 23 ? 6 : gridLevel.value === 22 ? 5 : gridLevel.value === 21 ? 4 : gridLevel.value === 20 ? 3 : 10,
    lineColor: "#FFA500",
    lineAlpha: 0.5,
    outlineShow: true,
    // fillColor: "#0000ff",
    fillAlpha: 0,
    boxShow: true,
    elevation: 0,
    geometries: [],
  }
  const gridJson = gridLevel.value === 23 ? grid23Json : gridLevel.value === 22 ? grid22Json : gridLevel.value === 21 ? grid21Json : gridLevel.value === 20 ? grid20Json : grid23Json
  options.geometries = gridJson.map((geo) => {
    return {
      id: geo.geoNum4,
      rectangle: [geo.geoNumScope[1], geo.geoNumScope[0], geo.geoNumScope[3], geo.geoNumScope[2]]
    }
  })
  gs3d.grid.buildGrid.draw(options, viewer)
  // locationBuildingGrid(buildingGridJson)
}

const removeBuildingGrid = () => {
  gs3d.grid.buildGrid.clear()
}
const gridLevel = ref(23)

const flag = ref(false)

const showGrid = () => {
  if (flag.value) {
    removeBuildingGrid()
  } else {
    addGrid()
  }

  flag.value = !flag.value
}


const addModel18glb = async () => {


  const position = Cesium.Cartesian3.fromDegrees(
    -123.0744619,
    44.0503706,
    0
  )
  const heading = Cesium.Math.toRadians(135)
  const pitch = 0
  const roll = 0
  const hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll)
  const orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr)
  const entity = viewer.entities.add({
    name: '18栋',
    position: position,
    orientation: orientation,
    model: {
      uri: '18栋.glb',
      minimumPixelSize: 128,
      maximumScale: 20000
    }
  })
  viewer.trackedEntity = entity
}

const addModel18ifc = async () => {
  const tileSet = await Cesium.Cesium3DTileset.fromUrl('18_2ifc/tileset.json')
  // tileSet.style = new Cesium.Cesium3DTileStyle({
  //   color: "color('green')",
  // })
  const cartographic = Cesium.Cartographic.fromCartesian(tileSet.boundingSphere.center)
  const surface = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, cartographic.height)
  const m = Cesium.Transforms.eastNorthUpToFixedFrame(surface)
  const _scale = Cesium.Matrix4.fromUniformScale(10)
  Cesium.Matrix4.multiply(m, _scale, m)
  tileSet.root.transform = m
  const cartographic2 = Cesium.Cartographic.fromCartesian(tileSet.boundingSphere.center)
  const surface2 = Cesium.Cartesian3.fromRadians(cartographic2.longitude, cartographic2.latitude, cartographic2.height)
  const offset = Cesium.Cartesian3.fromDegrees(117.05435995706138, 36.674984212615854, 20)
  const translation = Cesium.Cartesian3.subtract(offset, surface2, new Cesium.Cartesian3())
  tileSet.modelMatrix = Cesium.Matrix4.fromTranslation(translation)
  // const rotationAngle = Cesium.Math.toRadians(45) // 45度旋转角度
  // const rotationMatrix = Cesium.Matrix3.fromRotationZ(rotationAngle)
  // const rotationMatrix4 = Cesium.Matrix4.fromRotationTranslation(rotationMatrix)

  // // 将旋转矩阵应用到模型矩阵上
  // Cesium.Matrix4.multiply(tileSet.modelMatrix, rotationMatrix4, tileSet.modelMatrix)
  viewer.scene.primitives.add(tileSet)
  viewer.zoomTo(tileSet)

}

const addModelChang1F = async () => {
  const tileSet = await Cesium.Cesium3DTileset.fromUrl('chang_ji_1F/tileset.json')
  // tileSet.style = new Cesium.Cesium3DTileStyle({
  //   color: "color('green')",
  // })
  const cartographic = Cesium.Cartographic.fromCartesian(tileSet.boundingSphere.center)
  const surface = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, cartographic.height)
  const m = Cesium.Transforms.eastNorthUpToFixedFrame(surface)
  const _scale = Cesium.Matrix4.fromUniformScale(10)
  Cesium.Matrix4.multiply(m, _scale, m)
  tileSet.root.transform = m
  const cartographic2 = Cesium.Cartographic.fromCartesian(tileSet.boundingSphere.center)
  const surface2 = Cesium.Cartesian3.fromRadians(cartographic2.longitude, cartographic2.latitude, cartographic2.height)
  const offset = Cesium.Cartesian3.fromDegrees(117.05435995706138, 38.674984212615854, 20)
  const translation = Cesium.Cartesian3.subtract(offset, surface2, new Cesium.Cartesian3())
  tileSet.modelMatrix = Cesium.Matrix4.fromTranslation(translation)
  // const rotationAngle = Cesium.Math.toRadians(45) // 45度旋转角度
  // const rotationMatrix = Cesium.Matrix3.fromRotationZ(rotationAngle)
  // const rotationMatrix4 = Cesium.Matrix4.fromRotationTranslation(rotationMatrix)

  // // 将旋转矩阵应用到模型矩阵上
  // Cesium.Matrix4.multiply(tileSet.modelMatrix, rotationMatrix4, tileSet.modelMatrix)
  viewer.scene.primitives.add(tileSet)
  viewer.zoomTo(tileSet)

}

const addModelChangTotal = async () => {
  const tileSet = await Cesium.Cesium3DTileset.fromUrl('chang_total/tileset.json')
  // tileSet.style = new Cesium.Cesium3DTileStyle({
  //   color: "color('green')",
  // })
  const cartographic = Cesium.Cartographic.fromCartesian(tileSet.boundingSphere.center)
  const surface = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, cartographic.height)
  const m = Cesium.Transforms.eastNorthUpToFixedFrame(surface)
  const _scale = Cesium.Matrix4.fromUniformScale(10)
  Cesium.Matrix4.multiply(m, _scale, m)
  tileSet.root.transform = m
  const cartographic2 = Cesium.Cartographic.fromCartesian(tileSet.boundingSphere.center)
  const surface2 = Cesium.Cartesian3.fromRadians(cartographic2.longitude, cartographic2.latitude, cartographic2.height)
  const offset = Cesium.Cartesian3.fromDegrees(117.05435995706138, 39.674984212615854, 100)
  const translation = Cesium.Cartesian3.subtract(offset, surface2, new Cesium.Cartesian3())
  tileSet.modelMatrix = Cesium.Matrix4.fromTranslation(translation)
  // const rotationAngle = Cesium.Math.toRadians(45) // 45度旋转角度
  // const rotationMatrix = Cesium.Matrix3.fromRotationZ(rotationAngle)
  // const rotationMatrix4 = Cesium.Matrix4.fromRotationTranslation(rotationMatrix)

  // // 将旋转矩阵应用到模型矩阵上
  // Cesium.Matrix4.multiply(tileSet.modelMatrix, rotationMatrix4, tileSet.modelMatrix)
  viewer.scene.primitives.add(tileSet)
  viewer.zoomTo(tileSet)

}
const addModelChangJian = async () => {
  const tileSet = await Cesium.Cesium3DTileset.fromUrl('chang_jian/tileset.json')
  // tileSet.style = new Cesium.Cesium3DTileStyle({
  //   color: "color('green')",
  // })
  const cartographic = Cesium.Cartographic.fromCartesian(tileSet.boundingSphere.center)
  const surface = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, cartographic.height)
  const m = Cesium.Transforms.eastNorthUpToFixedFrame(surface)
  const _scale = Cesium.Matrix4.fromUniformScale(10)
  Cesium.Matrix4.multiply(m, _scale, m)
  tileSet.root.transform = m
  const cartographic2 = Cesium.Cartographic.fromCartesian(tileSet.boundingSphere.center)
  const surface2 = Cesium.Cartesian3.fromRadians(cartographic2.longitude, cartographic2.latitude, cartographic2.height)
  const offset = Cesium.Cartesian3.fromDegrees(117.05435995706138, 40.674984212615854, 100)
  const translation = Cesium.Cartesian3.subtract(offset, surface2, new Cesium.Cartesian3())
  tileSet.modelMatrix = Cesium.Matrix4.fromTranslation(translation)
  // const rotationAngle = Cesium.Math.toRadians(45) // 45度旋转角度
  // const rotationMatrix = Cesium.Matrix3.fromRotationZ(rotationAngle)
  // const rotationMatrix4 = Cesium.Matrix4.fromRotationTranslation(rotationMatrix)

  // // 将旋转矩阵应用到模型矩阵上
  // Cesium.Matrix4.multiply(tileSet.modelMatrix, rotationMatrix4, tileSet.modelMatrix)
  viewer.scene.primitives.add(tileSet)
  viewer.zoomTo(tileSet)

}

const addModelChangJie = async () => {
  const tileSet = await Cesium.Cesium3DTileset.fromUrl('chang_jie/tileset.json')
  // tileSet.style = new Cesium.Cesium3DTileStyle({
  //   color: "color('green')",
  // })
  const cartographic = Cesium.Cartographic.fromCartesian(tileSet.boundingSphere.center)
  const surface = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, cartographic.height)
  const m = Cesium.Transforms.eastNorthUpToFixedFrame(surface)
  const _scale = Cesium.Matrix4.fromUniformScale(10)
  Cesium.Matrix4.multiply(m, _scale, m)
  tileSet.root.transform = m
  const cartographic2 = Cesium.Cartographic.fromCartesian(tileSet.boundingSphere.center)
  const surface2 = Cesium.Cartesian3.fromRadians(cartographic2.longitude, cartographic2.latitude, cartographic2.height)
  const offset = Cesium.Cartesian3.fromDegrees(117.05435995706138, 41.674984212615854, 100)
  const translation = Cesium.Cartesian3.subtract(offset, surface2, new Cesium.Cartesian3())
  tileSet.modelMatrix = Cesium.Matrix4.fromTranslation(translation)
  // const rotationAngle = Cesium.Math.toRadians(45) // 45度旋转角度
  // const rotationMatrix = Cesium.Matrix3.fromRotationZ(rotationAngle)
  // const rotationMatrix4 = Cesium.Matrix4.fromRotationTranslation(rotationMatrix)

  // // 将旋转矩阵应用到模型矩阵上
  // Cesium.Matrix4.multiply(tileSet.modelMatrix, rotationMatrix4, tileSet.modelMatrix)
  viewer.scene.primitives.add(tileSet)
  viewer.zoomTo(tileSet)

}

const addModelChangJi = async () => {
  const tileSet = await Cesium.Cesium3DTileset.fromUrl('chang_ji/tileset.json')
  // tileSet.style = new Cesium.Cesium3DTileStyle({
  //   color: "color('green')",
  // })
  const cartographic = Cesium.Cartographic.fromCartesian(tileSet.boundingSphere.center)
  const surface = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, cartographic.height)
  const m = Cesium.Transforms.eastNorthUpToFixedFrame(surface)
  const _scale = Cesium.Matrix4.fromUniformScale(10)
  Cesium.Matrix4.multiply(m, _scale, m)
  tileSet.root.transform = m
  const cartographic2 = Cesium.Cartographic.fromCartesian(tileSet.boundingSphere.center)
  const surface2 = Cesium.Cartesian3.fromRadians(cartographic2.longitude, cartographic2.latitude, cartographic2.height)
  const offset = Cesium.Cartesian3.fromDegrees(117.05435995706138, 42.674984212615854, 100)
  const translation = Cesium.Cartesian3.subtract(offset, surface2, new Cesium.Cartesian3())
  tileSet.modelMatrix = Cesium.Matrix4.fromTranslation(translation)
  // const rotationAngle = Cesium.Math.toRadians(45) // 45度旋转角度
  // const rotationMatrix = Cesium.Matrix3.fromRotationZ(rotationAngle)
  // const rotationMatrix4 = Cesium.Matrix4.fromRotationTranslation(rotationMatrix)

  // // 将旋转矩阵应用到模型矩阵上
  // Cesium.Matrix4.multiply(tileSet.modelMatrix, rotationMatrix4, tileSet.modelMatrix)
  viewer.scene.primitives.add(tileSet)
  viewer.zoomTo(tileSet)

}

const addModelTest = async () => {
  const tileSet = await Cesium.Cesium3DTileset.fromUrl('test/tileset.json')
  // tileSet.style = new Cesium.Cesium3DTileStyle({
  //   color: "color('green')",
  // })
  const cartographic = Cesium.Cartographic.fromCartesian(tileSet.boundingSphere.center)
  const surface = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, cartographic.height)
  const m = Cesium.Transforms.eastNorthUpToFixedFrame(surface)
  const _scale = Cesium.Matrix4.fromUniformScale(1)
  Cesium.Matrix4.multiply(m, _scale, m)
  tileSet.root.transform = m
  const cartographic2 = Cesium.Cartographic.fromCartesian(tileSet.boundingSphere.center)
  const surface2 = Cesium.Cartesian3.fromRadians(cartographic2.longitude, cartographic2.latitude, cartographic2.height)
  const offset = Cesium.Cartesian3.fromDegrees(111.4095841, 30.5540514, 1)
  const translation = Cesium.Cartesian3.subtract(offset, surface2, new Cesium.Cartesian3())
  tileSet.modelMatrix = Cesium.Matrix4.fromTranslation(translation)
  // const rotationAngle = Cesium.Math.toRadians(45) // 45度旋转角度
  // const rotationMatrix = Cesium.Matrix3.fromRotationZ(rotationAngle)
  // const rotationMatrix4 = Cesium.Matrix4.fromRotationTranslation(rotationMatrix)

  // // 将旋转矩阵应用到模型矩阵上
  // Cesium.Matrix4.multiply(tileSet.modelMatrix, rotationMatrix4, tileSet.modelMatrix)
  viewer.scene.primitives.add(tileSet)
  viewer.zoomTo(tileSet)

}

const addModelTest12 = async () => {
  const tileSet = await Cesium.Cesium3DTileset.fromUrl('test12/tileset.json')

  viewer.scene.primitives.add(tileSet)
  viewer.zoomTo(tileSet)

}

const addModelTest121 = async () => {
  const tileSet = await Cesium.Cesium3DTileset.fromUrl('test12-1/tileset.json')

  viewer.scene.primitives.add(tileSet)
  viewer.zoomTo(tileSet)

}

</script>

<template>
  <div class="header">
    <div class="title">
      <h1>工厂网格编码融合系统</h1>
    </div>
  </div>
  <div id="mapContainer"></div>
  <div class="operate-btn">
    网格层级
    <el-select v-model="gridLevel" placeholder="Select" style="width: 100px">
      <el-option label="23" :value="23" />
      <el-option label="22" :value="22" />
      <el-option label="21" :value="21" />
      <el-option label="20" :value="20" />
    </el-select>
    <el-button @click="showGrid">网格显隐</el-button>
  </div>

  <div class="operate-model">
    <el-button @click="addModel18glb">模型18glb</el-button>
    <el-button @click="addModel18ifc">模型18ifc</el-button>
    <el-button @click="addModelChang1F">模型厂房1F</el-button>
    <el-button @click="addModelChangTotal">模型厂房整体</el-button>
    <el-button @click="addModelChangJian">模型厂房建筑</el-button>
    <el-button @click="addModelChangJie">模型厂房结构</el-button>
    <el-button @click="addModelChangJi">模型厂房机电</el-button>
    <el-button @click="addModelTest">测试模型</el-button>
    <el-button @click="addModelTest12">测试12模型</el-button>
    <el-button @click="addModelTest121">测试121模型</el-button>
  </div>
</template>

<style scoped lang="scss">
.header {
  display: flex;
  justify-content: space-between;
  /* align-items: center; */
  position: fixed;
  height: 100px;
  width: 100%;
  background-image: url(@/assets/header-bg.webp);
  background-size: 100% 100%;
  z-index: 9;

  .title {
    flex: 1;
    text-align: center;

    h1 {
      margin: 0;
      font-size: 1.4vw;
      line-height: 60px;
      display: inline-block;
      width: 600px;
      max-width: 30vw;
      color: #fff;
    }
  }
}

#mapContainer {
  height: 100vh;
  width: 100vw;

  :deep(.cesium-infoBox) {
    z-index: 9;
  }
}

.operate-btn {
  top: 20px;
  right: 50px;
  z-index: 9;
  position: fixed;
  display: flex;

  button {
    background-color: #1762e8c7;
    border-color: #3B7BED;
    margin-right: 10px;

    :deep(span) {
      color: #fff;
      opacity: 1
    }


  }
}

.operate-model {
  top: 7cqw;
  left: 50px;
  z-index: 9;
  position: fixed;
  display: flex;

  button {
    background-color: #1762e8c7;
    border-color: #3B7BED;
    margin-right: 10px;

    :deep(span) {
      color: #fff;
      opacity: 1
    }


  }
}
</style>