import { describe, expect, it } from "vitest";
import {
  LIMITS,
  PROJECT_STATUS,
  PROJECT_STATUS_BADGES,
  ROLE_HOME,
  ROLES,
  STATUS,
  STATUS_BADGES,
} from ".";

// These values are shared with the server (server/utils/constants.js); change both together.
describe("constants", () => {
  it("roles and their home paths", () => {
    expect(ROLES).toEqual({ ADMIN: "ADMIN", OWNER: "OWNER", FREELANCER: "FREELANCER" });
    expect(ROLE_HOME).toEqual({ ADMIN: "/admin", OWNER: "/owner", FREELANCER: "/freelancer" });
  });

  it("status codes with labels and badge styles", () => {
    expect(STATUS).toEqual({ REJECTED: 0, PENDING: 1, ACCEPTED: 2 });
    expect(STATUS_BADGES).toEqual({
      0: { label: "رد شده", className: "badge--danger" },
      1: { label: "در انتظار تایید", className: "badge--secondary" },
      2: { label: "تایید شده", className: "badge--success" },
    });
    expect(PROJECT_STATUS).toEqual({ OPEN: "OPEN", CLOSED: "CLOSED" });
    expect(PROJECT_STATUS_BADGES).toEqual({
      OPEN: { label: "باز", className: "badge--success" },
      CLOSED: { label: "بسته", className: "badge--danger" },
    });
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
