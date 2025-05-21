/**
 * 実行状態を表す列挙型
 */
export const ExecutionStatus = {
    /** 実行準備完了 */
    READY: 'ready',
    
    /** 実行中 */
    RUNNING: 'running',
    
    /** 実行完了 */
    COMPLETED: 'completed',
    
    /** エラー発生 */
    ERROR: 'error'
};
