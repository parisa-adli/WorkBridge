// Single source for roles, statuses and validation limits. Mirrors server/utils/constants.ts.

export const ROLES = Object.freeze({
  ADMIN: "ADMIN",
  OWNER: "OWNER",
  FREELANCER: "FREELANCER",
});

// The first URL segment of each role's pages (useAuthorize reads it back).
export const ROLE_HOME = Object.freeze({
  [ROLES.ADMIN]: "/admin",
  [ROLES.OWNER]: "/owner",
  [ROLES.FREELANCER]: "/freelancer",
});

// Public demo accounts pre-filled in the demo login tab. Mirrors DEMO_USERS in server/utils/constants.ts.
export const DEMO_USERS = Object.freeze({
  [ROLES.OWNER]: { username: "demo-owner", password: "Owner@1234" },
  [ROLES.FREELANCER]: { username: "demo-freelancer", password: "Freelancer@1234" },
  [ROLES.ADMIN]: { username: "demo-admin", password: "Admin@1234" },
});

// User verification and proposal review share these codes (ACCEPTED = a verified user).
export const STATUS = Object.freeze({ REJECTED: 0, PENDING: 1, ACCEPTED: 2 });

// Badge labels are translation keys.
export const STATUS_BADGES = Object.freeze({
  [STATUS.REJECTED]: { label: "status.rejected", className: "badge--danger" },
  [STATUS.PENDING]: { label: "status.pending", className: "badge--secondary" },
  [STATUS.ACCEPTED]: { label: "status.accepted", className: "badge--success" },
});

export const PROJECT_STATUS = Object.freeze({ OPEN: "OPEN", CLOSED: "CLOSED" });

export const PROJECT_STATUS_BADGES = Object.freeze({
  [PROJECT_STATUS.OPEN]: { label: "projectStatus.open", className: "badge--success" },
  [PROJECT_STATUS.CLOSED]: { label: "projectStatus.closed", className: "badge--danger" },
});

export const UNKNOWN_STATUS = Object.freeze({
  label: "status.unknown",
  className: "badge--secondary",
});

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
