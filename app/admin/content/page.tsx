"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { logAdminAction } from "@/lib/admin/activity-logger";
import {
  Globe,
  HelpCircle,
  Megaphone,
  Tag,
  FileText,
  Shield,
  RotateCcw,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Save
} from "lucide-react";
import type { ContentPage } from "@/types/supabase";

type ContentType =
  | "faq"
  | "announcement"
  | "promotion"
  | "country"
  | "city"
  | "terms"
  | "privacy"
  | "refund";

const CONTENT_SECTIONS = [
  { type: "faq" as ContentType, label: "FAQ — Questions Fréquentes", icon: HelpCircle, color: "#0369A1" },
  { type: "announcement" as ContentType, label: "Annonces Plateforme", icon: Megaphone, color: "#D97706" },
  { type: "promotion" as ContentType, label: "Promotions & Offres", icon: Tag, color: "#DC2626" },
  { type: "country" as ContentType, label: "Pays Desservis", icon: Globe, color: "#059669" },
  { type: "city" as ContentType, label: "Villes Disponibles", icon: Globe, color: "#7C3AED" },
  { type: "terms" as ContentType, label: "Conditions Générales d'Utilisation", icon: FileText, color: "#374151" },
  { type: "privacy" as ContentType, label: "Politique de Confidentialité", icon: Shield, color: "#374151" },
  { type: "refund" as ContentType, label: "Politique de Remboursement", icon: RotateCcw, color: "#374151" },
];

export default function ContentManagementPage() {
  const [activeSection, setActiveSection] = useState<ContentType>("faq");
  const [contentItems, setContentItems] = useState<ContentPage[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentPage | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formKey, setFormKey] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchContent();
  }, [activeSection]);

  async function fetchContent() {
    let completed = false;
    setLoading(true);

    const DEMO_CONTENT: ContentPage[] = [
      { id: "demo-1", type: activeSection, key: `${activeSection}_1`, title: activeSection === "faq" ? "Comment fonctionne CargoLink Africa ?" : activeSection === "announcement" ? "Nouveaux délais de livraison Août 2026" : activeSection === "promotion" ? "Promo Rentrée : -15% sur l'électronique" : "Bénin", content: { text: "Contenu de démonstration" }, is_active: true, updated_at: new Date().toISOString() },
      { id: "demo-2", type: activeSection, key: `${activeSection}_2`, title: activeSection === "faq" ? "Quels sont les délais de livraison ?" : activeSection === "announcement" ? "Maintenance planifiée 30 juillet 23h-3h" : activeSection === "promotion" ? "Flash Sale Panneaux Solaires — 48h seulement" : "Côte d'Ivoire", content: { text: "Contenu de démonstration" }, is_active: true, updated_at: new Date(Date.now() - 86400000).toISOString() },
    ];

    const timer = setTimeout(() => {
      if (!completed) {
        setContentItems(DEMO_CONTENT);
        setLoading(false);
      }
    }, 2000);

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("content_pages")
        .select("*")
        .eq("type", activeSection)
        .order("updated_at", { ascending: false });

      completed = true;
      clearTimeout(timer);

      if (error || !data) {
        setContentItems(DEMO_CONTENT);
      } else {
        setContentItems(data as ContentPage[]);
      }
    } catch (err) {
      completed = true;
      clearTimeout(timer);
      setContentItems(DEMO_CONTENT);
    } finally {
      setLoading(false);
    }
  }

  const openCreateForm = () => {
    setEditingItem(null);
    setFormTitle("");
    setFormKey(activeSection + "_" + Date.now());
    setFormContent("");
    setFormIsActive(true);
    setIsFormOpen(true);
  };

  const openEditForm = (item: ContentPage) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormKey(item.key);
    setFormContent(typeof item.content === "string" ? item.content : JSON.stringify(item.content, null, 2));
    setFormIsActive(item.is_active);
    setIsFormOpen(true);
  };

  const handleSaveContent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const supabase = createClient();

      let parsedContent: any;
      try {
        parsedContent = JSON.parse(formContent);
      } catch {
        parsedContent = { text: formContent };
      }

      const payload = {
        type: activeSection,
        key: formKey,
        title: formTitle,
        content: parsedContent,
        is_active: formIsActive,
      };

      if (editingItem) {
        const { error } = await supabase
          .from("content_pages")
          .update(payload)
          .eq("id", editingItem.id);
        if (error) throw error;

        await logAdminAction({
          action: "UPDATE_CONTENT",
          entityType: "content_pages",
          entityId: editingItem.id,
          newValues: { title: formTitle, type: activeSection }
        });
      } else {
        const { error } = await supabase.from("content_pages").insert(payload);
        if (error) throw error;

        await logAdminAction({
          action: "CREATE_CONTENT",
          entityType: "content_pages",
          newValues: { title: formTitle, type: activeSection }
        });
      }

      await fetchContent();
      setIsFormOpen(false);
      alert("Contenu enregistré avec succès !");
    } catch (err: any) {
      alert("Erreur lors de la sauvegarde : " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (item: ContentPage) => {
    try {
      const supabase = createClient();
      await supabase.from("content_pages").update({ is_active: !item.is_active }).eq("id", item.id);
      setContentItems((prev) => prev.map((c) => c.id === item.id ? { ...c, is_active: !item.is_active } : c));
    } catch (err: any) {
      alert("Erreur : " + err.message);
    }
  };

  const handleDelete = async (item: ContentPage) => {
    if (!confirm(`Supprimer "${item.title}" définitivement ?`)) return;
    try {
      const supabase = createClient();
      await supabase.from("content_pages").delete().eq("id", item.id);
      setContentItems((prev) => prev.filter((c) => c.id !== item.id));
    } catch (err: any) {
      alert("Erreur : " + err.message);
    }
  };

  const activeSection_ = CONTENT_SECTIONS.find((s) => s.type === activeSection);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* HEADER */}
      <div>
        <span className="badge" style={{ background: "var(--blue-light)", color: "var(--blue-primary)", marginBottom: 4 }}>
          GESTION DU CONTENU DYNAMIQUE
        </span>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--navy-dark)", margin: 0 }}>
          Gestion du Contenu
        </h1>
      </div>

      <div className="admin-content-grid">
        {/* SECTION SELECTOR SIDEBAR */}
        <div className="card" style={{ padding: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", padding: "8px 12px 4px", textTransform: "uppercase" }}>Sections</div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {CONTENT_SECTIONS.map((s) => {
              const Icon = s.icon;
              const isActive = activeSection === s.type;
              return (
                <li key={s.type}>
                  <button
                    onClick={() => {
                      setActiveSection(s.type);
                      setIsFormOpen(false);
                    }}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "9px 12px",
                      borderRadius: "var(--radius-sm)",
                      border: "none",
                      background: isActive ? "var(--blue-light)" : "transparent",
                      color: isActive ? "var(--blue-primary)" : "var(--navy-dark)",
                      fontWeight: isActive ? 800 : 600,
                      fontSize: 13,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 8
                    }}
                  >
                    <Icon style={{ width: 16, color: isActive ? "var(--blue-primary)" : s.color }} />
                    {s.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* CONTENT AREA */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* SECTION HEADER */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {activeSection_ && (
                <>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--blue-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <activeSection_.icon style={{ width: 18, color: "var(--blue-primary)" }} />
                  </div>
                  <h2 style={{ fontSize: 18, fontWeight: 600, color: "var(--navy-dark)", margin: 0 }}>
                    {activeSection_.label}
                  </h2>
                </>
              )}
            </div>
            {!isFormOpen && (
              <button
                onClick={openCreateForm}
                className="btn btn-orange"
                style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12 }}
              >
                <Plus style={{ width: 14 }} /> Ajouter
              </button>
            )}
          </div>

          {/* INLINE EDITOR FORM */}
          {isFormOpen && (
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--navy-dark)", margin: "0 0 16px" }}>
                {editingItem ? `Modifier : ${editingItem.title}` : `Nouveau contenu — ${activeSection_?.label ?? activeSection}`}

              </h3>
              <form onSubmit={handleSaveContent} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>TITRE</label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    required
                    placeholder="Ex: Comment fonctionne CargoLink Africa ?"
                    style={{ width: "100%", padding: 10, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontWeight: 700 }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
                    CONTENU (Texte simple ou JSON structuré)
                  </label>
                  <textarea
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    required
                    placeholder="Saisissez le contenu ou une structure JSON..."
                    style={{ width: "100%", height: 180, padding: 10, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontSize: 13, fontFamily: "monospace" }}
                  />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="checkbox"
                    id="is-active-toggle"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    style={{ width: 16, height: 16 }}
                  />
                  <label htmlFor="is-active-toggle" style={{ fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                    Visible sur la plateforme (actif)
                  </label>
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button type="button" onClick={() => setIsFormOpen(false)} className="btn" style={{ padding: "8px 14px", fontSize: 12 }}>Annuler</button>
                  <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: "8px 18px", fontSize: 12, display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <Save style={{ width: 14 }} /> {saving ? "Sauvegarde..." : "Enregistrer"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* CONTENT ITEMS LIST */}
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            {loading ? (
              <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>Chargement du contenu...</div>
            ) : contentItems.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center" }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--blue-light)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                  <FileText style={{ width: 26, color: "var(--blue-primary)" }} />
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--navy-dark)", marginBottom: 4 }}>Aucun contenu</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Cliquez sur "Ajouter" pour créer votre premier contenu.</div>
              </div>
            ) : (
              contentItems.map((item, idx) => (
                <div
                  key={item.id}
                  style={{
                    padding: "16px 20px",
                    borderBottom: idx < contentItems.length - 1 ? "1px solid var(--border-light)" : "none",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 14
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: "var(--navy-dark)", fontSize: 14, marginBottom: 2 }}>{item.title}</div>
                    <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>
                      Modifié le {new Date(item.updated_at).toLocaleDateString("fr-FR")}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ background: item.is_active ? "#DCFCE7" : "#F3F4F6", color: item.is_active ? "#166534" : "#6B7280", borderRadius: 9999, padding: "3px 8px", fontSize: 11, fontWeight: 600 }}>
                      {item.is_active ? "Actif" : "Masqué"}
                    </span>
                    <button onClick={() => handleToggleActive(item)} className="btn" style={{ padding: "5px 10px", fontSize: 11.5 }} title="Basculer visibilité">
                      {item.is_active ? <XCircle style={{ width: 14 }} /> : <CheckCircle2 style={{ width: 14 }} />}
                    </button>
                    <button onClick={() => openEditForm(item)} className="btn" style={{ padding: "5px 10px", fontSize: 11.5, background: "var(--blue-light)", color: "var(--blue-primary)" }}>
                      <Edit style={{ width: 14 }} />
                    </button>
                    <button onClick={() => handleDelete(item)} className="btn" style={{ padding: "5px 10px", fontSize: 11.5, background: "#FEE2E2", color: "#991B1B" }}>
                      <Trash2 style={{ width: 14 }} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
