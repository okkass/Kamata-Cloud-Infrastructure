import requests
import json
import sys
import uuid
import os

from auth_test import get_header

API_URL = os.environ.get("API_URL", "http://localhost:3030/api/")
TOKEN = os.environ.get("API_TOKEN", "mock-token")

headers = get_header(sys.argv, headers={"Authorization": f"Bearer {TOKEN}"})


def main():
    print("2. ノード一覧を取得する")
    test_get_nodes(headers=headers)

    print("3. ノードを新規作成する(通常)")
    new_node_data = {
        "ipAddress": "10.0.0.19",
        "rootPassword": "pass1919",
    }
    created_node = test_create_node(new_node_data, headers=headers)
    node_id = created_node["id"]
    print("4. 作成したノードをIDで取得する")
    test_get_node_by_id(node_id, headers=headers)
    print("Adminノードの作成")
    admin_node_data = {
        "ipAddress": "10.0.0.20",
        "rootPassword": "adminpass",
        "isAdmin": True,
    }
    admin_node = test_create_node(admin_node_data, headers=headers)
    admin_node_id = admin_node["id"]
    print("5. AdminノードをIDで取得する")
    test_get_node_by_id(admin_node_id, headers=headers)
    print("6. ノード情報を部分更新する(PATCH)")
    update_data = {
        "name": "Updated Node Name",
    }
    test_patch_node(node_id, update_data, headers=headers)
    print("7. ノード情報を完全更新する(PUT)")
    new_data = {
        "name": "Replaced Node Name",
        "isAdmin": False,
    }
    test_put_node(admin_node_id, new_data, headers=headers)

    print("8. ノードを削除する")
    test_delete_node(node_id, headers=headers)
    test_delete_node(admin_node_id, headers=headers)

    print("\n=== 存在しないリソースのテストを実行します ===")
    test_get_not_exist_node(headers=headers)
    test_patch_not_exist_node(headers=headers)
    test_put_not_exist_node(headers=headers)


def test_get_nodes(headers=None):
    res = requests.get(f"{API_URL}nodes", headers=headers)
    assert res.status_code == 200, res.status_code
    nodes = res.json()
    assert isinstance(nodes, list)

    print("Nodes:", json.dumps(nodes, indent=2))
    return nodes


def test_get_node_by_id(node_id, headers=None):
    res = requests.get(f"{API_URL}nodes/{node_id}", headers=headers)
    assert res.status_code == 200, res.status_code
    node = res.json()
    assert isinstance(node, dict)

    print(f"Node {node_id}:", json.dumps(node, indent=2))
    return node


def test_create_node(node_data, headers=None):
    res = requests.post(f"{API_URL}nodes", json=node_data, headers=headers)
    assert res.status_code == 201, res.status_code
    node = res.json()
    assert isinstance(node, dict)

    print("Created Node:", json.dumps(node, indent=2))
    return node


def test_patch_node(node_id, update_data, headers=None):
    res = requests.patch(f"{API_URL}nodes/{node_id}", json=update_data, headers=headers)
    assert res.status_code == 200, res.status_code
    node = res.json()
    assert isinstance(node, dict)

    print(f"Updated Node {node_id}:", json.dumps(node, indent=2))
    return node


def test_put_node(node_id, new_data, headers=None):
    res = requests.put(f"{API_URL}nodes/{node_id}", json=new_data, headers=headers)
    assert res.status_code == 200, res.status_code
    node = res.json()
    assert isinstance(node, dict)

    print(f"Replaced Node {node_id}:", json.dumps(node, indent=2))
    return node


def test_delete_node(node_id, headers=None):
    res = requests.delete(f"{API_URL}nodes/{node_id}", headers=headers)
    assert res.status_code == 204

    print(f"Deleted Node {node_id}")

    # 削除確認
    res_get = requests.get(f"{API_URL}nodes/{node_id}", headers=headers)
    assert (
        res_get.status_code == 404
    ), f"削除後にノードがまだ存在しています: {res_get.status_code}"
    print("ノードが削除されたことを確認しました (404)。")

    # 再度削除を試みて404が返ることを確認
    res_del_again = requests.delete(f"{API_URL}nodes/{node_id}", headers=headers)
    assert (
        res_del_again.status_code == 404
    ), f"存在しないノードの削除で404以外が返されました: {res_del_again.status_code}"
    print("存在しないノードの削除で404が返ることを確認しました。")

    return True


def test_get_not_exist_node(headers=None):
    not_exist_id = str(uuid.uuid4())
    print(f"\n--- GET /api/nodes/{not_exist_id} (存在しないID) のテスト ---")
    res = requests.get(f"{API_URL}nodes/{not_exist_id}", headers=headers)
    assert (
        res.status_code == 404
    ), f"存在しないノードの取得で404以外が返されました: {res.status_code}"
    print("存在しないノードの取得で404が返ることを確認しました。")


def test_patch_not_exist_node(headers=None):
    not_exist_id = str(uuid.uuid4())
    print(f"\n--- PATCH /api/nodes/{not_exist_id} (存在しないID) のテスト ---")
    payload = {"name": "ShouldNotExist"}
    res = requests.patch(
        f"{API_URL}nodes/{not_exist_id}", json=payload, headers=headers
    )
    assert (
        res.status_code == 404
    ), f"存在しないノードのPATCHで404以外が返されました: {res.status_code}"
    print("存在しないノードのPATCHで404が返ることを確認しました。")


def test_put_not_exist_node(headers=None):
    not_exist_id = str(uuid.uuid4())
    print(f"\n--- PUT /api/nodes/{not_exist_id} (存在しないID) のテスト ---")
    payload = {"name": "ShouldNotExist", "isAdmin": False}
    res = requests.put(f"{API_URL}nodes/{not_exist_id}", json=payload, headers=headers)
    assert (
        res.status_code == 404
    ), f"存在しないノードのPUTで404以外が返されました: {res.status_code}"
    print("存在しないノードのPUTで404が返ることを確認しました。")


if __name__ == "__main__":
    main()
