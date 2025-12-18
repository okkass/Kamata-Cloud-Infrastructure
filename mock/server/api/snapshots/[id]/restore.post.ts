export default defineEventHandler((event) => {
  throw createError({ statusCode: 501, statusMessage: "Not Implemented" });
});
