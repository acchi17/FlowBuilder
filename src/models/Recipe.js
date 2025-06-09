/**
 * レシピを表すクラス
 * ブロックの管理と順序制御を行う
 */
export default class Recipe {
    /**
     * レシピを初期化
     * @param {string} id - レシピの一意のID
     * @param {string} name - レシピ名
     */
    constructor(id, name) {
        /**
         * レシピの一意のID
         * @type {string}
         */
        this.id = id;
        
        /**
         * レシピ名
         * @type {string}
         */
        this.name = name;
        
        /**
         * ブロックインスタンスの配列
         * @type {Array}
         */
        this.blocks = [];
    }

    /**
     * ブロックを追加
     * @param {Object} block - 追加するBlockインスタンス
     */
    addBlock(block) {
        this.blocks.push(block);
    }

    /**
     * ブロックを削除
     * @param {string} blockId - 削除するブロックのID
     * @returns {boolean} 削除が成功したかどうか
     */
    removeBlock(blockId) {
        const initialLength = this.blocks.length;
        this.blocks = this.blocks.filter(block => block.id !== blockId);
        return this.blocks.length !== initialLength;
    }

    /**
     * ブロックの順序変更
     * @param {number} fromIndex - 移動元のインデックス
     * @param {number} toIndex - 移動先のインデックス
     * @returns {boolean} 移動が成功したかどうか
     */
    moveBlock(fromIndex, toIndex) {
        // インデックスの範囲チェック
        if (fromIndex < 0 || fromIndex >= this.blocks.length || 
            toIndex < 0 || toIndex >= this.blocks.length) {
            return false;
        }
        
        // 同じ位置への移動は何もしない
        if (fromIndex === toIndex) {
            return true;
        }
        
        // ブロックを移動
        const block = this.blocks.splice(fromIndex, 1)[0];
        this.blocks.splice(toIndex, 0, block);
        return true;
    }

    /**
     * レシピ内の全ブロックを取得
     * @returns {Array} ブロックインスタンスの配列
     */
    getBlocks() {
        return this.blocks;
    }

    /**
     * 特定のIDのブロックを取得
     * @param {string} blockId - ブロックのID
     * @returns {Object|null} ブロックインスタンス、見つからない場合はnull
     */
    getBlockById(blockId) {
        return this.blocks.find(block => block.id === blockId) || null;
    }

    /**
     * ブロックのインデックスを取得
     * @param {string} blockId - ブロックのID
     * @returns {number} ブロックのインデックス、見つからない場合は-1
     */
    getBlockIndex(blockId) {
        return this.blocks.findIndex(block => block.id === blockId);
    }

    /**
     * レシピ名を変更
     * @param {string} newName - 新しいレシピ名
     */
    setName(newName) {
        this.name = newName;
    }

    /**
     * レシピ内のブロック数を取得
     * @returns {number} ブロック数
     */
    getBlockCount() {
        return this.blocks.length;
    }

    /**
     * レシピが空かどうかを確認
     * @returns {boolean} レシピが空の場合はtrue
     */
    isEmpty() {
        return this.blocks.length === 0;
    }
}
