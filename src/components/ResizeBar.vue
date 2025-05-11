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
    // initialWidthはドラッグ開始時のBlockAreaの実際の幅を格納するために使用
    // App.vueからpropsとして渡すか、DOMクエリで取得する（DOMクエリは非推奨）
    // ここでは、startDrag内でBlockAreaの幅を取得するロジックを仮定
    let initialWidthOfBlockArea = 0; 

    const startDrag = (event) => {
      event.preventDefault(); // デフォルトのドラッグ動作を抑制
      dragging.value = true;
      startX.value = event.clientX;

      // BlockAreaの現在の幅を取得 (よりVueらしい方法で取得するのが望ましい)
      // 例えば、App.vueがBlockAreaの幅を管理し、それをResizeBarに渡すなど
      const blockAreaElement = document.querySelector('.block-area'); 
      if (blockAreaElement) {
        initialWidthOfBlockArea = blockAreaElement.offsetWidth;
      } else {
        // BlockAreaが見つからない場合のフォールバックやエラー処理
        console.warn('BlockArea element not found for resize.');
        initialWidthOfBlockArea = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--initial-block-width') || '200'); // CSS変数から取得する例
      }

      document.addEventListener('mousemove', onDrag);
      document.addEventListener('mouseup', stopDrag);
    };

    const onDrag = (event) => {
      if (!dragging.value) return;
      const dx = event.clientX - startX.value;
      const newWidth = initialWidthOfBlockArea + dx;
      
      // 最小幅・最大幅の制約 (例: 最小100px, 最大500px)
      const minWidth = 100;
      const maxWidth = 500; // 親コンテナの幅に応じて動的に設定する方が良い場合もある

      if (newWidth >= minWidth && newWidth <= maxWidth) {
        emit('resize', newWidth); // ピクセル単位で新しい幅を通知
      } else if (newWidth < minWidth) {
        emit('resize', minWidth);
      } else {
        emit('resize', maxWidth);
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
      // onDragとstopDragはsetupスコープ内でのみ使用されるため、返す必要はない
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
  user-select: none; /* ドラッグ中にテキスト選択されるのを防ぐ */
}
.resize-bar:hover {
  background-color: #bbb;
}
</style>
