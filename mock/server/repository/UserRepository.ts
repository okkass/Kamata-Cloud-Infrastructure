import type {
  UserResponse,
  UserCreateRequest,
  UserPatchRequest,
  UserPutRequest,
} from "@app/shared/types";

export class UserNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserNotFoundError";
  }
}

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
      id: "c93b589b-5389-48aa-b37f-878be7663cf2",
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
): UserResponse => {
  const user = getById(id);
  if (!user) {
    throw new UserNotFoundError(`User with id ${id} not found`);
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
