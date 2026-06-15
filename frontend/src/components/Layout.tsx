import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth";
import NotificationBell from "./NotificationBell";

function IconSearch() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  );
}
function IconTrashNav() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    </svg>
  );
}

// Iconos inline (sin librerías externas)
function IconDashboard() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  );
}
function IconUsers() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20a6 6 0 0112 0" />
      <path d="M16 5a3 3 0 010 6M21 20a6 6 0 00-5-5.9" />
    </svg>
  );
}
function IconFiles() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
    </svg>
  );
}
function IconFolderCog() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v3" />
      <circle cx="17" cy="17" r="2.5" />
      <path d="M17 13.5v1M17 19.5v1M20.5 17h-1M14.5 17h-1" />
    </svg>
  );
}
function IconTasks() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </svg>
  );
}
function IconLogout() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <path d="M16 17l5-5-5-5M21 12H9" />
    </svg>
  );
}

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout, hasPermission } = useAuth();
  const location = useLocation();

  const nav = [
    { to: "/dashboard", label: "Dashboard", icon: <IconDashboard />, show: true },
    {
      to: "/buscar",
      label: "Buscar",
      icon: <IconSearch />,
      show: hasPermission("files:read"),
    },
    {
      to: "/files",
      label: "Archivos",
      icon: <IconFiles />,
      show: hasPermission("files:read"),
    },
    {
      to: "/carpetas",
      label: "Carpetas",
      icon: <IconFolderCog />,
      show: hasPermission("files:upload"),
    },
    {
      to: "/tareas",
      label: "Tareas",
      icon: <IconTasks />,
      show: hasPermission("tasks:read"),
    },
    {
      to: "/users",
      label: "Usuarios",
      icon: <IconUsers />,
      show: hasPermission("users:read"),
    },
    {
      to: "/papelera",
      label: "Papelera",
      icon: <IconTrashNav />,
      show: hasPermission("files:upload"),
    },
  ];

  return (
    <div className="h-screen overflow-hidden flex bg-brand-bg text-slate-100">
      <aside className="w-60 flex-shrink-0 h-full bg-brand-surface border-r border-brand-border flex flex-col">
        <div className="px-6 py-5 flex items-start justify-between gap-2">
          <div>
            <div className="text-2xl font-bold bg-brand-gradient bg-clip-text text-transparent">
              MMM
            </div>
            <div className="text-[11px] leading-tight text-brand-muted mt-0.5">
              Sistema de Gestión Multimedia
            </div>
          </div>
          <NotificationBell />
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {nav
            .filter((n) => n.show)
            .map((n, i) => {
              const active =
                location.pathname === n.to ||
                location.pathname.startsWith(`${n.to}/`);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  style={{ animationDelay: `${i * 60}ms` }}
                  className={`group relative flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 animate-slide-in-left ${
                    active
                      ? "bg-brand-gradient text-white font-medium shadow-lg shadow-brand-cyan/20"
                      : "text-slate-300 hover:bg-brand-surface2 hover:translate-x-1"
                  }`}
                >
                  {/* indicador lateral en hover (cuando no está activo) */}
                  {!active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-0 w-1 rounded-r bg-brand-cyan transition-all duration-200 group-hover:h-5" />
                  )}
                  <span className="transition-transform duration-200 group-hover:scale-110">
                    {n.icon}
                  </span>
                  <span>{n.label}</span>
                </Link>
              );
            })}
        </nav>

        <div className="border-t border-brand-border p-3 space-y-1">
          {/* Bloque de usuario: clic para ver el perfil */}
          <Link
            to="/profile"
            className={`flex items-center gap-3 px-2 py-2 rounded-lg transition-all duration-200 group ${
              location.pathname === "/profile"
                ? "bg-brand-surface2"
                : "hover:bg-brand-surface2"
            }`}
          >
            <span className="flex-shrink-0 w-9 h-9 rounded-full bg-brand-gradient flex items-center justify-center text-sm font-bold text-white transition-transform duration-200 group-hover:scale-105">
              {initials(user?.name ?? "U")}
            </span>
            <div className="min-w-0">
              <div className="font-medium truncate">{user?.name}</div>
              <div className="text-xs text-brand-muted capitalize">
                {user?.role}
              </div>
            </div>
          </Link>

          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors duration-200"
          >
            <IconLogout />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main
        key={location.pathname}
        className="flex-1 h-full overflow-y-auto p-8 animate-fade-in-up"
      >
        {children}
      </main>
    </div>
  );
}
