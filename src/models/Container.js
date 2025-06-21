import Entry from './Entry';

/**
 * 子要素を順次実行クラス
 */
export default class Container extends Entry {
    /**
     * @param {string} id - コンテナの一意のID
     * @param {string} originalName - オリジナルの名称（変更不可）
     * @param {string} description - 説明
     */
    constructor(id, originalName, description) {
        super(id, originalName, description);
        
        // 子要素の管理
        this.children = new Map();
        
        // 実行順序の管理
        this.executionOrder = [];
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
     * @override
     */
    validateExecutability() {
        // 親クラスの検証
        super.validateExecutability();
        
        // 実行順序の検証
        this.validateExecutionOrder();
        
        // コンテナ固有の検証
        this.validateContainerSpecific();
    }

    /**
     * コンテナ固有の検証
     * @throws {Error} 検証エラーが発生した場合
     */
    validateContainerSpecific() {
        // 子要素の存在チェック
        if (this.children.size === 0) {
            throw new Error('コンテナに子要素が存在しません');
        }
        
        // 実行順序の設定チェック
        if (this.executionOrder.length === 0) {
            throw new Error('実行順序が設定されていません');
        }
        
        // 子要素の実行可能性チェック
        for (const child of this.children.values()) {
            try {
                child.validateExecutability();
            } catch (error) {
                throw new Error(`子要素 ${child.id} の検証エラー: ${error.message}`);
            }
        }
    }

    /**
     * 子要素間のパラメータ値の伝播
     * @private
     */
    _propagateParameterValues() {
        // パラメータ接続に基づいて値を伝播
        const connections = this.connectionManager.getAllConnections();
        
        for (const connection of connections) {
            const { sourceEntryId, sourceParameterName, targetEntryId, targetParameterName } = connection;
            
            // 接続元と接続先の子要素を取得
            const sourceEntry = this.children.get(sourceEntryId);
            const targetEntry = this.children.get(targetEntryId);
            
            if (sourceEntry && targetEntry) {
                // 接続元の出力パラメータの値を取得
                const value = sourceEntry.getParameterValue(sourceParameterName, 'outputs');
                
                // 接続先の入力パラメータに値を設定
                if (value !== null && value !== undefined) {
                    targetEntry.setParameterValue(targetParameterName, value, 'inputs');
                }
            }
        }
    }

    /**
     * 実際の実行処理
     * @param {Object} inputParams - 入力パラメータの値を含むオブジェクト {paramName: value, ...}
     * @returns {Promise<Object>} 出力パラメータの値を含むオブジェクト {paramName: value, ...}
     * @throws {Error} 実行エラーが発生した場合
     * @override
     */
    async executeInternal(inputParams) {
        try {
            // 実行順序に従って子要素を順次実行
            for (const childId of this.executionOrder) {
                const child = this.children.get(childId);
                
                if (!child) {
                    throw new Error(`実行順序に存在しない子要素ID ${childId}`);
                }
                
                // 子要素の入力パラメータに値を設定（コンテナの入力から）
                this.parameters.inputs.forEach((param, paramName) => {
                    const childParam = child.parameters.inputs.get(paramName);
                    if (childParam && param.value !== null && param.value !== undefined) {
                        child.setParameterValue(paramName, param.value, 'inputs');
                    }
                });
                
                // 子要素間のパラメータ値の伝播
                this._propagateParameterValues();
                
                // 子要素を実行
                await child.execute();
                
                // 子要素の実行状態をチェック
                if (child.getStatus() === ExecutionStatus.ERROR) {
                    throw new Error(`子要素 ${childId} の実行エラー`);
                }
                
                // 子要素の出力パラメータの値をコンテナの出力パラメータに設定
                child.parameters.outputs.forEach((param, paramName) => {
                    const containerParam = this.parameters.outputs.get(paramName);
                    if (containerParam && param.value !== null && param.value !== undefined) {
                        this.setParameterValue(paramName, param.value, 'outputs');
                    }
                });
            }
        } catch (error) {
            throw new Error(`コンテナ実行エラー: ${error.message}`);
        }
    }

    /**
     * 子要素の実行順序を自動設定
     * パラメータ接続に基づいてトポロジカルソートを行う
     * @returns {boolean} 設定が成功したかどうか
     */
    autoSetExecutionOrder() {
        // 子要素がない場合は失敗
        if (this.children.size === 0) {
            return false;
        }
        
        // 依存関係グラフの構築
        const graph = new Map();
        const childIds = Array.from(this.children.keys());
        
        // 初期化
        childIds.forEach(id => {
            graph.set(id, []);
        });
        
        // パラメータ接続に基づいて依存関係を設定
        const connections = this.connectionManager.getAllConnections();
        connections.forEach(conn => {
            const { sourceEntryId, targetEntryId } = conn;
            
            // 両方が子要素の場合のみ依存関係を追加
            if (this.children.has(sourceEntryId) && this.children.has(targetEntryId)) {
                // targetはsourceに依存する
                graph.get(targetEntryId).push(sourceEntryId);
            }
        });
        
        // トポロジカルソート
        const visited = new Set();
        const temp = new Set();
        const order = [];
        
        // DFSベースのトポロジカルソート
        const visit = (id) => {
            // 循環依存のチェック
            if (temp.has(id)) {
                return false; // 循環依存あり
            }
            
            // 既に訪問済みならスキップ
            if (visited.has(id)) {
                return true;
            }
            
            temp.add(id);
            
            // 依存先を先に処理
            const deps = graph.get(id);
            for (const depId of deps) {
                if (!visit(depId)) {
                    return false;
                }
            }
            
            temp.delete(id);
            visited.add(id);
            order.push(id);
            
            return true;
        };
        
        // すべての子要素に対してDFSを実行
        for (const id of childIds) {
            if (!visited.has(id)) {
                if (!visit(id)) {
                    return false; // 循環依存あり
                }
            }
        }
        
        // 実行順序を設定（依存関係の逆順）
        this.executionOrder = order.reverse();
        
        return true;
    }
}
