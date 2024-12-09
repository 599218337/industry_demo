type GS3DConfigType = {
  map?: {
    type: string
    lockMouseDesc?: string
    lockMouse?: boolean
    center?: {
      heading?: number
      pitch?: number
      longitude?: number
      latitude?: number
      height?: number
      duration?: number
      [key: string]: any
    }
    minHeight?: number
    maxHeight?: number
    customParam?: {
      earthType?: string
      earthScheme?: {
        DEFAULT?: {
          useFPS?: boolean
          useImageryLayers?: boolean
          useSun?: boolean
          useMoon?: boolean
          useSkybox: boolean
          sceneBackgroundcolor?: string
          useFxaa?: boolean
          useGlobe?: boolean
          useGroundAtmosphere?: boolean
          globalBasecolor?: string
          useGlobeTranslucencyenabled?: boolean
          globeUndergroundcolor?: string
          [key: string]: any
        }
        [key: string]: any
      }
      [key: string]: any
    }
    [key: string]: any
  }
  [key: string]: any
}
// type NestedGS3DConfigType = {
//   [key: string]: GS3DConfigType | NestedGS3DConfigType
// }
// type DeeplyGS3DConfigType = {
//   [key: string]: GS3DConfigType | NestedGS3DConfigType | DeeplyGS3DConfigType
// }

export const GS3DConfig: GS3DConfigType = {
  map: {
    type: '3d',
    lockMouseDesc: "// 根据地图视图类型确定，当配置为'2d'模式时,若不想锁定鼠标,需要追加配置lockMouse:false,这样在2d模式下,仍然可以转动地球",
    '-lockMouse': true,
    '-rectangle': [90, -20, 110, 90],
    center: {
      longitude_BJ_desc: '北京-116.38889583805896,39.911103086820084(2d)/40.283103086820084(3d)',
      longitude: 116.38889583805896, //number,经度
      latitude: 40.283103086820084, //number,纬度
      height: 400000, //number,高度
      heading: 0, //number,偏航角
      pitch: -45, //number,俯仰角
      roll: 0, //number,翻滚角
      duration: 0 //number,飞行时间
    },
    '-minHeight': 30000,
    '-maxHeight': 100000,
    customParam: {
      earthType: 'DEFAULT',
      earthScheme: {
        DEFAULT: {
          useFPS: false,
          useImageryLayers: true,
          useSun: false,
          useMoon: false,
          useSkybox: false,
          sceneBackgroundcolor: 'black',
          useFxaa: false,
          useGlobe: true,
          useGroundAtmosphere: true,
          globalBasecolor: 'black',
          useGlobeTranslucencyenabled: false,
          globeUndergroundcolor: 'black'
        },
        OPACITY: {
          useFPS: false,
          useImageryLayers: false,
          useSun: false,
          useMoon: false,
          useSkybox: false,
          sceneBackgroundcolor: 'transparent',
          useFxaa: false,
          useGlobe: true,
          useGroundAtmosphere: false,
          globalBasecolor: 'transparent',
          useGlobeTranslucencyenabled: true,
          globeUndergroundcolor: 'undefined',

          设置某个行政区划单独影像: '在viewer配置项中需要增加以下参数',
          baseLayer: false,
          skyAtmosphere: false,
          contextOptions: {
            webgl: { alpha: true }
          },
          shadows: false,
          orderIndependentTranslucency: false
        }
      }
    }
  },
  layerTree: {
    treeData: [
      {
        id: 'yxsj',
        label: '影像数据【yxsj】',
        children: [
          {
            id: 'tdtyx',
            label: '天地图影像【tdtyx】',
            children: [
              {
                id: 'tdtyx_fw',
                label: '天地图影像服务【tdtyx_fw】',
                type: 'urltemplate',
                subdomains: ['01', '02', '03', '04'],
                url: 'http://webst{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
                example: '我是示例中得参数',
                tilingScheme: {
                  type: 'touying/dili/custom'
                }
              },
              {
                id: 'tdtyx_zjfw',
                label: '天地图影像带注记服务【tdtyx_zjfw】',
                type: 'urltemplate',
                subdomains: ['01', '02', '03', '04'],
                url: 'http://webst{s}.is.autonavi.com/appmaptile?style=8&x={x}&y={y}&z={z}',
                example: '我是示例中得参数'
              }
            ]
          },
          {
            id: 'gdyx',
            label: '高德矢量【gdyx】',
            children: [
              {
                id: 'gdyx_fw',
                label: '高德矢量服务【gdyx_fw】',
                type: 'other_gaode',
                url: 'https://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}',
                minimumLevel: 3,
                maximumLevel: 18,
                desc: '我是配置里得图层参数'
              }
            ]
          },
          {
            id: 'cesiumInner',
            label: 'Cesium内置网格瓦片划分【cesiumInner】',
            type: 'cesium_TileCoord'
          },
          {
            id: 'skxx',
            label: '时空信息事业部测试服务【skxx】',
            children: [
              {
                id: 'mtg_wms',
                label: '门头沟_wms【mtg_wms】',
                type: 'wms',
                layers: '1',
                url: 'http://192.168.1.88:6080/arcgis/services/bjmtg1/MapServer/WMSServer'
              },
              {
                id: 'mtg_arcgis_wms',
                label: '门头沟_arcgis_wms【mtg_arcgis_wms】',
                type: 'arcgis_wms',
                layers: '0',
                url: 'http://192.168.1.88:6080/arcgis/services/bjmtg1/MapServer/WMSServer'
              },
              {
                id: 'anhui_geoserver_wms',
                label: '安徽省_geoserver_wms【anhui_geoserver_wms】',
                type: 'geoserver_wms',
                layers: 'anhui:安徽省',
                url: 'http://192.168.1.88:8081/geoserver/anhui/wms'
              },
              {
                id: 'mvt',
                label: 'mvt【mvt】',
                type: 'urltemplate',
                url: 'http://192.168.1.95:8991/xiangtan/l={z}&x={x}&y={ry}',
                customTags: 'ry'
              },
              {
                id: 'mtg_wms',
                label: '门头沟WMS服务【mtg_wms】',
                children: [
                  {
                    id: 'mtg_wms_0',
                    label: '门头沟【mtg_wms_0】',
                    type: 'arcgis_mapserver',
                    url: 'http://192.168.1.88:6080/arcgis/rest/services/bjmtg1/MapServer'
                  },
                  {
                    id: 'mtg_wms_1',
                    label: 'POI门头沟【mtg_wms_1】',
                    type: 'arcgis_mapserver',
                    layers: '1',
                    url: 'http://192.168.1.88:6080/arcgis/rest/services/bjmtg1/MapServer'
                  },
                  {
                    id: 'mtg_wms_2',
                    label: '行政区划【mtg_wms_2】',
                    type: 'arcgis_mapserver',
                    layers: '2',
                    url: 'http://192.168.1.88:6080/arcgis/rest/services/bjmtg1/MapServer'
                  },
                  {
                    id: 'mtg_wms_3',
                    label: '铁路线【mtg_wms_3】',
                    type: 'arcgis_mapserver',
                    layers: '3',
                    url: 'http://192.168.1.88:6080/arcgis/rest/services/bjmtg1/MapServer'
                  },
                  {
                    id: 'mtg_wms_4',
                    label: '水系【mtg_wms_4】',
                    type: 'arcgis_mapserver',
                    layers: '4',
                    url: 'http://192.168.1.88:6080/arcgis/rest/services/bjmtg1/MapServer'
                  },
                  {
                    id: 'mtg_wms_5',
                    label: '道路buffer【mtg_wms_5】',
                    type: 'arcgis_mapserver',
                    layers: '5',
                    url: 'http://192.168.1.88:6080/arcgis/rest/services/bjmtg1/MapServer'
                  },
                  {
                    id: 'mtg_wms_6',
                    label: '建筑物面【mtg_wms_6】',
                    type: 'arcgis_mapserver',
                    layers: '6',
                    url: 'http://192.168.1.88:6080/arcgis/rest/services/bjmtg1/MapServer'
                  },
                  {
                    id: 'mtg_wms_7',
                    label: '行政边界buffer【mtg_wms_7】',
                    type: 'arcgis_mapserver',
                    layers: '7',
                    url: 'http://192.168.1.88:6080/arcgis/rest/services/bjmtg1/MapServer'
                  },
                  {
                    id: 'mtg_wms_8',
                    label: '道路【mtg_wms_8】',
                    type: 'arcgis_mapserver',
                    layers: '8',
                    url: 'http://192.168.1.88:6080/arcgis/rest/services/bjmtg1/MapServer'
                  }
                ]
              },
              {
                id: 'mtg_wfs',
                label: '门头沟WFS服务【mtg_wfs】',
                type: 'wfs',
                url: 'http://192.168.1.88:6080/arcgis/rest/services/mentougou/FeatureServer'
              },
              {
                id: 'mtg_wmts',
                label: '门头沟WMTS服务【mtg_wmts】',
                children: [
                  {
                    id: 'mtg_wmts_kv',
                    label: '门头沟dem数据-kv加载形式【mtg_wmts_kv】',
                    type: 'wmts',
                    url: 'http://192.168.1.95/test/out/',
                    urlMethod: 'kvpair',
                    name: 'gisdata:mtg_dem',
                    style: '', //default/raster
                    format: 'image/png',

                    tileMatrixSetID: 'EPSG:900913',
                    tileMatrixLabels: [
                      'EPSG:900913:0',
                      'EPSG:900913:1',
                      'EPSG:900913:2',
                      'EPSG:900913:3',
                      'EPSG:900913:4',
                      'EPSG:900913:5',
                      'EPSG:900913:6',
                      'EPSG:900913:7',
                      'EPSG:900913:8',
                      'EPSG:900913:9',
                      'EPSG:900913:10',
                      'EPSG:900913:11',
                      'EPSG:900913:12',
                      'EPSG:900913:13',
                      'EPSG:900913:14',
                      'EPSG:900913:15',
                      'EPSG:900913:16',
                      'EPSG:900913:17',
                      'EPSG:900913:18',
                      'EPSG:900913:19',
                      'EPSG:900913:20',
                      'EPSG:900913:21',
                      'EPSG:900913:22',
                      'EPSG:900913:23',
                      'EPSG:900913:24',
                      'EPSG:900913:25',
                      'EPSG:900913:26',
                      'EPSG:900913:27',
                      'EPSG:900913:28',
                      'EPSG:900913:29',
                      'EPSG:900913:30'
                    ],
                    maximumLevel: 30
                  },
                  {
                    id: 'mtg_wmts_kv',
                    label: '门头沟dem数据-kv加载形式【mtg_wmts_kv】',
                    type: 'wmts',
                    // url: 'http://192.168.1.88:8081/geoserver/gwc/service/wmts',
                    url: '/88server/geoserver/gwc/service/wmts',
                    urlMethod: 'kvpair',
                    name: 'gisdata:mtg_dem',
                    style: '', //default/raster
                    format: 'image/png',
                    // tileMatrixSetID: 'EPSG:4326',
                    // tileMatrixLabels: [
                    //   'EPSG:4326:0',
                    //   'EPSG:4326:1',
                    //   'EPSG:4326:2',
                    //   'EPSG:4326:3',
                    //   'EPSG:4326:4',
                    //   'EPSG:4326:5',
                    //   'EPSG:4326:6',
                    //   'EPSG:4326:7',
                    //   'EPSG:4326:8',
                    //   'EPSG:4326:9',
                    //   'EPSG:4326:10',
                    //   'EPSG:4326:11',
                    //   'EPSG:4326:12',
                    //   'EPSG:4326:13',
                    //   'EPSG:4326:14',
                    //   'EPSG:4326:15',
                    //   'EPSG:4326:16',
                    //   'EPSG:4326:17',
                    //   'EPSG:4326:18',
                    //   'EPSG:4326:19',
                    //   'EPSG:4326:20',
                    //   'EPSG:4326:21'
                    // ],
                    // maximumLevel: 21,
                    // tilingScheme: new Cesium.GeographicTilingScheme()

                    tileMatrixSetID: 'EPSG:900913',
                    tileMatrixLabels: [
                      'EPSG:900913:0',
                      'EPSG:900913:1',
                      'EPSG:900913:2',
                      'EPSG:900913:3',
                      'EPSG:900913:4',
                      'EPSG:900913:5',
                      'EPSG:900913:6',
                      'EPSG:900913:7',
                      'EPSG:900913:8',
                      'EPSG:900913:9',
                      'EPSG:900913:10',
                      'EPSG:900913:11',
                      'EPSG:900913:12',
                      'EPSG:900913:13',
                      'EPSG:900913:14',
                      'EPSG:900913:15',
                      'EPSG:900913:16',
                      'EPSG:900913:17',
                      'EPSG:900913:18',
                      'EPSG:900913:19',
                      'EPSG:900913:20',
                      'EPSG:900913:21',
                      'EPSG:900913:22',
                      'EPSG:900913:23',
                      'EPSG:900913:24',
                      'EPSG:900913:25',
                      'EPSG:900913:26',
                      'EPSG:900913:27',
                      'EPSG:900913:28',
                      'EPSG:900913:29',
                      'EPSG:900913:30'
                    ],
                    maximumLevel: 30
                  },
                  {
                    id: 'mtg_wmts_restful',
                    label: '门头沟dem数据-restful加载形式【mtg_wmts_restful】',
                    type: 'wmts',
                    url: '/88server/geoserver/gwc/service/wmts',
                    // url: 'http://192.168.1.88:8081/geoserver/gwc/service/wmts/rest/gisdata:mtg_dem/{style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}?format=image/png',
                    // url: '/88server/geoserver/gwc/service/wmts/rest/gisdata:mtg_dem/{style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}?format=image/png',
                    name: 'gisdata:mtg_dem',
                    urlMethod: 'restful',
                    style: '', //default/raster
                    format: 'image/png',
                    // tileMatrixSetID: 'EPSG:4326',
                    // tileMatrixLabels: [
                    //   'EPSG:4326:0',
                    //   'EPSG:4326:1',
                    //   'EPSG:4326:2',
                    //   'EPSG:4326:3',
                    //   'EPSG:4326:4',
                    //   'EPSG:4326:5',
                    //   'EPSG:4326:6',
                    //   'EPSG:4326:7',
                    //   'EPSG:4326:8',
                    //   'EPSG:4326:9',
                    //   'EPSG:4326:10',
                    //   'EPSG:4326:11',
                    //   'EPSG:4326:12',
                    //   'EPSG:4326:13',
                    //   'EPSG:4326:14',
                    //   'EPSG:4326:15',
                    //   'EPSG:4326:16',
                    //   'EPSG:4326:17',
                    //   'EPSG:4326:18',
                    //   'EPSG:4326:19',
                    //   'EPSG:4326:20',
                    //   'EPSG:4326:21'
                    // ],
                    // maximumLevel: 21,
                    // tilingScheme: new Cesium.GeographicTilingScheme()

                    tileMatrixSetID: 'EPSG:900913',
                    tileMatrixLabels: [
                      'EPSG:900913:0',
                      'EPSG:900913:1',
                      'EPSG:900913:2',
                      'EPSG:900913:3',
                      'EPSG:900913:4',
                      'EPSG:900913:5',
                      'EPSG:900913:6',
                      'EPSG:900913:7',
                      'EPSG:900913:8',
                      'EPSG:900913:9',
                      'EPSG:900913:10',
                      'EPSG:900913:11',
                      'EPSG:900913:12',
                      'EPSG:900913:13',
                      'EPSG:900913:14',
                      'EPSG:900913:15',
                      'EPSG:900913:16',
                      'EPSG:900913:17',
                      'EPSG:900913:18',
                      'EPSG:900913:19',
                      'EPSG:900913:20',
                      'EPSG:900913:21',
                      'EPSG:900913:22',
                      'EPSG:900913:23',
                      'EPSG:900913:24',
                      'EPSG:900913:25',
                      'EPSG:900913:26',
                      'EPSG:900913:27',
                      'EPSG:900913:28',
                      'EPSG:900913:29',
                      'EPSG:900913:30'
                    ],
                    maximumLevel: 30
                  },
                  {
                    id: 'mtg_wmts_georestful',
                    label: '门头沟dem数据-georestful加载形式【mtg_wmts_georestful】',
                    type: 'wmts',
                    url: '/88server/geoserver/gwc/service/wmts',
                    // url: 'http://192.168.1.88:8081/geoserver/gwc/service/wmts/rest/gisdata:mtg_dem/{style}/{TileMatrixSet}/{TileMatrixSet}:{TileMatrix}/{TileRow}/{TileCol}?format=image/png',
                    // url: '/88server/geoserver/gwc/service/wmts/rest/gisdata:mtg_dem/{style}/{TileMatrixSet}/{TileMatrixSet}:{TileMatrix}/{TileRow}/{TileCol}?format=image/png',
                    name: 'gisdata:mtg_dem',
                    urlMethod: 'georestful',
                    style: '', //default/raster
                    format: 'image/png',
                    // tileMatrixSetID: 'EPSG:4326',
                    // maximumLevel: 21,
                    // tilingScheme: new Cesium.GeographicTilingScheme()

                    tileMatrixSetID: 'EPSG:900913',
                    maximumLevel: 30
                  }
                ]
              }
            ]
          },
          {
            id: 'mapbox',
            label: 'mapboxAPI测试',
            children: [
              {
                id: 'mapbox.mapbox-terrain-v2',
                type: 'mapbox',
                label: 'mapbox测试服务',
                mapId: 'mapbox.mapbox-terrain-v2',
                accessToken: 'pk.eyJ1Ijoic2t4eG1hcGJveCIsImEiOiJjbHBseml3Y3owNWIzMmttc293enVtdmoxIn0.MyP3HvqYPuchGQqXkUI2LA'
              }
            ]
          },
          {
            id: 'mapboxstyle',
            label: 'mapboxstyleAPI测试',
            children: [
              {
                id: 'mapboxstyle.streets-v11',
                type: 'mapboxstyle',
                label: 'mapboxstyle测试服务',
                styleId: 'streets-v11',
                accessToken: 'pk.eyJ1Ijoic2t4eG1hcGJveCIsImEiOiJjbHBseml3Y3owNWIzMmttc293enVtdmoxIn0.MyP3HvqYPuchGQqXkUI2LA'
              }
            ]
          },
          {
            id: 'osm',
            label: 'osmAPI测试',
            children: [
              {
                id: 'osm.tile',
                type: 'osm',
                label: 'osm测试服务',
                url: 'https://tile.openstreetmap.org/'
              }
            ]
          },
          {
            id: 'singletile',
            label: 'singletileAPI测试',
            children: [
              {
                id: 'singletile.tile',
                type: 'singletile',
                label: 'singletile测试服务',
                url: 'https://yoururl.com/image.png'
              }
            ]
          },
          {
            id: 'tms',
            label: 'tmsAPI测试',
            children: [
              {
                id: 'tms.tile',
                type: 'tms',
                label: 'tms测试服务',
                url: '../public/cesium_maptiler/Cesium_Logo_Color',
                fileExtension: 'png',
                maximumLevel: 4,
                rectangle: [-120, 20, -60, 40]
              }
            ]
          }
        ]
      },
      {
        id: 'dxsj',
        label: '地形数据【dxsj】',
        children: [
          {
            id: 'skxx_dx',
            label: '时空信息事业部测试地形【skxx_dx】',
            children: [
              {
                id: 'mtg_dem125',
                label: '门头沟dem12.5m数据【mtg_dem125】',
                type: 'arcgis_terrain',
                url: 'http://192.168.1.88:6080/arcgis/rest/services/DEM12M5test/ImageServer'
              },
              {
                id: 'terrain_test',
                label: '地形服务发布测试【terrain_test】',
                type: 'cesium_terrain',
                // url: 'http://192.168.1.95/test/out?x={x}&y={y}&z={z}',
                // url: 'http://192.168.1.95:8991/terrian/data/out'
                url: '/tgeoserver/terrian/data/out'
              }
            ]
          },
          {
            id: 'arcgis',
            label: 'arcgis全球地形服务【arcgis】',
            type: 'arcgis_terrain',
            url: 'https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer'
          },
          {
            id: 'cesium',
            label: 'Cesium默认地形【cesium】',
            type: 'cesium_terrain',
            requestVertexNormals: true, //开启地形光照
            requestWaterMask: true // 开启水面波纹
          },
          {
            id: 'cesium_url',
            label: 'Cesium默认地形URL形式【cesium_url】',
            type: 'cesium_terrain',
            url: 'https://assets.ion.cesium.com/ap-northeast-1/asset_depot/1/CesiumWorldTerrain/v1.2',
            resource: {
              headers: {
                Authorization:
                  'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkYTg3ZWFhZC0xZTQzLTQwODAtYmVhOC1iMTY5ZTFhNmMyODQiLCJpZCI6MTcwMzc4LCJhc3NldElkIjoxLCJhc3NldHMiOnsiMSI6eyJ0eXBlIjoiVEVSUkFJTiIsImV4dGVuc2lvbnMiOlt0cnVlLHRydWUsdHJ1ZV0sInB1bGxBcGFydFRlcnJhaW4iOmZhbHNlfX0sInNyYyI6IjYyOTAzNTk0LTgxOTQtNGU2My04MDk0LWIyODE4MWIzYTg0YyIsImlhdCI6MTcwMDA0MTc5MiwiZXhwIjoxNzAwMDQ1MzkyfQ.K8FFha48Vl-mnSWOriTZKNQAokY8G6rvVdRcMTBXCWE'
              }
            },
            requestVertexNormals: true, //开启地形光照
            requestWaterMask: true // 开启水面波纹
          }
        ]
      },
      {
        id: 'mxsj',
        label: '模型数据【mxsj】',
        children: [
          {
            id: 'skxx_mx',
            label: '时空信息事业部测试模型【skxx_mx】',
            children: [
              {
                id: 'skxx_mx',
                label: '时空信息事业部测试模型【skxx_mx】',
                children: [
                  {
                    id: 'dayanta',
                    label: '大雁塔3dtiles【dayanta】',
                    type: 'model_3d_tiles',
                    url: 'https://earthsdk.com/v/last/Apps/assets/dayanta/tileset.json',
                    setPosition: {
                      lng: 108.970604,
                      lat: 34.224485,
                      height: 100
                    },
                    translation: {
                      x: 200,
                      y: 0,
                      z: -430
                    },
                    rotate: {
                      x: 0,
                      y: 0,
                      z: 0
                    },
                    scale: 1,
                    islocation: true,
                    isShowOriginPoint: true
                  },
                  {
                    id: 'pointCloud',
                    label: '点云数据【pointCloud】',
                    type: 'model_3d_tiles',
                    url: '/pointCloud/media/点云/tileset.json',
                    setPosition: {
                      lng: 123.3918,
                      lat: 41.7947,
                      height: 100
                    },
                    scale: 1,
                    islocation: true,
                    isShowOriginPoint: true
                  },
                  {
                    id: 'anhui_3d_tiles',
                    label: '安徽项目3dtiles【anhui_3d_tiles】',
                    type: 'model_3d_tiles',
                    url: 'http://114.96.95.184:10020/space/3dtile/Data/tileset.json',
                    setPosition: {
                      lng: 108.970604,
                      lat: 34.224485,
                      height: 100
                    },
                    translation: {
                      x: 200,
                      y: 0,
                      z: -430
                    },
                    rotate: {
                      x: 0,
                      y: 0,
                      z: 0
                    },
                    scale: 1,
                    islocation: false,
                    isShowOriginPoint: true
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}
