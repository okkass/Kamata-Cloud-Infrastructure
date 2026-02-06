import { getPrismaClient } from "./common";
import type { Result } from "@/common/type";
import type { RepositoryError } from "@/common/errors";
import type { MiddlewareResponse } from "@app/shared/types";

const list = async (): Promise<
  Result<MiddlewareResponse[], RepositoryError>
> => {
  try {
    const prisma = getPrismaClient();
    const middlewares = await prisma.middleware.findMany({
      select: {
        uuid: true,
        name: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
    return {
      success: true,
      data: middlewares.map((mw) => ({
        id: mw.uuid,
        name: mw.name,
      })),
    };
  } catch (error) {
    return {
      success: false,
      error: {
        reason: "InternalError",
        message: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
};

export const MiddlewareRepository = {
  list,
};

export default MiddlewareRepository;
