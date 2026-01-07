import { defineNitroConfig } from "nitropack/config";
import { resolve } from "node:path";

// https://nitro.build/config
export default defineNitroConfig({
  compatibilityDate: "latest",
  srcDir: "server",
  alias: {
    "@app": resolve(__dirname, "../srcs"),
    "@": resolve(__dirname, "./server"),
    "@@": resolve(__dirname, "./"),
  },
  errorHandler: "@/errorHandler",
});
