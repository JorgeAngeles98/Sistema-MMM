import { useEffect, useState, ReactNode } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { formatSize, fileTypeLabel, FileType } from "../lib/fileTypes";

interface RecentFile {
  id: string;
  name: string;
  title: string;
  url: string;
  type: FileType;
  folderId: string | null;
  folderName: string | null;
}
interface Stats {
  files?: {
    total: number;
    photos: number;
    videos: number;
    documents: number;
    totalSize: number;
  };
  folders?: number;
  categories?: number;
  users?: number;
  tasks?: {
    total: number;
    pending: number;
    in_progress: number;
    done: number;
    scope: string;
  };
  recentFiles?: RecentFile[];
}

function StatCard({
  label,
  value,
  icon,
  to,
}: {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  to?: string;
}) {
  const body = (
    <div className="bg-brand-surface border border-brand-border rounded-xl p-5 flex items-center gap-4 transition-all duration-200 hover:border-brand-cyan/50 hover:-translate-y-0.5 animate-fade-in-up h-full">
      <div className="w-11 h-11 rounded-xl bg-brand-gradient/15 text-brand-cyan flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-2xl font-bold leading-tight">{value}</div>
        <div className="text-brand-muted text-sm">{label}</div>
      </div>
    </div>
  );
  return to ? <Link to={to}>{body}</Link> : body;
}

const I = {
  files: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" /><path d="M14 2v6h6" /></svg>
  ),
  photo: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="M21 15l-5-5L5 21" /></svg>
  ),
  video: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M10 9l5 3-5 3V9z" /></svg>
  ),
  doc: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" /><path d="M8 13h8M8 17h8M8 9h2" /></svg>
  ),
  folder: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6"><path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" /></svg>
  ),
  tag: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6"><path d="M20 12l-8 8-9-9V3h8l9 9z" /><circle cx="7" cy="7" r="1.5" /></svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6"><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0112 0" /><path d="M16 5a3 3 0 010 6" /></svg>
  ),
  disk: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6"><path d="M22 12A10 10 0 1112 2" /><path d="M12 12l5-3" /><circle cx="12" cy="12" r="1.5" /></svg>
  ),
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<Stats>("/dashboard/stats")
      .then(setStats)
      .catch(() => setStats({}))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-brand-muted">Bienvenido, {user?.name}.</p>
      </div>

      {loading ? (
        <div className="text-brand-muted">Cargando métricas…</div>
      ) : (
        <>
          {/* Métricas */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats?.files && (
              <>
                <StatCard label="Archivos" value={stats.files.total} icon={I.files} to="/files" />
                <StatCard label="Fotos" value={stats.files.photos} icon={I.photo} />
                <StatCard label="Videos" value={stats.files.videos} icon={I.video} />
                <StatCard label="Documentos" value={stats.files.documents} icon={I.doc} />
                <StatCard label="Carpetas" value={stats.folders ?? 0} icon={I.folder} to="/files" />
                <StatCard label="Categorías" value={stats.categories ?? 0} icon={I.tag} />
                <StatCard label="Espacio usado" value={formatSize(stats.files.totalSize)} icon={I.disk} />
              </>
            )}
            {stats?.users !== undefined && (
              <StatCard label="Usuarios" value={stats.users} icon={I.users} to="/users" />
            )}
          </div>

          {/* Tareas + Recientes */}
          <div className="grid gap-6 lg:grid-cols-3">
            {stats?.tasks && (
              <div className="bg-brand-surface border border-brand-border rounded-xl p-5 animate-fade-in-up">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-lg">
                    {stats.tasks.scope === "mine" ? "Mis tareas" : "Tareas"}
                  </h2>
                  <Link to="/tareas" className="text-sm text-brand-cyan hover:underline">
                    Ver todas
                  </Link>
                </div>
                <div className="space-y-2">
                  <TaskBar label="Pendiente" value={stats.tasks.pending} total={stats.tasks.total} color="bg-amber-400" />
                  <TaskBar label="En progreso" value={stats.tasks.in_progress} total={stats.tasks.total} color="bg-brand-cyan" />
                  <TaskBar label="Hecho" value={stats.tasks.done} total={stats.tasks.total} color="bg-brand-green" />
                </div>
                <div className="text-brand-muted text-sm mt-4">
                  Total: {stats.tasks.total} tarea{stats.tasks.total === 1 ? "" : "s"}
                </div>
              </div>
            )}

            {stats?.recentFiles && (
              <div className="bg-brand-surface border border-brand-border rounded-xl p-5 lg:col-span-2 animate-fade-in-up">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-lg">Archivos recientes</h2>
                  <Link to="/files" className="text-sm text-brand-cyan hover:underline">
                    Ver archivos
                  </Link>
                </div>
                {stats.recentFiles.length === 0 ? (
                  <p className="text-brand-muted text-sm">Aún no hay archivos.</p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                    {stats.recentFiles.map((f) => (
                      <Link
                        key={f.id}
                        to={f.folderId ? `/files/${f.folderId}` : "/files"}
                        className="group bg-brand-input border border-brand-border rounded-lg overflow-hidden hover:border-brand-cyan/50 transition"
                      >
                        {f.type === "photo" ? (
                          <img src={f.url} alt={f.name} className="h-24 w-full object-cover" />
                        ) : (
                          <div className="h-24 w-full flex items-center justify-center text-brand-muted">
                            {f.type === "video" ? I.video : I.doc}
                          </div>
                        )}
                        <div className="p-2">
                          <div className="text-xs font-medium truncate" title={f.name}>
                            {f.title || f.name}
                          </div>
                          <div className="text-[11px] text-brand-muted truncate">
                            {fileTypeLabel(f.type)}
                            {f.folderName ? ` · ${f.folderName}` : ""}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function TaskBar({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-brand-muted">{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-brand-surface2 overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
