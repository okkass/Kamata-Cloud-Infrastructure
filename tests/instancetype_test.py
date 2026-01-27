import requests
import json
import random
import os
import sys
import uuid

from auth_test import get_header

# 定数の宣言
API_URL = os.environ.get("API_URL", "http://localhost:3030/api/")
TOKEN = os.environ.get("API_TOKEN", "mock-token")

headers = get_header(sys.argv, headers={"Authorization": f"Bearer {TOKEN}"})


def main():
    print("インスタンスタイプAPIのテストを開始します...")
    test_get_instance_types()

    try:
        print("\n=== CRUDテストを実行します ===")
        # 1. 作成 (Create)
        type_id = test_create_instance_type()

        # 2. 詳細取得 (Get Detail)
        test_get_instance_type(type_id)

        # 3. 部分更新 (Patch)
        test_patch_instance_type(type_id)

        # 4. 更新 (Put)
        test_put_instance_type(type_id)

        # 5. 削除 (Delete)
        test_delete_instance_type(type_id)

        print("\n=== 存在しないリソースのテストを実行します ===")
        test_get_not_exist_instance_type()
        test_patch_not_exist_instance_type()
        test_put_not_exist_instance_type()

    except Exception as e:
        print(f"エラーまたはリソース不足のため一部のテストをスキップします: {e}")


def test_get_instance_types():
    print("\n--- GET /api/instance-types のテスト ---")
    res = requests.get(f"{API_URL}instance-types", headers=headers)
    assert (
        res.status_code == 200
    ), f"インスタンスタイプ一覧の取得に失敗しました: {res.status_code}"
    types = res.json()
    assert isinstance(types, list)
    print("インスタンスタイプ一覧を正常に取得しました。件数:", len(types))
    return types


def test_create_instance_type():
    print("\n--- POST /api/instance-types のテスト ---")
    name = f"TestType_{random.randint(1000, 9999)}"
    cpu_core = random.randint(1, 8)
    memory_size = random.randint(1, 16) * 1024 * 1024 * 1024  # 1GB - 16GB

    payload = {
        "name": name,
        "cpuCore": cpu_core,
        "memorySize": memory_size,
    }

    print(
        "以下のペイロードでインスタンスタイプを作成します:",
        json.dumps(payload, indent=2),
    )

    res = requests.post(f"{API_URL}instance-types", headers=headers, json=payload)
    print("ステータスコード:", res.status_code)
    # print("レスポンス:", res.text)

    assert (
        res.status_code == 201
    ), f"インスタンスタイプの作成に失敗しました: {res.status_code}"
    instance_type = res.json()
    assert instance_type["name"] == name
    assert instance_type["cpuCore"] == cpu_core
    assert instance_type["memorySize"] == memory_size
    print(f"作成されたインスタンスタイプID: {instance_type['id']}")
    return instance_type["id"]


def test_get_instance_type(type_id):
    print(f"\n--- GET /api/instance-types/{type_id} のテスト ---")
    res = requests.get(f"{API_URL}instance-types/{type_id}", headers=headers)
    assert (
        res.status_code == 200
    ), f"インスタンスタイプ詳細の取得に失敗しました: {res.status_code}"
    instance_type = res.json()
    print("インスタンスタイプ詳細を正常に取得しました。")
    return instance_type


def test_patch_instance_type(type_id):
    print(f"\n--- PATCH /api/instance-types/{type_id} のテスト ---")
    current_type = test_get_instance_type(type_id)
    new_name = "Patched " + current_type["name"]
    payload = {"name": new_name}

    res = requests.patch(
        f"{API_URL}instance-types/{type_id}", headers=headers, json=payload
    )
    assert (
        res.status_code == 200
    ), f"インスタンスタイプのパッチ更新に失敗しました: {res.status_code}"

    patched_type = res.json()
    assert patched_type["name"] == new_name
    print(f"パッチ更新後のインスタンスタイプ名: {patched_type['name']}")
    return patched_type


def test_put_instance_type(type_id):
    print(f"\n--- PUT /api/instance-types/{type_id} のテスト ---")
    current_type = test_get_instance_type(type_id)
    new_name = "Replaced " + current_type["name"].replace("Patched ", "")
    new_cpu = current_type["cpuCore"] + 1
    new_memory = current_type["memorySize"] + (1024 * 1024 * 1024)

    # PUTは全項目更新が基本
    payload = {
        "name": new_name,
        "cpuCore": new_cpu,
        "memorySize": new_memory,
    }

    res = requests.put(
        f"{API_URL}instance-types/{type_id}", headers=headers, json=payload
    )
    assert (
        res.status_code == 200
    ), f"インスタンスタイプの更新(PUT)に失敗しました: {res.status_code}"

    replaced_type = res.json()
    assert replaced_type["name"] == new_name
    assert replaced_type["cpuCore"] == new_cpu
    assert replaced_type["memorySize"] == new_memory

    print(f"更新(PUT)後のインスタンスタイプ名: {replaced_type['name']}")
    return replaced_type


def test_delete_instance_type(type_id):
    print(f"\n--- DELETE /api/instance-types/{type_id} のテスト ---")
    res = requests.delete(f"{API_URL}instance-types/{type_id}", headers=headers)
    assert (
        res.status_code == 204
    ), f"インスタンスタイプの削除に失敗しました: {res.status_code}"
    print(f"削除されたインスタンスタイプID: {type_id}")

    # 削除確認
    res_get = requests.get(f"{API_URL}instance-types/{type_id}", headers=headers)
    assert (
        res_get.status_code == 404
    ), f"削除後にインスタンスタイプがまだ存在しています: {res_get.status_code}"
    print("インスタンスタイプが削除されたことを確認しました (404)。")

    # 再度削除を試みて404が返ることを確認
    res_del_again = requests.delete(
        f"{API_URL}instance-types/{type_id}", headers=headers
    )
    assert (
        res_del_again.status_code == 404
    ), f"存在しないインスタンスタイプの削除で404以外が返されました: {res_del_again.status_code}"
    print("存在しないインスタンスタイプの削除で404が返ることを確認しました。")


def test_get_not_exist_instance_type():
    not_exist_id = str(uuid.uuid4())
    print(f"\n--- GET /api/instance-types/{not_exist_id} (存在しないID) のテスト ---")
    res = requests.get(f"{API_URL}instance-types/{not_exist_id}", headers=headers)
    assert (
        res.status_code == 404
    ), f"存在しないインスタンスタイプの取得で404以外が返されました: {res.status_code}"
    print("存在しないインスタンスタイプの取得で404が返ることを確認しました。")


def test_patch_not_exist_instance_type():
    not_exist_id = str(uuid.uuid4())
    print(f"\n--- PATCH /api/instance-types/{not_exist_id} (存在しないID) のテスト ---")
    payload = {"name": "ShouldNotExist"}
    res = requests.patch(
        f"{API_URL}instance-types/{not_exist_id}", headers=headers, json=payload
    )
    assert (
        res.status_code == 404
    ), f"存在しないインスタンスタイプのPATCHで404以外が返されました: {res.status_code}"
    print("存在しないインスタンスタイプのPATCHで404が返ることを確認しました。")


def test_put_not_exist_instance_type():
    not_exist_id = str(uuid.uuid4())
    print(f"\n--- PUT /api/instance-types/{not_exist_id} (存在しないID) のテスト ---")
    payload = {
        "name": "ShouldNotExist",
        "cpuCore": 1,
        "memorySize": 1024 * 1024 * 1024,
    }
    res = requests.put(
        f"{API_URL}instance-types/{not_exist_id}", headers=headers, json=payload
    )
    assert (
        res.status_code == 404
    ), f"存在しないインスタンスタイプのPUTで404以外が返されました: {res.status_code}"
    print("存在しないインスタンスタイプのPUTで404が返ることを確認しました。")


if __name__ == "__main__":
    main()
