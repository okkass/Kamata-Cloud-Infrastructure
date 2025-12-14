export default defineEventHandler(async (event) => {
    const vmId = event.context.params?.vmid;
    const nicId = event.context.params?.id; // attached-nicsのid
    console.log(`deleted NIC: vmId: ${vmId}, nicId: ${nicId}`);
  return { message: "NIC deleted successfully" };
});