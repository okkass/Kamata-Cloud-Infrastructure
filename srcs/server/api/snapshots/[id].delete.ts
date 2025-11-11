export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  console.log("Deleting snapshot with id:", body);
  return { message: "Backup deleted" };
});
