# Electronアプリケーション改善計画

## 1. [DEP0128] DeprecationWarning: Invalid 'main' field の解決

### 問題
- `npm run electron:serve` 実行時に以下の警告が表示される
  ```
  [DEP0128] DeprecationWarning: Invalid 'main' field in '\\?\C:\Users\grf31\work\electron_study\FlowBuilder\dist_electron\package.json' of 'background.js'.
  ```
- `dist_electron/background.js` が生成されていない

### 原因
- `vue.config.js` に `pluginOptions.electronBuilder.mainProcessFile` の指定がないため、ビルド時に `src/background.js` が正しく処理されていない可能性がある

### 対策
1. **vue.config.jsにmainProcessFileを明示的に追加**
    ```js
    module.exports = {
      pluginOptions: {
        electronBuilder: {
          mainProcessFile: 'src/background.js'
        }
      }
    }
    ```

2. **設定追加後の手順**
    - `vue.config.js` を保存した後、`npm run electron:serve` を再実行
    - これで `dist_electron/background.js` が生成されるはず

3. **それでも生成されない場合**
    - `vue-cli-plugin-electron-builder` のバージョンが古い場合や、他の設定に問題がある可能性
    - その場合は、`vue.config.js` の全文と `package.json` の `devDependencies` のelectron関連部分を確認

## 2. config.jsonのパス指定について

### 注意点
- JSONファイル内のパス指定では、バックスラッシュ（\）を使う場合は2重にエスケープする必要がある
  - NG: `"pythonDir": "C:\Users\username\Python"`
  - OK: `"pythonDir": "C:\\Users\\username\\Python"`
  - または: `"pythonDir": "C:/Users/username/Python"`（推奨）
