import { useEffect, useState, FormEvent, ChangeEvent, ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, apiUpload } from "../lib/api";
import { detectTypeFromMime, fileTypeLabel, formatSize, FileType } from "../lib/fileTypes";
import {
  readEmbedded,
  formatExposure,
  orientationLabel,
  hasExif,
  Exif,
} from "../lib/exifClient";

interface Category {
  id: string;
  name: string;
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
        <button
          key={n}
          type="button"
          onClick={() => onChange(value === n ? 0 : n)}
          className={`text-2xl leading-none transition ${
            n <= value ? "text-brand-cyan" : "text-brand-border hover:text-brand-muted"
          }`}
          aria-label={`${n} estrellas`}
        >
          {n <= value ? "★" : "☆"}
        </button>
      ))}
    </div>
  );
}

export default function FileUpload() {
  const { folderId } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [detected, setDetected] = useState<FileType | null>(null);
  const [exif, setExif] = useState<Exif | null>(null);
  const [tab, setTab] = useState<Tab>("basico");
  const [category, setCategory] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detectedMeta, setDetectedMeta] = useState(false);
  const [meta, setMeta] = useState({
    title: "",
    author: "",
    authorTitle: "",
    description: "",
    descriptionWriter: "",
    rating: 0,
    keywords: "",
    copyrightStatus: "",
    copyright: "",
    copyrightUrl: "",
    dateCreated: "",
    city: "",
    state: "",
    country: "",
    credit: "",
    source: "",
    headline: "",
    instructions: "",
    transmissionRef: "",
    urgency: "",
  });

  useEffect(() => {
    api<{ categories: Category[] }>("/categories")
      .then((d) => setCategories(d.categories))
      .catch(() => setCategories([]));
  }, []);

  async function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setDetected(f ? detectTypeFromMime(f.type) : null);
    setExif(null);
    setDetectedMeta(false);
    if (preview) URL.revokeObjectURL(preview);
    if (f && f.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(f));
      // Lee EXIF (cámara) + IPTC/XMP (descriptivo) incrustados
      const { exif: ex, meta: emb } = await readEmbedded(f);
      setExif(ex);
      const found = Object.values(emb).some((v) => v !== undefined && v !== null);
      setDetectedMeta(found);
      // Prellena solo los campos que estén vacíos
      setMeta((m) => ({
        ...m,
        title: m.title || emb.title || "",
        description: m.description || emb.description || "",
        descriptionWriter: m.descriptionWriter || emb.descriptionWriter || "",
        keywords: m.keywords || emb.keywords || "",
        author: m.author || emb.author || "",
        authorTitle: m.authorTitle || emb.authorTitle || "",
        copyright: m.copyright || emb.copyright || "",
        copyrightUrl: m.copyrightUrl || emb.copyrightUrl || "",
        copyrightStatus:
          m.copyright || emb.copyright ? "Con copyright" : m.copyrightStatus,
        city: m.city || emb.city || "",
        state: m.state || emb.state || "",
        country: m.country || emb.country || "",
        credit: m.credit || emb.credit || "",
        source: m.source || emb.source || "",
        headline: m.headline || emb.headline || "",
        instructions: m.instructions || emb.instructions || "",
        transmissionRef: m.transmissionRef || emb.transmissionRef || "",
        urgency: m.urgency || emb.urgency || "",
        rating: m.rating || emb.rating || 0,
        dateCreated: m.dateCreated || emb.dateCreated || "",
      }));
    } else {
      setPreview(null);
    }
  }

  function set<K extends keyof typeof meta>(key: K, value: (typeof meta)[K]) {
    setMeta((m) => ({ ...m, [key]: value }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Selecciona un archivo.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folderId", folderId ?? "");
      fd.append("category", category.trim());
      Object.entries(meta).forEach(([k, v]) => fd.append(k, String(v)));
      await apiUpload("/files", fd);
      navigate(`/files/${folderId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al subir");
      setSaving(false);
    }
  }

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
        <h1 className="text-3xl font-bold">Agregar archivo</h1>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/40 text-red-300 text-sm rounded px-3 py-2">{error}</div>
      )}
      {detectedMeta && (
        <div className="bg-brand-cyan/10 border border-brand-cyan/40 text-brand-cyan text-sm rounded px-3 py-2">
          Se detectaron datos incrustados en la imagen y se rellenaron los campos. Revísalos antes de subir.
        </div>
      )}

      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-2 items-start">
        {/* Formulario con pestañas */}
        <div className="bg-brand-surface border border-brand-border rounded-xl overflow-hidden">
          <div className="flex border-b border-brand-border">
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`px-4 py-3 text-sm font-medium transition border-b-2 ${
                  tab === t.key
                    ? "border-brand-cyan text-white"
                    : "border-transparent text-brand-muted hover:text-slate-200"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-6 space-y-4">
            {tab === "basico" && (
              <>
                <Field label="Título del documento">
                  <input value={meta.title} onChange={(e) => set("title", e.target.value)} className={inputCls} />
                </Field>
                <Field label="Categoría (elige o escribe nueva)">
                  <input list="cats" value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls} placeholder="Ej. Marketing" />
                  <datalist id="cats">{categories.map((c) => (<option key={c.id} value={c.name} />))}</datalist>
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Autor">
                    <input value={meta.author} onChange={(e) => set("author", e.target.value)} className={inputCls} />
                  </Field>
                  <Field label="Cargo del autor">
                    <input value={meta.authorTitle} onChange={(e) => set("authorTitle", e.target.value)} className={inputCls} />
                  </Field>
                </div>
                <Field label="Descripción">
                  <textarea value={meta.description} onChange={(e) => set("description", e.target.value)} rows={2} className={inputCls} />
                </Field>
                <Field label="Autor de la descripción">
                  <input value={meta.descriptionWriter} onChange={(e) => set("descriptionWriter", e.target.value)} className={inputCls} />
                </Field>
                <div>
                  <span className="block mb-1 text-sm text-brand-muted">Clasificación</span>
                  <Stars value={meta.rating} onChange={(v) => set("rating", v)} />
                </div>
                <Field label="Palabras clave (separadas por comas)">
                  <input value={meta.keywords} onChange={(e) => set("keywords", e.target.value)} className={inputCls} placeholder="retrato, evento, 2026" />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Estado de copyright">
                    <select value={meta.copyrightStatus} onChange={(e) => set("copyrightStatus", e.target.value)} className={inputCls}>
                      <option value="">Desconocido</option>
                      <option value="Con copyright">Con copyright</option>
                      <option value="Dominio público">Dominio público</option>
                    </select>
                  </Field>
                  <Field label="URL de copyright">
                    <input value={meta.copyrightUrl} onChange={(e) => set("copyrightUrl", e.target.value)} className={inputCls} />
                  </Field>
                </div>
                <Field label="Aviso de copyright">
                  <textarea value={meta.copyright} onChange={(e) => set("copyright", e.target.value)} rows={2} className={inputCls} />
                </Field>
              </>
            )}

            {tab === "origen" && (
              <>
                <Field label="Fecha de creación">
                  <input type="datetime-local" value={meta.dateCreated} onChange={(e) => set("dateCreated", e.target.value)} className={inputCls} />
                </Field>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Ciudad">
                    <input value={meta.city} onChange={(e) => set("city", e.target.value)} className={inputCls} />
                  </Field>
                  <Field label="Estado/Provincia">
                    <input value={meta.state} onChange={(e) => set("state", e.target.value)} className={inputCls} />
                  </Field>
                  <Field label="País">
                    <input value={meta.country} onChange={(e) => set("country", e.target.value)} className={inputCls} />
                  </Field>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Nota de crédito">
                    <input value={meta.credit} onChange={(e) => set("credit", e.target.value)} className={inputCls} />
                  </Field>
                  <Field label="Origen">
                    <input value={meta.source} onChange={(e) => set("source", e.target.value)} className={inputCls} />
                  </Field>
                </div>
                <Field label="Titular">
                  <textarea value={meta.headline} onChange={(e) => set("headline", e.target.value)} rows={2} className={inputCls} />
                </Field>
                <Field label="Instrucciones">
                  <textarea value={meta.instructions} onChange={(e) => set("instructions", e.target.value)} rows={2} className={inputCls} />
                </Field>
                <Field label="Referencia de transmisión">
                  <input value={meta.transmissionRef} onChange={(e) => set("transmissionRef", e.target.value)} className={inputCls} />
                </Field>
                <Field label="Urgencia">
                  <select value={meta.urgency} onChange={(e) => set("urgency", e.target.value)} className={inputCls}>
                    <option value="">(Seleccione un valor)</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <option key={n} value={String(n)}>{n}</option>
                    ))}
                  </select>
                </Field>
              </>
            )}

            {tab === "camara" && (
              <div>
                {!file ? (
                  <p className="text-brand-muted text-sm">Elige una foto para detectar sus datos automáticamente.</p>
                ) : !hasExif(exif) ? (
                  <p className="text-brand-muted text-sm">Este archivo no contiene datos de cámara (EXIF).</p>
                ) : (
                  <>
                    <ExifRow label="Marca" value={exif?.make} />
                    <ExifRow label="Modelo" value={exif?.model} />
                    <ExifRow label="Lente" value={exif?.lens} />
                    <ExifRow label="Distancia focal" value={exif?.focalLength ? `${exif.focalLength} mm` : undefined} />
                    <ExifRow label="Apertura" value={exif?.fNumber ? `f/${exif.fNumber}` : undefined} />
                    <ExifRow label="Exposición" value={formatExposure(exif?.exposureTime)} />
                    <ExifRow label="ISO" value={exif?.iso ? String(exif.iso) : undefined} />
                    <ExifRow label="Tamaño de imagen" value={exif?.width && exif?.height ? `${exif.width} × ${exif.height}` : undefined} />
                    <ExifRow label="Orientación" value={orientationLabel(exif?.orientation)} />
                    <ExifRow label="Resolución" value={exif?.resolution ? `${exif.resolution} ppp` : undefined} />
                    <ExifRow label="GPS" value={exif?.gpsLat && exif?.gpsLng ? `${exif.gpsLat.toFixed(4)}, ${exif.gpsLng.toFixed(4)}` : undefined} />
                  </>
                )}
                <p className="text-brand-muted text-xs mt-3">
                  Estos datos se detectan automáticamente del archivo.
                </p>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-brand-border flex items-center gap-3">
            <button disabled={saving} className="bg-brand-gradient text-white rounded-lg px-5 py-2 font-medium disabled:opacity-60 hover:brightness-110 transition">
              {saving ? "Subiendo…" : "Subir archivo"}
            </button>
            <Link to={`/files/${folderId}`} className="px-5 py-2 rounded-lg text-slate-300 hover:bg-brand-surface2 transition">Cancelar</Link>
          </div>
        </div>

        {/* Foto grande + selector */}
        <div className="space-y-4">
          <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-brand-border rounded-xl py-6 cursor-pointer hover:border-brand-cyan/60 transition bg-brand-surface">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-brand-muted"><path d="M12 16V4M7 9l5-5 5 5M5 20h14" /></svg>
            <span className="text-brand-muted text-sm">{file ? "Cambiar archivo" : "Haz clic para elegir un archivo"}</span>
            <input type="file" onChange={onFileChange} className="hidden" />
          </label>

          <div className="bg-brand-surface border border-brand-border rounded-xl p-4">
            {preview ? (
              <img src={preview} alt="" className="w-full max-h-[60vh] object-contain rounded-lg bg-brand-input" />
            ) : (
              <div className="w-full h-64 rounded-lg bg-brand-input flex items-center justify-center text-brand-muted text-sm">
                {file ? file.name.split(".").pop()?.toUpperCase() : "Vista previa"}
              </div>
            )}
            {file && (
              <div className="mt-3 text-sm flex items-center justify-between">
                <span className="truncate" title={file.name}>{file.name}</span>
                <span className="text-brand-muted ml-3 whitespace-nowrap">
                  {detected ? fileTypeLabel(detected) : ""} · {formatSize(file.size)}
                </span>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
