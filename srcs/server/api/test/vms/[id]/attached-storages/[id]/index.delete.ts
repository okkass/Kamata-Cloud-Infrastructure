// mockレスポンスを返すだけのダミー実装
export default defineEventHandler(async (event) => {
    const vmId = event.context.params?.id;
    const storageId = event.context.params?.attachedStorageId ?? event.context.params?.id;
    console.log(`deleted Storage: vmId=${vmId}, storageId=${storageId}`);
  return { message: "Storage deleted successfully" };
});