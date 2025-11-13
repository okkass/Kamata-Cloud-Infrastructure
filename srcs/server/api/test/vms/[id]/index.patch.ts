// patch mockレスポンスを返すだけのダミー実装
export default defineEventHandler(async (event) => {
  const data = await readBody(event);
  console.log("patched VM data:", data);
  return { message: "VM patched successfully" };
});