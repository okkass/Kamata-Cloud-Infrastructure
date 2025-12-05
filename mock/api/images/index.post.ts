import Busboy from "busboy";
import fs from "node:fs";
import path from "node:path";

export default defineEventHandler(async (event) => {
  // リクエストヘッダーから content-type を取得
  const contentType = getHeader(event, "content-type");

  if (!contentType || !contentType.includes("multipart/form-data")) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid Content-Type",
    });
  }

  // Busboyの初期化
  const busboy = Busboy({ headers: { "content-type": contentType } });

  const result = {
    fields: {} as Record<string, string>,
    files: [] as { filename: string; size: number }[],
  };

  // プロミスでラップして処理完了を待つ
  await new Promise((resolve, reject) => {
    // --- ファイルの処理 ---
    busboy.on("file", (name, fileStream, info) => {
      const { filename } = info;
      // 一時保存先のパス (適宜変更してください)
      const savePath = path.join("/tmp", filename);
      const writeStream = fs.createWriteStream(savePath);

      console.log(`Receiving file: ${filename}`);
      let size = 0;

      // ストリームをパイプで繋ぐ (メモリに溜めずにディスクに書く)
      fileStream.pipe(writeStream);
      // 雲嶽山流：fileStreamのエラーも見逃さずに捕まえる！
      fileStream.on("error", reject);

      fileStream.on("data", (chunk) => {
        size += chunk.length;
      });

      writeStream.on("finish", () => {
        console.log(`File saved: ${filename} (${size} bytes)`);
        result.files.push({ filename, size });
      });

      writeStream.on("error", reject);
    });

    // --- テキストフィールドの処理 ---
    busboy.on("field", (name, value) => {
      result.fields[name] = value;
    });

    // --- 完了時の処理 ---
    busboy.on("finish", resolve);
    busboy.on("error", reject);

    // Node.jsのRawリクエストストリームをBusboyに流し込む
    // h3の event.node.req は ReadableStream なのでそのまま pipe できる
    event.node.req.on("error", reject); // 雲嶽山の守りの型！エラーは逃さず捕まえる！
    event.node.req.pipe(busboy);
  });

  // 処理結果を返す
  return {
    success: true,
    message: "Upload processed successfully",
    data: {
      ...result.fields,
      files: result.files,
    },
  };
});
