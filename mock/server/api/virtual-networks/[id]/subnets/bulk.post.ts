export default defineEventHandler(async (event) => {
  throw createError({
    statusCode: 501,
    statusMessage: "Not implemented in mock server",
  });
});
