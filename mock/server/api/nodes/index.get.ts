import { getNodes } from "../../services/NodeService";

export default defineEventHandler(() => {
  return getNodes();
});
