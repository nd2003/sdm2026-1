import type { NetworkInterfaceInfo } from "node:os";
import { describe, expect, it } from "vitest";
import { type Interfaces, pickNetworkAddress } from "./network-address.ts";

function iface(
  address: string,
  mac: string,
  extra: Partial<NetworkInterfaceInfo> = {},
): NetworkInterfaceInfo {
  return {
    address,
    netmask: "255.255.255.0",
    family: "IPv4",
    mac,
    internal: false,
    cidr: `${address}/24`,
    ...extra,
  } as NetworkInterfaceInfo;
}

describe("pickNetworkAddress", () => {
  it("picks the Wi-Fi address on a laptop with Hyper-V and VirtualBox adapters (issue #335)", () => {
    const interfaces: Interfaces = {
      "vEthernet (Default Switch)": [iface("172.23.64.1", "00:15:5d:aa:bb:cc")],
      "Ethernet 2": [iface("192.168.56.1", "0a:00:27:00:00:12")],
      "Wi-Fi": [iface("192.168.1.187", "a4:5e:60:11:22:33")],
    };
    expect(pickNetworkAddress(interfaces)).toBe("192.168.1.187");
  });

  it("skips an adapter whose name says it is virtual, whatever its MAC is", () => {
    expect(
      pickNetworkAddress({
        "vEthernet (WSL)": [iface("172.24.0.1", "12:34:56:78:9a:bc")],
        "Local Area Connection": [iface("192.168.0.20", "a4:5e:60:11:22:33")],
      }),
    ).toBe("192.168.0.20");
  });

  it("skips an adapter whose MAC belongs to a virtual machine, whatever its name is", () => {
    for (const mac of [
      "00:15:5D:00:00:01",
      "0a:00:27:00:00:01",
      "08:00:27:11:22:33",
      "00:50:56:c0:00:08",
      "02:42:ac:11:00:02",
    ]) {
      expect(
        pickNetworkAddress({
          "Ethernet 2": [iface("192.168.56.1", mac)],
          "Ethernet 3": [iface("10.0.0.5", "a4:5e:60:11:22:33")],
        }),
      ).toBe("10.0.0.5");
    }
  });

  it("prefers a home or office address over a public one", () => {
    expect(
      pickNetworkAddress({
        Ethernet: [iface("81.2.69.142", "a4:5e:60:11:22:33")],
        "Wi-Fi": [iface("192.168.1.50", "a4:5e:60:11:22:34")],
      }),
    ).toBe("192.168.1.50");
  });

  it("prefers the adapter named like Wi-Fi when several real ones are private", () => {
    expect(
      pickNetworkAddress({
        Ethernet: [iface("10.1.1.9", "a4:5e:60:11:22:33")],
        en0: [iface("192.168.1.7", "a4:5e:60:11:22:34")],
      }),
    ).toBe("192.168.1.7");
  });

  it("keeps the system's order between equally good adapters", () => {
    expect(
      pickNetworkAddress({
        Ethernet: [iface("192.168.1.2", "a4:5e:60:11:22:33")],
        "Ethernet 2": [iface("192.168.1.3", "a4:5e:60:11:22:34")],
      }),
    ).toBe("192.168.1.2");
  });

  it("falls back to a virtual adapter only when nothing else exists, private one first", () => {
    expect(
      pickNetworkAddress({
        "vEthernet (Default Switch)": [iface("172.23.64.1", "00:15:5d:aa:bb:cc")],
        "VirtualBox Host-Only": [iface("192.168.56.1", "0a:00:27:00:00:12")],
        vmnet8: [iface("8.8.4.4", "00:50:56:c0:00:08")],
      }),
    ).toBe("172.23.64.1");
  });

  it("ignores IPv6, loopback and self-assigned addresses", () => {
    expect(
      pickNetworkAddress({
        lo: [iface("127.0.0.1", "00:00:00:00:00:00", { internal: true })],
        Ethernet: [
          iface("fe80::1", "a4:5e:60:11:22:33", { family: "IPv6" } as Partial<NetworkInterfaceInfo>),
          iface("169.254.10.20", "a4:5e:60:11:22:33"),
        ],
      }),
    ).toBeNull();
  });

  it("returns null when there is no network", () => {
    expect(pickNetworkAddress({})).toBeNull();
    expect(pickNetworkAddress({ "Wi-Fi": undefined } as unknown as Interfaces)).toBeNull();
  });
});
