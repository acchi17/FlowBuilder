export default {
  /**
   * XMLファイルからブロック情報を取得する
   * @returns {Promise<Array>} カテゴリー情報の配列
   */
  async fetchBlockCategories() {
    try {
      const response = await fetch('/blocks.xml');
      const xmlStr = await response.text();
      
      const parser = new DOMParser();
      const xml = parser.parseFromString(xmlStr, 'application/xml');
      const categoryNodes = xml.querySelectorAll('category');
      
      return Array.from(categoryNodes).map(cat => ({
        name: cat.getAttribute('name'),
        isExpanded: false,
        blocks: Array.from(cat.querySelectorAll('block')).map(block => {
          // コマンド情報を取得
          const commandNode = block.querySelector('command');
          const command = commandNode ? commandNode.textContent : '';
          
          // パラメータ情報を取得
          const parameterNodes = block.querySelectorAll('parameter');
          const parameters = Array.from(parameterNodes).map(param => {
            // XMLの属性を取得
            const xmlAttributes = {};
            Array.from(param.attributes).forEach(attr => {
              xmlAttributes[attr.name] = attr.value;
            });
            
            // Parameterクラスが期待する形式に変換
            const parameterDefinition = {
              name: xmlAttributes.name,
              type: xmlAttributes.dataType,
              required: xmlAttributes.required === 'true',
              description: xmlAttributes.description || '',
              value: xmlAttributes.default,
              inputControl: xmlAttributes.ctrlType,
              constraints: {
                minValue: xmlAttributes.min !== undefined ? parseFloat(xmlAttributes.min) : undefined,
                maxValue: xmlAttributes.max !== undefined ? parseFloat(xmlAttributes.max) : undefined,
                step: xmlAttributes.step !== undefined ? parseFloat(xmlAttributes.step) : undefined,
                maxLength: xmlAttributes.maxLength !== undefined ? parseInt(xmlAttributes.maxLength, 10) : undefined,
                pattern: xmlAttributes.pattern,
                choices: xmlAttributes.items ? 
                  xmlAttributes.items.split(',').map(item => item.trim()) : 
                  (xmlAttributes.choices ? xmlAttributes.choices.split(',').map(item => item.trim()) : undefined),
                fileTypes: xmlAttributes.fileTypes ? 
                  xmlAttributes.fileTypes.split(',').map(type => type.trim()) : undefined
              }
            };
            
            // prmType属性を追加（Entry.jsでの分類に使用）
            parameterDefinition.prmType = xmlAttributes.prmType;
            
            return parameterDefinition;
          });
          
          return {
            name: block.getAttribute('name'),
            command: command,
            parameters: parameters
          };
        })
      }));
    } catch (error) {
      console.error('ブロック情報の取得に失敗しました:', error);
      return [];
    }
  }
};
