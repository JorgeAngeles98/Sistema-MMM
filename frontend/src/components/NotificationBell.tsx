import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

interface Notif {
  id: string;
  message: string;
  link: string;
  read: boolean;
  createdAt: string;
}

function timeAgo(value: string): string {
  try {
    const diff = Date.now() - new Date(value).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "ahora";
    if (m < 60) return `hace ${m} min`;
    const h = Math.floor(m / 60);
    if (h < 24) return `hace ${h} h`;
    const d = Math.floor(h / 24);
    return `hace ${d} d`;
  } catch {
    return "";
  }
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notif[]>([]);
  const [unread, setUnread] = useState(0);
  const navigate = useNavigate();

  async function load() {
    try {
      const d = await api<{ unread: number; notifications: Notif[] }>("/notifications");
      setItems(d.notifications);
      setUnread(d.unread);
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  async function markAll() {
    try {
      await api("/notifications/read-all", { method: "PUT" });
      await load();
    } catch {
      /* ignore */
    }
  }

  async function clickItem(n: Notif) {
    try {
      if (!n.read) await api(`/notifications/${n.id}/read`, { method: "PUT" });
    } catch {
      /* ignore */
    }
    setOpen(false);
    await load();
    if (n.link) navigate(n.link);
  }

  return (
    <>
      <button
        onClick={() => {
          setOpen((o) => !o);
          if (!open) load();
        }}
        className="relative w-9 h-9 rounded-full bg-brand-surface2 hover:bg-brand-border/50 flex items-center justify-center transition"
        title="Notificaciones"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5 text-slate-200">
          <path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.7 21a2 2 0 01-3.4 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-medium flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="fixed top-16 left-40 w-80 max-h-[70vh] overflow-y-auto bg-brand-surface border border-brand-border rounded-xl shadow-2xl shadow-black/40 z-50 animate-fade-in-up">
            <div className="flex items-center justify-between px-4 py-3 border-b border-brand-border">
              <span className="font-semibold text-sm">Notificaciones</span>
              {unread > 0 && (
                <button onClick={markAll} className="text-xs text-brand-cyan hover:underline">
                  Marcar todas
                </button>
              )}
            </div>
            {items.length === 0 ? (
              <div className="px-4 py-6 text-center text-brand-muted text-sm">Sin notificaciones</div>
            ) : (
              <div className="divide-y divide-brand-border">
                {items.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => clickItem(n)}
                    className={`w-full text-left px-4 py-3 hover:bg-brand-surface2 transition ${n.read ? "opacity-60" : ""}`}
                  >
                    <div className="flex items-start gap-2">
                      {!n.read && <span className="mt-1.5 w-2 h-2 rounded-full bg-brand-cyan flex-shrink-0" />}
                      <div className={n.read ? "" : "ml-0"}>
                        <div className="text-sm">{n.message}</div>
                        <div className="text-[11px] text-brand-muted mt-0.5">{timeAgo(n.createdAt)}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
