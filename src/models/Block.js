import Entry from './Entry';
import { ExecutionStatus } from './ExecutionStatus';

/**
 * Pythonスクリプトを実行するブロッククラス
 * Entryクラスを継承し、executeInternalメソッドを実装
 */
export default class Block extends Entry {
    /**
     * @param {string} id - ブロックの一意のID
     * @param {string} originalName - オリジナルの名称（変更不可）
     * @param {string} description - 説明
     * @param {string} scriptPath - 実行するPythonスクリプトのパス
     * @param {Object} pythonService - Pythonスクリプト実行サービス
     */
    constructor(id, originalName, description, scriptPath, pythonService) {
        super(id, originalName, description);
        
        /**
         * 実行するPythonスクリプトのパス
         * @type {string}
         * @private
         */
        this.scriptPath = scriptPath;
        
        /**
         * Pythonスクリプト実行サービス
         * @type {Object}
         * @private
         */
        this.pythonService = pythonService;
    }

    /**
     * スクリプトパスを取得
     * @returns {string} スクリプトパス
     */
    getScriptPath() {
        return this.scriptPath;
    }

    /**
     * スクリプトパスを設定
     * @param {string} path - 新しいスクリプトパス
     */
    setScriptPath(path) {
        this.scriptPath = path;
    }

    /**
     * 実行可能性の検証
     * @throws {Error} 検証エラーが発生した場合
     * @override
     */
    validateExecutability() {
        // 親クラスの検証
        super.validateExecutability();
        
        // スクリプトパスの検証
        if (!this.scriptPath) {
            throw new Error('Pythonスクリプトのパスが設定されていません');
        }
        
        // Pythonサービスの検証
        if (!this.pythonService) {
            throw new Error('Pythonサービスが設定されていません');
        }
    }

    /**
     * 実際の実行処理
     * @returns {Promise<void>}
     * @throws {Error} 実行エラーが発生した場合
     * @override
     */
    async executeInternal() {
        try {
            // 入力パラメータの収集
            const inputParams = {};
            this.parameters.inputs.forEach((param, paramId) => {
                inputParams[paramId] = param.value;
            });
            
            // Pythonスクリプトの実行
            const result = await this.pythonService.executeScript(
                this.scriptPath,
                inputParams
            );
            
            // 出力パラメータの設定
            if (result && typeof result === 'object') {
                Object.entries(result).forEach(([paramId, value]) => {
                    this.setParameterValue(paramId, value, 'outputs');
                });
            }
        } catch (error) {
            throw new Error(`Pythonスクリプト実行エラー: ${error.message}`);
        }
    }
}
