import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { statusLabel } from "../lib/folderMeta";

interface Folder {
  id: string;
  name: string;
  category?: string;
  color?: string;
  status?: string;
  fileCount: number;
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
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}
function IconTrash() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    </svg>
  );
}

export default function FolderManager() {
  const { hasPermission } = useAuth();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const canCreate = hasPermission("files:upload");
  const canDelete = hasPermission("files:delete");

  async function load() {
    try {
      setLoading(true);
      const d = await api<{ folders: Folder[] }>("/folders");
      setFolders(d.folders);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(f: Folder) {
    setNotice(null);
    setError(null);
    if (!confirm(`¿Eliminar la carpeta "${f.name}"?`)) return;
    try {
      await api(`/folders/${f.id}`, { method: "DELETE" });
      await load();
    } catch (e) {
      // Notificación cuando la carpeta tiene archivos (u otro error)
      setNotice(e instanceof Error ? e.message : "No se pudo eliminar");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Carpetas</h1>
        {canCreate && (
          <Link
            to="/carpetas/new"
            className="inline-flex items-center gap-2 bg-brand-gradient text-white rounded-lg px-4 py-2 font-medium hover:brightness-110 transition"
          >
            <IconPlus />
            Nueva carpeta
          </Link>
        )}
      </div>

      {notice && (
        <div className="bg-amber-500/10 border border-amber-500/40 text-amber-300 text-sm rounded px-3 py-2">
          {notice}
        </div>
      )}
      {error && (
        <div className="bg-red-500/10 border border-red-500/40 text-red-300 text-sm rounded px-3 py-2">
          {error}
        </div>
      )}

      <div className="bg-brand-surface border border-brand-border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-brand-surface2 text-slate-300">
            <tr>
              <th className="text-left px-4 py-3">Carpeta</th>
              <th className="text-left px-4 py-3">Categoría</th>
              <th className="text-left px-4 py-3">Estado</th>
              <th className="text-left px-4 py-3">Archivos</th>
              <th className="text-right px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-brand-muted">
                  Cargando…
                </td>
              </tr>
            ) : folders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-brand-muted">
                  Aún no hay carpetas
                </td>
              </tr>
            ) : (
              folders.map((f) => (
                <tr
                  key={f.id}
                  className="border-t border-brand-border hover:bg-brand-surface2/40 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: f.color || "#64748B" }}
                      />
                      {f.name}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {f.category || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] ${
                        f.status === "archived"
                          ? "bg-brand-surface2 text-brand-muted"
                          : "bg-brand-green/20 text-brand-green"
                      }`}
                    >
                      {statusLabel(f.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{f.fileCount}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        to={`/carpetas/${f.id}/edit`}
                        title="Editar"
                        className="p-2 rounded-lg text-brand-muted hover:text-brand-cyan hover:bg-brand-surface2 transition"
                      >
                        <IconEdit />
                      </Link>
                      {canDelete && (
                        <button
                          onClick={() => remove(f)}
                          title={
                            f.fileCount > 0
                              ? "No se puede eliminar: contiene archivos"
                              : "Eliminar"
                          }
                          className="p-2 rounded-lg text-brand-muted hover:text-red-400 hover:bg-brand-surface2 transition"
                        >
                          <IconTrash />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
