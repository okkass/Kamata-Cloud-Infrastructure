import { resolve } from "node:path";

export default defineNitroConfig({
  routeRules: {
    "/api/**": {
<<<<<<< HEAD
      cors: true,
=======
>>>>>>> main
      headers: {
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Access-Control-Allow-Methods":
          "GET, POST, PUT, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    },
  },
<<<<<<< HEAD
=======
  alias: {
    "@app": resolve(__dirname, "../srcs"),
    "@utils": resolve(__dirname, "./utils"),
  },
>>>>>>> main
});
