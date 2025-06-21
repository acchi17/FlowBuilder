<template>
  <div class="block" 
       :class="{ 'selected': isSelected, 'executing': isExecuting }"
       @click="selectBlock">
    
    <!-- 常に表示される要素 -->
    <div class="block-header">
      <span class="block-name">{{ block.getDisplayName() }}</span>
      <button class="delete-btn" @click.stop="deleteBlock">×</button>
    </div>
    
    <!-- 選択時のみ表示される要素 -->
    <div v-if="isSelected" class="block-details">
      <button class="execute-btn" @click.stop="executeBlock" :disabled="isExecuting">▶</button>
      <button class="toggle-btn" @click.stop="toggleParameterMode">
        {{ parameterMode === 'input' ? '入力' : '出力' }}
      </button>
      
      <!-- パラメータが表示幅を超える場合 -->
      <button v-if="isOverflowing" class="more-btn" @click.stop="showDialog = true">...</button>
      
      <!-- パラメータリスト（オーバーフローしていない場合） -->
      <div v-else class="parameters">
        <div v-for="param in currentParameters" :key="param.id" class="parameter">
          {{ param.name }}
        </div>
      </div>
    </div>
    
    <!-- パラメータダイアログ -->
    <block-param-dialog 
      v-if="showDialog"
      :block="block"
      :parameter-mode="parameterMode"
      :show="showDialog"
      @close="showDialog = false" />
  </div>
</template>

<script>
import BlockParamDialog from './BlockParamDialog.vue';

export default {
  name: 'BlockMain',
  components: {
    BlockParamDialog
  },
  props: {
    block: {
      type: Object,
      required: true
    },
    isSelected: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      parameterMode: 'input',  // 'input' or 'output'
      showDialog: false,
      isOverflowing: false,    // パラメータが表示幅を超えているか
      isExecuting: false       // 実行中かどうか
    }
  },
  computed: {
    currentParameters() {
      return this.parameterMode === 'input' 
        ? this.block.getAllInputParameters()
        : this.block.getAllOutputParameters();
    }
  },
  methods: {
    selectBlock() {
      this.$emit('select-block', this.block.id);
    },
    
    deleteBlock() {
      this.$emit('delete-block', this.block.id);
    },
    
    toggleParameterMode() {
      this.parameterMode = this.parameterMode === 'input' ? 'output' : 'input';
      this.$nextTick(() => {
        this.checkOverflow();
      });
    },
    
    checkOverflow() {
      // パラメータ表示領域のオーバーフローを検出
      const parametersEl = this.$el.querySelector('.parameters');
      if (parametersEl) {
        this.isOverflowing = parametersEl.scrollWidth > parametersEl.clientWidth;
      }
    },
    
    async executeBlock() {
      try {
        this.isExecuting = true;
        
        // Block.jsのexecuteメソッドを呼び出し
        await this.block.execute();
        
        this.isExecuting = false;
      } catch (error) {
        console.error(`ブロック実行エラー: ${error}`);
        this.isExecuting = false;
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.checkOverflow();
    });
  },
  updated() {
    this.$nextTick(() => {
      this.checkOverflow();
    });
  }
}
</script>

<style scoped>
.block {
  position: absolute;
  padding: 10px;
  background: white;
  border: 2px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  min-width: 100px;
  z-index: 1;
  transition: width 0.3s, border-color 0.3s;
}

.block.selected {
  border-color: #4CAF50;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  width: auto;
  max-width: 800px;
}

.block.executing {
  animation: pulse 1.5s infinite;
  border-color: #ff9800;
}

@keyframes pulse {
  0% { border-color: #ff9800; }
  50% { border-color: #ffeb3b; }
  100% { border-color: #ff9800; }
}

.block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.block-name {
  font-weight: bold;
  margin-right: 10px;
}

.delete-btn {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 16px;
  padding: 0 5px;
}

.delete-btn:hover {
  color: #f44336;
}

.block-details {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.execute-btn, .toggle-btn, .more-btn {
  margin-right: 5px;
  padding: 2px 8px;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 3px;
  cursor: pointer;
}

.execute-btn:hover, .toggle-btn:hover, .more-btn:hover {
  background-color: #e0e0e0;
}

.execute-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.parameters {
  display: flex;
  flex-wrap: wrap;
  margin-top: 5px;
  overflow: hidden;
  max-width: 100%;
}

.parameter {
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 3px;
  padding: 2px 8px;
  margin: 2px;
  font-size: 12px;
}
</style>
