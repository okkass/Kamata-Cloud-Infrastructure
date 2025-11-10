import { validate } from "uuid";

export default defineEventHandler((event) => {
  let user: UserDTO | undefined;
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
      user = {
        id: "a575c9ea-96fb-4ed3-9d92-d93712d0e2cc",
        name: "Alice",
        email: "sample@example.com",
        createdAt: new Date().toISOString(),
        isAdmin: true,
        lastLoginAt: new Date().toISOString(),
      };
    } else {
      user = {
        id: "ff09658a-6b02-4c99-bb05-cf8487411d1f",
        name: "Bob",
        email: "sample@example.com",
        createdAt: new Date().toISOString(),
        isAdmin: true,
        lastLoginAt: new Date().toISOString(),
      };
    }
  }
  return user;
});
