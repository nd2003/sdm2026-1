import { networkInterfaces } from "node:os";
import { defineConfig, type Plugin } from "vite";
import { pickNetworkAddress } from "./dev/network-address.ts";

/** This computer's address on the local network, skipping virtual adapters (Hyper-V, WSL, VirtualBox). */
function findNetworkAddress(): string | null {
  return pickNetworkAddress(networkInterfaces());
}

/** Dev only: tells the page the network address, so the invite link opens on another laptop. */
function networkAddress(): Plugin {
  return {
    name: "network-address",
    configureServer(server) {
      server.middlewares.use("/__lan", (_req, res) => {
        res.setHeader("content-type", "application/json");
        res.end(JSON.stringify({ address: findNetworkAddress() }));
      });
    },
  };
}

export default defineConfig({
  // Relative asset paths: the same build works at the root of its own server and under /team-1/ behind the gateway.
  base: "./",
  plugins: [networkAddress()],
  server: { port: 5173, strictPort: true, host: true },
  build: { outDir: "dist", emptyOutDir: true },
});
