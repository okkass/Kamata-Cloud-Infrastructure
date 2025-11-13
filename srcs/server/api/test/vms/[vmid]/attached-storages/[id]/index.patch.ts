// patch mockレスポンスを返すだけのダミー実装
export default defineEventHandler(async (event) => {
    const data = await readBody(event);
    const vmId = event.context.params?.vmid;
    console.log("patched Storage: vmid:", vmId, "data:", data);
  return { message: "Storage patched successfully" };
});