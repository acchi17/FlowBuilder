<template>
  <div class="base-layout">
    <MenuArea />
    <BlockArea />
    <ResizeBar @resize="handleResize" />
    <RecipeArea />
  </div>
</template>

<script>
import { ref } from 'vue'
import MenuArea from './components/MenuArea.vue'
import BlockArea from './components/BlockArea.vue'
import ResizeBar from './components/ResizeBar.vue'
import RecipeArea from './components/RecipeArea.vue'

export default {
  name: 'App',
  components: {
    MenuArea,
    BlockArea,
    ResizeBar,
    RecipeArea
  },
  setup() {
    const blockAreaWidth = ref('30%') // 初期値をパーセンテージで設定
    
    const handleResize = (newPixelWidth) => { // ResizeBarからはピクセル値で受け取る想定
      // App.vueの幅を基準にパーセンテージに変換するか、
      // もしくはgrid-template-columnsをピクセルで直接指定するか検討
      // ここでは一旦、受け取った値をそのまま使う例（要調整）
      blockAreaWidth.value = `${newPixelWidth}px` 
    }

    return {
      blockAreaWidth,
      handleResize
    }
  }
}
</script>

<style>
/* グローバルなスタイルやリセットCSSはここに記述する */
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  overflow: hidden; /* スクロールバーがApp.vueレベルで出ないように */
}

#app { /* Vueアプリのルート要素 */
  height: 100%;
  width: 100%;
}

.base-layout {
  display: grid;
  grid-template-areas:
    "menu menu menu"
    "block resize recipe";
  grid-template-rows: 60px 1fr; /* MenuAreaの高さ60px、残りが下の行 */
  /* blockAreaWidthはsetupで定義されたリアクティブな値 */
  grid-template-columns: v-bind(blockAreaWidth) 10px 1fr; /* BlockArea, ResizeBar, RecipeArea */
  height: 100vh; /* ビューポート全体の高さ */
  width: 100vw; /* ビューポート全体の幅 */
  overflow: hidden; /* このコンテナ自体はスクロールしない */
}
</style>
