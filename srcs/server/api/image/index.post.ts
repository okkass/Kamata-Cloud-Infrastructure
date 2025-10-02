export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  console.log("Received image upload:", body);
  return { message: "Image uploaded successfully", data: body };
});
