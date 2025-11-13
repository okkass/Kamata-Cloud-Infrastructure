// post mockレスポンスを返すだけのダミー実装
export default defineEventHandler(async (event) => {
  const data = await readBody(event);
  console.log("added VM data:", data);
  return { message: "VM added successfully" };
});
