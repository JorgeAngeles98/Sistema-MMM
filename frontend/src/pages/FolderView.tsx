import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { fileTypeLabel, formatSize, FileType } from "../lib/fileTypes";
import { formatExposure, orientationLabel, hasExif, Exif } from "../lib/exifClient";

interface Category {
  id: string;
  name: string;
}
interface FileItem {
  id: string;
  name: string;
  url: string;
  category: string;
  type: FileType;
  size: number;
  extension: string;
  mimeType?: string;
  title?: string;
  author?: string;
  authorTitle?: string;
  description?: string;
  descriptionWriter?: string;
  rating?: number;
  keywords?: string[];
  copyrightStatus?: string;
  copyright?: string;
  copyrightUrl?: string;
  dateCreated?: string;
  city?: string;
  state?: string;
  country?: string;
  credit?: string;
  source?: string;
  headline?: string;
  instructions?: string;
  transmissionRef?: string;
  urgency?: string;
  exif?: Exif | null;
}
interface Folder {
  id: string;
  name: string;
}
type DetailTab = "basico" | "origen" | "camara";

function TypeBadge({ type }: { type: FileType }) {
  const color =
    type === "photo"
      ? "bg-brand-cyan/20 text-brand-cyan"
      : type === "video"
      ? "bg-purple-500/20 text-purple-300"
      : "bg-amber-500/20 text-amber-300";
  return <span className={`px-2 py-0.5 rounded text-[11px] ${color}`}>{fileTypeLabel(type)}</span>;
}

function FileThumb({ file }: { file: FileItem }) {
  if (file.type === "photo") return <img src={file.url} alt={file.name} className="h-32 w-full object-cover rounded-t-xl bg-brand-input" />;
  const icon =
    file.type === "video" ? (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-10 h-10"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M10 9l5 3-5 3V9z" /></svg>
    ) : (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-10 h-10"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" /><path d="M14 2v6h6" /></svg>
    );
  return <div className="h-32 w-full rounded-t-xl bg-brand-input flex items-center justify-center text-brand-muted">{icon}</div>;
}

function Row({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-3 py-1.5 border-b border-brand-border/50 last:border-0 text-sm">
      <span className="text-brand-muted">{label}</span>
      <span className="text-right break-all">{value}</span>
    </div>
  );
}

function stars(n?: number): string | undefined {
  if (!n) return undefined;
  return "★".repeat(n) + "☆".repeat(5 - n);
}

export default function FolderView() {
  const { folderId } = useParams();
  const { hasPermission } = useAuth();
  const [folder, setFolder] = useState<Folder | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<FileItem | null>(null);
  const [detailTab, setDetailTab] = useState<DetailTab>("basico");

  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");

  const canUpload = hasPermission("files:upload");
  const canDelete = hasPermission("files:delete");
  const canManageTasks = hasPermission("tasks:manage");

  useEffect(() => {
    async function init() {
      try {
        const [foldersRes, catRes] = await Promise.all([
          api<{ folders: Folder[] }>("/folders"),
          api<{ categories: Category[] }>("/categories").catch(() => ({ categories: [] as Category[] })),
        ]);
        setFolder(foldersRes.folders.find((f) => f.id === folderId) ?? null);
        setCategories(catRes.categories);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error");
      }
    }
    init();
  }, [folderId]);

  useEffect(() => {
    async function loadFiles() {
      try {
        setLoading(true);
        const params = new URLSearchParams({ folder: folderId ?? "" });
        if (q) params.set("q", q);
        if (category) params.set("category", category);
        if (type) params.set("type", type);
        const d = await api<{ files: FileItem[] }>(`/files?${params.toString()}`);
        setFiles(d.files);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error");
      } finally {
        setLoading(false);
      }
    }
    loadFiles();
  }, [folderId, q, category, type]);

  function openDetail(f: FileItem) {
    setDetailTab("basico");
    setDetail(f);
  }

  async function remove(f: FileItem) {
    if (!confirm(`¿Eliminar "${f.name}"?`)) return;
    try {
      await api(`/files/${f.id}`, { method: "DELETE" });
      setFiles((prev) => prev.filter((x) => x.id !== f.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }

  const location = (f: FileItem) => [f.city, f.state, f.country].filter(Boolean).join(", ");

  const detailTabs: { key: DetailTab; label: string }[] = [
    { key: "basico", label: "Básico" },
    { key: "origen", label: "Origen" },
    { key: "camara", label: "Cámara" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link to="/files" className="text-brand-muted hover:text-slate-200 transition" title="Volver">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path d="M15 18l-6-6 6-6" /></svg>
          </Link>
          <h1 className="text-3xl font-bold truncate">{folder?.name ?? "Carpeta"}</h1>
        </div>
        {canUpload && folderId && (
          <Link to={`/files/${folderId}/upload`} className="inline-flex items-center gap-2 bg-brand-gradient text-white rounded-lg px-4 py-2 font-medium hover:brightness-110 transition whitespace-nowrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M12 5v14M5 12h14" /></svg>
            Agregar archivo
          </Link>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-3 max-w-3xl">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre o palabra clave…" className="rounded-lg bg-brand-input border border-brand-border px-3 py-2 focus:outline-none focus:border-brand-cyan transition" />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-lg bg-brand-input border border-brand-border px-3 py-2 focus:outline-none focus:border-brand-cyan transition">
          <option value="">Todas las categorías</option>
          {categories.map((c) => (<option key={c.id} value={c.name}>{c.name}</option>))}
        </select>
        <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-lg bg-brand-input border border-brand-border px-3 py-2 focus:outline-none focus:border-brand-cyan transition">
          <option value="">Todos los tipos</option>
          <option value="photo">Foto</option>
          <option value="video">Video</option>
          <option value="document">Documento</option>
        </select>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/40 text-red-300 text-sm rounded px-3 py-2">{error}</div>}

      {loading ? (
        <div className="text-brand-muted">Cargando…</div>
      ) : files.length === 0 ? (
        <div className="text-brand-muted">No hay archivos que coincidan.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {files.map((f) => (
            <div key={f.id} className="group bg-brand-surface border border-brand-border rounded-xl overflow-hidden hover:border-brand-cyan/50 transition-all duration-200 animate-fade-in-up">
              <button onClick={() => openDetail(f)} className="block w-full text-left"><FileThumb file={f} /></button>
              <div className="p-3 space-y-1">
                <div className="font-medium truncate" title={f.name}>{f.title || f.name}</div>
                <div className="flex items-center gap-2 flex-wrap">
                  <TypeBadge type={f.type} />
                  {f.category && <span className="px-2 py-0.5 rounded text-[11px] bg-brand-surface2 text-brand-muted">{f.category}</span>}
                </div>
                <div className="flex items-center justify-between text-xs text-brand-muted pt-1">
                  <span>{formatSize(f.size)}</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openDetail(f)} className="hover:text-brand-teal transition" title="Ver detalle">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                    </button>
                    {canUpload && (
                      <Link to={`/files/${folderId}/${f.id}/edit`} className="hover:text-brand-cyan transition" title="Editar metadatos">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z" /></svg>
                      </Link>
                    )}
                    {canDelete && (
                      <button onClick={() => remove(f)} className="hover:text-red-400 transition" title="Eliminar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /></svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de detalle con pestañas */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-fade-in" onClick={() => setDetail(null)}>
          <div className="bg-brand-surface border border-brand-border rounded-xl w-full max-w-4xl max-h-[92vh] overflow-y-auto animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between p-5 border-b border-brand-border">
              <div className="min-w-0">
                <h2 className="text-xl font-bold truncate">{detail.title || detail.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <TypeBadge type={detail.type} />
                  {detail.category && <span className="px-2 py-0.5 rounded text-[11px] bg-brand-surface2 text-brand-muted">{detail.category}</span>}
                  <span className="text-xs text-brand-muted">{formatSize(detail.size)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {canManageTasks && (
                  <Link to={`/tareas/new?file=${detail.id}`} className="inline-flex items-center gap-1 text-sm border border-brand-border text-slate-200 rounded-lg px-3 py-1.5 hover:bg-brand-surface2 transition" title="Crear tarea para este archivo">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>
                    Tarea
                  </Link>
                )}
                {canUpload && (
                  <Link to={`/files/${folderId}/${detail.id}/edit`} className="inline-flex items-center gap-1 text-sm bg-brand-gradient text-white rounded-lg px-3 py-1.5 hover:brightness-110 transition">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z" /></svg>
                    Editar
                  </Link>
                )}
                <a href={detail.url} download={detail.name} className="inline-flex items-center gap-1 text-sm border border-brand-border text-slate-200 rounded-lg px-3 py-1.5 hover:bg-brand-surface2 transition" title="Descargar">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><path d="M12 3v12M7 10l5 5 5-5M5 21h14" /></svg>
                  Descargar
                </a>
                <button onClick={() => setDetail(null)} className="text-brand-muted hover:text-slate-200" title="Cerrar">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5 p-5">
              {/* Vista previa */}
              <div>
                {detail.type === "photo" ? (
                  <img src={detail.url} alt={detail.name} className="w-full rounded-lg bg-brand-input" />
                ) : detail.extension === "pdf" || detail.mimeType === "application/pdf" ? (
                  <iframe src={detail.url} title={detail.name} className="w-full h-[60vh] rounded-lg bg-white" />
                ) : (
                  <a href={detail.url} target="_blank" rel="noreferrer" className="block bg-brand-input rounded-lg py-16 text-center text-brand-muted hover:text-brand-cyan transition">Abrir archivo</a>
                )}
              </div>

              {/* Pestañas de metadatos */}
              <div>
                <div className="flex border-b border-brand-border mb-3">
                  {detailTabs.map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setDetailTab(t.key)}
                      className={`px-3 py-2 text-sm font-medium transition border-b-2 ${
                        detailTab === t.key
                          ? "border-brand-cyan text-white"
                          : "border-transparent text-brand-muted hover:text-slate-200"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {detailTab === "basico" && (
                  <div>
                    <Row label="Título" value={detail.title} />
                    <Row label="Nombre de archivo" value={detail.name} />
                    <Row label="Autor" value={detail.author} />
                    <Row label="Cargo del autor" value={detail.authorTitle} />
                    <Row label="Descripción" value={detail.description} />
                    <Row label="Autor de la descripción" value={detail.descriptionWriter} />
                    <Row label="Clasificación" value={stars(detail.rating)} />
                    <Row label="Palabras clave" value={detail.keywords?.join(", ")} />
                    <Row label="Estado de copyright" value={detail.copyrightStatus} />
                    <Row label="Aviso de copyright" value={detail.copyright} />
                    <Row label="URL de copyright" value={detail.copyrightUrl} />
                  </div>
                )}

                {detailTab === "origen" && (
                  <div>
                    <Row label="Fecha de creación" value={detail.dateCreated} />
                    <Row label="Ciudad" value={detail.city} />
                    <Row label="Estado/Provincia" value={detail.state} />
                    <Row label="País" value={detail.country} />
                    <Row label="Ubicación" value={location(detail)} />
                    <Row label="Nota de crédito" value={detail.credit} />
                    <Row label="Origen" value={detail.source} />
                    <Row label="Titular" value={detail.headline} />
                    <Row label="Instrucciones" value={detail.instructions} />
                    <Row label="Referencia de transmisión" value={detail.transmissionRef} />
                    <Row label="Urgencia" value={detail.urgency} />
                  </div>
                )}

                {detailTab === "camara" && (
                  hasExif(detail.exif) ? (
                    <div>
                      <Row label="Marca" value={detail.exif?.make} />
                      <Row label="Modelo" value={detail.exif?.model} />
                      <Row label="Lente" value={detail.exif?.lens} />
                      <Row label="Distancia focal" value={detail.exif?.focalLength ? `${detail.exif.focalLength} mm` : undefined} />
                      <Row label="Apertura" value={detail.exif?.fNumber ? `f/${detail.exif.fNumber}` : undefined} />
                      <Row label="Exposición" value={detail.exif?.exposureTime ? formatExposure(detail.exif.exposureTime) : undefined} />
                      <Row label="ISO" value={detail.exif?.iso ? String(detail.exif.iso) : undefined} />
                      <Row label="Tamaño de imagen" value={detail.exif?.width && detail.exif?.height ? `${detail.exif.width} × ${detail.exif.height}` : undefined} />
                      <Row label="Orientación" value={orientationLabel(detail.exif?.orientation)} />
                      <Row label="Resolución" value={detail.exif?.resolution ? `${detail.exif.resolution} ppp` : undefined} />
                      <Row label="GPS" value={detail.exif?.gpsLat && detail.exif?.gpsLng ? `${detail.exif.gpsLat.toFixed(4)}, ${detail.exif.gpsLng.toFixed(4)}` : undefined} />
                    </div>
                  ) : (
                    <p className="text-brand-muted text-sm">Sin datos de cámara (EXIF).</p>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
