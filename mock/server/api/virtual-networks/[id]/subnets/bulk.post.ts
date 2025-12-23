export default defineEventHandler(async (event) => {
  createError({
    statusCode: 501,
    message: "Not implemented in mock server",
  });
});
