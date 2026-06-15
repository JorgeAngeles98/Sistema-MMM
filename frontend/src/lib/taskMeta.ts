export type TaskStatus = "pending" | "in_progress" | "done";

export const TASK_STATUSES: { key: TaskStatus; label: string; color: string }[] = [
  { key: "pending", label: "Pendiente", color: "bg-amber-500/20 text-amber-300" },
  {
    key: "in_progress",
    label: "En progreso",
    color: "bg-brand-cyan/20 text-brand-cyan",
  },
  { key: "done", label: "Hecho", color: "bg-brand-green/20 text-brand-green" },
];

export function statusLabel(s?: string): string {
  return TASK_STATUSES.find((x) => x.key === s)?.label ?? "—";
}
export function statusColor(s?: string): string {
  return (
    TASK_STATUSES.find((x) => x.key === s)?.color ??
    "bg-brand-surface2 text-brand-muted"
  );
}

export function formatDate(value?: string | null): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString("es-PE", { dateStyle: "medium" });
  } catch {
    return "—";
  }
}
