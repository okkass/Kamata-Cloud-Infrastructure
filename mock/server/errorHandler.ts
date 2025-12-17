import { H3Error, H3Event } from "h3";
import { createErrorResponse } from "./utils/errors";

// 投げられたエラーをAPI仕様に準拠したレスポンスにして送信するエラーハンドラ
export default defineNitroErrorHandler(
  async (error: H3Error, event: H3Event) => {
    const statusCode = error.statusCode || 500;

    const res = createErrorResponse(
      statusCode,
      error.statusMessage || error.message || "Internal Server Error"
    );

    setResponseStatus(event, res.status);
    return send(event, JSON.stringify(res));
  }
);
