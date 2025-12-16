// deleteのMock

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id;
  console.log(`Received storage pool delete request for ID ${id}`);
  return {
    message: `Storage pool with ID ${id} has been deleted.`,
  };
});
