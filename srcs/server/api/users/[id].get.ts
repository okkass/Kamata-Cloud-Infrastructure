import { validate } from "uuid";

export default defineEventHandler((event) => {
  const id = event.context.params?.id;

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Error",
    });
  } else if (!validate(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid format",
    });
  } else {
    if (id == "a575c9ea-96fb-4ed3-9d92-d93712d0e2cc") {
      return {
        id: "r14093834-c1e9-4197-8def-ffdf31d1a63b",
        name: "Alice",
        email: "sample@example.com",
        createdAt: new Date().toISOString(),
        isAdmin: true,
        lastLoginAt: new Date().toISOString(),
      };
    } else {
      return {
        d: "ff09658a-6b02-4c99-bb05-cf8487411d1f",
        name: "Bob",
        email: "sample@example.com",
        createdAt: new Date().toISOString(),
        isAdmin: true,
        lastLoginAt: new Date().toISOString(),
      };
    }
  }
});
