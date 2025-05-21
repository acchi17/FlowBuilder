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
  - `prmType`（input/output）、`name`（英数字）、`dataType`、`ctrlType`、`default`、およびctrlTypeに応じた追加属性（min, max, step, maxLength, choices等）

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

## 5. ブロックリストの表示（UI例）

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

## 6. 実装イメージ（擬似コード）

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

## 備考

- ctrlTypeに応じてmin, max, step, maxLength, choices等の追加属性をparameterタグに柔軟に付与する
- 今後、ブロックの詳細情報やパラメータ編集UIへの拡張も可能
