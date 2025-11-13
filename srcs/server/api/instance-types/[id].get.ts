import { validate } from "uuid";

export default defineEventHandler((event) => {
  const id = event.context.params?.id;
  let instanceType: InstanceTypeDTO | undefined;

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
    if (id == "7b6fb312-8c89-44d2-a417-4665a4a9be83") {
      instanceType = {
        id: "7b6fb312-8c89-44d2-a417-4665a4a9be83",
        name: "t2.micro",
        createdAt: new Date().toISOString(),
        cpuCore: 1,
        memorySize: 1 * 1024 * 1024 * 1024, // 1 GB
      };
    } else {
      instanceType = {
        id: "2b03254f-5485-4286-8baa-77ebee3aea9b",
        name: "t2.standard",
        createdAt: new Date().toISOString(),
        cpuCore: 4,
        memorySize: 4 * 1024 * 1024 * 1024, // 4 GB
      };
    }
  }
  return instanceType;
});
