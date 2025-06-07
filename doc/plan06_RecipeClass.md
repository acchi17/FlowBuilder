# RecipeAreaの機能拡張計画

## 1. 概要
RecipeAreaコンポーネントに以下の機能を追加する：
- ブロックリストからドロップされたブロックをBlockクラスのインスタンスとして生成
- ブロックを上から下へ垂直に配置（ブロックフロー）
- ブロックフロー内でのドラッグ&ドロップによる順序入れ替え
- ブロックフローをRecipeクラスで管理

## 2. 新規作成するクラス

### 2.1 Recipeクラス (src/models/Recipe.js)
```javascript
class Recipe {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.blocks = [];  // Blockインスタンスの配列
    }

    // ブロックの追加
    addBlock(block) {
        this.blocks.push(block);
    }

    // ブロックの削除
    removeBlock(blockId) {
        this.blocks = this.blocks.filter(block => block.id !== blockId);
    }

    // ブロックの順序変更
    moveBlock(fromIndex, toIndex) {
        const block = this.blocks.splice(fromIndex, 1)[0];
        this.blocks.splice(toIndex, 0, block);
    }

    // レシピ内の全ブロックを取得
    getBlocks() {
        return this.blocks;
    }
}
```

## 3. RecipeArea.vueの変更点

### 3.1 データ構造の変更
```javascript
data() {
    return {
        recipe: null,  // Recipeインスタンス
    }
},
created() {
    // コンポーネント作成時にRecipeインスタンスを初期化
    this.recipe = new Recipe(uuidv4(), 'New Recipe');
}
```

### 3.2 ドロップ処理の変更
```javascript
onDrop(event) {
    const blockData = JSON.parse(event.dataTransfer.getData('application/json'));
    
    // Blockインスタンスの生成
    const newBlock = new Block(
        uuidv4(),
        blockData.name,
        blockData.description,
        blockData.scriptPath,
        this.$pythonService
    );
    
    // Recipeに追加
    this.recipe.addBlock(newBlock);
}
```

### 3.3 垂直配置のためのスタイル変更
```css
.blocks-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 10px;
}

.block-instance {
    position: relative;  /* absoluteから変更 */
    cursor: move;
}
```

### 3.4 ドラッグ&ドロップによる順序入れ替えの実装
```javascript
// ドラッグ開始時の処理
onDragStart(event, index) {
    event.dataTransfer.setData('text/plain', index);
},

// ドラッグ中の処理
onDragOver(event, index) {
    event.preventDefault();
    const draggingIndex = parseInt(event.dataTransfer.getData('text/plain'));
    if (draggingIndex !== index) {
        // ドラッグ中のブロックのスタイルを変更
    }
},

// ドロップ時の順序入れ替え
onDragDrop(event, toIndex) {
    const fromIndex = parseInt(event.dataTransfer.getData('text/plain'));
    this.recipe.moveBlock(fromIndex, toIndex);
}
```

## 4. 実装手順

1. Recipeクラスの作成
   - src/models/Recipe.jsファイルの作成
   - クラスの基本機能の実装

2. RecipeArea.vueの修正
   - データ構造をRecipeインスタンスベースに変更
   - ブロックの垂直配置のためのスタイル変更
   - ドロップ時のBlockインスタンス生成処理の実装
   - ドラッグ&ドロップによる順序入れ替え機能の実装

3. テスト項目
   - ブロックリストからのドロップでBlockインスタンスが正しく生成されるか
   - ブロックが垂直に配置されるか
   - ドラッグ&ドロップで順序入れ替えが正しく動作するか
   - Recipeクラスの各メソッドが期待通りに動作するか

## 5. 注意点

- Blockインスタンスの生成時に必要なパラメータ（scriptPath, pythonService）の受け渡しを適切に行う
- ドラッグ&ドロップ操作中のビジュアルフィードバックを適切に実装する
- ブロックの順序変更時にVueのリアクティビティを適切に維持する
- エラーハンドリングを適切に実装する

## 6. 将来の拡張性

- レシピの保存/読み込み機能
- レシピの実行機能（ブロックを順番に実行）
- ブロック間のパラメータ接続機能
- レシピの検証機能（ブロックの組み合わせが有効かチェック）
