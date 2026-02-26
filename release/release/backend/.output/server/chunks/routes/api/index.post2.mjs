import { d as defineEventHandler, c as createError, s as setResponseStatus } from '../../nitro/nitro.mjs';
import Busboy from 'busboy';
import { c as createResource } from '../../_/serviceResultHandler.mjs';
import { g as getPermissionFromEvent } from '../../_/permission.mjs';
import { g as getImageService } from '../../_/ImageService.mjs';
import path__default from 'node:path';
import fs from 'node:fs';
import { c as createImageSchema } from '../../_/image.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:crypto';
import 'node:url';
import 'jose';
import '@prisma/client/runtime/client';
import '@prisma/adapter-mariadb';
import 'argon2';
import 'zod';
import '../../_/mathUtils.mjs';
import '../../_/StoragePoolService.mjs';
import '../../_/NodeService.mjs';

const index_post = defineEventHandler(async (event) => {
  return new Promise((resolve, reject) => {
    const req = event.node.req;
    const busboy = Busboy({
      headers: req.headers,
      limits: {
        files: 1,
        fileSize: 32 * 1024 * 1024 * 1024
        // 32 GB
      }
    });
    let metaRaw;
    let savedFilePath;
    busboy.on("field", (name, value) => {
      if (name === "metadata") {
        metaRaw = value;
      }
    });
    busboy.on("file", (name, stream, info) => {
      if (name !== "file") {
        stream.resume();
        return;
      }
      const uploadDir = "/tmp";
      const fileName = "received";
      const filePath = path__default.join(uploadDir, fileName);
      savedFilePath = filePath;
      const writeStream = fs.createWriteStream(filePath);
      stream.pipe(writeStream);
      writeStream.on("error", reject);
    });
    busboy.on("finish", () => {
      try {
        if (!metaRaw) {
          throw createError({
            statusCode: 400,
            statusMessage: "Missing metadata field"
          });
        }
        let metadata;
        try {
          metadata = JSON.parse(metaRaw);
        } catch {
          throw createError({
            statusCode: 400,
            statusMessage: "Invalid JSON in metadata field"
          });
        }
        if (!savedFilePath) {
          throw createError({
            statusCode: 400,
            statusMessage: "Missing file field"
          });
        }
        const permission = getPermissionFromEvent(event);
        const service = getImageService(permission);
        setResponseStatus(event, 201);
        const result = createResource(
          metadata,
          createImageSchema,
          service.create
        );
        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
    busboy.on("error", reject);
    req.pipe(busboy);
  });
});

export { index_post as default };
//# sourceMappingURL=index.post2.mjs.map
