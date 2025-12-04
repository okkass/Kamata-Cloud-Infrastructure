import { validate } from "uuid";
import { images } from "./images";
import type { ErrorResponse } from "~/types/api-types";

export default defineEventHandler((event) => {
  const { id } = event.context.params as { id: string };
  if (!validate(id)) {
    const errorResponse: ErrorResponse = {
      type: "error",
      title: "Invalid ID",
      status: 400,
      detail: "The provided ID is not a valid UUID.",
    };
    event.statusCode = 400;
    return errorResponse;
  }
});
