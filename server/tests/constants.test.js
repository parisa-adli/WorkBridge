const { ROLES, STATUS, PROJECT_STATUS, LIMITS } = require("../utils/constants");

// These values are shared with the client (client/src/constants/index.js); change both together.
describe("constants", () => {
  it("roles", () => {
    expect(ROLES).toEqual({ ADMIN: "ADMIN", OWNER: "OWNER", FREELANCER: "FREELANCER" });
  });

  it("status codes", () => {
    expect(STATUS).toEqual({ REJECTED: 0, PENDING: 1, ACCEPTED: 2 });
    expect(PROJECT_STATUS).toEqual({ OPEN: "OPEN", CLOSED: "CLOSED" });
  });

  it("validation limits", () => {
    expect(LIMITS).toEqual({
      PROJECT_TITLE_MIN: 10,
      PROJECT_TITLE_MAX: 30,
      PROJECT_BUDGET_MIN: 100000,
      PROJECT_BUDGET_MAX: 1000000000,
    });
  });
});
