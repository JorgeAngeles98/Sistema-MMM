// Catálogo central de permisos del sistema.
// Cada rol tiene un subconjunto de estos permisos.
export const PERMISSIONS = {
  USERS_READ: "users:read",
  USERS_CREATE: "users:create",
  USERS_UPDATE: "users:update",
  USERS_DELETE: "users:delete",
  ROLES_READ: "roles:read",
  ROLES_MANAGE: "roles:manage",
  FILES_READ: "files:read",
  FILES_UPLOAD: "files:upload",
  FILES_DELETE: "files:delete",
  TASKS_READ: "tasks:read",
  TASKS_MANAGE: "tasks:manage",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ALL_PERMISSIONS: string[] = Object.values(PERMISSIONS);
