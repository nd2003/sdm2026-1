import { defineConfig } from "vite";

export default defineConfig({
  // Relative asset paths: the same build works at the root of a domain and under /team-3/ behind the gateway.
  base: "./",
  server: { port: 5173, strictPort: true },
  build: { outDir: "dist", emptyOutDir: true },
});
