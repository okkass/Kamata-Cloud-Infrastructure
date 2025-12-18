// srcs/scripts/test-seed.ts

import { PrismaClient } from "../generated/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const adapter = new PrismaMariaDb({
  host: "mysql",
  port: 3306,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🚀 テストデータの作成を開始します...");

  // ユーザーを作成（同時に権限とパスワードも作成する「ネステッド書き込み」）
  const newUser = await prisma.user.create({
    data: {
      name: "Test Administrator",
      email: "admindawdawdawd@example.com", // ユニーク制約に注意

      // Permission (FK) が必須なので、ここで一緒に作っちゃいます
      permission: {
        create: {
          isAdmin: true,
          isImageAdmin: true,
          isNetworkAdmin: true,
        },
      },

      // 1対1の関係にある UserCredential も一緒に作成
      credentials: {
        create: {
          hashedPassword: "super_secret_hashed_password_123",
        },
      },

      // クオータ設定（デフォルト値があるので省略してもOKですが明示的に入れてみます）
      cpuLimitCores: 10,
      memoryLimitMb: 16384,
      storageLimitGb: 500,
    },
    // 作成されたデータに関連データも含めて取得して表示する設定
    include: {
      permission: true,
      credentials: true,
    },
  });

  console.log("✅ ユーザー作成成功:", newUser);

  // ついでにこのユーザーに紐づくポートフォリオも作ってみる
  const newPortfolio = await prisma.portfolio.create({
    data: {
      userId: newUser.id, // 作成したユーザーのID (BigInt) を指定
      articles: {
        create: [
          { title: "My First Project" },
          { title: "Server Configuration Log" },
        ],
      },
    },
    include: {
      articles: true,
    },
  });

  console.log("✅ ポートフォリオ作成成功:", newPortfolio);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ エラーが発生しました:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
