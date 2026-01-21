import { UserCredentialsRepository } from "@/repository/UserCredentials";
import { UserRepository } from "@/repository/UserRepository";

export default defineEventHandler(async (event) => {
  const { id } = event.context.params as { id: string };
  const body = await readBody(event);
  const { currentPassword, newPassword } = body as {
    currentPassword: string;
    newPassword: string;
  };

  // ユーザーが存在するか確認
  const user = UserRepository.getById(id);
  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      data: { message: "ユーザーが見つかりません。" },
    });
  }

  // 現在のパスワードを検証
  const credentials = UserCredentialsRepository.getById(id);
  if (!credentials) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
      data: { message: "ユーザーの認証情報が見つかりません。" },
    });
  }

  if (credentials.password !== currentPassword) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
      data: { message: "現在のパスワードが正しくありません。" },
    });
  }

  // パスワードを更新
  const updated = UserCredentialsRepository.update(
    id,
    currentPassword,
    newPassword
  );
  if (!updated) {
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      data: { message: "パスワードの更新に失敗しました。" },
    });
  }

  return { success: true, data: null };
});
