import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
  // Relative asset paths: the same build works at the root of a domain and under /team-4/ behind the gateway.
  base: "./",
  server: { port: 5173, strictPort: true },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rolldownOptions: {
      input: {
        main: fileURLToPath(new URL("./index.html", import.meta.url)),
        multiplayer: fileURLToPath(new URL("./multiplayer/index.html", import.meta.url)),
        live: fileURLToPath(new URL("./multiplayer/live.html", import.meta.url)),
      },
    },
  },
});
