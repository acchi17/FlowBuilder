"""
指定された演算を実行する

@param params: パラメータを含む辞書
@return: 演算結果を含む辞書
"""
def execute(paramDict):
    returnDict = {}
    returnDict["result"] = False
    try:
        ope = paramDict.get("operation")
        a = paramDict.get("a")
        b = paramDict.get("b")

        if (ope == None) or (a == None) or (b == None):
            return returnDict
        
        if (ope == "add"):
            res = a + b
        elif (ope == "sub"):
            res = a - b
        elif (ope == "mul"):
            res == a * b
        elif (ope == "div"):
            if b == 0:
                raise ValueError("Division by zero is not allowed")
            else:
                res = a / b
        else:
            return returnDict
        
        returnDict["Decimal"] = float(res)
        returnDict["result"] = True
    except Exception as e:
        print(f"Exceptiion: {e}")
    
    return returnDict
