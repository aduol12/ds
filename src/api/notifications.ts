import { client } from "./client";

function asArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object") {
    const data = (payload as { data?: unknown }).data;
    if (Array.isArray(data)) return data;
  }
  return [];
}

export async function getMyNotifications(unreadOnly = false) {
  const response = await client.get("/api/notifications", {
    params: unreadOnly ? { unread: "true" } : undefined,
  });
  return asArray<Record<string, unknown>>(response.data);
}

export async function markNotificationRead(id: string) {
  const response = await client.patch(`/api/notifications/${id}/read`);
  return response.data;
}
