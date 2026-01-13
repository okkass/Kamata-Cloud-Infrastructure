export interface PVENodeResponse {
  node: string;
  status: "unknown" | "online" | "offline";
  cpu?: number;
  mem?: number;
}

const config = useRuntimeConfig();
const baseURL = config.pveBaseUrl;
const token = config.pveToken;

const getNodes = async (): Promise<PVENodeResponse[]> => {
  const url = baseURL + "api2/json/nodes";

  const res = await $fetch<PVENodeResponse[]>(url, {
    headers: {
      Authorization: token!,
    },
  });
  return res;
};

export const NodeGateway = {
  getNodes,
};
