// bulkのmock
export default defineEventHandler(async (event) => {
  const id = event.context.params?.id;
  const body = await readBody(event);
  console.log(`Received bulk operation for security group ${id}:`, body);
  return {
    message: `Bulk operation for security group ${id} completed successfully`,
    data: body,
  };
});
