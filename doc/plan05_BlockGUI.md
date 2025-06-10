# ブロックGUI実装計画

## 1. 概要
RecipeArea.vueにドロップされたブロックの表示機能を実装する。

## 2. 要件
- ブロックがドロップされると、Block.jsで定義されているBlockクラスのインスタンスが生成され、対応するブロック矩形が表示される
- ブロック矩形の表示機能：
  1. 非選択時：「ブロック名」、「ブロック削除ボタン」を表示
  2. 選択時：ブロックの横幅が右方向に拡張され、以下を表示
     - 「ブロック名」
     - 「ブロック再生ボタン」
     - 「ブロック削除ボタン」
     - 「入力/出力パラメータ表示切替トグルボタン」
     - 「パラメータ名1」、「パラメータ名2」...
  3. 「入力/出力パラメータ表示切替トグルボタン」で、選択状態のブロック矩形に表示される各パラメータの入力/出力を切り替え
  4. ブロック選択状態で規定幅に全内容が表示しきれない場合、パラメータ関連の代わりに「...ボタン」を表示
  5. 「...ボタン」クリックでパラメータ一覧ダイアログを表示。「...ボタン」または他の要素クリックで非表示

## 3. コンポーネント構成

```mermaid
graph TD
    A[RecipeArea.vue] --> B[Block.vue]
    B --> C[BlockDialog.vue]
```

## 4. 各コンポーネントの実装詳細

### RecipeArea.vue の修正
```vue
- ドロップ時にBlockクラスのインスタンスを生成
- Block.vueコンポーネントの配置
- ブロック選択状態の管理（selectedBlockId）

data() {
  return {
    blocks: [], // Blockインスタンスの配列
    selectedBlockId: null
  }
}
```

### Block.vue の新規作成
```vue
props: {
  block: Object,     // Blockインスタンス
  isSelected: Boolean
}

data() {
  return {
    parameterMode: 'input',  // 'input' or 'output'
    showDialog: false,
    isOverflowing: false     // パラメータが表示幅を超えているか
  }
}

表示内容：
- 非選択時
  - ブロック名
  - 削除ボタン
- 選択時
  - ブロック名
  - 再生ボタン
  - 削除ボタン
  - パラメータ表示切替トグル
  - パラメータリスト（または...ボタン）
```

### BlockDialog.vue の新規作成
```vue
props: {
  block: Object,          // Blockインスタンス
  parameterMode: String,  // 'input' or 'output'
  show: Boolean
}

- モーダルダイアログスタイル
- パラメータ一覧表示
- クリックによる非表示
```

## 5. 主な機能の実装フロー

### ブロック選択機能
```mermaid
sequenceDiagram
    User->>Block.vue: クリック
    Block.vue->>RecipeArea.vue: select-block
    RecipeArea.vue->>RecipeArea.vue: selectedBlockId更新
```

### パラメータ表示制御
```mermaid
sequenceDiagram
    User->>Block.vue: トグルボタンクリック
    Block.vue->>Block.vue: parameterMode切り替え
    Block.vue->>Block.vue: パラメータ表示更新
```

### ダイアログ表示制御
```mermaid
sequenceDiagram
    User->>Block.vue: ...ボタンクリック
    Block.vue->>BlockDialog.vue: show=true
    User->>BlockDialog.vue: 外部クリック
    BlockDialog.vue->>Block.vue: close
    Block.vue->>BlockDialog.vue: show=false
```

## 6. スタイリング仕様

### Block.vue
```css
.block {
  display: flex;
  align-items: center;
  /* 非選択時は内容に合わせて幅を自動調整 */
  width: fit-content;
  max-width: 800px; /* 選択時の最大幅 */
  transition: width 0.3s; /* 幅変更時のアニメーション */
}
```

### BlockDialog.vue
```css
.block-dialog {
  width: 600px;
  /* パラメータ数に応じて高さを自動調整 */
  max-height: 80vh; /* ビューポートの80%を最大高さとする */
  overflow-y: auto; /* 必要に応じてスクロール可能に */
}
```

## 7. 実装手順

1. RecipeArea.vueの修正
   - Blockクラスのインスタンス生成処理
   - ブロック選択状態の管理

2. Block.vueの作成
   - 基本的なレイアウトと状態管理
   - パラメータ表示制御
   - オーバーフロー検出

3. BlockDialog.vueの作成
   - モーダルダイアログの実装
   - パラメータ一覧表示
