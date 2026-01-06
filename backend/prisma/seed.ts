import { PrismaClient } from "@@/generated/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import * as argon2 from "argon2";

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  port: 3306,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding test data started...");
  const hash = await argon2.hash("my-strong-password");

  // トランザクションでユーザとパスワードを作成
  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: "Test User",
        email: "poka@example.com",
      },
    });
    console.log(`Created user with ID: ${user.id}`);
    await tx.userCredential.create({
      data: {
        userId: user.id,
        hashedPassword: hash,
      },
    });
    console.log(`Created credentials for user ID: ${user.id}`);
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
