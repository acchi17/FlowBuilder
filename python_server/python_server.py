import importlib.util
import json
import websockets
import asyncio
import os
import sys

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

    def load_and_execute(self, script_path, params=None):
        """
        スクリプトをロードして実行
        @param script_path: 実行するスクリプトパス
        @param params: スクリプトに渡すパラメータ
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
                params = data.get("params", {})
                
                if not script_path:
                    await websocket.send(json.dumps({
                        "status": "error",
                        "message": "script_path is required"
                    }))
                    continue
                
                # スクリプトを実行（パラメータ付き）
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

    async def start(self, host="localhost", port=8765):
        """
        サーバーの起動
        @param host: ホスト名
        @param port: ポート番号
        """
        async with websockets.serve(self.handle_request, host, port):
            await asyncio.Future()  # run forever

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python python_server.py <script_dir>")
        sys.exit(1)
    
    script_dir = sys.argv[1]
    server = PythonServer(script_dir)
    asyncio.run(server.start())
