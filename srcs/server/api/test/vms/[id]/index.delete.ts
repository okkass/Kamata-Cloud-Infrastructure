// delete
export default defineEventHandler(async (event) => {
    const data = await readBody(event);
    console.log("deleted VM data:", data);
  return { message: "VM deleted successfully" };
});