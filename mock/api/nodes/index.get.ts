import { getNodes } from "../../services/nodesService";

export default defineEventHandler(() => {
  return getNodes();
});
