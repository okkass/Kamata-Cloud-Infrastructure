export default defineEventHandler(async (event) => {
  const id = event.context.params?.id;
  const body = await readBody(event);
  console.log(`Changing password for user ${id}`);
  console.log(`New password data:`, body);
  return { message: `Password for user ${id} changed` };
});
