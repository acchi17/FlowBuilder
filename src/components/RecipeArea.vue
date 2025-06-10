<template>
  <div class="recipe-area"
       @dragover.prevent
       @drop="onDrop">
    <div class="blocks-container">
      <!-- ドロップされたブロックのインスタンスを表示 -->
      <div v-for="block in blocks" :key="block.id" class="block-instance"
           :style="{ left: block.position.x + 'px', top: block.position.y + 'px' }">
        {{ block.name }}
      </div>
    </div>
  </div>
</template>

<script>
import { v4 as uuidv4 } from 'uuid';

export default {
  name: 'RecipeArea',
  data() {
    return {
      blocks: []  // ドロップされたブロックのインスタンスを管理
    }
  },
  methods: {
    onDrop(event) {
      try {
        const blockData = JSON.parse(event.dataTransfer.getData('application/json'));
        
        // 新しいブロックインスタンスを生成
        const newBlock = {
          id: uuidv4(), // 一意のIDを生成
          name: blockData.name,
          category: blockData.category,
          parameters: blockData.parameters,
          command: blockData.command,
          position: {
            x: event.offsetX,
            y: event.offsetY
          }
        };
        
        this.blocks.push(newBlock);
      } catch (error) {
        console.error('ブロックのドロップ処理中にエラーが発生しました:', error);
      }
    }
  }
}
</script>

<style scoped>
.recipe-area {
  grid-area: recipe;
  background-color: #f8f8f8;
  overflow-y: auto;
  padding: 10px;
}

.blocks-container {
  min-height: 100%;
  position: relative;
}

.block-instance {
  position: absolute;
  padding: 10px;
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  min-width: 100px;
  z-index: 1;
}
</style>
