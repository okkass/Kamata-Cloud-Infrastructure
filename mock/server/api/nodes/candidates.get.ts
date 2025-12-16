import { getNodeCandidates } from "../../services/NodeService";

export default defineEventHandler(() => {
  return getNodeCandidates();
});
