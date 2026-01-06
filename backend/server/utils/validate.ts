import { treeifyError, z } from "zod";
import { looseUuidSchema } from "@/zodSchemas";

export const validateUUID = (id: string | undefined): string => {
  // idもらえなかったら400投げる
  if (!id) {
    console.log("ID is missing");
    throw createError({ statusCode: 400, statusMessage: "ID is required" });
  }

  const uuidSchema = looseUuidSchema;
  const parseResult = uuidSchema.safeParse(id);

  if (!parseResult.success) {
    console.log("Invalid UUID:", parseResult.error);
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
    console.log("Query is missing");
    throw createError({ statusCode: 400, statusMessage: "Query is required" });
  }

  const parseResult = schema.safeParse(query);

  if (!parseResult.success) {
    console.log("Invalid Query:", parseResult.error);
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
    console.log("Body is missing");
    throw createError({ statusCode: 400, statusMessage: "Body is required" });
  }

  const parseResult = schema.safeParse(body);

  if (!parseResult.success) {
    console.log("Invalid Body:", parseResult.error);
    throw createError({
      statusCode: 400,
      statusMessage: treeifyError(parseResult.error).errors.join(", "),
    });
  }
  return parseResult.data as T;
};
