import Busboy from "busboy";
import { createResource } from "@@/server/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@@/server/utils/permission";
import { getImageService } from "@@/server/service/ImageService";
import { ImageCreateRequest } from "@@/shared/types";
import { createImageSchema } from "@@/server/zodSchemas";
import path from "node:path";
import fs from "node:fs";

export default defineEventHandler(async (event) => {
  return new Promise((resolve, reject) => {
    const req = event.node.req;

    const busboy = Busboy({
      headers: req.headers,
      limits: {
        files: 1,
        fileSize: 32 * 1024 * 1024 * 1024, // 32 GB
      },
    });
    let metaRaw: string | undefined;
    let savedFilePath: string | undefined;

    // メタデータの処理
    busboy.on("field", (name, value) => {
      if (name === "metadata") {
        metaRaw = value;
      }
    });
    // ファイルの処理
    busboy.on("file", (name, stream, info) => {
      if (name !== "file") {
        stream.resume(); // 不要なファイルは破棄
        return;
      }
      const uploadDir = "/tmp";
      const fileName = "received";
      const filePath = path.join(uploadDir, fileName);

      savedFilePath = filePath;
      const writeStream = fs.createWriteStream(filePath);
      stream.pipe(writeStream);

      writeStream.on("error", reject);
    });

    // 全部読み終わったら
    busboy.on("finish", () => {
      try {
        if (!metaRaw) {
          throw createError({
            statusCode: 400,
            statusMessage: "Missing metadata field",
          });
        }
        let metadata: unknown;
        try {
          metadata = JSON.parse(metaRaw);
        } catch {
          throw createError({
            statusCode: 400,
            statusMessage: "Invalid JSON in metadata field",
          });
        }
        if (!savedFilePath) {
          throw createError({
            statusCode: 400,
            statusMessage: "Missing file field",
          });
        }
        const permission = getPermissionFromEvent(event);
        const service = getImageService(permission);
        setResponseStatus(event, 201);
        const result = createResource(
          metadata as ImageCreateRequest,
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
