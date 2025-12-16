export default defineEventHandler((event) => {
  setResponseStatus(event, 501);
  return { message: "Not Implemented" };
});
