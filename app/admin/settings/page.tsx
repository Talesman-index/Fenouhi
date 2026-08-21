"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { logAdminAction } from "@/lib/admin/activity-logger";
import {
  Settings,
  DollarSign,
  Percent,
  Globe,
  CreditCard,
  Mail,
  Shield,
  Phone,
  Info,
  Save,
  CheckCircle2,
  Loader2,
  Plane,
  Ship
} from "lucide-react";
import type { PlatformSetting } from "@/types/supabase";

interface ServiceFees {
  rate_percent: number;
  fixed_fee_fcfa: number;
}

interface ShippingRates {
  air_per_kg_fcfa: number;
  sea_per_cbm_fcfa: number;
}

interface ContactInfo {
  email: string;
  phone: string;
  address: string;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);

  // Settings State
  const [serviceFees, setServiceFees] = useState<ServiceFees>({ rate_percent: 5, fixed_fee_fcfa: 2500 });
  const [shippingRates, setShippingRates] = useState<ShippingRates>({ air_per_kg_fcfa: 7500, sea_per_cbm_fcfa: 185000 });
  const [contactInfo, setContactInfo] = useState<ContactInfo>({ email: "contact@cargolink.africa", phone: "+229 97 00 00 00", address: "Boulevard de la Marina, Cotonou, Bénin" });
  const [supportedCurrencies, setSupportedCurrencies] = useState<string>("FCFA, EUR, USD");
  const [paymentMethods, setPaymentMethods] = useState<string>("Mobile Money MTN, Moov Money, Orange Money, Virement Bancaire");

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    let completed = false;
    setLoading(true);

    const timer = setTimeout(() => {
      if (!completed) setLoading(false);
    }, 2000);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.from("platform_settings").select("*");

      completed = true;
      clearTimeout(timer);

      if (!error && data) {
        data.forEach((s: PlatformSetting) => {
          if (s.key === "service_fees") setServiceFees(s.value as ServiceFees);
          if (s.key === "shipping_rates") setShippingRates(s.value as ShippingRates);
          if (s.key === "contact_info") setContactInfo(s.value as ContactInfo);
          if (s.key === "supported_currencies") setSupportedCurrencies(s.value?.currencies || "FCFA, EUR, USD");
          if (s.key === "payment_methods") setPaymentMethods(s.value?.methods || "Mobile Money");
        });
      }
    } catch (err) {
      completed = true;
      clearTimeout(timer);
      // keep the default values already set in useState
    } finally {
      setLoading(false);
    }
  }

  const saveSetting = async (key: string, value: any, description?: string) => {
    try {
      setSavingKey(key);
      const supabase = createClient();

      const { error } = await supabase
        .from("platform_settings")
        .upsert({
          key,
          value,
          description: description || key,
        }, {
          onConflict: "key"
        });

      if (error) throw error;

      await logAdminAction({
        action: "UPDATE_PLATFORM_SETTING",
        entityType: "platform_settings",
        entityId: key,
        newValues: { key, value }
      });

      setSavedKey(key);
      setTimeout(() => setSavedKey(null), 2000);
    } catch (err: any) {
      alert("Erreur : " + err.message);
    } finally {
      setSavingKey(null);
    }
  };

  const SaveButton = ({ settingKey, label }: { settingKey: string; label: string }) => (
    <button
      onClick={() => {
        if (settingKey === "service_fees") saveSetting("service_fees", serviceFees, "Frais de service CargoLink Africa");
        if (settingKey === "shipping_rates") saveSetting("shipping_rates", shippingRates, "Tarifs d'expédition Chine → Afrique");
        if (settingKey === "contact_info") saveSetting("contact_info", contactInfo, "Coordonnées de contact officielles");
        if (settingKey === "supported_currencies") saveSetting("supported_currencies", { currencies: supportedCurrencies });
        if (settingKey === "payment_methods") saveSetting("payment_methods", { methods: paymentMethods });
      }}
      className="btn btn-primary"
      style={{ fontSize: 12, padding: "8px 16px", display: "inline-flex", alignItems: "center", gap: 6 }}
    >
      {savingKey === settingKey ? (
        <><Loader2 style={{ width: 14 }} /> Sauvegarde...</>
      ) : savedKey === settingKey ? (
        <><CheckCircle2 style={{ width: 14, color: "#22C55E" }} /> Enregistré !</>
      ) : (
        <><Save style={{ width: 14 }} /> {label}</>
      )}
    </button>
  );

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>
        Chargement des paramètres de la plateforme...
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* HEADER */}
      <div>
        <span className="badge" style={{ background: "var(--blue-light)", color: "var(--blue-primary)", marginBottom: 4 }}>
          CONFIGURATION OPÉRATIONNELLE
        </span>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--navy-dark)", margin: 0 }}>
          Paramètres de la Plateforme
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 6 }}>
          Ces paramètres affectent directement le fonctionnement de la plateforme. Toute modification est enregistrée dans le journal d'activité.
        </p>
      </div>

      {/* SECTION 1: SERVICE FEES */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--orange-light)", color: "var(--orange-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Percent style={{ width: 20 }} />
            </div>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--navy-dark)", margin: 0 }}>Frais de Service CargoLink Africa</h2>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Appliqués à chaque devis et commande</div>
            </div>
          </div>
          <SaveButton settingKey="service_fees" label="Sauvegarder Frais" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>
              COMMISSION VARIABLE (% DU MONTANT PRODUIT)
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input
                type="number"
                min={0}
                max={50}
                step={0.5}
                value={serviceFees.rate_percent}
                onChange={(e) => setServiceFees({ ...serviceFees, rate_percent: Number(e.target.value) })}
                style={{ flex: 1, padding: 10, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontWeight: 700, fontSize: 16 }}
              />
              <span style={{ fontWeight: 600, color: "var(--navy-dark)" }}>%</span>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>
              FRAIS FIXES PAR COMMANDE (FCFA)
            </label>
            <input
              type="number"
              min={0}
              value={serviceFees.fixed_fee_fcfa}
              onChange={(e) => setServiceFees({ ...serviceFees, fixed_fee_fcfa: Number(e.target.value) })}
              style={{ width: "100%", padding: 10, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontWeight: 700, fontSize: 16 }}
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: SHIPPING RATES */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--blue-light)", color: "var(--blue-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Ship style={{ width: 20 }} />
            </div>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--navy-dark)", margin: 0 }}>Tarifs d'Expédition Chine → Afrique</h2>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Utilisés pour calculer le coût logistique automatiquement</div>
            </div>
          </div>
          <SaveButton settingKey="shipping_rates" label="Sauvegarder Tarifs" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>
              <Plane style={{ width: 14, display: "inline", marginRight: 4 }} />
              FRET AÉRIEN — FCFA PAR KG
            </label>
            <input
              type="number"
              min={0}
              value={shippingRates.air_per_kg_fcfa}
              onChange={(e) => setShippingRates({ ...shippingRates, air_per_kg_fcfa: Number(e.target.value) })}
              style={{ width: "100%", padding: 10, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontWeight: 700 }}
            />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>
              <Ship style={{ width: 14, display: "inline", marginRight: 4 }} />
              FRET MARITIME — FCFA PAR CBM
            </label>
            <input
              type="number"
              min={0}
              value={shippingRates.sea_per_cbm_fcfa}
              onChange={(e) => setShippingRates({ ...shippingRates, sea_per_cbm_fcfa: Number(e.target.value) })}
              style={{ width: "100%", padding: 10, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontWeight: 700 }}
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: PAYMENT METHODS & CURRENCIES */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#DCFCE7", color: "#15803D", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CreditCard style={{ width: 20 }} />
            </div>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--navy-dark)", margin: 0 }}>Devises & Méthodes de Paiement</h2>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Méthodes acceptées pour les règlements clients</div>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>
              DEVISES SUPPORTÉES (séparées par des virgules)
            </label>
            <input
              type="text"
              value={supportedCurrencies}
              onChange={(e) => setSupportedCurrencies(e.target.value)}
              style={{ width: "100%", padding: 10, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontWeight: 700 }}
            />
            <button onClick={() => saveSetting("supported_currencies", { currencies: supportedCurrencies })} className="btn btn-primary" style={{ marginTop: 10, fontSize: 11, padding: "6px 12px" }}>
              <Save style={{ width: 12 }} /> Enregistrer
            </button>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>
              MÉTHODES DE PAIEMENT ACCEPTÉES
            </label>
            <textarea
              value={paymentMethods}
              onChange={(e) => setPaymentMethods(e.target.value)}
              style={{ width: "100%", height: 80, padding: 10, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontSize: 13 }}
            />
            <button onClick={() => saveSetting("payment_methods", { methods: paymentMethods })} className="btn btn-primary" style={{ marginTop: 10, fontSize: 11, padding: "6px 12px" }}>
              <Save style={{ width: 12 }} /> Enregistrer
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 4: CONTACT INFO */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--bg-main)", border: "1px solid var(--border-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Phone style={{ width: 20, color: "var(--navy-dark)" }} />
            </div>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--navy-dark)", margin: 0 }}>Informations de Contact CargoLink Africa</h2>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Affichées sur le site public et les emails transactionnels</div>
            </div>
          </div>
          <SaveButton settingKey="contact_info" label="Enregistrer Contact" />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>EMAIL DE CONTACT OFFICIEL</label>
            <input
              type="email"
              value={contactInfo.email}
              onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
              style={{ width: "100%", padding: 10, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontWeight: 700 }}
            />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>NUMÉRO DE TÉLÉPHONE / WHATSAPP</label>
            <input
              type="text"
              value={contactInfo.phone}
              onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
              style={{ width: "100%", padding: 10, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontWeight: 700 }}
            />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>ADRESSE PHYSIQUE (SIÈGE SOCIAL)</label>
            <input
              type="text"
              value={contactInfo.address}
              onChange={(e) => setContactInfo({ ...contactInfo, address: e.target.value })}
              style={{ width: "100%", padding: 10, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontWeight: 700 }}
            />
          </div>
        </div>
      </div>

      {/* SECTION 5: SECURITY INFO */}
      <div className="card" style={{ padding: 24, background: "#FFFBEB", border: "1px solid #FCD34D" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <Shield style={{ width: 22, color: "#D97706" }} />
          <h2 style={{ fontSize: 17, fontWeight: 700, color: "#92400E", margin: 0 }}>Sécurité & Conformité</h2>
        </div>
        <ul style={{ fontSize: 13, color: "#92400E", paddingLeft: 20, lineHeight: 2, margin: 0 }}>
          <li>Les clés secrètes Supabase ne doivent jamais apparaître dans le code client.</li>
          <li>Les politiques RLS sont actives sur toutes les tables de données sensibles.</li>
          <li>Les informations bancaires des clients ne sont jamais stockées dans la base de données.</li>
          <li>Toutes les modifications dans cet espace sont enregistrées dans le journal d'activité administrateur.</li>
          <li>Le rôle admin est vérifié côté serveur (Server Components + Middleware) à chaque requête.</li>
        </ul>
      </div>
    </div>
  );
}
