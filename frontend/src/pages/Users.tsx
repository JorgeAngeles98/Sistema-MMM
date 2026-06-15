import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";

interface Role {
  id: string;
  name: string;
}
interface UserRow {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role | null;
  isActive: boolean;
  isSystem?: boolean;
}
interface UserDetail extends UserRow {
  firstName: string;
  lastName: string;
  lastLogin?: string | null;
  createdAt?: string | null;
}

function initials(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "U"
  );
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

function IconPlus() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
function IconEye() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function IconEdit() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-brand-muted text-xs">{label}</dt>
      <dd className="break-all">{value}</dd>
    </div>
  );
}

export default function Users() {
  const { hasPermission, user: me } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const canCreate = hasPermission("users:create");
  const canUpdate = hasPermission("users:update");
  const canDelete = hasPermission("users:delete");

  async function load() {
    try {
      setLoading(true);
      const u = await api<{ users: UserRow[] }>("/users");
      setUsers(u.users);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function openDetail(id: string) {
    setDetailLoading(true);
    setDetail(null);
    try {
      const d = await api<{ user: UserDetail }>(`/users/${id}`);
      setDetail(d.user);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setDetailLoading(false);
    }
  }

  async function remove(u: UserRow) {
    if (!confirm(`¿Eliminar a ${u.name}?`)) return;
    try {
      await api(`/users/${u.id}`, { method: "DELETE" });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Usuarios</h1>
        {canCreate && (
          <Link
            to="/users/new"
            className="inline-flex items-center gap-2 bg-brand-gradient text-white rounded-lg px-4 py-2 font-medium hover:brightness-110 transition"
          >
            <IconPlus />
            Agregar usuario
          </Link>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/40 text-red-300 text-sm rounded px-3 py-2">
          {error}
        </div>
      )}

      <div className="bg-brand-surface border border-brand-border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-brand-surface2 text-slate-300">
            <tr>
              <th className="text-left px-4 py-3">Nombre</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Teléfono</th>
              <th className="text-left px-4 py-3">Rol</th>
              <th className="text-left px-4 py-3">Estado</th>
              <th className="text-right px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-brand-muted">
                  Cargando…
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-brand-muted">
                  Sin usuarios
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr
                  key={u.id}
                  className="border-t border-brand-border hover:bg-brand-surface2/40 transition-colors"
                >
                  <td className="px-4 py-3">
                    {u.name}
                    {u.isSystem && (
                      <span className="ml-2 text-[10px] text-brand-muted">
                        (sistema)
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-300">{u.email}</td>
                  <td className="px-4 py-3 text-slate-300">{u.phone || "—"}</td>
                  <td className="px-4 py-3 capitalize">{u.role?.name}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        u.isActive
                          ? "bg-brand-green/20 text-brand-green"
                          : "bg-brand-surface2 text-brand-muted"
                      }`}
                    >
                      {u.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openDetail(u.id)}
                        title="Ver detalle"
                        className="p-2 rounded-lg text-brand-muted hover:text-brand-teal hover:bg-brand-surface2 transition"
                      >
                        <IconEye />
                      </button>
                      {canUpdate && (
                        <Link
                          to={`/users/${u.id}/edit`}
                          title="Editar"
                          className="p-2 rounded-lg text-brand-muted hover:text-brand-cyan hover:bg-brand-surface2 transition"
                        >
                          <IconEdit />
                        </Link>
                      )}
                      {canDelete && u.id !== me?.id && !u.isSystem && (
                        <button
                          onClick={() => remove(u)}
                          title="Eliminar"
                          className="p-2 rounded-lg text-brand-muted hover:text-red-400 hover:bg-brand-surface2 transition"
                        >
                          <IconTrash />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de detalle */}
      {(detail || detailLoading) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-fade-in"
          onClick={() => setDetail(null)}
        >
          <div
            className="bg-brand-surface border border-brand-border rounded-xl w-full max-w-lg p-6 space-y-5 animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            {detailLoading || !detail ? (
              <div className="text-brand-muted text-center py-6">Cargando…</div>
            ) : (
              <>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-brand-gradient flex items-center justify-center text-xl font-black text-white">
                      {initials(detail.name)}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{detail.name}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 rounded-full text-[11px] bg-brand-gradient text-white capitalize">
                          {detail.role?.name}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] ${
                            detail.isActive
                              ? "bg-brand-green/20 text-brand-green"
                              : "bg-red-500/20 text-red-300"
                          }`}
                        >
                          {detail.isActive ? "Activo" : "Inactivo"}
                        </span>
                        {detail.isSystem && (
                          <span className="px-2 py-0.5 rounded-full text-[11px] bg-brand-surface2 text-brand-muted">
                            Sistema
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setDetail(null)}
                    className="text-brand-muted hover:text-slate-200 transition"
                    title="Cerrar"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <Row label="Nombres" value={detail.firstName || "—"} />
                  <Row label="Apellidos" value={detail.lastName || "—"} />
                  <Row label="Email" value={detail.email} />
                  <Row label="Teléfono" value={detail.phone || "—"} />
                  <Row label="Último acceso" value={formatDate(detail.lastLogin)} />
                  <Row label="Miembro desde" value={formatDate(detail.createdAt)} />
                  <div className="col-span-2">
                    <dt className="text-brand-muted text-xs">ID de usuario</dt>
                    <dd className="font-mono break-all">{detail.id}</dd>
                  </div>
                </dl>

                {canUpdate && (
                  <div className="flex justify-end gap-3 pt-2">
                    <Link
                      to={`/users/${detail.id}/edit`}
                      className="inline-flex items-center gap-2 bg-brand-gradient text-white rounded-lg px-4 py-2 text-sm font-medium hover:brightness-110 transition"
                    >
                      <IconEdit />
                      Editar
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
