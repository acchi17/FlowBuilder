import Entry from './Entry';

/**
 * スクリプトを実行するクラス
 */
export default class Block extends Entry {
    /**
     * @param {string} id - エントリの一意のID
     * @param {string} originalName - オリジナルの名称（変更不可）
     * @param {string} description - 説明
     * @param {Array} [parameters] - パラメータ定義の配列
     * @param {string} scriptPath - 実行するスクリプトのパス
     */
    constructor(id, originalName, description, scriptPath, parameters = null) {
        super(id, originalName, description, parameters);
        this.scriptPath = scriptPath;
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
    }

    /**
     * 実際の実行処理
     * @param {Object} inputParams - 入力パラメータの値を含むオブジェクト {paramName: value, ...}
     * @returns {Promise<Object>} 出力パラメータの値を含むオブジェクト {paramName: value, ...}
     * @throws {Error}
     * @override
     */
    async executeInternal(inputParams) {
        try {
            // スクリプトの実行（入力パラメータはEntry.jsから受け取る）
            const response = await window.pythonApi.executeScript(
                this.scriptPath,
                inputParams
            );
            return response;
        } catch (error) {
            // 実行時エラーは上位に伝播させる
            throw new Error(`Pythonスクリプト実行エラー: ${error.message}`);
        }
    }
}
