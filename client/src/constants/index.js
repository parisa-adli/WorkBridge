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

// User verification and proposal review share these codes (ACCEPTED = a verified user).
export const STATUS = Object.freeze({ REJECTED: 0, PENDING: 1, ACCEPTED: 2 });

export const STATUS_BADGES = Object.freeze({
  [STATUS.REJECTED]: { label: "رد شده", className: "badge--danger" },
  [STATUS.PENDING]: { label: "در انتظار تایید", className: "badge--secondary" },
  [STATUS.ACCEPTED]: { label: "تایید شده", className: "badge--success" },
});

export const PROJECT_STATUS = Object.freeze({ OPEN: "OPEN", CLOSED: "CLOSED" });

export const PROJECT_STATUS_BADGES = Object.freeze({
  [PROJECT_STATUS.OPEN]: { label: "باز", className: "badge--success" },
  [PROJECT_STATUS.CLOSED]: { label: "بسته", className: "badge--danger" },
});

export const UNKNOWN_STATUS = Object.freeze({
  label: "نامشخص",
  className: "badge--secondary",
});

export const LIMITS = Object.freeze({
  PROJECT_TITLE_MIN: 10,
  PROJECT_TITLE_MAX: 30,
  PROJECT_BUDGET_MIN: 100000,
  PROJECT_BUDGET_MAX: 1000000000,
  OTP_MIN: 5,
  OTP_MAX: 6,
  NAME_MIN: 5,
  NAME_MAX: 100,
  PROFILE_NAME_MAX: 50,
  BIOGRAPHY_MAX: 30,
});

export const PHONE_PATTERN = /^09[0-9]{9}$/;
