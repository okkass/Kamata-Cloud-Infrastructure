export interface HistoryItem {
  timestamp: number;
  value: number;
}
interface NodeData {
  id: string;
  name: string;
  cpuHistory: HistoryItem[];
  memHistory: HistoryItem[];
}
interface VmData {
  id: string;
  name: string;
  cpuHistory: HistoryItem[];
  memHistory: HistoryItem[];
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
  data: NodeData[] | VmData[];
  clusterSummary: ClusterSummary | UserQuota;
}
