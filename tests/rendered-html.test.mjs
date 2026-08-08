import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import test, { after, before } from "node:test";

const projectDirectory = fileURLToPath(new URL("..", import.meta.url));
const nextBinary = fileURLToPath(new URL("../node_modules/next/dist/bin/next", import.meta.url));
let nextServer;
let baseUrl;
let serverOutput = "";

async function availablePort() {
  const server = createServer();
  await new Promise((resolve, reject) => server.listen(0, "127.0.0.1", (error) => error ? reject(error) : resolve()));
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : 0;
  await new Promise((resolve) => server.close(resolve));
  return port;
}

before(async () => {
  const port = await availablePort();
  baseUrl = `http://127.0.0.1:${port}`;
  nextServer = spawn(process.execPath, [nextBinary, "start", "-H", "127.0.0.1", "-p", String(port)], {
    cwd: projectDirectory,
    env: { ...process.env, NODE_ENV: "production" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  nextServer.stdout.on("data", (chunk) => { serverOutput += chunk.toString(); });
  nextServer.stderr.on("data", (chunk) => { serverOutput += chunk.toString(); });

  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    if (nextServer.exitCode !== null) throw new Error(`Next.js sunucusu başlatılamadı:\n${serverOutput}`);
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch (error) {
      if (nextServer.exitCode !== null) throw error;
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`Next.js sunucusu zamanında hazır olmadı:\n${serverOutput}`);
});

after(() => {
  nextServer?.kill();
});

test("standard Next.js server renders the Navbea application", async () => {
  const response = await fetch(baseUrl, { headers: { accept: "text/html" } });
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /alt="Navbea"/);
  assert.match(html, />Ana Sayfa</);
  assert.match(html, />Panolar</);
  assert.match(html, />İzleme</);
  assert.match(html, />Yönetim</);
  assert.match(html, />Raporlar</);
  assert.match(html, />Modüller</);
  assert.match(html, /Operasyon Merkezi/);
  assert.match(html, /Kurulum Sihirbazı/);
});

test("contains the complete service tree and no Vinext runtime", async () => {
  const [app, css, layout, packageSource, nextEnv] = await Promise.all([
    readFile(new URL("../app/NavbeaApp.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../next-env.d.ts", import.meta.url), "utf8"),
  ]);

  const serviceBlock = app.slice(app.indexOf("const SERVICES"), app.indexOf("type SidebarNode"));
  const treeBlock = app.slice(app.indexOf("const SIDEBAR_TREE"), app.indexOf("function nodeContainsService"));
  const serviceIds = [...serviceBlock.matchAll(/\{ id: "([^"]+)", title:/g)].map((match) => match[1]);
  const sidebarIds = [...treeBlock.matchAll(/serviceId: "([^"]+)"/g)].map((match) => match[1]);
  const reachableIds = new Set([...sidebarIds, "wizard"]);
  const packageJson = JSON.parse(packageSource);

  assert.equal(serviceIds.length, 68);
  assert.deepEqual(serviceIds.filter((id) => !reachableIds.has(id)), []);
  assert.equal(packageJson.scripts.dev, "next dev");
  assert.equal(packageJson.scripts.build, "next build");
  assert.equal(packageJson.scripts.start, "next start");
  assert.equal(packageJson.dependencies.next, "16.3.0");
  assert.equal(packageJson.devDependencies?.vinext, undefined);
  assert.equal(packageJson.devDependencies?.vite, undefined);
  assert.doesNotMatch(nextEnv, /vinext/i);
  assert.match(app, /className="command-popover"/);
  assert.match(app, /className="navigation-shell"/);
  assert.match(app, /SIK KULLANILANLAR/);
  assert.match(app, /navbea:pinned-tabs/);
  assert.match(app, /className="tab-pin"/);
  assert.match(app, /MAX_WORKSPACE_TABS/);
  assert.match(app, /!pinnedTabIds\.includes\(candidate\)/);
  assert.match(app, /setTabs\(\(current\) => \["home", \.\.\.validPins/);
  assert.doesNotMatch(app, /Sabitlenenler/);
  assert.match(app, /className="filter-dropdown"/);
  assert.match(css, /\.filter-popover/);
  assert.equal(packageJson.dependencies.recharts.startsWith("^"), true);
  assert.match(app, /getTableModel/);
  assert.match(css, /\.nav-flyout/);
  assert.match(css, /\.donut\.health-distribution/);
  assert.match(layout, /manrope/i);
});
