"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { logAdminAction } from "@/lib/admin/activity-logger";
import {
  Bell,
  Send,
  Users,
  User,
  Globe,
  Clock,
  CheckCircle2,
  Mail,
  Smartphone,
  MessageSquare,
  Search,
  Calendar,
  Package,
  CreditCard,
  AlertTriangle,
  Megaphone
} from "lucide-react";
import type { Profile, Notification } from "@/types/supabase";

const NOTIFICATION_TYPES = [
  { value: "order_update", label: "Mise à jour de commande", icon: Package },
  { value: "payment_confirmation", label: "Confirmation de paiement", icon: CreditCard },
  { value: "shipping_delay", label: "Retard d'expédition", icon: AlertTriangle },
  { value: "delivery_ready", label: "Livraison disponible", icon: CheckCircle2 },
  { value: "new_offer", label: "Nouvelle offre promotionnelle", icon: Bell },
  { value: "general", label: "Annonce générale", icon: Megaphone },
];

export default function NotificationsManagementPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [notifType, setNotifType] = useState("general");
  const [recipientType, setRecipientType] = useState<"all" | "user" | "group">("all");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedChannel, setSelectedChannel] = useState<"in_app" | "email">("in_app");
  const [scheduledAt, setScheduledAt] = useState("");
  const [userSearch, setUserSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const supabase = createClient();

      const { data: notifsData } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (notifsData) setNotifications(notifsData as Notification[]);

      const { data: usersData } = await supabase
        .from("profiles")
        .select("*")
        .order("first_name");
      if (usersData) setUsers(usersData as Profile[]);
    } catch (err) {
      console.error("Error fetching notifications data:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;

    try {
      setSending(true);
      const supabase = createClient();

      const payload: any = {
        title,
        message,
        type: notifType,
        recipient_type: recipientType,
        channel: selectedChannel,
        is_read: false,
        sent_at: scheduledAt ? null : new Date().toISOString(),
        scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
      };

      if (recipientType === "user" && selectedUserId) {
        payload.user_id = selectedUserId;
        await supabase.from("notifications").insert({ ...payload });
      } else if (recipientType === "all") {
        await supabase.from("notifications").insert({ ...payload });
      }

      await logAdminAction({
        action: "SEND_NOTIFICATION",
        entityType: "notifications",
        newValues: { title, recipient_type: recipientType, channel: selectedChannel }
      });

      // Reset form
      setTitle("");
      setMessage("");
      setSelectedUserId("");
      setScheduledAt("");
      setRecipientType("all");

      await fetchData();
      alert(`Notification ${scheduledAt ? "planifiée" : "envoyée"} avec succès !`);
    } catch (err: any) {
      alert("Erreur lors de l'envoi : " + err.message);
    } finally {
      setSending(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const name = `${u.first_name} ${u.last_name}`.toLowerCase();
    const email = u.email.toLowerCase();
    return name.includes(userSearch.toLowerCase()) || email.includes(userSearch.toLowerCase());
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* HEADER */}
      <div>
        <span className="badge" style={{ background: "var(--orange-light)", color: "var(--orange-hover)", marginBottom: 4 }}>
          COMMUNICATIONS PLATEFORME
        </span>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--navy-dark)", margin: 0 }}>
          Centre de Notifications
        </h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>
        {/* SEND NOTIFICATION FORM */}
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--navy-dark)", margin: "0 0 20px" }}>
            Envoyer une Notification
          </h2>

          <form onSubmit={handleSendNotification} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* TYPE */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>
                TYPE DE NOTIFICATION
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {NOTIFICATION_TYPES.map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setNotifType(t.value)}
                      style={{
                        padding: "8px 10px",
                        borderRadius: "var(--radius-sm)",
                        border: `2px solid ${notifType === t.value ? "var(--blue-primary)" : "var(--border-light)"}`,
                        background: notifType === t.value ? "var(--blue-light)" : "#FFF",
                        color: notifType === t.value ? "var(--blue-primary)" : "var(--navy-dark)",
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        textAlign: "left"
                      }}
                    >
                      <Icon style={{ width: 14, flexShrink: 0 }} /> {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* TITLE */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>TITRE DE LA NOTIFICATION</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Votre commande a été expédiée !"
                required
                style={{ width: "100%", padding: 10, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontWeight: 600 }}
              />
            </div>

            {/* MESSAGE */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>MESSAGE COMPLET</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Rédigez votre message destiné au client..."
                required
                style={{ width: "100%", height: 90, padding: 10, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontSize: 13 }}
              />
            </div>

            {/* RECIPIENT TYPE */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>DESTINATAIRES</label>
              <div style={{ display: "flex", gap: 10 }}>
                {[
                  { value: "all", label: "Tous les clients", icon: Globe },
                  { value: "user", label: "Un utilisateur", icon: User },
                ].map((r) => {
                  const Icon = r.icon;
                  return (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRecipientType(r.value as "all" | "user")}
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        borderRadius: "var(--radius-sm)",
                        border: `2px solid ${recipientType === r.value ? "var(--orange-primary)" : "var(--border-light)"}`,
                        background: recipientType === r.value ? "var(--orange-light)" : "#FFF",
                        color: recipientType === r.value ? "var(--orange-hover)" : "var(--navy-dark)",
                        fontWeight: 700,
                        fontSize: 12.5,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6
                      }}
                    >
                      <Icon style={{ width: 14 }} /> {r.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* USER SEARCH (if single user) */}
            {recipientType === "user" && (
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>SÉLECTIONNER L'UTILISATEUR</label>
                <div style={{ display: "flex", alignItems: "center", background: "var(--bg-main)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-sm)", padding: "6px 10px", gap: 8, marginBottom: 8 }}>
                  <Search style={{ width: 14, color: "var(--text-muted)" }} />
                  <input
                    type="text"
                    placeholder="Rechercher un client..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    style={{ border: "none", background: "transparent", outline: "none", fontSize: 13, fontWeight: 600, width: "100%" }}
                  />
                </div>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  required={recipientType === "user"}
                  style={{ width: "100%", padding: 10, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontWeight: 700, height: 120 }}
                  size={5}
                >
                  {filteredUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.first_name} {u.last_name} — {u.email}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* CHANNEL */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>CANAL D'ENVOI</label>
              <div style={{ display: "flex", gap: 10 }}>
                {[
                  { value: "in_app", label: "In-App", icon: Bell },
                  { value: "email", label: "Email", icon: Mail },
                ].map((c) => {
                  const Icon = c.icon;
                  return (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setSelectedChannel(c.value as "in_app" | "email")}
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        borderRadius: "var(--radius-sm)",
                        border: `2px solid ${selectedChannel === c.value ? "var(--blue-primary)" : "var(--border-light)"}`,
                        background: selectedChannel === c.value ? "var(--blue-light)" : "#FFF",
                        color: selectedChannel === c.value ? "var(--blue-primary)" : "var(--navy-dark)",
                        fontWeight: 700,
                        fontSize: 12.5,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6
                      }}
                    >
                      <Icon style={{ width: 14 }} /> {c.label}
                    </button>
                  );
                })}
                <div
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    borderRadius: "var(--radius-sm)",
                    border: "2px solid var(--border-light)",
                    background: "#F3F4F6",
                    color: "#9CA3AF",
                    fontWeight: 700,
                    fontSize: 12.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6
                  }}
                  title="WhatsApp disponible prochainement"
                >
                  <MessageSquare style={{ width: 14 }} /> WhatsApp (bientôt)
                </div>
              </div>
            </div>

            {/* SCHEDULE */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>PLANIFIER (OPTIONNEL) — Laisser vide pour envoi immédiat</label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                style={{ width: "100%", padding: 10, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontWeight: 600 }}
              />
            </div>

            <button
              type="submit"
              disabled={sending || !title || !message}
              className="btn btn-orange"
              style={{ padding: "10px 20px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, fontWeight: 800 }}
            >
              <Send style={{ width: 16 }} />
              {sending ? "Envoi en cours..." : scheduledAt ? "Planifier la Notification" : "Envoyer Maintenant"}
            </button>
          </form>
        </div>

        {/* NOTIFICATION HISTORY */}
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--navy-dark)", margin: "0 0 16px" }}>
            Historique des Envois ({notifications.length})
          </h2>

          {loading ? (
            <div style={{ textAlign: "center", padding: 32, color: "var(--text-muted)" }}>Chargement...</div>
          ) : notifications.length === 0 ? (
            <div style={{ textAlign: "center", padding: 32, color: "var(--text-muted)" }}>
              Aucune notification envoyée.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {notifications.map((n) => (
                <div key={n.id} style={{ padding: 12, background: "var(--bg-main)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <div style={{ fontWeight: 800, fontSize: 13.5, color: "var(--navy-dark)" }}>{n.title}</div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <span className="badge" style={{ background: "var(--blue-light)", color: "var(--blue-primary)", fontSize: 10 }}>
                        {n.channel === "in_app" ? "In-App" : n.channel === "email" ? "Email" : "WhatsApp"}
                      </span>
                      <span className="badge" style={{ background: n.recipient_type === "all" ? "var(--orange-light)" : "var(--bg-main)", color: n.recipient_type === "all" ? "var(--orange-hover)" : "var(--navy-dark)", fontSize: 10, border: "1px solid var(--border-light)" }}>
                        {n.recipient_type === "all" ? "Tous les clients" : "Individuel"}
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginBottom: 4 }}>{n.message}</div>
                  <div style={{ fontSize: 11, color: "var(--text-light)" }}>
                    {n.sent_at ? `Envoyé le ${new Date(n.sent_at).toLocaleString("fr-FR")}` : n.scheduled_at ? `Planifié pour le ${new Date(n.scheduled_at).toLocaleString("fr-FR")}` : ""}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
