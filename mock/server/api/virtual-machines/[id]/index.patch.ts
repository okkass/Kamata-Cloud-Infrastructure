export default defineEventHandler(async (event) => {
  event.node.res.statusCode = 501;
  return {
    type: "Not Implemented",
    detail: "This endpoint is not yet implemented",
    status: 501,
  };
});
