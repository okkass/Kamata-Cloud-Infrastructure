// patch mockレスポンスを返すだけのダミー実装
export default defineEventHandler(async (event) => {
    const data = await readBody(event);
    console.log("patched NIC data:", data);
  return { message: "NIC patched successfully" };
});