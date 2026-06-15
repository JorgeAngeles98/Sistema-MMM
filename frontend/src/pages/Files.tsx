import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { FOLDER_COLORS, statusLabel } from "../lib/folderMeta";

interface Category {
  id: string;
  name: string;
}
interface Folder {
  id: string;
  name: string;
  description?: string;
  category?: string;
  color?: string;
  status?: string;
  fileCount: number;
}

function IconFolder({ color }: { color?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={color || "currentColor"}
      strokeWidth="1.6"
      className="w-8 h-8"
      style={color ? undefined : { color: "#16A8DA" }}
    >
      <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
    </svg>
  );
}

export default function Files() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [color, setColor] = useState("");

  useEffect(() => {
    api<{ categories: Category[] }>("/categories")
      .then((d) => setCategories(d.categories))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (q) params.set("q", q);
        if (category) params.set("category", category);
        if (status) params.set("status", status);
        if (color) params.set("color", color);
        const d = await api<{ folders: Folder[] }>(
          `/folders?${params.toString()}`
        );
        setFolders(d.folders);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [q, category, status, color]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Archivos</h1>

      {/* Filtros generales de carpetas */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar carpeta por nombre…"
          className="rounded-lg bg-brand-input border border-brand-border px-3 py-2 focus:outline-none focus:border-brand-cyan transition"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg bg-brand-input border border-brand-border px-3 py-2 focus:outline-none focus:border-brand-cyan transition"
        >
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg bg-brand-input border border-brand-border px-3 py-2 focus:outline-none focus:border-brand-cyan transition"
        >
          <option value="">Todos los estados</option>
          <option value="active">Activa</option>
          <option value="archived">Archivada</option>
        </select>
        <select
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="rounded-lg bg-brand-input border border-brand-border px-3 py-2 focus:outline-none focus:border-brand-cyan transition"
        >
          <option value="">Todos los colores</option>
          {FOLDER_COLORS.map((c) => (
            <option key={c.hex} value={c.hex}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/40 text-red-300 text-sm rounded px-3 py-2">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-brand-muted">Cargando…</div>
      ) : folders.length === 0 ? (
        <div className="text-brand-muted">No hay carpetas que coincidan.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {folders.map((f) => (
            <Link
              key={f.id}
              to={`/files/${f.id}`}
              className="block bg-brand-surface border border-brand-border rounded-xl p-5 hover:border-brand-cyan/50 transition-all duration-200 hover:-translate-y-0.5 animate-fade-in-up"
              style={
                f.color ? { borderLeft: `4px solid ${f.color}` } : undefined
              }
            >
              <IconFolder color={f.color} />
              <div className="mt-3 font-semibold truncate">{f.name}</div>
              {f.description && (
                <div className="text-brand-muted text-xs truncate">
                  {f.description}
                </div>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="text-brand-muted text-xs">
                  {f.fileCount} archivo{f.fileCount === 1 ? "" : "s"}
                </span>
                {f.category && (
                  <span className="px-2 py-0.5 rounded text-[11px] bg-brand-surface2 text-brand-muted">
                    {f.category}
                  </span>
                )}
                <span
                  className={`px-2 py-0.5 rounded text-[11px] ${
                    f.status === "archived"
                      ? "bg-brand-surface2 text-brand-muted"
                      : "bg-brand-green/20 text-brand-green"
                  }`}
                >
                  {statusLabel(f.status)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
