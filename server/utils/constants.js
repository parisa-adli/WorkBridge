// Single source for roles, statuses and validation limits. Mirrors client/src/constants/index.js.
module.exports = {
  MongoIDPattern: /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i,
  ROLES: Object.freeze({
    ADMIN: "ADMIN",
    FREELANCER: "FREELANCER",
    OWNER: "OWNER",
  }),
  // User verification and proposal review share these codes (ACCEPTED = a verified user).
  STATUS: Object.freeze({ REJECTED: 0, PENDING: 1, ACCEPTED: 2 }),
  PROJECT_STATUS: Object.freeze({ OPEN: "OPEN", CLOSED: "CLOSED" }),
  // Public demo accounts for the email login tab (pre-filled in the client); seeded on startup.
  DEMO_USERS: Object.freeze({
    OWNER: { name: "کارفرمای نمونه", email: "owner@workbridge.dev", password: "Owner@1234" },
    FREELANCER: { name: "فریلنسر نمونه", email: "freelancer@workbridge.dev", password: "Freelancer@1234" },
  }),
  LIMITS: Object.freeze({
    PROJECT_TITLE_MIN: 10,
    PROJECT_TITLE_MAX: 30,
    PROJECT_BUDGET_MIN: 100000,
    PROJECT_BUDGET_MAX: 1000000000,
  }),
};
