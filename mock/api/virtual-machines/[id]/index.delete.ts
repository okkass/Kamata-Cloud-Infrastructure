export default defineEventHandler(async (event) => {
  event.node.res.statusCode = 204;
  return;
});
