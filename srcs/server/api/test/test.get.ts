import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event): Promise<Test[]> => {
    const testDatas = await prisma.test.findMany({
        orderBy: { id: "desc" },
    });
    return testDatas;
});