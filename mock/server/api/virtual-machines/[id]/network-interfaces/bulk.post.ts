export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  console.log("Network Interfaces Bulk Update:", body);
  return { status: "success", message: "Interfaces updated", details: body };
});
