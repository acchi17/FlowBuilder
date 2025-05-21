"""
テキスト処理スクリプト
基本的なテキスト処理操作を行うサンプルスクリプト
"""

def count_words(text):
    """
    テキスト内の単語数をカウントする
    """
    if not text:
        return 0
    words = text.split()
    return len(words)

def count_chars(text):
    """
    テキスト内の文字数をカウントする（スペースを含む）
    """
    return len(text) if text else 0

def to_uppercase(text):
    """
    テキストを大文字に変換する
    """
    return text.upper() if text else ""

def to_lowercase(text):
    """
    テキストを小文字に変換する
    """
    return text.lower() if text else ""

def execute(operation="count_words", text="Hello, world!"):
    """
    指定されたテキスト処理操作を実行する
    
    @param operation: 実行する操作（"count_words", "count_chars", "to_uppercase", "to_lowercase"）
    @param text: 処理するテキスト
    @return: 処理結果を含む辞書
    """
    operations = {
        "count_words": count_words,
        "count_chars": count_chars,
        "to_uppercase": to_uppercase,
        "to_lowercase": to_lowercase
    }
    
    if operation not in operations:
        return {
            "success": False,
            "error": f"Unknown operation: {operation}",
            "available_operations": list(operations.keys())
        }
    
    try:
        result = operations[operation](text)
        return {
            "success": True,
            "operation": operation,
            "text": text,
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
    sample_text = "The quick brown fox jumps over the lazy dog."
    print("Testing text processor script...")
    print(execute("count_words", sample_text))
    print(execute("count_chars", sample_text))
    print(execute("to_uppercase", sample_text))
    print(execute("to_lowercase", sample_text))
    print(execute("unknown", sample_text))
