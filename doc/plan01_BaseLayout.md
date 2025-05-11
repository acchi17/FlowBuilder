# ベースレイアウト実装計画

## 1. コンポーネント構造
```
App.vue
├── MenuArea.vue      // 画面上部のメニューエリア
├── BlockArea.vue     // 画面左側のブロックエリア
├── ResizeBar.vue     // リサイズバーコンポーネント
└── RecipeArea.vue    // 画面右側のレシピエリア
```

## 2. App.vue の実装

```vue
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
/* グローバルなスタイルやリセットCSSはここに記述するか、別途main.cssなどを作成してmain.jsでインポート */
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
```

## 3. 各コンポーネントの実装

### components/MenuArea.vue
```vue
<template>
  <div class="menu-area">
    <!-- メニューの内容 -->
    <p>Menu Area</p>
  </div>
</template>

<script>
export default {
  name: 'MenuArea'
}
</script>

<style scoped>
.menu-area {
  grid-area: menu;
  background-color: #f0f0f0; /* 仮の背景色 */
  border-bottom: 1px solid #ccc;
  display: flex;
  align-items: center;
  padding: 0 20px;
}
</style>
```

### components/BlockArea.vue
```vue
<template>
  <div class="block-area">
    <!-- ブロックエリアの内容 -->
    <p>Block Area</p>
  </div>
</template>

<script>
export default {
  name: 'BlockArea'
}
</script>

<style scoped>
.block-area {
  grid-area: block;
  background-color: #e8e8e8; /* 仮の背景色 */
  overflow-y: auto; /* 内容が多い場合にスクロール */
  padding: 10px;
  border-right: 1px solid #ccc;
}
</style>
```

### components/ResizeBar.vue
```vue
<template>
  <div 
    class="resize-bar" 
    @mousedown="startDrag"
  >
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'ResizeBar',
  emits: ['resize'], // emitするイベントを明示
  setup(props, { emit }) {
    const dragging = ref(false);
    const startX = ref(0);
    const initialWidth = ref(0); // ドラッグ開始時のBlockAreaの幅

    const startDrag = (event) => {
      dragging.value = true;
      startX.value = event.clientX;
      // ドラッグ開始時のBlockAreaの現在の幅を取得する必要がある
      // ここでは仮に親から渡されるか、DOMから直接取得するなどの方法が考えられる
      // 簡単のため、ここでは固定値とするが、実際には動的に取得
      const blockAreaElement = document.querySelector('.block-area'); // これは良くない方法
      if (blockAreaElement) {
        initialWidth.value = blockAreaElement.offsetWidth;
      }


      document.addEventListener('mousemove', onDrag);
      document.addEventListener('mouseup', stopDrag);
    };

    const onDrag = (event) => {
      if (!dragging.value) return;
      const dx = event.clientX - startX.value;
      const newWidth = initialWidth.value + dx;
      // 最小幅・最大幅の制約を追加することも可能
      if (newWidth > 50) { // 例: 最小幅50px
        emit('resize', newWidth); // ピクセル単位で新しい幅を通知
      }
    };

    const stopDrag = () => {
      if (!dragging.value) return;
      dragging.value = false;
      document.removeEventListener('mousemove', onDrag);
      document.removeEventListener('mouseup', stopDrag);
    };

    return {
      startDrag
    };
  }
}
</script>

<style scoped>
.resize-bar {
  grid-area: resize;
  cursor: col-resize;
  background-color: #ccc; /* 仮の背景色 */
  width: 10px; /* バーの幅 */
  display: flex;
  align-items: center;
  justify-content: center;
}
.resize-bar:hover {
  background-color: #bbb;
}
</style>
```

### components/RecipeArea.vue
```vue
<template>
  <div class="recipe-area">
    <!-- レシピエリアの内容 -->
    <p>Recipe Area</p>
  </div>
</template>

<script>
export default {
  name: 'RecipeArea'
}
</script>

<style scoped>
.recipe-area {
  grid-area: recipe;
  background-color: #f8f8f8; /* 仮の背景色 */
  overflow-y: auto; /* 内容が多い場合にスクロール */
  padding: 10px;
}
</style>
```

## 4. grid-area プロパティについて

CSS Gridレイアウトにおける `grid-area` プロパティは、グリッドアイテム（子要素）をグリッド内のどの領域に配置するかを指定します。

### 使用例
- 親要素（App.vueの.base-layout）で領域を定義:
  ```css
  .base-layout {
    grid-template-areas:
      "menu menu menu"    /* 1行目: menuが3列分を占める */
      "block resize recipe"; /* 2行目: block, resize, recipeが各1列 */
  }
  ```

- 子要素（各コンポーネント）で領域を指定:
  ```css
  /* 各コンポーネントの<style scoped>内 */
  .menu-area { grid-area: menu; }
  .block-area { grid-area: block; }
  .resize-bar { grid-area: resize; }
  .recipe-area { grid-area: recipe; }
  ```

### 利点
1. レイアウトの構造が明確
2. コンポーネントの配置が容易
3. 将来的なレイアウト変更が簡単
4. コードの可読性が向上
