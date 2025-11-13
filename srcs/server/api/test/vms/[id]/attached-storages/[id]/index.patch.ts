// patch mockレスポンスを返すだけのダミー実装
export default defineEventHandler(async (event) => {
    const data = await readBody(event);
    console.log("patched Storage data:", data);
  return { message: "Storage patched successfully" };
});