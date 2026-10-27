// Single source for roles, statuses and validation limits. Mirrors client/src/constants/index.js.
export const MongoIDPattern = /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i;
export const ROLES = Object.freeze({
  ADMIN: "ADMIN",
  FREELANCER: "FREELANCER",
  OWNER: "OWNER",
});
// User verification and proposal review share these codes (ACCEPTED = a verified user).
export const STATUS = Object.freeze({ REJECTED: 0, PENDING: 1, ACCEPTED: 2 });
export const PROJECT_STATUS = Object.freeze({ OPEN: "OPEN", CLOSED: "CLOSED" });
export const LIMITS = Object.freeze({
  PROJECT_TITLE_MIN: 10,
  PROJECT_TITLE_MAX: 30,
  PROJECT_BUDGET_MIN: 100000,
  PROJECT_BUDGET_MAX: 1000000000,
});
