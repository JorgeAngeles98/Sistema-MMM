import { useEffect, useState, FormEvent, ReactNode } from "react";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { permissionLabel } from "../lib/permissions";

interface FullUser {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  permissions: string[];
  isActive?: boolean;
  isSystem?: boolean;
  lastLogin?: string | null;
  createdAt?: string | null;
}

function initials(first: string, last: string): string {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase() || "U";
}

function formatDate(value?: string | null): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("es-PE", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "—";
  }
}

const inputCls =
  "w-full rounded-lg bg-brand-input border border-brand-border px-3 py-2 focus:outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/30 transition";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="block mb-1 text-brand-muted">{label}</span>
      {children}
    </label>
  );
}

export default function Profile() {
  const { refreshUser } = useAuth();
  const [user, setUser] = useState<FullUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [savingInfo, setSavingInfo] = useState(false);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const [pwd, setPwd] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [savingPwd, setSavingPwd] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<string | null>(null);
  const [pwdError, setPwdError] = useState<string | null>(null);

  useEffect(() => {
    api<{ user: FullUser }>("/auth/me")
      .then((d) => {
        setUser(d.user);
        setForm({
          firstName: d.user.firstName ?? "",
          lastName: d.user.lastName ?? "",
          email: d.user.email ?? "",
          phone: d.user.phone ?? "",
        });
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Error"))
      .finally(() => setLoading(false));
  }, []);

  async function saveInfo(e: FormEvent) {
    e.preventDefault();
    setSavingInfo(true);
    setInfoMsg(null);
    setError(null);
    try {
      const d = await api<{ user: FullUser }>("/auth/profile", {
        method: "PUT",
        body: JSON.stringify(form),
      });
      setUser(d.user);
      await refreshUser();
      setInfoMsg("Datos actualizados correctamente.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSavingInfo(false);
    }
  }

  async function savePassword(e: FormEvent) {
    e.preventDefault();
    setPwdMsg(null);
    setPwdError(null);
    if (pwd.newPassword !== pwd.confirm) {
      setPwdError("La nueva contraseña y su confirmación no coinciden.");
      return;
    }
    setSavingPwd(true);
    try {
      await api("/auth/password", {
        method: "PUT",
        body: JSON.stringify({
          currentPassword: pwd.currentPassword,
          newPassword: pwd.newPassword,
        }),
      });
      setPwd({ currentPassword: "", newPassword: "", confirm: "" });
      setPwdMsg("Contraseña actualizada correctamente.");
    } catch (e) {
      setPwdError(e instanceof Error ? e.message : "Error al cambiar la contraseña");
    } finally {
      setSavingPwd(false);
    }
  }

  if (loading) {
    return <div className="text-brand-muted animate-fade-in">Cargando perfil…</div>;
  }
  if (error && !user) {
    return <div className="text-red-400 animate-fade-in">{error}</div>;
  }
  if (!user) return null;

  return (
    <div className="space-y-6 w-full">
      <h1 className="text-3xl font-bold">Mi perfil</h1>

      {/* Cabecera (ancho completo) */}
      <div className="bg-brand-surface border border-brand-border rounded-xl p-6 flex items-center gap-5 animate-fade-in-up">
        <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-brand-gradient flex items-center justify-center text-3xl font-black text-white shadow-lg shadow-brand-cyan/20">
          {initials(user.firstName, user.lastName)}
        </div>
        <div className="min-w-0">
          <h2 className="text-2xl font-bold truncate">{user.name}</h2>
          <p className="text-brand-muted truncate">{user.email}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-brand-gradient text-white capitalize">
              {user.role}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                user.isActive
                  ? "bg-brand-green/20 text-brand-green"
                  : "bg-red-500/20 text-red-300"
              }`}
            >
              {user.isActive ? "Cuenta activa" : "Cuenta inactiva"}
            </span>
          </div>
        </div>
      </div>

      {/* Dos columnas: formularios (izq) y datos de cuenta (der) */}
      <div className="grid gap-6 lg:grid-cols-3 items-start">
        {/* Columna izquierda: formularios */}
        <div className="lg:col-span-2 space-y-6">
          {/* Datos personales */}
          <form
            onSubmit={saveInfo}
            className="bg-brand-surface border border-brand-border rounded-xl p-6 space-y-4 animate-fade-in-up"
          >
            <h3 className="font-semibold text-lg">Información personal</h3>
            {infoMsg && (
              <div className="bg-brand-green/15 border border-brand-green/40 text-brand-green text-sm rounded px-3 py-2">
                {infoMsg}
              </div>
            )}
            {error && user && (
              <div className="bg-red-500/10 border border-red-500/40 text-red-300 text-sm rounded px-3 py-2">
                {error}
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nombres">
                <input
                  required
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className={inputCls}
                />
              </Field>
              <Field label="Apellidos">
                <input
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className={inputCls}
                />
              </Field>
              <Field label="Email">
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  disabled={user.isSystem}
                  title={
                    user.isSystem
                      ? "El correo de la cuenta de administrador del sistema no se puede cambiar."
                      : undefined
                  }
                  className={`${inputCls} ${
                    user.isSystem ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                />
                {user.isSystem && (
                  <span className="block mt-1 text-xs text-brand-muted">
                    El correo del administrador del sistema no se puede cambiar.
                  </span>
                )}
              </Field>
              <Field label="Teléfono">
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+51 999 999 999"
                  className={inputCls}
                />
              </Field>
            </div>
            <button
              disabled={savingInfo}
              className="bg-brand-gradient text-white rounded-lg px-5 py-2 font-medium disabled:opacity-60 hover:brightness-110 transition"
            >
              {savingInfo ? "Guardando…" : "Guardar cambios"}
            </button>
          </form>

          {/* Cambio de contraseña */}
          <form
            onSubmit={savePassword}
            className="bg-brand-surface border border-brand-border rounded-xl p-6 space-y-4 animate-fade-in-up"
          >
            <h3 className="font-semibold text-lg">Cambiar contraseña</h3>
            {pwdMsg && (
              <div className="bg-brand-green/15 border border-brand-green/40 text-brand-green text-sm rounded px-3 py-2">
                {pwdMsg}
              </div>
            )}
            {pwdError && (
              <div className="bg-red-500/10 border border-red-500/40 text-red-300 text-sm rounded px-3 py-2">
                {pwdError}
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Contraseña actual">
                <input
                  required
                  type="password"
                  value={pwd.currentPassword}
                  onChange={(e) => setPwd({ ...pwd, currentPassword: e.target.value })}
                  className={inputCls}
                />
              </Field>
              <Field label="Nueva contraseña">
                <input
                  required
                  type="password"
                  value={pwd.newPassword}
                  onChange={(e) => setPwd({ ...pwd, newPassword: e.target.value })}
                  className={inputCls}
                />
              </Field>
              <Field label="Confirmar nueva">
                <input
                  required
                  type="password"
                  value={pwd.confirm}
                  onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
                  className={inputCls}
                />
              </Field>
            </div>
            <button
              disabled={savingPwd}
              className="bg-brand-gradient text-white rounded-lg px-5 py-2 font-medium disabled:opacity-60 hover:brightness-110 transition"
            >
              {savingPwd ? "Actualizando…" : "Cambiar contraseña"}
            </button>
          </form>
        </div>

        {/* Columna derecha: datos de la cuenta */}
        <div className="space-y-6">
          <div className="bg-brand-surface border border-brand-border rounded-xl p-6 animate-fade-in-up">
            <h3 className="font-semibold text-lg mb-4">Datos de la cuenta</h3>
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-brand-muted">ID de usuario</dt>
                <dd className="font-mono break-all">{user.id}</dd>
              </div>
              <div>
                <dt className="text-brand-muted">Rol</dt>
                <dd className="capitalize">{user.role}</dd>
              </div>
              <div>
                <dt className="text-brand-muted">Último acceso</dt>
                <dd>{formatDate(user.lastLogin)}</dd>
              </div>
              <div>
                <dt className="text-brand-muted">Miembro desde</dt>
                <dd>{formatDate(user.createdAt)}</dd>
              </div>
            </dl>
          </div>

          <div className="bg-brand-surface border border-brand-border rounded-xl p-6 animate-fade-in-up">
            <div className="text-brand-muted text-sm mb-3">
              Permisos ({user.permissions.length})
            </div>
            <div className="flex flex-wrap gap-2">
              {user.permissions.map((p) => (
                <span
                  key={p}
                  title={p}
                  className="bg-brand-surface2 text-brand-teal text-xs px-2.5 py-1 rounded transition-transform duration-150 hover:scale-105"
                >
                  {permissionLabel(p)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
