import { getPrismaClient, NotFoundError } from "./common";
import { randomBytes, createHash } from "node:crypto";

const TOKEN_LENGTH = 32; // 32 bytes
const TOKEN_EXPIRATION_DAYS = 7; // 7 days

interface RefreshTokenInfo {
  userId: string;
  expiredAt: Date;
  revokedAt: Date | null;
}

const createRefreshToken = async (uuid: string): Promise<string> => {
  const prisma = getPrismaClient();
  // userIdを引っ張ってくる
  const user = await prisma.user.findUnique({
    where: {
      uuid: uuid,
    },
    select: {
      id: true,
    },
  });
  if (!user) {
    throw new NotFoundError("User not found");
  }
  const tokenBuffer = randomBytes(TOKEN_LENGTH);
  const hashedToken = createHash("sha256").update(tokenBuffer).digest();
  const now = new Date();
  const expiredAt = new Date(
    now.getTime() + TOKEN_EXPIRATION_DAYS * 24 * 60 * 60 * 1000
  );
  await prisma.refreshToken.create({
    data: {
      token: hashedToken,
      userId: user.id,
      expiredAt: expiredAt,
    },
  });
  return tokenBuffer.toString("base64");
};

const getRefreshTokenByToken = async (
  token: string
): Promise<RefreshTokenInfo | null> => {
  const prisma = getPrismaClient();
  const tokenBuffer = Buffer.from(token, "base64");
  const hashedToken = createHash("sha256").update(tokenBuffer).digest();
  const refreshToken = await prisma.refreshToken.findUnique({
    where: {
      token: hashedToken,
    },
  });
  if (!refreshToken) {
    return null;
  }
  const user = await prisma.user.findUnique({
    where: {
      id: refreshToken.userId,
    },
    select: {
      uuid: true,
    },
  });
  if (!user) {
    return null;
  }
  return {
    userId: user.uuid,
    expiredAt: refreshToken.expiredAt,
    revokedAt: refreshToken.revokedAt,
  };
};

const revokeRefreshToken = async (token: string): Promise<void> => {
  const prisma = getPrismaClient();
  const tokenBuffer = Buffer.from(token, "base64");
  const hashedToken = createHash("sha256").update(tokenBuffer).digest();
  await prisma.refreshToken.update({
    where: {
      token: hashedToken,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
};

const revokeTokenByUserId = async (userId: string): Promise<void> => {
  const prisma = getPrismaClient();
  const user = await prisma.user.findUnique({
    where: {
      uuid: userId,
    },
    select: {
      id: true,
    },
  });
  if (!user) {
    throw new NotFoundError("User not found");
  }
  await prisma.refreshToken.updateMany({
    where: {
      userId: user.id,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
};

const TokenRepository = {
  createRefreshToken,
  getRefreshTokenByToken,
  revokeRefreshToken,
  revokeTokenByUserId,
};

export default TokenRepository;
