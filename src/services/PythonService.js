const PythonProcessManager = require('./PythonProcessManager');
const path = require('path');
const fs = require('fs');

/**
 * Pythonスクリプト実行サービス
 * シングルトンパターンで実装
 */
class PythonService {
    constructor() {
        this.manager = null;
        this.isInitialized = false;
        this.scriptDir = '';
    }

    /**
     * スクリプトディレクトリを確認し、必要に応じて作成する
     * @param {string} dirPath スクリプトディレクトリのパス
     * @returns {Promise<void>} 処理完了時に解決されるPromise
     */
    async ensureScriptDirectory(dirPath) {
        try {
            // ディレクトリの存在確認
            if (!fs.existsSync(dirPath)) {
                console.log(`Creating script directory: ${dirPath}`);
                fs.mkdirSync(dirPath, { recursive: true });
            }
            return Promise.resolve();
        } catch (error) {
            console.error(`Failed to create script directory: ${error}`);
            return Promise.reject(error);
        }
    }

    /**
     * サービスを初期化する
     * @param {string} scriptDir Pythonスクリプトの基準ディレクトリ
     * @returns {Promise<void>} 初期化完了時に解決されるPromise
     */
    async initialize(scriptDir) {
        if (this.isInitialized) {
            return Promise.resolve();
        }

        try {
            // スクリプトディレクトリの絶対パスを取得
            this.scriptDir = path.resolve(process.cwd(), scriptDir);
            
            // スクリプトディレクトリの確認と作成
            await this.ensureScriptDirectory(this.scriptDir);
            
            // マネージャーの作成
            this.manager = new PythonProcessManager(this.scriptDir);
            
            // Pythonサーバーの起動
            await this.manager.start();
            
            this.isInitialized = true;
            console.log(`Python service initialized with script directory: ${this.scriptDir}`);
            
            return Promise.resolve();
        } catch (error) {
            console.error(`Failed to initialize Python service: ${error}`);
            this.isInitialized = false;
            this.manager = null;
            return Promise.reject(error);
        }
    }

    /**
     * スクリプトを実行する
     * @param {string} scriptName 実行するスクリプト名（.pyは省略可能）
     * @param {Object} params スクリプトに渡すパラメータ
     * @returns {Promise<any>} スクリプトの実行結果
     */
    async executeScript(scriptName, params = {}) {
        if (!this.isInitialized || !this.manager) {
            throw new Error('Python service is not initialized');
        }

        try {
            // スクリプト名に.pyが含まれていない場合は追加
            if (!scriptName.endsWith('.py')) {
                scriptName = `${scriptName}.py`;
            }
            
            // スクリプトの絶対パスを取得
            const scriptPath = path.join(this.scriptDir, scriptName);
            
            // スクリプトを実行（パラメータ付き）
            const result = await this.manager.executeScript(scriptPath, params);
            return result;
        } catch (error) {
            console.error(`Failed to execute script ${scriptName}: ${error}`);
            throw error;
        }
    }

    /**
     * サービスを終了する
     */
    shutdown() {
        if (this.manager) {
            this.manager.stop();
            this.manager = null;
        }
        
        this.isInitialized = false;
        console.log('Python service shutdown');
    }
}

// シングルトンインスタンス
const instance = new PythonService();

module.exports = instance;
