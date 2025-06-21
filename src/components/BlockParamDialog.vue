<template>
  <div class="block-dialog-overlay" @click="close">
    <div class="block-dialog" @click.stop>
      <div class="dialog-header">
        <h3>{{ parameterMode === 'input' ? '入力パラメータ' : '出力パラメータ' }}</h3>
        <button class="close-btn" @click="close">×</button>
      </div>
      
      <div class="dialog-content">
        <div v-if="parameters.length === 0" class="no-parameters">
          {{ parameterMode === 'input' ? '入力パラメータはありません' : '出力パラメータはありません' }}
        </div>
        
        <div v-else class="parameter-list">
          <div v-for="param in parameters" :key="param.id" class="parameter-item">
            <div class="parameter-header">
              <span class="parameter-name">{{ param.name }}</span>
              <span class="parameter-type">({{ param.type }})</span>
            </div>
            <div class="parameter-description" v-if="param.description">
              {{ param.description }}
            </div>
            <div class="parameter-value">
              <span>値: </span>
              <span>{{ param.value !== null ? param.value : '未設定' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BlockParamDialog',
  props: {
    block: {
      type: Object,
      required: true
    },
    parameterMode: {
      type: String,
      default: 'input',
      validator: value => ['input', 'output'].includes(value)
    },
    show: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    parameters() {
      return this.parameterMode === 'input'
        ? this.block.getAllInputParameters()
        : this.block.getAllOutputParameters();
    }
  },
  methods: {
    close() {
      this.$emit('close');
    }
  }
}
</script>

<style scoped>
.block-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.block-dialog {
  width: 600px;
  max-height: 80vh;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #ddd;
}

.dialog-header h3 {
  margin: 0;
  font-size: 16px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #666;
}

.close-btn:hover {
  color: #333;
}

.dialog-content {
  padding: 15px;
  overflow-y: auto;
}

.no-parameters {
  color: #999;
  font-style: italic;
  text-align: center;
  padding: 20px;
}

.parameter-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.parameter-item {
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 4px;
  background-color: #f9f9f9;
}

.parameter-header {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

.parameter-name {
  font-weight: bold;
  margin-right: 5px;
}

.parameter-type {
  color: #666;
  font-size: 12px;
}

.parameter-description {
  font-size: 12px;
  color: #666;
  margin-bottom: 5px;
}

.parameter-value {
  font-size: 14px;
}
</style>
