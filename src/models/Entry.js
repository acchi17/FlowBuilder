import Parameter from './Parameter';
import { InputControlType } from './InputControlType';
import { ExecutionStatus } from './ExecutionStatus';
import ParameterConnectionManager from './ParameterConnection';

/**
 * エントリの基本クラス
 * ブロックとコンテナの基底クラスとして機能する
 */
export default class Entry {
    /**
     * @param {string} id - エントリの一意のID
     * @param {string} originalName - オリジナルの名称（変更不可）
     * @param {string} description - 説明
     */
    constructor(id, originalName, description) {
        this.id = id;
        this.originalName = originalName;
        this.customName = null;
        this.description = description;
        
        // パラメータ管理
        this.parameters = {
            inputs: new Map(),
            outputs: new Map()
        };
        
        // 子要素の管理
        this.children = new Map();
        
        // 実行順序の管理
        this.executionOrder = [];
        
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
     * @param {Object} definition - XMLから変換されたパラメータ定義オブジェクト
     */
    loadParameterDefinition(definition) {
        // 入力パラメータの設定
        if (definition.inputs && Array.isArray(definition.inputs)) {
            definition.inputs.forEach(paramDef => {
                const param = new Parameter(paramDef);
                this.parameters.inputs.set(param.id, param);
            });
        }

        // 出力パラメータの設定
        if (definition.outputs && Array.isArray(definition.outputs)) {
            definition.outputs.forEach(paramDef => {
                const param = new Parameter(paramDef);
                this.parameters.outputs.set(param.id, param);
            });
        }
    }

    /**
     * パラメータの値を設定
     * @param {string} paramId - パラメータID
     * @param {*} value - 設定する値
     * @param {'inputs' | 'outputs'} type - パラメータタイプ
     * @returns {boolean} 設定が成功したかどうか
     */
    setParameterValue(paramId, value, type = 'inputs') {
        const param = this.parameters[type].get(paramId);
        if (param) {
            return param.setValue(value);
        }
        return false;
    }

    /**
     * パラメータの値を取得
     * @param {string} paramId - パラメータID
     * @param {'inputs' | 'outputs'} type - パラメータタイプ
     * @returns {*} パラメータの値
     */
    getParameterValue(paramId, type = 'inputs') {
        const param = this.parameters[type].get(paramId);
        return param ? param.value : null;
    }

    /**
     * 特定のパラメータの情報を取得（GUI表示用）
     * @param {string} paramId - パラメータID
     * @param {'inputs' | 'outputs'} type - パラメータタイプ
     * @returns {Object|null} パラメータ情報
     */
    getParameterInfo(paramId, type = 'inputs') {
        const param = this.parameters[type].get(paramId);
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
     * @param {string} paramId - パラメータID
     * @param {*} value - 新しい値
     * @param {'inputs' | 'outputs'} type - パラメータタイプ
     * @returns {boolean} 更新が成功したかどうか
     */
    updateParameterValue(paramId, value, type = 'inputs') {
        const param = this.parameters[type].get(paramId);
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
                throw new Error(`必須パラメータ ${param.name} (${param.id}) が設定されていません`);
            }
            if (!param.validateValue(param.value)) {
                throw new Error(`パラメータ ${param.name} (${param.id}) の値が無効です`);
            }
        });
    }

    /**
     * 子要素を追加
     * @param {Entry} child - 追加する子要素
     * @throws {Error} 同じIDの子要素が既に存在する場合
     */
    addChild(child) {
        if (this.children.has(child.id)) {
            throw new Error(`子要素 ${child.id} は既に存在します`);
        }
        this.children.set(child.id, child);
    }

    /**
     * 子要素を削除
     * @param {string} id - 削除する子要素のID
     * @returns {boolean} 削除が成功したかどうか
     */
    removeChild(id) {
        return this.children.delete(id);
    }

    /**
     * 子要素を取得
     * @param {string} id - 取得する子要素のID
     * @returns {Entry|undefined} 子要素
     */
    getChild(id) {
        return this.children.get(id);
    }

    /**
     * すべての子要素を取得
     * @returns {Entry[]} 子要素の配列
     */
    getAllChildren() {
        return Array.from(this.children.values());
    }

    /**
     * 実行順序を設定
     * @param {string[]} order - 子要素IDの配列
     * @throws {Error} 存在しない子要素IDが含まれる場合
     */
    setExecutionOrder(order) {
        // 存在しない子要素IDがないかチェック
        for (const id of order) {
            if (!this.children.has(id)) {
                throw new Error(`実行順序に存在しない子要素ID ${id} が含まれています`);
            }
        }
        this.executionOrder = [...order];
    }

    /**
     * 実行順序を取得
     * @returns {string[]} 子要素IDの配列
     */
    getExecutionOrder() {
        return [...this.executionOrder];
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
     * @param {string} connection.sourceParameterId - 接続元のパラメータID
     * @param {string} connection.targetEntryId - 接続先のEntry ID
     * @param {string} connection.targetParameterId - 接続先のパラメータID
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
                throw new Error(`パラメータ接続の型が一致しません: ${connection.sourceEntryId}:${connection.sourceParameterId} -> ${connection.targetEntryId}:${connection.targetParameterId}`);
            }
        }

        // 未接続の必須パラメータのチェック
        this.parameters.inputs.forEach((param, paramId) => {
            if (param.required) {
                const hasConnection = connections.some(conn => 
                    conn.targetEntryId === this.id && conn.targetParameterId === paramId);
                
                if (!hasConnection && param.value === null) {
                    throw new Error(`必須パラメータ ${param.name} (${paramId}) が接続されていません`);
                }
            }
        });
    }

    /**
     * 実行順序の検証
     * @throws {Error} 検証エラーが発生した場合
     */
    validateExecutionOrder() {
        // 子要素がない場合は検証不要
        if (this.children.size === 0) {
            return;
        }

        // すべての子要素が実行順序に含まれているかチェック
        for (const childId of this.children.keys()) {
            if (!this.executionOrder.includes(childId)) {
                throw new Error(`子要素 ${childId} が実行順序に含まれていません`);
            }
        }

        // 実行順序に存在しない子要素がないかチェック
        for (const id of this.executionOrder) {
            if (!this.children.has(id)) {
                throw new Error(`実行順序に存在しない子要素ID ${id} が含まれています`);
            }
        }

        // 依存関係のチェック（簡易版）
        // 実際の実装では、パラメータ接続に基づいてトポロジカルソートを行う必要があります
    }

    /**
     * 実行可能性の検証
     * @throws {Error} 検証エラーが発生した場合
     */
    validateExecutability() {
        // パラメータ値の検証
        this.validateParameters();
        
        // パラメータ接続の検証
        this.validateConnections();
        
        // 子要素がある場合は実行順序の検証
        if (this.children.size > 0) {
            this.validateExecutionOrder();
        }
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
     * @param {Object} inputValues - 入力値のオブジェクト {paramId: value, ...}
     * @returns {Promise<Object>} 出力値のオブジェクト {paramId: value, ...}
     */
    async execute(inputValues) {
        try {
            // 実行開始
            this.onExecutionStart();
            
            // 入力値の設定
            Object.entries(inputValues).forEach(([paramId, value]) => {
                this.setParameterValue(paramId, value, 'inputs');
            });

            // 実行前の検証
            this.validateExecutability();

            // 実行処理（サブクラスでオーバーライド）
            await this.executeInternal();

            // 出力値の収集
            const outputs = {};
            this.parameters.outputs.forEach((param, paramId) => {
                outputs[paramId] = param.value;
            });

            // 実行完了
            this.onExecutionComplete();
            
            return outputs;
        } catch (error) {
            // エラー処理
            this.onExecutionError(error);
            throw error;
        }
    }

    /**
     * 実際の実行処理（サブクラスで実装）
     * @returns {Promise<void>}
     * @throws {Error} 実装されていない場合
     */
    async executeInternal() {
        throw new Error('executeInternal must be implemented in subclass');
    }
}
