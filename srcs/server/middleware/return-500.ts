export default defineEventHandler((event) => {
  if (event.path.startsWith("/api/")) {
    setResponseStatus(event, 501);
    return { message: "Not Implemented" };
  }
});
