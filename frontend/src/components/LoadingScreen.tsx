interface Props {
  active?: boolean;
  message?: string;
}

// Pantalla de carga con la marca. Se usa como overlay con fundido suave.
export default function LoadingScreen({ active = true, message = "Cargando…" }: Props) {
  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-brand-bg transition-opacity duration-300 ${
        active ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="text-3xl font-black bg-brand-gradient bg-clip-text text-transparent">
        MMM
      </div>
      <div className="w-12 h-12 rounded-full border-4 border-brand-surface2 border-t-brand-cyan border-r-brand-green animate-spin" />
      <div className="text-brand-muted text-sm">{message}</div>
    </div>
  );
}
