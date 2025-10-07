export default defineEventHandler(() => {
  return [
    {
      id: "2b8d85e8-cf75-4ac4-8394-d042da5c9593",
      name: "backup-1",
      description: "説明",
      createdAt: new Date().toISOString(),
      size: 1919,
      targetVirtualStorage: {
        id: "0ccc59cf-afa7-41fe-9b75-50372c8b7e09",
        name: "storage-1",
        size: 4545,
        pool: "c8984344-4ffe-4dd5-bc99-c02fb2302224",
      },
    },
    {
      id: "cd8f2539-bca4-4431-bada-5828772f1186",
      name: "backup-1",
      description: "説明",
      createdAt: new Date().toISOString(),
      size: 1919,
      targetVirtualStorage: {
        id: "00b722d5-c675-4c17-a326-87ed84506d2d",
        name: "storage-1",
        size: 4545,
        pool: "6bf9effd-6843-4eb6-b91b-aa7498250079",
      },
    },
  ];
});
