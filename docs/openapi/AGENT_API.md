# Agent API 仕様書

このドキュメントでは、Proxmox や ZFS などのインフラストラクチャ操作を行う Agent が提供する API エンドポイントについて説明します。

## 概要

Agent API は以下の 3 つのカテゴリに分かれています：

### 1. **Agent Images**（イメージ操作）
- アップロードされた OS イメージをテンプレートに変換
- イメージの削除

### 2. **Agent Nodes**（ノード操作）
- 新しいノードをクラスタに追加
- ノードの IP アドレスを認識

### 3. **Agent Storage Pools**（ストレージプール操作）
- ZFS または LVM でストレージプールを新規作成
- NFS ストレージプールの設定更新
- リモートストレージプールのマウント

---

## エンドポイント一覧

### Images

#### テンプレート化
```
POST /api/agent/images/template
```
アップロードされた OS イメージをテンプレートに変換します。

**リクエスト例：**
```json
{
  "id": "9000",
  "name": "template-base",
  "image_name": "upload.img"
}
```

**レスポンス例（202）：**
```json
{
  "taskId": "task-abc123",
  "message": "イメージのテンプレート化を開始しました"
}
```

#### 削除
```
POST /api/agent/images/delete
```
アップロードされたイメージを削除します。

**リクエスト例：**
```json
{
  "storage_id": "local",
  "image_name": "upload.img"
}
```

**レスポンス例（200）：**
```json
{
  "message": "イメージを削除しました"
}
```

---

### Nodes

#### ノード追加
```node_name": "pve-node-03",
  "ip_address": "192.168.3.10",
  "master_ip": "192.168.3.5"
}
```

**レスポンス例（202）：**
```json
{
  "taskId": "task-def456de-03"
}
```

**レスポンス例（202）：**
```json
{
  "taskId": "task-def456",
  "nodeId": "node-003",
  "message": "ノードの追加を開始しました"
}
```

---

### Storage Pools

#### ZFS ストレージプール作成
```
POST /api/agent/storage-pools/create
```
ZFS ストレージプールを新規作成します。

**リクエスト例：**
```json
{
  "pool_name": "poka",
  "device": "/dev/sdb",
  "storage_name": "poka",
  "node_name": "test01",
  "content": ["images", "rootdir"],
  "comment": "UUID:550e8400-e29b-41d4-a716-446655440000"
}
```

**レスポンス例（202）：**
```json
{
  "taskId": "task-ghi789",
  "poolId": "storage-poka",
  "poolName": "poka",
  "message": "ストレージプールの作成を開始しました"
}
```

#### ストレージプール更新
```
PUT /api/agent/storage-pools/{poolId}/update
```
ZFS ストレージプールを NFS で共有設定します。

**リクエスト例：**
```json
{
  "pool_name": "poka",
  "network": "192.168.3.0/24",
  "read_write": true,
  "root_squash": false
}
```

**レスポンス例（200）：**
```json
{
  "poolId": "storage-poka",
  "poolName": "poka",
  "message": "ストレージプール設定を更新しました"
}
```

#### リモートストレージプールマウント
```
POST /api/agent/storage-pools/mount-remote
```
別のノードで公開されている NFS ストレージプールを、現在のノードにマウントします。

**リクエスト例：**
```json
{
  "storage_name": "remote-poka",
  "server_ip": "192.168.3.50",
  "export_path": "/poka",
  "content": ["images", "rootdir"],
  "node_name": ["test02"]
}
```

**レスポンス例（202）：**
```json
{
  "taskId": "task-jkl012",
  "message": "リモートストレージプールのマウントを開始しました"
}
```

---

## 共通事項

### 認証
すべてのエンドポイントは JWT Bearer トークンでの認証が必要です。

```
Authorization: Bearer <token>
```

### レスポンスコード
- **200**: リクエスト成功
- **202**: 非同期処理が開始されました。`taskId` で進行状況を確認できます
- **400**: リクエストの形式が不正です
- **404**: リソースが見つかりません
- **409**: リソースの競合（例：既に存在するものを作成しようとした）
- **500**: サーバーエラー

### 非同期処理
テンプレート化、ノード追加、ストレージプール作成など、処理に時間がかかる操作は非同期で実行されます。
レスポンスの `taskId` を使用して、別途進行状況を確認してください。

### エラーレスポンス
すべてのエラーレスポンスは以下の形式で返されます：

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "エラーメッセージ",
    "details": {}
  }
}
```

---

## 実装ガイドライン

### 1. イメージのテンプレート化フロー
```
1. POST /api/agent/images/template でリクエスト送信
2. taskId を受け取る
3. 定期的に task status エンドポイントをポーリング
4. ステータスが "completed" または "failed" になるまで待機
```

### 2. ZFS ストレージプール作成フロー
```
1. 事前に `qm` コマンドで新規 VM を作成しておく（テンプレート化の場合）
2. POST /api/agent/storage-pools/create でリクエスト送信
3. taskId を受け取る
4. ストレージプールがシステムに認識されるまで待機
5. 必要に応じて PUT /api/agent/storage-pools/{poolId}/update で共有設定を変更
```

### 3. リモート NFS マウントフロー
```
1. ノード A で ZFS プールを作成
2. PUT /api/agent/storage-pools/{poolId}/update で共有設定を有効化
3. ノード B で POST /api/agent/storage-pools/{poolId}/mount-remote でマウント
4. マウント完了後、Proxmox で管理可能になる
```

---

## 詳細な OpenAPI 仕様

完全な OpenAPI 仕様は `openapi.yml` を参照してください。
詳細なリクエスト・レスポンススキーマについては、以下のファイルを確認してください：

- `/docs/openapi/paths/agent/agent_images_template.yml`
- `/docs/openapi/paths/agent/agent_images_{imageId}_delete.yml`
- `/docs/openapi/paths/agent/agent_nodes_add.yml`
- `/docs/openapi/paths/agent/agent_storage-pools_create.yml`
- `/docs/openapi/paths/agent/agent_storage-pools_{poolId}_update.yml`
- `/docs/openapi/paths/agent/agent_storage-pools_{poolId}_mount-remote.yml`
