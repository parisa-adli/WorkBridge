import { describe, expect, it } from "vitest";
import {
  CATEGORY_TYPES,
  LIMITS,
  PHONE_PATTERN,
  PROJECT_STATUS,
  PROJECT_STATUS_BADGES,
  ROLE_HOME,
  ROLES,
  STATUS,
  STATUS_BADGES,
} from ".";

// These values are shared with the server (server/utils/constants.ts); change both together.
describe("constants", () => {
  it("roles and their home paths", () => {
    expect(ROLES).toEqual({ ADMIN: "ADMIN", OWNER: "OWNER", FREELANCER: "FREELANCER" });
    expect(ROLE_HOME).toEqual({ ADMIN: "/admin", OWNER: "/owner", FREELANCER: "/freelancer" });
  });

  it("status codes with label keys and badge styles", () => {
    expect(STATUS).toEqual({ REJECTED: 0, PENDING: 1, ACCEPTED: 2 });
    expect(STATUS_BADGES).toEqual({
      0: { label: "status.rejected", className: "badge--danger" },
      1: { label: "status.pending", className: "badge--secondary" },
      2: { label: "status.accepted", className: "badge--success" },
    });
    expect(PROJECT_STATUS).toEqual({ OPEN: "OPEN", CLOSED: "CLOSED" });
    expect(PROJECT_STATUS_BADGES).toEqual({
      OPEN: { label: "projectStatus.open", className: "badge--success" },
      CLOSED: { label: "projectStatus.closed", className: "badge--danger" },
    });
  });

  it("validation limits", () => {
    expect(LIMITS).toEqual({
      PROJECT_TITLE_MIN: 10,
      PROJECT_TITLE_MAX: 30,
      PROJECT_BUDGET_MIN: 100000,
      PROJECT_BUDGET_MAX: 1000000000,
      PROJECT_DESCRIPTION_MIN: 15,
      PROJECT_TAGS_MAX: 20,
      PROPOSAL_DESCRIPTION_MIN: 10,
      PROPOSAL_PRICE_MIN: 10000,
      PROPOSAL_PRICE_MAX: 1000000000,
      PROPOSAL_DURATION_MIN: 1,
      PROPOSAL_DURATION_MAX: 365,
      OTP_MIN: 5,
      OTP_MAX: 6,
      NAME_MIN: 5,
      NAME_MAX: 100,
      PROFILE_NAME_MAX: 50,
      BIOGRAPHY_MAX: 30,
      CATEGORY_TITLE_MIN: 3,
      CATEGORY_TITLE_MAX: 100,
      CATEGORY_DESCRIPTION_MIN: 3,
      CATEGORY_DESCRIPTION_MAX: 200,
      PAGE_SIZE: 10,
      PAGE_SIZE_MAX: 100,
    });
    expect(CATEGORY_TYPES).toEqual(["project", "post", "comment", "ticket"]);
    expect(PHONE_PATTERN.source).toBe("^09[0-9]{9}$");
  });
});
