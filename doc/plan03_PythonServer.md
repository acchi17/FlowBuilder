# Pythonサーバー実装計画

## 1. 概要

FlowBuilderアプリケーションにおいて、ブロックやコンテナに対応するPythonスクリプトを実行するためのサーバーコンポーネントの実装計画です。

### 目的
- ブロックやコンテナに対応するPythonスクリプトを効率的に実行する
- スクリプトの動的ロードと実行を可能にする
- 高速な実行のためにプロセスを常駐させる

### 要件
- ユーザーが指定したディレクトリ内のPythonスクリプトを実行可能
- スクリプト名はブロックのオリジナル名と一致
- スクリプト内のexecute()メソッドを実行
- 実行結果を辞書型で返却

## 2. アーキテクチャ

### コンポーネント構成
1. Pythonサーバー（python_server.py）
   - WebSocketサーバーとして動作
   - スクリプトの動的ロードと実行を担当
   - 実行結果をJSON形式で返送

2. Node.js側マネージャー（PythonProcessManager.js）
   - Pythonサーバープロセスの起動と管理
   - WebSocketクライアントとして動作
   - 実行要求の送信と結果の受信を担当

### 通信フロー
1. Node.js側からスクリプトパスを指定して実行要求
2. Pythonサーバーがスクリプトを動的にロード
3. execute()メソッドを実行
4. 実行結果をJSON形式でNode.js側に返送

## 3. 実装詳細

### Pythonサーバー側実装

```python
# python_server.py
import importlib.util
import json
import websockets
import asyncio

class ScriptExecutor:
    def __init__(self, base_dir):
        """
        @param base_dir: スクリプトの基準ディレクトリ
        """
        self.base_dir = os.path.abspath(base_dir)

    def validate_script_path(self, script_path):
        """
        スクリプトパスのバリデーション
        @param script_path: 検証するスクリプトパス
        @return: (bool, str) 検証結果と、エラーメッセージ（エラーの場合）
        """
        # 絶対パスに変換
        abs_path = os.path.abspath(script_path)
        
        # 基準ディレクトリ配下のパスかチェック
        if not abs_path.startswith(self.base_dir):
            return False, "Script must be in the allowed directory"
        
        # ファイルの存在チェック
        if not os.path.isfile(abs_path):
            return False, "Script file not found"
        
        # .pyファイルかチェック
        if not abs_path.endswith('.py'):
            return False, "File must be a Python script"
        
        # 実行権限チェック
        if not os.access(abs_path, os.R_OK):
            return False, "Script is not readable"
        
        return True, None

    def load_and_execute(self, script_path):
        """
        スクリプトをロードして実行
        @param script_path: 実行するスクリプトパス
        @return: 実行結果
        """
        # パスのバリデーション
        is_valid, error_message = self.validate_script_path(script_path)
        if not is_valid:
            return {
                "status": "error",
                "message": error_message
            }

        try:
            # スクリプトファイルのパスからモジュールを動的にロード
            spec = importlib.util.spec_from_file_location("dynamic_module", script_path)
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
            
            # execute()メソッドを実行
            if hasattr(module, 'execute'):
                result = module.execute()
                return {
                    "status": "success",
                    "result": result
                }
            else:
                return {
                    "status": "error",
                    "message": "execute() method not found"
                }
        except Exception as e:
            return {
                "status": "error",
                "message": str(e)
            }

class PythonServer:
    def __init__(self, script_dir):
        """
        @param script_dir: スクリプトの基準ディレクトリ
        """
        self.executor = ScriptExecutor(script_dir)

    async def handle_request(self, websocket):
        """
        WebSocketリクエストのハンドラ
        @param websocket: WebSocketコネクション
        """
        async for message in websocket:
            try:
                # メッセージのパース
                data = json.loads(message)
                script_path = data.get("script_path")
                
                if not script_path:
                    await websocket.send(json.dumps({
                        "status": "error",
                        "message": "script_path is required"
                    }))
                    continue
                
                # スクリプトを実行
                result = self.executor.load_and_execute(script_path)
                
                # 結果を返送
                await websocket.send(json.dumps(result))
            
            except json.JSONDecodeError:
                await websocket.send(json.dumps({
                    "status": "error",
                    "message": "Invalid JSON format"
                }))
            except Exception as e:
                await websocket.send(json.dumps({
                    "status": "error",
                    "message": f"Unexpected error: {str(e)}"
                }))

    async def start(self, host="localhost", port=8765):
        """
        サーバーの起動
        @param host: ホスト名
        @param port: ポート番号
        """
        async with websockets.serve(self.handle_request, host, port):
        await asyncio.Future()  # run forever

if __name__ == "__main__":
    import sys
    if len(sys.argv) != 2:
        print("Usage: python python_server.py <script_dir>")
        sys.exit(1)
    
    script_dir = sys.argv[1]
    server = PythonServer(script_dir)
    asyncio.run(server.start())
```

### Node.js側実装

```javascript
// src/services/PythonProcessManager.js
class PythonProcessManager {
    constructor() {
        // Pythonプロセスの起動
        this.pythonProcess = child_process.spawn('python', ['python_server.py']);
        
        // WebSocket接続の確立
        this.ws = new WebSocket('ws://localhost:8765');
    }

    async executeScript(scriptPath) {
        return new Promise((resolve, reject) => {
            // スクリプトパスを送信
            this.ws.send(JSON.stringify({
                script_path: scriptPath
            }));

            // 結果を受信
            this.ws.once('message', (data) => {
                const result = JSON.parse(data);
                if (result.status === 'success') {
                    resolve(result.result);
                } else {
                    reject(new Error(result.message));
                }
            });
        });
    }
}
```

## 4. エラーハンドリング

### 想定されるエラー
1. スクリプトファイルが存在しない
2. スクリプト内にexecute()メソッドが存在しない
3. スクリプトの実行時エラー
4. WebSocket通信エラー

### エラー処理方針
- すべてのエラーは適切なエラーメッセージとともにNode.js側に返送
- Node.js側でエラーをキャッチしてユーザーに通知
- エラーログの記録と管理

## 5. セキュリティ考慮事項

### 実装時の注意点
1. スクリプトの実行権限の制限
   - 指定されたディレクトリ内のスクリプトのみ実行可能
   - システムコマンドの実行制限

2. 通信のセキュリティ
   - WebSocket接続はローカルホストのみに制限
   - 必要に応じて認証機能の追加

3. 入力値のバリデーション
   - スクリプトパスの検証
   - 実行結果のサニタイズ

### 今後の拡張性
1. スクリプト実行の並列処理対応
2. キャッシュ機能の追加による実行速度の向上
3. モニタリング機能の追加
