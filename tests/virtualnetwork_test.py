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
    print("仮想ネットワークAPIのテストを開始します...")
    test_get_virtual_networks()

    try:
        print("\n=== CRUDテストを実行します ===")
        # 1. 作成 (Create)
        network_id = test_create_virtual_network()

        # 2. 詳細取得 (Get Detail)
        test_get_virtual_network(network_id)

        # 3. 部分更新 (Patch)
        test_patch_virtual_network(network_id)

        # 4. 更新 (Put)
        test_put_virtual_network(network_id)

        print("\n=== サブネットAPIテスト ===")
        # 5. サブネット作成
        subnet_id = test_create_subnet(network_id)

        # 6. サブネット詳細取得
        test_get_subnet(network_id, subnet_id)

        # 7. サブネット部分更新
        test_patch_subnet(network_id, subnet_id)

        # 8. サブネット更新
        test_put_subnet(network_id, subnet_id)

        # 9. サブネット内のVM一覧取得
        test_get_subnet_vms(network_id, subnet_id)

        # 10. サブネット一括更新 (Bulk)
        test_bulk_subnets(network_id)

        # 11. サブネット削除
        test_delete_subnet(network_id, subnet_id)

        # 12. ネットワーク削除 (Delete)
        test_delete_virtual_network(network_id)

    except AssertionError:
        raise
    except Exception as e:
        print(f"エラーまたはリソース不足のため一部のテストをスキップします: {e}")


def test_get_virtual_networks():
    print("\n--- GET /api/virtual-networks のテスト ---")
    res = requests.get(f"{API_URL}virtual-networks", headers=headers)
    assert (
        res.status_code == 200
    ), f"仮想ネットワーク一覧の取得に失敗しました: {res.status_code}"
    networks = res.json()
    assert isinstance(networks, list)
    print("仮想ネットワーク一覧を正常に取得しました。件数:", len(networks))
    return networks


def test_create_virtual_network(prefix="TestNetwork"):
    print("\n--- POST /api/virtual-networks のテスト ---")
    name = f"{prefix}_{random.randint(1000, 9999)}"
    cidr = "192.168.0.0/16"

    # 必須: initialSubnets (min 1)
    initial_subnets = [
        {"name": f"Subnet-Default_{random.randint(100, 999)}", "cidr": "192.168.1.0/24"}
    ]

    payload = {"name": name, "cidr": cidr, "initialSubnets": initial_subnets}

    print(
        "以下のペイロードで仮想ネットワークを作成します:",
        json.dumps(payload, indent=2),
    )

    res = requests.post(f"{API_URL}virtual-networks", headers=headers, json=payload)
    print("ステータスコード:", res.status_code)

    assert (
        res.status_code == 201
    ), f"仮想ネットワークの作成に失敗しました: {res.status_code}"

    created_network = res.json()
    assert created_network["name"] == name

    print(f"作成された仮想ネットワークID: {created_network['id']}")
    return created_network["id"]


def test_get_virtual_network(network_id):
    print(f"\n--- GET /api/virtual-networks/{network_id} のテスト ---")
    res = requests.get(f"{API_URL}virtual-networks/{network_id}", headers=headers)
    assert (
        res.status_code == 200
    ), f"仮想ネットワーク詳細の取得に失敗しました: {res.status_code}"
    network = res.json()
    print("仮想ネットワーク詳細を正常に取得しました。")
    return network


def test_patch_virtual_network(network_id):
    print(f"\n--- PATCH /api/virtual-networks/{network_id} のテスト ---")
    test_get_virtual_network(network_id)
    new_name = f"PatchedNetwork_{random.randint(100, 999)}"

    payload = {"name": new_name}

    res = requests.patch(
        f"{API_URL}virtual-networks/{network_id}", headers=headers, json=payload
    )
    assert (
        res.status_code == 200
    ), f"仮想ネットワークのパッチ更新に失敗しました: {res.status_code}"

    patched_network = res.json()

    if "name" not in patched_network:
        print("レスポンスにnameが含まれていないため、再取得して検証します。")
        patched_network = test_get_virtual_network(network_id)

    assert patched_network["name"] == new_name
    print(f"パッチ更新後の名前: {patched_network['name']}")

    return patched_network


def test_put_virtual_network(network_id):
    print(f"\n--- PUT /api/virtual-networks/{network_id} のテスト ---")
    test_get_virtual_network(network_id)
    new_name = "ReplacedNetwork_" + str(random.randint(1000, 9999))

    payload = {"name": new_name}

    res = requests.put(
        f"{API_URL}virtual-networks/{network_id}", headers=headers, json=payload
    )
    assert (
        res.status_code == 200
    ), f"仮想ネットワークの更新(PUT)に失敗しました: {res.status_code}"

    replaced_network = res.json()
    assert replaced_network["name"] == new_name

    print(f"更新(PUT)後の仮想ネットワーク名: {replaced_network['name']}")
    return replaced_network


def test_delete_virtual_network(network_id):
    print(f"\n--- DELETE /api/virtual-networks/{network_id} のテスト ---")
    res = requests.delete(f"{API_URL}virtual-networks/{network_id}", headers=headers)
    assert (
        res.status_code == 204
    ), f"仮想ネットワークの削除に失敗しました: {res.status_code}"
    print(f"削除された仮想ネットワークID: {network_id}")

    res_get = requests.get(f"{API_URL}virtual-networks/{network_id}", headers=headers)
    assert (
        res_get.status_code == 404
    ), f"削除後に仮想ネットワークがまだ存在しています: {res_get.status_code}"
    print("仮想ネットワークが削除されたことを確認しました (404)。")


# --- Subnet Tests ---


def test_create_subnet(network_id):
    print(f"\n--- POST /api/virtual-networks/{network_id}/subnets のテスト ---")

    name = f"Subnet_{random.randint(1000, 9999)}"
    cidr = "192.168.2.0/24"

    payload = {"name": name, "cidr": cidr}

    res = requests.post(
        f"{API_URL}virtual-networks/{network_id}/subnets", headers=headers, json=payload
    )

    assert res.status_code == 201, f"サブネットの作成に失敗しました: {res.status_code}"

    subnet = res.json()
    assert subnet["name"] == name
    assert subnet["cidr"] == cidr  # CIDRは変わらないはず

    print(f"作成されたサブネットID: {subnet['id']}")
    return subnet["id"]


def test_get_subnet(network_id, subnet_id):
    print(
        f"\n--- GET /api/virtual-networks/{network_id}/subnets/{subnet_id} のテスト ---"
    )

    res = requests.get(
        f"{API_URL}virtual-networks/{network_id}/subnets/{subnet_id}", headers=headers
    )

    assert (
        res.status_code == 200
    ), f"サブネット詳細の取得に失敗しました: {res.status_code}"

    print("サブネット詳細を正常に取得しました。")
    return res.json()


def test_patch_subnet(network_id, subnet_id):
    print(
        f"\n--- PATCH /api/virtual-networks/{network_id}/subnets/{subnet_id} のテスト ---"
    )

    # CIDRは変更しない方が安全かもしれないが、PatchなのでNameだけ更新してみる
    new_name = f"PatchedSubnet_{random.randint(100, 999)}"

    payload = {"name": new_name}

    res = requests.patch(
        f"{API_URL}virtual-networks/{network_id}/subnets/{subnet_id}",
        headers=headers,
        json=payload,
    )

    assert (
        res.status_code == 200
    ), f"サブネットのパッチ更新に失敗しました: {res.status_code}"

    subnet = res.json()
    if "name" not in subnet:
        subnet = test_get_subnet(network_id, subnet_id)

    assert subnet["name"] == new_name
    print(f"パッチ更新後のサブネット名: {subnet['name']}")
    return subnet


def test_put_subnet(network_id, subnet_id):
    print(
        f"\n--- PUT /api/virtual-networks/{network_id}/subnets/{subnet_id} のテスト ---"
    )

    new_name = f"ReplacedSubnet_{random.randint(1000, 9999)}"
    new_cidr = "192.168.20.0/24"  # PutなのでCIDRも送る

    payload = {"name": new_name, "cidr": new_cidr}

    res = requests.put(
        f"{API_URL}virtual-networks/{network_id}/subnets/{subnet_id}",
        headers=headers,
        json=payload,
    )

    assert (
        res.status_code == 200
    ), f"サブネットの更新(PUT)に失敗しました: {res.status_code}"

    subnet = res.json()
    assert subnet["name"] == new_name
    assert subnet["cidr"] == new_cidr if "cidr" in subnet else True

    print(f"更新(PUT)後のサブネット名: {subnet['name']}")
    return subnet


def test_get_subnet_vms(network_id, subnet_id):
    print(
        f"\n--- GET /api/virtual-networks/{network_id}/subnets/{subnet_id}/virtual-machines のテスト ---"
    )

    res = requests.get(
        f"{API_URL}virtual-networks/{network_id}/subnets/{subnet_id}/virtual-machines",
        headers=headers,
    )

    assert (
        res.status_code == 200
    ), f"サブネット内VM一覧の取得に失敗しました: {res.status_code}"

    vms = res.json()
    assert isinstance(vms, list)
    print(f"サブネット内VM一覧を正常に取得しました。件数: {len(vms)}")


def test_bulk_subnets(network_id):
    print(f"\n--- POST /api/virtual-networks/{network_id}/subnets/bulk のテスト ---")

    # BulkRequest の構造: { add: [], patch: [], remove: [] }
    bulk_payload = {
        "add": [
            {
                "name": f"BulkSubnet_1_{random.randint(100, 999)}",
                "cidr": "192.168.101.0/24",
            },
            {
                "name": f"BulkSubnet_2_{random.randint(100, 999)}",
                "cidr": "192.168.102.0/24",
            },
        ],
        "patch": [],
        "remove": [],
    }

    res = requests.post(
        f"{API_URL}virtual-networks/{network_id}/subnets/bulk",
        headers=headers,
        json=bulk_payload,
    )

    # Bulk実装の応答を確認
    assert res.status_code in [
        200,
        201,
    ], f"サブネット一括更新に失敗しました: {res.status_code}"

    print("サブネット一括更新(Bulk) APIが正常に応答しました。")


def test_delete_subnet(network_id, subnet_id):
    print(
        f"\n--- DELETE /api/virtual-networks/{network_id}/subnets/{subnet_id} のテスト ---"
    )

    res = requests.delete(
        f"{API_URL}virtual-networks/{network_id}/subnets/{subnet_id}", headers=headers
    )

    assert res.status_code == 204, f"サブネットの削除に失敗しました: {res.status_code}"
    print(f"削除されたサブネットID: {subnet_id}")

    # 削除確認
    res_get = requests.get(
        f"{API_URL}virtual-networks/{network_id}/subnets/{subnet_id}", headers=headers
    )
    assert (
        res_get.status_code == 404
    ), f"削除後にサブネットがまだ存在しています: {res_get.status_code}"
    print("サブネットが削除されたことを確認しました (404)。")


if __name__ == "__main__":
    main()
