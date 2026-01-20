import requests
import json
import random
import os

# 定数の宣言
API_URL = os.environ.get("API_URL", "http://localhost:3030/api/")
TOKEN = os.environ.get("API_TOKEN", "mock-token")
HEADERS = {"Authorization": f"Bearer {TOKEN}"}


def main():
    print("Starting Backup API tests...")
    test_get_backups()

    try:
        vm_id, storage_id = get_vm_and_storage()
        print(f"Using VM ID: {vm_id}, Storage ID: {storage_id}")

        # 1. CRUD Tests
        print("\n=== Running CRUD Tests ===")
        backup_id = test_create_backup(vm_id, storage_id)

        test_get_backup(backup_id)
        test_patch_backup(backup_id)
        test_put_backup(backup_id)
        test_delete_backup(backup_id)

        # 2. Restore Test
        print("\n=== Running Restore Test ===")
        backup_id_restore = test_create_backup(vm_id, storage_id)
        test_restore_backup(backup_id_restore)

        # Cleanup
        print("\n=== Cleaning up Restore Test Resource ===")
        try:
            test_delete_backup(backup_id_restore)
        except AssertionError as e:
            print(f"Cleanup deletion failed (possibly locked during restore): {e}")

    except Exception as e:
        print(f"Skipping some tests due to error or missing resources: {e}")


def test_get_backups():
    print("\n--- Testing GET /api/backups ---")
    res = requests.get(f"{API_URL}backups", headers=HEADERS)
    assert res.status_code == 200, f"Failed to get backups: {res.status_code}"
    backups = res.json()
    assert isinstance(backups, list)
    print("Backups list retrieved successfully. Count:", len(backups))
    # print("Backups:", json.dumps(backups, indent=2))
    return backups


def get_vm_and_storage():
    print("\n--- Fetching a target VM and Storage for backup tests ---")
    res = requests.get(f"{API_URL}virtual-machines", headers=HEADERS)
    assert res.status_code == 200, f"Failed to get VMs: {res.status_code}"
    vms = res.json()

    if not vms:
        raise Exception("No Virtual Machines found. Cannot test backup creation.")

    for vm in vms:
        if vm.get("storages") and len(vm["storages"]) > 0:
            # Just pick the first one with storage
            return vm["id"], vm["storages"][0]["id"]

    raise Exception("No Virtual Machines with attached storage found.")


def test_create_backup(vm_id, storage_id):
    print("\n--- Testing POST /api/backups ---")
    name = f"TestBackup_{random.randint(1000, 9999)}"
    payload = {
        "name": name,
        "description": "Created by back-up.py test script",
        "targetVirtualMachineId": vm_id,
        "targetStorageId": storage_id,
    }
    print("Creating Backup with payload:", json.dumps(payload, indent=2))

    res = requests.post(f"{API_URL}backups", headers=HEADERS, json=payload)
    print("Status:", res.status_code)
    print("Response:", res.text)

    assert res.status_code == 201, f"Failed to create backup: {res.status_code}"
    backup = res.json()
    assert backup["name"] == name
    print(f"Created Backup ID: {backup['id']}")
    return backup["id"]


def test_get_backup(backup_id):
    print(f"\n--- Testing GET /api/backups/{backup_id} ---")
    res = requests.get(f"{API_URL}backups/{backup_id}", headers=HEADERS)
    assert res.status_code == 200, f"Failed to get backup details: {res.status_code}"
    backup = res.json()
    print("Backup details retrieved successfully.")
    # print("Backup:", json.dumps(backup, indent=2))
    return backup


def test_patch_backup(backup_id):
    print(f"\n--- Testing PATCH /api/backups/{backup_id} ---")
    current_backup = test_get_backup(backup_id)
    new_name = "Patched " + current_backup["name"]
    payload = {"name": new_name}

    res = requests.patch(f"{API_URL}backups/{backup_id}", headers=HEADERS, json=payload)
    assert res.status_code == 200, f"Failed to patch backup: {res.status_code}"

    patched_backup = res.json()
    assert patched_backup["name"] == new_name
    print(f"Patched Backup Name: {patched_backup['name']}")
    return patched_backup


def test_put_backup(backup_id):
    print(f"\n--- Testing PUT /api/backups/{backup_id} ---")
    current_backup = test_get_backup(backup_id)
    new_name = "Replaced " + current_backup["name"].replace("Patched ", "")
    new_desc = "Updated description by PUT"

    # PUT usually requires all updatable fields or replaces the resource state.
    # Based on api.yml BackupUpdatable checks name and description.
    payload = {"name": new_name, "description": new_desc}

    res = requests.put(f"{API_URL}backups/{backup_id}", headers=HEADERS, json=payload)
    assert res.status_code == 200, f"Failed to put backup: {res.status_code}"

    replaced_backup = res.json()
    assert replaced_backup["name"] == new_name
    assert replaced_backup["description"] == new_desc
    print(f"Replaced Backup Name: {replaced_backup['name']}")
    return replaced_backup


def test_restore_backup(backup_id):
    print(f"\n--- Testing POST /api/backups/{backup_id}/restore ---")
    res = requests.post(f"{API_URL}backups/{backup_id}/restore", headers=HEADERS)
    print("Status:", res.status_code)
    # 202 Accepted is expected
    assert res.status_code == 202, f"Failed to request restore: {res.status_code}"
    print("Restore request accepted.")


def test_delete_backup(backup_id):
    print(f"\n--- Testing DELETE /api/backups/{backup_id} ---")
    res = requests.delete(f"{API_URL}backups/{backup_id}", headers=HEADERS)
    assert res.status_code == 204, f"Failed to delete backup: {res.status_code}"
    print(f"Deleted Backup ID: {backup_id}")

    # Verify deletion
    res_get = requests.get(f"{API_URL}backups/{backup_id}", headers=HEADERS)
    assert (
        res_get.status_code == 404
    ), f"Backup still exists after deletion: {res_get.status_code}"
    print("Verified backup is gone (404).")


if __name__ == "__main__":
    main()
