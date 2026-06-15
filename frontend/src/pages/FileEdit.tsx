import { useEffect, useState, FormEvent, ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { fileTypeLabel, formatSize, FileType } from "../lib/fileTypes";
import { formatExposure, orientationLabel, hasExif, Exif } from "../lib/exifClient";

interface Category {
  id: string;
  name: string;
}
interface FileData {
  id: string;
  name: string;
  url: string;
  type: FileType;
  size: number;
  extension?: string;
  category?: string;
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

type Tab = "basico" | "origen" | "camara";

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
function ExifRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between gap-3 py-1.5 border-b border-brand-border/50 last:border-0 text-sm">
      <span className="text-brand-muted">{label}</span>
      <span className="text-right">{value || "—"}</span>
    </div>
  );
}
function Stars({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(value === n ? 0 : n)} className={`text-2xl leading-none transition ${n <= value ? "text-brand-cyan" : "text-brand-border hover:text-brand-muted"}`}>
          {n <= value ? "★" : "☆"}
        </button>
      ))}
    </div>
  );
}

export default function FileEdit() {
  const { folderId, fileId } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [data, setData] = useState<FileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("basico");
  const [category, setCategory] = useState("");
  const [meta, setMeta] = useState({
    title: "", author: "", authorTitle: "", description: "", descriptionWriter: "",
    rating: 0, keywords: "", copyrightStatus: "", copyright: "", copyrightUrl: "",
    dateCreated: "", city: "", state: "", country: "", credit: "", source: "",
    headline: "", instructions: "", transmissionRef: "", urgency: "",
  });

  useEffect(() => {
    async function init() {
      try {
        const c = await api<{ categories: Category[] }>("/categories").catch(() => ({ categories: [] as Category[] }));
        setCategories(c.categories);
        const d = await api<{ file: FileData }>(`/files/${fileId}`);
        setData(d.file);
        setCategory(d.file.category ?? "");
        setMeta({
          title: d.file.title ?? "", author: d.file.author ?? "", authorTitle: d.file.authorTitle ?? "",
          description: d.file.description ?? "", descriptionWriter: d.file.descriptionWriter ?? "",
          rating: d.file.rating ?? 0, keywords: (d.file.keywords ?? []).join(", "),
          copyrightStatus: d.file.copyrightStatus ?? "", copyright: d.file.copyright ?? "", copyrightUrl: d.file.copyrightUrl ?? "",
          dateCreated: d.file.dateCreated ?? "", city: d.file.city ?? "", state: d.file.state ?? "", country: d.file.country ?? "",
          credit: d.file.credit ?? "", source: d.file.source ?? "", headline: d.file.headline ?? "",
          instructions: d.file.instructions ?? "", transmissionRef: d.file.transmissionRef ?? "", urgency: d.file.urgency ?? "",
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [fileId]);

  function set<K extends keyof typeof meta>(key: K, value: (typeof meta)[K]) {
    setMeta((m) => ({ ...m, [key]: value }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api(`/files/${fileId}`, {
        method: "PUT",
        body: JSON.stringify({ ...meta, category: category.trim() }),
      });
      navigate(`/files/${folderId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar");
      setSaving(false);
    }
  }

  if (loading) return <div className="text-brand-muted animate-fade-in">Cargando…</div>;
  if (error && !data) return <div className="text-red-400">{error}</div>;
  if (!data) return null;

  const exif = data.exif;
  const tabs: { key: Tab; label: string }[] = [
    { key: "basico", label: "Básico" },
    { key: "origen", label: "Origen" },
    { key: "camara", label: "Datos de cámara" },
  ];

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center gap-3">
        <Link to={`/files/${folderId}`} className="text-brand-muted hover:text-slate-200 transition" title="Volver">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path d="M15 18l-6-6 6-6" /></svg>
        </Link>
        <h1 className="text-3xl font-bold">Editar metadatos</h1>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/40 text-red-300 text-sm rounded px-3 py-2">{error}</div>}

      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-2 items-start">
        <div className="bg-brand-surface border border-brand-border rounded-xl overflow-hidden">
          <div className="flex border-b border-brand-border">
            {tabs.map((t) => (
              <button key={t.key} type="button" onClick={() => setTab(t.key)} className={`px-4 py-3 text-sm font-medium transition border-b-2 ${tab === t.key ? "border-brand-cyan text-white" : "border-transparent text-brand-muted hover:text-slate-200"}`}>{t.label}</button>
            ))}
          </div>
          <div className="p-6 space-y-4">
            {tab === "basico" && (
              <>
                <Field label="Título del documento"><input value={meta.title} onChange={(e) => set("title", e.target.value)} className={inputCls} /></Field>
                <Field label="Categoría (elige o escribe nueva)">
                  <input list="cats" value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls} />
                  <datalist id="cats">{categories.map((c) => (<option key={c.id} value={c.name} />))}</datalist>
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Autor"><input value={meta.author} onChange={(e) => set("author", e.target.value)} className={inputCls} /></Field>
                  <Field label="Cargo del autor"><input value={meta.authorTitle} onChange={(e) => set("authorTitle", e.target.value)} className={inputCls} /></Field>
                </div>
                <Field label="Descripción"><textarea value={meta.description} onChange={(e) => set("description", e.target.value)} rows={2} className={inputCls} /></Field>
                <Field label="Autor de la descripción"><input value={meta.descriptionWriter} onChange={(e) => set("descriptionWriter", e.target.value)} className={inputCls} /></Field>
                <div><span className="block mb-1 text-sm text-brand-muted">Clasificación</span><Stars value={meta.rating} onChange={(v) => set("rating", v)} /></div>
                <Field label="Palabras clave (separadas por comas)"><input value={meta.keywords} onChange={(e) => set("keywords", e.target.value)} className={inputCls} /></Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Estado de copyright">
                    <select value={meta.copyrightStatus} onChange={(e) => set("copyrightStatus", e.target.value)} className={inputCls}>
                      <option value="">Desconocido</option>
                      <option value="Con copyright">Con copyright</option>
                      <option value="Dominio público">Dominio público</option>
                    </select>
                  </Field>
                  <Field label="URL de copyright"><input value={meta.copyrightUrl} onChange={(e) => set("copyrightUrl", e.target.value)} className={inputCls} /></Field>
                </div>
                <Field label="Aviso de copyright"><textarea value={meta.copyright} onChange={(e) => set("copyright", e.target.value)} rows={2} className={inputCls} /></Field>
              </>
            )}
            {tab === "origen" && (
              <>
                <Field label="Fecha de creación"><input type="datetime-local" value={meta.dateCreated} onChange={(e) => set("dateCreated", e.target.value)} className={inputCls} /></Field>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Ciudad"><input value={meta.city} onChange={(e) => set("city", e.target.value)} className={inputCls} /></Field>
                  <Field label="Estado/Provincia"><input value={meta.state} onChange={(e) => set("state", e.target.value)} className={inputCls} /></Field>
                  <Field label="País"><input value={meta.country} onChange={(e) => set("country", e.target.value)} className={inputCls} /></Field>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Nota de crédito"><input value={meta.credit} onChange={(e) => set("credit", e.target.value)} className={inputCls} /></Field>
                  <Field label="Origen"><input value={meta.source} onChange={(e) => set("source", e.target.value)} className={inputCls} /></Field>
                </div>
                <Field label="Titular"><textarea value={meta.headline} onChange={(e) => set("headline", e.target.value)} rows={2} className={inputCls} /></Field>
                <Field label="Instrucciones"><textarea value={meta.instructions} onChange={(e) => set("instructions", e.target.value)} rows={2} className={inputCls} /></Field>
                <Field label="Referencia de transmisión"><input value={meta.transmissionRef} onChange={(e) => set("transmissionRef", e.target.value)} className={inputCls} /></Field>
                <Field label="Urgencia">
                  <select value={meta.urgency} onChange={(e) => set("urgency", e.target.value)} className={inputCls}>
                    <option value="">(Seleccione un valor)</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (<option key={n} value={String(n)}>{n}</option>))}
                  </select>
                </Field>
              </>
            )}
            {tab === "camara" && (
              <div>
                {hasExif(exif) ? (
                  <>
                    <ExifRow label="Marca" value={exif?.make} />
                    <ExifRow label="Modelo" value={exif?.model} />
                    <ExifRow label="Lente" value={exif?.lens} />
                    <ExifRow label="Distancia focal" value={exif?.focalLength ? `${exif.focalLength} mm` : undefined} />
                    <ExifRow label="Apertura" value={exif?.fNumber ? `f/${exif.fNumber}` : undefined} />
                    <ExifRow label="Exposición" value={exif?.exposureTime ? formatExposure(exif.exposureTime) : undefined} />
                    <ExifRow label="ISO" value={exif?.iso ? String(exif.iso) : undefined} />
                    <ExifRow label="Tamaño de imagen" value={exif?.width && exif?.height ? `${exif.width} × ${exif.height}` : undefined} />
                    <ExifRow label="Orientación" value={orientationLabel(exif?.orientation)} />
                    <ExifRow label="Resolución" value={exif?.resolution ? `${exif.resolution} ppp` : undefined} />
                    <ExifRow label="GPS" value={exif?.gpsLat && exif?.gpsLng ? `${exif.gpsLat.toFixed(4)}, ${exif.gpsLng.toFixed(4)}` : undefined} />
                  </>
                ) : (
                  <p className="text-brand-muted text-sm">Sin datos de cámara (EXIF).</p>
                )}
                <p className="text-brand-muted text-xs mt-3">Los datos de cámara no son editables (provienen del archivo).</p>
              </div>
            )}
          </div>
          <div className="p-6 border-t border-brand-border flex items-center gap-3">
            <button disabled={saving} className="bg-brand-gradient text-white rounded-lg px-5 py-2 font-medium disabled:opacity-60 hover:brightness-110 transition">{saving ? "Guardando…" : "Guardar cambios"}</button>
            <Link to={`/files/${folderId}`} className="px-5 py-2 rounded-lg text-slate-300 hover:bg-brand-surface2 transition">Cancelar</Link>
          </div>
        </div>

        <div className="bg-brand-surface border border-brand-border rounded-xl p-4">
          {data.type === "photo" ? (
            <img src={data.url} alt={data.name} className="w-full max-h-[60vh] object-contain rounded-lg bg-brand-input" />
          ) : (
            <div className="w-full h-64 rounded-lg bg-brand-input flex items-center justify-center text-brand-muted">{data.extension?.toUpperCase?.() || ""}</div>
          )}
          <div className="mt-3 text-sm flex items-center justify-between">
            <span className="truncate" title={data.name}>{data.name}</span>
            <span className="text-brand-muted ml-3 whitespace-nowrap">{fileTypeLabel(data.type)} · {formatSize(data.size)}</span>
          </div>
        </div>
      </form>
    </div>
  );
}
