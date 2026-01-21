interface UserCredentials {
  id: string;
  password: string;
}

let userCredentialsStore: Array<UserCredentials> | null = null;

const initUserCredentialsStore = (): Array<UserCredentials> => {
  return [
    {
      id: "c93b589b-5389-48aa-b37f-878be7663cf2",
      password: "password123",
    },
    {
      id: "5ab9e787-ad30-4f12-9ee4-f00c0491ee5d",
      password: "adminpassword",
    },
    {
      id: "1047e1de-4a8f-4548-8b22-9d7e9f1b9a9c",
      password: "noadminpass",
    },
    {
      id: "f8bf2ee5-c2a9-480f-b66e-f9cc4fd65605",
      password: "imageadminpass",
    },
    {
      id: "9f4364d5-11d1-4d69-a9ce-2a5c46ea2b29",
      password: "itadminpass",
    },
    {
      id: "11a67bd6-fe6e-4c07-a59c-eb48e7c74146",
      password: "nwadminpass",
    },
    {
      id: "4870d6d3-4ae6-4e5f-99de-150ed2efbed8",
      password: "nodeadminpass",
    },
    {
      id: "e8aa4853-30a3-4eb9-8003-2216c8fd34d9",
      password: "sgadminpass",
    },
    {
      id: "ce30b9d2-cadf-47b8-8676-3f97a6cd4ef3",
      password: "vmadminpass",
    },
  ];
};

const list = (): Array<UserCredentials> => {
  if (!userCredentialsStore) {
    userCredentialsStore = initUserCredentialsStore();
  }
  return userCredentialsStore;
};

const getById = (id: string): UserCredentials | null => {
  return list().find((cred) => cred.id === id) || null;
};

const create = (id: string, password: string): UserCredentials => {
  const newCred: UserCredentials = { id, password };
  list().push(newCred);
  return newCred;
};

const update = (
  id: string,
  currentPassword: string,
  newPassword: string
): UserCredentials | null => {
  const cred = getById(id);
  if (cred && cred.password === currentPassword) {
    cred.password = newPassword;
    return cred;
  }
  return null;
};

const deleteById = (id: string): boolean => {
  const index = list().findIndex((cred) => cred.id === id);
  if (index !== -1) {
    list().splice(index, 1);
    return true;
  }
  return false;
};

export const UserCredentialsRepository = {
  list,
  getById,
  create,
  update,
  deleteById,
};

export default UserCredentialsRepository;
