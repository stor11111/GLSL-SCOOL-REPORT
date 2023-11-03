<template>
  <canvas id="webgl-canvas"></canvas>
</template>

<script setup>
import WebGLApp from "@/assets/js/001/script.js"

onMounted(async () => {
  // WebGLApp クラスの初期化とリサイズ処理の設定
  const app = new WebGLApp()
  window.addEventListener("resize", app.resize, false)
  // アプリケーションのロードと初期化
  app.init("webgl-canvas")
  await app.load()
  // セットアップして描画を開始
  app.setup()
  app.render()
})
</script>
