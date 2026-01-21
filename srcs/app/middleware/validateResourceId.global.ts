// 詳細ページのIDをUUID形式で事前検証し、不正なら404エラーを発行してカスタムエラーページへ誘導するグローバルミドルウェア。
export default defineNuxtRouteMiddleware((to) => {
  const id = to.params?.id;
  // 対象となる詳細ページのパス（先頭一致）
  const detailPrefixes = [
    "/machine/",
    "/node/",
    "/image/",
    "/network/",
    "/security-group/",
    "/storage-pool/",
  ];

  // 詳細ページに該当しない場合はスキップ
  const isDetailRoute = detailPrefixes.some((p) => to.path.startsWith(p));
  if (!isDetailRoute) return;

  // UUID v4 形式チェック
  const UUID_REGEX =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

  if (typeof id === "string" && !UUID_REGEX.test(id)) {
    const err = createError({
      statusCode: 404,
      statusMessage: "ページが見つかりません",
      message: "指定されたIDの形式が不正です。",
      data: { detail: "Invalid resource id format (UUID expected)." },
    });
    return abortNavigation(err);
  }
});
