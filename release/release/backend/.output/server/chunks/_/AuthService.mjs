import { z } from 'zod';
import { a as getPrismaClient, N as NotFoundError, e as signToken, U as UserRepository } from '../nitro/nitro.mjs';
import { createHash, randomBytes } from 'node:crypto';
import * as argon2 from 'argon2';

const authSchema = z.object({
  email: z.email().max(256),
  password: z.string()
});
const refreshSchema = z.object({
  refreshToken: z.string().min(44).max(44)
});

const TOKEN_LENGTH = 32;
const TOKEN_EXPIRATION_DAYS = 7;
const createRefreshToken = async (uuid) => {
  const prisma = getPrismaClient();
  const user = await prisma.user.findUnique({
    where: {
      uuid
    },
    select: {
      id: true
    }
  });
  if (!user) {
    throw new NotFoundError("User not found");
  }
  const tokenBuffer = randomBytes(TOKEN_LENGTH);
  const hashedToken = createHash("sha256").update(tokenBuffer).digest();
  const now = /* @__PURE__ */ new Date();
  const expiredAt = new Date(
    now.getTime() + TOKEN_EXPIRATION_DAYS * 24 * 60 * 60 * 1e3
  );
  await prisma.refreshToken.create({
    data: {
      token: hashedToken,
      userId: user.id,
      expiredAt
    }
  });
  return tokenBuffer.toString("base64url");
};
const getRefreshTokenByToken = async (token) => {
  const prisma = getPrismaClient();
  const tokenBuffer = Buffer.from(token, "base64url");
  const hashedToken = createHash("sha256").update(tokenBuffer).digest();
  const refreshToken = await prisma.refreshToken.findUnique({
    where: {
      token: hashedToken
    }
  });
  if (!refreshToken) {
    return null;
  }
  const user = await prisma.user.findUnique({
    where: {
      id: refreshToken.userId
    },
    select: {
      uuid: true
    }
  });
  if (!user) {
    return null;
  }
  return {
    userId: user.uuid,
    expiredAt: refreshToken.expiredAt,
    revokedAt: refreshToken.revokedAt
  };
};
const revokeRefreshToken = async (token) => {
  const prisma = getPrismaClient();
  const tokenBuffer = Buffer.from(token, "base64url");
  const hashedToken = createHash("sha256").update(tokenBuffer).digest();
  await prisma.refreshToken.update({
    where: {
      token: hashedToken,
      revokedAt: null
    },
    data: {
      revokedAt: /* @__PURE__ */ new Date()
    }
  });
};
const revokeTokenByUserId = async (userId) => {
  const prisma = getPrismaClient();
  const user = await prisma.user.findUnique({
    where: {
      uuid: userId
    },
    select: {
      id: true
    }
  });
  if (!user) {
    throw new NotFoundError("User not found");
  }
  await prisma.refreshToken.updateMany({
    where: {
      userId: user.id,
      revokedAt: null
    },
    data: {
      revokedAt: /* @__PURE__ */ new Date()
    }
  });
};
const TokenRepository = {
  createRefreshToken,
  getRefreshTokenByToken,
  revokeRefreshToken,
  revokeTokenByUserId
};

const DUMMY_PASSWORD_HASH = "$argon2id$v=19$m=65536,t=3,p=4$HYmu5+sts9r523J4T7fAvQ$Aw4jIgOQ/vrB910OOwRh1f00Y3UluSAiLGSjkr19Mpk";
const getAuthService = () => {
  const authService = {
    login: async (req) => {
      try {
        const user = await UserRepository.getByEmail(req.email);
        if (!user) {
          await argon2.verify(DUMMY_PASSWORD_HASH, req.password);
          return {
            success: false,
            error: { reason: "Unauthorized" }
          };
        }
        const passwordValid = await argon2.verify(
          user.credentials.hashedPassword,
          req.password
        );
        if (!passwordValid) {
          return {
            success: false,
            error: { reason: "Unauthorized" }
          };
        }
        const refreshToken = await TokenRepository.createRefreshToken(
          user.uuid
        );
        const jwtPayload = {
          userId: user.uuid
        };
        const accessToken = await signToken(jwtPayload);
        await UserRepository.updateLastLoginAt(user.uuid);
        return {
          success: true,
          data: {
            token: accessToken,
            refreshToken
          }
        };
      } catch (error) {
        console.error("Login error:", error);
        return {
          success: false,
          error: { reason: "InternalError", message: "Login failed" }
        };
      }
    },
    logout: async (refreshToken) => {
      try {
        await TokenRepository.revokeRefreshToken(refreshToken);
        return { success: true, data: null };
      } catch (error) {
        console.error("Logout error:", error);
        return {
          success: false,
          error: { reason: "InternalError", message: "Logout failed" }
        };
      }
    },
    refresh: async (req) => {
      try {
        const storedToken = await TokenRepository.getRefreshTokenByToken(
          req.refreshToken
        );
        if (!storedToken || storedToken.revokedAt) {
          return {
            success: false,
            error: { reason: "Unauthorized" }
          };
        }
        if (storedToken.expiredAt < /* @__PURE__ */ new Date()) {
          return {
            success: false,
            error: { reason: "Unauthorized" }
          };
        }
        await TokenRepository.revokeRefreshToken(req.refreshToken);
        const newRefreshToken = await TokenRepository.createRefreshToken(
          storedToken.userId
        );
        const jwtPayload = {
          userId: storedToken.userId
        };
        const newAccessToken = await signToken(jwtPayload);
        return {
          success: true,
          data: {
            token: newAccessToken,
            refreshToken: newRefreshToken
          }
        };
      } catch (error) {
        console.error("Token refresh error:", error);
        return {
          success: false,
          error: { reason: "InternalError", message: "Token refresh failed" }
        };
      }
    }
  };
  return authService;
};

export { authSchema as a, getAuthService as g, refreshSchema as r };
//# sourceMappingURL=AuthService.mjs.map
