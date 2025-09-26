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
      userId: "c201325b-793b-4d06-8b8f-7c397fad27fe",
    };
    const token = await signToken(payload);
    return { token };
  } else if (email.substring(0, 4) === "user") {
    const payload: KCIJWTPayload = {
      isAdmin: false,
      userId: "e0ee3918-a728-4158-98db-b04f8325fd55",
    };
    const token = await signToken(payload);
    return {
      token: token,
      refreshToken:
        "1d79ccff-c554-42d8-b643-2a26cf24630f.DzGuy2ph9TlHXKWZynPj0YiICe1FVh4t6TZQouMzwBA=",
    };
  } else {
    return createError({
      statusCode: 401,
      statusMessage: "Invalid email or password",
    });
  }
});
