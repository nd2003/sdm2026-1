import { serverUrlFromPage } from "@sdm/core/client";
import { describe, expect, it } from "vitest";
import config from "../vite.config.ts";

// In production the gateway serves every game under its own path (`/team-1/`); see
// server/docs/CLIENT_GUIDE.md, "Your game lives under a path".
describe("running under /team-1/ behind the gateway", () => {
  it("builds relative asset paths, so /assets/... is not asked for at the root", () => {
    expect(config.base).toBe("./");
  });

  it("takes the server address from the page's folder, not from location.origin", () => {
    expect(serverUrlFromPage("https://game.example.com/team-1/")).toBe("https://game.example.com/team-1");
    expect(serverUrlFromPage("https://game.example.com/team-1/?room=QXTR")).toBe(
      "https://game.example.com/team-1",
    );
    expect(serverUrlFromPage("https://game.example.com/")).toBe("https://game.example.com");
  });
});
