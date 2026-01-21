## イメージ

### テンプレート化

- アップロードした OS イメージをテンプレートに変換する

```
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

```
# Goの os.Remove() 推奨ですが、コマンドなら:
rm -f /var/lib/vz/template/iso/upload.img
```

## ノード追加機能(優先度低め)

- ノードの認識(この agent が ip アドレスとかの返答を返すようにする)
- 追加は、なんか SSh を使った大規模からくり仕掛け？

```
# 先頭のプライベートIPだけを取得
hostname -I | awk '{print $1}'
```

```
# expectとか使うかも
pvecm add 192.168.3.10
```

## ストレージプール

### 新規作成

- 新しいストレージを LVM 構築する
- NFS を構築する
- 返却値を別途検討(ストレージプールを識別するため)

#### NFS-KERNEL-SERVERのインストール

```
# 必要なパッケージのインストール
apt update
apt install nfs-kernel-server -y

# EXPORTSファイルの準備
mkdir -p /etc/exports.d
```

#### LVM の新規作成

```
# 1. 物理ボリューム (PV) の初期化
# デバイス名はユーザー入力、または lsblk 等で特定したもの
pvcreate /dev/sdb

# 2. ボリュームグループ (VG) の作成
# 名前 (new-vg) は一意になるよう生成する
vgcreate new-vg /dev/sdb

# 3. Proxmoxへの登録
# id: Proxmox上での表示名 (例: secondary-lvm)
# vgname: 作成したVG名
# content: images,rootdir (VMディスクとコンテナ用)
pvesm add lvm secondary-lvm --vgname new-vg --content images,rootdir
```

#### 領域の作成と公開

```
# 1. LV (論理ボリューム) の切り出し
# -L: サイズ (例: 500G), -n: LV名 (例: nfs-vol-01), pve: 親VG名
lvcreate -L 500G -n nfs-vol-01 pve

# 2. フォーマット (ext4)
mkfs.ext4 /dev/pve/nfs-vol-01

# 3. マウントポイント作成
mkdir -p /mnt/nfs/nfs-vol-01

# 4. マウント
mount /dev/pve/nfs-vol-01 /mnt/nfs/nfs-vol-01

# 5. fstabへの追記 (再起動後もマウントされるように)
# Goでファイルを追記編集するか、以下のコマンドを実行
echo "/dev/pve/nfs-vol-01 /mnt/nfs/nfs-vol-01 ext4 defaults 0 0" >> /etc/fstab

# 6. NFS公開設定 (/etc/exports への追記)
# no_root_squash は必須
echo "/mnt/nfs/nfs-vol-01 192.168.3.0/24(rw,sync,no_root_squash,no_subtree_check)" >> /etc/exports

# 7. 設定反映
exportfs -a
systemctl reload nfs-kernel-server
```

#### PVE に登録

```
# id: shared-nfs-01 (Proxmoxでの表示名)
# server: 自分のIP (192.168.3.40)
# export: 公開したパス (/mnt/nfs/nfs-vol-01)
# content: images,iso (VMイメージとISOファイル用)
pvesm add nfs shared-nfs-01 --server 192.168.3.40 --export /mnt/nfs/nfs-vol-01 --content images,iso
```

### 更新

- NFS サーバーの設定を変更する窓口

## 仮想マシン

### 作成

- コマンドからじゃないと SG をアタッチできないらしい。
- 作成結果（成功/失敗）などを返してほしい

```
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

```
# 1. スナップショット作成 (例: vm-105-disk-0 を対象に、snap-tmp という名前で)
# -L 1G は変更差分用の一時領域サイズ
lvcreate -s -n snap-tmp -L 1G /dev/pve/vm-105-disk-0

# 2. ddでファイルへ書き出し
dd if=/dev/pve/snap-tmp of=/mnt/backup/vm-105.img bs=1M status=progress

# 3. スナップショット削除
lvremove -f /dev/pve/snap-tmp
```

```
# 1. VM停止
qm stop 105

# 2. ddで書き戻し
dd if=/mnt/backup/vm-105.img of=/dev/pve/vm-105-disk-0 bs=1M status=progress

# 3. VM起動
qm start 105
```