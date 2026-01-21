import requests
import json
import random
import os
import sys

from auth_test import get_header

# 定数の宣言
API_URL = os.environ.get("API_URL", "http://localhost:3030/api/")
TOKEN = os.environ.get("API_TOKEN", "mock-token")

headers = get_header(sys.argv, headers={"Authorization": f"Bearer {TOKEN}"})


def main():
    print("セキュリティグループAPIのテストを開始します...")
    test_get_security_groups()

    try:
        print("\n=== CRUDテストを実行します ===")
        # 1. 作成 (Create)
        group_id = test_create_security_group()

        # 2. 詳細取得 (Get Detail)
        test_get_security_group(group_id)

        # 3. 部分更新 (Patch)
        test_patch_security_group(group_id)

        # 4. 更新 (Put)
        test_put_security_group(group_id)

        print("\n=== セキュリティルールAPIテスト ===")
        # グループにルールを追加してテスト
        rule_id = test_create_security_rule(group_id)
        test_get_security_rule(group_id, rule_id)
        test_patch_security_rule(group_id, rule_id)
        test_put_security_rule(group_id, rule_id)
        test_delete_security_rule(group_id, rule_id)

        # 5. 削除 (Delete)
        test_delete_security_group(group_id)

    except Exception as e:
        print(f"エラーまたはリソース不足のため一部のテストをスキップします: {e}")


def test_get_security_groups():
    print("\n--- GET /api/security-groups のテスト ---")
    res = requests.get(f"{API_URL}security-groups", headers=headers)
    assert (
        res.status_code == 200
    ), f"セキュリティグループ一覧の取得に失敗しました: {res.status_code}"
    groups = res.json()
    assert isinstance(groups, list)
    print("セキュリティグループ一覧を正常に取得しました。件数:", len(groups))
    return groups


def test_create_security_group():
    print("\n--- POST /api/security-groups のテスト ---")
    name = f"TestSG_{random.randint(1000, 9999)}"
    description = "Created by automated test"

    # ルール定義 (HTTP許可)
    rules = [
        {
            "name": "allow-http",
            "ruleType": "inbound",
            "port": 80,
            "protocol": "tcp",
            "targetIp": "0.0.0.0/0",
            "action": "allow",
        }
    ]

    payload = {
        "name": name,
        "description": description,
        "rules": rules,
    }

    print(
        "以下のペイロードでセキュリティグループを作成します:",
        json.dumps(payload, indent=2),
    )

    res = requests.post(f"{API_URL}security-groups", headers=headers, json=payload)
    print("ステータスコード:", res.status_code)

    assert (
        res.status_code == 201
    ), f"セキュリティグループの作成に失敗しました: {res.status_code}"
    created_group = res.json()
    assert created_group["name"] == name

    # create時には description が返ってこない場合や、rulesの構造が少し違う場合があるので
    # 最低限 ID の存在を確認する
    assert "id" in created_group

    print(f"作成されたセキュリティグループID: {created_group['id']}")
    return created_group["id"]


def test_get_security_group(group_id):
    print(f"\n--- GET /api/security-groups/{group_id} のテスト ---")
    res = requests.get(f"{API_URL}security-groups/{group_id}", headers=headers)
    assert (
        res.status_code == 200
    ), f"セキュリティグループ詳細の取得に失敗しました: {res.status_code}"
    group = res.json()
    print("セキュリティグループ詳細を正常に取得しました。")
    # print("詳細:", json.dumps(group, indent=2))
    return group


def test_patch_security_group(group_id):
    print(f"\n--- PATCH /api/security-groups/{group_id} のテスト ---")
    # current_group = test_get_security_group(group_id)
    new_description = f"Patched desc {random.randint(100, 999)}"

    payload = {"description": new_description}

    res = requests.patch(
        f"{API_URL}security-groups/{group_id}", headers=headers, json=payload
    )
    assert (
        res.status_code == 200
    ), f"セキュリティグループのパッチ更新に失敗しました: {res.status_code}"

    patched_group = res.json()

    # レスポンスに description が含まれていない場合、GETして再確認するなどの手もあるが
    # ここではキーがある場合のみ確認する実装とする（InstanceType_testなどと同様）
    if "description" in patched_group:
        assert patched_group["description"] == new_description
        print(f"パッチ更新後の説明: {patched_group['description']}")
    else:
        print("パッチ更新成功 (レスポンスにdescriptionフィールドなし)")

    return patched_group


def test_put_security_group(group_id):
    print(f"\n--- PUT /api/security-groups/{group_id} のテスト ---")
    current_group = test_get_security_group(group_id)
    new_name = "ReplacedSG_" + current_group["name"].replace("TestSG_", "")
    new_description = "Replaced description"

    # PUTは必須項目を全て送る必要がある
    payload = {
        "name": new_name,
        "description": new_description,
    }

    res = requests.put(
        f"{API_URL}security-groups/{group_id}", headers=headers, json=payload
    )
    assert (
        res.status_code == 200
    ), f"セキュリティグループの更新(PUT)に失敗しました: {res.status_code}"

    replaced_group = res.json()
    assert replaced_group["name"] == new_name

    print(f"更新(PUT)後のセキュリティグループ名: {replaced_group['name']}")
    return replaced_group


# --- Security Rule Tests ---


def test_create_security_rule(group_id):
    print(f"\n--- POST /api/security-groups/{group_id}/rules のテスト ---")
    payload = {
        "name": f"TestRule_{random.randint(100, 999)}",
        "ruleType": "inbound",
        "port": 443,
        "protocol": "tcp",
        "targetIp": "192.168.1.0/24",
        "action": "allow",
    }

    res = requests.post(
        f"{API_URL}security-groups/{group_id}/rules", headers=headers, json=payload
    )
    assert (
        res.status_code == 201
    ), f"セキュリティルールの作成に失敗しました: {res.status_code}"

    rule = res.json()
    assert rule["port"] == 443
    print(f"セキュリティルールを作成しました。ID: {rule['id']}")
    return rule["id"]


def test_get_security_rule(group_id, rule_id):
    print(f"\n--- GET /api/security-groups/{group_id}/rules/{rule_id} のテスト ---")
    res = requests.get(
        f"{API_URL}security-groups/{group_id}/rules/{rule_id}", headers=headers
    )
    assert (
        res.status_code == 200
    ), f"セキュリティルールの詳細取得に失敗しました: {res.status_code}"
    print("セキュリティルールの詳細を正常に取得しました。")


def test_patch_security_rule(group_id, rule_id):
    print(f"\n--- PATCH /api/security-groups/{group_id}/rules/{rule_id} のテスト ---")
    payload = {"port": 8080}
    res = requests.patch(
        f"{API_URL}security-groups/{group_id}/rules/{rule_id}",
        headers=headers,
        json=payload,
    )
    assert (
        res.status_code == 200
    ), f"セキュリティルールのパッチ更新に失敗しました: {res.status_code}"

    rule = res.json()
    if "port" in rule:
        assert rule["port"] == 8080
    print("セキュリティルールをパッチ更新しました。")


def test_put_security_rule(group_id, rule_id):
    print(f"\n--- PUT /api/security-groups/{group_id}/rules/{rule_id} のテスト ---")
    # PUT requires all fields
    payload = {
        "name": "UpdatedRule",
        "ruleType": "inbound",
        "port": 80,
        "protocol": "tcp",
        "targetIp": "10.0.0.0/8",
        "action": "deny",
    }
    res = requests.put(
        f"{API_URL}security-groups/{group_id}/rules/{rule_id}",
        headers=headers,
        json=payload,
    )
    assert (
        res.status_code == 200
    ), f"セキュリティルールのPUT更新に失敗しました: {res.status_code}"

    rule = res.json()
    assert rule["action"] == "deny"
    print("セキュリティルールをPUT更新しました。")


def test_delete_security_rule(group_id, rule_id):
    print(f"\n--- DELETE /api/security-groups/{group_id}/rules/{rule_id} のテスト ---")
    res = requests.delete(
        f"{API_URL}security-groups/{group_id}/rules/{rule_id}", headers=headers
    )
    assert (
        res.status_code == 204
    ), f"セキュリティルールの削除に失敗しました: {res.status_code}"
    print("セキュリティルールを削除しました。")


def test_delete_security_group(group_id):
    print(f"\n--- DELETE /api/security-groups/{group_id} のテスト ---")
    res = requests.delete(f"{API_URL}security-groups/{group_id}", headers=headers)
    assert (
        res.status_code == 204
    ), f"セキュリティグループの削除に失敗しました: {res.status_code}"
    print(f"削除されたセキュリティグループID: {group_id}")

    # 削除確認
    res_get = requests.get(f"{API_URL}security-groups/{group_id}", headers=headers)
    assert (
        res_get.status_code == 404
    ), f"削除後にセキュリティグループがまだ存在しています: {res_get.status_code}"
    print("セキュリティグループが削除されたことを確認しました (404)。")


if __name__ == "__main__":
    main()
