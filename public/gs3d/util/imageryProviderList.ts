export namespace imageryProviderList {
  /*
  缺少用例：
  TileMapServiceImageryProvider
  OpenStreetMapImageryProvider
  BingMapsImageryProvider
  GoogleEarthEnterpriseImageryProvider
  SingleTileImageryProvider
  MapboxImageryProvider
  */
  // import * as Cesium from 'cesium'
  // 国内厂商的地图服务
  export let inland = {
    geoserver_light_1: {
      type: 'WebMapServiceImageryProvider',
      options: {
        url: 'http://192.168.1.92:8081/geoserver/globe/wms',
        layers: 'globe:world',
        parameters: {
          transparent: true,
          format: 'image/png'
        }
      }
    },
    arcgis_1: {
      type: 'ArcGisMapServerImageryProvider',
      options: {
        url: 'https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer',
        token: 'AAPKe9643f5cea8f4275ba46e736fb001c17RVC2Pgh8SSg5tv_mxXnV5iUDfZ_yly3gPgY7_O_e_hzG7Vj3si9fO0YZ3wpeHA7h'
      }
    },
    // 皇家蓝影像
    gaode_1: {
      type: 'UrlTemplateImageryProvider',
      options: {
        url: 'http://webst{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
        subdomains: ['01', '02', '03', '04']
      }
    },
    // 标注图层-地名+路网
    gaode_label_borad_1: {
      type: 'UrlTemplateImageryProvider',
      options: {
        url: 'http://webst{s}.is.autonavi.com/appmaptile?style=8&x={x}&y={y}&z={z}',
        subdomains: ['01', '02', '03', '04']
      }
    },
    // 天空蓝矢量
    tianditu_1: {
      type: 'UrlTemplateImageryProvider',
      options: {
        url: 'http://{s}.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=1969b005645cd7ec0a65f5ffd5825781',
        subdomains: ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7']
      }
    },
    // 标注图层-地名
    tianditu_label_1: {
      type: 'UrlTemplateImageryProvider',
      options: {
        url: 'http://{s}.tianditu.com/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=1969b005645cd7ec0a65f5ffd5825781',
        subdomains: ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7']
      }
    },
    // 标注图层-地名+路网
    tianditu_label_borad_1: {
      type: 'UrlTemplateImageryProvider',
      options: {
        url: 'http://{s}.tianditu.com/DataServer?T=cia_w&x={x}&y={y}&l={z}&tk=1969b005645cd7ec0a65f5ffd5825781',
        subdomains: ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7']
      }
    }
  }

  // 国外厂商的地图服务，可能需要翻墙
  export let foreign = {
    OpenStreetMap: {
      type: 'UrlTemplateImageryProvider',
      options: {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', // "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        subdomains: 'abc',
        minimumLevel: 0,
        maximumLevel: 19
      }
    },
    CartoDB_Positron_basemap: {
      type: 'UrlTemplateImageryProvider',
      options: {
        url: 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
        minimumLevel: 0,
        maximumLevel: 18
      }
    },
    CartoDB_Positron_without_labels_basemap: {
      type: 'UrlTemplateImageryProvider',
      options: {
        url: 'https://{s}.basemaps.cartocdn.com/rastertiles/light_nolabels/{z}/{x}/{y}.png',
        minimumLevel: 0,
        maximumLevel: 18
      }
    },
    CartoDB_Dark_Matter_basemap: {
      type: 'UrlTemplateImageryProvider',
      options: {
        url: 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png',
        minimumLevel: 0,
        maximumLevel: 18
      }
    },
    CartoDB_Dark_Matter_without_labels_basemap: {
      type: 'UrlTemplateImageryProvider',
      options: {
        url: 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_nolabels/{z}/{x}/{y}.png',
        minimumLevel: 0,
        maximumLevel: 18
      }
    },
    CartoDB_Voyager_basemap: {
      type: 'UrlTemplateImageryProvider',
      options: {
        url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}.png',
        minimumLevel: 0,
        maximumLevel: 18
      }
    },
    CartoDB_Voyager_without_labels_basemap: {
      type: 'UrlTemplateImageryProvider',
      options: {
        url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}.png',
        minimumLevel: 0,
        maximumLevel: 18
      }
    },
    National_Map_Satellite: {
      type: 'UrlTemplateImageryProvider',
      options: {
        url: 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}',
        credit: 'Tile data from <a href="https://basemap.nationalmap.gov/">USGS</a>',
        minimumLevel: 0,
        maximumLevel: 16
      }
    },
    Stamen_Terrain_Background: {
      type: 'UrlTemplateImageryProvider',
      options: {
        url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain-background/{z}/{x}/{y}.png',
        subdomains: 'abcd',
        minimumLevel: 0,
        maximumLevel: 14
      }
    },
    Stamen_Terrain: {
      type: 'UrlTemplateImageryProvider',
      options: {
        url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.png',
        subdomains: 'abcd',
        minimumLevel: 0,
        maximumLevel: 14
      }
    },
    Stamen_Toner: {
      type: 'UrlTemplateImageryProvider',
      options: {
        url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png',
        subdomains: 'abcd',
        minimumLevel: 0,
        maximumLevel: 14
      }
    },
    Stamen_Toner_Lite: {
      type: 'UrlTemplateImageryProvider',
      options: {
        url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png',
        subdomains: 'abcd',
        minimumLevel: 0,
        maximumLevel: 14
      }
    }
  }

  // function addImageryLayer(viewer, type, options) {
  //   let layer
  //   if (type === 'ArcGisMapServerImageryProvider') {
  //     let { url, token } = options
  //     layer = Cesium.ImageryLayer.fromProviderAsync(Cesium[type].fromUrl(url, { token }))
  //     /*
  //       arcgis
  //       https://services.arcgisonline.com/arcgis/rest/services
  //       Cesium.ArcGisMapService.defaultAccessToken =
  //       "AAPKe9643f5cea8f4275ba46e736fb001c17RVC2Pgh8SSg5tv_mxXnV5iUDfZ_yly3gPgY7_O_e_hzG7Vj3si9fO0YZ3wpeHA7h";
  //       const layer = Cesium.ImageryLayer.fromProviderAsync(
  //           Cesium.ArcGisMapServerImageryProvider.fromUrl(
  //               "https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer"
  //               // {
  //               //   token:
  //               //     "AAPKe9643f5cea8f4275ba46e736fb001c17RVC2Pgh8SSg5tv_mxXnV5iUDfZ_yly3gPgY7_O_e_hzG7Vj3si9fO0YZ3wpeHA7h",
  //               // }
  //           )
  //       );
  //       viewer.imageryLayers.add(layer);
  //     */
  //   } else {
  //     layer = new Cesium.ImageryLayer(new Cesium[type](options))
  //   }
  //   viewer.imageryLayers.add(layer)
  //   return layer
  // }

  /*
使用
      // let { type, options } = inland["arcgis_1"];
      // let { type, options } = inland["gaode_1"];
      // let { type, options } = inland["tianditu_1"];
      // let { type, options } = inland["tianditu_label_1"];
      // let { type, options } = foreign["OpenStreetMap"];
      let { type, options } = inland["tianditu_label_1"];
      let layer = addImageryLayer(viewer, type, options);
      console.log(viewer.imageryLayers);
*/
}
