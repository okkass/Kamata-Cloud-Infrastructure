export default defineEventHandler(() => {
  throw createError({ statusCode: 501, statusMessage: "Not Implemented" });
});
