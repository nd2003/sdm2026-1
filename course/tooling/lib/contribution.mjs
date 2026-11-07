// What each student's merged work added (#348): size, share in the team, feature part, areas and PRs.
// Pure functions only, so they can be unit tested. Used by `node course/tooling/student-report.mjs`.
import { importOf } from "./pr-report.mjs";

/** Generated or vendored files say nothing about the work. */
export const GENERATED =
  /(^|\/)(pnpm-lock\.yaml|package-lock\.json|yarn\.lock|dist\/|build\/|[^/]*\.min\.(js|css)$|[^/]*\.schema\.json$)/;

const GAME_PARTS = {
  client: "game client (UI, rendering, input)",
  room: "game server room (rules, state)",
  shared: "shared game contract",
  config: "game config",
  docs: "game docs",
};
const PLATFORM_PARTS = {
  core: "platform: client/server core",
  host: "platform: game host server",
  gateway: "platform: gateway",
  template: "platform: game template",
  tooling: "platform: workflow tooling and checks",
  docs: "platform: docs",
};

/**
 * The functional area of a changed file, e.g. "team-2: game client (UI, rendering, input)".
 * @param {string} path
 * @param {string[]} [importFolders] folders that hold a game imported from a team repository
 */
export function areaOf(path, importFolders = []) {
  const p = path.split("/");
  if (p[0] === "games" && /^team-\d$/.test(p[1] ?? "")) {
    const part = p[2] ?? "";
    if (importFolders.includes(`${p[0]}/${p[1]}/${part}`))
      return `${p[1]}: game imported from the team repository`;
    const label =
      GAME_PARTS[part] ?? (/\.md$/.test(part) ? "game docs" : p.length > 3 ? `${part}/` : "game app setup");
    return `${p[1]}: ${label}`;
  }
  if (p[0] === "server") return PLATFORM_PARTS[p[1] ?? ""] ?? "platform: docs and setup";
  if (p[0] === "course") return "instructor tooling";
  if (p[0] === ".github") return "CI and GitHub workflow";
  if (p[0] === ".railway") return "hosting (Railway)";
  if (["scenarios", "scripts", "tests"].includes(p[0])) return "QA: scenarios, bots, tests";
  if (p[0] === ".claude") return "agent skills";
  return "repository setup and docs";
}

const TYPES = {
  feat: "feature",
  perf: "feature",
  fix: "fix",
  refactor: "refactor",
  docs: "docs",
  test: "QA",
};

/** The title without its Conventional Commits prefix or old `[team-N]` prefix. */
export const cleanTitle = (title) =>
  title
    .trim()
    .replace(/^[a-z]+(\([^)]*\))?!?:\s*/, "")
    .replace(/^\[[^\]]+\]\s*/, "");

/**
 * The kind of work a PR is: feature, fix, refactor, docs, QA or chore. Titles from before Conventional
 * Commits ("[team-2] Add login page") are judged by their first word.
 * @param {string} title
 */
export function workType(title) {
  const t = /^([a-z]+)(\([^)]*\))?!?:/.exec(title.trim())?.[1];
  if (t) return TYPES[t] ?? "chore";
  const verb = cleanTitle(title).split(/\s+/)[0]?.toLowerCase() ?? "";
  if (/^fix/.test(verb)) return "fix";
  if (/^(document|explain|describe)/.test(verb)) return "docs";
  if (/^(add|set|implement|build|create|make|scaffold|define|initiali[sz]e|support|show|let|use)/.test(verb))
    return "feature";
  return "chore";
}

/**
 * Whether a PR repeats work merged elsewhere: a sync from main, a PR that brings main into a team branch,
 * or an integration PR from feature/team-N.
 * @param {{ title: string, head: string }} pr
 */
export function isRepeat(pr) {
  return (
    pr.head === "main" ||
    /^feature\/team-\d$/.test(pr.head) ||
    /\bbring main into\b|\bup to date with main\b/i.test(pr.title) ||
    /\/\d+-(bring-main|sync-main|sync-lockfile)/.test(pr.head)
  );
}

const empty = () => ({ lines: 0, featureLines: 0, areas: new Map(), items: [] });

/**
 * Adds up what each person's merged work PRs added.
 * @param {{ number: number, title: string, head: string, state: string, author: string | null,
 *   files: { path: string, additions: number }[], filesTruncated?: boolean,
 *   commits: { additions?: number, authors: (string | null)[] }[] }[]} prs
 * @returns {{ people: Map<string, ReturnType<typeof empty>>, repeats: number[], truncated: number[] }}
 */
export function collectContributions(prs) {
  const people = new Map();
  const person = (login) => {
    if (!people.has(login)) people.set(login, empty());
    return people.get(login);
  };
  const repeats = [];
  const truncated = [];
  for (const pr of prs) {
    if (pr.state !== "MERGED" || !pr.author) continue;
    if (isRepeat(pr)) {
      repeats.push(pr.number);
      continue;
    }
    if (pr.filesTruncated) truncated.push(pr.number);
    const imported = importOf(pr.number);
    const files = pr.files.filter((f) => !GENERATED.test(f.path));
    // The folder an import brought in: the top folder its files share under games/team-N/.
    const importFolders = imported
      ? [...new Set(files.map((f) => f.path.split("/").slice(0, 3).join("/")))].filter((d) =>
          /^games\/team-\d\/[^/.]+$/.test(d),
        )
      : [];
    const lines = files.reduce((n, f) => n + f.additions, 0);

    // Who did the work: the PR author, or for an import every author of its commits by their share of lines.
    let shares = new Map([[pr.author, 1]]);
    if (imported) {
      const byAuthor = new Map();
      for (const c of pr.commits) {
        const logins = [...new Set(c.authors.filter(Boolean))];
        for (const l of logins) byAuthor.set(l, (byAuthor.get(l) ?? 0) + (c.additions ?? 0) / logins.length);
      }
      const total = [...byAuthor.values()].reduce((a, b) => a + b, 0);
      if (total > 0) shares = new Map([...byAuthor].map(([l, n]) => [l, n / total]));
    }
    const type = imported ? "import" : workType(pr.title);
    for (const [login, share] of shares) {
      const p = person(login);
      p.lines += lines * share;
      if (type === "feature" || type === "import") p.featureLines += lines * share;
      for (const f of files) {
        const area = areaOf(f.path, importFolders);
        p.areas.set(area, (p.areas.get(area) ?? 0) + f.additions * share);
      }
      p.items.push({
        number: pr.number,
        title: cleanTitle(pr.title),
        type,
        lines: Math.round(lines * share),
        share,
      });
    }
  }
  return { people, repeats, truncated };
}

/**
 * The contribution of one student, ready for the report.
 * @param {ReturnType<typeof empty> | undefined} p
 * @param {number} teamLines the added lines of the student's whole team
 */
export function contributionOf(p, teamLines) {
  const c = p ?? empty();
  return {
    lines: Math.round(c.lines),
    teamShare: teamLines > 0 ? c.lines / teamLines : null,
    featureShare: c.lines > 0 ? c.featureLines / c.lines : null,
    areas: [...c.areas]
      .filter(([, n]) => n > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([area, n]) => ({ area, share: n / c.lines })),
    items: [...c.items].sort((a, b) => b.lines - a.lines),
  };
}

/**
 * Adds a `contribution` to every scored row, with the share counted within the row's team.
 * @param {{ login: string, team: string | null }[]} rows
 * @param {ReturnType<typeof collectContributions>["people"]} people
 */
export function withContributions(rows, people) {
  const teamLines = new Map();
  for (const r of rows)
    teamLines.set(r.team, (teamLines.get(r.team) ?? 0) + (people.get(r.login)?.lines ?? 0));
  return rows.map((r) => ({
    ...r,
    contribution: contributionOf(people.get(r.login), r.team ? (teamLines.get(r.team) ?? 0) : 0),
  }));
}

const pct = (x) => (x === null || x === undefined ? "–" : `${Math.round(x * 100)}%`);

/**
 * The contribution as table cells: lines, share in team, feature, main areas, merged work.
 * @param {ReturnType<typeof contributionOf>} c
 * @param {(text: string) => string} cell escapes text for a Markdown table cell
 */
export function contributionCells(c, cell) {
  const areas = c.areas.map((a) => `${cell(a.area)} (${pct(a.share)})`).join("<br>");
  const items = c.items
    .map(
      (i) =>
        `#${i.number} ${cell(i.title.slice(0, 70))} (${i.type}${i.share < 1 ? `, ${Math.round(i.share * 100)}% of it` : ""}, +${i.lines})`,
    )
    .join("<br>");
  return [
    String(c.lines),
    pct(c.teamShare),
    pct(c.featureShare),
    areas || "–",
    items || "no merged work PRs",
  ];
}
