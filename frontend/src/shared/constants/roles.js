export const ROLES = Object.freeze({
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
  PATIENT: "patient",
  DOCTOR: "doctor",
});

export const ROLE_BASE_PATH = Object.freeze({
  [ROLES.PATIENT]: "/patient",
  [ROLES.DOCTOR]: "/doctor",
  [ROLES.ADMIN]: "/admin",
  [ROLES.SUPER_ADMIN]: "/super-admin",
});
