import { z } from "zod";
import type { NodeCreateRequest } from "@app/shared/types";
import { addNode } from "../../services/nodesService";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  console.log("Received body:", body);
  return { message: "Data received", data: body };
});
