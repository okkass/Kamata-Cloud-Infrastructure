export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  return { status: "success", message: "Interfaces updated", details: body };
});
