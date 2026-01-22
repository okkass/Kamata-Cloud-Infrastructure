## イメージ

### テンプレート化

- アップロードした OS イメージをテンプレートに変換する

```sh
# 1. テンプレート用VMのガワを作成 (ID: 9000)
qm create 9000 --name "template-base" --memory 1024 --net0 virtio,bridge=vmbr0

# 2. アップロードされたイメージをインポート
# (例: /var/lib/vz/template/iso/upload.img を local-lvm へ)
qm importdisk 9000 /var/lib/vz/template/iso/upload.img local-lvm

# 3. ディスクのアタッチとブート順の設定
qm set 9000 --scsi0 local-lvm:vm-9000-disk-0 --boot order=scsi0 --ide2 local-lvm:cloudinit

# 4. テンプレートへ変換
qm template 9000
```

### 削除機能

- アップロードした OS イメージの削除。rm コマンドの発行

```sh
# Goの os.Remove() 推奨ですが、コマンドなら:
rm -f /var/lib/vz/template/iso/upload.img
```

## ノード追加機能(優先度低め)

- ノードの認識(この agent が ip アドレスとかの返答を返すようにする)
- 追加は、なんか SSh を使った大規模からくり仕掛け？

```sh
# 先頭のプライベートIPだけを取得
hostname -I | awk '{print $1}'
```

```sh
# expectとか使うかも
pvecm add 192.168.3.10
```

## ストレージプール

### 新規作成

- 新しいストレージを LVM 構築する
- NFS を構築する
- 返却値を別途検討(ストレージプールを識別するため)

#### NFS-KERNEL-SERVERのインストール

```sh
# 必要なパッケージのインストール
apt update
apt install nfs-kernel-server -y
```

#### 新規ストレージの認識

```sh
lsblk -o NAME,SIZE,FSTYPE,MODEL,TYPE
```

#### ZFS の新規作成

#### 領域の作成

```sh
# 2-1. ZFSプール作成 (OSレベル)
# -f: 強制上書き (既存データ消去)
zpool create -f poka /dev/sdb

# 2-2. Proxmoxへの登録 (自分専用)
# --nodes test01: これが超重要！これがないとtest02にも勝手に追加されて「？」になる
pvesm add zfspool poka --pool poka --content images,rootdir --nodes test01
```

#### 領域の公開

```sh
# NodeAで実行
# ネットワーク(192.168.3.0/24)に対してRW権限で公開
zfs set sharenfs="rw=@192.168.3.0/24,no_root_squash" poka

# -----------------------------------

# NodeBで実行
# remote-pokaという名前で登録する
# --nodes test02: test02だけで使う設定 (Server自身がマウントしないようにする)
pvesm add nfs remote-poka --server 192.168.3.50 --export /poka --content images,rootdir --nodes test02
```

### 更新

- NFS サーバーの設定を変更する窓口

```sh
# NodeBで実行
# これでアンマウントされます
pvesm remove remote-poka

# -----------------------------------

# NodeAで実行
# 公開停止
zfs set sharenfs=off poka
```

- 再度登録する場合

```sh
# 相手方だけに登録（自分は登録済み）
pvesm add nfs remote-poka --server 192.168.3.50 --export /poka --nodes test02
```

## 仮想マシン

### 作成

- コマンドからじゃないと SG をアタッチできないらしい。
- 作成結果（成功/失敗）などを返してほしい

```sh
# 1. クローン作成 (9000 -> 105)
# --full 0 (同じストレージなら爆速)（でも無理）, --full 1 (別ストレージなら完全コピー)
qm clone 9000 105 --name "user-vm" --full 1

# 2. 基本スペックとネットワークのFirewallフラグ有効化（firewall=1じゃないとSGは意味ない、すべてのNICでfirewall=1にすべき）
qm set 105 --cores 2 --memory 2048 --net0 virtio,bridge=vmbr0,firewall=1

# 3. Security Group (SG) のアタッチ
# qm set ではできないため、API用CLIツール "pvesh" を使います
# 例: net0 に "web-server-sg" を適用
pvesh create /nodes/localhost/qemu/105/firewall/rules --type group --action web-server-sg --comment {SGのUUID}
```

## バックアップ

- dd コマンドを使ってストレージをファイルにダンプ
- 復元も dd でいいはず

```sh
# 1. スナップショット作成 (例: vm-105-disk-0 を対象に、snap-tmp という名前で)
# -L 1G は変更差分用の一時領域サイズ
lvcreate -s -n snap-tmp -L 1G /dev/pve/vm-105-disk-0

# 2. ddでファイルへ書き出し
dd if=/dev/pve/snap-tmp of=/mnt/backup/vm-105.img bs=1M status=progress

# 3. スナップショット削除
lvremove -f /dev/pve/snap-tmp
```

```sh
# 1. VM停止
qm stop 105

# 2. ddで書き戻し
dd if=/mnt/backup/vm-105.img of=/dev/pve/vm-105-disk-0 bs=1M status=progress

# 3. VM起動
qm start 105
```
