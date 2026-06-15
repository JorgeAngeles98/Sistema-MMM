import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import {
  TASK_STATUSES,
  TaskStatus,
  statusColor,
  formatDate,
} from "../lib/taskMeta";

interface Ref {
  id: string;
  name: string | null;
}
interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  dueDate?: string | null;
  file: Ref | null;
  assignedTo: Ref | null;
  createdBy: Ref | null;
}

function IconPlus() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
function IconEdit() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}
function IconTrash() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
      <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    </svg>
  );
}

export default function Tasks() {
  const { hasPermission, user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canManage = hasPermission("tasks:manage");

  async function load() {
    try {
      setLoading(true);
      const d = await api<{ tasks: Task[] }>("/tasks");
      setTasks(d.tasks);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function changeStatus(t: Task, status: TaskStatus) {
    try {
      await api(`/tasks/${t.id}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      setTasks((prev) =>
        prev.map((x) => (x.id === t.id ? { ...x, status } : x))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }

  async function remove(t: Task) {
    if (!confirm(`¿Eliminar la tarea "${t.title}"?`)) return;
    try {
      await api(`/tasks/${t.id}`, { method: "DELETE" });
      setTasks((prev) => prev.filter((x) => x.id !== t.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }

  function canChangeStatus(t: Task): boolean {
    return canManage || t.assignedTo?.id === user?.id;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Tareas</h1>
          {!canManage && (
            <p className="text-brand-muted text-sm">Tareas asignadas a ti.</p>
          )}
        </div>
        {canManage && (
          <Link
            to="/tareas/new"
            className="inline-flex items-center gap-2 bg-brand-gradient text-white rounded-lg px-4 py-2 font-medium hover:brightness-110 transition"
          >
            <IconPlus />
            Nueva tarea
          </Link>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/40 text-red-300 text-sm rounded px-3 py-2">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-brand-muted">Cargando…</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {TASK_STATUSES.map((col) => {
            const items = tasks.filter((t) => t.status === col.key);
            return (
              <div key={col.key} className="bg-brand-surface/50 border border-brand-border rounded-xl p-3">
                <div className="flex items-center justify-between px-1 pb-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${col.color}`}>
                    {col.label}
                  </span>
                  <span className="text-brand-muted text-xs">{items.length}</span>
                </div>
                <div className="space-y-3">
                  {items.length === 0 ? (
                    <div className="text-brand-muted text-xs px-1 py-4 text-center">
                      Sin tareas
                    </div>
                  ) : (
                    items.map((t) => (
                      <div
                        key={t.id}
                        className="bg-brand-surface border border-brand-border rounded-lg p-3 space-y-2 animate-fade-in-up"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-medium text-sm">{t.title}</div>
                          {canManage && (
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <Link
                                to={`/tareas/${t.id}/edit`}
                                className="text-brand-muted hover:text-brand-cyan transition"
                                title="Editar"
                              >
                                <IconEdit />
                              </Link>
                              <button
                                onClick={() => remove(t)}
                                className="text-brand-muted hover:text-red-400 transition"
                                title="Eliminar"
                              >
                                <IconTrash />
                              </button>
                            </div>
                          )}
                        </div>
                        {t.description && (
                          <p className="text-brand-muted text-xs line-clamp-3">
                            {t.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-1.5 text-[11px]">
                          {t.assignedTo && (
                            <span className="bg-brand-surface2 text-slate-300 px-2 py-0.5 rounded">
                              👤 {t.assignedTo.name}
                            </span>
                          )}
                          {t.file && (
                            <span className="bg-brand-surface2 text-brand-teal px-2 py-0.5 rounded">
                              📎 {t.file.name}
                            </span>
                          )}
                          {t.dueDate && (
                            <span className="bg-brand-surface2 text-brand-muted px-2 py-0.5 rounded">
                              📅 {formatDate(t.dueDate)}
                            </span>
                          )}
                        </div>
                        {canChangeStatus(t) && (
                          <select
                            value={t.status}
                            onChange={(e) =>
                              changeStatus(t, e.target.value as TaskStatus)
                            }
                            className="w-full mt-1 bg-brand-input border border-brand-border rounded px-2 py-1 text-xs focus:outline-none focus:border-brand-cyan"
                          >
                            {TASK_STATUSES.map((s) => (
                              <option key={s.key} value={s.key}>
                                {s.label}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
