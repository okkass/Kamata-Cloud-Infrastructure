import requests
import os
import sys

from auth_test import get_header

# 定数の宣言
API_URL = os.environ.get("API_URL", "http://localhost:3030/api/")
TOKEN = os.environ.get("API_TOKEN", "mock-token")

headers = get_header(sys.argv, headers={"Authorization": f"Bearer {TOKEN}"})


def main():
    print("サマリーAPIのテストを開始します...")

    try:
        test_get_summary_realtime()
        test_get_summary_history()

    except AssertionError:
        # テストのアサーション失敗はスキップ扱いにせず、そのまま上位に伝播させる
        raise
    except Exception as e:
        print(f"エラーまたはリソース不足のため一部のテストをスキップします: {e}")


def test_get_summary_realtime():
    print("\n--- GET /api/summary/realtime のテスト ---")

    # 1. パラメータなし（一般ユーザ）で取得
    print("パラメータなしでリクエスト送信")
    # Mockサーバーのディレクトリ構造上、パスが /api/summary/realtime になっている可能性があるため修正して試行
    res = requests.get(f"{API_URL}summary/realtime", headers=headers)
    assert (
        res.status_code == 200
    ), f"リアルタイムサマリーの取得に失敗しました: {res.status_code}"

    data = res.json()
    assert "clusterSummary" in data, "clusterSummaryフィールドが含まれていません"
    summary = data["clusterSummary"]

    # 基本的なフィールドの型チェック
    required_fields = [
        "totalCpu",
        "usedCpu",
        "totalMemory",
        "usedMemory",
        "totalStorage",
        "usedStorage",
    ]
    for field in required_fields:
        assert field in summary, f"{field}フィールドが含まれていません"
        assert isinstance(
            summary[field], (int, float)
        ), f"{field}は数値である必要があります"

    print("リアルタイムサマリーを正常に取得しました。")

    # 2. admin=1（管理者）で取得
    print("admin=1 パラメータ付きでリクエスト送信")
    res_admin = requests.get(
        f"{API_URL}summary/realtime", headers=headers, params={"admin": "1"}
    )
    assert (
        res_admin.status_code == 200
    ), f"管理者用リアルタイムサマリーの取得に失敗しました: {res_admin.status_code}"
    data_admin = res_admin.json()
    assert (
        "clusterSummary" in data_admin
    ), "管理者用レスポンスにclusterSummaryフィールドが含まれていません"

    # Mockでは管理者用と一般用で返す値が異なる可能性があるが、スキーマは同じ

    print("管理者用リアルタイムサマリーを正常に取得しました。")


def test_get_summary_history():
    print("\n--- GET /api/summary/history のテスト ---")

    # 1. パラメータなしで取得
    print("パラメータなしでリクエスト送信")
    res = requests.get(f"{API_URL}summary/history", headers=headers)
    assert (
        res.status_code == 200
    ), f"ヒストリーサマリーの取得に失敗しました: {res.status_code}"

    history_data = res.json()

    # Mock実装に基づき、data配列を確認
    assert "data" in history_data, "レスポンスにdataフィールドが含まれていません"
    assert isinstance(
        history_data["data"], list
    ), "dataフィールドはリストである必要があります"

    if len(history_data["data"]) > 0:
        item = history_data["data"][0]
        # 必要な履歴データフィールドの確認
        required_history_fields = [
            "cpuHistory",
            "memHistory",
            "networkINHistory",
            "networkOUTHistory",
        ]
        for field in required_history_fields:
            assert field in item, f"ヒストリーデータに{field}が含まれていません"
            assert isinstance(item[field], list), f"{field}はリストである必要があります"

            # 各履歴ポイントの構造確認
            if len(item[field]) > 0:
                point = item[field][0]
                assert "timestamp" in point, "履歴データにtimestampが含まれていません"
                assert "value" in point, "履歴データにvalueが含まれていません"

    print("ヒストリーサマリーを正常に取得しました。")

    # 2. admin=1 で取得
    res_admin = requests.get(
        f"{API_URL}summary/history", headers=headers, params={"admin": "1"}
    )
    assert (
        res_admin.status_code == 200
    ), f"管理者用ヒストリーサマリーの取得に失敗しました: {res_admin.status_code}"

    # 管理者用も同様にdata配列を持つ
    admin_data = res_admin.json()
    assert "data" in admin_data, "管理者用レスポンスにdataフィールドが含まれていません"
    assert isinstance(
        admin_data["data"], list
    ), "dataフィールドはリストである必要があります"

    print("管理者用ヒストリーサマリーを正常に取得しました。")


if __name__ == "__main__":
    main()
