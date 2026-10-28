const { defineConfig } = require("vitest/config");

module.exports = defineConfig({
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    testTimeout: 60000,
    hookTimeout: 60000, // Jest's testTimeout also covered hooks (beforeAll starts mongod)
    fileParallelism: false, // same as jest --runInBand
  },
});
