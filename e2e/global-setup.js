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
    if (child.exitCode !== null) throw new Error(`process for ${url} exited with ${child.exitCode}`);
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
  return child;
}

module.exports = async function globalSetup() {
  const mongod = await MongoMemoryServer.create();
  const mongoUri = mongod.getUri("workbridge-e2e");

  // The create-project form needs a category to pick.
  const client = await MongoClient.connect(mongoUri);
  await client.db().collection("categories").insertOne({
    title: "برنامه نویسی",
    englishTitle: "programming",
    description: "e2e category",
    type: "project",
    parentId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  await client.close();

  const [serverPort, clientPort] = [await freePort(), await freePort()];
  const serverUrl = `http://localhost:${serverPort}`;
  const clientUrl = `http://localhost:${clientPort}`;

  // Explicit values win over server/.env, which dotenv never overrides.
  const server = start(["index.js"], path.join(root, "server"), {
    PORT: String(serverPort),
    APP_DB: mongoUri,
    NODE_ENV: "development",
    DOMAIN: "localhost",
    ACCESS_TOKEN_SECRET_KEY: "e2e-access-secret",
    REFRESH_TOKEN_SECRET_KEY: "e2e-refresh-secret",
    COOKIE_PARSER_SECRET_KEY: "e2e-cookie-secret",
    TOKEN_SECRET_KEY: "e2e-token-secret",
    SERVER_URL: serverUrl,
    CLIENT_URL: clientUrl,
    ALLOW_CORS_ORIGIN: clientUrl,
  });
  const vite = start(
    [path.join(root, "client/node_modules/vite/bin/vite.js"), "--port", String(clientPort), "--strictPort"],
    path.join(root, "client"),
    { VITE_BASE_URL: `${serverUrl}/api` }
  );

  const stop = async () => {
    server.kill();
    vite.kill();
    await mongod.stop();
  };

  try {
    // category/list needs the DB, so 200 means the server is listening and connected.
    await waitFor(`${serverUrl}/api/category/list`, server);
    await waitFor(clientUrl, vite);
  } catch (err) {
    await stop();
    throw err;
  }

  process.env.E2E_CLIENT_URL = clientUrl;
  process.env.E2E_MONGO_URI = mongoUri;
  return stop;
};
