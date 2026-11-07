import { describe, expect, it } from "vitest";
import { type InterfaceAddress, pickNetworkAddress } from "./network-address.ts";

const ipv4 = (address: string, mac: string, internal = false): InterfaceAddress => ({
  address,
  family: "IPv4",
  internal,
  mac,
});

describe("pickNetworkAddress", () => {
  it("skips Hyper-V and VirtualBox adapters on a Windows laptop and picks the Wi-Fi", () => {
    // The adapters of a real Windows laptop, in the order Node lists them.
    expect(
      pickNetworkAddress({
        "vEthernet (Default Switch)": [ipv4("172.23.64.1", "00:15:5d:e4:22:8b")],
        "Ethernet 2": [ipv4("192.168.56.1", "0a:00:27:00:00:08")],
        "Wi-Fi": [ipv4("192.168.1.187", "b4:69:21:49:5c:f0")],
        "Loopback Pseudo-Interface 1": [ipv4("127.0.0.1", "00:00:00:00:00:00", true)],
      }),
    ).toBe("192.168.1.187");
  });

  it("skips WSL and Docker adapters by name", () => {
    expect(
      pickNetworkAddress({
        "vEthernet (WSL)": [ipv4("172.20.0.1", "00:15:5d:00:00:01")],
        docker0: [ipv4("172.17.0.1", "02:42:ac:11:00:01")],
        en0: [ipv4("10.0.0.8", "a4:83:e7:00:00:01")],
      }),
    ).toBe("10.0.0.8");
  });

  it("prefers a private address among real adapters", () => {
    expect(
      pickNetworkAddress({
        eth0: [ipv4("100.64.0.5", "a4:83:e7:00:00:02")],
        wlan0: [ipv4("192.168.0.20", "a4:83:e7:00:00:03")],
      }),
    ).toBe("192.168.0.20");
  });

  it("falls back to a virtual adapter when it is the only one", () => {
    expect(
      pickNetworkAddress({ "vEthernet (Default Switch)": [ipv4("172.23.64.1", "00:15:5d:e4:22:8b")] }),
    ).toBe("172.23.64.1");
  });

  it("ignores IPv6, loopback and missing entries", () => {
    expect(
      pickNetworkAddress({
        lo: [ipv4("127.0.0.1", "00:00:00:00:00:00", true)],
        eth0: [{ address: "fe80::1", family: "IPv6", internal: false, mac: "a4:83:e7:00:00:04" }],
        none: undefined,
      }),
    ).toBeNull();
  });

  it("accepts the numeric family some Node versions report", () => {
    expect(
      pickNetworkAddress({
        eth0: [{ address: "192.168.1.9", family: 4, internal: false, mac: "a4:83:e7:00:00:05" }],
      }),
    ).toBe("192.168.1.9");
  });
});
