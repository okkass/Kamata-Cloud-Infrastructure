import type {
  UserResponse,
  UserCreateRequest,
  UserPatchRequest,
  UserPutRequest,
} from "@app/shared/types";

let users: UserResponse[] | null = null;

const init = (): UserResponse[] => {
  return [
    {
      id: "c93b589b-5389-48aa-b37f-878be7663cf2",
      name: "John Doe",
      email: "john.doe@example.com",
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      isAdmin: false,
      isImageAdmin: false,
      isInstanceTypeAdmin: false,
      isNetworkAdmin: false,
      isNodeAdmin: false,
      isSecurityGroupAdmin: false,
      isVirtualMachineAdmin: false,
    },
    {
      id: "5ab9e787-ad30-4f12-9ee4-f00c0491ee5d",
      name: "Admin Taro",
      email: "admin.taro@example.com",
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      isAdmin: true,
      isImageAdmin: false,
      isInstanceTypeAdmin: false,
      isNetworkAdmin: false,
      isNodeAdmin: false,
      isSecurityGroupAdmin: false,
      isVirtualMachineAdmin: false,
    },
    {
      id: "1047e1de-4a8f-4548-8b22-9d7e9f1b9a9c",
      name: "NoAdmin Jiro",
      email: "noadmin.jiro@example.com",
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      isAdmin: false,
      isImageAdmin: false,
      isInstanceTypeAdmin: false,
      isNetworkAdmin: false,
      isNodeAdmin: false,
      isSecurityGroupAdmin: false,
      isVirtualMachineAdmin: false,
    },
    {
      id: "f8bf2ee5-c2a9-480f-b66e-f9cc4fd65605",
      name: "ImageAdmin Jiro",
      email: "imageadmin.jiro@example.com",
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      isAdmin: false,
      isImageAdmin: true,
      isInstanceTypeAdmin: false,
      isNetworkAdmin: false,
      isNodeAdmin: false,
      isSecurityGroupAdmin: false,
      isVirtualMachineAdmin: false,
    },
    {
      id: "9f4364d5-11d1-4d69-a9ce-2a5c46ea2b29",
      name: "ITAdmin Jiro",
      email: "itadmin.jiro@example.com",
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      isAdmin: false,
      isImageAdmin: false,
      isInstanceTypeAdmin: true,
      isNetworkAdmin: false,
      isNodeAdmin: false,
      isSecurityGroupAdmin: false,
      isVirtualMachineAdmin: false,
    },
    {
      id: "11a67bd6-fe6e-4c07-a59c-eb48e7c74146",
      name: "NWAdmin Jiro",
      email: "nwadmin.jiro@example.com",
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      isAdmin: false,
      isImageAdmin: false,
      isInstanceTypeAdmin: false,
      isNetworkAdmin: true,
      isNodeAdmin: false,
      isSecurityGroupAdmin: false,
      isVirtualMachineAdmin: false,
    },
    {
      id: "4870d6d3-4ae6-4e5f-99de-150ed2efbed8",
      name: "NodeAdmin Jiro",
      email: "nodeadmin.jiro@example.com",
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      isAdmin: false,
      isImageAdmin: false,
      isInstanceTypeAdmin: false,
      isNetworkAdmin: false,
      isNodeAdmin: true,
      isSecurityGroupAdmin: false,
      isVirtualMachineAdmin: false,
    },
    {
      id: "e8aa4853-30a3-4eb9-8003-2216c8fd34d9",
      name: "SGAdmin Jiro",
      email: "sgadmin.jiro@example.com",
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      isAdmin: false,
      isImageAdmin: false,
      isInstanceTypeAdmin: false,
      isNetworkAdmin: false,
      isNodeAdmin: false,
      isSecurityGroupAdmin: true,
      isVirtualMachineAdmin: false,
    },
    {
      id: "ce30b9d2-cadf-47b8-8676-3f97a6cd4ef3",
      name: "VMAdmin Jiro",
      email: "vmadmin.jiro@example.com",
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      isAdmin: false,
      isImageAdmin: false,
      isInstanceTypeAdmin: false,
      isNetworkAdmin: false,
      isNodeAdmin: false,
      isSecurityGroupAdmin: false,
      isVirtualMachineAdmin: true,
    },
  ];
};

const list = (): UserResponse[] => {
  if (!users) {
    users = init();
  }
  return users;
};

const getById = (id: string): UserResponse | undefined => {
  return list().find((user) => user.id === id);
};

const create = (userCreateRequest: UserCreateRequest): UserResponse => {
  const newUser: UserResponse = {
    id: crypto.randomUUID(),
    name: userCreateRequest.name,
    email: userCreateRequest.email,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    isAdmin: userCreateRequest.isAdmin || false,
    isImageAdmin: userCreateRequest.isImageAdmin || false,
    isInstanceTypeAdmin: userCreateRequest.isInstanceTypeAdmin || false,
    isNetworkAdmin: userCreateRequest.isNetworkAdmin || false,
    isNodeAdmin: userCreateRequest.isNodeAdmin || false,
    isSecurityGroupAdmin: userCreateRequest.isSecurityGroupAdmin || false,
    isVirtualMachineAdmin: userCreateRequest.isVirtualMachineAdmin || false,
  };
  list().push(newUser);
  return newUser;
};

const update = (
  id: string,
  userPutRequest: UserPutRequest | UserPatchRequest
): UserResponse | undefined => {
  const user = getById(id);
  if (!user) {
    return undefined;
  }
  user.name = userPutRequest.name ?? user.name;
  user.email = userPutRequest.email ?? user.email;
  user.isAdmin = userPutRequest.isAdmin ?? user.isAdmin;
  user.isImageAdmin = userPutRequest.isImageAdmin ?? user.isImageAdmin;
  user.isInstanceTypeAdmin =
    userPutRequest.isInstanceTypeAdmin ?? user.isInstanceTypeAdmin;
  user.isNetworkAdmin = userPutRequest.isNetworkAdmin ?? user.isNetworkAdmin;
  user.isNodeAdmin = userPutRequest.isNodeAdmin ?? user.isNodeAdmin;
  user.isSecurityGroupAdmin =
    userPutRequest.isSecurityGroupAdmin ?? user.isSecurityGroupAdmin;
  user.isVirtualMachineAdmin =
    userPutRequest.isVirtualMachineAdmin ?? user.isVirtualMachineAdmin;
  return user;
};

const deleteById = (id: string): boolean => {
  const initialLength = list().length;
  users = list().filter((user) => user.id !== id);
  return list().length < initialLength;
};

export const UserRepository = {
  list,
  getById,
  create,
  update,
  deleteById,
};

export default UserRepository;
