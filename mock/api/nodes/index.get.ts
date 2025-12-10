import { getNodes } from "../../services/nodeService";

export default defineEventHandler(() => {
  return getNodes();
});
