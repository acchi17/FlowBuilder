# Vue 3: setup() と data() の使い分け (Composition API vs Options API)

Vue 3では、コンポーネントのロジックを記述するために、主に2つのAPIスタイルが提供されています。

- **Options API:** Vue 2から続く伝統的なAPIスタイル。`data()`, `methods`, `computed`, `watch`, ライフサイクルフックなどをオプションとして定義します。
- **Composition API:** Vue 3で導入された新しいAPIスタイル。`setup()` 関数内でリアクティブな状態やロジックを組み合わせて定義します。

## 1. Options API (`data()` など)

### 特徴
- **直感的で学習しやすい:** Vueの基本的な概念（データ、メソッド、算出プロパティなど）が明確に分離されています。
- **構造化されている:** オプションごとにコードが整理されるため、小規模なコンポーネントやVue初学者にとっては理解しやすい構造です。
- **`this`コンテキスト:** メソッドや算出プロパティ内では `this` を通じてコンポーネントインスタンスのプロパティにアクセスします。

### `data()` の役割
- コンポーネントのリアクティブな状態（データ）を返す関数です。
- `data()` から返されたオブジェクトのプロパティは、Vueによってリアクティブシステムに組み込まれます。

### 例
```vue
<script>
export default {
  data() {
    return {
      message: 'Hello from Options API!',
      count: 0
    };
  },
  methods: {
    increment() {
      this.count++;
    }
  },
  computed: {
    doubledCount() {
      return this.count * 2;
    }
  },
  mounted() {
    console.log('Component mounted with count:', this.count);
  }
};
</script>
```

## 2. Composition API (`setup()`)

### 特徴
- **ロジックの集約と再利用:** 関連するロジック（状態、メソッド、算出プロパティなど）を機能単位でまとめて記述できます。これにより、複雑なコンポーネントでもコードの見通しが良くなり、ロジックの抽出や再利用（コンポーザブル関数）が容易になります。
- **TypeScriptとの親和性:** 型推論がより強力に機能し、型安全な開発をサポートします。
- **パフォーマンス:** より効率的な内部実装とツリーシェイキングの恩恵を受けやすいです。
- **明示的なリアクティビティ:** `ref` や `reactive` を使ってリアクティブな状態を明示的に作成します。

### `setup()` の役割
- Composition APIを使用するためのエントリーポイントとなる関数です。
- コンポーネントが作成される前に、`props` の解決後に実行されます。
- リアクティブな状態、算出プロパティ、メソッド、ライフサイクルフックなどを定義し、テンプレートで使用するものをオブジェクトとして返します。

### 例
```vue
<script>
import { ref, computed, onMounted } from 'vue';

export default {
  setup() {
    // リアクティブな状態
    const message = ref('Hello from Composition API!');
    const count = ref(0);

    // メソッド
    const increment = () => {
      count.value++;
    };

    // 算出プロパティ
    const doubledCount = computed(() => count.value * 2);

    // ライフサイクルフック
    onMounted(() => {
      console.log('Component mounted with count:', count.value);
    });

    // テンプレートに公開する値や関数
    return {
      message,
      count,
      increment,
      doubledCount
    };
  }
};
</script>
```

## 3. `setup()` は `data()` の上位互換か？

単純な「上位互換」というよりは、**異なるパラダイムを提供するもの**と理解するのが適切です。

- **Options API (`data()`):** 「オプション」ベース。コンポーネントの機能を種類（データ、メソッド、算出プロパティなど）ごとに整理します。
- **Composition API (`setup()`):** 「構成」ベース。関連するロジックを機能単位でまとめます。

`setup()` はより柔軟で強力な機能を提供しますが、Options APIのシンプルさや直感性が適している場面もあります。

## 4. 使い分けの指針

### Options API (`data()` など) が適している場面
- **小規模でシンプルなコンポーネント:** ロジックが複雑でなく、見通しが良い場合。
- **Vue初学者:** Options APIの方が概念を理解しやすいことがあります。
- **既存のVue 2プロジェクトの保守・改修:** コードベースの一貫性を保つため。
- **プロトタイピング:** 素早くアイデアを形にしたい場合。

### Composition API (`setup()`) が適している場面
- **中規模〜大規模で複雑なコンポーネント:** 多くのロジックや状態が絡み合う場合。
- **ロジックの再利用性を高めたい場合:** コンポーザブル関数としてロジックを抽出しやすいため。
- **TypeScriptを最大限に活用したい場合:** 型推論の恩恵をより受けられます。
- **パフォーマンスを重視する場合:** 特に大規模アプリケーションでのツリーシェイキングなど。
- **Vue 3の新しいプロジェクト:** VueチームはComposition APIを推奨しています。

## 結論

Vue 3では、プロジェクトの特性、コンポーネントの複雑さ、チームのスキルセットなどを考慮して、両方のAPIを適切に使い分けることができます。1つのプロジェクト内で両方のスタイルを混在させることも可能です。

新しいプロジェクトや複雑な機能開発ではComposition APIの利用が推奨されますが、Options APIも依然として有効な選択肢です。
