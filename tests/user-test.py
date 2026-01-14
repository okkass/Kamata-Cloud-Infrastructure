import requests
import json
import random

API_URL = "http://localhost:3030/api/"
headers = {"Authorization": "Bearer mock-token"}

LAST_NAMES = [
    "Smith",
    "Johnson",
    "Williams",
    "Jones",
    "Brown",
    "Davis",
    "Miller",
    "Wilson",
    "Moore",
    "Taylor",
]
FIRST_NAMES = [
    "James",
    "Mary",
    "John",
    "Patricia",
    "Robert",
    "Jennifer",
    "Michael",
    "Linda",
    "William",
    "Elizabeth",
]


def main():
    test_get_users()
    user_id = test_create_user()
    test_get_user(user_id)
    test_patch_user(user_id)
    test_put_user(user_id)
    test_delete_user(user_id)


def test_get_users():
    res = requests.get(f"{API_URL}users", headers=headers)
    assert res.status_code == 200
    users = res.json()
    assert isinstance(users, list)

    print("Users:", json.dumps(users, indent=2))
    return users


def test_get_user(user_id):
    res = requests.get(f"{API_URL}users/{user_id}", headers=headers)
    assert res.status_code == 200
    user = res.json()
    print("User:", json.dumps(user, indent=2))
    return user


def test_create_user():
    uname, email = get_random_name()
    max_cpu = random.randint(0, 32)
    max_memory = random.choice([0, 4 * 1024**3, 8 * 1024**3, 16 * 1024**3])
    max_storage = random.choice([0, 50 * 1024**3, 100 * 1024**3, 200 * 1024**3])
    is_admin = random.choice([True, False])
    payload = {
        "password": "test_password",
        "name": uname,
        "email": email,
        "maxCpuCore": max_cpu if max_cpu > 0 else None,
        "maxMemorySize": max_memory if max_memory > 0 else None,
        "maxStorageSize": max_storage if max_storage > 0 else None,
        "isAdmin": is_admin,
        "isImageAdmin": False if is_admin else random.choice([True, False]),
        "isInstanceTypeAdmin": False if is_admin else random.choice([True, False]),
        "isVirtualMachineAdmin": False if is_admin else random.choice([True, False]),
        "isNetworkAdmin": False if is_admin else random.choice([True, False]),
        "isSecurityGroupAdmin": False if is_admin else random.choice([True, False]),
        "isNodeAdmin": False if is_admin else random.choice([True, False]),
    }
    print("Creating User with payload:", json.dumps(payload, indent=2))
    res = requests.post(f"{API_URL}users", headers=headers, json=payload)
    print(res.status_code, res.text)
    assert res.status_code == 201
    user = res.json()
    assert user["name"] == uname
    assert user["email"] == email
    print("Created User:", json.dumps(user, indent=2))
    return user["id"]


def test_patch_user(user_id):
    current_user = test_get_user(user_id)
    new_name = "Patched " + current_user["name"]
    payload = {"name": new_name}
    res = requests.patch(f"{API_URL}users/{user_id}", headers=headers, json=payload)
    assert res.status_code == 200
    patched_user = res.json()
    assert patched_user["name"] == new_name
    print("Patched User:", json.dumps(patched_user, indent=2))
    return patched_user


def test_put_user(user_id):
    current_user = test_get_user(user_id)
    new_name = "Replaced " + current_user["name"]
    payload = {
        "name": new_name,
        "email": current_user["email"],
        "maxCpuCore": current_user.get("maxCpuCore"),
        "maxMemorySize": current_user.get("maxMemorySize"),
        "maxStorageSize": current_user.get("maxStorageSize"),
        "isAdmin": current_user.get("isAdmin"),
        "isImageAdmin": current_user.get("isImageAdmin"),
        "isInstanceTypeAdmin": current_user.get("isInstanceTypeAdmin"),
        "isVirtualMachineAdmin": current_user.get("isVirtualMachineAdmin"),
        "isNetworkAdmin": current_user.get("isNetworkAdmin"),
        "isSecurityGroupAdmin": current_user.get("isSecurityGroupAdmin"),
        "isNodeAdmin": current_user.get("isNodeAdmin"),
    }
    res = requests.put(f"{API_URL}users/{user_id}", headers=headers, json=payload)
    assert res.status_code == 200
    replaced_user = res.json()
    assert replaced_user["name"] == new_name
    print("Replaced User:", json.dumps(replaced_user, indent=2))
    return replaced_user


def test_delete_user(user_id):
    res = requests.delete(f"{API_URL}users/{user_id}", headers=headers)
    assert res.status_code == 204
    print(f"Deleted User ID: {user_id}")
    res = requests.get(f"{API_URL}users/{user_id}", headers=headers)
    assert res.status_code == 404


def get_random_name():
    first_name = random.choice(FIRST_NAMES)
    last_name = random.choice(LAST_NAMES)
    uname = f"{first_name} {last_name}"
    email = f"{first_name.lower()}.{last_name.lower()}@example.com"

    return uname, email


if __name__ == "__main__":
    main()
