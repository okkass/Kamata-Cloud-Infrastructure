#!/bin/bash
set -e

# setup pnpm
pnpm install --frozen-lockfile
# set JWT_SECRET
echo 'export JWT_SECRET=$(openssl rand -base64 48)' >> ~/.bashrc
# set prisma
cd backend
pnpx prisma migrate dev
pnpx prisma db seed
pnpx prisma generate