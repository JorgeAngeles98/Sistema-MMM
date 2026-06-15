// Traduce los códigos de permiso a texto entendible por el usuario.
const PERMISSION_LABELS: Record<string, string> = {
  "users:read": "Ver usuarios",
  "users:create": "Crear usuarios",
  "users:update": "Editar usuarios",
  "users:delete": "Eliminar usuarios",
  "roles:read": "Ver roles",
  "roles:manage": "Gestionar roles",
  "files:read": "Ver archivos",
  "files:upload": "Subir archivos",
  "files:delete": "Eliminar archivos",
  "tasks:read": "Ver tareas",
  "tasks:manage": "Gestionar tareas",
};

export function permissionLabel(code: string): string {
  return PERMISSION_LABELS[code] ?? code;
}
