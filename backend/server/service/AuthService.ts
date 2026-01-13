import type {
  LoginRequest,
  LoginResponse,
  RefreshRequest,
} from "@app/shared/types";
import TokenRepository from "@/repository/TokenRepository";
import UserRepository from "@/repository/UserRepository";
import * as argon2 from "argon2";
import type { ServiceError } from "@/common/errors";
import type { Result } from "@/common/type";
import { signToken, type KCIJWTPayload } from "@/utils/jwt";

const DUMMY_PASSWORD_HASH =
  "$argon2id$v=19$m=65536,t=3,p=4$HYmu5+sts9r523J4T7fAvQ$Aw4jIgOQ/vrB910OOwRh1f00Y3UluSAiLGSjkr19Mpk"; // ダミーのパスワードハッシュ

type AuthService = {
  login: (req: LoginRequest) => Promise<Result<LoginResponse, ServiceError>>;
  logout: (refreshToken: string) => Promise<Result<null, ServiceError>>;
  refresh: (
    req: RefreshRequest
  ) => Promise<Result<LoginResponse, ServiceError>>;
};

export const getAuthService = (): AuthService => {
  const authService: AuthService = {
    login: async (req: LoginRequest) => {
      try {
        const user = await UserRepository.getByEmail(req.email);
        if (!user) {
          console.error("User not found for email:", req.email);
          // ユーザが見つからないときはダミーのハッシュと比較して時間を稼ぐ
          await argon2.verify(DUMMY_PASSWORD_HASH, req.password);
          return {
            success: false,
            error: { reason: "Unauthorized" },
          };
        }
        const passwordValid = await argon2.verify(
          user.credentials!.hashedPassword,
          req.password
        );
        if (!passwordValid) {
          return {
            success: false,
            error: { reason: "Unauthorized" },
          };
        }
        // ログイン成功の処理
        // リフレッシュトークンの作成
        const refreshToken = await TokenRepository.createRefreshToken(
          user.uuid
        );
        // JWTの作成
        const jwtPayload: KCIJWTPayload = {
          userId: user.uuid,
        };
        const accessToken = await signToken(jwtPayload);
        // 最終ログインの更新
        await UserRepository.updateLastLoginAt(user.uuid);
        return {
          success: true,
          data: {
            token: accessToken,
            refreshToken: refreshToken,
          },
        };
      } catch (error) {
        console.error("Login error:", error);
        return {
          success: false,
          error: { reason: "InternalError", message: "Login failed" },
        };
      }
    },
    logout: async (refreshToken: string) => {
      // リフレッシュトークンの無効化
      try {
        await TokenRepository.revokeRefreshToken(refreshToken);
        return { success: true, data: null };
      } catch (error) {
        console.error("Logout error:", error);
        return {
          success: false,
          error: { reason: "InternalError", message: "Logout failed" },
        };
      }
    },
    refresh: async (req: RefreshRequest) => {
      // リフレッシュトークンの検証と新しいJWTの発行
      try {
        // リフレッシュトークンの取得
        const storedToken = await TokenRepository.getRefreshTokenByToken(
          req.refreshToken
        );
        // 無効化されてたら拒否
        if (!storedToken || storedToken.revokedAt) {
          return {
            success: false,
            error: { reason: "Unauthorized" },
          };
        }
        // 有効期限切れてたら拒否
        if (storedToken.expiredAt < new Date()) {
          return {
            success: false,
            error: { reason: "Unauthorized" },
          };
        }

        // トークン更新処理
        // 旧リフレッシュトークンの無効化
        await TokenRepository.revokeRefreshToken(req.refreshToken);
        // 新しいリフレッシュトークンの発行
        const newRefreshToken = await TokenRepository.createRefreshToken(
          storedToken.userId
        );
        // 新しいJWTの発行
        const jwtPayload: KCIJWTPayload = {
          userId: storedToken.userId,
        };
        const newAccessToken = await signToken(jwtPayload);
        return {
          success: true,
          data: {
            token: newAccessToken,
            refreshToken: newRefreshToken,
          },
        };
      } catch (error) {
        console.error("Token refresh error:", error);
        return {
          success: false,
          error: { reason: "InternalError", message: "Token refresh failed" },
        };
      }
    },
  };
  return authService;
};
