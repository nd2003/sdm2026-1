import type { NetworkInterfaceInfo } from "node:os";

/** What `os.networkInterfaces()` returns: adapter name -> its addresses. */
export type Interfaces = Record<string, readonly NetworkInterfaceInfo[] | undefined>;

const PRIVATE = /^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/;

/** Adapters a laptop gets from virtual machines and containers: a partner's laptop can't reach them. */
const VIRTUAL_NAME = /vethernet|veth|wsl|hyper-?v|virtualbox|vbox|vmware|vmnet|docker/i;

/** The first three bytes of the MAC address that Hyper-V, VirtualBox, VMware and Docker give their adapters. */
const VIRTUAL_MAC = ["00:15:5d", "0a:00:27", "08:00:27", "00:50:56", "00:0c:29", "00:05:69", "02:42:"];

/** Names that usually mean the adapter that is on the Wi-Fi: Windows, Linux and macOS. */
const WIFI_NAME = /wi-?fi|wlan|wireless|^en0$/i;

interface Candidate {
  name: string;
  address: string;
  virtual: boolean;
  private: boolean;
  wifi: boolean;
}

function isVirtual(name: string, mac: string): boolean {
  const lower = mac.toLowerCase();
  return VIRTUAL_NAME.test(name) || VIRTUAL_MAC.some((prefix) => lower.startsWith(prefix));
}

function candidates(interfaces: Interfaces): Candidate[] {
  const found: Candidate[] = [];
  for (const [name, addresses] of Object.entries(interfaces)) {
    for (const entry of addresses ?? []) {
      // Skip IPv6, loopback and the 169.254 addresses a computer gives itself when it has no network.
      if (entry.family !== "IPv4" || entry.internal || entry.address.startsWith("169.254.")) continue;
      found.push({
        name,
        address: entry.address,
        virtual: isVirtual(name, entry.mac),
        private: PRIVATE.test(entry.address),
        wifi: WIFI_NAME.test(name),
      });
    }
  }
  return found;
}

/** Lower is better: real adapters before virtual ones, then home and office addresses, then Wi-Fi by name. */
function rank(c: Candidate): number {
  return (c.virtual ? 4 : 0) + (c.private ? 0 : 2) + (c.wifi ? 0 : 1);
}

/**
 * The address a partner's laptop on the same Wi-Fi can open: this computer's real network address, not
 * the one of a virtual adapter. Virtual adapters are only used when nothing else exists. Ties keep the
 * order the system lists the adapters in.
 */
export function pickNetworkAddress(interfaces: Interfaces): string | null {
  const best = candidates(interfaces)
    .map((candidate, order) => ({ candidate, order }))
    .sort((a, b) => rank(a.candidate) - rank(b.candidate) || a.order - b.order)[0];
  return best?.candidate.address ?? null;
}
