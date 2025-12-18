export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  console.log("Security Groups Bulk Update:", body);
  return {
    status: "success",
    message: "Security Groups updated",
    details: body,
  };
});
