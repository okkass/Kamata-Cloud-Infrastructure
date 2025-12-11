import type { UserResponse } from "@app/shared/types";

let users: Array<UserResponse> | null = null;

export const initUsers = (): Array<UserResponse> => {
    return [
        {
            id: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
            name: "Admin",
            email: "admin@example.com",
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
            maxCpuCore: null,
            maxMemorySize: null,
            maxStorageSize: null,
            isAdmin: true,
            isImageAdmin: true,
            isInstanceTypeAdmin: true,
            isPhysicalNodeAdmin: true,
            isVirtualMachineAdmin: true,
            isNetworkAdmin: true,
            isSecurityGroupAdmin: true,
        },
        {
            id: "1e9d8f36-5479-4d85-9473-b328701918a5",
            name: "John Doe",
            email: "john.doe@example.com",
            createdAt: new Date().toISOString(),
            isAdmin: false,
            lastLoginAt: new Date().toISOString(),
            maxCpuCore: 32,
            maxMemorySize: 256 * 1024 * 1024 * 1024,
            maxStorageSize: 1024 * 1024 * 1024 * 1024,
            isImageAdmin: false,
            isInstanceTypeAdmin: false,
            isPhysicalNodeAdmin: false,
            isVirtualMachineAdmin: false,
            isNetworkAdmin: false,
            isSecurityGroupAdmin: false,
        },
    ];
};

export const getUsers = (): Array<UserResponse> => {
    if (!users) {
        users = initUsers();
    }
    return users;
};

export const getUserById = (id: string): UserResponse | undefined => {
    return getUsers().find((user) => user.id === id);
};
