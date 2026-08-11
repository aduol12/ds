import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { getAllAlerts } from "@/api/alerts";
import { getMyNotifications, markNotificationRead } from "@/api/notifications";

type BellItem = {
  id: string;
  title: string;
  detail: string;
  time: string;
  kind: "alert" | "notification";
  unread?: boolean;
};

function timeAgo(iso?: string | Date | null) {
  if (!iso) return "—";
  const ts = new Date(iso).getTime();
  if (Number.isNaN(ts)) return "—";
  const mins = Math.max(0, Math.round((Date.now() - ts) / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 48) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

type StaffAlertsBellProps = {
  alertsPath: string;
};

export function StaffAlertsBell({ alertsPath }: StaffAlertsBellProps) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<BellItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [alerts, notes] = await Promise.all([
        getAllAlerts().catch(() => []),
        getMyNotifications(false).catch(() => []),
      ]);

      const alertItems: BellItem[] = alerts.slice(0, 8).map((a: any) => ({
        id: `alert-${a.alert_id || a.id}`,
        title: a.alert_type || "System alert",
        detail: a.description || a.kit_id || "",
        time: timeAgo(a.timestamp),
        kind: "alert",
      }));

      const noteItems: BellItem[] = notes.slice(0, 8).map((n: any) => ({
        id: `note-${n.id}`,
        title: n.title || n.channel || "Notification",
        detail: n.body || n.message || "",
        time: timeAgo(n.created_at || n.createdAt),
        kind: "notification",
        unread: n.is_read === false || n.is_read === 0 || n.is_read == null,
      }));

      setItems(
        [...noteItems, ...alertItems].sort((a, b) => {
          if (a.unread === b.unread) return 0;
          return a.unread ? -1 : 1;
        }),
      );
    } catch (err) {
      console.error(err);
      setItems([]);
      setError("Could not load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 60000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!open) return;
    void load();
    const onClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const unreadCount = items.filter((i) => i.unread || i.kind === "alert").length;

  const onItemClick = async (item: BellItem) => {
    if (item.kind === "notification" && item.unread) {
      const rawId = item.id.replace(/^note-/, "");
      try {
        await markNotificationRead(rawId);
        setItems((prev) =>
          prev.map((row) =>
            row.id === item.id ? { ...row, unread: false } : row,
          ),
        );
      } catch {
        // non-blocking
      }
    }
  };

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-emerald-700"
        aria-label="Open notifications"
        aria-expanded={open}
      >
        <span className="material-symbols-outlined">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">Notifications</p>
            <p className="text-xs text-slate-500">
              {loading
                ? "Refreshing…"
                : error
                  ? error
                  : items.length === 0
                    ? "No alerts or messages yet"
                    : `${items.length} recent item${items.length === 1 ? "" : "s"}`}
            </p>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {items.length === 0 && !loading ? (
              <p className="px-4 py-6 text-sm text-slate-500">
                When devices raise alerts or the system sends messages, they show up here.
              </p>
            ) : (
              items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => void onItemClick(item)}
                  className="block w-full border-b border-slate-50 px-4 py-3 text-left last:border-b-0 hover:bg-slate-50"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-slate-900">
                      {item.unread ? "• " : ""}
                      {item.title}
                    </p>
                    <span className="text-[11px] text-slate-400">{item.time}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-600">{item.detail}</p>
                </button>
              ))
            )}
          </div>
          <div className="border-t border-slate-100 p-2">
            <Link
              to={alertsPath}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-center text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
            >
              View all alerts
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
