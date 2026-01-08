#!/bin/bash
set -e

# setup pnpm
pnpm install --frozen-lockfile
# set prisma
cd backend
pnpx prisma migrate dev
pnpx prisma db seed
pnpx prisma generate

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