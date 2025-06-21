<template>
  <div class="recipe-area"
       @dragover.prevent
       @drop="onDrop">
    <div class="blocks-container">
      <block-main
        v-for="block in blocks"
        :key="block.id"
        :block="block"
        :is-selected="selectedBlockId === block.id"
        :style="{ left: block.position.x + 'px', top: block.position.y + 'px' }"
        @select-block="selectBlock"
        @delete-block="deleteBlock"
      />
    </div>
  </div>
</template>

<script>
import { v4 as uuidv4 } from 'uuid';
import Block from '@/models/Block';
import BlockMain from '@/components/BlockMain.vue';

export default {
  name: 'RecipeArea',
  components: {
    BlockMain
  },
  data() {
    return {
      blocks: [],  // Blockインスタンスの配列
      selectedBlockId: null  // 選択中のブロックID
    }
  },
  methods: {
    onDrop(event) {
      try {
        const blockData = JSON.parse(event.dataTransfer.getData('application/json'));
        // 新しいBlockインスタンスを生成
        const newBlock = new Block(
          uuidv4(),  // 一意のID
          blockData.name,  // オリジナル名
          blockData.description || '',  // 説明
          blockData.command,  // スクリプトパス
          blockData.parameters  // パラメータ定義を直接渡す
        );
        // 位置情報を追加
        newBlock.position = {
          x: event.offsetX,
          y: event.offsetY
        };
        // リストに追加
        this.blocks.push(newBlock);
      } catch (error) {
        console.error('ブロックのドロップ処理中にエラーが発生しました:', error);
      }
    },
    
    selectBlock(blockId) {
      this.selectedBlockId = blockId;
    },
    
    deleteBlock(blockId) {
      const index = this.blocks.findIndex(block => block.id === blockId);
      if (index !== -1) {
        this.blocks.splice(index, 1);
        
        // 削除したブロックが選択中だった場合、選択状態をクリア
        if (this.selectedBlockId === blockId) {
          this.selectedBlockId = null;
        }
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
