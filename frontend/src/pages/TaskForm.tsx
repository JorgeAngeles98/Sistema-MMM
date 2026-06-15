import { useEffect, useState, FormEvent, ReactNode } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import { TASK_STATUSES } from "../lib/taskMeta";

interface UserRow {
  id: string;
  name: string;
}

const inputCls =
  "w-full rounded-lg bg-brand-input border border-brand-border px-3 py-2 focus:outline-none focus:border-brand-cyan transition";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="block mb-1 text-brand-muted">{label}</span>
      {children}
    </label>
  );
}

export default function TaskForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [users, setUsers] = useState<UserRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileId, setFileId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    assignedTo: "",
    status: "pending",
    dueDate: "",
  });

  useEffect(() => {
    async function init() {
      try {
        const u = await api<{ users: UserRow[] }>("/users").catch(() => ({
          users: [] as UserRow[],
        }));
        setUsers(u.users);

        if (editing) {
          const d = await api<{ task: any }>(`/tasks/${id}`);
          const t = d.task;
          setForm({
            title: t.title ?? "",
            description: t.description ?? "",
            assignedTo: t.assignedTo?.id ?? "",
            status: t.status ?? "pending",
            dueDate: t.dueDate ? String(t.dueDate).slice(0, 10) : "",
          });
          if (t.file) {
            setFileId(t.file.id);
            setFileName(t.file.name);
          }
        } else {
          const qf = searchParams.get("file");
          if (qf) {
            setFileId(qf);
            try {
              const f = await api<{ file: { name: string } }>(`/files/${qf}`);
              setFileName(f.file.name);
            } catch {
              setFileName(null);
            }
          }
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [id]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const body = {
        title: form.title,
        description: form.description,
        assignedTo: form.assignedTo,
        status: form.status,
        dueDate: form.dueDate,
        fileId,
      };
      if (editing) {
        await api(`/tasks/${id}`, { method: "PUT", body: JSON.stringify(body) });
      } else {
        await api("/tasks", { method: "POST", body: JSON.stringify(body) });
      }
      navigate("/tareas");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar");
      setSaving(false);
    }
  }

  if (loading) return <div className="text-brand-muted animate-fade-in">Cargando…</div>;

  return (
    <div className="space-y-6 w-full max-w-2xl">
      <div className="flex items-center gap-3">
        <Link to="/tareas" className="text-brand-muted hover:text-slate-200 transition" title="Volver">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path d="M15 18l-6-6 6-6" /></svg>
        </Link>
        <h1 className="text-3xl font-bold">{editing ? "Editar tarea" : "Nueva tarea"}</h1>
      </div>

      <form
        onSubmit={submit}
        className="bg-brand-surface border border-brand-border rounded-xl p-6 space-y-4 animate-fade-in-up"
      >
        {error && (
          <div className="bg-red-500/10 border border-red-500/40 text-red-300 text-sm rounded px-3 py-2">
            {error}
          </div>
        )}

        {fileName && (
          <div className="bg-brand-surface2 text-brand-teal text-sm rounded px-3 py-2">
            📎 Vinculada al archivo: <span className="font-medium">{fileName}</span>
          </div>
        )}

        <Field label="Título">
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className={inputCls}
          />
        </Field>
        <Field label="Descripción">
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className={inputCls}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Asignar a">
            <select
              value={form.assignedTo}
              onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
              className={inputCls}
            >
              <option value="">Sin asignar</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Estado">
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className={inputCls}
            >
              {TASK_STATUSES.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Vence">
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              className={inputCls}
            />
          </Field>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            disabled={saving}
            className="bg-brand-gradient text-white rounded-lg px-5 py-2 font-medium disabled:opacity-60 hover:brightness-110 transition"
          >
            {saving ? "Guardando…" : editing ? "Guardar cambios" : "Crear tarea"}
          </button>
          <Link to="/tareas" className="px-5 py-2 rounded-lg text-slate-300 hover:bg-brand-surface2 transition">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
