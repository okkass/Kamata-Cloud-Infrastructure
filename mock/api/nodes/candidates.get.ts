import { getNodeCandidates } from "../../services/nodeService";

export default defineEventHandler(() => {
  return getNodeCandidates();
});
