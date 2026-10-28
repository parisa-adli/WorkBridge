// Single source for roles, statuses and validation limits. Mirrors client/src/constants/index.js.
export const MongoIDPattern = /^[a-f\d]{24}$/i;
export const ROLES = Object.freeze({
  ADMIN: "ADMIN",
  FREELANCER: "FREELANCER",
  OWNER: "OWNER",
});
// User verification and proposal review share these codes (ACCEPTED = a verified user).
export const STATUS = Object.freeze({ REJECTED: 0, PENDING: 1, ACCEPTED: 2 });
export const PROJECT_STATUS = Object.freeze({ OPEN: "OPEN", CLOSED: "CLOSED" });
// Public demo accounts for the demo login tab (pre-filled in the client); `npm run seed` creates them.
export const DEMO_USERS = Object.freeze({
  OWNER: {
    username: "demo-owner",
    name: "کارفرمای نمونه",
    biography: "کارفرمای نمونه",
    en: { name: "Demo Owner", biography: "Demo owner" },
    email: "owner@workbridge.dev",
    password: "Owner@1234",
  },
  FREELANCER: {
    username: "demo-freelancer",
    name: "فریلنسر نمونه",
    biography: "توسعه‌دهنده وب",
    en: { name: "Demo Freelancer", biography: "Web developer" },
    email: "freelancer@workbridge.dev",
    password: "Freelancer@1234",
  },
  ADMIN: {
    username: "demo-admin",
    name: "مدیر نمونه",
    biography: "مدیر سامانه",
    en: { name: "Demo Admin", biography: "Site admin" },
    email: "admin@workbridge.dev",
    password: "Admin@1234",
  },
});
export const DEMO_USERNAMES = Object.values(DEMO_USERS).map(({ username }) => username);
export const LIMITS = Object.freeze({
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
});
export const PHONE_PATTERN = /^09[0-9]{9}$/;
