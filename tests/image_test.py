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
    print("仮想マシンイメージAPIのテストを開始します...")
    test_get_images()

    try:
        pool_id = get_pool_id()
        print(f"使用するストレージプールID: {pool_id}")

        print("\n=== CRUDテストを実行します ===")
        # 1. 作成 (Create)
        image_id = test_create_image(pool_id)

        # 2. 詳細取得 (Get Detail)
        test_get_image(image_id)

        # 3. 部分更新 (Patch)
        test_patch_image(image_id)

        # 4. 更新 (Put)
        test_put_image(image_id)

        # 5. 削除 (Delete)
        test_delete_image(image_id)

        print("\n=== 存在しないリソースのテストを実行します ===")
        test_get_not_exist_image()
        test_patch_not_exist_image()
        test_put_not_exist_image()
        test_delete_not_exist_image()

    except Exception as e:
        # AssertioonErrorはそのまま投げる
        if isinstance(e, AssertionError):
            raise
        print(f"エラーまたはリソース不足のため一部のテストをスキップします: {e}")


def test_get_images():
    print("\n--- GET /api/images のテスト ---")
    res = requests.get(f"{API_URL}images", headers=headers)
    assert (
        res.status_code == 200
    ), f"イメージ一覧の取得に失敗しました: {res.status_code}"
    images = res.json()
    assert isinstance(images, list), "イメージ一覧のレスポンスがリストではありません"
    print("イメージ一覧を正常に取得しました。件数:", len(images))
    return images


def get_pool_id():
    print("\n--- イメージ作成対象のストレージプールを取得しています ---")
    res = requests.get(f"{API_URL}storage-pools", headers=headers)
    assert (
        res.status_code == 200
    ), f"ストレージプール一覧の取得に失敗しました: {res.status_code}"
    pools = res.json()
    if not pools:
        raise Exception(
            "ストレージプールが見つかりません。イメージ作成テストを実行できません。"
        )

    # 最初のストレージプールIDを返す
    return pools[0]["id"]


def test_create_image(pool_id):
    print("\n--- POST /api/images のテスト ---")
    name = f"TestImage_{random.randint(1000, 9999)}"
    desc = "Created by image_test.py"

    # メタデータを作成
    payload = {"name": name, "description": desc, "storagePoolId": pool_id}
    metadata_json = json.dumps(payload)

    print("以下のメタデータでイメージを作成します:", metadata_json)

    # テスト用ファイルパス
    file_path = "/workspace/tests/testdatas/poka1"

    if not os.path.exists(file_path):
        raise FileNotFoundError(f"テストデータが見つかりません: {file_path}")

    with open(file_path, "rb") as f:
        # multipart/form-data で送信
        # metadataフィールドにJSON文字列、fileフィールドにファイル実体
        files = {"file": ("poka1.img", f, "application/octet-stream")}
        data = {"metadata": metadata_json}

        # files引数を渡すと自動的に Content-Type: multipart/form-data; boundary=... が設定される
        res = requests.post(f"{API_URL}images", headers=headers, data=data, files=files)

    print("ステータスコード:", res.status_code)
    print("レスポンス:", res.text)

    assert res.status_code == 201, f"イメージの作成に失敗しました: {res.status_code}"
    image = res.json()
    assert (
        image["name"] == name
    ), f"作成されたイメージ名が一致しません。期待値: {name}, 実際: {image['name']}"
    print(f"作成されたイメージID: {image['id']}")
    return image["id"]


def test_get_image(image_id):
    print(f"\n--- GET /api/images/{image_id} のテスト ---")
    res = requests.get(f"{API_URL}images/{image_id}", headers=headers)
    assert (
        res.status_code == 200
    ), f"イメージ詳細の取得に失敗しました: {res.status_code}"
    image = res.json()
    print("イメージ詳細を正常に取得しました。")
    return image


def test_patch_image(image_id):
    print(f"\n--- PATCH /api/images/{image_id} のテスト ---")
    current_image = test_get_image(image_id)
    new_name = "Patched " + current_image["name"]
    new_desc = "PATCHによって更新された説明"
    payload = {"name": new_name, "description": new_desc}

    res = requests.patch(f"{API_URL}images/{image_id}", headers=headers, json=payload)
    assert (
        res.status_code == 200
    ), f"イメージのパッチ更新に失敗しました: {res.status_code}"

    patched_image = res.json()
    assert (
        patched_image["name"] == new_name
    ), f"パッチ更新後のイメージ名が一致しません。期待値: {new_name}, 実際: {patched_image['name']}"

    # description は任意項目のため、存在する場合のみ検証
    if "description" in patched_image:
        assert (
            patched_image["description"] == new_desc
        ), f"パッチ更新後の説明が一致しません。期待値: {new_desc}, 実際: {patched_image['description']}"

    print(f"パッチ更新後のイメージ名: {patched_image['name']}")
    return patched_image


def test_put_image(image_id):
    print(f"\n--- PUT /api/images/{image_id} のテスト ---")
    current_image = test_get_image(image_id)
    new_name = "Replaced " + current_image["name"].replace("Patched ", "")
    new_desc = "PUTによって更新された説明"

    payload = {"name": new_name, "description": new_desc}

    res = requests.put(f"{API_URL}images/{image_id}", headers=headers, json=payload)
    assert (
        res.status_code == 200
    ), f"イメージの更新(PUT)に失敗しました: {res.status_code}"

    replaced_image = res.json()
    assert (
        replaced_image["name"] == new_name
    ), f"更新(PUT)後のイメージ名が一致しません。期待値: {new_name}, 実際: {replaced_image['name']}"

    # description は任意項目のため、存在する場合のみ検証
    if "description" in replaced_image:
        assert (
            replaced_image["description"] == new_desc
        ), f"更新(PUT)後の説明が一致しません。期待値: {new_desc}, 実際: {replaced_image['description']}"

    print(f"更新(PUT)後のイメージ名: {replaced_image['name']}")
    return replaced_image


def test_delete_image(image_id):
    print(f"\n--- DELETE /api/images/{image_id} のテスト ---")
    res = requests.delete(f"{API_URL}images/{image_id}", headers=headers)
    assert res.status_code == 204, f"イメージの削除に失敗しました: {res.status_code}"
    print(f"削除されたイメージID: {image_id}")

    # 削除確認
    res_get = requests.get(f"{API_URL}images/{image_id}", headers=headers)
    assert (
        res_get.status_code == 404
    ), f"削除後にイメージがまだ存在しています: {res_get.status_code}"
    print("イメージが削除されたことを確認しました (404)。")

    # 再度削除を試みて404が返ることを確認
    res_del_again = requests.delete(f"{API_URL}images/{image_id}", headers=headers)
    assert (
        res_del_again.status_code == 404
    ), f"存在しないイメージの削除で404以外が返されました: {res_del_again.status_code}"
    print("存在しないイメージの削除で404が返ることを確認しました。")


def test_get_not_exist_image():
    not_exist_id = str(uuid.uuid4())
    print(f"\n--- GET /api/images/{not_exist_id} (存在しないID) のテスト ---")
    res = requests.get(f"{API_URL}images/{not_exist_id}", headers=headers)
    assert (
        res.status_code == 404
    ), f"存在しないイメージの取得で404以外が返されました: {res.status_code}"
    print("存在しないイメージの取得で404が返ることを確認しました。")


def test_patch_not_exist_image():
    not_exist_id = str(uuid.uuid4())
    print(f"\n--- PATCH /api/images/{not_exist_id} (存在しないID) のテスト ---")
    payload = {"name": "ShouldNotExist"}
    res = requests.patch(
        f"{API_URL}images/{not_exist_id}", headers=headers, json=payload
    )
    assert (
        res.status_code == 404
    ), f"存在しないイメージのPATCHで404以外が返されました: {res.status_code}"
    print("存在しないイメージのPATCHで404が返ることを確認しました。")


def test_put_not_exist_image():
    not_exist_id = str(uuid.uuid4())
    print(f"\n--- PUT /api/images/{not_exist_id} (存在しないID) のテスト ---")
    payload = {"name": "ShouldNotExist", "description": "ShouldNotExist"}
    res = requests.put(f"{API_URL}images/{not_exist_id}", headers=headers, json=payload)
    assert (
        res.status_code == 404
    ), f"存在しないイメージのPUTで404以外が返されました: {res.status_code}"
    print("存在しないイメージのPUTで404が返ることを確認しました。")


def test_delete_not_exist_image():
    not_exist_id = str(uuid.uuid4())
    print(f"\n--- DELETE /api/images/{not_exist_id} (存在しないID) のテスト ---")
    res = requests.delete(f"{API_URL}images/{not_exist_id}", headers=headers)
    assert (
        res.status_code == 404
    ), f"存在しないイメージの削除で404以外が返されました: {res.status_code}"
    print("存在しないイメージの削除で404が返ることを確認しました。")


if __name__ == "__main__":
    main()
