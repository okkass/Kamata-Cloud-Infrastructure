export default defineEventHandler(async (event) => {
    const data = await readBody(event);
    const vmId = event.context.params?.vmid;
    console.log(`patched NIC: vmid: ${vmId} data:`, data);
  return { message: "NIC patched successfully" };
});