const { spawn } = require("child_process");
const net = require("net");
const path = require("path");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { MongoClient } = require("mongodb");

const root = path.join(__dirname, "..");

function freePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer().listen(0, () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
    srv.on("error", reject);
  });
}

async function waitFor(url, child, timeout = 60_000) {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    if (child.spawnError) throw child.spawnError;
    if (child.exitCode !== null || child.signalCode !== null)
      throw new Error(`process for ${url} exited with ${child.exitCode ?? child.signalCode}`);
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`${url} not ready after ${timeout}ms`);
}

function start(args, cwd, env) {
  const child = spawn(process.execPath, args, { cwd, env: { ...process.env, ...env }, stdio: "pipe" });
  // Keep output for debugging failures without flooding the test report.
  child.stdout.on("data", (d) => process.env.E2E_DEBUG && process.stdout.write(d));
  child.stderr.on("data", (d) => process.stderr.write(d));
  child.on("error", (err) => (child.spawnError = err));
  return child;
}

// Only the demo accounts, not `npm run seed`'s projects and categories, which the specs' fixed data would collide with.
async function seedDemoUsers(mongoUri) {
  const script = `import mongoose from "mongoose";
import { seedDemoUsers } from "./utils/seedDemoUsers";
(async () => {
  await mongoose.connect(process.env.APP_DB);
  await seedDemoUsers();
  await mongoose.disconnect();
})();`;
  const child = start([path.join(root, "server/node_modules/tsx/dist/cli.mjs"), "-e", script], path.join(root, "server"), {
    APP_DB: mongoUri,
  });
  const code = await new Promise((resolve) => child.on("close", resolve));
  if (code !== 0) throw new Error(`seeding the demo users exited with ${code}`);
}

// Ports come from freePort, so another process can take one before the child binds it; retry with fresh ports.
async function startApps(mongoUri, attempts = 3) {
  for (let attempt = 1; ; attempt++) {
    const [serverPort, clientPort] = [await freePort(), await freePort()];
    const serverUrl = `http://localhost:${serverPort}`;
    const clientUrl = `http://localhost:${clientPort}`;

    // Explicit values win over server/.env, which dotenv never overrides.
    const server = start([path.join(root, "server/node_modules/tsx/dist/cli.mjs"), "index.ts"], path.join(root, "server"), {
      PORT: String(serverPort),
      APP_DB: mongoUri,
      NODE_ENV: "development",
      DOMAIN: "localhost",
      ACCESS_TOKEN_SECRET_KEY: "e2e-access-secret",
      REFRESH_TOKEN_SECRET_KEY: "e2e-refresh-secret",
      COOKIE_PARSER_SECRET_KEY: "e2e-cookie-secret",
      TOKEN_SECRET_KEY: "e2e-token-secret",
      // Every signed-in spec logs in from the same IP; the default 10 per 15 min is too few for the suite.
      OTP_RATE_LIMIT: "1000",
      DEMO_LOGIN_ENABLED: "true",
      SERVER_URL: serverUrl,
      CLIENT_URL: clientUrl,
      ALLOW_CORS_ORIGIN: clientUrl,
    });
    const vite = start(
      [path.join(root, "client/node_modules/vite/bin/vite.js"), "--port", String(clientPort), "--strictPort"],
      path.join(root, "client"),
      { VITE_BASE_URL: `${serverUrl}/api` }
    );
    const kill = () => {
      server.kill();
      vite.kill();
    };

    try {
      // category/list needs the DB, so 200 means the server is listening and connected.
      await waitFor(`${serverUrl}/api/category/list`, server);
      await waitFor(clientUrl, vite);
      return { serverUrl, clientUrl, kill };
    } catch (err) {
      kill();
      const exited = [server, vite].some((c) => c.exitCode !== null || c.signalCode !== null);
      if (!exited || attempt >= attempts) throw err;
    }
  }
}

module.exports = async function globalSetup() {
  const mongod = await MongoMemoryServer.create();
  const mongoUri = mongod.getUri("workbridge-e2e");

  try {
    // The create-project form needs a category to pick.
    const client = await MongoClient.connect(mongoUri);
    try {
      await client.db().collection("categories").insertOne({
        title: "برنامه نویسی",
        englishTitle: "programming",
        description: "e2e category",
        type: "project",
        parentId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } finally {
      await client.close();
    }
    await seedDemoUsers(mongoUri);

    const { serverUrl, clientUrl, kill } = await startApps(mongoUri);
    process.env.E2E_SERVER_URL = serverUrl;
    process.env.E2E_CLIENT_URL = clientUrl;
    process.env.E2E_MONGO_URI = mongoUri;
    return async () => {
      kill();
      await mongod.stop();
    };
  } catch (err) {
    await mongod.stop();
    throw err;
  }
};
