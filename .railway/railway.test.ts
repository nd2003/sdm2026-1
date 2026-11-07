import { spawnSync } from "node:child_process";
import { createRailwayContext, type ProjectDefinition, type ServiceNode } from "railway/iac";
import { describe, expect, it } from "vitest";
import program, {
  ENVIRONMENTS,
  type EnvironmentName,
  GAMES,
  TEAM_GAMES,
  TEAMS_ENVIRONMENT,
} from "./railway.ts";

async function plan(environment: string): Promise<ServiceNode[]> {
  const definition: ProjectDefinition = await program(createRailwayContext({ environment }), (name, def) => ({
    name,
    ...def,
  }));
  return (definition.resources ?? []).flat() as ServiceNode[];
}

describe.each(Object.keys(ENVIRONMENTS) as EnvironmentName[])("railway.ts in %s", (environment) => {
  const { branch, appEnv } = ENVIRONMENTS[environment];

  it("has one service per game", async () => {
    expect((await plan(environment)).map((s) => s.name)).toEqual(GAMES.map((g) => g.service));
  });

  it("deploys the right branch, and only after CI passed", async () => {
    for (const s of await plan(environment)) {
      expect(s.source).toMatchObject({ type: "github", repo: "nd2003/sdm2026-1", branch, checkSuites: true });
    }
  });

  it("runs one replica, health-checked on /health, with the right APP_ENV", async () => {
    for (const s of await plan(environment)) {
      const replicas = Object.values(s.deploy?.multiRegionConfig ?? {}).map((r) => r?.numReplicas ?? 0);
      expect(replicas).toEqual([1]);
      expect(s.deploy?.healthcheckPath).toBe("/health");
      expect(s.deploy?.sleepApplication).toBe(false);
      expect(s.deploy?.startCommand).toMatch(/^node /);
      expect(s.variables?.APP_ENV).toEqual({ type: "literal", value: appEnv });
    }
  });
});

describe("railway.ts in teams", () => {
  const { name, appEnv } = TEAMS_ENVIRONMENT;

  it("has one service per team game", async () => {
    expect((await plan(name)).map((s) => s.name)).toEqual(TEAM_GAMES.map((g) => g.service));
  });

  it("deploys each team's own feature branch, and only after CI passed", async () => {
    for (const s of await plan(name)) {
      const game = TEAM_GAMES.find((g) => g.service === s.name);
      expect(s.source).toMatchObject({
        type: "github",
        repo: "nd2003/sdm2026-1",
        branch: `feature/${s.name}`,
        checkSuites: true,
      });
      expect(game?.branch).toBe(`feature/${s.name}`);
    }
  });

  it("is built and run like the other environments, with the development APP_ENV", async () => {
    for (const s of await plan(name)) {
      const game = TEAM_GAMES.find((g) => g.service === s.name);
      const replicas = Object.values(s.deploy?.multiRegionConfig ?? {}).map((r) => r?.numReplicas ?? 0);
      expect(replicas).toEqual([1]);
      expect(s.build?.buildCommand).toBe(`pnpm --filter ${game?.package} build`);
      expect(s.deploy?.startCommand).toBe(`node --import tsx ${game?.dir}/server.ts`);
      expect(s.deploy?.healthcheckPath).toBe("/health");
      expect(s.deploy?.sleepApplication).toBe(false);
      expect(s.variables?.APP_ENV).toEqual({ type: "literal", value: appEnv });
    }
  });
});

describe("TEAM_GAMES", () => {
  it("names each game after its team: service, folder and branch agree", () => {
    for (const g of TEAM_GAMES) {
      expect(g.service).toMatch(/^team-[1-4]$/);
      expect(g.dir).toBe(`games/${g.service}`);
      expect(g.branch).toBe(`feature/${g.service}`);
    }
  });

  it("lists every team once", () => {
    expect(new Set(TEAM_GAMES.map((g) => g.service)).size).toBe(TEAM_GAMES.length);
  });
});

describe("railway.ts", () => {
  it("never deploys main to production", () => {
    expect(ENVIRONMENTS.production.branch).toBe("prod");
  });

  it("never deploys a team's feature branch to production or development", async () => {
    for (const environment of Object.keys(ENVIRONMENTS) as EnvironmentName[]) {
      for (const s of await plan(environment)) {
        expect((s.source as { branch?: string }).branch).not.toMatch(/^feature\//);
      }
    }
  });

  it("keeps the teams environment out of production", () => {
    expect(TEAMS_ENVIRONMENT.appEnv).not.toBe("production");
    expect(Object.keys(ENVIRONMENTS)).not.toContain(TEAMS_ENVIRONMENT.name);
  });

  it("refuses an environment it doesn't manage", async () => {
    await expect(plan("staging")).rejects.toThrow(/not "staging"/);
  });

  it("loads with plain Node type stripping, the way the Railway CLI runs it", () => {
    // A file:// URL, not a path: on Windows, import("D:\\...") reads "d:" as a URL scheme and fails.
    const url = new URL("./railway.ts", import.meta.url).href;
    const run = spawnSync(
      process.execPath,
      ["--experimental-strip-types", "--input-type=module", "-e", `await import(${JSON.stringify(url)});`],
      { encoding: "utf8" },
    );
    expect(run.stderr).not.toMatch(/Error/);
    expect(run.status).toBe(0);
  });
});
