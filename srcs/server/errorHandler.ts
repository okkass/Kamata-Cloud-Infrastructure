import {
  H3Error,
  H3Event,
  setHeader,
  setResponseStatus,
  send,
  sendRedirect,
} from "h3";
import { createErrorResponse } from "@@/server/utils/errors";

// 投げられたエラーをAPI仕様に準拠したレスポンスにして送信するエラーハンドラ
export default defineNitroErrorHandler(
  async (error: H3Error, event: H3Event) => {
    const statusCode = error.statusCode || 500;
    const path = event.path || "";

    // APIエンドポイント (/api/ で始まるパス) の場合のみJSONレスポンスを返す
    if (path.startsWith("/api/")) {
      const res = createErrorResponse(
        statusCode,
        error.statusMessage || error.message || "Internal Server Error",
      );
      setHeader(event, "Content-Type", "application/json");
      setResponseStatus(event, res.status);
      return send(event, JSON.stringify(res));
    }

    // ページリクエストの場合: 404 だけは確実に HTML のカスタムエラーページに誘導する
    if (statusCode === 404) {
      const from = encodeURIComponent(path || "/");
      const msg = encodeURIComponent(
        (error.statusMessage || error.message || "Page not found") as string,
      );
      // SSR/CSR いずれでも /error ページに移動させる
      return sendRedirect(
        event,
        `/error?code=404&from=${from}&msg=${msg}`,
        302,
      );
    }

    // その他のページ系エラーは Nuxt の HTML エラーページへ委譲
    return;
  },
);
