import { WebGLUtility, ShaderProgram } from "../lib/webgl.js"
import { WebGLMath } from "../lib/math.js"
import { WebGLOrbitCamera } from "../lib/camera.js"
import { Pane } from "../lib/tweakpane-4.0.0.min.js"

export default class WebGLApp {
  /**
   * @constructor
   */
  constructor() {
    // 汎用的なプロパティ
    this.canvas = null
    this.gl = null
    this.running = false

    // this を固定するためメソッドをバインドする
    this.resize = this.resize.bind(this)
    this.render = this.render.bind(this)

    // 各種パラメータや uniform 変数用
    this.previousTime = 0 // 直前のフレームのタイムスタンプ
    this.timeScale = 0.0 // 時間の進み方に対するスケール
    this.uTime = 0.0 // uniform 変数 time 用
    this.uRatio = 0.0 // 変化の割合い
    this.uType = 0.0
    this.uIsBlend1 = 1.0
    this.uIsBlend2 = 0.0
    this.uIsBlend3 = 0.0
    this.uIsBlend4 = 0.0
    this.uIsBlend5 = 0.0
    this.uIsBlend6 = 0.0

    // tweakpane を初期化
    const pane = new Pane()
    pane
      .addBlade({
        view: "slider",
        label: "time-scale",
        min: 0.0,
        max: 2.0,
        value: this.timeScale,
      })
      .on("change", (v) => {
        this.timeScale = v.value
      })
    pane
      .addBlade({
        view: "slider",
        label: "ratio",
        min: 0.0,
        max: 1.0,
        value: this.uRatio,
      })
      .on("change", (v) => {
        this.uRatio = v.value
      })
    pane
      .addBlade({
        view: "list",
        label: "type",
        options: [
          { text: "mix", value: 0 },
          { text: "noise1", value: 1 },
          { text: "noise2", value: 2 },
          { text: "noise3", value: 3 },
          { text: "noise4", value: 4 },
          { text: "noise5", value: 5 },
          { text: "noise6", value: 6 },
        ],
        value: 0,
      })
      .on("change", (v) => {
        this.uType = v.value
      })
    pane.addBinding({ noise1: true }, "noise1").on("change", (v) => {
      this.uIsBlend1 = v.value ? 1.0 : 0.0
    })
    pane.addBinding({ noise2: false }, "noise2").on("change", (v) => {
      this.uIsBlend2 = v.value ? 1.0 : 0.0
    })
    pane.addBinding({ noise3: false }, "noise3").on("change", (v) => {
      this.uIsBlend3 = v.value ? 1.0 : 0.0
    })
    pane.addBinding({ noise4: false }, "noise4").on("change", (v) => {
      this.uIsBlend4 = v.value ? 1.0 : 0.0
    })
    pane.addBinding({ noise5: false }, "noise5").on("change", (v) => {
      this.uIsBlend5 = v.value ? 1.0 : 0.0
    })
    pane.addBinding({ noise6: false }, "noise6").on("change", (v) => {
      this.uIsBlend6 = v.value ? 1.0 : 0.0
    })
  }
  /**
   * シェーダやテクスチャ用の画像など非同期で読み込みする処理を行う。
   * @return {Promise}
   */
  async load() {
    const vs = await WebGLUtility.loadFile("/shader/002/main.vert")
    const fs = await WebGLUtility.loadFile("/shader/002/main.frag")
    this.shaderProgram = new ShaderProgram(this.gl, {
      vertexShaderSource: vs,
      fragmentShaderSource: fs,
      attribute: ["position", "texCoord"],
      stride: [3, 2],
      uniform: [
        "mvpMatrix",
        "textureUnit0",
        "textureUnit1",
        "textureUnit2",
        "textureUnit3",
        "textureUnit4",
        "textureUnit5",
        "textureUnit6",
        "textureUnit7",
        "ratio",
        "type",
        "isBlend1",
        "isBlend2",
        "isBlend3",
        "isBlend4",
        "isBlend5",
        "isBlend6",
      ],
      type: [
        "uniformMatrix4fv",
        "uniform1i",
        "uniform1i",
        "uniform1i",
        "uniform1i",
        "uniform1i",
        "uniform1i",
        "uniform1i",
        "uniform1i",
        "uniform1f",
        "uniform1f",
        "uniform1f",
        "uniform1f",
        "uniform1f",
        "uniform1f",
        "uniform1f",
        "uniform1f",
      ],
    })

    // 画像を読み込み、テクスチャを生成する @@@
    this.texture0 = await WebGLUtility.createTextureFromFile(
      this.gl,
      "/image/002/sample1.png"
    )
    this.texture1 = await WebGLUtility.createTextureFromFile(
      this.gl,
      "/image/002/sample2.png"
    )
    this.monochrome = [
      await WebGLUtility.createTextureFromFile(
        this.gl,
        "/image/002/noise1.png"
      ),
      await WebGLUtility.createTextureFromFile(
        this.gl,
        "/image/002/noise2.png"
      ),
      await WebGLUtility.createTextureFromFile(
        this.gl,
        "/image/002/noise3.png"
      ),
      await WebGLUtility.createTextureFromFile(
        this.gl,
        "/image/002/noise4.png"
      ),
      await WebGLUtility.createTextureFromFile(
        this.gl,
        "/image/002/noise5.png"
      ),
      await WebGLUtility.createTextureFromFile(
        this.gl,
        "/image/002/noise6.png"
      ),
    ]
  }
  /**
   * WebGL のレンダリングを開始する前のセットアップを行う。
   */
  setup() {
    const gl = this.gl

    const cameraOption = {
      distance: 2.0,
      min: 1.0,
      max: 10.0,
      move: 2.0,
    }
    this.camera = new WebGLOrbitCamera(this.canvas, cameraOption)

    this.setupGeometry()
    this.resize()
    this.running = true
    this.previousTime = Date.now()

    gl.clearColor(0.1, 0.1, 0.1, 1.0)
    gl.clearDepth(1.0)
    gl.enable(gl.DEPTH_TEST)

    // ３つのユニットにそれぞれテクスチャをバインドしておく @@@
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, this.texture0)
    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, this.texture1)
    gl.activeTexture(gl.TEXTURE2)
    gl.bindTexture(gl.TEXTURE_2D, this.monochrome[0])
    gl.activeTexture(gl.TEXTURE3)
    gl.bindTexture(gl.TEXTURE_2D, this.monochrome[1])
    gl.activeTexture(gl.TEXTURE4)
    gl.bindTexture(gl.TEXTURE_2D, this.monochrome[2])
    gl.activeTexture(gl.TEXTURE5)
    gl.bindTexture(gl.TEXTURE_2D, this.monochrome[3])
    gl.activeTexture(gl.TEXTURE6)
    gl.bindTexture(gl.TEXTURE_2D, this.monochrome[4])
    gl.activeTexture(gl.TEXTURE7)
    gl.bindTexture(gl.TEXTURE_2D, this.monochrome[5])
  }
  /**
   * ジオメトリ（頂点情報）を構築するセットアップを行う。
   */
  setupGeometry() {
    // 頂点座標
    this.position = [
      -1.0, 1.0, 0.0, 1.0, 1.0, 0.0, -1.0, -1.0, 0.0, 1.0, -1.0, 0.0,
    ]
    // テクスチャ座標
    this.texCoord = [0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0]
    // すべての頂点属性を VBO にしておく
    this.vbo = [
      WebGLUtility.createVbo(this.gl, this.position),
      WebGLUtility.createVbo(this.gl, this.texCoord),
    ]
  }
  /**
   * WebGL を利用して描画を行う。
   */
  render() {
    // 短く書けるようにローカル変数に一度代入する
    const gl = this.gl
    const m4 = WebGLMath.Mat4
    const v3 = WebGLMath.Vec3

    // running が true の場合は requestAnimationFrame を呼び出す
    if (this.running === true) {
      requestAnimationFrame(this.render)
    }

    // 直前のフレームからの経過時間を取得
    const now = Date.now()
    const time = (now - this.previousTime) / 1000
    this.uTime += time * this.timeScale
    this.previousTime = now

    // ビューポートの設定と背景色・深度値のクリア
    gl.viewport(0, 0, this.canvas.width, this.canvas.height)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    // - 各種行列を生成する ---------------------------------------------------
    // モデル座標変換行列
    const rotateAxis = v3.create(0.0, 1.0, 0.0)
    const rotateAngle = this.uTime * 0.2
    const m = m4.rotate(m4.identity(), rotateAngle, rotateAxis)

    // ビュー座標変換行列（WebGLOrbitCamera から行列を取得する）
    const v = this.camera.update()

    // プロジェクション座標変換行列
    const fovy = 60 // 視野角（度数）
    const aspect = this.canvas.width / this.canvas.height // アスペクト比
    const near = 0.1 // ニア・クリップ面までの距離
    const far = 20.0 // ファー・クリップ面までの距離
    const p = m4.perspective(fovy, aspect, near, far)

    // 行列を乗算して MVP 行列を生成する（行列を掛ける順序に注意）
    const vp = m4.multiply(p, v)
    const mvp = m4.multiply(vp, m)
    // ------------------------------------------------------------------------

    // プログラムオブジェクトを指定し、VBO と uniform 変数を設定
    this.shaderProgram.use()
    this.shaderProgram.setAttribute(this.vbo)
    this.shaderProgram.setUniform([
      mvp,
      0,
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      this.uRatio,
      this.uType,
      this.uIsBlend1,
      this.uIsBlend2,
      this.uIsBlend3,
      this.uIsBlend4,
      this.uIsBlend5,
      this.uIsBlend6,
    ])

    // 設定済みの情報を使って、頂点を画面にレンダリングする
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.position.length / 3)
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
