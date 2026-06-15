import { useState, FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  const features = [
    "Gestión centralizada de fotos, videos y documentos",
    "Búsqueda avanzada y taxonomías personalizadas",
    "Control de acceso por roles y permisos",
  ];

  return (
    <div className="min-h-screen flex bg-brand-bg text-slate-100">
      {/* Panel de marca (visible en pantallas medianas en adelante) */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden">
        {/* Imagen de fondo */}
        <img
          src="/login-bg.jpeg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Tinte de marca sobre la foto */}
        <div className="absolute inset-0 bg-brand-gradient opacity-75 mix-blend-multiply" />
        {/* Oscurecido para contraste del texto */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/10" />

        <div className="relative z-10 flex flex-col justify-center px-12 w-full">
          <div className="max-w-md rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-2xl shadow-black/40 p-9 text-white">
            <div className="w-14 h-14 rounded-2xl bg-brand-gradient flex items-center justify-center text-2xl font-black text-white shadow-lg shadow-black/30">
              M
            </div>
            <h1 className="mt-6 text-5xl font-black tracking-tight">MMM</h1>
            <p className="mt-1 text-white/80">Sistema de Gestión Multimedia</p>

            <div className="mt-6 h-px bg-white/15" />

            <ul className="mt-6 space-y-4">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <span className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-brand-gradient flex items-center justify-center shadow">
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-3.5 h-3.5 text-white"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 011.4-1.4l3.1 3.1 6.8-6.8a1 1 0 011.4 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                  <span className="text-sm leading-relaxed text-white/90">{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Panel del formulario */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          {/* Marca compacta (solo en móvil) */}
          <div className="md:hidden text-center mb-8">
            <div className="inline-flex w-12 h-12 rounded-xl bg-brand-gradient items-center justify-center text-xl font-black text-white">
              M
            </div>
            <h1 className="mt-3 text-2xl font-bold bg-brand-gradient bg-clip-text text-transparent">
              MMM
            </h1>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold">Bienvenido</h2>
            <p className="text-brand-muted text-sm mt-1">
              Inicia sesión para continuar
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/40 text-red-300 text-sm rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm mb-1.5 text-brand-muted">
                Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-brand-muted">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="w-5 h-5"
                  >
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="M3 7l9 6 9-6" />
                  </svg>
                </span>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="tu@correo.com"
                  className="w-full rounded-lg bg-brand-input border border-brand-border pl-10 pr-3 py-2.5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/30 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1.5 text-brand-muted">
                Contraseña
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-brand-muted">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="w-5 h-5"
                  >
                    <rect x="4" y="11" width="16" height="9" rx="2" />
                    <path d="M8 11V8a4 4 0 118 0v3" />
                  </svg>
                </span>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full rounded-lg bg-brand-input border border-brand-border pl-10 pr-12 py-2.5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/30 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 right-3 flex items-center text-brand-muted hover:text-slate-200 transition"
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                >
                  {showPassword ? (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="w-5 h-5"
                    >
                      <path d="M3 3l18 18" />
                      <path d="M10.6 10.6a2 2 0 002.8 2.8" />
                      <path d="M9.9 4.2A10.9 10.9 0 0112 4c5 0 9.3 3.1 11 8a12.4 12.4 0 01-2.6 4M6.1 6.1A12.6 12.6 0 001 12c1.7 4.9 6 8 11 8 1.9 0 3.7-.4 5.3-1.2" />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="w-5 h-5"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full bg-brand-gradient text-white disabled:opacity-60 rounded-lg py-2.5 font-semibold transition hover:brightness-110 shadow-lg shadow-brand-cyan/20"
            >
              {loading ? "Entrando…" : "Entrar"}
            </button>
          </form>

          <p className="text-center text-xs text-brand-muted mt-6">
            Demo: admin@qnas.local / Admin123!
          </p>
        </div>
      </div>
    </div>
  );
}
