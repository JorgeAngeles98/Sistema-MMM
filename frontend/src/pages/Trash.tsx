import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";

interface TrashFile {
  id: string;
  name: string;
  title: string;
  url: string;
  type: string;
  folderName: string | null;
  deletedAt: string | null;
}
interface TrashFolder {
  id: string;
  name: string;
  color: string;
  deletedAt: string | null;
}

function formatDate(value?: string | null): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("es-PE", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return "—";
  }
}

function IconRestore() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <path d="M3 12a9 9 0 109-9 9 9 0 00-7 3.3" />
      <path d="M3 4v4h4" />
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

export default function Trash() {
  const { hasPermission } = useAuth();
  const [files, setFiles] = useState<TrashFile[]>([]);
  const [folders, setFolders] = useState<TrashFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canRestore = hasPermission("files:upload");
  const canPurge = hasPermission("files:delete");

  async function load() {
    try {
      setLoading(true);
      const d = await api<{ files: TrashFile[]; folders: TrashFolder[] }>("/trash");
      setFiles(d.files);
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

  async function action(
    method: "POST" | "DELETE",
    path: string,
    confirmMsg?: string
  ) {
    if (confirmMsg && !confirm(confirmMsg)) return;
    try {
      await api(path, { method });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }

  const empty = files.length === 0 && folders.length === 0;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Papelera</h1>

      {error && (
        <div className="bg-red-500/10 border border-red-500/40 text-red-300 text-sm rounded px-3 py-2">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-brand-muted">Cargando…</div>
      ) : empty ? (
        <div className="text-brand-muted">La papelera está vacía.</div>
      ) : (
        <div className="space-y-8">
          {folders.length > 0 && (
            <div>
              <h2 className="font-semibold mb-3">Carpetas eliminadas</h2>
              <div className="bg-brand-surface border border-brand-border rounded-lg divide-y divide-brand-border">
                {folders.map((f) => (
                  <div key={f.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: f.color || "#64748B" }} />
                      <div className="min-w-0">
                        <div className="font-medium truncate">{f.name}</div>
                        <div className="text-xs text-brand-muted">Eliminada: {formatDate(f.deletedAt)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {canRestore && (
                        <button onClick={() => action("POST", `/trash/folders/${f.id}/restore`)} title="Restaurar" className="p-2 rounded-lg text-brand-muted hover:text-brand-green hover:bg-brand-surface2 transition">
                          <IconRestore />
                        </button>
                      )}
                      {canPurge && (
                        <button onClick={() => action("DELETE", `/trash/folders/${f.id}`, `¿Eliminar definitivamente "${f.name}" y sus archivos?`)} title="Eliminar definitivamente" className="p-2 rounded-lg text-brand-muted hover:text-red-400 hover:bg-brand-surface2 transition">
                          <IconTrash />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {files.length > 0 && (
            <div>
              <h2 className="font-semibold mb-3">Archivos eliminados</h2>
              <div className="bg-brand-surface border border-brand-border rounded-lg divide-y divide-brand-border">
                {files.map((f) => (
                  <div key={f.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {f.type === "photo" ? (
                        <img src={f.url} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded bg-brand-surface2 flex-shrink-0" />
                      )}
                      <div className="min-w-0">
                        <div className="font-medium truncate">{f.title || f.name}</div>
                        <div className="text-xs text-brand-muted truncate">
                          {f.folderName ? `📁 ${f.folderName} · ` : ""}Eliminado: {formatDate(f.deletedAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {canRestore && (
                        <button onClick={() => action("POST", `/trash/files/${f.id}/restore`)} title="Restaurar" className="p-2 rounded-lg text-brand-muted hover:text-brand-green hover:bg-brand-surface2 transition">
                          <IconRestore />
                        </button>
                      )}
                      {canPurge && (
                        <button onClick={() => action("DELETE", `/trash/files/${f.id}`, `¿Eliminar definitivamente "${f.name}"?`)} title="Eliminar definitivamente" className="p-2 rounded-lg text-brand-muted hover:text-red-400 hover:bg-brand-surface2 transition">
                          <IconTrash />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
