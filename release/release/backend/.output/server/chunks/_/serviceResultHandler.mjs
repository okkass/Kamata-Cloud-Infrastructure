import { c as createError } from '../nitro/nitro.mjs';
import { z, treeifyError } from 'zod';

const looseUuidSchema = z.string().regex(
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
);

const validateUUID = (id) => {
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
      statusMessage: treeifyError(parseResult.error).errors.join(", ")
    });
  }
  return parseResult.data;
};
const validateBody = (body, schema) => {
  if (!body) {
    console.log("Body is missing");
    throw createError({ statusCode: 400, statusMessage: "Body is required" });
  }
  const parseResult = schema.safeParse(body);
  if (!parseResult.success) {
    console.log("Invalid Body:", parseResult.error);
    throw createError({
      statusCode: 400,
      statusMessage: treeifyError(parseResult.error).errors.join(", ")
    });
  }
  return parseResult.data;
};

const throwServiceError = (error) => {
  var _a, _b, _c, _d, _e;
  switch (error.reason) {
    case "NotFound":
      throw createError({
        statusCode: 404,
        message: "Resource not found\n" + ((_a = error.message) != null ? _a : "")
      });
    case "BadRequest":
      throw createError({
        statusCode: 400,
        message: "Bad request\n" + ((_b = error.message) != null ? _b : "")
      });
    case "Forbidden":
      throw createError({
        statusCode: 403,
        message: "Forbidden\n" + ((_c = error.message) != null ? _c : "")
      });
    case "NotImplemented":
      throw createError({
        statusCode: 501,
        message: "Not implemented\n" + ((_d = error.message) != null ? _d : "")
      });
    default:
      throw createError({
        statusCode: 500,
        message: "Internal server error\n" + ((_e = error.message) != null ? _e : "")
      });
  }
};
const getResourceList = async (listFunc, query, querySchema) => {
  let validatedQuery = void 0;
  const result = await listFunc(validatedQuery);
  if (!result.success) {
    throwServiceError(result.error);
  }
  return result.data;
};
const getResource = async (resourceId, getByIdFunc) => {
  const validatedId = validateUUID(resourceId);
  const result = await getByIdFunc(validatedId);
  if (!result.success) {
    throwServiceError(result.error);
  }
  return result.data;
};
const createResource = async (requestBody, bodySchema, createFunc) => {
  const body = validateBody(requestBody, bodySchema);
  const result = await createFunc(body);
  if (!result.success) {
    console.error("createResource error:", result.error);
    throwServiceError(result.error);
  }
  return result.data;
};
const updateResource = async (id, requestBody, bodySchema, updateFunc) => {
  const validatedId = validateUUID(id);
  const body = validateBody(requestBody, bodySchema);
  const result = await updateFunc(validatedId, body);
  if (!result.success) {
    throwServiceError(result.error);
  }
  return result.data;
};
const deleteResource = async (id, deleteFunc) => {
  const validatedId = validateUUID(id);
  const result = await deleteFunc(validatedId);
  if (!result.success) {
    throwServiceError(result.error);
  }
  return;
};
const bulkResource = async (body, createSchema, updateSchema, createFunc, updateFunc, deleteFunc, listFunc) => {
  await Promise.all([
    ...body.add.map(
      (item) => createResource(item, createSchema, createFunc)
    ),
    ...body.patch.map(
      (item) => updateResource(item.id, item.data, updateSchema, updateFunc)
    ),
    ...body.remove.map((id) => deleteResource(id, deleteFunc))
  ]);
  return getResourceList(listFunc);
};

export { getResourceList as a, bulkResource as b, createResource as c, deleteResource as d, getResource as g, looseUuidSchema as l, updateResource as u, validateUUID as v };
//# sourceMappingURL=serviceResultHandler.mjs.map
