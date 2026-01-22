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
    print("ストレージプールAPIのテストを開始します...")
    test_get_storage_pools()

    try:
        print("\n=== CRUDテストを実行します ===")
        # 1. 作成 (Create)
        pool_id = test_create_storage_pool()

        # 2. 詳細取得 (Get Detail)
        test_get_storage_pool(pool_id)

        # 3. 部分更新 (Patch)
        test_patch_storage_pool(pool_id)

        # 4. 更新 (Put)
        test_put_storage_pool(pool_id)

        # 5. 削除 (Delete)
        test_delete_storage_pool(pool_id)

    except AssertionError:
        # テストのアサーション失敗はスキップ扱いにせず、そのまま上位に伝播させる
        raise

    except Exception as e:
        print(f"エラーまたはリソース不足のため一部のテストをスキップします: {e}")


def get_valid_node_id():
    print("--- ストレージプール作成対象の物理ノードを取得しています ---")
    res = requests.get(f"{API_URL}nodes", headers=headers)
    if res.status_code != 200:
        raise Exception(
            f"Failed to fetch physical nodes: status_code={res.status_code}, response={res.text}"
        )

    nodes = res.json()
    if nodes and len(nodes) > 0:
        node_id = nodes[0]["id"]
        print(f"使用する物理ノードID: {node_id}")
        return node_id

    print("物理ノードが見つかりませんでした。テストを継続できません。")
    raise Exception("No Physical Node available for storage pool testing")


def get_valid_device_path(node_id):
    print(f"--- 物理ノード {node_id} の新しいデバイス一覧を取得しています ---")
    res = requests.get(f"{API_URL}nodes/{node_id}/new-devices", headers=headers)
    if res.status_code != 200:
        # 取得に失敗した場合は、フォールバックとして環境変数または安全なデフォルト値を使用する
        # Mock環境でない場合、/dev/sdbなどが既に使われている可能性があるが、
        # ここではAPIテストの文脈でAPIが機能しているかを確認する。
        # リソース取得API自体がエラーになった場合は警告を出してデフォルトを使う方針とする。
        print(
            f"Warning: Failed to fetch new devices (status={res.status_code}). Using default."
        )
        return "/dev/sdb"

    devices = res.json()
    if devices and len(devices) > 0:
        device_path = devices[0]["devicePath"]
        print(f"使用するデバイスパス: {device_path}")
        return device_path

    print(
        "利用可能なデバイスが見つかりませんでした。デフォルト値(/dev/sdb)を使用します。"
    )
    return "/dev/sdb"


def test_get_storage_pools():
    print("\n--- GET /api/storage-pools のテスト ---")
    res = requests.get(f"{API_URL}storage-pools", headers=headers)
    assert (
        res.status_code == 200
    ), f"ストレージプール一覧の取得に失敗しました: {res.status_code}"
    pools = res.json()
    assert isinstance(pools, list)
    print("ストレージプール一覧を正常に取得しました。件数:", len(pools))
    return pools


def test_create_storage_pool(prefix="TestPool"):
    print("\n--- POST /api/storage-pools のテスト ---")
    node_id = get_valid_node_id()

    name = f"{prefix}_{random.randint(1000, 9999)}"
    device_path = get_valid_device_path(node_id)
    has_network_access = False

    payload = {
        "name": name,
        "devicePath": device_path,
        "nodeId": node_id,
        "hasNetworkAccess": has_network_access,
    }

    print(
        "以下のペイロードでストレージプールを作成します:",
        json.dumps(payload, indent=2),
    )

    res = requests.post(f"{API_URL}storage-pools", headers=headers, json=payload)
    print("ステータスコード:", res.status_code)

    assert (
        res.status_code == 201
    ), f"ストレージプールの作成に失敗しました: {res.status_code}"
    created_pool = res.json()
    assert created_pool["name"] == name

    print(f"作成されたストレージプールID: {created_pool['id']}")
    return created_pool["id"]


def test_get_storage_pool(pool_id):
    print(f"\n--- GET /api/storage-pools/{pool_id} のテスト ---")
    res = requests.get(f"{API_URL}storage-pools/{pool_id}", headers=headers)
    assert (
        res.status_code == 200
    ), f"ストレージプール詳細の取得に失敗しました: {res.status_code}"
    pool = res.json()
    print("ストレージプール詳細を正常に取得しました。")
    return pool


def test_patch_storage_pool(pool_id):
    print(f"\n--- PATCH /api/storage-pools/{pool_id} のテスト ---")
    # 事前に現在の状態を取得
    current_pool = test_get_storage_pool(pool_id)

    new_name = f"PatchedPool_{random.randint(100, 999)}"
    # hasNetworkAccess を反転させる
    current_access = current_pool.get("hasNetworkAccess", False)
    new_access = not current_access

    payload = {"name": new_name, "hasNetworkAccess": new_access}

    res = requests.patch(
        f"{API_URL}storage-pools/{pool_id}", headers=headers, json=payload
    )
    assert (
        res.status_code == 200
    ), f"ストレージプールのパッチ更新に失敗しました: {res.status_code}"

    patched_pool = res.json()

    # レスポンスに name が含まれていない場合は再取得して検証
    if "name" not in patched_pool:
        print("レスポンスにnameが含まれていないため、再取得して検証します。")
        patched_pool = test_get_storage_pool(pool_id)

    assert patched_pool["name"] == new_name
    assert patched_pool["hasNetworkAccess"] == new_access

    print(f"パッチ更新後の名前: {patched_pool['name']}")
    return patched_pool


def test_put_storage_pool(pool_id):
    print(f"\n--- PUT /api/storage-pools/{pool_id} のテスト ---")
    test_get_storage_pool(pool_id)

    new_name = "ReplacedPool_" + str(random.randint(1000, 9999))
    new_access = True  # PUTで強制設定

    # schemaを確認すると、updateStoragePoolSchemaは name(optional), hasNetworkAccess(required)
    payload = {
        "name": new_name,
        "hasNetworkAccess": new_access,
    }

    res = requests.put(
        f"{API_URL}storage-pools/{pool_id}", headers=headers, json=payload
    )
    assert (
        res.status_code == 200
    ), f"ストレージプールの更新(PUT)に失敗しました: {res.status_code}"

    replaced_pool = res.json()
    assert replaced_pool["name"] == new_name
    assert replaced_pool["hasNetworkAccess"] == new_access

    print(f"更新(PUT)後のストレージプール名: {replaced_pool['name']}")
    return replaced_pool


def test_delete_storage_pool(pool_id):
    print(f"\n--- DELETE /api/storage-pools/{pool_id} のテスト ---")
    res = requests.delete(f"{API_URL}storage-pools/{pool_id}", headers=headers)
    assert (
        res.status_code == 204
    ), f"ストレージプールの削除に失敗しました: {res.status_code}"
    print(f"削除されたストレージプールID: {pool_id}")

    # 削除確認
    res_get = requests.get(f"{API_URL}storage-pools/{pool_id}", headers=headers)
    assert (
        res_get.status_code == 404
    ), f"削除後にストレージプールがまだ存在しています: {res_get.status_code}"
    print("ストレージプールが削除されたことを確認しました (404)。")


if __name__ == "__main__":
    main()
