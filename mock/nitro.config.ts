export default defineNitroConfig({
  routeRules: {
    "/api/**": {
<<<<<<< HEAD
      cors: true,
=======
>>>>>>> b8b142f5a7a9c5574aa9e6efbb7ffef3f5f5656a
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
    "@": resolve(__dirname, "./"),
  },
>>>>>>> b8b142f5a7a9c5574aa9e6efbb7ffef3f5f5656a
});
