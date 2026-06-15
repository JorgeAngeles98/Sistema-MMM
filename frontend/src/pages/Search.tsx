import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { fileTypeLabel, formatSize, FileType } from "../lib/fileTypes";

interface FileItem {
  id: string;
  name: string;
  title?: string;
  url: string;
  type: FileType;
  size: number;
  category: string;
  folder: string;
  folderName?: string | null;
}

function Thumb({ f }: { f: FileItem }) {
  if (f.type === "photo")
    return <img src={f.url} alt={f.name} className="h-28 w-full object-cover rounded-t-lg bg-brand-input" />;
  const icon =
    f.type === "video" ? (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-8 h-8"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M10 9l5 3-5 3V9z" /></svg>
    ) : (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-8 h-8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" /><path d="M14 2v6h6" /></svg>
    );
  return <div className="h-28 w-full rounded-t-lg bg-brand-input flex items-center justify-center text-brand-muted">{icon}</div>;
}

export default function Search() {
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [results, setResults] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!q.trim() && !type) {
        setResults([]);
        setSearched(false);
        return;
      }
      setLoading(true);
      setSearched(true);
      try {
        const p = new URLSearchParams();
        if (q.trim()) p.set("q", q.trim());
        if (type) p.set("type", type);
        const d = await api<{ files: FileItem[] }>(`/files?${p.toString()}`);
        setResults(d.files);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [q, type]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Buscar</h1>
      <p className="text-brand-muted text-sm">
        Busca en todos los archivos por nombre, título, palabras clave, descripción o autor.
      </p>

      <div className="grid gap-3 sm:grid-cols-4 max-w-3xl">
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Escribe para buscar…"
          className="sm:col-span-3 rounded-lg bg-brand-input border border-brand-border px-3 py-2 focus:outline-none focus:border-brand-cyan transition"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="rounded-lg bg-brand-input border border-brand-border px-3 py-2 focus:outline-none focus:border-brand-cyan transition"
        >
          <option value="">Todos los tipos</option>
          <option value="photo">Foto</option>
          <option value="video">Video</option>
          <option value="document">Documento</option>
        </select>
      </div>

      {loading ? (
        <div className="text-brand-muted">Buscando…</div>
      ) : !searched ? (
        <div className="text-brand-muted">Empieza a escribir para ver resultados.</div>
      ) : results.length === 0 ? (
        <div className="text-brand-muted">No se encontraron archivos.</div>
      ) : (
        <>
          <div className="text-brand-muted text-sm">
            {results.length} resultado{results.length === 1 ? "" : "s"}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {results.map((f) => (
              <Link
                key={f.id}
                to={`/files/${f.folder}`}
                className="bg-brand-surface border border-brand-border rounded-lg overflow-hidden hover:border-brand-cyan/50 transition animate-fade-in-up"
              >
                <Thumb f={f} />
                <div className="p-3 space-y-1">
                  <div className="font-medium text-sm truncate" title={f.name}>
                    {f.title || f.name}
                  </div>
                  <div className="text-[11px] text-brand-muted truncate">
                    {fileTypeLabel(f.type)} · {formatSize(f.size)}
                  </div>
                  {f.folderName && (
                    <div className="text-[11px] text-brand-teal truncate">📁 {f.folderName}</div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
