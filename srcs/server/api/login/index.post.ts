import { signToken, KCIJWTPayload } from "../../utils/jwt";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "secret-key");
const alg = "HS256";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const email = body.email;
  const password = body.password;

  if (email.substring(0, 5) === "admin") {
    const payload: KCIJWTPayload = {
      isAdmin: true,
      userId: "a575c9ea-96fb-4ed3-9d92-d93712d0e2cc",
    };
    const token = await signToken(payload);
    return { token };
  }
});
