import { JWTPayload, SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "secret-key");
const alg = "HS256";

export async function signToken(payload: KCIJWTPayload): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(secret);
}

export async function verifyToken(
  token: string
): Promise<KCIJWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as KCIJWTPayload;
  } catch (e) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Token verification failed:", e);
    }
    return null;
  }
}

export interface KCIJWTPayload extends JWTPayload {
  isAdmin: boolean;
  userId: string; // UUID format
}
