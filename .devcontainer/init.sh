#!/bin/bash
set -e

# setup pnpm
pnpm install --frozen-lockfile

# set prisma
cd backend
# 一旦tsconfigを退避
mv tsconfig.json tsconfig.tmp.json
cp ../.devcontainer/backend/tsconfig.json.temp tsconfig.json
# prismaのセットアップ
pnpx prisma migrate dev
pnpx prisma generate
pnpx prisma db seed

# 退避しておいたtsconfigを戻す
rm tsconfig.json
mv tsconfig.tmp.json tsconfig.json

# nitroをビルド
pnpm run build

# setup .venv
cd ../tests
# .venvの環境があるか確認
if [ ! -d ".venv" ]; then
    python3 -m venv .venv
fi
# requirements.txtからパッケージをインストール
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt