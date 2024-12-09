export class ShadertoyLoader {
  canvas: HTMLCanvasElement
  gl: WebGL2RenderingContext
  insertTag: string
  baseShader: any
  program: any
  resolutionLocation: any
  mouseLocation: any
  timeLocation: any
  iTimeDeltaAddr: any
  iFrameAddr: any
  vao: any
  mouseX: any
  mouseY: any
  mouseOriX: any
  mouseOriY: any
  mMouseIsDown: any
  time: any
  frame: any
  totalTimeSec: any
  aTime: any

  constructor(canvas) {
    this.canvas = canvas
    this.gl = canvas.getContext('webgl2', {
      alpha: false,
      depth: false,
      antialias: false,
      powerPreference: 'high-performance',
      premultipliedAlpha: false,
      preserveDrawingBuffer: true
    })

    this.insertTag = '/*InsertShadertoyCodeHere*/'
    this.baseShader = {
      vs: `#version 300 es
        #ifdef GL_ES
            precision highp float;
            precision highp int;
            precision mediump sampler3D;
        #endif

        in vec4 a_position;
        void main() {
            gl_Position = a_position;
        }
      `,
      fs: `#version 300 es
        #ifdef GL_ES
            precision highp float;
            precision highp int;
            precision mediump sampler3D;
        #endif
        #define HW_PERFORMANCE 1

        uniform vec3 iResolution;
        uniform vec4 iMouse;
        uniform float iTime;
        uniform float iTimeDelta;
        uniform int iFrame;

        out vec4 outColor;

        /*InsertShadertoyCodeHere*/

        void main() {
            mainImage(outColor, gl_FragCoord.xy);
        }
      `,
      dft: `
      void mainImage( out vec4 fragColor, in vec2 fragCoord )
    {
        // Normalized pixel coordinates (from 0 to 1)
        vec2 uv = fragCoord/iResolution.xy;
    
        // Time varying pixel color
        vec3 col = 0.5 + 0.5*cos(iTime+uv.xyx+vec3(0,2,4));
    
        // Output to screen
        fragColor = vec4(col,1.0);
    }
      
      `
    }

    this.program

    this.resolutionLocation
    this.mouseLocation
    this.timeLocation
    this.iTimeDeltaAddr
    this.iFrameAddr

    this.vao

    this.mouseX
    this.mouseY
    this.mouseOriX
    this.mouseOriY
    this.mMouseIsDown

    this.time
    this.frame
    this.totalTimeSec

    this.aTime
  }

  setMouseDown(e) {
    const rect = this.canvas.getBoundingClientRect()
    this.mouseOriX = Math.floor(((e.clientX - rect.left) / (rect.right - rect.left)) * this.canvas.width)
    this.mouseOriY = Math.floor(this.canvas.height - ((e.clientY - rect.top) / (rect.bottom - rect.top)) * this.canvas.height)
    this.mouseX = this.mouseOriX
    this.mouseY = this.mouseOriY
    this.mMouseIsDown = true
  }

  setMousePosition(e) {
    if (!this.mMouseIsDown) return
    const rect = this.canvas.getBoundingClientRect()
    this.mouseX = Math.floor(((e.clientX - rect.left) / (rect.right - rect.left)) * this.canvas.width)
    this.mouseY = Math.floor(this.canvas.height - ((e.clientY - rect.top) / (rect.bottom - rect.top)) * this.canvas.height)
  }

  setMouseUp(e) {
    this.mMouseIsDown = false
  }

  setMouseAction() {
    this.canvas.onmousedown = this.setMouseDown.bind(this)
    this.canvas.onmousemove = this.setMousePosition.bind(this)
    this.canvas.onmouseup = this.setMouseUp.bind(this)
  }

  render() {
    let nowTime = Date.now()
    let dt = (nowTime - this.time) * 0.001
    this.totalTimeSec += dt
    this.time = nowTime

    let gl = this.gl
    let program = this.program
    ;(window as any).webglUtils.resizeCanvasToDisplaySize(gl.canvas)

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    gl.useProgram(program)

    gl.bindVertexArray(this.vao)

    /* 更新支持参数 */
    gl.uniform3f(this.resolutionLocation, gl.canvas.width, gl.canvas.height, 1) // iResolution
    gl.uniform4f(this.mouseLocation, this.mouseX, this.mouseY, this.mouseOriX, this.mouseOriY) // iMouse
    gl.uniform1f(this.timeLocation, this.totalTimeSec) // iTime
    gl.uniform1f(this.iTimeDeltaAddr, dt) // iTimeDelta
    gl.uniform1i(this.iFrameAddr, this.frame) // iFrame
    /* 更新支持参数 */

    if (this.aTime && this.totalTimeSec > this.aTime) return

    gl.drawArrays(gl.TRIANGLES, 0, 6)
    requestAnimationFrame(this.render.bind(this))
    this.frame++
  }

  run(imageFrg, aTime = undefined) {
    /* 插入Image片断 */
    if (!imageFrg) {
      let { dft } = this.baseShader
      imageFrg = dft
      console.log('Loaded default Image.')
    }
    this.baseShader.fs = this.baseShader.fs.replace(this.insertTag, imageFrg)

    let { vs, fs } = this.baseShader
    let gl = this.gl

    this.program = (window as any).webglUtils.createProgramFromSources(gl, [vs, fs])
    let program = this.program

    const positionAttributeLocation = gl.getAttribLocation(program, 'a_position')

    /* 支持参数 */
    this.resolutionLocation = gl.getUniformLocation(program, 'iResolution')
    this.mouseLocation = gl.getUniformLocation(program, 'iMouse')
    this.timeLocation = gl.getUniformLocation(program, 'iTime')
    this.iTimeDeltaAddr = gl.getUniformLocation(program, 'iTimeDelta')
    this.iFrameAddr = gl.getUniformLocation(program, 'iFrame')
    /* 支持参数 */

    this.vao = gl.createVertexArray()
    gl.bindVertexArray(this.vao)
    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(positionAttributeLocation)
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0)

    this.mouseX = 0
    this.mouseY = 0
    this.mouseOriX = 0
    this.mouseOriY = 0
    this.mMouseIsDown = false
    this.setMouseAction()

    this.time = Date.now()
    this.frame = 0
    this.totalTimeSec = 0

    this.aTime = aTime

    this.render()
  }

  destory() {
    let gl = this.gl
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.clearColor(0.0, 0.0, 0.0, 1.0)
  }
}
