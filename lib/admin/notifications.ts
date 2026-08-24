import { createClient } from "@/lib/supabase/client";

export interface RealNotification {
  id: string;
  title: string;
  desc: string;
  time?: string;
  type: "product" | "quote" | "order" | "payment" | "shipment" | "system";
  created_at: string;
  is_read?: boolean;
}

const LOCAL_NOTIFS_KEY = "fenou_real_notifications";

export function getLocalNotifications(): RealNotification[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_NOTIFS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalNotifications(notifs: RealNotification[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_NOTIFS_KEY, JSON.stringify(notifs.slice(0, 50)));
  } catch {}
}

export function addRealNotification(notif: { title: string; desc: string; type: "product" | "quote" | "order" | "payment" | "shipment" | "system" }): void {
  const newNotif: RealNotification = {
    ...notif,
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    time: "À l'instant",
    created_at: new Date().toISOString(),
    is_read: false
  };

  const current = getLocalNotifications();
  current.unshift(newNotif);
  saveLocalNotifications(current);

  // Sync with Supabase asynchronously if table exists
  try {
    const supabase = createClient();
    supabase.from("notifications").insert({
      title: notif.title,
      message: notif.desc,
      type: notif.type,
      is_read: false
    }).then(() => {});
  } catch {}
}

export async function fetchAllRealNotifications(): Promise<RealNotification[]> {
  const local = getLocalNotifications();
  const notifMap = new Map<string, RealNotification>();

  for (const n of local) {
    notifMap.set(n.id, n);
  }

  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (data && data.length > 0) {
      for (const row of data) {
        const item: RealNotification = {
          id: row.id,
          title: row.title || "Notification Système",
          desc: row.message || row.description || "",
          time: formatNotificationTime(row.created_at),
          type: row.type || "system",
          created_at: row.created_at,
          is_read: row.is_read || false
        };
        notifMap.set(item.id, item);
      }
    }
  } catch {}

  const sorted = Array.from(notifMap.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return sorted.map((n) => ({
    ...n,
    time: formatNotificationTime(n.created_at)
  }));
}

export function formatNotificationTime(dateStr: string): string {
  try {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `Il y a ${diffDays}j`;
  } catch {
    return "Récemment";
  }
}
