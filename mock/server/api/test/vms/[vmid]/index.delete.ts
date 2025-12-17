// delete
export default defineEventHandler(async (event) => {
    const vmId = event.context.params?.vmid;
    console.log("deleted VM: vmid:", vmId);
  return { message: "VM deleted successfully" };
});