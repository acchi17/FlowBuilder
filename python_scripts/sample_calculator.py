"""
サンプル計算スクリプト
基本的な算術演算を行うサンプルスクリプト
"""

def add(a, b):
    """
    2つの数値を加算する
    """
    return a + b

def subtract(a, b):
    """
    2つの数値を減算する
    """
    return a - b

def multiply(a, b):
    """
    2つの数値を乗算する
    """
    return a * b

def divide(a, b):
    """
    2つの数値を除算する
    """
    if b == 0:
        raise ValueError("Division by zero is not allowed")
    return a / b

def execute(operation="add", a=1, b=2):
    """
    指定された演算を実行する
    
    @param operation: 実行する演算（"add", "subtract", "multiply", "divide"）
    @param a: 最初のオペランド
    @param b: 2番目のオペランド
    @return: 演算結果を含む辞書
    """
    operations = {
        "add": add,
        "subtract": subtract,
        "multiply": multiply,
        "divide": divide
    }
    
    if operation not in operations:
        return {
            "success": False,
            "error": f"Unknown operation: {operation}",
            "available_operations": list(operations.keys())
        }
    
    try:
        result = operations[operation](a, b)
        return {
            "success": True,
            "operation": operation,
            "a": a,
            "b": b,
            "result": result
        }
    except Exception as e:
        return {
            "success": False,
            "operation": operation,
            "error": str(e)
        }

# スクリプトが直接実行された場合のテスト
if __name__ == "__main__":
    print("Testing calculator script...")
    print(execute("add", 5, 3))
    print(execute("subtract", 10, 4))
    print(execute("multiply", 6, 7))
    print(execute("divide", 20, 5))
    print(execute("divide", 10, 0))
    print(execute("unknown", 1, 1))
