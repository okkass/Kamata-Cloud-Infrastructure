import { a as getPrismaClient, d as defineEventHandler } from '../../nitro/nitro.mjs';
import { a as getResourceList } from '../../_/serviceResultHandler.mjs';
import { g as getPermissionFromEvent } from '../../_/permission.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import 'jose';
import '@prisma/client/runtime/client';
import '@prisma/adapter-mariadb';
import 'argon2';
import 'zod';

const list = async () => {
  try {
    const prisma = getPrismaClient();
    const middlewares = await prisma.middleware.findMany({
      select: {
        uuid: true,
        name: true
      },
      orderBy: {
        createdAt: "asc"
      }
    });
    return {
      success: true,
      data: middlewares.map((mw) => ({
        id: mw.uuid,
        name: mw.name
      }))
    };
  } catch (error) {
    return {
      success: false,
      error: {
        reason: "InternalError",
        message: error instanceof Error ? error.message : "Unknown error"
      }
    };
  }
};
const MiddlewareRepository = {
  list
};

const getMiddlewareService = (permission) => {
  const MiddlewareService = {
    list: async (query) => {
      const result = await MiddlewareRepository.list();
      if (!result.success) {
        return {
          success: false,
          error: {
            reason: "InternalError",
            message: result.error.message
          }
        };
      }
      return {
        success: true,
        data: result.data
      };
    },
    getById: async (id) => {
      return {
        success: false,
        error: {
          reason: "BadRequest"
        }
      };
    },
    create: async (data) => {
      return {
        success: false,
        error: {
          reason: "BadRequest"
        }
      };
    },
    update: async (id, data) => {
      return {
        success: false,
        error: {
          reason: "BadRequest"
        }
      };
    },
    delete: async (id) => {
      return {
        success: false,
        error: {
          reason: "BadRequest"
        }
      };
    }
  };
  return MiddlewareService;
};

const index_get = defineEventHandler((event) => {
  getPermissionFromEvent(event);
  const service = getMiddlewareService();
  return getResourceList(service.list);
});

export { index_get as default };
//# sourceMappingURL=index.get5.mjs.map
