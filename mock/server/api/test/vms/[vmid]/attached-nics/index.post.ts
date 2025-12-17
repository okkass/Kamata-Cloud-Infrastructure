// post mockレスポンスを返すだけのダミー実装
export default defineEventHandler(async (event) => {
    const vmId = event.context.params?.vmid;
    const data = await readBody(event);
    console.log(`added NIC: vmId: ${vmId} data:`, data);
  return { message: "NIC added successfully" };
});