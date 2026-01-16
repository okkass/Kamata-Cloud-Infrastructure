import Busboy from "busboy";
import { createResource } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getImageService } from "@/service/ImageService";
import { ImageCreateRequest } from "@app/shared/types";
import { createImageSchema } from "@/zodSchemas";
import path from "node:path";
import fs from "node:fs";

export default defineEventHandler(async (event) => {
  return new Promise((resolve, reject) => {
    const req = event.node.req;

    console.log("[DEBUG] Image upload started");
    console.log("[DEBUG] Content-Type:", req.headers["content-type"]);

    const busboy = Busboy({
      headers: req.headers,
      limits: {
        files: 1,
        fileSize: 32 * 1024 * 1024 * 1024, // 32 GB
      },
    });
    let metaRaw: string | undefined;
    let savedFilePath: string | undefined;
    let fileWriteStream: fs.WriteStream | undefined;
    let fileWriteComplete = false;

    // メタデータの処理
    busboy.on("field", (name, value) => {
      console.log(`[DEBUG] Field received: ${name}`);
      if (name === "metadata") {
        console.log("[DEBUG] Metadata value:", value);
        metaRaw = value;
      }
    });

    // ファイルの処理
    busboy.on("file", (name, stream, info) => {
      console.log(`[DEBUG] File field received: ${name}`, info);
      if (name !== "file") {
        stream.resume(); // 不要なファイルは破棄
        return;
      }
      const uploadDir = "/tmp";
      const fileName = `image-${Date.now()}`;
      const filePath = path.join(uploadDir, fileName);

      console.log("[DEBUG] File path:", filePath);
      savedFilePath = filePath;
      fileWriteStream = fs.createWriteStream(filePath);
      stream.pipe(fileWriteStream);

      fileWriteStream.on("finish", () => {
        console.log("[DEBUG] File write finished");
        fileWriteComplete = true;
      });

      fileWriteStream.on("error", (err) => {
        console.error("[DEBUG] File write error:", err);
        reject(err);
      });
    });

    // 全部読み終わったら
    busboy.on("finish", () => {
      console.log("[DEBUG] Busboy finish event - fileWriteComplete:", fileWriteComplete);
      // ファイル書き込み完了を待つ
      if (fileWriteStream && !fileWriteComplete) {
        console.log("[DEBUG] Waiting for file write to complete");
        fileWriteStream.once("finish", handleBusboyFinish);
      } else {
        console.log("[DEBUG] Proceeding with handleBusboyFinish");
        handleBusboyFinish();
      }
    });

    const handleBusboyFinish = () => {
      console.log("[DEBUG] handleBusboyFinish called");
      try {
        console.log("[DEBUG] metaRaw:", metaRaw);
        if (!metaRaw) {
          throw createError({
            statusCode: 400,
            statusMessage: "Missing metadata field",
          });
        }
        let metadata: unknown;
        try {
          metadata = JSON.parse(metaRaw);
          console.log("[DEBUG] Parsed metadata:", metadata);
        } catch (e) {
          console.error("[DEBUG] JSON parse error:", e);
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

        // ファイルパスをメタデータに追加
        const metadataWithPath = {
          ...(metadata as any),
          filePath: savedFilePath,
        };

        console.log("[DEBUG] Final metadata with path:", metadataWithPath);
        const result = createResource(
          metadataWithPath as ImageCreateRequest,
          createImageSchema,
          service.create
        );
        console.log("[DEBUG] Result:", result);
        resolve(result);
      } catch (err) {
        console.error("[DEBUG] Error in handleBusboyFinish:", err);
        reject(err);
      }
    };

    busboy.on("error", reject);

    req.pipe(busboy);
  });
});
