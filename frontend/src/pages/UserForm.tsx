import { useEffect, useState, FormEvent, ReactNode } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { api } from "../lib/api";

interface Role {
  id: string;
  name: string;
}
interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: Role | null;
  isActive: boolean;
  isSystem?: boolean;
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

export default function UserForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();

  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSystem, setIsSystem] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    roleId: "",
    isActive: true,
  });

  useEffect(() => {
    async function init() {
      try {
        const r = await api<{ roles: Role[] }>("/roles").catch(() => ({
          roles: [] as Role[],
        }));
        setRoles(r.roles);
        if (editing) {
          const d = await api<{ user: UserData }>(`/users/${id}`);
          setIsSystem(!!d.user.isSystem);
          setForm({
            firstName: d.user.firstName,
            lastName: d.user.lastName,
            email: d.user.email,
            phone: d.user.phone ?? "",
            password: "",
            roleId: d.user.role?.id ?? "",
            isActive: d.user.isActive,
          });
        } else {
          setForm((f) => ({ ...f, roleId: r.roles[0]?.id ?? "" }));
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al cargar");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [id]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        const body: Record<string, unknown> = {
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
        };
        // Campos restringidos para la cuenta de sistema
        if (!isSystem) {
          body.email = form.email;
          body.roleId = form.roleId;
          body.isActive = form.isActive;
        }
        if (form.password) body.password = form.password;
        await api(`/users/${id}`, { method: "PUT", body: JSON.stringify(body) });
      } else {
        await api("/users", {
          method: "POST",
          body: JSON.stringify({
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            phone: form.phone,
            password: form.password,
            roleId: form.roleId,
          }),
        });
      }
      navigate("/users");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar");
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="text-brand-muted animate-fade-in">Cargando…</div>;
  }

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center gap-3">
        <Link
          to="/users"
          className="text-brand-muted hover:text-slate-200 transition"
          title="Volver"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <h1 className="text-3xl font-bold">
          {editing ? "Editar usuario" : "Nuevo usuario"}
        </h1>
      </div>

      <form
        onSubmit={submit}
        className="bg-brand-surface border border-brand-border rounded-xl p-6 space-y-4 animate-fade-in-up"
      >
        {error && (
          <div className="bg-red-500/10 border border-red-500/40 text-red-300 text-sm rounded px-3 py-2">
            {error}
          </div>
        )}
        {isSystem && (
          <div className="bg-brand-cyan/10 border border-brand-cyan/40 text-brand-cyan text-sm rounded px-3 py-2">
            Cuenta de administrador del sistema: el correo, el rol y el estado no
            se pueden modificar.
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
              disabled={isSystem}
              className={`${inputCls} ${isSystem ? "opacity-60 cursor-not-allowed" : ""}`}
            />
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
          <Field
            label={
              editing ? "Contraseña (dejar vacío para no cambiar)" : "Contraseña"
            }
          >
            <div className="relative">
              <input
                required={!editing}
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className={`${inputCls} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
                className="absolute inset-y-0 right-3 flex items-center text-brand-muted hover:text-slate-200 transition"
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
                    <path d="M3 3l18 18" />
                    <path d="M10.6 10.6a2 2 0 002.8 2.8" />
                    <path d="M9.9 4.2A10.9 10.9 0 0112 4c5 0 9.3 3.1 11 8a12.4 12.4 0 01-2.6 4M6.1 6.1A12.6 12.6 0 001 12c1.7 4.9 6 8 11 8 1.9 0 3.7-.4 5.3-1.2" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </Field>
          <Field label="Rol">
            <select
              value={form.roleId}
              onChange={(e) => setForm({ ...form, roleId: e.target.value })}
              disabled={isSystem}
              className={`${inputCls} ${isSystem ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {editing && (
          <label
            className={`flex items-center gap-2 text-sm ${
              isSystem ? "opacity-60" : ""
            }`}
          >
            <input
              type="checkbox"
              checked={form.isActive}
              disabled={isSystem}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="w-4 h-4 accent-brand-cyan"
            />
            Cuenta activa
          </label>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            disabled={saving}
            className="bg-brand-gradient text-white rounded-lg px-5 py-2 font-medium disabled:opacity-60 hover:brightness-110 transition"
          >
            {saving ? "Guardando…" : editing ? "Guardar cambios" : "Crear usuario"}
          </button>
          <Link
            to="/users"
            className="px-5 py-2 rounded-lg text-slate-300 hover:bg-brand-surface2 transition"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
