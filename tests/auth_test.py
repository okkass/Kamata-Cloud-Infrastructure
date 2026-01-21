import requests
import json
import time

# 定数の宣言
API_URL = "http://localhost:3030/api/"

EMAIL = "all.admin@example.test"
PASSWORD = "my-strong-password"


# 認証に関する一連のテストを実行する関数
def main():
    print("1. ログインなしでAPIを叩く")
    res = requests.get(f"{API_URL}users")
    data = res.json()
    assert (
        res.status_code == 401
    ), res.status_code  # assertでステータスコードを確認(401以外ならここで止まる)
    print("Response:", json.dumps(data, indent=2))
    print("2. トークンを取得する")
    res = test_login()
    token = res["token"]  # resはPythonの辞書型として扱える
    ref_token = res["refreshToken"]
    print("3. 取得したトークンで認証を行う")
    headers = {"Authorization": f"Bearer {token}"}
    test_get_users(headers=headers)
    print("4. トークンの有効期限を切らす")
    time.sleep(40)  # 30秒だけど余裕を持って40秒待つ
    print("5. 有効期限切れのトークンで認証を行う")
    res = requests.get(f"{API_URL}users", headers=headers)
    assert (
        res.status_code == 401
    ), res.status_code  # assertでステータスコードを確認(401以外ならここで止まる)
    data = res.json()
    print("Response:", json.dumps(data, indent=2))
    print("6. リフレッシュトークンで新しいトークンを取得する")
    payload = {"refreshToken": ref_token}
    res = requests.post(f"{API_URL}auth/refresh", json=payload)
    assert res.status_code == 200, res.status_code
    data = res.json()
    print("Refresh Response:", json.dumps(data, indent=2))
    new_token = data["token"]
    print("7. 新しいトークンで認証を行う")
    new_headers = {"Authorization": f"Bearer {new_token}"}
    test_get_users(headers=new_headers)


def test_login():
    payload = {"email": EMAIL, "password": PASSWORD}
    res = requests.post(f"{API_URL}auth/login", json=payload)
    assert res.status_code == 200, res.status_code
    data = res.json()
    print("Login Response:", json.dumps(data, indent=2))
    return data


def get_header(args: list, headers=None):
    # headers が None の場合は必ず空の辞書を初期化して返す
    if headers is None:
        headers = {}

    if len(args) > 1 and args[1] == "db":
        token = test_login()
        headers["Authorization"] = f"Bearer {token['token']}"
    return headers


def test_get_users(headers=None):
    res = requests.get(f"{API_URL}users", headers=headers)
    assert res.status_code == 200, res.status_code
    users = res.json()
    assert isinstance(users, list)

    print("Users:", json.dumps(users, indent=2))
    return users


if __name__ == "__main__":
    main()
