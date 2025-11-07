export interface AdminSummary {
  nodes: Array<{
    id: string;
    name: string;
    cpuHistory: Array<{ timestamp: number; value: number }>;
    memHistory: Array<{ timestamp: number; value: number }>;
  }>;
  storages: Array<{
    id: string;
    name: string;
    diskUsage: number;
  }>;
}

export interface UserSummary {
  vms: Array<{
    id: string;
    name: string;
    cpuHistory: Array<{ timestamp: number; value: number }>;
    memHistory: Array<{ timestamp: number; value: number }>;
  }>;
}
export type SummaryResponse = AdminSummary | UserSummary;
