// delete
export default defineEventHandler(async (event) => {
    const vmId = event.context.params.id;
    console.log("deleted VM id:", vmId);
  return { message: "VM deleted successfully" };
});