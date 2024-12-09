import * as Cesium from 'cesium'
var BaseEvent: any = function (this: any) {
  this.handles = {}
  this.cached = []
}
BaseEvent.prototype.on = function (eventName: any, callback: any) {

  if (typeof callback !== "function") return;

  if (!this.handles[eventName]) {
    this.handles[eventName] = [];
  }
  this.handles[eventName].push(callback);

  if (this.cached[eventName] instanceof Array) {
    //说明有缓存的 可以执行
    callback.apply(null, this.cached[eventName]);
  }
}

BaseEvent.prototype.emit = function () {
  if (this.handles[arguments[0]] instanceof Array) {
    for (let i = 0; i < this.handles[arguments[0]].length; i++) {
      this.handles[arguments[0]][i](arguments[1]);
    }
  }
  //默认缓存
  this.cached[arguments[0]] = Array.prototype.slice.call(arguments, 1);
}

var CesiumPopup = (function () {

  var _panelContainer: any = null
  var _contentContainer: any = null
  var _closeBtn: any = null

  var _renderListener: any = null
  var _viewer: any = null

  var CesiumPopup = function (this: any, options: any) {
    //继承
    BaseEvent.call(this)

    this.className = options.className || ''
    this.title = options.title || ''
    this.offset = options.offset || [0, 0]

    // this.render = this.render.bind(this)
    this.closeHander = this.closeHander.bind(this)

  }

  CesiumPopup.prototype = new BaseEvent()
  CesiumPopup.prototype.constrctor = CesiumPopup


  CesiumPopup.prototype.addTo = function (viewer: any) {
    if (_viewer) this.remove()
    _viewer = viewer
    this.initPanle();
    //关闭按钮
    _closeBtn.addEventListener('click', this.closeHander, false)
    if (this.position) {
      _panelContainer.style.display = 'block'
      _renderListener = _viewer.scene.postRender.addEventListener(this.render, this)
    }

    return this

  }

  CesiumPopup.prototype.initPanle = function () {

    var closeBtnIcon = '×'

    _panelContainer = document.createElement('div')
    _panelContainer.classList.add('cesium-popup-panel')
    if (this.className && this.className !== '') {
      _panelContainer.classList.add(this.className)
    }

    _closeBtn = document.createElement('div')
    _closeBtn.classList.add('cesium-popup-close-btn')

    _closeBtn.innerHTML = closeBtnIcon

    // header container
    var headerContainer = document.createElement('div')
    headerContainer.classList.add('cesium-popup-header-panel')

    this.headerTitle = document.createElement('div')
    this.headerTitle.classList.add('cesium-poput-header-title')
    this.headerTitle.innerHTML = this.title

    headerContainer.appendChild(this.headerTitle)
    _panelContainer.appendChild(_closeBtn)

    _panelContainer.appendChild(headerContainer)

    // content container

    _contentContainer = document.createElement('div')
    _contentContainer.classList.add('cesium-popup-content-panel')
    _contentContainer.innerHTML = this.content

    _panelContainer.appendChild(_contentContainer)

    //tip container
    var tipContaienr = document.createElement('div')
    tipContaienr.classList.add('cesium-popup-tip-panel')

    var tipDiv = document.createElement('div')
    tipDiv.classList.add('cesium-popup-tip-bottom')

    tipContaienr.appendChild(tipDiv)

    _panelContainer.appendChild(tipContaienr)

    _panelContainer.style.display = 'none'
    // add to Viewer Container
    _viewer.cesiumWidget.container.appendChild(_panelContainer)
    this.emit('open')

  }

  CesiumPopup.prototype.setHTML = function (html: any) {
    if (_contentContainer) {
      _contentContainer.innerHTML = html
    }
    this.content = html
    return this;

  }

  CesiumPopup.prototype.render = function () {
    var geometry = this.position
    if (!geometry) return
    var position = Cesium.SceneTransforms.wgs84ToWindowCoordinates(_viewer.scene, geometry)
    if (!position) {
      return
    }
    if (_panelContainer) {
      _panelContainer.style.left = position.x - _panelContainer.offsetWidth / 2 + this.offset[0] + 'px';
      _panelContainer.style.top = position.y - _panelContainer.offsetHeight - 10 + this.offset[1] + 'px';
    }

  }

  CesiumPopup.prototype.setPosition = function (cartesian3: any) {
    this.position = cartesian3
    return this;

  }

  CesiumPopup.prototype.addClassName = function (className: any) {
    if (_panelContainer) {
      _panelContainer.classList.add(className)
    }
    return this;

  }

  CesiumPopup.prototype.removeClass = function (className: any) {
    if (_panelContainer) {
      _panelContainer.classList.remove(className)
    }
    return this;

  }


  CesiumPopup.prototype.setTitle = function (title: any) {
    this.headerTitle.innerHTML = title

    return this;
  }
  CesiumPopup.prototype.setOffset = function (offset: any) {
    this.offset = offset
    return this;
  }

  CesiumPopup.prototype.closeHander = function () {
    this.remove()
  }

  CesiumPopup.prototype.remove = function () {

    _closeBtn && _closeBtn.removeEventListener('click', this.closeHander, false)


    if (_closeBtn) {
      _closeBtn.parentNode.removeChild(_closeBtn)
      _closeBtn = null

    }

    if (_contentContainer) {
      _contentContainer.parentNode.removeChild(_contentContainer)
      _contentContainer = null
    }

    if (_panelContainer) {
      _panelContainer.parentNode.removeChild(_panelContainer)
      _panelContainer = null
    }


    if (_renderListener) {
      _renderListener()
      _renderListener = null
    }

    if (_viewer) {
      _viewer = null
    }
    this.emit('close')

  }


  return CesiumPopup
})()

export default CesiumPopup

