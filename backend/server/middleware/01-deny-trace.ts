export default defineEventHandler((event) => {
  if (getMethod(event) === "TRACE") {
    throw createError({
      statusCode: 501,
      statusMessage: "TRACE method is not supported",
    });
  }
});
