export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  console.log(
    "Network Interfaces Bulk Update Success:",
    JSON.stringify(body, null, 2)
  );
  return { status: "success", message: "Interfaces updated", details: body };
});
