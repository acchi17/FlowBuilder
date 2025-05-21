/**
 * パラメータの入力タイプを定義する定数
 * GUIでの表示方法を決定するために使用される
 */
export const InputControlType = {
    /** テキストボックス - 一般的なテキスト入力 */
    TEXT: 'text',
    
    /** コンボボックス - 選択肢からの選択 */
    COMBO: 'combo',
    
    /** 整数用スピンボタン - 整数値の入力 */
    INTEGER_SPINNER: 'integer-spinner',
    
    /** 実数用スピンボタン - 小数点を含む数値の入力 */
    FLOAT_SPINNER: 'float-spinner',
    
    /** チェックボックス - 真偽値の入力 */
    CHECKBOX: 'checkbox',
    
    /** 日付選択 - 日付の入力 */
    DATE: 'date',
    
    /** ファイル選択 - ファイルパスの入力 */
    FILE: 'file'
};
