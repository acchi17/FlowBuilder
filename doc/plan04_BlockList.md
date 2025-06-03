# Blockリスト表示機能 実装計画

## 1. XMLフォーマット例

```xml
<root>
  <category name="math">
    <block name="add">
      <command>sample_calculator</command>
      <parameter
        prmType="input"
        name="a"
        dataType="float"
        ctrlType="float_spinner"
        default="0"
        min="0"
        max="100"
        step="0.1"
      />
      <parameter
        prmType="input"
        name="b"
        dataType="float"
        ctrlType="float_spinner"
        default="0"
        min="0"
        max="100"
        step="0.1"
      />
      <parameter
        prmType="output"
        name="result"
        dataType="float"
        ctrlType="float_spinner"
        default="0"
      />
    </block>
  </category>

  <category name="string">
    <block name="concat">
      <command>text_processor</command>
      <parameter
        prmType="input"
        name="str1"
        dataType="string"
        ctrlType="text"
        default=""
        maxLength="100"
      />
      <parameter
        prmType="input"
        name="str2"
        dataType="string"
        ctrlType="text"
        default=""
        maxLength="100"
      />
      <parameter
        prmType="output"
        name="result"
        dataType="string"
        ctrlType="text"
        default=""
      />
    </block>
  </category>

  <category name="color">
    <block name="select_color">
      <command>color_picker</command>
      <parameter
        prmType="input"
        name="color"
        dataType="string"
        ctrlType="combo"
        default="red"
        choices="red,green,blue,yellow"
      />
      <parameter
        prmType="output"
        name="result"
        dataType="string"
        ctrlType="text"
        default=""
      />
    </block>
  </category>
</root>
```

- `category`タグでカテゴリ分け
- `block`タグでブロック定義
- `command`タグで対応するPythonスクリプト名（拡張子なし）
- `parameter`タグでパラメータ定義
  - `prmType`（input/output）、`name`（英数字）、`dataType`、`ctrlType`、`default`、およびctrlTypeに応じた追加属性（min, max, step, maxLength, items等）

---

## 2. XMLファイルの配置

- 上記XMLファイルを`public/blocks.xml`として配置

---

## 3. XMLファイルの読み込み・パース

- BlockArea.vueの`mounted`フックで`fetch('/blocks.xml')`を使いXMLファイルを取得
- 取得したXMLテキストを`DOMParser`でパース
- ルート要素から`category`タグをすべて取得
- 各`category`内の`block`タグを走査し、`block`の`name`属性を抽出
- 必要に応じてカテゴリ名も保持

---

## 4. データ構造

- `categories: [{ name: string, blocks: [{ name: string }] }]` のような配列で保持

---

## 5. ブロックリスト表示の実装イメージ

```html
<div v-for="category in categories" :key="category.name">
  <h3>{{ category.name }}</h3>
  <ul>
    <li v-for="block in category.blocks" :key="block.name">
      {{ block.name }}
    </li>
  </ul>
</div>
```

---

## 6. XMLファイルの読み込み・パースの実装イメージ

```js
data() {
  return {
    categories: []
  }
},
mounted() {
  fetch('/blocks.xml')
    .then(res => res.text())
    .then(xmlStr => {
      const parser = new DOMParser();
      const xml = parser.parseFromString(xmlStr, 'application/xml');
      const categoryNodes = xml.querySelectorAll('category');
      this.categories = Array.from(categoryNodes).map(cat => ({
        name: cat.getAttribute('name'),
        blocks: Array.from(cat.querySelectorAll('block')).map(block => ({
          name: block.getAttribute('name')
        }))
      }));
    });
}
```

---

## 7. エラーハンドリング

- XMLの取得やパースに失敗した場合はエラーメッセージを表示

---

## 8. カテゴリ折りたたみ機能

### データ構造の拡張
```js
data() {
  return {
    categories: [
      {
        name: string,
        isExpanded: boolean,  // 追加：カテゴリの展開状態
        blocks: [{ name: string }]
      }
    ]
  }
}
```

### カテゴリ表示のUI拡張
```html
<div v-for="category in categories" :key="category.name">
  <h3 @click="toggleCategory(category)">
    {{ category.name }}
    <span class="toggle-icon">{{ category.isExpanded ? '▼' : '▶' }}</span>
  </h3>
  <transition name="slide">
    <ul v-show="category.isExpanded">
      <li v-for="block in category.blocks" :key="block.name"
          draggable="true"
          @dragstart="onDragStart($event, block)">
        {{ block.name }}
      </li>
    </ul>
  </transition>
</div>
```

### スタイル拡張
```css
.toggle-icon {
  font-size: 0.8em;
  margin-left: 8px;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
```

---

## 9. ドラッグ&ドロップ機能

### BlockArea.vueの拡張

#### データ転送処理
```js
methods: {
  onDragStart(event, block) {
    // ドラッグするブロックの情報をDataTransferオブジェクトに設定
    const blockData = {
      name: block.name,
      category: block.category,
      // XMLから取得した完全なブロック情報を含める
      parameters: block.parameters,
      command: block.command
    };
    event.dataTransfer.setData('application/json', JSON.stringify(blockData));
  }
}
```

### RecipeArea.vueの拡張

#### ドロップ領域の設定
```html
<template>
  <div class="recipe-area"
       @dragover.prevent
       @drop="onDrop">
    <div class="blocks-container">
      <!-- ドロップされたブロックのインスタンスを表示 -->
      <div v-for="block in blocks" :key="block.id" class="block-instance">
        {{ block.name }}
      </div>
    </div>
  </div>
</template>
```

#### ブロックインスタンス管理
```js
import { Block } from '@/models/Block';

export default {
  name: 'RecipeArea',
  data() {
    return {
      blocks: []  // ドロップされたブロックのインスタンスを管理
    }
  },
  methods: {
    onDrop(event) {
      const blockData = JSON.parse(event.dataTransfer.getData('application/json'));
      
      // 新しいブロックインスタンスを生成
      const newBlock = new Block({
        name: blockData.name,
        parameters: blockData.parameters,
        command: blockData.command,
        position: {
          x: event.offsetX,
          y: event.offsetY
        }
      });
      
      this.blocks.push(newBlock);
    }
  }
}
```

### スタイル拡張
```css
.blocks-container {
  min-height: 100%;
  position: relative;
}

.block-instance {
  position: absolute;
  padding: 10px;
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
```

---

## 10. 実装の注意点

### カテゴリ折りたたみ機能
- 初期状態ですべてのカテゴリを格納状態にする
- アニメーション効果は必要に応じて調整可能
- トグルアイコンはCSSで実装することも可能

### ドラッグ&ドロップ機能
- ドラッグ中のビジュアルフィードバックを提供
- ドロップ可能な領域を視覚的に明確化
- ブロックインスタンスの重複チェックを実装
- ドロップ位置の計算時にスクロール位置を考慮

### エラーハンドリング
- ドラッグ&ドロップ操作中のエラー処理
- 無効なブロックデータのチェック
- インスタンス生成失敗時の処理

---

## 備考

- ctrlTypeに応じてmin, max, step, maxLength, choices等の追加属性をparameterタグに柔軟に付与する
- 今後、ブロックの詳細情報やパラメータ編集UIへの拡張も可能
