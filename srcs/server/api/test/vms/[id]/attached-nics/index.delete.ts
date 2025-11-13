// mockレスポンスを返すだけのダミー実装
export default defineEventHandler(async (event) => {
    const id = event.context.params.id;
    // console.log("deleted NIC id:", id); // 必要ならログ出力
  return { message: "NIC deleted successfully" };
});