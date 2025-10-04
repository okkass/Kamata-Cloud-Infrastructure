import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding test data started...");

  // データ1: 公開済みの記事
  await prisma.test.upsert({
    where: { id: 1 }, // IDで存在チェック
    update: {}, // 存在する場合は何もしない
    create: {
      id: 1,
      title: "Prisma入門",
      content: "この記事ではPrismaの基本的な使い方を解説します。",
      published: true,
      createdAt: new Date("2025-09-28T10:00:00Z"),
    },
  });

  // データ2: 下書きの記事 (contentはnull)
  await prisma.test.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      title: "Nuxt 4の新機能まとめ",
      content: null, // contentはオプショナルなのでnullもOK
      published: false,
      createdAt: new Date("2025-09-29T12:30:00Z"),
    },
  });

  // データ3: タイトルの長い記事
  await prisma.test.upsert({
    where: { id: 3 },
    update: {},
    create: {
      id: 3,
      title:
        "DevコンテナとGitHub Actionsで実現するモダンな開発フローとCI/CDパイプラインの構築方法",
      content:
        "開発環境のDocker化から、テスト、ビルド、デプロイの自動化までを網羅的に解説します。",
      published: true,
    },
  });

  // データ4: コンテンツのない公開記事
  await prisma.test.upsert({
    where: { id: 4 },
    update: {},
    create: {
      id: 4,
      title: "今日のひとこと",
      content: null,
      published: true,
    },
  });

  console.log("Seeding test data finished.");
}

// スクリプトの実行とエラーハンドリング
main()
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
