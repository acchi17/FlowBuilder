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
              @dragstart="onDragStart($event, block, category)">
            {{ block.name }}
          </li>
        </ul>
      </transition>
    </div>
  </div>
</template>

<script>
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
    onDragStart(event, block, category) {
      // ドラッグするブロックの情報をDataTransferオブジェクトに設定
      const blockData = {
        name: block.name,
        category: category.name,
        parameters: block.parameters,
        command: block.command
      };
      event.dataTransfer.setData('application/json', JSON.stringify(blockData));
    }
  },
  mounted() {
    fetch('/blocks.xml')
      .then(res => res.text())
      .then(xmlStr => {
        const parser = new DOMParser();
        const xml = parser.parseFromString(xmlStr, 'application/xml');
        const categoryNodes = xml.querySelectorAll('category');
        this.categories = Array.from(categoryNodes).map(cat => ({
          name: cat.getAttribute('name'),
          isExpanded: false,
          blocks: Array.from(cat.querySelectorAll('block')).map(block => {
            // コマンド情報を取得
            const commandNode = block.querySelector('command');
            const command = commandNode ? commandNode.textContent : '';
            
            // パラメータ情報を取得
            const parameterNodes = block.querySelectorAll('parameter');
            const parameters = Array.from(parameterNodes).map(param => {
              const attributes = {};
              Array.from(param.attributes).forEach(attr => {
                attributes[attr.name] = attr.value;
              });
              return attributes;
            });
            
            return {
              name: block.getAttribute('name'),
              command: command,
              parameters: parameters
            };
          })
        }));
      });
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
