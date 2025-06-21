import { InputControlType } from './InputControlType';
import ParameterConstraints from './ParameterConstraints';

/**
 * パラメータを表すクラス
 * 入力/出力パラメータの定義と値の管理を行う
 */
export default class Parameter {
    /**
     * パラメータを初期化
     * @param {Object} definition - パラメータの定義
     * @param {string} definition.name - パラメータ名
     * @param {string} definition.type - データ型
     * @param {boolean} [definition.required=false] - 必須かどうか
     * @param {string} [definition.description=''] - 説明
     * @param {*} [definition.value=null] - 初期値
     * @param {string} [definition.inputControl] - 入力コントロールの種類
     * @param {Object} [definition.constraints={}] - 制約条件
     */
    constructor(definition) {
        // 基本情報
        this.name = definition.name;
        this.type = definition.type;
        this.required = definition.required || false;
        this.description = definition.description || '';

        // 値の管理
        this.value = this.convertValueType(definition.value, this.type);
        this.initialValue = this.value;

        // GUI表示用の設定
        this.inputControl = definition.inputControl || this.determineInputControl(definition);
        
        // 制約条件の設定
        this.constraints = new ParameterConstraints(definition.constraints || {});
    }

    /**
     * 値を適切な型に変換する
     * @param {string|any} value - 変換する値
     * @param {string} type - データ型
     * @returns {any} 変換された値
     * @private
     */
    convertValueType(value, type) {
        if (value === undefined || value === null) {
            return null;
        }

        switch (type) {
            case 'integer':
                return parseInt(value, 10);
            case 'float':
            case 'double':
                return parseFloat(value);
            case 'boolean':
                return value === 'true' || value === true;
            default:
                return value;
        }
    }

    /**
     * パラメータの型に基づいて適切な入力コントロールを決定
     * @param {Object} definition - パラメータの定義
     * @returns {string} 入力コントロールの種類
     * @private
     */
    determineInputControl(definition) {
        // 型に基づいてデフォルトのコントロールを決定
        switch (definition.type) {
            case 'string':
                return definition.constraints?.choices?.length > 0 ? 
                    InputControlType.COMBO : InputControlType.TEXT;
            case 'integer':
                return InputControlType.INTEGER_SPINNER;
            case 'float':
            case 'double':
                return InputControlType.FLOAT_SPINNER;
            case 'boolean':
                return InputControlType.CHECKBOX;
            case 'date':
                return InputControlType.DATE;
            case 'file':
                return InputControlType.FILE;
            default:
                return InputControlType.TEXT;
        }
    }

    /**
     * パラメータの値を設定
     * @param {*} newValue - 新しい値
     * @returns {boolean} 値の設定が成功したかどうか
     */
    setValue(newValue) {
        // 型チェックなどのバリデーション
        if (this.validateValue(newValue)) {
            this.value = newValue;
            return true;
        }
        return false;
    }

    /**
     * 値を初期値にリセット
     */
    reset() {
        this.value = this.initialValue;
    }

    /**
     * 値のバリデーション
     * @param {*} value - チェックする値
     * @returns {boolean} 値が有効な場合はtrue
     */
    validateValue(value) {
        // nullチェック（必須パラメータの場合）
        if (value === null || value === undefined) {
            return !this.required;
        }

        // 型に応じたバリデーション
        switch (this.type) {
            case 'integer':
                if (!Number.isInteger(Number(value))) return false;
                return this.constraints.isInRange(Number(value));

            case 'float':
            case 'double':
                if (isNaN(Number(value))) return false;
                return this.constraints.isInRange(Number(value));

            case 'string':
                if (typeof value !== 'string') return false;
                return this.constraints.isValidLength(value) && 
                       this.constraints.matchesPattern(value) && 
                       this.constraints.isValidChoice(value);

            case 'boolean':
                return typeof value === 'boolean';

            case 'date':
                return value instanceof Date && !isNaN(value);

            case 'file':
                return typeof value === 'string' && this.constraints.isValidFileType(value);

            default:
                return true;
        }
    }

    /**
     * GUI表示用の情報を取得
     * @returns {Object} GUI表示用の情報
     */
    getDisplayInfo() {
        return {
            name: this.name,
            type: this.type,
            value: this.value,
            description: this.description,
            required: this.required,
            inputControl: this.inputControl,
            constraints: {
                minValue: this.constraints.minValue,
                maxValue: this.constraints.maxValue,
                step: this.constraints.step,
                choices: this.constraints.choices,
                maxLength: this.constraints.maxLength,
                pattern: this.constraints.pattern,
                fileTypes: this.constraints.fileTypes
            }
        };
    }
}
