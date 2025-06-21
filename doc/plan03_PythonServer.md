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

## 6. パラメータと結果の受け渡し仕様

### パラメータの受け渡し

#### 基本方針
- JavaScriptからPythonへのパラメータは辞書型データ（JSONオブジェクト）として渡す
- パラメータ辞書には「パラメータ名:値」の組を可変個保持できる

#### JavaScript側の実装
```javascript
// PythonProcessManager.js
async executeScript(scriptPath, params = {}) {
    return new Promise((resolve, reject) => {
        // スクリプトパスとパラメータを送信
        this.ws.send(JSON.stringify({
            script_path: scriptPath,
            params: params  // パラメータ辞書
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

// Block.js
async executeInternal() {
    try {
        // 入力パラメータの収集
        const inputParams = {};
        this.parameters.inputs.forEach((param, paramId) => {
            inputParams[paramId] = param.value;
        });
        
        // スクリプトの実行（パラメータ辞書を渡す）
        const response = await window.pythonApi.executeScript(
            this.scriptPath,
            inputParams
        );
        
        // レスポンスの処理
        if (response.Result) {
            // 出力パラメータの設定
            if (response && typeof response === 'object') {
                Object.entries(response).forEach(([paramId, value]) => {
                    this.setParameterValue(paramId, value, 'outputs');
                });
            }
        } else {
            throw new Error(response.error || '不明なエラーが発生しました');
        }
    } catch (error) {
        throw new Error(`Pythonスクリプト実行エラー: ${error.message}`);
    }
}
```

#### Python側の実装
```python
# python_server.py
def load_and_execute(self, script_path, params=None):
    """
    スクリプトをロードして実行
    @param script_path: 実行するスクリプトパス
    @param params: スクリプトに渡すパラメータ辞書
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
        
        # execute()メソッドを実行（パラメータ辞書付き）
        if hasattr(module, 'execute'):
            # パラメータがある場合は辞書として渡す
            if params:
                result = module.execute(params)
            else:
                result = module.execute({})  # 空の辞書を渡す
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

# WebSocketハンドラの修正
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
            params = data.get("params", {})  # パラメータ辞書を取得
            
            if not script_path:
                await websocket.send(json.dumps({
                    "status": "error",
                    "message": "script_path is required"
                }))
                continue
            
            # スクリプトを実行（パラメータ辞書付き）
            result = self.executor.load_and_execute(script_path, params)
            
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
```

### Pythonスクリプトの実装例
```python
# BasicCalc.py
def add(a, b):
    return a + b

def subtract(a, b):
    return a - b

def multiply(a, b):
    return a * b

def divide(a, b):
    if b == 0:
        raise ValueError("Division by zero is not allowed")
    return a / b

def execute(params):
    """
    指定された演算を実行する
    
    @param params: パラメータを含む辞書
    @return: 演算結果を含む辞書
    """
    # 辞書からパラメータを取得（デフォルト値付き）
    operation = params.get("operation", "add")
    a = params.get("a", 1)
    b = params.get("b", 2)
    
    operations = {
        "add": add,
        "sub": subtract,
        "mul": multiply,
        "div": divide
    }
    
    if operation not in operations:
        return {
            "Result": False,  # 成功/失敗を示すResultキー
            "error": f"Unknown operation: {operation}",
            "available_operations": list(operations.keys())
        }
    
    try:
        result = operations[operation](a, b)
        return {
            "Result": True,  # 成功/失敗を示すResultキー
            "operation": operation,
            "a": a,
            "b": b,
            "result": result
        }
    except Exception as e:
        return {
            "Result": False,  # 成功/失敗を示すResultキー
            "operation": operation,
            "error": str(e)
        }
```

### 結果の受け渡し

#### 基本方針
- Pythonスクリプトからの出力は辞書型データとして返す
- 出力辞書には必ず`Result`キーを含め、スクリプトの成功/失敗を示す値を設定する
  - `Result: True` - スクリプトが正常に実行された場合
  - `Result: False` - エラーが発生した場合

#### 出力辞書の標準フォーマット
```python
# 成功時の出力例
{
    "Result": True,
    "operation": "add",
    "a": 5,
    "b": 3,
    "result": 8
}

# エラー時の出力例
{
    "Result": False,
    "operation": "div",
    "error": "Division by zero is not allowed"
}
```

#### 注意事項
1. すべてのPythonスクリプトは`execute`関数を実装し、辞書型のパラメータを受け取るようにする
2. すべての出力辞書には`Result`キーを含める
3. エラーが発生した場合は`Result: False`と`error`メッセージを含める
4. 成功した場合は`Result: True`と処理結果を含める

## 7. 移行ガイドライン

### 既存スクリプトの修正手順

1. `execute`関数のシグネチャを変更
   - 個別のパラメータではなく、辞書型の`params`を受け取るように変更
   - 例: `def execute(operation="add", a=1, b=2)` → `def execute(params)`

2. パラメータの取得方法を変更
   - 辞書から`get`メソッドを使ってパラメータを取得
   - デフォルト値を設定して、パラメータが省略された場合の動作を定義
   - 例: `operation = params.get("operation", "add")`

3. 出力辞書に`Result`キーを追加
   - 成功時は`"Result": True`
   - エラー時は`"Result": False`

4. 既存の`success`キーがある場合は、`Result`キーに置き換えるか、両方を維持

### JavaScript側の対応

1. `Block.js`の`executeInternal`メソッドを修正
   - パラメータを辞書型データとして整形
   - 出力の`Result`キーを確認して処理を分岐

2. エラーハンドリングの修正
   - `response.success`ではなく`response.Result`を確認
   - エラーメッセージの取得方法を適宜修正
