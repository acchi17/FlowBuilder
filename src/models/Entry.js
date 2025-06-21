import Parameter from './Parameter';
// import { InputControlType } from './InputControlType';
import { ExecutionStatus } from './ExecutionStatus';
import ParameterConnectionManager from './ParameterConnection';

/**
 * 実行単位の基底クラス
 */
export default class Entry {
    /**
     * @param {string} id - エントリの一意のID
     * @param {string} originalName - オリジナルの名称（変更不可）
     * @param {string} description - 説明
     * @param {Array} [parameters] - パラメータ定義の配列
     */
    constructor(id, originalName, description, parameters = null) {
        this.id = id;
        this.originalName = originalName;
        this.customName = null;
        this.description = description;
        
        // パラメータ管理（loadParameterDefinitionで初期化と設定を行う）
        this.parameters = this.loadParameterDefinition(parameters);
        
        // 実行状態の管理
        this.status = ExecutionStatus.READY;
        // パラメータ接続の管理
        this.connectionManager = new ParameterConnectionManager();
    }

    /**
     * 表示用の名称を取得
     * @returns {string} 表示名
     */
    getDisplayName() {
        return this.customName || this.originalName;
    }

    /**
     * カスタム名を設定
     * @param {string|null} name - 新しいカスタム名、nullで元の名前に戻す
     */
    setCustomName(name) {
        this.customName = name;
    }

    /**
     * パラメータ定義を取り込む
     * @param {Array|null} parameters - パラメータ定義の配列
     * @returns {Object} 入力と出力に分類されたパラメータマップ
     */
    loadParameterDefinition(parameters) {
        const result = {
            inputs: new Map(),
            outputs: new Map()
        };
        
        // parametersが配列で、要素が存在する場合のみ処理
        if (Array.isArray(parameters) && parameters.length > 0) {
            // パラメータをprmTypeに基づいて入力と出力に分類
            parameters.forEach(paramDef => {
                const param = new Parameter(paramDef);
                if (paramDef.prmType === 'input') {
                    result.inputs.set(param.name, param);
                } else if (paramDef.prmType === 'output') {
                    result.outputs.set(param.name, param);
                }
            });
        }
        
        return result;
    }

    /**
     * パラメータの値を設定
     * @param {string} paramName - パラメータ名
     * @param {*} value - 設定する値
     * @param {'inputs' | 'outputs'} type - パラメータタイプ
     * @returns {boolean} 設定が成功したかどうか
     */
    setParameterValue(paramName, value, type = 'inputs') {
        const param = this.parameters[type].get(paramName);
        if (param) {
            return param.setValue(value);
        }
        return false;
    }

    /**
     * パラメータの値を取得
     * @param {string} paramName - パラメータ名
     * @param {'inputs' | 'outputs'} type - パラメータタイプ
     * @returns {*} パラメータの値
     */
    getParameterValue(paramName, type = 'inputs') {
        const param = this.parameters[type].get(paramName);
        return param ? param.value : null;
    }

    /**
     * 特定のパラメータの情報を取得（GUI表示用）
     * @param {string} paramName - パラメータ名
     * @param {'inputs' | 'outputs'} type - パラメータタイプ
     * @returns {Object|null} パラメータ情報
     */
    getParameterInfo(paramName, type = 'inputs') {
        const param = this.parameters[type].get(paramName);
        return param ? param.getDisplayInfo() : null;
    }

    /**
     * すべての入力パラメータの情報を取得（GUI表示用）
     * @returns {Array<Object>} 入力パラメータ情報の配列
     */
    getAllInputParameters() {
        const params = [];
        this.parameters.inputs.forEach(param => {
            params.push(param.getDisplayInfo());
        });
        return params;
    }

    /**
     * すべての出力パラメータの情報を取得（GUI表示用）
     * @returns {Array<Object>} 出力パラメータ情報の配列
     */
    getAllOutputParameters() {
        const params = [];
        this.parameters.outputs.forEach(param => {
            params.push(param.getDisplayInfo());
        });
        return params;
    }

    /**
     * パラメータの値を更新（GUI操作用）
     * @param {string} paramName - パラメータ名
     * @param {*} value - 新しい値
     * @param {'inputs' | 'outputs'} type - パラメータタイプ
     * @returns {boolean} 更新が成功したかどうか
     */
    updateParameterValue(paramName, value, type = 'inputs') {
        const param = this.parameters[type].get(paramName);
        return param ? param.setValue(value) : false;
    }

    /**
     * すべてのパラメータを初期値にリセット
     */
    resetAllParameters() {
        this.parameters.inputs.forEach(param => param.reset());
        this.parameters.outputs.forEach(param => param.reset());
    }

    /**
     * パラメータのバリデーション
     * @throws {Error} バリデーションエラーが発生した場合
     */
    validateParameters() {
        this.parameters.inputs.forEach(param => {
            if (param.required && (param.value === null || param.value === undefined)) {
                throw new Error(`必須パラメータ ${param.name} が設定されていません`);
            }
            if (!param.validateValue(param.value)) {
                throw new Error(`パラメータ ${param.name} の値が無効です`);
            }
        });
    }

    /**
     * 実行状態を取得
     * @returns {string} 実行状態
     */
    getStatus() {
        return this.status;
    }

    /**
     * パラメータを接続
     * @param {Object} connection - パラメータ接続
     * @param {string} connection.sourceEntryId - 接続元のEntry ID
     * @param {string} connection.sourceParameterName - 接続元のパラメータ名
     * @param {string} connection.targetEntryId - 接続先のEntry ID
     * @param {string} connection.targetParameterName - 接続先のパラメータ名
     */
    connectParameter(connection) {
        this.connectionManager.connect(connection);
    }

    /**
     * パラメータの接続を解除
     * @param {Object} connection - パラメータ接続
     */
    disconnectParameter(connection) {
        this.connectionManager.disconnect(connection);
    }

    /**
     * 接続された入力パラメータを取得
     * @returns {Object[]} パラメータ接続の配列
     */
    getConnectedInputs() {
        return this.connectionManager.getInputConnections(this.id);
    }

    /**
     * 接続された出力パラメータを取得
     * @returns {Object[]} パラメータ接続の配列
     */
    getConnectedOutputs() {
        return this.connectionManager.getOutputConnections(this.id);
    }

    /**
     * パラメータ接続の検証
     * @throws {Error} 検証エラーが発生した場合
     */
    validateConnections() {
        // 型の互換性チェック
        const connections = this.connectionManager.getAllConnections();
        for (const connection of connections) {
            if (!this.connectionManager.validateConnectionTypes(connection)) {
                throw new Error(`パラメータ接続の型が一致しません: ${connection.sourceEntryId}:${connection.sourceParameterName} -> ${connection.targetEntryId}:${connection.targetParameterName}`);
            }
        }

        // 未接続の必須パラメータのチェック
        this.parameters.inputs.forEach((param, paramName) => {
            if (param.required) {
                const hasConnection = connections.some(conn => 
                    conn.targetEntryId === this.id && conn.targetParameterName === paramName);
                
                if (!hasConnection && param.value === null) {
                    throw new Error(`必須パラメータ ${param.name} が接続されていません`);
                }
            }
        });
    }

    /**
     * 実行可能性の検証
     * @throws {Error} 検証エラーが発生した場合
     * @override
     */
    validateExecutability() {
        // パラメータ値の検証
        this.validateParameters();
        
        // パラメータ接続の検証
        this.validateConnections();
    }

    /**
     * 実行開始時の処理
     * @protected
     */
    onExecutionStart() {
        this.status = ExecutionStatus.RUNNING;
    }

    /**
     * 実行完了時の処理
     * @protected
     */
    onExecutionComplete() {
        this.status = ExecutionStatus.COMPLETED;
    }

    /**
     * 実行エラー時の処理
     * @param {Error} error - エラー
     * @protected
     */
    onExecutionError(error) {
        this.status = ExecutionStatus.ERROR;
        console.error(`実行エラー (${this.id}): ${error.message}`);
    }

    /**
     * 実行メソッド
     */
    async execute() {
        try {
            // 実行開始ステータス設定
            this.onExecutionStart();

            // 実行前の検証
            this.validateExecutability();

            // 入力パラメータの取得
            const inputParams = {};
            this.parameters.inputs.forEach((param, paramName) => {
                inputParams[paramName] = param.value;
            });

            // 実行処理
            const outputValues = await this.executeInternal(inputParams);
            
            // 出力パラメータの更新
            if (outputValues && typeof outputValues === 'object') {
                // resultプロパティがある場合はエラーチェック
                if ('result' in outputValues && !outputValues.result) {
                    throw new Error(outputValues.error || '不明なエラーが発生しました');
                }

                Object.entries(outputValues).forEach(([paramName, value]) => {
                    //const param = this.parameters['outputs'].get(paramName);
                    const param = this.parameters.outputs.get(paramName);
                    if (param) {
                        param.setValue(value);
                    }
                });
            }

            // 実行完了ステータス設定
            this.onExecutionComplete();

            // 出力値の収集
            // const outputs = {};
            // this.parameters.outputs.forEach((param, paramName) => {
            //     outputs[paramName] = param.value;
            // });
            // return outputs;
        } catch (error) {
            this.onExecutionError(error);
            throw error;
        }
    }

    /**
     * 実際の実行処理（サブクラスで実装）
     * @param {Object} inputParams - 入力パラメータの値を含むオブジェクト {paramName: value, ...}
     * @returns {Promise<Object>} 出力パラメータの値を含むオブジェクト {paramName: value, ...}
     * @throws {Error} 
     * @override
     */
    async executeInternal(inputParams) {
        void inputParams;
        throw new Error('executeInternal must be implemented in subclass');
    }
}
