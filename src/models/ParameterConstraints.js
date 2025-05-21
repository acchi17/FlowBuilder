/**
 * パラメータの制約条件を管理するクラス
 * 数値の範囲、選択肢、文字列の長さなどの制約を定義する
 */
export default class ParameterConstraints {
    /**
     * パラメータの制約条件を初期化
     * @param {Object} options - 制約条件のオプション
     * @param {number} [options.minValue] - 数値の最小値
     * @param {number} [options.maxValue] - 数値の最大値
     * @param {number} [options.step] - 数値の増減ステップ
     * @param {Array<string>} [options.choices] - 選択肢の配列
     * @param {number} [options.maxLength] - 文字列の最大長
     * @param {string} [options.pattern] - 入力パターン（正規表現）
     * @param {Array<string>} [options.fileTypes] - 許可するファイル拡張子
     */
    constructor(options = {}) {
        // 数値の範囲制約
        this.minValue = options.minValue;
        this.maxValue = options.maxValue;
        this.step = options.step;

        // コンボボックスの選択肢
        this.choices = options.choices || [];

        // 文字列の制約
        this.maxLength = options.maxLength;
        this.pattern = options.pattern;  // 正規表現パターン

        // ファイルの制約
        this.fileTypes = options.fileTypes || [];  // 許可するファイル拡張子
    }

    /**
     * 数値が範囲内かどうかを検証
     * @param {number} value - 検証する値
     * @returns {boolean} 範囲内の場合はtrue
     */
    isInRange(value) {
        if (typeof value !== 'number') return false;
        
        if (this.minValue !== undefined && value < this.minValue) {
            return false;
        }
        
        if (this.maxValue !== undefined && value > this.maxValue) {
            return false;
        }
        
        return true;
    }

    /**
     * 選択肢に含まれるかどうかを検証
     * @param {string} value - 検証する値
     * @returns {boolean} 選択肢に含まれる場合はtrue
     */
    isValidChoice(value) {
        return this.choices.length === 0 || this.choices.includes(value);
    }

    /**
     * 文字列の長さが制約を満たすかどうかを検証
     * @param {string} value - 検証する文字列
     * @returns {boolean} 制約を満たす場合はtrue
     */
    isValidLength(value) {
        if (typeof value !== 'string') return false;
        return this.maxLength === undefined || value.length <= this.maxLength;
    }

    /**
     * 文字列がパターンに一致するかどうかを検証
     * @param {string} value - 検証する文字列
     * @returns {boolean} パターンに一致する場合はtrue
     */
    matchesPattern(value) {
        if (typeof value !== 'string') return false;
        return this.pattern === undefined || new RegExp(this.pattern).test(value);
    }

    /**
     * ファイル拡張子が許可されているかどうかを検証
     * @param {string} filePath - 検証するファイルパス
     * @returns {boolean} 拡張子が許可されている場合はtrue
     */
    isValidFileType(filePath) {
        if (typeof filePath !== 'string') return false;
        if (this.fileTypes.length === 0) return true;
        
        const extension = filePath.split('.').pop().toLowerCase();
        return this.fileTypes.includes(extension);
    }
}
