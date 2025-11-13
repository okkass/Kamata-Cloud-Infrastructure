export default defineEventHandler(async (event) => {
    const data = await readBody(event);
    console.log("deleted NIC data:", data);
  return { message: "NIC deleted successfully" };
});