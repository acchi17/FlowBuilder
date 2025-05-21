<template>
  <div class="python-executor">
    <h2>Pythonスクリプト実行</h2>
    
    <div class="script-selector">
      <label for="script-select">スクリプト選択:</label>
      <select id="script-select" v-model="selectedScript" @change="updateParams">
        <option value="sample_calculator">計算機</option>
        <option value="text_processor">テキスト処理</option>
      </select>
    </div>
    
    <!-- 計算機スクリプトのパラメータ -->
    <div v-if="selectedScript === 'sample_calculator'" class="params-container">
      <div class="param-group">
        <label for="operation">演算:</label>
        <select id="operation" v-model="calculatorParams.operation">
          <option value="add">加算</option>
          <option value="subtract">減算</option>
          <option value="multiply">乗算</option>
          <option value="divide">除算</option>
        </select>
      </div>
      
      <div class="param-group">
        <label for="a-value">値 A:</label>
        <input id="a-value" type="number" v-model.number="calculatorParams.a" />
      </div>
      
      <div class="param-group">
        <label for="b-value">値 B:</label>
        <input id="b-value" type="number" v-model.number="calculatorParams.b" />
      </div>
    </div>
    
    <!-- テキスト処理スクリプトのパラメータ -->
    <div v-if="selectedScript === 'text_processor'" class="params-container">
      <div class="param-group">
        <label for="text-operation">操作:</label>
        <select id="text-operation" v-model="textProcessorParams.operation">
          <option value="count_words">単語数カウント</option>
          <option value="count_chars">文字数カウント</option>
          <option value="to_uppercase">大文字変換</option>
          <option value="to_lowercase">小文字変換</option>
        </select>
      </div>
      
      <div class="param-group">
        <label for="text-input">テキスト:</label>
        <textarea id="text-input" v-model="textProcessorParams.text" rows="4"></textarea>
      </div>
    </div>
    
    <div class="actions">
      <button @click="executeScript" :disabled="isExecuting">実行</button>
    </div>
    
    <div v-if="result" class="result-container">
      <h3>実行結果:</h3>
      <pre>{{ JSON.stringify(result, null, 2) }}</pre>
    </div>
    
    <div v-if="error" class="error-container">
      <h3>エラー:</h3>
      <pre>{{ error }}</pre>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PythonExecutor',
  data() {
    return {
      selectedScript: 'sample_calculator',
      calculatorParams: {
        operation: 'add',
        a: 5,
        b: 3
      },
      textProcessorParams: {
        operation: 'count_words',
        text: 'The quick brown fox jumps over the lazy dog.'
      },
      result: null,
      error: null,
      isExecuting: false
    }
  },
  methods: {
    updateParams() {
      // スクリプト変更時にパラメータをリセット
      this.result = null;
      this.error = null;
    },
    async executeScript() {
      this.isExecuting = true;
      this.result = null;
      this.error = null;
      
      try {
        let scriptName = this.selectedScript;
        let params = {};
        
        // スクリプトに応じたパラメータを設定
        if (scriptName === 'sample_calculator') {
          params = this.calculatorParams;
        } else if (scriptName === 'text_processor') {
          params = this.textProcessorParams;
        }
        
        // Pythonスクリプトを実行（パラメータ付き）
        const response = await window.pythonApi.executeScript(scriptName, params);
        
        if (response.success) {
          this.result = response.result;
        } else {
          this.error = response.error || '不明なエラーが発生しました';
        }
      } catch (err) {
        this.error = `スクリプト実行エラー: ${err.message || err}`;
        console.error('Script execution error:', err);
      } finally {
        this.isExecuting = false;
      }
    }
  }
}
</script>

<style scoped>
.python-executor {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: #f9f9f9;
}

h2 {
  margin-top: 0;
  color: #333;
}

.script-selector {
  margin-bottom: 20px;
}

.params-container {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 4px;
  background-color: #fff;
}

.param-group {
  margin-bottom: 10px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

select, input, textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.actions {
  margin-bottom: 20px;
}

button {
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.result-container, .error-container {
  margin-top: 20px;
  padding: 15px;
  border-radius: 4px;
}

.result-container {
  background-color: #e7f3e8;
  border: 1px solid #c3e6cb;
}

.error-container {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  background-color: rgba(0, 0, 0, 0.05);
  padding: 10px;
  border-radius: 3px;
  overflow-x: auto;
}
</style>
