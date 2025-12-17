export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  return {
    status: "success",
    message: "Security Groups updated",
    details: body,
  };
});
