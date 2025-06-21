<template>
  <div class="block-area">
    <div v-for="category in categories" :key="category.name">
      <h3 @click="toggleCategory(category)">
        {{ category.name }}
      </h3>
      <transition name="slide">
        <ul v-show="category.isExpanded">
          <li v-for="block in category.blocks" 
              :key="block.name"
              draggable="true"
              @dragstart="onDragStart($event, block)">
            {{ block.name }}
          </li>
        </ul>
      </transition>
    </div>
  </div>
</template>

<script>
import BlockService from '@/services/BlockService';

export default {
  name: 'BlockArea',
  data() {
    return {
      categories: []
    }
  },
  methods: {
    toggleCategory(category) {
      category.isExpanded = !category.isExpanded;
    },
    onDragStart(event, block) {
      // ドラッグするブロックの情報をDataTransferオブジェクトに設定
      const blockData = {
        name: block.name,
        command: block.command,
        parameters: block.parameters
      };
      event.dataTransfer.setData('application/json', JSON.stringify(blockData));
    },
    /**
     * ブロックカテゴリー情報を読み込む
     * @returns {Promise<Array>} カテゴリー情報の配列
     */
    async loadBlockCategories() {
      // サービスからブロックカテゴリー情報を取得して返す
      return await BlockService.fetchBlockCategories();
    }
  },
  async mounted() {
    // loadBlockCategories()の戻り値をcategoriesに代入
    this.categories = await this.loadBlockCategories();
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
h3 {
  margin-top: 4px;
  margin-bottom: 4px;
  font-size: 12px;
  color: #333;
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
}
ul {
  margin: 0 0 8px 0;
  padding-left: 18px;
}
li {
  margin-bottom: 2px;
  font-size: 12px;
  list-style-type: '- ';  /* ハイフンとスペースを指定 */
  cursor: grab;
}

li:hover {
  background-color: #f0f0f0;
}

li:active {
  cursor: grabbing;
}
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
