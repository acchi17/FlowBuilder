'use strict'

import { app, protocol, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension from 'electron-devtools-installer'
const isDevelopment = process.env.NODE_ENV !== 'production'

// Vue Devtools v6 Chrome Web Store ID
const VUEJS3_DEVTOOLS_ID = 'nhdogjmejiglipccpnnnanhbledajbpd'

// Pythonサービスのインポート
const PythonService = require('./services/PythonService')

// 設定ファイルの読み込み
const fs = require('fs')
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'))

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])


async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Pythonサービスの初期化
async function initializePythonService() {
  try {
    await PythonService.initialize(config.pythonBlocksDirPath)
    console.log('Python service initialized successfully')
  } catch (error) {
    console.error(`Failed to initialize Python service: ${error}`)
  }
}

// IPC通信の設定
function setupIPC() {
  // スクリプト実行リクエスト
  ipcMain.handle('execute-python-script', async (event, scriptName, params = {}) => {
    try {
      console.log(`Executing Python script: ${scriptName} with params:`, params);
      
      // パラメータを含むスクリプト実行
      const result = await PythonService.executeScript(scriptName, params);
      return result;  // 結果をそのまま返す
    } catch (error) {
      console.error(`Error executing Python script: ${error}`);
      // エラーの場合はResultキーを含む辞書を返す
      return { 
        Result: false, 
        error: error.message 
      };
    }
  })
}

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  // Pythonサービスの初期化
  await initializePythonService()
  
  // IPC通信の設定
  setupIPC()
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      // Try installing by ID, then by the constant if the ID fails (fallback)
      // However, the error "Invalid extensionReference passed in: "undefined"" suggests VUEJS3_DEVTOOLS itself might be undefined.
      // So, we'll prioritize the direct ID.
      await installExtension(VUEJS3_DEVTOOLS_ID)
      console.log('Vue Devtools installed successfully.')
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
      // Fallback attempt with the imported constant, though likely to fail if it was undefined.
      // This is more for thoroughness or if the ID changes.
      // For now, we'll comment this out to avoid redundant errors if the ID method is the primary fix.
      // try {
      //   const { VUEJS3_DEVTOOLS } = await import('electron-devtools-installer');
      //   if (VUEJS3_DEVTOOLS) {
      //     await installExtension(VUEJS3_DEVTOOLS);
      //     console.log('Vue Devtools installed successfully (fallback).');
      //   } else {
      //     console.error('VUEJS3_DEVTOOLS constant is undefined.');
      //   }
      // } catch (e2) {
      //   console.error('Vue Devtools failed to install (fallback):', e2.toString());
      // }
    }
  }
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

// アプリケーション終了時の処理
app.on('will-quit', () => {
  // Pythonサービスの終了
  PythonService.shutdown()
  console.log('Python service shutdown')
})
