import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
  server: { port: 5173, strictPort: true },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rolldownOptions: {
      input: {
        main: fileURLToPath(new URL("./index.html", import.meta.url)),
        multiplayer: fileURLToPath(new URL("./multiplayer/index.html", import.meta.url)),
      },
    },
  },
});
