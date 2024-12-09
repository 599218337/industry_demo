import * as Cesium from 'cesium'

/* apng-js */
export function addBillboardPNG(viewer, opt) {
  let { position, url, billboard } = opt
  return getArrayBuffer(url)
    .then(arrayBuffer => {
      let apng = window.apngjs.parseAPNG(arrayBuffer)

      let canvas = document.createElement('canvas')
      let ctx = canvas.getContext('2d')
      return apng.getPlayer(ctx)
    })
    .then(player => {
      player.play()

      let entity = viewer.entities.add({
        position,
        billboard
      })
      entity.billboard.image = new Cesium.CallbackProperty(() => {
        return player.currentFrame.imageElement
      }, false)

      return [entity.id, entity]
    })
}
// async function addBillboardPNG(viewer, opt) {
//   let { position, url, billboard } = opt;
//   let arrayBuffer = await getArrayBuffer(url);

//   let apng = apngjs.parseAPNG(arrayBuffer);

//   let canvas = document.createElement("canvas");
//   let ctx = canvas.getContext("2d");

//   let player = await apng.getPlayer(ctx);
//   player.play();

//   let entity = viewer.entities.add({
//     position,
//     billboard,
//   });
//   entity.billboard.image = new Cesium.CallbackProperty(() => {
//     return player.currentFrame.imageElement;
//   }, false);
//   return [entity.id, entity];
// }
/* 获取资源arraybuffer类别的值 */
function getArrayBuffer(url) {
  return new Promise(resolve => {
    let xhr = new XMLHttpRequest()
    xhr.responseType = 'arraybuffer' // blob
    xhr.open('get', url)
    xhr.onload = function () {
      if (this.status == 200) {
        let arraybuffer = this.response
        resolve(arraybuffer)
      }
    }
    xhr.send()
  })
}

/* libgif-js */
export function addBillboardGIF1(viewer, opt) {
  let { position, url, billboard } = opt
  let gifDiv = document.createElement('div') // 别删，库会报错
  let gifImg = document.createElement('img')
  // libgif-js库需要img标签配置下面两个属性
  gifImg.setAttribute('rel:animated_src', url)
  gifImg.setAttribute('rel:auto_play', '1') // 设置自动播放属性
  gifDiv.appendChild(gifImg) // 别删，库会报错

  let superGif = new window.SuperGif({
    gif: gifImg
  })

  return new Promise(resolve => {
    superGif.load(function () {
      let entity = viewer.entities.add({
        position,
        billboard
      })
      entity.billboard.image = new Cesium.CallbackProperty(() => {
        // 转成base64,直接加canvas理论上是可以的，这里设置有问题
        return superGif.get_canvas().toDataURL()
      }, false)

      resolve([entity.id, entity])
    })
  })
}

/* gifler */
export function addBillboardGIF2(viewer, opt) {
  let { position, url, billboard } = opt
  let entity = viewer.entities.add({
    position,
    billboard
  })

  let gif = window.gifler(url)
  // 解析gif每帧图片，按时间序列进行切换
  gif.frames(document.createElement('canvas'), function (ctx, frame) {
    entity.billboard.image = frame.buffer.toDataURL()

    // entity.billboard.image = new Cesium.CallbackProperty(() => {
    //   return frame.buffer.toDataURL();
    // }, false);
  })

  return [entity.id, entity]
}
