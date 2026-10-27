import { ROLES, STATUS, PROJECT_STATUS, LIMITS } from "../utils/constants";
import { ERROR_CODES, SUCCESS_CODES } from "../utils/errorCodes";

// These values are shared with the client (client/src/constants/index.js); change both together.
describe("constants", () => {
  it("roles", () => {
    expect(ROLES).toEqual({ ADMIN: "ADMIN", OWNER: "OWNER", FREELANCER: "FREELANCER" });
  });

  it("status codes", () => {
    expect(STATUS).toEqual({ REJECTED: 0, PENDING: 1, ACCEPTED: 2 });
    expect(PROJECT_STATUS).toEqual({ OPEN: "OPEN", CLOSED: "CLOSED" });
  });

  it("error and success codes are their own names and never overlap", () => {
    for (const codes of [ERROR_CODES, SUCCESS_CODES])
      for (const [key, value] of Object.entries(codes)) expect(value).toBe(key);
    expect(Object.keys(ERROR_CODES).filter((k) => Object.hasOwn(SUCCESS_CODES, k))).toEqual([]);
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
