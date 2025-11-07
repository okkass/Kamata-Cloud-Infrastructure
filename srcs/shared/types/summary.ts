export interface HistoryItem {
  timestamp: number;
  value: number;
}
export interface NodeData {
  id: string;
  name: string;
  totalCpu: number;
  totalMemory: number;
  cpuHistory: HistoryItem[];
  memHistory: HistoryItem[];
  networkINHistory: HistoryItem[];
  networkOUTHistory: HistoryItem[];
}
export interface VmData {
  id: string;
  name: string;
  totalCpu: number;
  totalMemory: number;
  cpuHistory: HistoryItem[];
  memHistory: HistoryItem[];
  networkINHistory: HistoryItem[];
  networkOUTHistory: HistoryItem[];
}
interface ClusterSummary {
  totalCpu: number;
  usedCpu: number;
  totalMemory: number;
  usedMemory: number;
  totalStorage: number;
  usedStorage: number;
}
interface UserQuota {
  totalCpu: number;
  usedCpu: number;
  totalMemory: number;
  usedMemory: number;
  totalStorage: number;
  usedStorage: number;
}

export interface SummaryResponse {
  clusterSummary: ClusterSummary | UserQuota;
}

export interface SummaryHistoryResponse {
  data: NodeData[] | VmData[];
}
