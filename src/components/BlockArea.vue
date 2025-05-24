<template>
  <div class="block-area">
    <div v-for="category in categories" :key="category.name">
      <h3>{{ category.name }}</h3>
      <ul>
        <li v-for="block in category.blocks" :key="block.name">
          {{ block.name }}
        </li>
      </ul>
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
  mounted() {
    fetch('/blocks.xml')
      .then(res => res.text())
      .then(xmlStr => {
        const parser = new DOMParser();
        const xml = parser.parseFromString(xmlStr, 'application/xml');
        const categoryNodes = xml.querySelectorAll('category');
        this.categories = Array.from(categoryNodes).map(cat => ({
          name: cat.getAttribute('name'),
          blocks: Array.from(cat.querySelectorAll('block')).map(block => ({
            name: block.getAttribute('name')
          }))
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
  margin-top: 16px;
  margin-bottom: 8px;
  font-size: 1.1em;
  color: #333;
}
ul {
  margin: 0 0 8px 0;
  padding-left: 18px;
}
li {
  margin-bottom: 4px;
  font-size: 1em;
}
</style>
