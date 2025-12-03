// /api/hello.get.ts
export default defineEventHandler(() => {
  return {
    api: "works",
    message: "Hello from standalone Nitro!",
  };
});
