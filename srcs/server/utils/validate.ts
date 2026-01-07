import { treeifyError, z } from "zod";
import { looseUuidSchema } from "@@/server/zodSchemas";

export const validateUUID = (id: string | undefined): string => {
  // idもらえなかったら400投げる
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "ID is required" });
  }

  const uuidSchema = looseUuidSchema;
  const parseResult = uuidSchema.safeParse(id);

  if (!parseResult.success) {
    throw createError({
      statusCode: 400,
      statusMessage: treeifyError(parseResult.error).errors.join(", "),
    });
  }
  return parseResult.data;
};

export const validateQuery = (
  query: string | undefined,
  schema: z.ZodType
): string => {
  // queryもらえなかったら400投げる
  if (!query) {
    throw createError({ statusCode: 400, statusMessage: "Query is required" });
  }

  const parseResult = schema.safeParse(query);

  if (!parseResult.success) {
    throw createError({
      statusCode: 400,
      statusMessage: treeifyError(parseResult.error).errors.join(", "),
    });
  }
  return parseResult.data as string;
};

export const validateBody = <T>(body: T | undefined, schema: z.ZodType): T => {
  // bodyもらえなかったら400投げる
  if (!body) {
    throw createError({ statusCode: 400, statusMessage: "Body is required" });
  }

  const parseResult = schema.safeParse(body);

  if (!parseResult.success) {
    console.log(parseResult.error);
    throw createError({
      statusCode: 400,
      statusMessage: treeifyError(parseResult.error).errors.join(", "),
    });
  }
  return parseResult.data as T;
};
