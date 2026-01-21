import requests
import json
import os
import sys

from auth_test import get_header

# 定数の宣言
API_URL = os.environ.get("API_URL", "http://localhost:3030/api/")
TOKEN = os.environ.get("API_TOKEN", "mock-token")

headers = get_header(sys.argv, headers={"Authorization": f"Bearer {TOKEN}"})


def main():
    print("ミドルウェアAPIのテストを開始します...")
    try:
        test_get_middlewares()
    except Exception as e:
        print(f"エラーが発生しました: {e}")


def test_get_middlewares():
    print("\n--- GET /api/middlewares のテスト ---")
    res = requests.get(f"{API_URL}middlewares", headers=headers)
    assert (
        res.status_code == 200
    ), f"ミドルウェア一覧の取得に失敗しました: {res.status_code}"

    middlewares = res.json()
    assert isinstance(middlewares, list)
    print("ミドルウェア一覧を正常に取得しました。件数:", len(middlewares))

    if len(middlewares) > 0:
        print("取得したデータ(先頭1件):", json.dumps(middlewares[0], indent=2))

    return middlewares


if __name__ == "__main__":
    main()
