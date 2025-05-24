const { spawn } = require('child_process');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');

// プロジェクトルートのconfig.jsonからpythonDirを取得
let pythonPath = 'python';
try {
    const configPath = path.resolve(process.cwd(), 'config.json');
    if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        if (config.pythonDir) {
            // OSごとに実行ファイル名を決定
            const exeName = process.platform === 'win32' ? 'python.exe' : 'python';
            pythonPath = path.join(config.pythonDir, exeName);
        }
    }
} catch (e) {
    console.warn('config.jsonの読み込みに失敗しました。デフォルトのpythonを使用します。', e);
}

/**
 * Pythonプロセスを管理し、WebSocketを通じてスクリプトを実行するクラス
 */
class PythonProcessManager {
    /**
     * コンストラクタ
     * @param {string} scriptDir Pythonスクリプトの基準ディレクトリ
     */
    constructor(scriptDir) {
        this.scriptDir = scriptDir;
        this.pythonProcess = null;
        this.ws = null;
        this.isConnected = false;
        this.connectionPromise = null;
        this.connectionResolver = null;
        this.port = 8765;
        this.host = 'localhost';
    }

    /**
     * Pythonサーバープロセスを起動し、WebSocket接続を確立する
     * @returns {Promise<void>} 接続完了時に解決されるPromise
     */
    async start() {
        // 既に起動している場合は何もしない
        if (this.pythonProcess && this.isConnected) {
            return Promise.resolve();
        }

        // 接続Promise作成
        this.connectionPromise = new Promise((resolve, reject) => {
            this.connectionResolver = { resolve, reject };
        });

        try {
            // python_server.pyの絶対パスを取得
            const serverPath = path.resolve(process.cwd(), 'python_server.py');
            
            // ファイルの存在確認
            if (!fs.existsSync(serverPath)) {
                throw new Error(`Python server script not found at: ${serverPath}`);
            }

            // Pythonプロセスの起動
            this.pythonProcess = spawn(pythonPath, [serverPath, this.scriptDir]);
            
            // 標準出力のハンドリング
            this.pythonProcess.stdout.on('data', (data) => {
                console.log(`Python server stdout: ${data}`);
            });
            
            // 標準エラー出力のハンドリング
            this.pythonProcess.stderr.on('data', (data) => {
                console.error(`Python server stderr: ${data}`);
            });
            
            // プロセス終了時のハンドリング
            this.pythonProcess.on('close', (code) => {
                console.log(`Python server process exited with code ${code}`);
                this.isConnected = false;
                this.pythonProcess = null;
                this.ws = null;
            });

            // プロセスエラー時のハンドリング
            this.pythonProcess.on('error', (err) => {
                console.error(`Failed to start Python server: ${err}`);
                if (this.connectionResolver) {
                    this.connectionResolver.reject(err);
                    this.connectionResolver = null;
                }
            });

            // サーバー起動待機（少し遅延を入れる）
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // WebSocket接続の確立
            this.connectWebSocket();
            
            // 接続完了を待機
            return this.connectionPromise;
        } catch (error) {
            console.error(`Error starting Python server: ${error}`);
            if (this.connectionResolver) {
                this.connectionResolver.reject(error);
                this.connectionResolver = null;
            }
            throw error;
        }
    }

    /**
     * WebSocket接続を確立する
     */
    connectWebSocket() {
        try {
            this.ws = new WebSocket(`ws://${this.host}:${this.port}`);
            
            // 接続成功時のハンドラ
            this.ws.on('open', () => {
                console.log('Connected to Python WebSocket server');
                this.isConnected = true;
                if (this.connectionResolver) {
                    this.connectionResolver.resolve();
                    this.connectionResolver = null;
                }
            });
            
            // エラー発生時のハンドラ
            this.ws.on('error', (error) => {
                console.error(`WebSocket error: ${error}`);
                if (this.connectionResolver) {
                    this.connectionResolver.reject(error);
                    this.connectionResolver = null;
                }
            });
            
            // 接続切断時のハンドラ
            this.ws.on('close', () => {
                console.log('Disconnected from Python WebSocket server');
                this.isConnected = false;
            });
        } catch (error) {
            console.error(`Error connecting to WebSocket: ${error}`);
            if (this.connectionResolver) {
                this.connectionResolver.reject(error);
                this.connectionResolver = null;
            }
        }
    }

    /**
     * Pythonスクリプトを実行する
     * @param {string} scriptPath 実行するスクリプトのパス
     * @param {Object} params スクリプトに渡すパラメータ
     * @returns {Promise<any>} スクリプトの実行結果
     */
    async executeScript(scriptPath, params = {}) {
        // 接続確認
        if (!this.isConnected || !this.ws) {
            throw new Error('Not connected to Python server');
        }

        return new Promise((resolve, reject) => {
            // メッセージ受信ハンドラ
            const messageHandler = (data) => {
                try {
                    const result = JSON.parse(data);
                    if (result.status === 'success') {
                        resolve(result.result);
                    } else {
                        reject(new Error(result.message));
                    }
                } catch (error) {
                    reject(new Error(`Failed to parse response: ${error}`));
                }
                
                // ハンドラを削除
                this.ws.removeListener('message', messageHandler);
            };
            
            // メッセージ受信イベントの登録
            this.ws.on('message', messageHandler);
            
            // スクリプトパスとパラメータを送信
            this.ws.send(JSON.stringify({
                script_path: scriptPath,
                params: params
            }));
        });
    }

    /**
     * Pythonサーバープロセスを停止する
     */
    stop() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        
        if (this.pythonProcess) {
            this.pythonProcess.kill();
            this.pythonProcess = null;
        }
        
        this.isConnected = false;
    }
}

module.exports = PythonProcessManager;
