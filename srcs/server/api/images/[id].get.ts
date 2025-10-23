import { validate } from "uuid";

export default defineEventHandler((event) => {
  const id = event.context.params?.id;
  let image: ImageDTO | undefined;

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
    if (id == "057a9f47-380e-43fe-b3c4-22a46cd97220") {
      image = {
        id: "057a9f47-380e-43fe-b3c4-22a46cd97220",
        name: "Ubuntu 22.04",
        description: "Setumei",
        createdAt: new Date().toISOString(),
        size: 19190 * 1024 * 1024, // 19190MB(19.19GB)をバイトで表現
      };
    } else {
      image = {
        id: "da4d9350-30f2-4280-82ce-0e5547209c1d",
        name: "Debian bookwarm",
        description: "Setumei",
        createdAt: new Date().toISOString(),
        size: 45450 * 1024 * 1024, // 45450MB(45.45GB)をバイトで表現
      };
    }
  }
  return image;
});
