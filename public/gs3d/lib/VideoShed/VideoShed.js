// import videoShed3dShader from './videoShed3dShader'
let videoShed3dShader = `
    uniform float mixNum;
    uniform sampler2D colorTexture;
    uniform sampler2D stcshadow; 
    uniform sampler2D videoTexture;
    uniform sampler2D depthTexture;
    uniform mat4 _shadowMap_matrix; 
    uniform vec4 shadowMap_lightPositionEC; 
    uniform vec4 shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness; 
    uniform vec4 shadowMap_texelSizeDepthBiasAndNormalShadingSmooth; 
    varying vec2 v_textureCoordinates;
    vec4 toEye(in vec2 uv, in float depth){    
        vec2 xy = vec2((uv.x * 2.0 - 1.0), (uv.y * 2.0 - 1.0));    
        vec4 posInCamera = czm_inverseProjection * vec4(xy, depth, 1.0); 
        posInCamera = posInCamera / posInCamera.w; 
        return posInCamera; 
    }
    float getDepth(in vec4 depth){    
        float z_window = czm_unpackDepth(depth); 
        z_window = czm_reverseLogDepth(z_window);    
        float n_range = czm_depthRange.near;    
        float f_range = czm_depthRange.far; 
        return (2.0 * z_window - n_range - f_range) / (f_range - n_range); 
    }
    float _czm_sampleShadowMap(sampler2D shadowMap, vec2 uv){ 
        return texture2D(shadowMap, uv).r; 
    }
    float _czm_shadowDepthCompare(sampler2D shadowMap, vec2 uv, float depth){ 
        return step(depth, _czm_sampleShadowMap(shadowMap, uv)); 
    }
    float _czm_shadowVisibility(sampler2D shadowMap, czm_shadowParameters shadowParameters){    
        float depthBias = shadowParameters.depthBias;    
        float depth = shadowParameters.depth;    
        float nDotL = shadowParameters.nDotL;    
        float normalShadingSmooth = shadowParameters.normalShadingSmooth;    
        float darkness = shadowParameters.darkness;    
        vec2 uv = shadowParameters.texCoords; 
        depth -= depthBias;    
        vec2 texelStepSize = shadowParameters.texelStepSize;    
        float radius = 1.0;    
        float dx0 = -texelStepSize.x * radius;    
        float dy0 = -texelStepSize.y * radius;    
        float dx1 = texelStepSize.x * radius;    
        float dy1 = texelStepSize.y * radius;    
        float visibility = (_czm_shadowDepthCompare(shadowMap, uv, depth) 
            + _czm_shadowDepthCompare(shadowMap, uv + vec2(dx0, dy0), depth) 
            + _czm_shadowDepthCompare(shadowMap, uv + vec2(0.0, dy0), depth) 
            + _czm_shadowDepthCompare(shadowMap, uv + vec2(dx1, dy0), depth) 
            + _czm_shadowDepthCompare(shadowMap, uv + vec2(dx0, 0.0), depth) 
            + _czm_shadowDepthCompare(shadowMap, uv + vec2(dx1, 0.0), depth) 
            + _czm_shadowDepthCompare(shadowMap, uv + vec2(dx0, dy1), depth) 
            + _czm_shadowDepthCompare(shadowMap, uv + vec2(0.0, dy1), depth) 
            + _czm_shadowDepthCompare(shadowMap, uv + vec2(dx1, dy1), depth)) * (1.0 / 9.0); 
            return visibility; 
    }
    vec3 pointProjectOnPlane(in vec3 planeNormal, in vec3 planeOrigin, in vec3 point){    
        vec3 v01 = point - planeOrigin;    
        float d = dot(planeNormal, v01); 
        return (point - planeNormal * d); 
    }
    float ptm(vec3 pt){ 
        return sqrt(pt.x * pt.x + pt.y * pt.y + pt.z * pt.z); 
    } 
    void main() { 
        const float PI = 3.141592653589793;
        vec4 color = texture2D(colorTexture, v_textureCoordinates);    
        vec4 currD = texture2D(depthTexture, v_textureCoordinates); 
        if (currD.r >= 1.0) { gl_FragColor = color; return; }        
        float depth = getDepth(currD);    
        vec4 positionEC = toEye(v_textureCoordinates, depth);    
        vec3 normalEC = vec3(1.0);    
        czm_shadowParameters shadowParameters; 
        shadowParameters.texelStepSize = shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.xy; 
        shadowParameters.depthBias = shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.z; 
        shadowParameters.normalShadingSmooth = shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.w; 
        shadowParameters.darkness = shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness.w; 
        shadowParameters.depthBias *= max(depth * 0.01, 1.0);     
        vec3 directionEC = normalize(positionEC.xyz - shadowMap_lightPositionEC.xyz);     
        float nDotL = clamp(dot(normalEC, -directionEC), 0.0, 1.0);     
        vec4 shadowPosition = _shadowMap_matrix * positionEC; shadowPosition /= shadowPosition.w; 
        if (any(lessThan(shadowPosition.xyz, vec3(0.0))) || any(greaterThan(shadowPosition.xyz, vec3(1.0)))) { 
            gl_FragColor = color; 
            return; 
        } 
        shadowParameters.texCoords = shadowPosition.xy; 
        shadowParameters.depth = shadowPosition.z; 
        shadowParameters.nDotL = nDotL;     
        float visibility = _czm_shadowVisibility(stcshadow, shadowParameters);     
        vec4 videoColor = texture2D(videoTexture, shadowPosition.xy); 
        if (visibility == 1.0) { 
            gl_FragColor = mix(color, vec4(videoColor.xyz, 1.0), mixNum * videoColor.a); 
        } else {
            if (abs(shadowPosition.z - 0.0) < 0.01) {
                return;
            }
            gl_FragColor = mix(color, vec4(1.,1.,1.,1.), 0.1);
            // gl_FragColor = color;
        }
    }`
// import videoShed3dShader from './videoShed3dShader'

// import ECEF from "./CoordinateTranslate";
let ECEF = function () {
  this.PI = 3.141592653589793238
  this.a = 6378137.0
  this.b = 6356752.3142
  this.f = (this.a - this.b) / this.a
  this.e_sq = this.f * (2.0 - this.f)
  this.ee = 0.00669437999013
  this.WGSF = 1 / 298.257223563
  this.WGSe2 = this.WGSF * (2 - this.WGSF)
  this.WGSa = 6378137.0
  this.EPSILON = 1.0e-12
}
ECEF.prototype.CalculateCoordinates = function (point, azimuth, elevation, distance) {
  var vertical_height = distance * Math.sin(((2 * this.PI) / 360) * elevation) //垂直高度
  var horizontal_distance = distance * Math.cos(((2 * this.PI) / 360) * elevation) //水平距离
  if (azimuth > 360) azimuth = azimuth % 360
  if (azimuth < 0) azimuth = 360 + (azimuth % 360)

  var point1 = this.lonLat2WebMercator(point)
  var lnglat = null

  var x_length, y_length
  if (azimuth <= 90) {
    //第四象限
    x_length = horizontal_distance * Math.cos(((2 * this.PI) / 360) * azimuth)
    y_length = horizontal_distance * Math.sin(((2 * this.PI) / 360) * azimuth)
    lnglat = {
      x: point1.x + x_length,
      y: point1.y - y_length
    }
  } else if (azimuth > 90 && azimuth <= 180) {
    //第三象限
    x_length = horizontal_distance * Math.sin(((2 * this.PI) / 360) * (azimuth - 90))
    y_length = horizontal_distance * Math.cos(((2 * this.PI) / 360) * (azimuth - 90))
    lnglat = {
      x: point1.x - x_length,
      y: point1.y - y_length
    }
  } else if (azimuth > 180 && azimuth <= 270) {
    //第二象限
    x_length = horizontal_distance * Math.cos(((2 * this.PI) / 360) * (azimuth - 180))
    y_length = horizontal_distance * Math.sin(((2 * this.PI) / 360) * (azimuth - 180))
    lnglat = {
      x: point1.x - x_length,
      y: point1.y + y_length
    }
  } else {
    //第一象限
    x_length = horizontal_distance * Math.sin(((2 * this.PI) / 360) * (azimuth - 270))
    y_length = horizontal_distance * Math.cos(((2 * this.PI) / 360) * (azimuth - 270))
    lnglat = {
      x: point1.x + x_length,
      y: point1.y + y_length
    }
  }
  lnglat = this.webMercator2LonLat(lnglat)
  return {
    lng: lnglat.x,
    lat: lnglat.y,
    height: vertical_height
  }
}
/*
 *经纬度转Web墨卡托
 *@lonLat 经纬度
 */
ECEF.prototype.lonLat2WebMercator = function (lonLat) {
  let x = (lonLat.x * this.a) / 180
  let y = Math.log(Math.tan(((90 + lonLat.y) * this.PI) / 360)) / (this.PI / 180)
  y = (y * this.a) / 180
  return {
    x: x,
    y: y
  }
}

/*
 *Web墨卡托转经纬度
 *@mercator 平面坐标
 */
ECEF.prototype.webMercator2LonLat = function (mercator) {
  let x = (mercator.x / this.a) * 180
  let y = (mercator.y / this.a) * 180
  y = (180 / this.PI) * (2 * Math.exp((y * this.PI) / 180) - this.PI / 2)
  return {
    x: x,
    y: y
  }
}

ECEF.prototype.get_atan = function (z, y) {
  let x
  if (z == 0) {
    x = this.PI / 2
  } else {
    if (y == 0) {
      x = this.PI
    } else {
      x = Math.atan(Math.abs(y / z))
      if (y > 0 && z < 0) {
        x = this.PI - x
      } else if (y < 0 && z < 0) {
        x = this.PI + x
      } else if (y < 0 && z > 0) {
        x = 2 * this.M_PI - x
      }
    }
  }
  return x
}
//WGS84转ECEF坐标系
ECEF.prototype.ConvertLLAToXYZ = function (LLACoor) {
  let lon = (this.PI / 180) * LLACoor.longitude
  let lat = (this.PI / 180) * LLACoor.latitude
  let H = LLACoor.altitude
  let N0 = this.a / Math.sqrt(1.0 - this.ee * Math.sin(lat) * Math.sin(lat))
  let x = (N0 + H) * Math.cos(lat) * Math.cos(lon)
  let y = (N0 + H) * Math.cos(lat) * Math.sin(lon)
  let z = (N0 * (1.0 - this.ee) + H) * Math.sin(lat)
  return {
    x: x,
    y: y,
    z: z
  }
}

//ECEF坐标系转WGS84
ECEF.prototype.ConvertXYZToLLA = function (XYZCoor) {
  let longitude = this.get_atan(XYZCoor.x, XYZCoor.y)
  if (longitude < 0) {
    longitude = longitude + this.PI
  }
  let latitude = this.get_atan(Math.sqrt(XYZCoor.x * XYZCoor.x + XYZCoor.y * XYZCoor.y), XYZCoor.z)

  let W = Math.sqrt(1 - this.WGSe2 * Math.sin(latitude) * Math.sin(latitude))
  let N = this.WGSa / W
  let B1
  do {
    B1 = latitude
    W = Math.sqrt(1 - this.WGSe2 * Math.sin(B1) * Math.sin(B1))
    N = this.WGSa / W
    latitude = this.get_atan(Math.sqrt(XYZCoor.x * XYZCoor.x + XYZCoor.y * XYZCoor.y), XYZCoor.z + N * this.WGSe2 * Math.sin(B1))
  } while (Math.abs(latitude - B1) > this.EPSILON)

  var altitude = Math.sqrt(XYZCoor.x * XYZCoor.x + XYZCoor.y * XYZCoor.y) / Math.cos(latitude) - this.WGSa / Math.sqrt(1 - this.WGSe2 * Math.sin(latitude) * Math.sin(latitude))

  return {
    longitude: (longitude * 180) / this.PI,
    latitude: (latitude * 180) / this.PI,
    altitude: altitude
  }
}
/*北东天坐标系转WGS84
	@ a A点坐标
	@ p 相对参数，距离、方位角、仰角
	*/
//	俯视角pitch -elevation
//航向角heading（yaw） -azimuth
ECEF.prototype.enu_to_ecef = function (a, p) {
  //距离
  let distance = p.distance
  //方位角
  let azimuth = p.azimuth
  //仰角
  let elevation = p.elevation

  let zUp = elevation >= 0 ? distance * Math.sin((this.PI / 180) * elevation) : -1 * distance * Math.sin((this.PI / 180) * Math.abs(elevation))

  let d = distance * Math.cos((this.PI / 180) * Math.abs(elevation))
  let xEast
  let yNorth
  if (azimuth <= 90) {
    xEast = d * Math.sin((this.PI / 180) * azimuth)
    yNorth = d * Math.cos((this.PI / 180) * azimuth)
  } else if (azimuth > 90 && azimuth < 180) {
    xEast = d * Math.cos((this.PI / 180) * (azimuth - 90))
    yNorth = -1 * d * Math.sin((this.PI / 180) * (azimuth - 90))
  } else if (azimuth > 180 && azimuth < 270) {
    xEast = -1 * d * Math.sin((this.PI / 180) * (azimuth - 180))
    yNorth = -1 * d * Math.cos((this.PI / 180) * (azimuth - 180))
  } else {
    xEast = -1 * d * Math.sin((this.PI / 180) * (360 - azimuth))
    yNorth = d * Math.cos((this.PI / 180) * (360 - azimuth))
  }

  let lamb = this.radians(a.latitude)
  let phi = this.radians(a.longitude)
  let h0 = a.altitude

  let s = Math.sin(lamb)
  let N = this.a / Math.sqrt(1.0 - this.e_sq * s * s)

  let sin_lambda = Math.sin(lamb)
  let cos_lambda = Math.cos(lamb)

  let sin_phi = Math.sin(phi)
  let cos_phi = Math.cos(phi)

  let x0 = (h0 + N) * cos_lambda * cos_phi
  let y0 = (h0 + N) * cos_lambda * sin_phi
  let z0 = (h0 + (1 - this.e_sq) * N) * sin_lambda

  let t = cos_lambda * zUp - sin_lambda * yNorth

  let zd = sin_lambda * zUp + cos_lambda * yNorth
  let xd = cos_phi * t - sin_phi * xEast
  let yd = sin_phi * t + cos_phi * xEast

  return this.ConvertXYZToLLA({
    x: xd + x0,
    y: yd + y0,
    z: zd + z0
  })
}
ECEF.prototype.radians = function (degree) {
  return (this.PI / 180) * degree
}
// import ECEF from "./CoordinateTranslate";

// import CesiumVideo3d from "./CesiumVideo3d";
// let CesiumVideo3d = (function () {
let CesiumVideo3d = function (viewer, param) {
  // Cesium=cesium
  this.viewer = viewer
  this.ECEF = new ECEF()
  this.param = param
  var option = this._initCameraParam()
  this.optionType = {
    Color: 1,
    Image: 2,
    Video: 3
  }
  this.near = option.near ? option.near : 0.1
  if (
    (option || (option = {}),
    (this.viewer = viewer),
    (this._cameraPosition = option.cameraPosition),
    (this._position = option.position),
    (this.type = option.type),
    (this._alpha = option.alpha || 1),
    (this.url = option.url),
    (this.color = option.color),
    (this._debugFrustum = Cesium.defaultValue(option.debugFrustum, !0)),
    (this._aspectRatio = option.aspectRatio || this._getWinWidHei()),
    (this._camerafov = option.fov || Cesium.Math.toDegrees(this.viewer.scene.camera.frustum.fov)),
    (this.texture =
      option.texture ||
      new Cesium.Texture({
        context: this.viewer.scene.context,
        source: {
          width: 1,
          height: 1,
          arrayBufferView: new Uint8Array([255, 255, 255, 255])
        },
        flipY: !1
      })),
    (this._videoPlay = Cesium.defaultValue(option.videoPlay, !0)),
    (this.defaultShow = Cesium.defaultValue(option.show, !0)),
    !this.cameraPosition || !this.position)
  )
    return void console.log('初始化失败：请确认相机位置与视点位置正确!')
  switch (this.type) {
    default:
    case this.optionType.Video:
      this.activeVideo(this.url)
      break
    case this.optionType.Image:
      this.activePicture(this.url)
      this.deActiveVideo()
      break
    case this.optionType.Color:
      this.activeColor(this.color), this.deActiveVideo()
  }
  this._createShadowMap(), this._getOrientation(), this._addCameraFrustum()
  this._addPostProcess()
  this.viewer.scene.primitives.add(this)
}
Object.defineProperties(CesiumVideo3d.prototype, {
  alpha: {
    get: function () {
      return this._alpha
    },
    set: function (e) {
      return (this._alpha = e)
    }
  },
  aspectRatio: {
    get: function () {
      return this._aspectRatio
    },
    set: function (e) {
      ;(this._aspectRatio = e), this._changeVideoWidHei()
    }
  },
  debugFrustum: {
    get: function () {
      return this._debugFrustum
    },
    set: function (e) {
      ;(this._debugFrustum = e), (this.cameraFrustum.show = e)
    }
  },
  fov: {
    get: function () {
      return this._camerafov
    },
    set: function (e) {
      ;(this._camerafov = e), this._changeCameraFov()
    }
  },
  cameraPosition: {
    get: function () {
      return this._cameraPosition
    },
    set: function (e) {
      e && ((this._cameraPosition = e), this._changeCameraPos())
    }
  },
  position: {
    get: function () {
      return this._position
    },
    set: function (e) {
      e && ((this._position = e), this._changeViewPos())
    }
  },
  videoPlay: {
    get: function () {
      return this._videoPlay
    },
    set: function (e) {
      ;(this._videoPlay = Boolean(e)), this._videoEle && (this.videoPlay ? this._videoEle.paly() : this._videoEle.pause())
    }
  },
  params: {
    get: function () {
      var t = {}
      return (
        (t.type = this.type),
        this.type == this.optionType.Color ? (t.color = this.color) : (t.url = this.url),
        (t.position = this.position),
        (t.cameraPosition = this.cameraPosition),
        (t.fov = this.fov),
        (t.aspectRatio = this.aspectRatio),
        (t.alpha = this.alpha),
        (t.debugFrustum = this.debugFrustum),
        t
      )
    }
  },
  show: {
    get: function () {
      return this.defaultShow
    },
    set: function (e) {
      ;(this.defaultShow = Boolean(e)), this._switchShow(), (this.viewShadowMap.enable = Boolean(e))
    }
  }
})
CesiumVideo3d.prototype._initCameraParam = function () {
  var viewPoint = this.ECEF.enu_to_ecef(
    {
      longitude: this.param.position.x * 1,
      latitude: this.param.position.y * 1,
      altitude: this.param.position.z * 1
    },
    {
      distance: this.param.far || 1000,
      azimuth: this.param.rotation.y * 1,
      elevation: this.param.rotation.x * 1
    }
  )
  var position = Cesium.Cartesian3.fromDegrees(viewPoint.longitude, viewPoint.latitude, viewPoint.altitude)
  var cameraPosition = Cesium.Cartesian3.fromDegrees(this.param.position.x * 1, this.param.position.y * 1, this.param.position.z * 1)
  return {
    type: 3,
    url: this.param.url,
    color: this.param.color,
    videoId: this.param.videoId,
    cameraPosition: cameraPosition,
    position: position,
    alpha: this.param.alpha,
    near: this.param.near,
    fov: this.param.fov,
    debugFrustum: this.param.debugFrustum
  }
}
/**
 * 旋转
 */
CesiumVideo3d.prototype._changeRotation = function (e) {
  if (e) {
    this.param.rotation = e
    var option = this._initCameraParam()
    this.position = option.position
  }
}
/**
 * 相机位置
 */
CesiumVideo3d.prototype._changeCameraPosition = function (e) {
  if (e) {
    this.param.position = e
    var option = this._initCameraParam()
    this.cameraPosition = option.cameraPosition
  }
}
CesiumVideo3d.prototype._changeAlpha = function (e) {
  if (e) {
    this.param.alpha = e
    var option = this._initCameraParam()
    this.alpha = option.alpha
  }
}
CesiumVideo3d.prototype._changeFar = function (e) {
  if (e) {
    this.param.far = e
    var option = this._initCameraParam()
    this.position = option.position
  }
}
CesiumVideo3d.prototype._changeNear = function (e) {
  if (e) {
    this.param.near = e
    this.near = this.param.near
    this._changeCameraPos()
  }
}
/**获取三维地图容器像素大小
 */
CesiumVideo3d.prototype._getWinWidHei = function () {
  var viewer = this.viewer.scene
  return viewer.canvas.clientWidth / viewer.canvas.clientHeight
}
CesiumVideo3d.prototype._changeCameraFov = function () {
  this.viewer.scene.postProcessStages.remove(this.postProcess)
  this.viewer.scene.primitives.remove(this.cameraFrustum), this._createShadowMap(this.cameraPosition, this.position), this._getOrientation(), this._addCameraFrustum(), this._addPostProcess()
}
CesiumVideo3d.prototype._changeVideoWidHei = function () {
  this.viewer.scene.postProcessStages.remove(this.postProcess), this.viewer.scene.primitives.remove(this.cameraFrustum)
  this._createShadowMap(this.cameraPosition, this.position), this._getOrientation(), this._addCameraFrustum(), this._addPostProcess()
}
CesiumVideo3d.prototype._changeCameraPos = function () {
  this.viewer.scene.postProcessStages.remove(this.postProcess),
    this.viewer.scene.primitives.remove(this.cameraFrustum),
    this.viewShadowMap.destroy(),
    // this.cameraFrustum.destroy(),
    this._createShadowMap(this.cameraPosition, this.position),
    this._getOrientation(),
    this._addCameraFrustum(),
    this._addPostProcess()
}
CesiumVideo3d.prototype._changeViewPos = function () {
  this.viewer.scene.postProcessStages.remove(this.postProcess)
  this.viewer.scene.primitives.remove(this.cameraFrustum)
  this.viewShadowMap.destroy()
  // this.cameraFrustum.destroy();
  this._createShadowMap(this.cameraPosition, this.position)
  this._getOrientation()
  this._addCameraFrustum()
  this._addPostProcess()
}
CesiumVideo3d.prototype._switchShow = function () {
  this.show ? !this.postProcess && this._addPostProcess() : (this.viewer.scene.postProcessStages.remove(this.postProcess), delete this.postProcess, (this.postProcess = null)),
    (this.cameraFrustum.show = this.show)
}
/** 创建视频Element
 * @param {String} url 视频地址
 **/
CesiumVideo3d.prototype._createVideoEle = function (url, vid = 'visualDomId') {
  this.videoId = vid
  let videos = document.getElementById('videos')
  if (!videos) {
    videos = document.createElement('div')
    videos.setAttribute('id', 'videos')
    videos.setAttribute('display', 'none')
  }
  var t = document.createElement('SOURCE')
  ;(t.type = 'video/mp4'), (t.src = url)
  var i = document.createElement('SOURCE')
  ;(i.type = 'video/quicktime'), (i.src = url)
  var a = document.createElement('VIDEO')
  a.style.width = '400px'
  return a.setAttribute('autoplay', !0), a.setAttribute('loop', !0), a.setAttribute('crossorigin', !0), a.appendChild(t), a.appendChild(i), videos.appendChild(a), a
}
/** 视频投射
 * @param {String} url 视频地址
 */
CesiumVideo3d.prototype.activeVideo = function (url) {
  let that = this
  let video = that.param.live ? document.getElementById(this.param.videoId) : this._createVideoEle(url, this.param.videoId)
  that._videoEle = video
  if (video) {
    this.type = that.optionType.Video
    var viewer = this.viewer
    this.activeVideoListener ||
      (this.activeVideoListener = function () {
        that.videoTexture && that.videoTexture.destroy(),
          (that.videoTexture = new Cesium.Texture({
            context: viewer.scene.context,
            source: video,
            width: 1,
            height: 1,
            pixelFormat: Cesium.PixelFormat.RGBA,
            pixelDatatype: Cesium.PixelDatatype.UNSIGNED_BYTE
          }))
      }),
      viewer.clock.onTick.addEventListener(this.activeVideoListener)
  }
}
CesiumVideo3d.prototype.deActiveVideo = function () {
  if (this.activeVideoListener) {
    this.viewer.clock.onTick.removeEventListener(this.activeVideoListener), delete this.activeVideoListener
  }
}
/** 图片投放
 * @param {String} url 图片地址
 **/
CesiumVideo3d.prototype.activePicture = function (url) {
  this.videoTexture = this.texture
  var that = this,
    img = new Image()
  ;(img.onload = function () {
    ;(that.type = that.optionType.Image),
      (that.videoTexture = new Cesium.Texture({
        context: that.viewer.scene.context,
        source: img
      }))
  }),
    (img.onerror = function () {
      console.log('图片加载失败:' + url)
    }),
    (img.src = url)
}
CesiumVideo3d.prototype.locate = function () {
  var cameraPosition = Cesium.clone(this.cameraPosition),
    position = Cesium.clone(this.position)
  ;(this.viewer.Camera.position = cameraPosition),
    (this.viewer.camera.direction = Cesium.Cartesian3.subtract(position, cameraPosition, new Cesium.Cartesian3(0, 0, 0))),
    (this.viewer.camera.up = Cesium.Cartesian3.normalize(cameraPosition, new Cesium.Cartesian3(0, 0, 0)))
}
CesiumVideo3d.prototype.update = function (e) {
  this.viewShadowMap && this.viewer.scene.frameState.shadowMaps.push(this.viewShadowMap) // *重点* 多投影
}
CesiumVideo3d.prototype.destroy = function () {
  // if(this._videoEle) { this._videoEle.innerHTML = '' };
  this.viewer.scene.postProcessStages.remove(this.postProcess),
    this.viewer.scene.primitives.remove(this.cameraFrustum),
    !this.param.live && this._videoEle && this._videoEle.parentNode.removeChild(this._videoEle),
    this.activeVideoListener && this.viewer.clock.onTick.removeEventListener(this.activeVideoListener),
    this.activeVideoListener && delete this.activeVideoListener,
    delete this.postProcess,
    delete this.viewShadowMap,
    delete this.color,
    delete this.viewDis,
    delete this.cameraPosition,
    delete this.position,
    delete this.alpha,
    delete this._camerafov,
    delete this._cameraPosition,
    delete this.videoTexture,
    delete this.cameraFrustum,
    delete this._videoEle,
    delete this._debugFrustum,
    delete this._position,
    delete this._aspectRatio,
    delete this.url,
    delete this.orientation,
    delete this.texture,
    delete this.videoId,
    delete this.type,
    this.viewer.scene.primitives.remove(this),
    delete this.viewer
}
// 创建shadowmap
CesiumVideo3d.prototype._createShadowMap = function () {
  var e = this.cameraPosition,
    t = this.position,
    i = this.viewer.scene,
    a = new Cesium.Camera(i)
  ;(a.position = e),
    (a.direction = Cesium.Cartesian3.subtract(t, e, new Cesium.Cartesian3(0, 0, 0))), //计算两个笛卡尔的组分差异。
    (a.up = Cesium.Cartesian3.normalize(e, new Cesium.Cartesian3(0, 0, 0))) // 归一化
  var n = Cesium.Cartesian3.distance(t, e)
  ;(this.viewDis = n),
    (a.frustum = new Cesium.PerspectiveFrustum({
      fov: Cesium.Math.toRadians(this.fov),
      aspectRatio: this.aspectRatio,
      near: this.near,
      far: n
    }))
  this.viewShadowMap = new Cesium.ShadowMap({
    lightCamera: a,
    enable: !1,
    isPointLight: !1,
    isSpotLight: !0,
    cascadesEnabled: !1,
    context: i.context,
    pointLightRadius: n
  })
}
// 获取shadowmap位置
CesiumVideo3d.prototype._getOrientation = function () {
  var e = this.cameraPosition,
    t = this.position,
    i = Cesium.Cartesian3.normalize(Cesium.Cartesian3.subtract(t, e, new Cesium.Cartesian3()), new Cesium.Cartesian3()),
    a = Cesium.Cartesian3.normalize(e, new Cesium.Cartesian3()),
    n = new Cesium.Camera(this.viewer.scene)
  ;(n.position = e), (n.direction = i), (n.up = a), (i = n.directionWC), (a = n.upWC)
  var r = n.rightWC,
    o = new Cesium.Cartesian3(),
    l = new Cesium.Matrix3(),
    u = new Cesium.Quaternion()
  r = Cesium.Cartesian3.negate(r, o)
  var d = l
  Cesium.Matrix3.setColumn(d, 0, r, d), Cesium.Matrix3.setColumn(d, 1, a, d), Cesium.Matrix3.setColumn(d, 2, i, d)
  var c = Cesium.Quaternion.fromRotationMatrix(d, u)

  /*var viewMatrix=n.viewMatrix;
        var inverseViewMatrix=n.inverseViewMatrix;
        console.log("视图矩阵=",viewMatrix);
        console.log("逆视图矩阵=",inverseViewMatrix);
        
        var frustum = new Cesium.PerspectiveFrustum({
            fov :20,
            aspectRatio : 0.75,
            near : 1.0,
            far : 10.0
        });
 
        var projectionMatrix=frustum.projectionMatrix;
        var infiniteProjectionMatrix=frustum.infiniteProjectionMatrix;
        console.log("投影矩阵=",projectionMatrix);
        console.log("透视投影矩阵=",infiniteProjectionMatrix);
         
        //透视投 影矩阵反转
       var inverseInfiniteProjectionMatrix=new Cesium.Matrix4();
       Cesium.Matrix4.inverse(infiniteProjectionMatrix,inverseInfiniteProjectionMatrix);
       console.log("透视投 影矩阵反转=",inverseInfiniteProjectionMatrix);
       
       //逆视图投影矩阵
       var inverseViewProjectionMatrix=new Cesium.Matrix4();
       Cesium.Matrix4.multiply(inverseInfiniteProjectionMatrix,inverseViewMatrix,inverseViewProjectionMatrix)
       console.log("逆视图投影矩阵=",inverseViewProjectionMatrix);
       
       //视图投影矩阵
       var viewProjectionMatrix=new Cesium.Matrix4();
       Cesium.Matrix4.inverse(inverseViewProjectionMatrix,viewProjectionMatrix);
       console.log("视图投影矩阵=",viewProjectionMatrix);
       
       //远平面标准模型矩阵
       var matrix4 = Cesium.Matrix4.fromUniformScale(10);
       console.log("远平面标准模型矩阵=",matrix4);
       
       //模型矩阵
       var modelMatrix=new Cesium.Matrix4();
       Cesium.Matrix4.multiply(inverseViewMatrix,matrix4,modelMatrix)
       console.log("模型矩阵=",modelMatrix);
       
       //视图矩阵与逆视图投影矩阵相乘得到立方体模型视图
       var uBoxMV=new Cesium.Matrix4();
       Cesium.Matrix4.multiply(viewMatrix,inverseViewProjectionMatrix,uBoxMV)
       console.log("立方体模型视图=",uBoxMV);
       
       //逆立方体模型视图
       var uInverseBoxMV=new Cesium.Matrix4();
       Cesium.Matrix4.multiply(viewMatrix,viewProjectionMatrix,uInverseBoxMV)
       console.log("立方体模型视图=",uInverseBoxMV);
       
       //将这两个模型视图赋予分类基元类的一致性映射 参数便可以最终实现视频监控图像与实景三维场景的融 合
       
         var geometry =this.creacteGeometry(5,5);
         var instance = new Cesium.GeometryInstance({
               // geometry: //new Cesium.Geometry({}),
               // geometry: new Cesium.GeometryInstance({
               //   geometry:new Cesium.FrustumOutlineGeometry ({
               //     origin: Cesium.Cartesian3.fromDegrees(cameraLong,cameraLat, cameraHeight),
               //     orientation:orientation,
               //     frustum: perspectiveFrustum,
               //     _drawNearPlane: true
               //   }),
               geometry:geometry,
               classificationType:Cesium.ClassificationType.BOTH,
               // modelMatrix: modelMatrix,
               attributes : {
                 color : Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.fromCssColorString('#ff0000').withAlpha(1.0)),
                 show : new Cesium.ShowGeometryInstanceAttribute(true)
               }
               });
         var videoElement = this._createVideoEle("http://localhost:7070/video/北京路与天马路交叉口高点枪机.mkv");
         var material = Cesium.Material.fromType('Image');
        material.uniforms.image = videoElement;
         var _uniformMap ={
                   u_boxMV:uBoxMV,
                   u_inverseBoxMV:uInverseBoxMV
                 };
         this.viewer.scene.primitives.add(new Cesium.Primitive({
               geometryInstances: instance,
               appearance: new Cesium.MaterialAppearance ({
                 material: material,
                 close:false,
               }),
               modelMatrix: modelMatrix,
               _uniformMap:_uniformMap,
               asynchronous:false,
               compressVertices:false,
               allowPicking:false
             }));*/

  //ClassificationPrimitive
  return (this.orientation = c), c
}
;(CesiumVideo3d.prototype.creacteGeometry = function (width, height) {
  var hwidth = width / 2.0
  var hheigt = height / 2.0
  var positions = new Float64Array([hwidth, 0.0, hheigt, -hwidth, 0.0, hheigt, -hwidth, 0.0, -hheigt, hwidth, 0.0, -hheigt])
  var sts = new Float32Array([1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0])
  var indices = new Uint16Array([0, 1, 2, 0, 2, 3])
  var ge = this._createGeometry(positions, sts, indices)
  return ge
}),
  (CesiumVideo3d.prototype._createGeometry = function (positions, sts, indices) {
    /* var Cesium = this.Cesium;*/
    return new Cesium.Geometry({
      attributes: {
        position: new Cesium.GeometryAttribute({
          componentDatatype: Cesium.ComponentDatatype.DOUBLE,
          componentsPerAttribute: 3,
          values: positions
        }),
        normal: new Cesium.GeometryAttribute({
          componentDatatype: Cesium.ComponentDatatype.FLOAT,
          componentsPerAttribute: 3,
          values: new Float32Array([255.0, 0.0, 0.0, 255.0, 0.0, 0.0, 255.0, 0.0, 0.0, 255.0, 0.0, 0.0])
          // values: new Float32Array([0.0, 0.0, 0.0,0.0, 0.0, 0.0,0.0, 0.0, 0.0,0.0, 0.0, 0.0])
        }),
        st: new Cesium.GeometryAttribute({
          componentDatatype: Cesium.ComponentDatatype.FLOAT,
          componentsPerAttribute: 2,
          values: sts
        })
      },
      indices: indices,
      primitiveType: Cesium.PrimitiveType.TRIANGLES,
      vertexFormat: new Cesium.VertexFormat({
        position: true,
        color: true
      }),
      boundingSphere: Cesium.BoundingSphere.fromVertices(positions)
    })
  }),
  //创建视锥
  (CesiumVideo3d.prototype._addCameraFrustum = function () {
    var e = this
    ;(this.cameraFrustum = new Cesium.Primitive({
      geometryInstances: new Cesium.GeometryInstance({
        geometry: new Cesium.FrustumOutlineGeometry({
          origin: e.cameraPosition,
          orientation: e.orientation,
          frustum: this.viewShadowMap._lightCamera.frustum,
          _drawNearPlane: !0
        }),
        attributes: {
          color: Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(0, 0.5, 0.5))
        }
      }),
      appearance: new Cesium.PerInstanceColorAppearance({
        translucent: !1,
        flat: !0
      }),
      asynchronous: !1,
      show: this.debugFrustum && this.show
    })),
      this.viewer.scene.primitives.add(this.cameraFrustum)
  })
CesiumVideo3d.prototype._addPostProcess = function () {
  var e = this,
    t = videoShed3dShader,
    i = e.viewShadowMap._isPointLight ? e.viewShadowMap._pointBias : e.viewShadowMap._primitiveBias
  ;(this.postProcess = new Cesium.PostProcessStage({
    fragmentShader: t,
    uniforms: {
      mixNum: function () {
        return e.alpha
      },
      stcshadow: function () {
        return e.viewShadowMap._shadowMapTexture
      },
      videoTexture: function () {
        return e.videoTexture
      },
      _shadowMap_matrix: function () {
        return e.viewShadowMap._shadowMapMatrix
      },
      shadowMap_lightPositionEC: function () {
        return e.viewShadowMap._lightPositionEC
      },
      shadowMap_texelSizeDepthBiasAndNormalShadingSmooth: function () {
        var t = new Cesium.Cartesian2()
        return (
          (t.x = 1 / e.viewShadowMap._textureSize.x), (t.y = 1 / e.viewShadowMap._textureSize.y), Cesium.Cartesian4.fromElements(t.x, t.y, i.depthBias, i.normalShadingSmooth, this.combinedUniforms1)
        )
      },
      shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness: function () {
        return Cesium.Cartesian4.fromElements(i.normalOffsetScale, e.viewShadowMap._distance, e.viewShadowMap.maximumDistance, e.viewShadowMap._darkness, this.combinedUniforms2)
      }
    }
  })),
    this.viewer.scene.postProcessStages.add(this.postProcess)
}
// return CesiumVideo3d;
// })();
// import CesiumVideo3d from "./CesiumVideo3d";

// import { uuid } from "./util";
function uuid(len, radix) {
  var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('')
  var uuid = []
  var i
  radix = radix || chars.length
  if (len) {
    // Compact form
    for (i = 0; i < len; i++) uuid[i] = chars[0 | (Math.random() * radix)]
  } else {
    // rfc4122, version 4 form
    var r

    // rfc4122 requires these characters
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-'
    uuid[14] = '4'

    // Fill in random data.  At i==19 set the high bits of clock sequence as
    // per rfc4122, sec. 4.1.5
    for (i = 0; i < 36; i++) {
      if (!uuid[i]) {
        r = 0 | (Math.random() * 16)
        uuid[i] = chars[i === 19 ? (r & 0x3) | 0x8 : r]
      }
    }
  }
  return uuid.join('')
}
// import { uuid } from "./util";

// import mouseManager from "./mouseManager.js";
var x_PI = (3.14159265358979324 * 3000.0) / 180.0
var PI = 3.1415926535897932384626
var a = 6378245.0
var ee = 0.00669342162296594323

class mouseManager {
  constructor(viewer) {
    this._v = viewer
    /**
     * 相机
     */
    this.c = viewer.camera

    /**
     * 场景
     */
    this.s = viewer.scene

    /**
     * 当前球体
     */
    this.ellipsoid = this.s.globe.ellipsoid
  }

  /**
   * 获取当前相机的坐标
   */
  cameraPosition() {
    let sObj = {}
    let pos = this.c.position
    sObj.x = pos.x
    sObj.y = pos.y
    sObj.z = pos.z

    pos = this.c.positionCartographic
    sObj.longitude = (pos.longitude * 180) / Math.PI
    sObj.latitude = (pos.latitude * 180) / Math.PI
    sObj.height = pos.height

    sObj.heading = (this.c.heading * 180) / Math.PI
    sObj.pitch = (this.c.pitch * 180) / Math.PI
    sObj.roll = (this.c.roll * 180) / Math.PI
    return sObj
  }

  /**
   * 二维坐标，获取椭球体表面的经纬度坐标
   * @param {*} cartesian
   */
  pickEllipsoid(position) {
    let cartesian = this.c.pickEllipsoid(position, this.s.globe.ellipsoid)
    if (!cartesian) {
      return false
    }
    let cartographic = Cesium.Cartographic.fromCartesian(cartesian)
    let lng = Cesium.Math.toDegrees(cartographic.longitude) //经度值
    let lat = Cesium.Math.toDegrees(cartographic.latitude) //纬度值
    return { lng: lng, lat: lat, alt: cartographic.height } //cartographic.height的值始终为零。
  }
  /**
   * 三维坐标，获取地形表面的经纬度高程坐标：
   * @param {*} cartesian
   */
  pickRay(position) {
    let cartesian = this.screenToWorld(position)
    let cartographic = Cesium.Cartographic.fromCartesian(cartesian)
    let lng = Cesium.Math.toDegrees(cartographic.longitude) //经度值
    let lat = Cesium.Math.toDegrees(cartographic.latitude) //纬度值
    //height结果与cartographic.height相差无几，注意：cartographic.height可以为0，也就是说，可以根据经纬度计算出高程。
    let height = this.s.globe.getHeight(cartographic)
    return { lng: lng, lat: lat, alt: height } //height的值为地形高度。
  }
  /**
   * 三维坐标，获取模型表面的经纬度高程坐标（此方法借鉴于官方示例）：
   * @param {*} cartesian
   */
  pick(position) {
    if (this.s.mode !== Cesium.SceneMode.MORPHING) {
      var pickedObject = this.s.pick(position)
      if (this.s.pickPositionSupported && Cesium.defined(pickedObject) && pickedObject.node) {
        var cartesian = this.s.pickPosition(position)
        if (Cesium.defined(cartesian)) {
          var cartographic = Cesium.Cartographic.fromCartesian(cartesian)
          var lng = Cesium.Math.toDegrees(cartographic.longitude)
          var lat = Cesium.Math.toDegrees(cartographic.latitude)
          var height = cartographic.height //模型高度
          return { lng: lng, lat: lat, alt: height }
        }
      } else {
        let cartesian = this.s.pickPosition(position)
        return this.worldToLonlat(cartesian)
      }
    }
  }

  /**
   * 拾取对象
   */
  piObj(position) {
    return this.s.pick(position)
  }

  /**
   * 拾取屏幕坐标（空间坐标）
   */
  piScreen(position) {
    return this.c.pickEllipsoid(position, this.ellipsoid)
  }

  /**
   * 判断坐标
   * 判断地形和模型，0:地形或其他, 1:模型
   * 并返回相应坐标
   * @param {*} cartesian
   */
  piTerrainToModule(position, type = '0') {
    //点击的屏幕坐标
    try {
      if (position == undefined) {
        return false
      }
      let world = this.screenToWorld(position)
      if (world == undefined) {
        return false
      }
      let lon = undefined,
        lat = undefined,
        height = undefined
      let feature = this.piObj(position)
      if (feature == undefined) {
        let WGS84_p = Cesium.Ellipsoid.WGS84.cartesianToCartographic(world)
        if (WGS84_p == undefined) return false
        lon = Cesium.Math.toDegrees(WGS84_p.longitude)
        lat = Cesium.Math.toDegrees(WGS84_p.latitude)
        height = WGS84_p.height
      }
      if (feature != undefined) {
        if (feature instanceof Cesium.Cesium3DTileFeature || feature.id != undefined) {
          //3dtiles
          let cartesian = this.s.pickPosition(position)
          if (cartesian == undefined) return false
          if (Cesium.defined(cartesian)) {
            var cartographic = Cesium.Cartographic.fromCartesian(cartesian)
            if (cartographic.height < 0) return false
            lon = Cesium.Math.toDegrees(cartographic.longitude)
            lat = Cesium.Math.toDegrees(cartographic.latitude)
            height = cartographic.height //模型高度
          }
        }
      }
      //判断是否有值
      if (lon == undefined) return false
      let result = null
      if (type == '1') {
        result = { lon: lon, lat: lat, height: height }
      } else {
        result = Cesium.Cartesian3.fromDegrees(lon, lat, height)
      }
      return result
    } catch (error) {
      // Log.debug(error);
    }
  }

  /**
   * 屏幕高程坐标转经纬度坐标
   * @param {*} position
   */
  screenToLonlat(position) {
    let cartesian = this.screenToWorld(position) //屏幕坐标转世界坐标
    if (!cartesian) return
    let cartographic = Cesium.Cartographic.fromCartesian(cartesian)
    let lng = Cesium.Math.toDegrees(cartographic.longitude) //经度值
    let lat = Cesium.Math.toDegrees(cartographic.latitude) //纬度值
    let height = this.s.globe.getHeight(cartographic)
    return { lon: lng, lat: lat, height: height }
  }

  /**
   * 经纬度转换为世界坐标
   */
  lonlatToWorld(cartesian) {
    return Cesium.Cartesian3.fromDegrees(cartesian.longitude, cartesian.latitude, cartesian.height || 0, this.ellipsoid)
  }

  /**
   * 世界坐标转换为经纬度
   */
  worldToLonlat(cartesian) {
    if (!cartesian) return false
    let cartographic = this.ellipsoid.cartesianToCartographic(cartesian)
    let lat = Cesium.Math.toDegrees(cartographic.latitude)
    let lng = Cesium.Math.toDegrees(cartographic.longitude)
    let height = cartographic.height
    return { lat: lat, lon: lng, alt: height }
  }

  /**
   * 经度转弧度
   */
  latToRadian(degrees) {
    return Cesium.CesiumMath.toRadians(degrees)
  }

  /**
   * 弧度转经度
   */
  radianToLat(radians) {
    return Cesium.CesiumMath.toDegrees(radians)
  }

  /**
   * 屏幕坐标转世界坐标
   */
  screenToWorld(position) {
    return this.s.globe.pick(this.c.getPickRay(position), this.s)
  }

  /**
   * 地表坐标
   * @author hejin 2019-11-26
   * @param {[Cesium.Cartographic.fromDegrees(87.0, 28.0)]} cartographic  弧度值
   */
  worldToSurface = cartographic => {
    let me = this
    return new Promise((resolve, reject) => {
      if (this._v.terrainProvider instanceof Cesium.EllipsoidTerrainProvider) {
        resolve(0)
      } else {
        var promise = Cesium.sampleTerrainMostDetailed(this._v.terrainProvider, [cartographic])
        promise.then(updatedPositions => {
          // height = updatedPositions[0].height.toFixed(2);
          let elevation = updatedPositions[0].height
          resolve(elevation)
        })
      }
    })
  }

  /**
   * 世界坐标转屏幕坐标
   */
  worldToScreen(cartesian) {
    return Cesium.SceneTransforms.wgs84ToWindowCoordinates(this.s, cartesian)
  }

  /**
   * 世界坐标转地理坐标(经纬度)
   */
  worldToGeom(cartesian) {
    let cartographic = this.ellipsoid.cartesianToCartographic(cartesian)
    return {
      longitude: Cesium.Math.toDegrees(cartographic.longitude),
      latitude: Cesium.Math.toDegrees(cartographic.latitude),
      height: cartographic.height
    }
  }

  /***
   * 地理坐标(经纬度)转世界坐标
   */
  geomToWorld(position) {
    return Cesium.Cartesian3.fromDegrees(position.longitude, position.latitude, position.height)
  }

  /**************************
   *
   *       其他转换
   *
   * ***********************/

  /**
   * 百度坐标系 (BD-09) 与 火星坐标系 (GCJ-02)的转换
   * 即 百度 转 谷歌、高德
   * @param bd_lon
   * @param bd_lat
   * @returns {*[]}
   */
  bd09togcj02(bd_lon, bd_lat) {
    var x_pi = (3.14159265358979324 * 3000.0) / 180.0
    var x = bd_lon - 0.0065
    var y = bd_lat - 0.006
    var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi)
    var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi)
    var gg_lng = z * Math.cos(theta)
    var gg_lat = z * Math.sin(theta)
    return [gg_lng, gg_lat]
  }

  /**
   * 火星坐标系 (GCJ-02) 与百度坐标系 (BD-09) 的转换
   * 即谷歌、高德 转 百度
   * @param lng
   * @param lat
   * @returns {*[]}
   */
  gcj02tobd09(lng, lat) {
    var z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * x_PI)
    var theta = Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * x_PI)
    var bd_lng = z * Math.cos(theta) + 0.0065
    var bd_lat = z * Math.sin(theta) + 0.006
    return [bd_lng, bd_lat]
  }

  /**
   * WGS84转GCj02
   * @param lng
   * @param lat
   * @returns {*[]}
   */
  wgs84togcj02(lng, lat) {
    if (this.out_of_china(lng, lat)) {
      return [lng, lat]
    } else {
      var dlat = this.transformlat(lng - 105.0, lat - 35.0)
      var dlng = this.transformlng(lng - 105.0, lat - 35.0)
      var radlat = (lat / 180.0) * PI
      var magic = Math.sin(radlat)
      magic = 1 - ee * magic * magic
      var sqrtmagic = Math.sqrt(magic)
      dlat = (dlat * 180.0) / (((a * (1 - ee)) / (magic * sqrtmagic)) * PI)
      dlng = (dlng * 180.0) / ((a / sqrtmagic) * Math.cos(radlat) * PI)
      var mglat = lat + dlat
      var mglng = lng + dlng
      return [mglng, mglat]
    }
  }

  /**
   * GCJ02 转换为 WGS84
   * @param lng
   * @param lat
   * @returns {*[]}
   */
  gcj02towgs84(lng, lat) {
    if (this.out_of_china(lng, lat)) {
      return [lng, lat]
    } else {
      var dlat = this.transformlat(lng - 105.0, lat - 35.0)
      var dlng = this.transformlng(lng - 105.0, lat - 35.0)
      var radlat = (lat / 180.0) * PI
      var magic = Math.sin(radlat)
      magic = 1 - ee * magic * magic
      var sqrtmagic = Math.sqrt(magic)
      dlat = (dlat * 180.0) / (((a * (1 - ee)) / (magic * sqrtmagic)) * PI)
      dlng = (dlng * 180.0) / ((a / sqrtmagic) * Math.cos(radlat) * PI)
      let mglat = lat + dlat
      let mglng = lng + dlng
      return [lng * 2 - mglng, lat * 2 - mglat]
    }
  }

  transformlat(lng, lat) {
    var ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng))
    ret += ((20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0) / 3.0
    ret += ((20.0 * Math.sin(lat * PI) + 40.0 * Math.sin((lat / 3.0) * PI)) * 2.0) / 3.0
    ret += ((160.0 * Math.sin((lat / 12.0) * PI) + 320 * Math.sin((lat * PI) / 30.0)) * 2.0) / 3.0
    return ret
  }

  transformlng(lng, lat) {
    var ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng))
    ret += ((20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0) / 3.0
    ret += ((20.0 * Math.sin(lng * PI) + 40.0 * Math.sin((lng / 3.0) * PI)) * 2.0) / 3.0
    ret += ((150.0 * Math.sin((lng / 12.0) * PI) + 300.0 * Math.sin((lng / 30.0) * PI)) * 2.0) / 3.0
    return ret
  }

  /**
   * 判断是否在国内，不在国内则不做偏移
   * @param lng
   * @param lat
   * @returns {boolean}
   */
  out_of_china(lng, lat) {
    return lng < 72.004 || lng > 137.8347 || lat < 0.8293 || lat > 55.8271 || false
  }
}
// import mouseManager from "./mouseManager.js";

// import Entitys from "./entitys.js";
class Entitys {
  constructor(core) {
    /**
     * 初始化
     */
    this.entitysAction = core.entities
  }
  add(entity) {
    return this.entitysAction.add(entity)
  }
  remove(entity) {
    this.entitysAction.remove(entity)
  }
  removeAll() {
    this.entitysAction.removeAll()
  }
  createEntity() {
    return new Cesium.Entity()
  }
  //点
  getPoint() {
    return new Cesium.PointGraphics({
      color: Cesium.Color.GREEN,
      pixelSize: 5,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 1
    })
  }
  //线
  getLine(positions, color, clampToGround = true) {
    return new Cesium.PolylineGraphics({
      show: true,
      positions: positions,
      material: color,
      width: 1,
      clampToGround: clampToGround
    })
  }
  //标签
  getLabel(text, offset) {
    return new Cesium.LabelGraphics({
      //文字标签
      text: text,
      font: '14px sans-serif',
      fillColor: Cesium.Color.GOLD,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      outlineWidth: 2,
      showBackground: true,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: offset == undefined ? new Cesium.Cartesian2(0, 20) : offset,
      disableDepthTestDistance: 1000.0
      //heightReference:Cesium.HeightReference.RELATIVE_TO_GROUND
    })
  }
  //广告牌
  getBillboard(img, width, height) {
    return new Cesium.BillboardGraphics({
      image: img == undefined ? '../img/zb.png' : img,
      width: width == undefined ? 35 : width,
      height: height == undefined ? 35 : height,
      clampToGround: true,
      // eyeOffset :new Cesium.Cartesian2(-200, 0),
      pixelOffset: new Cesium.Cartesian2(0, -20)
      //heightReference:Cesium.HeightReference.RELATIVE_TO_GROUND
    })
  }
  //路径
  getPath() {
    return new Cesium.PathGraphics({
      resolution: 1,
      material: new Cesium.PolylineGlowMaterialProperty({
        glowPower: 0.1,
        color: Cesium.Color.YELLOW
      }),
      width: 5
    })
  }
  //模型
  getModel(e) {
    return new Cesium.ModelGraphics({
      uri: e.url,
      scale: 6,
      minimumPixelSize: 64
    })
  }
  //圆
  getEllipse(opt) {
    let r = opt.r == undefined ? 1000000.0 : opt.r
    new Cesium.EllipseGraphics({
      semiMajorAxis: opt.r,
      semiMinorAxis: opt.r,
      metarial: Cesium.Color.RED.withAlpha(0.5),
      outline: true
    })
  }
  //球
  getEllipsoid(opt) {
    let r = opt.r == undefined ? 1000000.0 : opt.r //默认100公里
    return new Cesium.EllipsoidGraphics({
      radii: new Cesium.Cartesian3(r, r, r), //单位 米
      //innerRadii : new Cesium.Cartesian3(100000.0, 80000.0, 60000.0),
      maximumCone: Cesium.Math.PI_OVER_TWO,
      stackPartitions: 56,
      slicePartitions: 56,
      outlineWidth: 2.0,
      outlineColor: Cesium.Color.YELLOW,
      material: Cesium.Color.RED.withAlpha(0.1),
      //heightReference:Cesium.HeightReference.NONE,
      outline: true
    })
  }
  //创建点信息
  createPoint(cartesian, label = false, point = false, billboard = false) {
    let entity = this.createEntity()
    entity.position = cartesian
    if (point) entity.point = this.getPoint()
    if (billboard) entity.billboard = this.getBillboard(billboard)
    if (label) entity.label = this.getLabel(label)
    let entityPoint = this.add(entity)
    return entityPoint
  }
  //创建线
  createLine(positions, oid = '', color = Cesium.Color.CHARTREUSE) {
    let entity = this.createEntity()
    entity.position = positions
    entity.polyline = this.getLine(positions, color, false)
    entity.oid = oid
    return this.add(entity)
  }

  //自定义雷达
  getCustomRadar(l, r) {
    return {
      position: l,
      orientation: Cesium.Transforms.headingPitchRollQuaternion(l, r),
      rectangularSensor: new Cesium.RectangularSensorGraphics({
        radius: 380000,
        xHalfAngle: Cesium.Math.toRadians(50),
        yHalfAngle: Cesium.Math.toRadians(50),
        material: new Cesium.Color(0, 1, 1, 0.4),
        lineColor: new Cesium.Color(0, 1, 1, 1),
        showScanPlane: true,
        scanPlaneColor: new Cesium.Color(0, 1, 1, 1),
        scanPlaneMode: 'vertical',
        scanPlaneRate: 3,
        showThroughEllipsoid: !1
      })
    }
  }
  /**
   * 提示信息实体
   * createMsgTip
   * showTip 控制器
   */
  createMsgTip() {
    let _tipId = 'msg-tip-tool'
    let _resultTip = this.entitysAction.getById(_tipId)
    if (!_resultTip) {
      _resultTip = this.entitysAction.add({
        id: _tipId,
        name: '鼠标提示信息实体',
        label: {
          fillColor: Cesium.Color.YELLOW,
          showBackground: true,
          font: '14px monospace',
          horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(15, 20),
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        }
      })
    }
    return _resultTip
  }
  /**
   * 提示框
   * @param {*} bShow
   * @param {*} position
   * @param {*} message
   */
  showTip(label, bShow, position, message, effectOptions) {
    label.show = bShow
    if (bShow) {
      if (position) label.position = position
      if (message) label.label.text = message
      if (effectOptions) {
        for (let key in effectOptions) {
          if (label.key) {
            label.key = effectOptions[key]
          }
        }
      }
    }
  }
  /**
   * 绘制各种类型的点
   * @param {*} viewer
   * @param {*} position
   * @param {*} size
   * @param {*} color
   * @param {*} id
   */
  drawPoint(position, size = 1, color = Cesium.Color.GREEN, _id = null) {
    if (position instanceof Array) {
      position = Cesium.Cartesian3.fromDegrees(position[0], position[1], position[2] ? position[2] : 0)
    }
    let options = {
      id: _id || uuid(11),
      position: position,
      point: {
        pixelSize: size,
        color: color
      }
    }
    return this.entitysAction.add(options)
  }
  /**
   * 绘制各种类型的线
   * @param {*} viewer
   * @param {*} positons
   * @param {*} color
   * @param {*} depthColor
   */
  drawLine(positons, color, depthColor) {
    return this.entitysAction.add({
      polyline: {
        positions: positons,
        width: 2,
        material: new Cesium.PolylineOutlineMaterialProperty({
          color: color || Cesium.Color.GREEN,
          outlineWidth: 1,
          outlineColor: color || Cesium.Color.GREEN
        }),
        depthFailMaterial: depthColor
          ? new Cesium.PolylineOutlineMaterialProperty({
              color: depthColor,
              outlineWidth: 0,
              outlineColor: depthColor
            })
          : undefined
      }
    })
  }
}
// import Entitys from "./entitys.js";

// import DrawDynamic from "./drawDynamic";
class DrawDynamic {
  constructor(core) {
    this.viewer = core
    this.removeObj = []
    /**
     * 实体
     * 创建绘制提示
     */
    this.entitys = new Entitys(core)
    this.mouseManager = new mouseManager(core)
    this._resultTip = this.entitys.createMsgTip()
    this.handleArr = []
  }
  /**
   * 删除
   */
  remove() {
    if (this.handleArr.length > 0) {
      this.handleArr.map(handle => {
        handle.destroy()
      })
      this.entitys.remove(this._resultTip)
      this._resultTip = null
      this.handleArr = []
    }
    if (this.removeObj.length != 0) {
      for (let i in this.removeObj) {
        this.viewer.entities.remove(this.removeObj[i])
      }
      this.removeObj = []
    }
  }
  /**
   * 清除事件
   */
  removeHandle() {
    if (this.handleArr.length > 0) {
      this.handleArr.map(handle => {
        handle.destroy()
      })
      this.entitys.remove(this._resultTip)
      this._resultTip = null
      this.handleArr = []
    }
  }

  pickHandler(tip = '左键创建, 右键结束') {
    var _this = this
    _this.removeHandle()
    var handler = new Cesium.ScreenSpaceEventHandler(_this.viewer.scene.canvas)
    if (!this._resultTip) this._resultTip = this.entitys.createMsgTip()
    this.handleArr.push(handler)

    return new Promise((resolve, reject) => {
      try {
        handler.setInputAction(function (_m) {
          _this.removeHandle()
          resolve(_m.position)
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

        handler.setInputAction(_m => {
          let cartesian = null
          var pickObj = _this.mouseManager.piObj(_m.endPosition)
          if (pickObj) {
            cartesian = _this.mouseManager.pick(_m.endPosition)
          } else {
            // cartesian = _this.mouseManager.screenToWorld(_m.endPosition)
            cartesian = _this.getCatesian3FromPX(_m.endPositio)
          }
          _this.entitys.showTip(_this._resultTip, true, cartesian, tip)
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

        handler.setInputAction(_m => {
          _this.removeHandle()
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
      } catch (error) {
        console.error('pick handler: ', error)
      }
    })
  }

  pickPoint(callback) {
    try {
      var _this = this
      _this.removeHandle()

      var handler = new Cesium.ScreenSpaceEventHandler(_this.viewer.scene.canvas)
      if (!this._resultTip) this._resultTip = this.entitys.createMsgTip()
      this.handleArr.push(handler)

      //单击鼠标左键画点
      handler.setInputAction(function (movement) {
        let cartesian = null
        var pickObj = _this.mouseManager.piObj(movement.position)
        if (pickObj) {
          // 拾取模型
          cartesian = _this.viewer.scene.pickPosition(movement.position)
        } else {
          // 拾取地面
          cartesian = _this.mouseManager.screenToWorld(movement.position)
          cartesian = _this.getCatesian3FromPX(movement.position)
        }
        if (Cesium.defined(cartesian)) {
          _this.removeHandle()
          callback(cartesian)
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

      //鼠标移动
      handler.setInputAction(function (movement) {
        let cartesian = null
        var pickObj = _this.mouseManager.piObj(movement.endPosition)
        if (pickObj) {
          // 拾取模型
          cartesian = _this.viewer.scene.pickPosition(movement.endPosition)
        } else {
          // 拾取地面
          // cartesian = _this.mouseManager.screenToWorld(movement.endPosition)
          cartesian = _this.getCatesian3FromPX(movement.endPosition)
        }
        _this.entitys.showTip(_this._resultTip, true, cartesian, '左键创建, 右键结束')
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

      //单击鼠标右键结束画点
      handler.setInputAction(function (movement) {
        _this.removeHandle()
        callback(false)
      }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
    } catch (error) {
      // Log.debug(error);
    }
  }

  //画点
  drawPoint(callback) {
    try {
      var _this = this
      _this.removeHandle()
      //坐标存储
      var positions = []

      var handler = new Cesium.ScreenSpaceEventHandler(_this.viewer.scene.canvas)
      if (!this._resultTip) this._resultTip = this.entitys.createMsgTip()
      this.handleArr.push(handler)
      //单击鼠标左键画点
      handler.setInputAction(function (movement) {
        let cartesian = null
        var pickObj = _this.mouseManager.piObj(movement.position)
        if (pickObj) {
          // 拾取模型
          cartesian = _this.viewer.scene.pickPosition(movement.position)
        } else {
          // 拾取地面
          // cartesian = _this.mouseManager.screenToWorld(movement.position)
          cartesian = _this.getCatesian3FromPX(movement.position)
        }
        if (Cesium.defined(cartesian)) {
          positions.push(cartesian)
          let entity = _this.viewer.entities.add({
            id: uuid(11),
            position: cartesian
          })
          let position = _this.mouseManager.worldToLonlat(cartesian)
          entity.label = _this.entitys.getLabel('经度:' + position.lon.toFixed(6) + '°\n  纬度' + position.lat.toFixed(6) + '°\n 高度:' + position.alt.toFixed(2) + ' m', new Cesium.Cartesian2(0, -15))
          entity.point = _this.entitys.getPoint()
          _this.removeObj.push(entity)
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
      //鼠标移动
      handler.setInputAction(function (movement) {
        let cartesian = null
        var pickObj = _this.mouseManager.piObj(movement.endPosition)
        if (pickObj) {
          // 拾取模型
          cartesian = _this.viewer.scene.pickPosition(movement.endPosition)
        } else {
          // 拾取地面
          // cartesian = _this.mouseManager.screenToWorld(movement.endPosition)
          cartesian = _this.getCatesian3FromPX(movement.endPosition)
        }
        // var cartesian = _this.mouseManager.screenToWorld(movement.endPosition);
        // var cartesian = null;
        // if( _this.viewer.terrainProvider instanceof Cesium.EllipsoidTerrainProvider ) {
        //     // 拾取地形平面，不带高度
        //     cartesian = _this.viewer.scene.camera.pickEllipsoid(movement.endPosition, _this.viewer.scene.globe.ellipsoid);
        // } else {
        //     // 拾取地面，带高度
        //     cartesian = _this.mouseManager.piTerrainToModule(movement.endPosition);
        // }
        _this.entitys.showTip(_this._resultTip, true, cartesian, '左键创建, 右键结束')
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
      //单击鼠标右键结束画点
      handler.setInputAction(function (movement) {
        _this.removeHandle()
        callback(positions, _this.removeObj)
      }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
    } catch (error) {
      // Log.debug(error);
    }
  }

  //画线
  drawLineString(callback, option) {
    var _this = this
    _this.removeHandle()
    let eid = uuid(11)
    var PolyLinePrimitive = (function () {
      function _(positions) {
        this.options = {
          id: eid,
          polyline: {
            show: true,
            positions: [],
            width: option.hasOwnProperty('width') ? option.width : 2,
            clampToGround: option.hasOwnProperty('clampToGround') ? option.clampToGround : false,
            material: option.hasOwnProperty('material') ? option.material : Cesium.Color.CHARTREUSE
          }
        }
        this.positions = positions
        this._init()
      }

      _.prototype._init = function () {
        var _self = this
        var _update = function () {
          return _self.positions
        }
        //实时更新polyline.positions
        this.options.polyline.positions = new Cesium.CallbackProperty(_update, false)
        _this.removeObj.push(_this.viewer.entities.add(this.options))
      }
      return _
    })()

    var handler = new Cesium.ScreenSpaceEventHandler(_this.viewer.scene.canvas)
    if (!this._resultTip) this._resultTip = this.entitys.createMsgTip()
    this.handleArr.push(handler)
    var positions = []
    var poly = undefined
    //鼠标左键单击画点
    handler.setInputAction(function (movement) {
      // var cartesian = _this.mouseManager.screenToWorld(movement.position);
      var cartesian = _this.getCatesian3FromPX(movement.position)
      if (positions.length == 0) {
        positions.push(cartesian.clone())
      }
      positions.push(cartesian)
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
    //鼠标移动
    handler.setInputAction(function (movement) {
      // var cartesian = _this.mouseManager.screenToWorld(movement.endPosition);
      var cartesian = _this.getCatesian3FromPX(movement.endPosition)
      if (positions.length >= 2) {
        if (!Cesium.defined(poly)) {
          poly = new PolyLinePrimitive(positions)
        } else {
          if (cartesian && cartesian != undefined) {
            positions.pop()
            // cartesian.y += (1 + Math.random());
            positions.push(cartesian)
          }
          _this.entitys.showTip(_this._resultTip, true, cartesian, '鼠标右键结束,平板长按结束')
        }
      } else {
        _this.entitys.showTip(_this._resultTip, true, cartesian, '点击绘制')
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
    //单击鼠标右键结束画线
    handler.setInputAction(function (movement) {
      _this.removeHandle()
      positions.pop()
      callback(positions, _this.removeObj)
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
  }

  //画面
  drawPolygon(callback, params = {}) {
    var _this = this
    var PolygonPrimitive = (function () {
      function _(positions) {
        this.options = {
          id: uuid(11),
          name: '多边形',
          polygon: {
            hierarchy: [],
            // perPositionHeight: true,
            fill: params.hasOwnProperty('fill') ? params.fill : true,
            outline: params.hasOwnProperty('outline') ? params.outline : true,
            outlineWidth: params.outlineWidth || 10.0,
            outlineColor: params.outlineColor || Cesium.Color.CHARTREUSE,
            material: params.material || Cesium.Color.fromCssColorString('#7FFF00').withAlpha(0.5),
            perPositionHeight: params.hasOwnProperty('clampToGround') ? !params.clampToGround : false
          }
        }
        this.hierarchy = positions
        this._init()
      }
      _.prototype._init = function () {
        var _self = this
        var _update = function () {
          return new Cesium.PolygonHierarchy(_self.hierarchy)
        }
        //实时更新polygon.hierarchy
        this.options.polygon.hierarchy = new Cesium.CallbackProperty(_update, false)
        _this.removeObj.push(_this.viewer.entities.add(this.options))
      }
      return _
    })()

    var handler = new Cesium.ScreenSpaceEventHandler(_this.viewer.scene.canvas)
    if (!this._resultTip) this._resultTip = this.entitys.createMsgTip()
    this.handleArr.push(handler)
    var positions = []
    var poly = undefined

    //鼠标单击画点
    handler.setInputAction(function (movement) {
      // var cartesian = _this.mouseManager.screenToWorld(movement.position);
      var cartesian = _this.getCatesian3FromPX(movement.position)
      if (positions.length == 0) {
        positions.push(cartesian.clone())
      }
      positions.push(cartesian)
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
    //鼠标移动
    handler.setInputAction(function (movement) {
      // var cartesian = _this.mouseManager.screenToWorld(movement.endPosition);
      var cartesian = _this.getCatesian3FromPX(movement.endPosition)
      if (positions.length >= 2) {
        if (!Cesium.defined(poly)) {
          poly = new PolygonPrimitive(positions)
        } else {
          if (cartesian != undefined) {
            positions.pop()
            // cartesian.y += (1 + Math.random());
            positions.push(cartesian)
          }
          _this.entitys.showTip(_this._resultTip, true, cartesian, '鼠标右键结束,平板长按结束')
        }
      } else {
        _this.entitys.showTip(_this._resultTip, true, cartesian, '点击绘制')
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
    //鼠标右键单击结束绘制
    handler.setInputAction(function (movement) {
      _this.removeHandle()
      callback(positions, _this.removeObj)
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
  }

  //画圆
  circleDraw(_callBack) {
    let _self = this
    //_self.viewer.scene.globe.depthTestAgainstTerrain = true;
    // if(!_self.circle.entity)_self.entitys.remove(_self.circle.entity);
    _self.circle = {
      points: [],
      rect: null,
      entity: null,
      r: 1
    }
    var tempPosition
    let cartographic1
    let p
    let tempLon
    let tempLat
    let tempAlt
    var handle = new Cesium.ScreenSpaceEventHandler(_self.viewer.scene.canvas)
    if (!this._resultTip) this._resultTip = this.entitys.createMsgTip()
    this.handleArr.push(handle)
    //common.handlerList.push(ShapeEventHandler);
    handle.setInputAction(function (click) {
      tempPosition = _self.getPointFromWindowPoint(click.position)
      //选择的点在球面上
      if (tempPosition) {
        function callBackPos() {
          if (_self.circle.points.length == 0) return
          const minlon = Cesium.Math.toDegrees(_self.circle.points[0].longitude)
          const minlat = Cesium.Math.toDegrees(_self.circle.points[0].latitude)
          const maxlon = Cesium.Math.toDegrees(_self.circle.points[1].longitude)
          const maxlat = Cesium.Math.toDegrees(_self.circle.points[1].latitude)
          const r = _self.getFlatternDistance([
            { lng: minlon, lat: minlat, alt: 0 },
            { lng: maxlon, lat: maxlat, alt: 0 }
          ])
          if (r) {
            return r
          }
          return 1
        }
        if (_self.circle.points.length == 0) {
          p = click.position
          cartographic1 = Cesium.Ellipsoid.WGS84.cartesianToCartographic(tempPosition)
          if (!tempPosition) return false
          _self.circle.points.push(_self.viewer.scene.globe.ellipsoid.cartesianToCartographic(tempPosition))
          _self.circle.points.push(_self.viewer.scene.globe.ellipsoid.cartesianToCartographic(tempPosition))
          tempLon = Cesium.Math.toDegrees(cartographic1.longitude)
          tempLat = Cesium.Math.toDegrees(cartographic1.latitude)
          tempAlt = cartographic1.height
          _self.circle.entity = _self.viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(tempLon, tempLat, tempAlt),
            point: _self.entitys.getPoint(),
            ellipse: {
              semiMinorAxis: new Cesium.CallbackProperty(callBackPos, false),
              semiMajorAxis: new Cesium.CallbackProperty(callBackPos, false),
              outline: true,
              outlineWidth: 10.0,
              material: Cesium.Color.fromCssColorString('#7FFF00').withAlpha(0.5),
              clampToGround: true
            }
          })
        } else {
          var tempCircle = new Cesium.CircleOutlineGeometry({
            center: Cesium.Cartesian3.fromDegrees(tempLon, tempLat, tempAlt),
            radius: callBackPos(),
            granularity: Math.PI / 2
          })
          var geometry = Cesium.CircleOutlineGeometry.createGeometry(tempCircle)
          var float64ArrayPositionsIn = geometry.attributes.position.values
          var positionsIn = [].slice.call(float64ArrayPositionsIn)
          _self.removeHandle()
          if (_self.circle.entity) _self.entitys.remove(_self.circle.entity)

          //画出半径
          // _self.removeObj.push(_self.entitys.createPoint(Cesium.Cartesian3.fromDegrees(tempLon, tempLat),'半径 :' +  parseFloat(callBackPos()).toFixed(2)));
          // _self.circle.entity.label = _self.entitys.getLabel('半径 :' +  parseFloat(callBackPos()).toFixed(2), new Cesium.Cartesian2(0, -15));

          let radius = callBackPos()
          let options = {
            id: uuid(11),
            name: '圆形',
            position: Cesium.Cartesian3.fromDegrees(tempLon, tempLat, tempAlt),
            point: _self.entitys.getPoint(),
            label: _self.entitys.getLabel('半径 :' + parseFloat(callBackPos()).toFixed(2) + '米', new Cesium.Cartesian2(0, -15)),
            ellipse: {
              semiMinorAxis: radius,
              semiMajorAxis: radius,
              outline: true,
              outlineWidth: 10.0,
              material: Cesium.Color.fromCssColorString('#7FFF00').withAlpha(0.5),
              clampToGround: true
            }
          }
          let entity = new Cesium.Entity(options)
          _self.removeObj.push(_self.viewer.entities.add(entity))
          _callBack(positionsIn, _self.removeObj, [tempLon, tempLat, tempAlt], callBackPos())
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
    handle.setInputAction(function (movement) {
      var moveEndPosition = _self.getPointFromWindowPoint(movement.endPosition)
      if (_self.circle.points.length == 0) {
        _self.entitys.showTip(_self._resultTip, true, moveEndPosition, '点击地图')
        return false
      }
      _self.entitys.showTip(_self._resultTip, true, moveEndPosition, '再次点击结束')
      //选择的点在球面上
      if (moveEndPosition) {
        _self.circle.points.pop()
        _self.circle.points.push(_self.viewer.scene.globe.ellipsoid.cartesianToCartographic(moveEndPosition))
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
  }

  //画矩形 1
  drawRect(callback) {
    let _self = this
    let pointsArr = []
    _self.shape = {
      points: [],
      rect: null,
      entity: null
    }
    var tempPosition
    var handle = new Cesium.ScreenSpaceEventHandler(_self.viewer.scene.canvas)
    if (!this._resultTip) if (!this._resultTip) this._resultTip = this.entitys.createMsgTip()
    this.handleArr.push(handle)
    //鼠标左键单击画点
    handle.setInputAction(function (click) {
      tempPosition = _self.getPointFromWindowPoint(click.position)
      //选择的点在球面上
      if (tempPosition) {
        if (_self.shape.points.length == 0) {
          pointsArr.push(tempPosition)
          let cartesian = _self.viewer.scene.globe.ellipsoid.cartesianToCartographic(tempPosition)
          _self.shape.points.push(cartesian)
          _self.shape.rect = Cesium.Rectangle.fromCartographicArray(_self.shape.points)
          _self.shape.rect.east += 0.000001
          _self.shape.rect.north += 0.000001
          _self.shape.entity = _self.viewer.entities.add({
            id: uuid(11),
            rectangle: {
              coordinates: _self.shape.rect,
              //fill:false,
              outline: false,
              outlineWidth: 10.0,
              outlineColor: Cesium.Color.CHARTREUSE,
              material: Cesium.Color.fromCssColorString('#7FFF00').withAlpha(0.5),
              // height:10
              clampToGround: true
            }
          })
          _self.bufferEntity = _self.shape.entity
          _self.removeObj.push(_self.shape.entity)
        } else {
          _self.removeHandle()
          callback(pointsArr, _self.removeObj)
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
    //鼠标移动
    handle.setInputAction(function (movement) {
      if (!movement.endPosition) return false
      let moveEndPosition = _self.getPointFromWindowPoint(movement.endPosition)
      if (_self.shape.points.length == 0) {
        _self.entitys.showTip(_self._resultTip, true, moveEndPosition, '点击绘制')
        return
      }
      //选择的点在球面上
      if (moveEndPosition) {
        pointsArr[1] = moveEndPosition
        let cartesian = _self.viewer.scene.globe.ellipsoid.cartesianToCartographic(moveEndPosition)
        _self.shape.points[1] = cartesian
        _self.shape.rect = Cesium.Rectangle.fromCartographicArray(_self.shape.points)
        if (_self.shape.rect.west == _self.shape.rect.east) _self.shape.rect.east += 0.000001
        if (_self.shape.rect.south == _self.shape.rect.north) _self.shape.rect.north += 0.000001
        _self.shape.entity.rectangle.coordinates = _self.shape.rect
        _self.entitys.showTip(_self._resultTip, true, moveEndPosition, '再次点击结束')
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
  }

  /**
   * 画矩形 2 （效率高）
   * @param {function} callback 绘制完成回调函数
   * @param {boolean} showFill  是否显示填充色
   * @param {boolean} showLine  是否显示边框线
   */
  drawRectangle(callback, showFill = true, showLine = true) {
    var _self = this
    var isMoving = false
    var positions = []
    var extrudedHeight = 0
    var scene = _self.viewer.scene
    var camera = _self.viewer.camera

    let _showRegion2Map = function () {
      let material = Cesium.Color.fromCssColorString('#ff0').withAlpha(0.5)
      let outlineMaterial = Cesium.Color.fromCssColorString('#00FF00').withAlpha(0.7)
      // let outlineMaterial = new Cesium.PolylineDashMaterialProperty({
      //     dashLength: 16,
      //     color: Cesium.Color.fromCssColorString('#00f').withAlpha(0.7)
      // });

      let dynamicPositions = new Cesium.CallbackProperty(function () {
        if (positions.length > 1 && isMoving) {
          let rect = Cesium.Rectangle.fromCartesianArray(positions)
          return rect
        } else {
          return null
        }
      }, false)

      let outlineDynamicPositions = new Cesium.CallbackProperty(function () {
        if (positions.length > 1 && isMoving) {
          let rect = Cesium.Rectangle.fromCartesianArray(positions)
          let arr = [rect.west, rect.north, rect.east, rect.north, rect.east, rect.south, rect.west, rect.south, rect.west, rect.north]
          let points = Cesium.Cartesian3.fromRadiansArray(arr)
          return points
        } else {
          return null
        }
      }, false)

      var bData = {
        id: uuid(11),
        rectangle: {
          coordinates: dynamicPositions,
          clampToGround: true,
          material: material,
          show: showFill
        },
        polyline: {
          positions: outlineDynamicPositions,
          clampToGround: true,
          width: 1,
          material: outlineMaterial,
          show: showLine
        }
      }

      if (extrudedHeight > 0) {
        bData.rectangle.extrudedHeight = extrudedHeight
        bData.rectangle.extrudedHeightReference = Cesium.HeightReference.RELATIVE_TO_GROUND
        bData.rectangle.closeTop = true
        bData.rectangle.closeBottom = true
        bData.rectangle.outline = false
        bData.rectangle.outlineWidth = 0
      }
      let _rect = _self.viewer.entities.add(bData)
      return _rect
    }
    var pickedAnchor = _showRegion2Map()
    _self.removeObj.push(pickedAnchor)
    var handle = new Cesium.ScreenSpaceEventHandler(scene.canvas)
    if (!_self._resultTip) _self._resultTip = _self.entitys.createMsgTip()
    _self.handleArr.push(handle)

    handle.setInputAction(function (event) {
      var position = event.position
      if (!Cesium.defined(position)) {
        return
      }
      var ray = camera.getPickRay(position)
      if (!Cesium.defined(ray)) {
        return
      }
      var cartesian = scene.globe.pick(ray, scene)
      if (!Cesium.defined(cartesian)) {
        return
      }
      if (isMoving) {
        // isMoving = false;
        positions[1] = cartesian
        _self.removeHandle()
        callback(positions, _self.removeObj)
      } else {
        if (!Cesium.defined(pickedAnchor)) {
          return
        }
        positions.push(cartesian)
        positions.push(cartesian)
        isMoving = true
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

    handle.setInputAction(function (event) {
      var position = event.endPosition
      if (!Cesium.defined(position)) {
        return
      }
      var ray = camera.getPickRay(position)
      if (!Cesium.defined(ray)) {
        return
      }
      var cartesian = scene.globe.pick(ray, scene)
      if (!Cesium.defined(cartesian)) {
        return
      }
      if (!isMoving) {
        _self.entitys.showTip(_self._resultTip, true, cartesian, '点击地图')
        return
      }

      positions[1] = cartesian
      _self.entitys.showTip(_self._resultTip, true, cartesian, '再次点击结束')
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
  }

  //清除所有Entity和ImageryLayers
  clearHandle() {
    //移除所有实体Entity
    this.viewer.entities.removeAll()
    //移除cesium加载的ImageryLayer
    for (var i = 0; i < this.removeImageryLayers.length; i++) {
      this.viewer.imageryLayers.remove(this.removeImageryLayers[i])
    }
  }

  getPointFromWindowPoint(point) {
    if (this.viewer.scene.terrainProvider.constructor.name == 'EllipsoidTerrainProvider') {
      return this.viewer.camera.pickEllipsoid(point, this.viewer.scene.globe.ellipsoid)
    } else {
      var ray = this.viewer.scene.camera.getPickRay(point)
      return this.viewer.scene.globe.pick(ray, this.viewer.scene)
    }
  }

  // 鼠标拾取三维坐标点
  getCatesian3FromPX(px) {
    var picks = this.viewer.scene.drillPick(px)
    this.viewer.render()
    var cartesian
    var isOn3dtiles = false
    for (var i = 0; i < picks.length; i++) {
      if (picks[i] instanceof Cesium.Cesium3DTileFeature) {
        //模型上拾取
        isOn3dtiles = true
      }
    }
    if (isOn3dtiles) {
      cartesian = this.viewer.scene.pickPosition(px)
    } else {
      var ray = this.viewer.camera.getPickRay(px)
      if (!ray) return null
      cartesian = this.viewer.scene.globe.pick(ray, this.viewer.scene)
    }
    return cartesian
  }

  // getCatesian3FromPX(px) {
  //     let { viewer, WGS84_to_Cartesian3, Cartesian3_to_WGS84 } = this;
  //     let picks = viewer.scene.drillPick(px);
  //     let cartesian = null;
  //     let isOn3dtiles = false,
  //         isOnTerrain = false;
  //     // drillPick
  //     for (let i in picks) {
  //         let pick = picks[i];
  //         if (
  //             (pick && pick.primitive instanceof Cesium.Cesium3DTileFeature) ||
  //             (pick && pick.primitive instanceof Cesium.Cesium3DTileset) ||
  //             (pick && pick.primitive instanceof Cesium.Model)
  //         ) {
  //             //模型上拾取
  //             isOn3dtiles = true;
  //         }
  //         // 3dtilset
  //         if (isOn3dtiles) {
  //             viewer.scene.pick(px);
  //             cartesian = viewer.scene.pickPosition(px);
  //             if (cartesian) {
  //                 let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
  //                 if (cartographic.height < 0) cartographic.height = 0;
  //                 let lon = Cesium.Math.toDegrees(cartographic.longitude),
  //                     lat = Cesium.Math.toDegrees(cartographic.latitude),
  //                     height = cartographic.height;
  //                 cartesian = WGS84_to_Cartesian3({
  //                     lng: lon,
  //                     lat: lat,
  //                     alt: height,
  //                 });
  //             }
  //         }
  //     }

  //     // 是否有地形，没有地形为 true
  //     let boolTerrain = viewer.terrainProvider instanceof Cesium.EllipsoidTerrainProvider;
  //     // 有地形处理
  //     if (!isOn3dtiles && !boolTerrain) {
  //         let ray = viewer.scene.camera.getPickRay(px);
  //         if (!ray) return null;
  //         cartesian = viewer.scene.globe.pick(ray, viewer.scene);
  //         isOnTerrain = true;
  //     }
  //     // 无地形处理
  //     if (!isOn3dtiles && !isOnTerrain && boolTerrain) {
  //         cartesian = viewer.scene.camera.pickEllipsoid(
  //             px,
  //             viewer.scene.globe.ellipsoid
  //         );
  //     }
  //     if (cartesian) {
  //         let position = Cartesian3_to_WGS84(cartesian);
  //         if (position.alt < 0) {
  //             cartesian = WGS84_to_Cartesian3(position);
  //         }
  //         return cartesian;
  //     }
  //     return false;
  // }

  //笛卡尔坐标系转WGS84坐标系
  /**
   *
   * @param {Cesium.Cartesian3} cartesian3
   * @returns
   */
  Cartesian3_to_WGS84(cartesian3) {
    // var cartesian3 = new Cesium.Cartesian3(point.x, point.y, point.z);
    var cartographic = Cesium.Cartographic.fromCartesian(cartesian3)
    var latitude = Cesium.Math.toDegrees(cartographic.latitude)
    var longitude = Cesium.Math.toDegrees(cartographic.longitude)
    var height = cartographic.height
    return { longitude, latitude, height }
  }

  //WGS84坐标系转笛卡尔坐标系
  WGS84_to_Cartesian3(point) {
    return Cesium.Cartesian3.fromDegrees(point.longitude, point.latitude, point.height)
  }

  // 空间多点距离计算函数(经纬度)
  getFlatternDistance(positions) {
    var distance = 0
    for (var i = 0; i < positions.length - 1; i++) {
      var point1cartographic = Cesium.Cartographic.fromDegrees(positions[i].lng, positions[i].lat, positions[i].alt)
      var point2cartographic = Cesium.Cartographic.fromDegrees(positions[i + 1].lng, positions[i + 1].lat, positions[i + 1].alt)

      // var point1cartographic = Cesium.Cartographic.fromCartesian(positions[i]);
      // var point2cartographic = Cesium.Cartographic.fromCartesian(positions[i+1]);
      /**根据经纬度计算出距离**/
      var geodesic = new Cesium.EllipsoidGeodesic()
      geodesic.setEndPoints(point1cartographic, point2cartographic)
      var s = geodesic.surfaceDistance
      //console.log(Math.sqrt(Math.pow(distance, 2) + Math.pow(endheight, 2)));
      //返回两点之间的距离
      s = Math.sqrt(Math.pow(s, 2) + Math.pow(point2cartographic.height - point1cartographic.height, 2))
      distance = distance + s
    }
    return distance
  }

  // 空间多点距离计算函数
  getSpaceDistance(positions) {
    var distance = 0
    for (var i = 0; i < positions.length - 1; i++) {
      var point1cartographic = Cesium.Cartographic.fromCartesian(positions[i])
      var point2cartographic = Cesium.Cartographic.fromCartesian(positions[i + 1])
      /**根据经纬度计算出距离**/
      var geodesic = new Cesium.EllipsoidGeodesic()
      geodesic.setEndPoints(point1cartographic, point2cartographic)
      var s = geodesic.surfaceDistance
      //console.log(Math.sqrt(Math.pow(distance, 2) + Math.pow(endheight, 2)));
      //返回两点之间的距离
      s = Math.sqrt(Math.pow(s, 2) + Math.pow(point2cartographic.height - point1cartographic.height, 2))
      distance = distance + s
    }
    return distance
  }

  // 绘制视网
  drawSketch(callback) {
    var _this = this
    _this.removeHandle()
    let eid = uuid(11)

    let viewPosition = null
    let viewPositionEnd = null
    let horizontalViewAngle = 90.0
    let verticalViewAngle = 60.0

    var PolyLinePrimitive = (function () {
      function _(positions) {
        this.options = {
          id: eid,
          polyline: {
            show: true,
            positions: [],
            material: Cesium.Color.CHARTREUSE,
            width: 1
          }
        }
        this.positions = positions
        this._init()
      }

      _.prototype._init = function () {
        var _self = this
        var _update = function () {
          return _self.positions
        }
        //实时更新polyline.positions
        this.options.polyline.positions = new Cesium.CallbackProperty(_update, false)
        _this.removeObj.push(_this.viewer.entities.add(this.options))
      }
      return _
    })()

    function getHeading(fromPosition, toPosition) {
      let finalPosition = new Cesium.Cartesian3()
      let matrix4 = Cesium.Transforms.eastNorthUpToFixedFrame(fromPosition)
      Cesium.Matrix4.inverse(matrix4, matrix4)
      Cesium.Matrix4.multiplyByPoint(matrix4, toPosition, finalPosition)
      Cesium.Cartesian3.normalize(finalPosition, finalPosition)
      return Cesium.Math.toDegrees(Math.atan2(finalPosition.x, finalPosition.y))
    }

    function getPitch(fromPosition, toPosition) {
      let finalPosition = new Cesium.Cartesian3()
      let matrix4 = Cesium.Transforms.eastNorthUpToFixedFrame(fromPosition)
      Cesium.Matrix4.inverse(matrix4, matrix4)
      Cesium.Matrix4.multiplyByPoint(matrix4, toPosition, finalPosition)
      Cesium.Cartesian3.normalize(finalPosition, finalPosition)
      return Cesium.Math.toDegrees(Math.asin(finalPosition.z))
    }

    function getOrientation() {
      let viewHeading = viewPositionEnd ? getHeading(viewPosition, viewPositionEnd) : 0.0
      let viewPitch = viewPositionEnd ? getPitch(viewPosition, viewPositionEnd) : 0.0
      return new Cesium.Transforms.headingPitchRollQuaternion(viewPosition, Cesium.HeadingPitchRoll.fromDegrees(viewHeading - horizontalViewAngle, viewPitch, 0.0))
    }

    function getRadii() {
      let viewDistance = viewPositionEnd ? Cesium.Cartesian3.distance(viewPosition, viewPositionEnd) : 100.0
      return new Cesium.Cartesian3(viewDistance, viewDistance, viewDistance)
    }

    var handler = new Cesium.ScreenSpaceEventHandler(_this.viewer.scene.canvas)
    if (!this._resultTip) this._resultTip = this.entitys.createMsgTip()
    this.handleArr.push(handler)
    var positions = []
    var poly = undefined
    //鼠标左键单击画点
    handler.setInputAction(function (movement) {
      // var cartesian = _this.mouseManager.screenToWorld(movement.position);
      // var cartesian = _this.viewer.scene.pickPosition(movement.position);
      var cartesian = _this.getCatesian3FromPX(movement.position)

      if (Cesium.defined(cartesian)) {
        let entity = _this.viewer.entities.add({
          id: uuid(11),
          position: cartesian
        })
        entity.label = _this.entitys.getLabel(positions.length > 1 ? '方向' : '视点', new Cesium.Cartesian2(0, -10))
        entity.point = positions.length > 1 ? undefined : _this.entitys.getPoint()
        _this.removeObj.push(entity)
      }
      if (positions.length == 0) {
        positions.push(cartesian.clone())
        viewPosition = positions[0]
        // 创建视网
        let sketch = _this.viewer.entities.add({
          name: 'sketch',
          position: viewPosition,
          orientation: new Cesium.CallbackProperty(getOrientation, false),
          ellipsoid: {
            radii: new Cesium.CallbackProperty(getRadii, false),
            // innerRadii: new Cesium.Cartesian3(2.0, 2.0, 2.0),
            minimumClock: Cesium.Math.toRadians(-horizontalViewAngle / 2),
            maximumClock: Cesium.Math.toRadians(horizontalViewAngle / 2),
            minimumCone: Cesium.Math.toRadians(verticalViewAngle + 7.75),
            maximumCone: Cesium.Math.toRadians(180 - verticalViewAngle - 7.75),
            fill: false,
            outline: true,
            subdivisions: 256,
            stackPartitions: 32,
            slicePartitions: 32,
            outlineColor: Cesium.Color.YELLOWGREEN
          }
        })
        _this.removeObj.push(sketch)
      }
      positions.push(cartesian)
      if (positions.length > 2) {
        _this.removeHandle()
        positions.pop()
        viewPositionEnd = positions[1]
        callback(positions, _this.removeObj)
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
    //鼠标移动
    handler.setInputAction(function (movement) {
      var cartesian = _this.viewer.scene.pickPosition(movement.endPosition)
      if (positions.length >= 2) {
        if (!Cesium.defined(poly)) {
          poly = new PolyLinePrimitive(positions)
        } else {
          if (cartesian && cartesian != undefined) {
            positions.pop()
            // cartesian.y += (1 + Math.random());
            positions.push(cartesian)
            viewPositionEnd = cartesian
          }
          _this.entitys.showTip(_this._resultTip, true, cartesian, '点击绘制目标点')
        }
      } else {
        _this.entitys.showTip(_this._resultTip, true, cartesian, '点击绘制起点')
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
    //单击鼠标右键结束画线
    handler.setInputAction(function (movement) {
      _this.remove()
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
  }

  //绘制视锥
  drawFrustum(callback) {
    var _this = this
    _this.removeHandle()
    let eid = uuid(11)
    let viewPosition = null
    let viewPositionEnd = null
    let horizontalViewAngle = 90.0
    let verticalViewAngle = 60.0

    var PolyLinePrimitive = (function () {
      function _(positions) {
        this.options = {
          id: eid,
          polyline: {
            show: true,
            positions: [],
            material: Cesium.Color.CHARTREUSE,
            width: 1
          }
        }
        this.positions = positions
        this._init()
      }

      _.prototype._init = function () {
        var _self = this
        var _update = function () {
          return _self.positions
        }
        //实时更新polyline.positions
        this.options.polyline.positions = new Cesium.CallbackProperty(_update, false)
        _this.removeObj.push(_this.viewer.entities.add(this.options))
      }
      return _
    })()

    function getHeading(fromPosition, toPosition) {
      let finalPosition = new Cesium.Cartesian3()
      let matrix4 = Cesium.Transforms.eastNorthUpToFixedFrame(fromPosition)
      Cesium.Matrix4.inverse(matrix4, matrix4)
      Cesium.Matrix4.multiplyByPoint(matrix4, toPosition, finalPosition)
      Cesium.Cartesian3.normalize(finalPosition, finalPosition)
      return Cesium.Math.toDegrees(Math.atan2(finalPosition.x, finalPosition.y))
    }

    function getPitch(fromPosition, toPosition) {
      let finalPosition = new Cesium.Cartesian3()
      let matrix4 = Cesium.Transforms.eastNorthUpToFixedFrame(fromPosition)
      Cesium.Matrix4.inverse(matrix4, matrix4)
      Cesium.Matrix4.multiplyByPoint(matrix4, toPosition, finalPosition)
      Cesium.Cartesian3.normalize(finalPosition, finalPosition)
      return Cesium.Math.toDegrees(Math.asin(finalPosition.z))
    }

    function getFrustum() {
      let heading = viewPositionEnd ? getHeading(viewPosition, viewPositionEnd) : 0.0
      let pitch = viewPositionEnd ? getPitch(viewPosition, viewPositionEnd) : 0.0
      let distance = _this.getSpaceDistance([viewPosition, viewPositionEnd])
      let wgs84_point = _this.Cartesian3_to_WGS84(viewPosition)
      let position = {
        longitude: wgs84_point.longitude,
        latitude: wgs84_point.latitude,
        height: wgs84_point.height
      }
      return {
        position,
        heading,
        pitch,
        distance: Number(distance.toFixed(2))
      }
    }

    var handler = new Cesium.ScreenSpaceEventHandler(_this.viewer.scene.canvas)
    if (!this._resultTip) this._resultTip = this.entitys.createMsgTip()
    this.handleArr.push(handler)
    var positions = []
    var poly = undefined
    //鼠标左键单击画点
    handler.setInputAction(function (movement) {
      var cartesian = _this.viewer.scene.pickPosition(movement.position)

      if (Cesium.defined(cartesian)) {
        let entity = _this.viewer.entities.add({
          id: uuid(11),
          position: cartesian
        })
        entity.label = _this.entitys.getLabel(positions.length > 1 ? '方向' : '视点', new Cesium.Cartesian2(0, -10))
        entity.point = positions.length > 1 ? undefined : _this.entitys.getPoint()
        _this.removeObj.push(entity)

        if (positions.length == 0) {
          positions.push(cartesian.clone())
          viewPosition = positions[0]
        }
        positions.push(cartesian)
        if (positions.length > 2) {
          _this.removeHandle()
          positions.pop()
          viewPositionEnd = positions[1]
          let frustum = getFrustum()
          callback(positions, _this.removeObj, frustum)
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
    //鼠标移动
    handler.setInputAction(function (movement) {
      var cartesian = _this.viewer.scene.pickPosition(movement.endPosition)
      if (positions.length >= 2) {
        if (!Cesium.defined(poly)) {
          poly = new PolyLinePrimitive(positions)
        } else {
          if (cartesian && cartesian != undefined) {
            positions.pop()
            // cartesian.y += (1 + Math.random());
            positions.push(cartesian)
            viewPositionEnd = cartesian
          }
          _this.entitys.showTip(_this._resultTip, true, cartesian, '点击绘制目标点')
        }
      } else {
        _this.entitys.showTip(_this._resultTip, true, cartesian, '点击绘制起点')
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
    //单击鼠标右键结束画线
    handler.setInputAction(function (movement) {
      _this.remove()
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
  }
}
// import DrawDynamic from "./drawDynamic";

// import DrawManager from "./drawManager";
class DrawManager {
  constructor(core) {
    this.drawDynamic = new DrawDynamic(core)
  }
  remove() {
    if (this.drawDynamic == null) return false
    this.drawDynamic.remove()
    // this.drawDynamic = null;
  }
  /**
   * 拾取点
   */
  pickPoint(fn) {
    let _self = this
    _self.drawDynamic.pickPoint(position => {
      if (!position) {
        typeof fn == 'function' && fn(false)
        return
      }
      var wgs84_point = _self.drawDynamic.Cartesian3_to_WGS84({
        x: position.x,
        y: position.y,
        z: position.z
      })
      if (typeof fn == 'function') fn(wgs84_point)
    })
  }
  //点
  drawPoint(fn, optins = {}) {
    let _self = this
    _self.drawDynamic.drawPoint(function (positions, entities) {
      var wgs84_positions = []
      for (var i = 0; i < positions.length; i++) {
        var wgs84_point = _self.drawDynamic.Cartesian3_to_WGS84({
          x: positions[i].x,
          y: positions[i].y,
          z: positions[i].z
        })
        wgs84_positions.push(wgs84_point)
      }
      if (typeof fn == 'function') fn(wgs84_positions, entities)
    })
  }
  //线
  drawLine(
    fn,
    option = {
      clampToGround: true,
      material: Cesium.Color.CHARTREUSE,
      width: 2
    }
  ) {
    let _self = this
    this.drawDynamic.drawLineString(function (positions, entities) {
      var wgs84_positions = []
      for (var i = 0; i < positions.length; i++) {
        var wgs84_point = _self.drawDynamic.Cartesian3_to_WGS84({
          x: positions[i].x,
          y: positions[i].y,
          z: positions[i].z
        })
        wgs84_positions.push(wgs84_point)
      }
      if (typeof fn == 'function') fn(wgs84_positions, entities)
    }, option)
  }
  //圆
  drawCircle(fn) {
    this.drawDynamic.circleDraw(function (positions, entities, center, radius) {
      if (typeof fn == 'function') fn(positions, entities, center, radius)
    })
  }
  //矩形
  drawRect(fn, showFill = true, showLine = true) {
    let _self = this
    _self.drawDynamic.drawRectangle(
      function (positions, entities) {
        var wgs84_positions = []
        for (var i = 0; i < positions.length; i++) {
          var wgs84_point = _self.drawDynamic.Cartesian3_to_WGS84({
            x: positions[i].x,
            y: positions[i].y,
            z: positions[i].z
          })
          wgs84_positions.push(wgs84_point)
        }
        if (typeof fn == 'function') fn(wgs84_positions, entities)
      },
      showFill,
      showLine
    )
  }
  //多边形
  drawPolygon(fn, optins = {}) {
    let _self = this
    _self.drawDynamic.drawPolygon(function (positions, entities) {
      var wgs84_positions = []
      for (var i = 0; i < positions.length; i++) {
        var wgs84_point = _self.drawDynamic.Cartesian3_to_WGS84({
          x: positions[i].x,
          y: positions[i].y,
          z: positions[i].z
        })
        wgs84_positions.push(wgs84_point)
      }
      if (typeof fn == 'function') fn(wgs84_positions, entities)
    }, optins)
  }
  // 绘制视网
  drawSketch(fn) {
    let _self = this
    _self.drawDynamic.drawSketch(function (positions, entities) {
      var wgs84_positions = []
      for (var i = 0; i < positions.length; i++) {
        var wgs84_point = _self.drawDynamic.Cartesian3_to_WGS84({
          x: positions[i].x,
          y: positions[i].y,
          z: positions[i].z
        })
        wgs84_positions.push(wgs84_point)
      }
      if (typeof fn == 'function') fn(wgs84_positions, entities)
    })
  }
  // 绘制视锥
  drawFrustum(fn) {
    let _self = this
    _self.drawDynamic.drawFrustum(function (positions, entities, frustum) {
      var wgs84_positions = []
      for (var i = 0; i < positions.length; i++) {
        var wgs84_point = _self.drawDynamic.Cartesian3_to_WGS84({
          x: positions[i].x,
          y: positions[i].y,
          z: positions[i].z
        })
        wgs84_positions.push(wgs84_point)
      }
      if (typeof fn == 'function') fn(wgs84_positions, entities, frustum)
    })
  }
}
// import DrawManager from "./drawManager";

// VideoShed.js
class VideoShed {
  constructor(viewer) {
    this._v = viewer
    this._dm = new DrawManager(viewer)
    this._videoShed = null
  }

  initOptions(options) {
    this._videoId = Cesium.defaultValue(options.videoId, 'visualDomId')
    this._url = Cesium.defaultValue(options.url, '')
    this._live = Cesium.defaultValue(options.live, false)
    this._debugFrustum = Cesium.defaultValue(options.debugFrustum, true)
    this._fov = Cesium.defaultValue(options.fov, 60)
    this._alpha = Cesium.defaultValue(options.alpha, 1)
    this._near = Cesium.defaultValue(options.near, 0)
    this._color = Cesium.defaultValue(options.color, Cesium.Color.RED)
    // 相机位置
    const { longitude, latitude, height } = Cesium.defaultValue(options.position, { longitude: 0, latitude: 0, height: 0 })
    this._position = { x: longitude, y: latitude, z: height }
    // 相机旋转角度
    const { pitch, heading } = Cesium.defaultValue(options.rotation, {
      pitch: 0,
      heading: 0
    })
    this._rotation = { x: pitch, y: heading }
    this._far = Cesium.defaultValue(options.far, 100)
  }

  /**
   * 添加css3 html元素
   * @param elements
   * @param isBackHide
   * @constructor
   */
  draw(options) {
    let me = this
    if (!options.url) {
      return
    }
    me.initOptions(options)
    return new Promise((resole, reject) => {
      me._dm.drawFrustum((positions, entities, frustum) => {
        me._videoShed && me._videoShed.destroy()
        let { position, heading, pitch, distance } = frustum
        // 相机位置
        const { longitude, latitude, height } = position
        me._position = { x: longitude, y: latitude, z: height }
        me._rotation = { x: pitch, y: heading }
        me._far = distance

        me._videoShed = new CesiumVideo3d(me._v, me.options)
        me._dm.remove()
        resole(frustum)
      })
    })
  }

  /**
   * 配置参数显示视频融合效果
   * @param {*} options
   */
  instance(options = {}) {
    let me = this
    me._videoShed && me._videoShed.destroy()
    this.initOptions(options)
    me._videoShed = new CesiumVideo3d(me._v, me.options)
  }

  createVideoEle(url, vid) {
    // this._videoShed._createVideoEle(url, vid);
    this.videoId = vid
    let videos = document.getElementById('videos')
    if (!videos) {
      let root = document.getElementById('app')
      videos = document.createElement('div')
      videos.setAttribute('id', 'videos')
      videos.className = 'videos'
      root.appendChild(videos)
    }

    var v = document.createElement('video')
    v.setAttribute('id', vid)
    v.setAttribute('height', '200px')
    v.setAttribute('src', url)
    v.setAttribute('controls', !0)
    v.setAttribute('autoplay', !0)
    v.setAttribute('playsInline', !0)
    v.setAttribute('webkit-playsinline', !0)
    videos.appendChild(v)
  }

  flyTo() {
    let me = this
    this._v.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(me._position.x, me._position.y, me._position.z),
      orientation: {
        heading: Cesium.Math.toRadians(me._rotation.y), // east, default value is 0.0 (north)
        pitch: Cesium.Math.toRadians(me._rotation.x), // default value (looking down)
        roll: Cesium.Math.toRadians(0) // default value
      }
    })
  }

  destroy() {
    let me = this
    me._videoShed && me._videoShed.destroy()
    me._videoShed = null
  }

  /**
   * @param {any} bool
   */
  set show(bool) {
    bool ? this.draw(this.options) : this.destroy()
  }

  get videoShed() {
    return this._videoShed
  }

  get options() {
    return {
      url: this._url,
      videoId: this._videoId,
      live: this._live,
      position: this._position,
      rotation: this._rotation,
      far: this._far,
      debugFrustum: this._debugFrustum,
      alpha: this._alpha,
      near: this._near,
      fov: this._fov,
      color: this._color
    }
  }

  /**
   * 投射深度
   * @param {Number} value
   */
  set alpha(value) {
    this._alpha = value
    this.videoShed._changeAlpha(value)
  }

  /**
   * 投射深度
   * @param {Number} value
   */
  set far(value) {
    this._far = value
    this.videoShed._changeFar(value)
  }

  /**
   * 宽高比
   * @param {Number} value
   */
  set aspectRatio(value) {
    this.videoShed.aspectRatio = value
  }
  get aspectRatio() {
    return this._videoShed.aspectRatio
  }

  /**
   * 纵向角度，横向角度
   * @param {x: pitch,  y: heading} rotation
   */
  set changeRotation(rotation) {
    this._rotation = rotation
    this.videoShed._changeRotation(rotation)
  }

  /**
   * 视野角度
   * @param {Number} value
   */
  set fov(value) {
    this._fov = value
    this.videoShed.fov = value
  }

  /**
   * @param {Cartesian3} cartesian3
   */
  set position(cartesian3) {
    this._position = cartesian3
    this.videoShed._changeCameraPosition(cartesian3)
  }

  /**
   * @param {boolean} bool
   */
  set debugFrustum(bool) {
    this._debugFrustum = bool
    this.videoShed.debugFrustum = bool
  }
}
// VideoShed.js

export default VideoShed
