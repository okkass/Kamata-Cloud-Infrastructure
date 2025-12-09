import { resolve } from "node:path";

export default defineNitroConfig({
  routeRules: {
    "/api/**": {
      cors: true,
      headers: {
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Access-Control-Allow-Methods":
          "GET, POST, PUT, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    },
  },
  alias: {
    "@app": resolve(__dirname, "../srcs"),
    "@utils": resolve(__dirname, "./utils"),
  },
});
