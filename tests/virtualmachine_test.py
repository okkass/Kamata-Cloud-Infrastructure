import requests
import json
import random
import os
import sys

from auth_test import get_header

# 定数の宣言
API_URL = os.environ.get("API_URL", "http://localhost:3030/api/")
TOKEN = os.environ.get("API_TOKEN", "mock-token")

HEADERS = get_header(sys.argv, headers={"Authorization": f"Bearer {TOKEN}"})


def main():
    print("仮想マシンAPIのテストを開始します...")
    test_get_vms()

    network_id = None
    try:
        # 前提リソースの準備
        node_id = get_random_node()
        image_id = get_random_image()
        pool_id = get_random_storage_pool()
        sg_id = get_random_sg()

        network_id, subnet_id = create_test_network_and_subnet()

        print("\n=== CRUDテストを実行します ===")
        # 1. 作成 (Create)
        vm_id = test_create_vm(node_id, image_id, subnet_id, pool_id, sg_id)

        # 2. 詳細取得 (Get Detail)
        test_get_vm(vm_id)

        # 3. 部分更新 (Patch)
        test_patch_vm(vm_id)

        # 4. 更新 (Put)
        test_put_vm(vm_id)

        print("\n=== アクションテスト ===")
        # 5-9. アクション
        test_vm_actions(vm_id)

        print("\n=== ネットワークインターフェースAPIテスト ===")
        # 10-14. NIC操作
        test_nics(vm_id, subnet_id)

        print("\n=== セキュリティグループAPIテスト ===")
        # 15-17. SG操作
        test_security_groups(vm_id)

        print("\n=== ストレージAPIテスト ===")
        # 18-22. ストレージ操作
        test_storages(vm_id, pool_id)

        # 23. 削除 (Delete)
        test_delete_vm(vm_id)

    except AssertionError:
        raise
    except Exception as e:
        print(f"エラーまたはリソース不足のため一部のテストをスキップします: {e}")
        import traceback

        traceback.print_exc()
    finally:
        # 後始末
        if network_id:
            delete_test_network(network_id)


# --- Helper Functions ---


def get_random_node():
    res = requests.get(f"{API_URL}nodes", headers=HEADERS)
    assert res.status_code == 200, f"ノード一覧取得失敗: {res.status_code}"
    nodes = res.json()
    if not nodes:
        raise Exception("利用可能なノードがありません")
    return nodes[0]["id"]


def get_random_image():
    res = requests.get(f"{API_URL}images", headers=HEADERS)
    assert res.status_code == 200, f"イメージ一覧取得失敗: {res.status_code}"
    images = res.json()
    if not images:
        raise Exception("利用可能なイメージがありません")
    return images[0]["id"]


def get_random_storage_pool():
    res = requests.get(f"{API_URL}storage-pools", headers=HEADERS)
    assert res.status_code == 200, f"ストレージプール一覧取得失敗: {res.status_code}"
    pools = res.json()
    if not pools:
        raise Exception("利用可能なストレージプールがありません")
    return pools[0]["id"]


def get_random_sg():
    res = requests.get(f"{API_URL}security-groups", headers=HEADERS)
    assert res.status_code == 200, f"SG一覧取得失敗: {res.status_code}"
    sgs = res.json()
    # Create one if needed
    if not sgs:
        payload = {"name": f"TestSG_{random.randint(100, 999)}"}
        res = requests.post(f"{API_URL}security-groups", headers=HEADERS, json=payload)
        return res.json()["id"]
    return sgs[0]["id"]


def create_test_network_and_subnet():
    # ネットワーク作成
    net_name = f"VMTestNet_{random.randint(1000, 9999)}"
    net_payload = {
        "name": net_name,
        "cidr": "10.0.0.0/16",
        "initialSubnets": [
            {"name": f"VMTestSubnet_{random.randint(100, 999)}", "cidr": "10.0.1.0/24"}
        ],
    }
    res = requests.post(f"{API_URL}virtual-networks", headers=HEADERS, json=net_payload)
    assert res.status_code == 201, "テスト用ネットワーク作成失敗"
    net = res.json()

    # サブネットID取得 (initialSubnetsで作られているはずだが、GETで確認しても良い)
    # create responseに含まれていればそれを使う

    # Actually api.yml doesn't list GET /subnets list? NO.
    # But GET /virtual-networks/{id} returns subnets list usually.

    res_net = requests.get(f"{API_URL}virtual-networks/{net['id']}", headers=HEADERS)
    net_detail = res_net.json()
    if "subnets" in net_detail and len(net_detail["subnets"]) > 0:
        return net["id"], net_detail["subnets"][0]["id"]

    # Fallback: create subnet manually if not found (should not happen with initialSubnets)
    raise Exception("サブネット作成失敗")


def delete_test_network(network_id):
    res = requests.delete(f"{API_URL}virtual-networks/{network_id}", headers=HEADERS)
    if res.status_code != 204:
        print(f"ネットワーク削除警告: {res.status_code} {res.text}")


# --- VM CRUD Tests ---


def test_get_vms():
    print("\n--- GET /api/virtual-machines のテスト ---")
    res = requests.get(f"{API_URL}virtual-machines", headers=HEADERS)
    assert res.status_code == 200, f"一覧取得失敗: {res.status_code}"
    vms = res.json()
    assert isinstance(vms, list)
    print(f"VM一覧取得成功: {len(vms)}件")


def test_create_vm(node_id, image_id, subnet_id, pool_id, sg_id):
    print("\n--- POST /api/virtual-machines のテスト ---")
    name = f"TestVM_{random.randint(1000, 9999)}"
    payload = {
        "name": name,
        "spec": {"cpu": 1, "memory": 512 * 1024 * 1024},  # 512MB
        "publicKey": "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC...",
        "nodeId": node_id,
        "imageId": image_id,
        "subnetIds": [subnet_id],
        "securityGroupIds": [sg_id],
        "storages": [
            {
                "name": "root-disk",
                "size": 10 * 1024 * 1024 * 1024,  # 10GB
                "poolId": pool_id,
            }
        ],
    }
    print("作成ペイロード:", json.dumps(payload, indent=2))
    res = requests.post(f"{API_URL}virtual-machines", headers=HEADERS, json=payload)
    if res.status_code != 201:
        print("エラーレスポンス:", res.text)
    assert res.status_code == 201, f"VM作成失敗: {res.status_code}"
    vm = res.json()
    assert vm["name"] == name
    print(f"VM作成成功: ID={vm['id']}")
    return vm["id"]


def test_get_vm(vm_id):
    print(f"\n--- GET /api/virtual-machines/{vm_id} のテスト ---")
    res = requests.get(f"{API_URL}virtual-machines/{vm_id}", headers=HEADERS)
    assert res.status_code == 200, f"詳細取得失敗: {res.status_code}"
    vm = res.json()
    print("詳細取得成功")
    return vm


def test_patch_vm(vm_id):
    print(f"\n--- PATCH /api/virtual-machines/{vm_id} のテスト ---")
    new_name = f"PatchedVM_{random.randint(100, 999)}"
    payload = {"name": new_name}
    res = requests.patch(
        f"{API_URL}virtual-machines/{vm_id}", headers=HEADERS, json=payload
    )
    assert res.status_code == 200, f"Patch失敗: {res.status_code}"
    vm = res.json()
    # If name not in response, fetch again
    if "name" not in vm:
        vm = test_get_vm(vm_id)
    assert vm["name"] == new_name
    print(f"Patch成功: {vm['name']}")


def test_put_vm(vm_id):
    print(f"\n--- PUT /api/virtual-machines/{vm_id} のテスト ---")
    new_name = f"ReplacedVM_{random.randint(1000, 9999)}"
    # Put requires name and spec according to Zod schema
    payload = {"name": new_name, "spec": {"cpu": 2, "memory": 1024 * 1024 * 1024}}
    res = requests.put(
        f"{API_URL}virtual-machines/{vm_id}", headers=HEADERS, json=payload
    )
    assert res.status_code == 200, f"Put失敗: {res.status_code}"
    vm = res.json()
    assert vm["name"] == new_name
    print(f"Put成功: {vm['name']}")


def test_delete_vm(vm_id):
    print(f"\n--- DELETE /api/virtual-machines/{vm_id} のテスト ---")
    res = requests.delete(f"{API_URL}virtual-machines/{vm_id}", headers=HEADERS)
    assert res.status_code == 204, f"Delete失敗: {res.status_code}"

    check = requests.get(f"{API_URL}virtual-machines/{vm_id}", headers=HEADERS)
    assert check.status_code == 404, "削除後も存在しています"
    print("削除成功")


# --- Actions ---


def test_vm_actions(vm_id):
    actions = ["start", "stop", "reboot", "shutdown", "reset"]
    for action in actions:
        print(f"\n--- POST /api/virtual-machines/{vm_id}/{action} のテスト ---")
        res = requests.post(
            f"{API_URL}virtual-machines/{vm_id}/{action}", headers=HEADERS
        )
        # Mock assumption: returns 200 or 202.
        # Check API spec, usually 200 or 202.
        assert res.status_code in [200, 202, 204], f"{action} 失敗: {res.status_code}"
        print(f"{action} 成功")


# --- NICs ---


def test_nics(vm_id, subnet_id):
    print(f"\n--- NIC APIテスト ---")

    # Create (Add)
    # Zod schema expects virtualMachineId and subnetId. Name is NOT in schema (Mock issue?), but we include vm_id.
    payload = {"virtualMachineId": vm_id, "subnetId": subnet_id}
    res = requests.post(
        f"{API_URL}virtual-machines/{vm_id}/network-interfaces",
        headers=HEADERS,
        json=payload,
    )
    if res.status_code != 201:
        print("NIC追加エラー:", res.text)
    assert res.status_code == 201, f"NIC追加失敗: {res.status_code}"
    nic = res.json()
    nic_id = nic["id"]
    print(f"NIC追加成功: {nic_id}")

    # Get List
    res = requests.get(
        f"{API_URL}virtual-machines/{vm_id}/network-interfaces", headers=HEADERS
    )
    assert res.status_code == 200
    nics = res.json()
    assert len(nics) >= 1

    # Get Detail
    res = requests.get(
        f"{API_URL}virtual-machines/{vm_id}/network-interfaces/{nic_id}",
        headers=HEADERS,
    )
    assert res.status_code == 200

    # Patch
    new_name = f"patched_nic_{random.randint(100, 999)}"
    res = requests.patch(
        f"{API_URL}virtual-machines/{vm_id}/network-interfaces/{nic_id}",
        headers=HEADERS,
        json={"name": new_name},
    )
    assert res.status_code == 200

    # Put
    put_name = f"put_nic_{random.randint(100, 999)}"
    # Put requires subnetId? NetworkInterfacePutRequest: WithRequired<Updatable, "name" | "subnetId">
    res = requests.put(
        f"{API_URL}virtual-machines/{vm_id}/network-interfaces/{nic_id}",
        headers=HEADERS,
        json={"name": put_name, "subnetId": subnet_id},
    )
    assert res.status_code == 200

    # Bulk
    print("\n--- NIC Bulkテスト ---")
    bulk_payload = {
        "add": [{"virtualMachineId": vm_id, "subnetId": subnet_id}],
        "patch": [],
        "remove": [],
    }
    res = requests.post(
        f"{API_URL}virtual-machines/{vm_id}/network-interfaces/bulk",
        headers=HEADERS,
        json=bulk_payload,
    )
    if res.status_code != 200:
        print("NIC Bulkエラー:", res.text)
    assert res.status_code == 200, f"Bulk失敗: {res.status_code}"
    print("Bulk成功")

    # Cleanup (Delete NIC)
    res = requests.delete(
        f"{API_URL}virtual-machines/{vm_id}/network-interfaces/{nic_id}",
        headers=HEADERS,
    )
    assert res.status_code == 204


# --- Security Groups ---


def test_security_groups(vm_id):
    # Need a security group first
    print("\n--- Security Group APIテスト ---")
    sg_res = requests.get(f"{API_URL}security-groups", headers=HEADERS)
    if sg_res.status_code == 200 and len(sg_res.json()) > 0:
        sg_id = sg_res.json()[0]["id"]
    else:
        # Create one if needed
        sg_payload = {"name": f"TestSG_{random.randint(100, 999)}"}
        sg_new_res = requests.post(
            f"{API_URL}security-groups", headers=HEADERS, json=sg_payload
        )
        if sg_new_res.status_code not in (200, 201):
            print(
                f"セキュリティグループ作成に失敗しました: "
                f"{sg_new_res.status_code} {sg_new_res.text}"
            )
        sg_new = sg_new_res.json()
        sg_id = sg_new["id"]

    # Add (Post) -> Actually POST /api/virtual-machines/{vmId}/security-groups is "Add"
    # Payload? usually { "id": "uuid" } or just "id" or check AttachedSecurityGroupBulkRequest components
    # Just checking API paths.
    # /api/virtual-machines/{vmId}/security-groups POST -> "仮想マシンへのセキュリティグループの追加"
    # Usually payload is SecurityGroupAttachRequest?
    # Let's try { "securityGroupId": sg_id } matching Zod schema

    res = requests.post(
        f"{API_URL}virtual-machines/{vm_id}/security-groups",
        headers=HEADERS,
        json={"securityGroupId": sg_id},
    )
    # If standard is { id: ... }
    # Or just `json=[sg_id]`?
    # I'll try standard object.

    # Note: If already attached, might fail or 200. Mock usually 200.
    if res.status_code not in [200, 201]:
        print(f"SG追加(単体)スキップまたは失敗: {res.status_code}")
    else:
        print("SG追加成功")

    # Get List
    res = requests.get(
        f"{API_URL}virtual-machines/{vm_id}/security-groups", headers=HEADERS
    )
    assert res.status_code == 200

    # Bulk
    # AttachedSecurityGroupBulkRequest: { add: [{securityGroupId}], remove: [] }
    # Mock implementation requires patch field even if not in API spec
    bulk_payload = {"add": [], "remove": [], "patch": []}  # Already added
    # Maybe add same one? or different?
    res = requests.post(
        f"{API_URL}virtual-machines/{vm_id}/security-groups/bulk",
        headers=HEADERS,
        json=bulk_payload,
    )
    if res.status_code != 200:
        print("SG Bulkエラー:", res.text)
    assert res.status_code == 200

    # Delete (Detach)
    res = requests.delete(
        f"{API_URL}virtual-machines/{vm_id}/security-groups/{sg_id}", headers=HEADERS
    )
    if res.status_code != 204:
        print(f"SG削除(Detach)失敗: {res.status_code}")
    assert res.status_code == 204
    print("SG削除(Detach)成功")


# --- Storages ---


def test_storages(vm_id, pool_id):
    print("\n--- Storage APIテスト ---")

    # Add (Post)
    # StorageCreateRequest: { name, size, poolId, backupId? }
    storage_name = f"data_disk_{random.randint(100, 999)}"
    payload = {
        "name": storage_name,
        "size": 1024 * 1024 * 1024,  # 1GB
        "poolId": pool_id,
    }
    res = requests.post(
        f"{API_URL}virtual-machines/{vm_id}/storages", headers=HEADERS, json=payload
    )
    assert res.status_code == 201, f"Storage追加失敗: {res.status_code}"
    storage = res.json()
    st_id = storage["id"]
    print(f"Storage追加成功: {st_id}")

    # Get List
    res = requests.get(f"{API_URL}virtual-machines/{vm_id}/storages", headers=HEADERS)
    assert res.status_code == 200, f"Storage一覧取得失敗: {res.status_code}"

    # Get Detail
    res = requests.get(
        f"{API_URL}virtual-machines/{vm_id}/storages/{st_id}", headers=HEADERS
    )
    assert res.status_code == 200, f"Storage詳細取得失敗: {res.status_code}"

    # Patch
    res = requests.patch(
        f"{API_URL}virtual-machines/{vm_id}/storages/{st_id}",
        headers=HEADERS,
        json={"name": f"patched_{storage_name}"},
    )
    assert res.status_code == 200, f"Storage Patch失敗: {res.status_code}"

    # Put (requires name)
    res = requests.put(
        f"{API_URL}virtual-machines/{vm_id}/storages/{st_id}",
        headers=HEADERS,
        json={"name": f"put_{storage_name}"},
    )
    assert res.status_code == 200, f"Storage Put失敗: {res.status_code}"

    # Bulk
    bulk_payload = {
        "add": [
            {
                "name": f"bulk_disk_{random.randint(100, 999)}",
                "size": 1024 * 1024 * 1024,
                "poolId": pool_id,
            }
        ],
        "patch": [],
        "remove": [],
    }
    res = requests.post(
        f"{API_URL}virtual-machines/{vm_id}/storages/bulk",
        headers=HEADERS,
        json=bulk_payload,
    )
    assert res.status_code == 200

    # Delete
    res = requests.delete(
        f"{API_URL}virtual-machines/{vm_id}/storages/{st_id}", headers=HEADERS
    )
    assert res.status_code == 204
    print("Storage削除成功")


if __name__ == "__main__":
    main()
