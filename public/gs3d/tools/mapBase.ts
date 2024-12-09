import * as Cesium from 'cesium'
import * as global from '../global'

export namespace mapBase {
  export const describe: string = '地图基础功能'
  /**
   * @description 地图放大
   * @param {any} options - 地图放大参数，可缺省。
   * @return {void}
   * @example
   * ```ts
   *   {
   *     viewer:Cesium.Viewer,//Cesium.Viewer,Cesium容器,可缺省
   *     scale:0.5,//number,放大倍率，可缺省，默认放大0.5倍，注意：此处倍率为相机位置与地球交点的距离值移动前后的比例,0.5倍视角会被放大一倍
   *   }
   *   //调用
   *   gs3d.tools.mapBase.mapCameraZoomIn()
   * ```
   */
  export const mapCameraZoomIn = (options: any = {}) => {
    const { variable } = global
    let defaultOptions = {
      viewer: variable.viewer,
      scale: 0.5
    }
    options = { ...defaultOptions, ...options }
    _defaultCameraZoom(options)
  }

  /**
   * @description 地图缩小
   * @param {any} options - 地图缩小参数，可缺省。
   * @return {void}
   * @example
   * ```ts
   *     {
   *       viewer:Cesium.Viewer,//Cesium.Viewer,Cesium容器,可缺省
   *       scale:2,//number,放大倍率，可缺省，默认放大0.5倍，注意：此处倍率为相机位置与地球交点的距离值移动前后的比例,2倍视角会被缩小一倍
   *     }
   *     //调用
   *     gs3d.tools.mapBase.mapCameraZoomOut()
   * ```
   */
  export const mapCameraZoomOut = (options: any = {}) => {
    const { variable } = global
    let defaultOptions = {
      viewer: variable.viewer,
      scale: 2
    }
    options = { ...defaultOptions, ...options }
    _defaultCameraZoom(options)
  }

  /**
   * @description 地图放大/缩小辅助函数
   * @param {any} options - 放大或缩小参数
   * @return {*}
   * @example
   * ```ts
   *   {
   *     viewer:Cesium.Viewer,//Cesium.Viewer,Cesium容器,可缺省
   *     scale:1,//Number,比例,相机位置与地球交点的距离值移动前后的比例（移动后/移动前）
   *   }
   * ```
   */
  const _defaultCameraZoom = (options: any = {}) => {
    let viewer: Cesium.Viewer & { [key: string]: any } = options.viewer
    let {
      scene: { mode },
      camera,
      //获取camera的orientation
      camera: { position, direction, heading, pitch, roll }
    } = viewer
    if (mode == Cesium.SceneMode.SCENE2D || mode == Cesium.SceneMode.COLUMBUS_VIEW) {
      camera.zoomIn(camera.positionCartographic.height * (1 - options.scale))
      return
    }
    //以相机位置和相机视线方向构建射线
    let ray = new Cesium.Ray(position, direction)
    //相机视线与地球表面的交点
    let intersectPos = viewer.scene.globe.pick(ray, viewer.scene)
    //更精确的可能是得到相机和球体相交坐标点(不含地形)
    //var position1 =  Cesium.IntersectionTests.rayPlane(ray, scene.globe.ellipsoid,new Cesium.Cartesian3());
    //相机位置与地球（含地形高程）交点位置的距离向量
    let directionVector = Cesium.Cartesian3.subtract(position, intersectPos, new Cesium.Cartesian3())
    //计算相机位置距离交点intersectPos的的新距离，比例缩放，缩进0.5，拉远2
    let moveDirection = Cesium.Cartesian3.multiplyByScalar(directionVector, options.scale, directionVector)
    //相机拉近或拉远后的位置
    let endPosition = Cesium.Cartesian3.add(intersectPos, moveDirection, new Cesium.Cartesian3())
    camera.flyTo({
      destination: endPosition,
      orientation: {
        heading,
        pitch,
        roll
      },
      duration: 1.0,
      convert: false
    })
  }

  /**
   * @description 相机复位
   * @Remarks 地图复位飞行功能， 根据当前视角2d或3d切换不同的飞行方式
   * @param {any} options - 建议由配置文件【gs3dConfig】节点map.center控制，可缺省，默认复位中心点为北京
   * @return {void}
   * @example
   * ```ts
   *   {
   *     viewer:Cesium.Viewer,//Cesium.Viewer,Cesium容器,可缺省
   *     longitude_BJ_desc: '北京-116.38889583805896,39.911103086820084（3d）/40.283103086820084（2d）',
   *     longitude: 116.38889583805896,//number,经度
   *     latitude: 39.911103086820084,//number,纬度
   *     height: 400000,//number,高度
   *     heading: 0,//number,偏航角
   *     pitch: -45,//number,俯仰角
   *     roll: 0,//number,翻滚角
   *     duration: 0,//number,飞行时间
   *   }
   *   //调用
   *   gs3d.tools.mapBase.mapCameraReset()
   * ```
   */
  export const mapCameraReset = (options: any = {}) => {
    const { variable } = global
    const { gs3dConfig } = variable
    let defaultOptions = {
      viewer: variable.viewer,
      longitude: 116.38889583805896,
      latitude: 39.911103086820084,
      height: 25000,
      heading: 0,
      pitch: -45,
      // roll: 0,
      duration: 0
    }
    options = { ...defaultOptions, ...gs3dConfig?.map?.center, ...options }

    let viewer: Cesium.Viewer & { [key: string]: any } = options.viewer
    let viewerType: string = viewer?.viewerType ?? gs3dConfig.map.type
    let viewerTypeMap = {
      '2d': -90,
      '3d': -45,
      custom: options.pitch
    }
    // options.pitch = viewerType === '2d' ? -90 : -45
    options.pitch = viewerTypeMap[viewerType]
    //根据配置的相机高度计算相机距离目标点的距离
    let H = options.height
    // let θ = viewerType === '2d' ? 90 : 45
    let θ = -viewerTypeMap[viewerType]
    let R = 6371393 //长轴
    let L = Math.sqrt(Math.pow(R, 2) * Math.pow(Math.sin(θ), 2) + 2 * R * H + Math.pow(H, 2)) - R * Math.sin(θ)
    let center = Cesium.Cartesian3.fromDegrees(options.longitude, options.latitude)
    let bounding = new Cesium.BoundingSphere(center, L)
    viewer.camera.flyToBoundingSphere(bounding, {
      offset: {
        heading: Cesium.Math.toRadians(options.heading),
        pitch: Cesium.Math.toRadians(options.pitch),
        range: L
      },
      duration: options.duration
    })
  }

  /**
   * @description 设置视图模式
   * @Remarks 切换地图模式， 二维、 三维、 哥伦布。 不传参时， 默认三维
   * @param {any} options - 控制地图模式切换，注意：与mapChangeView不同
   * @return {*}
   * @example
   * ```ts
   *   {
   *     viewer:Cesium.Viewer,//Cesium.Viewer,Cesium容器,可缺省
   *     mode:'2d',//String,2d二维/3d三维/columbus哥伦布
   *   }
   *   //调用
   *   gs3d.tools.mapBase.mapSetSceneMode()
   * ```
   */
  export const mapSetSceneMode = (options: any = {}) => {
    const { variable } = global
    let defaultOptions = {
      viewer: variable.viewer,
      mode: '3d'
    }
    options = { ...defaultOptions, ...options }
    let viewer: Cesium.Viewer & { [key: string]: any } = options.viewer
    const { scene } = viewer
    switch (options.mode) {
      case '3d':
        //当前地图场景非3d时，点击时触发地图切换功能，地球视图相应转为3d模式
        if (scene.mode != Cesium.SceneMode.SCENE3D) {
          scene.morphTo3D(1.5)
          setTimeout(() => {
            mapCameraReset()
          }, 1800)
        }
        //视图直接转到2d模式，没有动态效果
        //viewer.scene.mode = Cesium.SceneMode.SCENE3D;
        break
      case '2d':
        //地球视图变化后转到2d模式
        scene.morphTo2D(1.5)
        //直接转到2d模式，但是当相机pitch非-90度时，切换后视图的位置发生变化
        //viewer.scene.mode = Cesium.SceneMode.SCENE2D;
        break
      case 'columbus':
        //地球视图变化后转到哥伦布2.5d模式
        scene.morphToColumbusView(1.5)
        //直接转到哥伦布模式，切换后试图的位置无变化，但是界面没有切换的动态效果
        //viewer.scene.mode = Cesium.SceneMode.COLUMBUS_VIEW;
        break
      default:
        break
    }
  }

  /**
   * @description 地图视角切换
   * @Remarks 区分于地图模式切换， 只是改变当前地图的视角。伪二三维切换。
   * @param {any} options - 查看示例详细参数说明
   * @return {void}
   * @example
   * ```ts
   *   {
   *     viewer:Cesium.Viewer,//Cesium.Viewer,Cesium容器,可缺省
   *     type:'2d',//String,视角类型,可选值2d/3d,可缺省,默认3d
   *     lockMouse:false,//boolean,是否在2d模式下锁定相机旋转，false不锁定，true锁定，可缺省，默认为true
   *   }
   *   //调用
   *   gs3d.tools.mapBase.mapChangeView()
   * ```
   */
  export const mapChangeView = (options: any = {}) => {
    const { variable } = global
    const { gs3dConfig } = variable
    let defaultOptions = {
      viewer: variable.viewer,
      type: '3d',
      lockMouse: true
    }
    options = { ...defaultOptions, ...gs3dConfig.map, ...options }
    let viewer: Cesium.Viewer & { [key: string]: any } = options.viewer
    // 若地图视图与所传参数的type相同，则无需进行视角切换
    if (viewer.viewerType === options.type) {
      console.log(`%c GS3D 地图基础功能【mapChangeView】==> 视角未发生改变,无需切换`, `Color:springgreen`)
      return
    }
    viewer.viewerType = options.type
    //改变当前地图视角类型
    const changeMapView = (viewer: any, type: string, lockMouse?: boolean) => {
      let degree: number
      let controller = viewer.scene.screenSpaceCameraController
      switch (type) {
        case '3d':
          controller.enableLook = true
          controller.enableTilt = true
          degree = -45
          break
        case '2d':
          // 根据地图视图类型确定，当配置为'2d'模式时，若不想锁定鼠标，需要追加配置lockMouse:false,这样在2d模式下，仍然可以转动地球
          if (lockMouse !== false) {
            controller.enableLook = false
            controller.enableTilt = false
          }
          degree = -90
          // controller.tiltEventTypes = undefined
          // controller.rotateEventTypes = undefined
          break
        default:
          break
      }
      let camera = viewer.camera
      let ray = new Cesium.Ray(camera.position, camera.direction)
      let intersectPos = viewer.scene.globe.pick(ray, viewer.scene)
      if (intersectPos) {
        let boundingSphere = new Cesium.BoundingSphere(intersectPos, 1)
        let pitch = Cesium.Math.toRadians(degree)
        let range = Cesium.Cartesian3.distance(camera.position, intersectPos)
        let heading = camera.heading
        camera.flyToBoundingSphere(boundingSphere, {
          offset: {
            heading: heading,
            pitch: pitch,
            range: range
          },
          duration: 1,
          complete: () => {
            let position = camera.position
            let viewObj = {
              destination: position,
              // endTransform: viewMatrix,
              orientation: {
                heading: 0,
                pitch: camera.pitch,
                roll: camera.roll
              },
              duration: 1
            }
            viewer.camera.flyTo(viewObj)
          }
        })
        return
      }
      let position: any
      intersectPos ? null : (position = camera.position)
      let pitch = Cesium.Math.toRadians(degree)
      let view = {
        destination: position,
        // endTransform: viewMatrix,
        orientation: {
          heading: camera.heading,
          pitch: pitch,
          roll: camera.roll
        },
        duration: 1,
        complete: () => {
          let position = camera.position
          let viewObj = {
            destination: position,
            // endTransform: viewMatrix,
            orientation: {
              heading: 0,
              pitch: camera.pitch,
              roll: camera.roll
            },
            duration: 1
          }
          viewer.camera.flyTo(viewObj)
        }
      }
      viewer.camera.flyTo(view)
    }
    changeMapView(viewer, options.type, options.lockMouse)
  }

  /**
   * @description 视角水平调整
   * @Remarks 左旋degree < 0， 右旋degree > 0。 当不传角度时， 默认左旋 - 45
   * @param {any} options -
   * @return {void}
   * @example
   * ```ts
   *   {
   *     viewer:Cesium.Viewer,//Cesium.Viewer,Cesium容器,可缺省
   *     degree:45,//Number,旋转角度,可缺省,默认-45。
   *   }
   *   //调用
   *   gs3d.tools.mapBase.mapCameraHorizontal()
   * ```
   */
  export const mapCameraHorizontal = (options: any = {}) => {
    const { variable } = global
    let defaultOptions = {
      viewer: variable.viewer,
      degree: -45,
      type: 'horizontal'
    }
    options = { ...defaultOptions, ...options }
    _defaultCameraView(options)
  }

  /**
   * @description 视角垂直调整
   * @Remarks 相机视线平行于地表时， 此时相机于地表夹角为0度， 当相机视线俯向地表时， 此时夹角为俯角为负数。 当不传角度时， 默认使用垂直角 - 90
   * @param {any} options -
   * @return {void}
   * @example
   * ```ts
   *   {
   *     viewer:Cesium.Viewer,//Cesium.Viewer,Cesium容器,可缺省
   *     degree:90,//Number,垂直角度,可缺省,默认-90。
   *   }
   *   //调用
   *   gs3d.tools.mapBase.mapCameraVertical()
   * ```
   */
  export const mapCameraVertical = (options: any = {}) => {
    const { variable } = global
    let defaultOptions = {
      viewer: variable.viewer,
      degree: -90,
      type: 'vertical'
    }
    options = { ...defaultOptions, ...options }
    _defaultCameraView(options)
  }

  /**
   * @description 视角垂直或水平调整 辅助方法
   * @Remarks 控制相机位置， 水平 < 0 左旋， 水平 > 0 右旋 垂直 - 90， 俯视 - 45， 垂直平视角 - 0
   * @param {any} options -
   * @return {*}
   * @example
   * ```ts
   *   {
   *     degree:45,//Number,调整角度;
   *     type: vertical,//String,调整类型,可选值vertical/horizontal,必须
   *   }
   * ```
   */
  const _defaultCameraView = (options: any = {}) => {
    let viewer = options.viewer
    // let camera = viewer.camera
    // //获取当前视角坐标
    // let camera_pos = viewer.camera.position
    // let camera_cart_pos = Cesium.Cartographic.fromCartesian(camera_pos)
    // let cam_lon = Cesium.Math.toDegrees(camera_cart_pos.longitude)
    // let cam_lat = Cesium.Math.toDegrees(camera_cart_pos.latitude)
    // let cam_height = camera_cart_pos.height
    // let cam_location = Cesium.Cartesian3.fromDegrees(cam_lon, cam_lat, cam_height)
    // let { heading, pitch } = camera
    let { position, heading, pitch, roll } = viewer.camera
    switch (options.type) {
      case 'vertical':
        //获取当前视角方向
        // let heading = Cesium.Math.toRadians(camera.heading);
        pitch += Cesium.Math.toRadians(options.degree)
        // let roll = Cesium.Math.toRadians(camera.roll);
        // let visual = new Cesium.HeadingPitchRange(0.01,0.01,0.01)
        break
      case 'horizontal':
        //设置相机位置
        // options.degree = Cesium.Math.toRadians(options.degree)
        heading += Cesium.Math.toRadians(options.degree)
        break
      default:
        break
    }
    let view = {
      // destination: cam_location,
      destination: position,
      orientation: {
        heading,
        pitch,
        // roll: camera.roll
        roll
      },
      duration: 0.3
    }
    viewer.camera.flyTo(view)
    // camera.lookAt(position,visual)
  }

  /**
   * @description 设置相机可被拉高的最大高度
   * @param {any} options -
   * @return {void}
   * @example
   * ```ts
   *   {
   *     viewer:Cesium.Viewer,//Cesium.Viewer,Cesium容器,可缺省
   *     maxHeight:1,//Number,传参或通过主配置map节点设置,不配置则不设置
   *   }
   *   //调用
   *   gs3d.tools.mapBase.mapCameraMaxHeight()
   * ```
   */
  export const mapCameraMaxHeight = (options: any = {}) => {
    const { variable } = global
    const { gs3dConfig } = variable
    let defaultOptions = {
      viewer: variable.viewer
    }
    options = { ...defaultOptions, ...options }
    let viewer: Cesium.Viewer & { [key: string]: any } = options.viewer
    options.maxHeight = options.maxHeight ?? gs3dConfig?.map?.maxHeight
    if (options.maxHeight) {
      viewer.scene.screenSpaceCameraController.maximumZoomDistance = options.maxHeight
    }
  }

  /**
   * @description 设置相机可被降低的最小高度
   * @param {any} options -
   * @return {void}
   * @example
   * ```ts
   *   {
   *     viewer:Cesium.Viewer,//Cesium.Viewer,Cesium容器,可缺省
   *     minHeight:1,//Number,传参或通过主配置map节点设置,不配置则不设置
   *   }
   *   //调用
   *   gs3d.tools.mapBase.mapCameraMinHeight()
   * ```
   */
  export const mapCameraMinHeight = (options: any = {}) => {
    const { variable } = global
    const { gs3dConfig } = variable
    let defaultOptions = {
      viewer: variable.viewer
    }
    options = { ...defaultOptions, ...gs3dConfig?.map, ...options }
    let viewer: Cesium.Viewer & { [key: string]: any } = options.viewer
    if (!options.minHeight && options.minHeight !== 0) return
    //设置最小高度
    viewer.scene.screenSpaceCameraController.minimumZoomDistance = options.minHeight
  }
}
