<template>
  <div class="recipe-area"
       @dragover.prevent
       @drop="onDrop">
    <div class="blocks-container">
      <!-- ドロップされたブロックのインスタンスを表示 -->
      <div v-for="(block, index) in recipe.getBlocks()" 
           :key="block.id" 
           class="block-instance"
           draggable="true"
           @dragstart="onDragStart($event, index)"
           @dragover.prevent="onDragOver($event, index)"
           @drop.stop="onDragDrop($event, index)">
        {{ block.getDisplayName() }}
      </div>
    </div>
  </div>
</template>

<script>
import { v4 as uuidv4 } from 'uuid';
import Block from '../models/Block';
import Recipe from '../models/Recipe';

export default {
  name: 'RecipeArea',
  data() {
    return {
      recipe: null,  // Recipeインスタンス
      selectedBlockId: null  // 選択中のブロックID
    }
  },
  created() {
    // コンポーネント作成時にRecipeインスタンスを初期化
    this.recipe = new Recipe(uuidv4(), 'New Recipe');
  },
  methods: {
    // エリア内へのドロップ処理
    onDrop(event) {
      try {
        // ブロック間の移動ではない場合のみ処理
        if (!event.dataTransfer.getData('text/plain')) {
          const blockData = JSON.parse(event.dataTransfer.getData('application/json'));
          
          // Blockインスタンスの生成
          const newBlock = new Block(
            uuidv4(),
            blockData.name,
            blockData.description || '',
            blockData.command || '',
            this.$root.pythonService
          );
          
          // パラメータ定義の読み込み（存在する場合）
          if (blockData.parameters) {
            newBlock.loadParameterDefinition({
              inputs: blockData.parameters.filter(p => p.direction === 'input' || !p.direction),
              outputs: blockData.parameters.filter(p => p.direction === 'output')
            });
          }
          
          // Recipeに追加
          this.recipe.addBlock(newBlock);
        }
      } catch (error) {
        console.error('ブロックのドロップ処理中にエラーが発生しました:', error);
      }
    },
    
    // ブロックのドラッグ開始時の処理
    onDragStart(event, index) {
      event.dataTransfer.setData('text/plain', index.toString());
      event.dataTransfer.effectAllowed = 'move';
    },
    
    // ドラッグ中の処理
    onDragOver(event, index) {
      const draggedIndex = parseInt(event.dataTransfer.getData('text/plain'));
      
      // ドラッグ中のブロックと異なるブロックの上にある場合
      if (draggedIndex !== index && !isNaN(draggedIndex)) {
        // ここでドラッグ中の視覚的なフィードバックを追加できます
        // 例: ドロップ位置のハイライトなど
      }
    },
    
    // ドロップ時の順序入れ替え
    onDragDrop(event, toIndex) {
      const fromIndex = parseInt(event.dataTransfer.getData('text/plain'));
      
      if (!isNaN(fromIndex) && fromIndex !== toIndex) {
        this.recipe.moveBlock(fromIndex, toIndex);
      }
    },
    
    // ブロックの選択
    selectBlock(blockId) {
      this.selectedBlockId = blockId;
    },
    
    // ブロックの削除
    removeBlock(blockId) {
      if (this.selectedBlockId === blockId) {
        this.selectedBlockId = null;
      }
      this.recipe.removeBlock(blockId);
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
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
}

.block-instance {
  position: relative;
  padding: 10px;
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  min-width: 100px;
  cursor: move;
  transition: transform 0.2s, box-shadow 0.2s;
}

.block-instance:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.block-instance:active {
  cursor: grabbing;
  transform: scale(1.02);
}
</style>
