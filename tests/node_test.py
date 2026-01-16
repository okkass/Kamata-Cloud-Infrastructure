from auth_test import test_login
import requests
import json


def main():
    print("1. ログインしてトークンを取得する")
    res = test_login()
    token = res["token"]
    headers = {"Authorization": f"Bearer {token}"}

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


def test_get_nodes(headers=None):
    res = requests.get("http://localhost:3030/api/nodes", headers=headers)
    assert res.status_code == 200, res.status_code
    nodes = res.json()
    assert isinstance(nodes, list)

    print("Nodes:", json.dumps(nodes, indent=2))
    return nodes


def test_get_node_by_id(node_id, headers=None):
    res = requests.get(f"http://localhost:3030/api/nodes/{node_id}", headers=headers)
    assert res.status_code == 200, res.status_code
    node = res.json()
    assert isinstance(node, dict)

    print(f"Node {node_id}:", json.dumps(node, indent=2))
    return node


def test_create_node(node_data, headers=None):
    res = requests.post(
        "http://localhost:3030/api/nodes", json=node_data, headers=headers
    )
    assert res.status_code == 201, res.status_code
    node = res.json()
    assert isinstance(node, dict)

    print("Created Node:", json.dumps(node, indent=2))
    return node


def test_patch_node(node_id, update_data, headers=None):
    res = requests.patch(
        f"http://localhost:3030/api/nodes/{node_id}", json=update_data, headers=headers
    )
    assert res.status_code == 200, res.status_code
    node = res.json()
    assert isinstance(node, dict)

    print(f"Updated Node {node_id}:", json.dumps(node, indent=2))
    return node


def test_put_node(node_id, new_data, headers=None):
    res = requests.put(
        f"http://localhost:3030/api/nodes/{node_id}", json=new_data, headers=headers
    )
    assert res.status_code == 200, res.status_code
    node = res.json()
    assert isinstance(node, dict)

    print(f"Replaced Node {node_id}:", json.dumps(node, indent=2))
    return node


def test_delete_node(node_id, headers=None):
    res = requests.delete(f"http://localhost:3030/api/nodes/{node_id}", headers=headers)
    assert res.status_code == 204

    print(f"Deleted Node {node_id}")
    return True


if __name__ == "__main__":
    main()
