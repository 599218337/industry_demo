import * as Cesium from "cesium";
export namespace breath {
  export const describe: string = "呼吸灯特效";

  let viewer: any;
  let flashEntity = [];
  /**
   * @description 绘制呼吸效果
   * @param {any} v - viewer
   * @param {any} geometry - 面或多面的geometry
   * @param {any} option - 配置项
   * @return {*}
   * @example
   * ```ts
   * let polygon = {
   *   "type": "Polygon",
   *   "coordinates": [[
   *     [125.23058669090906, 44.016620190897434],
   *     [125.23058669090906, 43.882494124241894],
   *     [125.42370885831481, 43.882494124241894],
   *     [125.42370885831481, 44.016620190897434],
   *     [125.23058669090906, 44.016620190897434]
   *   ]]
   * }
   * let option = {
   *   color:'#ff0000',
   *   height:0,//呼吸灯底部距离地面高度，默认0
   *   extrudedHeight:3,//呼吸灯高度，默认0
   * }
   * gs3d.effect.breath.draw(viewer, polygon, { color: "#ff99ff", height: 0, extrudedHeight: 8000 })
   * ```
   */
  export const draw = (v: any, geometry: any, option?: any) => {
    viewer = v;
    if (!viewer) {
      console.log("请传入viewer");
      return;
    }
    flashEntity = [];
    // changeColorWithClock(option.color);
    switch (geometry.type) {
      case "MultiPolygon":
        geometry.coordinates.forEach((coor) => {
          flashEntity.push(drawPolygon(coor, option));
        });
        break;
      case "Polygon":
        flashEntity.push(drawPolygon(geometry.coordinates, option));
        break;
      default:
        break;
    }
    // viewer.flyTo(flashEntity[0], {
    //   offset: {
    //     heading: 0,
    //     pitch: pitch,
    //     range: range,
    //   },
    // });
    // viewer.zoomTo(
    //     polygon2,
    //     new Cesium.HeadingPitchRange(6.28318530717956, -0.7853988554907718, 0)
    // );
    return flashEntity;
  };
  const drawPolygon = (coor: any, option?: any) => {
    let coordinates: Array<any> = [];
    coor[0].forEach((item: any) => {
      coordinates.push(item[0], item[1]);
    });
    var alp = 1;
    var num = 0;
    let polygonOption: any = {
      show: true,
      hierarchy: Cesium.Cartesian3.fromDegreesArray(coordinates),
      height: option.height,
      extrudedHeight: option.extrudedHeight,
      fill: option.fill ?? true,
      outline: option.outline || false,
      outlineColor: option.outlineColor
        ? Cesium.Color.fromCssColorString(option.outlineColor)
        : Cesium.Color.RED,
      outlineWidth: option.outlineWidth || 1,
      material: new Cesium.ColorMaterialProperty(
        new Cesium.CallbackProperty(() => {
          if (num % 2 === 0) {
            alp -= 0.01;
          } else {
            alp += 0.01;
          }
          if (alp <= 0.3) {
            num++;
          } else if (alp >= 1) {
            num++;
          }
          return Cesium.Color.fromCssColorString(
            option.color || "#ff0000"
          ).withAlpha(alp);
        }, false)
      ),
    };

    if (option.clampToGround) {
      delete polygonOption.height;
      delete polygonOption.extrudedHeight;
      polygonOption.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND;
      polygonOption.classificationType = Cesium.ClassificationType.TERRAIN;
    }

    let breathPolygon = viewer.entities.add({
      name: "breathPolygon",
      polygon: polygonOption,
    });
    return breathPolygon;
  };
  /**
   * @description 清除呼吸灯
   * @return {*}
   * @example
   * ```ts
   * gs3d.effect.breath.clear()
   * ```
   */
  export const clear = () => {
    flashEntity.forEach((item) => {
      viewer.entities.remove(item);
    });
  };
}
