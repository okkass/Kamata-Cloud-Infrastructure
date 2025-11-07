export interface HistoryItem {
  timestamp: number;
  value: number;
}
export interface HistoryData {
  id: string;
  name: string;
  totalCpu: number;
  totalMemory: number;
  cpuHistory: HistoryItem[];
  memHistory: HistoryItem[];
  networkINHistory: HistoryItem[];
  networkOUTHistory: HistoryItem[];
}
interface Summary {
  totalCpu: number;
  usedCpu: number;
  totalMemory: number;
  usedMemory: number;
  totalStorage: number;
  usedStorage: number;
}

export interface SummaryResponse {
  clusterSummary: Summary;
}

export interface SummaryHistoryResponse {
  data: HistoryData[];
}
