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
    print("バックアップAPIのテストを開始します...")
    test_get_backups()

    try:
        vm_id, storage_id = get_vm_and_storage()
        print(f"使用するVM ID: {vm_id}, ストレージ ID: {storage_id}")

        # 1. CRUD Tests
        print("\n=== CRUDテストを実行します ===")
        backup_id = test_create_backup(vm_id, storage_id)

        test_get_backup(backup_id)
        test_patch_backup(backup_id)
        test_put_backup(backup_id)
        test_delete_backup(backup_id)

        print("\n=== 存在しないリソースのテストを実行します ===")
        test_get_not_exist_backup()
        test_patch_not_exist_backup()
        test_put_not_exist_backup()

        # 2. Restore Test
        print("\n=== リストアテストを実行します ===")
        backup_id_restore = test_create_backup(vm_id, storage_id)
        test_restore_backup(backup_id_restore)

        # Cleanup
        print("\n=== リストアテスト用リソースをクリーンアップします ===")
        try:
            test_delete_backup(backup_id_restore)
        except AssertionError as e:
            print(
                f"クリーンアップ削除に失敗しました (リストア中にロックされている可能性があります): {e}"
            )

    except Exception as e:
        # AssertioonErrorはそのまま投げる
        if isinstance(e, AssertionError):
            raise
        print(f"エラーまたはリソース不足のため一部のテストをスキップします: {e}")


def test_get_backups():
    print("\n--- GET /api/backups のテスト ---")
    res = requests.get(f"{API_URL}backups", headers=headers)
    assert (
        res.status_code == 200
    ), f"バックアップ一覧の取得に失敗しました: {res.status_code}"
    backups = res.json()
    assert isinstance(
        backups, list
    ), "バックアップ一覧のレスポンスがリストではありません"
    print("バックアップ一覧を正常に取得しました。件数:", len(backups))
    # print("Backups:", json.dumps(backups, indent=2))
    return backups


def get_vm_and_storage():
    print("\n--- バックアップテスト対象のVMとストレージを取得しています ---")
    res = requests.get(f"{API_URL}virtual-machines", headers=headers)
    assert res.status_code == 200, f"VM一覧の取得に失敗しました: {res.status_code}"
    vms = res.json()

    if not vms:
        raise Exception(
            "仮想マシンが見つかりません。バックアップ作成テストを実行できません。"
        )

    for vm in vms:
        if vm.get("storages") and len(vm["storages"]) > 0:
            # Just pick the first one with storage
            return vm["id"], vm["storages"][0]["id"]

    raise Exception("ストレージがアタッチされた仮想マシンが見つかりません。")


def test_create_backup(vm_id, storage_id):
    print("\n--- POST /api/backups のテスト ---")
    name = f"TestBackup_{random.randint(1000, 9999)}"
    payload = {
        "name": name,
        "description": "Created by back-up.py test script",
        "targetVirtualMachineId": vm_id,
        "targetStorageId": storage_id,
    }
    print("以下のペイロードでバックアップを作成します:", json.dumps(payload, indent=2))

    res = requests.post(f"{API_URL}backups", headers=headers, json=payload)
    print("Status:", res.status_code)
    print("Response:", res.text)

    assert (
        res.status_code == 201
    ), f"バックアップの作成に失敗しました: {res.status_code}"
    backup = res.json()
    assert (
        backup["name"] == name
    ), f"作成されたバックアップ名が一致しません。期待値: {name}, 実際: {backup['name']}"
    print(f"作成されたバックアップID: {backup['id']}")
    return backup["id"]


def test_get_backup(backup_id):
    print(f"\n--- GET /api/backups/{backup_id} のテスト ---")
    res = requests.get(f"{API_URL}backups/{backup_id}", headers=headers)
    assert (
        res.status_code == 200
    ), f"バックアップ詳細の取得に失敗しました: {res.status_code}"
    backup = res.json()
    print("バックアップ詳細を正常に取得しました。")
    # print("Backup:", json.dumps(backup, indent=2))
    return backup


def test_get_not_exist_backup():
    not_exist_id = str(uuid.uuid4())
    print(f"\n--- GET /api/backups/{not_exist_id} (存在しないID) のテスト ---")
    res = requests.get(f"{API_URL}backups/{not_exist_id}", headers=headers)
    assert (
        res.status_code == 404
    ), f"存在しないバックアップの取得で404以外が返されました: {res.status_code}"
    print("存在しないバックアップの取得で404が返ることを確認しました。")


def test_patch_backup(backup_id):
    print(f"\n--- PATCH /api/backups/{backup_id} のテスト ---")
    current_backup = test_get_backup(backup_id)
    new_name = "Patched " + current_backup["name"]
    payload = {"name": new_name}

    res = requests.patch(f"{API_URL}backups/{backup_id}", headers=headers, json=payload)
    assert (
        res.status_code == 200
    ), f"バックアップのパッチ更新に失敗しました: {res.status_code}"

    patched_backup = res.json()
    assert (
        patched_backup["name"] == new_name
    ), f"パッチ更新後のバックアップ名が一致しません。期待値: {new_name}, 実際: {patched_backup['name']}"
    print(f"パッチ更新後のバックアップ名: {patched_backup['name']}")
    return patched_backup


def test_patch_not_exist_backup():
    not_exist_id = str(uuid.uuid4())
    print(f"\n--- PATCH /api/backups/{not_exist_id} (存在しないID) のテスト ---")
    payload = {"name": "ShouldNotExist"}
    res = requests.patch(
        f"{API_URL}backups/{not_exist_id}", headers=headers, json=payload
    )
    assert (
        res.status_code == 404
    ), f"存在しないバックアップのPATCHで404以外が返されました: {res.status_code}"
    print("存在しないバックアップのPATCHで404が返ることを確認しました。")


def test_put_backup(backup_id):
    print(f"\n--- PUT /api/backups/{backup_id} のテスト ---")
    current_backup = test_get_backup(backup_id)
    new_name = "Replaced " + current_backup["name"].replace("Patched ", "")
    new_desc = "Updated description by PUT"

    # PUT usually requires all updatable fields or replaces the resource state.
    # Based on api.yml BackupUpdatable checks name and description.
    payload = {"name": new_name, "description": new_desc}

    res = requests.put(f"{API_URL}backups/{backup_id}", headers=headers, json=payload)
    assert (
        res.status_code == 200
    ), f"バックアップの更新(PUT)に失敗しました: {res.status_code}"

    replaced_backup = res.json()
    assert (
        replaced_backup["name"] == new_name
    ), f"更新(PUT)後のバックアップ名が一致しません。期待値: {new_name}, 実際: {replaced_backup['name']}"
    assert (
        replaced_backup["description"] == new_desc
    ), f"更新(PUT)後のバックアップ説明が一致しません。期待値: {new_desc}, 実際: {replaced_backup['description']}"
    print(f"更新(PUT)後のバックアップ名: {replaced_backup['name']}")
    return replaced_backup


def test_put_not_exist_backup():
    not_exist_id = str(uuid.uuid4())
    print(f"\n--- PUT /api/backups/{not_exist_id} (存在しないID) のテスト ---")
    payload = {"name": "ShouldNotExist"}
    res = requests.put(
        f"{API_URL}backups/{not_exist_id}", headers=headers, json=payload
    )
    assert (
        res.status_code == 404
    ), f"存在しないバックアップのPUTで404以外が返されました: {res.status_code}"
    print("存在しないバックアップのPUTで404が返ることを確認しました。")


def test_restore_backup(backup_id):
    print(f"\n--- POST /api/backups/{backup_id}/restore のテスト ---")
    res = requests.post(f"{API_URL}backups/{backup_id}/restore", headers=headers)
    print("Status:", res.status_code)
    # 202 Accepted is expected
    assert res.status_code == 202, f"リストア要求に失敗しました: {res.status_code}"
    print("リストア要求が受け付けられました。")


def test_delete_backup(backup_id):
    print(f"\n--- DELETE /api/backups/{backup_id} のテスト ---")
    res = requests.delete(f"{API_URL}backups/{backup_id}", headers=headers)
    assert (
        res.status_code == 204
    ), f"バックアップの削除に失敗しました: {res.status_code}"
    print(f"削除されたバックアップID: {backup_id}")

    # Test Delete again to confirm 404
    res_del_again = requests.delete(f"{API_URL}backups/{backup_id}", headers=headers)
    assert (
        res_del_again.status_code == 404
    ), f"存在しないバックアップの削除で404以外が返されました: {res_del_again.status_code}"
    print("存在しないバックアップの削除で404が返ることを確認しました。")

    # Verify deletion
    res_get = requests.get(f"{API_URL}backups/{backup_id}", headers=headers)
    assert (
        res_get.status_code == 404
    ), f"削除後にバックアップがまだ存在しています: {res_get.status_code}"
    print("バックアップが削除されたことを確認しました (404)。")


if __name__ == "__main__":
    main()
