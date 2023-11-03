import { WebGLUtility, ShaderProgram } from "../lib/webgl.js"
import { Pane } from "../lib/tweakpane-4.0.0.min.js"

export default class WebGLApp {
  /**
   * @constructor
   */
  constructor() {
    this.canvas = null
    this.gl = null
    this.running = false

    this.resize = this.resize.bind(this)
    this.render = this.render.bind(this)

    this.uniform = {
      uN: 8.0,
      uD: 3.0,
      uTime: 0.0,
      uResolution: [window.innerWidth, window.innerHeight],
    }

    const pane = new Pane()
    pane.addBinding(this.uniform, "uN", {
      step: 1,
      min: 1,
      max: 8,
    })
    pane.addBinding(this.uniform, "uD", {
      step: 1,
      min: 1,
      max: 8,
    })
  }
  /**
   * シェーダやテクスチャ用の画像など非同期で読み込みする処理を行う。
   * @return {Promise}
   */
  async load() {
    const vs = await WebGLUtility.loadFile("/shader/001/main.vert")
    const fs = await WebGLUtility.loadFile("/shader/001/main.frag")
    this.shaderProgram = new ShaderProgram(this.gl, {
      vertexShaderSource: vs,
      fragmentShaderSource: fs,
      attribute: ["index", "num"],
      stride: [1, 1],
      uniform: ["uN", "uD", "uTime", "uResolution"],
      type: ["uniform1f", "uniform1f", "uniform1f", "uniform2fv"],
    })
  }
  /**
   * WebGL のレンダリングを開始する前のセットアップを行う。
   */
  setup() {
    this.setupGeometry()
    this.resize()
    this.gl.clearColor(0.1, 0.1, 0.1, 1.0)
    this.running = true
  }
  /**
   * ジオメトリ（頂点情報）を構築するセットアップを行う。
   */
  setupGeometry() {
    this.index = []
    this.num = []

    const COUNT = 10000
    for (let i = 0; i < COUNT; ++i) {
      this.index.push(i)
      this.num.push(COUNT)
    }

    this.vbo = [
      WebGLUtility.createVbo(this.gl, this.index),
      WebGLUtility.createVbo(this.gl, this.num),
    ]
  }
  /**
   * WebGL を利用して描画を行う。
   */
  render() {
    this.uniform.uTime += 0.001

    const gl = this.gl

    // running が true の場合は requestAnimationFrame を呼び出す
    if (this.running === true) {
      requestAnimationFrame(this.render)
    }

    // ビューポートの設定と背景のクリア
    gl.viewport(0, 0, this.canvas.width, this.canvas.height)
    gl.clear(gl.COLOR_BUFFER_BIT)

    // プログラムオブジェクトを指定し、VBO と uniform 変数を設定
    this.shaderProgram.use()
    this.shaderProgram.setAttribute(this.vbo)
    this.shaderProgram.setUniform([
      this.uniform.uN,
      this.uniform.uD,
      this.uniform.uTime,
      [this.canvas.width, this.canvas.height],
    ])

    // 設定済みの情報を使って、頂点を画面にレンダリングする
    gl.drawArrays(gl.POINTS, 0, this.index.length)
  }
  /**
   * リサイズ処理を行う。
   */
  resize() {
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
  }
  /**
   * WebGL を実行するための初期化処理を行う。
   * @param {HTMLCanvasElement|string} canvas - canvas への参照か canvas の id 属性名のいずれか
   * @param {object} [option={}] - WebGL コンテキストの初期化オプション
   */
  init(canvas, option = {}) {
    if (canvas instanceof HTMLCanvasElement === true) {
      this.canvas = canvas
    } else if (Object.prototype.toString.call(canvas) === "[object String]") {
      const c = document.querySelector(`#${canvas}`)
      if (c instanceof HTMLCanvasElement === true) {
        this.canvas = c
      }
    }
    if (this.canvas == null) {
      throw new Error("invalid argument")
    }
    this.gl = this.canvas.getContext("webgl", option)
    if (this.gl == null) {
      throw new Error("webgl not supported")
    }
  }
}
