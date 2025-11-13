// post mockレスポンスを返すだけのダミー実装
export default defineEventHandler(async (event) => {
    const data = await readBody(event);
    console.log("added NIC data:", data);
  return { message: "NIC added successfully" };
});