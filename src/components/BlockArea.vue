<template>
  <div class="block-area">
    <div class="tabs">
      <button 
        :class="{ active: activeTab === 'blocks' }" 
        @click="activeTab = 'blocks'"
      >
        ブロック
      </button>
      <button 
        :class="{ active: activeTab === 'python' }" 
        @click="activeTab = 'python'"
      >
        Pythonスクリプト
      </button>
    </div>
    
    <div v-if="activeTab === 'blocks'" class="tab-content">
      <!-- ブロック関連のコンテンツ -->
      <p>ここにブロックが表示されます</p>
    </div>
    
    <div v-if="activeTab === 'python'" class="tab-content">
      <!-- Pythonスクリプト実行コンポーネント -->
      <PythonExecutor />
    </div>
  </div>
</template>

<script>
import PythonExecutor from './PythonExecutor.vue'

export default {
  name: 'BlockArea',
  components: {
    PythonExecutor
  },
  data() {
    return {
      activeTab: 'blocks' // デフォルトでブロックタブを表示
    }
  }
}
</script>

<style scoped>
.block-area {
  grid-area: block;
  background-color: #e8e8e8;
  overflow-y: auto;
  padding: 10px;
  border-right: 1px solid #ccc;
  display: flex;
  flex-direction: column;
}
/* .tabs {
  display: flex;
  margin-bottom: 15px;
  border-bottom: 1px solid #ccc;
}

.tabs button {
  padding: 8px 16px;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  border-bottom: none;
  border-radius: 4px 4px 0 0;
  margin-right: 5px;
  cursor: pointer;
  outline: none;
}

.tabs button.active {
  background-color: #fff;
  border-bottom: 1px solid #fff;
  margin-bottom: -1px;
  font-weight: bold;
}

.tab-content {
  flex: 1;
  overflow-y: auto;
  background-color: #fff;
  border-radius: 0 4px 4px 4px;
  padding: 15px;
} */
</style>
