/**
 * パラメータ接続を表すインターフェース
 * @typedef {Object} ParameterConnection
 * @property {string} sourceEntryId - 接続元のEntry ID
 * @property {string} sourceParameterId - 接続元のパラメータID
 * @property {string} targetEntryId - 接続先のEntry ID
 * @property {string} targetParameterId - 接続先のパラメータID
 */

/**
 * パラメータ接続を管理するクラス
 */
export default class ParameterConnectionManager {
    /**
     * コンストラクタ
     */
    constructor() {
        /**
         * パラメータ接続を保持するマップ
         * キー: 接続の一意のID（sourceEntryId:sourceParameterId:targetEntryId:targetParameterId）
         * 値: ParameterConnection
         * @type {Map<string, ParameterConnection>}
         * @private
         */
        this.connections = new Map();
    }

    /**
     * 接続の一意のIDを生成
     * @param {ParameterConnection} connection - パラメータ接続
     * @returns {string} 接続の一意のID
     * @private
     */
    _generateConnectionId(connection) {
        return `${connection.sourceEntryId}:${connection.sourceParameterId}:${connection.targetEntryId}:${connection.targetParameterId}`;
    }

    /**
     * パラメータを接続
     * @param {ParameterConnection} connection - パラメータ接続
     * @throws {Error} 型の不一致や循環参照がある場合
     */
    connect(connection) {
        // 接続の検証
        if (!this.validateConnectionTypes(connection)) {
            throw new Error('パラメータの型が一致しません');
        }

        // 循環参照のチェック
        if (this._hasCyclicDependency(connection)) {
            throw new Error('循環参照が検出されました');
        }

        // 接続を追加
        const connectionId = this._generateConnectionId(connection);
        this.connections.set(connectionId, connection);
    }

    /**
     * パラメータの接続を解除
     * @param {ParameterConnection} connection - パラメータ接続
     */
    disconnect(connection) {
        const connectionId = this._generateConnectionId(connection);
        this.connections.delete(connectionId);
    }

    /**
     * 特定のEntryの入力パラメータに接続している出力パラメータを取得
     * @param {string} entryId - Entry ID
     * @returns {ParameterConnection[]} パラメータ接続の配列
     */
    getInputConnections(entryId) {
        const inputConnections = [];
        this.connections.forEach(connection => {
            if (connection.targetEntryId === entryId) {
                inputConnections.push(connection);
            }
        });
        return inputConnections;
    }

    /**
     * 特定のEntryの出力パラメータが接続している入力パラメータを取得
     * @param {string} entryId - Entry ID
     * @returns {ParameterConnection[]} パラメータ接続の配列
     */
    getOutputConnections(entryId) {
        const outputConnections = [];
        this.connections.forEach(connection => {
            if (connection.sourceEntryId === entryId) {
                outputConnections.push(connection);
            }
        });
        return outputConnections;
    }

    /**
     * パラメータの型の互換性をチェック
     * @param {ParameterConnection} connection - パラメータ接続
     * @param {Function} getParameterTypeFunc - パラメータの型を取得する関数
     * @returns {boolean} 型が互換性を持つ場合はtrue
     */
    validateConnectionTypes() {
        //引数: connection, getParameterTypeFunc
        // 実際の実装では、getParameterTypeFuncを使用してパラメータの型を取得し、
        // 型の互換性をチェックする必要があります。
        // ここでは簡易的な実装としてtrueを返します。
        return true;
    }

    /**
     * 循環参照をチェック
     * @param {ParameterConnection} newConnection - 新しいパラメータ接続
     * @returns {boolean} 循環参照がある場合はtrue
     * @private
     */
    _hasCyclicDependency(newConnection) {
        // 簡易的な実装として、直接的な循環参照のみをチェック
        const { sourceEntryId, targetEntryId } = newConnection;
        
        // 逆方向の接続が既に存在するかチェック
        for (const connection of this.connections.values()) {
            if (connection.sourceEntryId === targetEntryId && 
                connection.targetEntryId === sourceEntryId) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * すべての接続を取得
     * @returns {ParameterConnection[]} パラメータ接続の配列
     */
    getAllConnections() {
        return Array.from(this.connections.values());
    }

    /**
     * すべての接続を削除
     */
    clearAllConnections() {
        this.connections.clear();
    }
}
