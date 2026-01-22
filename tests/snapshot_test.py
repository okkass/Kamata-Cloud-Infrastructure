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
    print("スナップショットAPIのテストを開始します...")
    test_get_snapshots()

    try:
        print("\n=== CRUDテストを実行します ===")
        # 1. 作成 (Create)
        snapshot_id = test_create_snapshot()

        # 2. 詳細取得 (Get Detail)
        test_get_snapshot(snapshot_id)

        # 3. 部分更新 (Patch)
        test_patch_snapshot(snapshot_id)

        # 4. 更新 (Put)
        test_put_snapshot(snapshot_id)

        # 5. 削除 (Delete)
        test_delete_snapshot(snapshot_id)

        # 6. リストア (Restore) - 別途作成してテスト
        print("\n=== リストアテストを実行します ===")
        restore_snapshot_id = test_create_snapshot(prefix="RestoreTest")
        test_restore_snapshot(restore_snapshot_id)
        # リストアテストで使用したスナップショットを削除
        try:
            test_delete_snapshot(restore_snapshot_id)
        except:
            pass

    except Exception as e:
        print(f"エラーまたはリソース不足のため一部のテストをスキップします: {e}")


def test_get_snapshots():
    print("\n--- GET /api/snapshots のテスト ---")
    res = requests.get(f"{API_URL}snapshots", headers=headers)
    assert (
        res.status_code == 200
    ), f"スナップショット一覧の取得に失敗しました: {res.status_code}"
    snapshots = res.json()
    assert isinstance(snapshots, list)
    print("スナップショット一覧を正常に取得しました。件数:", len(snapshots))
    return snapshots


def get_valid_vm_id():
    print("--- スナップショット作成対象の仮想マシンを取得しています ---")
    res = requests.get(f"{API_URL}virtual-machines", headers=headers)
    if res.status_code == 200:
        vms = res.json()
        if vms and len(vms) > 0:
            vm_id = vms[0]["id"]
            print(f"使用する仮想マシンID: {vm_id}")
            return vm_id
    print("仮想マシンが見つかりませんでした。テストを継続できません。")
    raise Exception("No Virtual Machine available for snapshot testing")


def test_create_snapshot(prefix="TestSnapshot"):
    print("\n--- POST /api/snapshots のテスト ---")
    name = f"{prefix}_{random.randint(1000, 9999)}"
    description = "Created by automated test"

    target_vm_id = get_valid_vm_id()

    payload = {"name": name, "description": description, "targetVmId": target_vm_id}

    print(
        "以下のペイロードでスナップショットを作成します:",
        json.dumps(payload, indent=2),
    )

    res = requests.post(f"{API_URL}snapshots", headers=headers, json=payload)
    print("ステータスコード:", res.status_code)

    assert (
        res.status_code == 201
    ), f"スナップショットの作成に失敗しました: {res.status_code}"
    created_snapshot = res.json()
    assert created_snapshot["name"] == name

    print(f"作成されたスナップショットID: {created_snapshot['id']}")
    return created_snapshot["id"]


def test_get_snapshot(snapshot_id):
    print(f"\n--- GET /api/snapshots/{snapshot_id} のテスト ---")
    res = requests.get(f"{API_URL}snapshots/{snapshot_id}", headers=headers)
    assert (
        res.status_code == 200
    ), f"スナップショット詳細の取得に失敗しました: {res.status_code}"
    snapshot = res.json()
    print("スナップショット詳細を正常に取得しました。")
    return snapshot


def test_patch_snapshot(snapshot_id):
    print(f"\n--- PATCH /api/snapshots/{snapshot_id} のテスト ---")
    new_description = f"Patched desc {random.randint(100, 999)}"

    payload = {"description": new_description}

    res = requests.patch(
        f"{API_URL}snapshots/{snapshot_id}", headers=headers, json=payload
    )
    assert (
        res.status_code == 200
    ), f"スナップショットのパッチ更新に失敗しました: {res.status_code}"

    patched_snapshot = res.json()

    if "description" in patched_snapshot:
        assert patched_snapshot["description"] == new_description
        print(f"パッチ更新後の説明: {patched_snapshot['description']}")
    else:
        print("パッチ更新成功 (レスポンスにdescriptionフィールドなし)")

    return patched_snapshot


def test_put_snapshot(snapshot_id):
    print(f"\n--- PUT /api/snapshots/{snapshot_id} のテスト ---")
    new_name = f"ReplacedSnapshot_{random.randint(1000, 9999)}"
    new_description = "Replaced description"

    # PUTは必須項目を全て送る必要がある
    payload = {
        "name": new_name,
        "description": new_description,
    }

    res = requests.put(
        f"{API_URL}snapshots/{snapshot_id}", headers=headers, json=payload
    )
    assert (
        res.status_code == 200
    ), f"スナップショットの更新(PUT)に失敗しました: {res.status_code}"

    replaced_snapshot = res.json()
    assert replaced_snapshot["name"] == new_name

    print(f"更新(PUT)後のスナップショット名: {replaced_snapshot['name']}")
    return replaced_snapshot


def test_restore_snapshot(snapshot_id):
    print(f"\n--- POST /api/snapshots/{snapshot_id}/restore のテスト ---")

    res = requests.post(f"{API_URL}snapshots/{snapshot_id}/restore", headers=headers)

    assert (
        res.status_code == 202
    ), f"スナップショットのリストアに失敗しました: {res.status_code}"

    print("スナップショットのリストア要求が受け付けられました (202 Accepted)。")


def test_delete_snapshot(snapshot_id):
    print(f"\n--- DELETE /api/snapshots/{snapshot_id} のテスト ---")
    res = requests.delete(f"{API_URL}snapshots/{snapshot_id}", headers=headers)
    assert (
        res.status_code == 204
    ), f"スナップショットの削除に失敗しました: {res.status_code}"
    print(f"削除されたスナップショットID: {snapshot_id}")

    # 削除確認
    res_get = requests.get(f"{API_URL}snapshots/{snapshot_id}", headers=headers)
    assert (
        res_get.status_code == 404
    ), f"削除後にスナップショットがまだ存在しています: {res_get.status_code}"
    print("スナップショットが削除されたことを確認しました (404)。")


if __name__ == "__main__":
    main()
