export type FolderStatus = "active" | "archived";

export const FOLDER_COLORS: { label: string; hex: string }[] = [
  { label: "Cian", hex: "#16A8DA" },
  { label: "Verde", hex: "#46B45A" },
  { label: "Teal", hex: "#1CB5A6" },
  { label: "Ámbar", hex: "#E0A91B" },
  { label: "Púrpura", hex: "#8B5CF6" },
  { label: "Rojo", hex: "#E0564B" },
  { label: "Gris", hex: "#64748B" },
];

export function statusLabel(status?: string): string {
  return status === "archived" ? "Archivada" : "Activa";
}
