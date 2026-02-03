import { H3Error, H3Event } from "h3";

// 投げられたエラーをAPI仕様に準拠したレスポンスにして送信するエラーハンドラ
export default defineNitroErrorHandler(
  async (error: H3Error, event: H3Event) => {
    const statusCode = error.statusCode || 500;

    const res = createErrorResponse(
      statusCode,
      error.statusMessage || "Internal Server Error",
      error.message,
    );
    setHeader(event, "Content-Type", "application/json");
    setResponseStatus(event, res.status);
    return send(event, JSON.stringify(res));
  },
);
