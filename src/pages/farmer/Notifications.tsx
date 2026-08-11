import { useEffect, useState } from "react";

import { getAllAlerts } from "@/api/alerts";
import { getMyNotifications, markNotificationRead } from "@/api/notifications";
import { useToasts } from "@/hooks/useToasts";

type FeedItem = {
  id: string;
  title: string;
  detail: string;
  time: string;
  kind: "alert" | "notification";
  unread?: boolean;
  tone: "emerald" | "amber" | "rose" | "slate";
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

function severityTone(severity?: string): FeedItem["tone"] {
  const s = String(severity || "").toUpperCase();
  if (s === "HIGH" || s === "CRITICAL") return "rose";
  if (s === "MEDIUM" || s === "WARNING") return "amber";
  return "emerald";
}

export default function NotificationsPage() {
  const { addToast } = useToasts();
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [alerts, notes] = await Promise.all([
        getAllAlerts().catch(() => []),
        getMyNotifications(false).catch(() => []),
      ]);

      const alertItems: FeedItem[] = alerts.map((a: any) => ({
        id: `alert-${a.alert_id || a.id}`,
        title: a.alert_type || "System alert",
        detail: a.description || `Kit ${a.kit_id || "—"}`,
        time: timeAgo(a.timestamp),
        kind: "alert",
        tone: severityTone(a.severity),
      }));

      const noteItems: FeedItem[] = notes.map((n: any) => ({
        id: `note-${n.id}`,
        title: n.title || "Notification",
        detail: n.body || "",
        time: timeAgo(n.created_at || n.createdAt),
        kind: "notification",
        unread: n.is_read === false || n.is_read == null,
        tone: "slate",
      }));

      setItems([...noteItems, ...alertItems]);
    } catch (err) {
      console.error(err);
      setItems([]);
      addToast("Failed to load notifications.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const markRead = async (item: FeedItem) => {
    if (item.kind !== "notification" || !item.unread) return;
    const rawId = item.id.replace(/^note-/, "");
    try {
      await markNotificationRead(rawId);
      setItems((prev) =>
        prev.map((row) =>
          row.id === item.id ? { ...row, unread: false } : row,
        ),
      );
    } catch {
      addToast("Could not mark notification as read.", "error");
    }
  };

  const toneClass = {
    emerald: "border-emerald-200 bg-emerald-50",
    amber: "border-amber-200 bg-amber-50",
    rose: "border-rose-200 bg-rose-50",
    slate: "border-slate-200 bg-white",
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900">Notifications</h2>
        <p className="mt-2 text-sm text-slate-500">
          Live alerts and messages for your farms and devices.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
          No alerts or notifications yet. When moisture, irrigation, or system
          events fire, they will appear here.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => void markRead(item)}
              className={`w-full rounded-2xl border p-4 text-left shadow-sm ${toneClass[item.tone]}`}
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold text-slate-900">
                  {item.unread ? "• " : ""}
                  {item.title}
                </h3>
                <span className="text-xs text-slate-500">{item.time}</span>
              </div>
              <p className="mt-1 text-sm text-slate-600">{item.detail}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
