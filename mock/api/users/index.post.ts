export default defineEventHandler(async (event) => {
  // ログにもらったbodyを表示する
  const body = await readBody(event);
  console.log(body);
  return { message: "User created", user: body };
});
