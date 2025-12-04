export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  console.log(body);
  return { message: "PUT request received", data: body };
});
