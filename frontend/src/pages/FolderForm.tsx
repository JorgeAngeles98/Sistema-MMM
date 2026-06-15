import { useEffect, useState, FormEvent, ReactNode } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { api } from "../lib/api";
import { FOLDER_COLORS } from "../lib/folderMeta";

interface Category {
  id: string;
  name: string;
}
interface FolderData {
  id: string;
  name: string;
  description?: string;
  category?: string;
  color?: string;
  status?: string;
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

export default function FolderForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    color: FOLDER_COLORS[0].hex,
    status: "active",
  });

  useEffect(() => {
    async function init() {
      try {
        const c = await api<{ categories: Category[] }>("/categories").catch(
          () => ({ categories: [] as Category[] })
        );
        setCategories(c.categories);
        if (editing) {
          const d = await api<{ folder: FolderData }>(`/folders/${id}`);
          setForm({
            name: d.folder.name,
            description: d.folder.description ?? "",
            category: d.folder.category ?? "",
            color: d.folder.color || FOLDER_COLORS[0].hex,
            status: d.folder.status ?? "active",
          });
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
      if (editing) {
        await api(`/folders/${id}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
      } else {
        await api("/folders", { method: "POST", body: JSON.stringify(form) });
      }
      navigate("/carpetas");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar");
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="text-brand-muted animate-fade-in">Cargando…</div>;
  }

  return (
    <div className="space-y-6 w-full max-w-3xl">
      <div className="flex items-center gap-3">
        <Link
          to="/carpetas"
          className="text-brand-muted hover:text-slate-200 transition"
          title="Volver"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <h1 className="text-3xl font-bold">
          {editing ? "Editar carpeta" : "Nueva carpeta"}
        </h1>
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

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre">
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputCls}
            />
          </Field>
          <Field label="Categoría (elige o escribe una nueva)">
            <input
              list="cats"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className={inputCls}
              placeholder="Ej. Marketing"
            />
            <datalist id="cats">
              {categories.map((c) => (
                <option key={c.id} value={c.name} />
              ))}
            </datalist>
          </Field>
        </div>

        <Field label="Descripción">
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className={inputCls}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <span className="block mb-2 text-sm text-brand-muted">Color</span>
            <div className="flex flex-wrap gap-2">
              {FOLDER_COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  title={c.label}
                  onClick={() => setForm({ ...form, color: c.hex })}
                  className={`w-8 h-8 rounded-full transition ${
                    form.color === c.hex
                      ? "ring-2 ring-offset-2 ring-offset-brand-surface ring-white"
                      : "hover:scale-110"
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>
          <Field label="Estado">
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className={inputCls}
            >
              <option value="active">Activa</option>
              <option value="archived">Archivada</option>
            </select>
          </Field>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            disabled={saving}
            className="bg-brand-gradient text-white rounded-lg px-5 py-2 font-medium disabled:opacity-60 hover:brightness-110 transition"
          >
            {saving ? "Guardando…" : editing ? "Guardar cambios" : "Crear carpeta"}
          </button>
          <Link
            to="/carpetas"
            className="px-5 py-2 rounded-lg text-slate-300 hover:bg-brand-surface2 transition"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
