import { getResource } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getUserService } from "@/service/UserService";

const ADMIN = "5ab9e787-ad30-4f12-9ee4-f00c0491ee5d";
const NO_ADMIN = "1047e1de-4a8f-4548-8b22-9d7e9f1b9a9c";
const IMAGE_ADMIN = "f8bf2ee5-c2a9-480f-b66e-f9cc4fd65605";
const IT_ADMIN = "9f4364d5-11d1-4d69-a9ce-2a5c46ea2b29";
const NETWORK_ADMIN = "11a67bd6-fe6e-4c07-a59c-eb48e7c74146";
const NODE_ADMIN = "4870d6d3-4ae6-4e5f-99de-150ed2efbed8";
const SECURITY_GROUP_ADMIN = "e8aa4853-30a3-4eb9-8003-2216c8fd34d9";
const VM_ADMIN = "ce30b9d2-cadf-47b8-8676-3f97a6cd4ef3";

export default defineEventHandler((event) => {
  const target = VM_ADMIN; // ここを書き換えると返すユーザーを変更できる

  // モックなので固定のユーザーを返す
  const permission = getPermissionFromEvent(event);
  const service = getUserService(permission);

  const user = getResource(target, service.getById);
  return user;
});
