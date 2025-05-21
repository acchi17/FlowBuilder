const { contextBridge, ipcRenderer } = require('electron')

// レンダラープロセスに公開するAPI
contextBridge.exposeInMainWorld('pythonApi', {
  /**
   * Pythonスクリプトを実行する
   * @param {string} scriptName 実行するスクリプト名
   * @param {Object} params スクリプトに渡すパラメータ
   * @returns {Promise<any>} スクリプトの実行結果
   */
  executeScript: (scriptName, params = {}) => {
    return ipcRenderer.invoke('execute-python-script', scriptName, params)
  }
})
