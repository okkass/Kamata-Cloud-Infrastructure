import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // 既存の投稿をすべて削除
  await prisma.test.deleteMany();

  // 新しい投稿を作成
  await prisma.test.create({
    data: {
      title: "Prismaを使ってみた",
      content: "データベースの操作がとても簡単になりました！",
      published: true,
    },
  });
  await prisma.test.create({
    data: {
      title: "Nuxt 3のAPIルート",
      content: "サーバーサイドのロジックを簡単に書けます。",
    },
  });
}

main()
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    // 最後にデータベース接続を閉じる
    await prisma.$disconnect();
  });
