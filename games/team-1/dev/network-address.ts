/**
 * Dev only: picks the address another laptop on the same network can use to open the invite link.
 * Kept apart from vite.config.ts so it can be tested with made-up network interfaces.
 */

/** The fields of `os.networkInterfaces()` entries that matter here. */
export interface InterfaceAddress {
  address: string;
  family: string | number;
  internal: boolean;
  mac: string;
}

export type Interfaces = Record<string, InterfaceAddress[] | undefined>;

const PRIVATE_NETWORK = /^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/;

/** Adapters that only reach virtual machines or containers on this computer, never another laptop. */
const VIRTUAL_NAME = /vEthernet|WSL|Hyper-V|VirtualBox|VMware|vmnet|docker|^br-|^veth|vboxnet/i;

/**
 * MAC prefixes of virtual adapters. Names aren't enough: on Windows the VirtualBox host-only adapter
 * is called "Ethernet 2" and only its MAC (0a:00:27) gives it away.
 */
const VIRTUAL_MAC = [
  "00:15:5d",
  "0a:00:27",
  "08:00:27",
  "00:05:69",
  "00:0c:29",
  "00:1c:14",
  "00:50:56",
  "02:42:",
];

function isVirtual(name: string, mac: string): boolean {
  const lower = mac.toLowerCase();
  return VIRTUAL_NAME.test(name) || VIRTUAL_MAC.some((prefix) => lower.startsWith(prefix));
}

/**
 * This computer's address on the local network, or null. Real adapters come before virtual ones,
 * and home or office (private) addresses before others.
 */
export function pickNetworkAddress(interfaces: Interfaces): string | null {
  const real: string[] = [];
  const virtual: string[] = [];
  for (const [name, addresses] of Object.entries(interfaces)) {
    for (const entry of addresses ?? []) {
      const ipv4 = entry.family === "IPv4" || entry.family === 4;
      if (!ipv4 || entry.internal) continue;
      (isVirtual(name, entry.mac) ? virtual : real).push(entry.address);
    }
  }
  for (const list of [real, virtual]) {
    const found = list.find((address) => PRIVATE_NETWORK.test(address)) ?? list[0];
    if (found) return found;
  }
  return null;
}
