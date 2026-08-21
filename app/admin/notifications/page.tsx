"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { DEMO_NOTIFICATIONS } from "@/lib/admin/demo-data";
import { Bell, Check, Clock, AlertCircle, FileText, ShoppingBag, Truck } from "lucide-react";

export default function NotificationsManagementPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    let completed = false;
    setLoading(true);

    const timer = setTimeout(() => {
      if (!completed) {
        setNotifications(DEMO_NOTIFICATIONS);
        setLoading(false);
      }
    }, 1500);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.from("notifications").select("*").order("created_at", { ascending: false });
      completed = true;
      clearTimeout(timer);

      if (error || !data || data.length === 0) {
        setNotifications(DEMO_NOTIFICATIONS);
      } else {
        setNotifications(data);
      }
    } catch (err) {
      completed = true;
      clearTimeout(timer);
      setNotifications(DEMO_NOTIFICATIONS);
    } finally {
      setLoading(false);
    }
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* HEADER BAR */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div>
          <span className="badge" style={{ background: "var(--blue-light)", color: "var(--blue-primary)", marginBottom: 4 }}>
            ALERTES & NOTIFICATIONS SYSTÈME
          </span>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--navy-dark)", margin: 0 }}>
            Centre de Notifications Admin
          </h1>
        </div>
        <button onClick={markAllAsRead} className="btn btn-primary" style={{ padding: "8px 16px", fontSize: 13 }}>
          <Check style={{ width: 14 }} /> Tout marquer comme lu
        </button>
      </div>

      {/* NOTIFICATIONS LIST */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {loading ? (
            <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>
              Chargement des notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>
              Aucune notification récente.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                style={{
                  padding: "16px 20px",
                  borderBottom: "1px solid var(--border-light)",
                  background: n.is_read ? "#FFF" : "var(--bg-main)",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 14,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: n.is_read ? "var(--bg-main)" : "var(--orange-light)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: n.is_read ? "var(--text-muted)" : "var(--orange-hover)",
                    flexShrink: 0,
                  }}
                >
                  <Bell style={{ width: 18 }} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                    <div style={{ fontWeight: 600, color: "var(--navy-dark)", fontSize: 14 }}>{n.title}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                      <Clock style={{ width: 11 }} /> {new Date(n.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{n.body}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
