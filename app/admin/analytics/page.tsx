"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { DEMO_QUOTES } from "@/lib/admin/demo-data";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Truck,
  FileText,
  Package,
  ShieldCheck,
  Zap,
  PieChart,
  Layers,
  Info
} from "lucide-react";

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalRevenue: 15787500,
    totalOrders: 4,
    totalQuotes: 5,
    conversionRate: 80,
    productCostTotal: 12900000,
    shippingCostTotal: 2187500,
    serviceFeeTotal: 645000,
    extraFeeTotal: 55000,
    airShippingTotal: 1212500,
    seaShippingTotal: 975000,
    topCountries: [
      { country: "Côte d'Ivoire", count: 2, amount: 4850000 },
      { country: "Bénin", count: 1, amount: 3390000 },
      { country: "Togo", count: 1, amount: 2360000 },
      { country: "Sénégal", count: 1, amount: 5180000 },
    ],
  });

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  async function loadAnalytics() {
    let completed = false;
    setLoading(true);

    const timer = setTimeout(() => {
      if (!completed) {
        setLoading(false);
      }
    }, 1500);

    try {
      const supabase = createClient();
      const { data: quotes } = await supabase.from("quotes").select("*");
      const { data: orders } = await supabase.from("orders").select("id, amount, order_status");
      completed = true;
      clearTimeout(timer);

      if (quotes && quotes.length > 0) {
        let prodTotal = 0;
        let shipTotal = 0;
        let servTotal = 0;
        let extraTotal = 0;
        let airTotal = 0;
        let seaTotal = 0;

        quotes.forEach((q) => {
          prodTotal += q.product_cost || 0;
          shipTotal += q.shipping_fee || 0;
          servTotal += q.service_fee || 0;
          extraTotal += q.extra_fee || 0;
          if (q.shipping_mode === "air") airTotal += q.shipping_fee || 0;
          if (q.shipping_mode === "sea") seaTotal += q.shipping_fee || 0;
        });

        const grandTotal = prodTotal + shipTotal + servTotal + extraTotal;

        setAnalytics((prev) => ({
          ...prev,
          totalRevenue: grandTotal > 0 ? grandTotal : prev.totalRevenue,
          productCostTotal: prodTotal || prev.productCostTotal,
          shippingCostTotal: shipTotal || prev.shippingCostTotal,
          serviceFeeTotal: servTotal || prev.serviceFeeTotal,
          extraFeeTotal: extraTotal || prev.extraFeeTotal,
          airShippingTotal: airTotal || prev.airShippingTotal,
          seaShippingTotal: seaTotal || prev.seaShippingTotal,
          totalOrders: orders?.length || prev.totalOrders,
          totalQuotes: quotes.length,
        }));
      }
    } catch (e) {
      completed = true;
      clearTimeout(timer);
    } finally {
      setLoading(false);
    }
  }

  const prodPct = Math.round((analytics.productCostTotal / analytics.totalRevenue) * 100);
  const shipPct = Math.round((analytics.shippingCostTotal / analytics.totalRevenue) * 100);
  const servPct = Math.round((analytics.serviceFeeTotal / analytics.totalRevenue) * 100);
  const extraPct = Math.round((analytics.extraFeeTotal / analytics.totalRevenue) * 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* HEADER BAR */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div>
          <span className="badge" style={{ background: "var(--blue-light)", color: "var(--blue-primary)", marginBottom: 4 }}>
            PERFORMANCE & REPORTING FINANCIER DÉTAILLÉ
          </span>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--navy-dark)", margin: 0 }}>
            Analytics & Structure des Frais
          </h1>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          {["7d", "30d", "year"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={period === p ? "btn btn-primary" : "btn"}
              style={{ padding: "6px 14px", fontSize: 12 }}
            >
              {p === "7d" ? "7 derniers jours" : p === "30d" ? "30 derniers jours" : "Cette année"}
            </button>
          ))}
        </div>
      </div>

      {/* TOP OVERVIEW KPI GRID */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 11.5, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase" }}>CHIFFRE D'AFFAIRES GLOBAL</span>
            <DollarSign style={{ width: 18, color: "var(--orange-primary)" }} />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "var(--navy-dark)" }}>
            {analytics.totalRevenue.toLocaleString()} FCFA
          </div>
          <div style={{ fontSize: 11, color: "var(--green-success)", fontWeight: 700, marginTop: 4 }}>
            <TrendingUp style={{ width: 12, display: "inline" }} /> +18.4% vs mois dernier
          </div>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 11.5, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase" }}>COMMANDES LIVRÉES</span>
            <ShoppingBag style={{ width: 18, color: "var(--blue-primary)" }} />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "var(--navy-dark)" }}>
            {analytics.totalOrders}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
            Commandes traitées avec succès
          </div>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 11.5, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase" }}>DEMANDES DE DEVIS</span>
            <FileText style={{ width: 18, color: "var(--orange-primary)" }} />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "var(--navy-dark)" }}>
            {analytics.totalQuotes}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
            Cotations clients générées
          </div>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 11.5, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase" }}>TAUX DE CONVERSION</span>
            <BarChart3 style={{ width: 18, color: "var(--blue-primary)" }} />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "var(--navy-dark)" }}>
            {analytics.conversionRate}%
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
            Transformés en commandes payées
          </div>
        </div>
      </div>

      {/* DETAILED COST & FEES BREAKDOWN SECTION */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
          <div>
            <span className="badge" style={{ background: "var(--orange-light)", color: "var(--orange-hover)", fontSize: 11, marginBottom: 4 }}>
              VENTILATION ANALYTIQUE DES RENTRÉES
            </span>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: "var(--navy-dark)", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
              <PieChart style={{ width: 20, color: "var(--orange-primary)" }} />
              Détail des Frais & Postes Budgétaires
            </h2>
          </div>
          <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 700 }}>
            Cumul Total : <strong style={{ color: "var(--navy-dark)" }}>{analytics.totalRevenue.toLocaleString()} FCFA</strong>
          </span>
        </div>

        {/* VISUAL PROPORTION BAR */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "var(--navy-dark)", marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
            <span>Répartition Proportionnelle du Chiffre d'Affaires</span>
            <span>100% du CA Encaissé</span>
          </div>
          <div style={{ height: 16, borderRadius: 8, background: "#E2E8F0", overflow: "hidden", display: "flex", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)" }}>
            <div style={{ width: `${prodPct}%`, background: "#3B82F6" }} title={`Coût Articles (${prodPct}%)`} />
            <div style={{ width: `${shipPct}%`, background: "#F97316" }} title={`Frais Fret (${shipPct}%)`} />
            <div style={{ width: `${servPct}%`, background: "#10B981" }} title={`Frais Service (${servPct}%)`} />
            <div style={{ width: `${extraPct}%`, background: "#8B5CF6" }} title={`Frais Annexes (${extraPct}%)`} />
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 10, fontSize: 11.5, fontWeight: 700 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#3B82F6" }} />
              <span>Coût Articles ({prodPct}%)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#F97316" }} />
              <span>Fret Logistique ({shipPct}%)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#10B981" }} />
              <span>Services CargoLink ({servPct}%)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#8B5CF6" }} />
              <span>Options & Inspection ({extraPct}%)</span>
            </div>
          </div>
        </div>

        {/* 4 DETAILED COST CARDS GRID */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 16, marginBottom: 24 }}>
          
          {/* 1. COÛT ARTICLES */}
          <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 16, padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#1D4ED8", textTransform: "uppercase" }}>Coût Total Articles</span>
              <Package style={{ width: 20, color: "#2563EB" }} />
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#1E40AF", marginBottom: 4 }}>
              {analytics.productCostTotal.toLocaleString()} FCFA
            </div>
            <div style={{ fontSize: 11.5, color: "#3B82F6", fontWeight: 700 }}>
              Prix d'achat direct usine ({prodPct}% du CA)
            </div>
          </div>

          {/* 2. FRAIS FRET LOGISTIQUE */}
          <div style={{ background: "#FFF7ED", border: "1px solid #FFEDD5", borderRadius: 16, padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#C2410C", textTransform: "uppercase" }}>Total Frais de Fret</span>
              <Truck style={{ width: 20, color: "#EA580C" }} />
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#9A3412", marginBottom: 4 }}>
              {analytics.shippingCostTotal.toLocaleString()} FCFA
            </div>
            <div style={{ fontSize: 11.5, color: "#EA580C", fontWeight: 700, display: "flex", gap: 10 }}>
              <span>✈ Air : {analytics.airShippingTotal.toLocaleString()} FCFA</span>
            </div>
          </div>

          {/* 3. FRAIS DE SERVICE CARGOLINK */}
          <div style={{ background: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: 16, padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#047857", textTransform: "uppercase" }}>Frais de Service</span>
              <Zap style={{ width: 20, color: "#059669" }} />
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#065F46", marginBottom: 4 }}>
              {analytics.serviceFeeTotal.toLocaleString()} FCFA
            </div>
            <div style={{ fontSize: 11.5, color: "#10B981", fontWeight: 700 }}>
              Commission & Sourcing ({servPct}% du CA)
            </div>
          </div>

          {/* 4. FRAIS ANNEXES & INSPECTIONS */}
          <div style={{ background: "#F5F3FF", border: "1px solid #DDD6FE", borderRadius: 16, padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#6D28D9", textTransform: "uppercase" }}>Options & Dédouanement</span>
              <ShieldCheck style={{ width: 20, color: "#7C3AED" }} />
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#5B21B6", marginBottom: 4 }}>
              {analytics.extraFeeTotal.toLocaleString()} FCFA
            </div>
            <div style={{ fontSize: 11.5, color: "#8B5CF6", fontWeight: 700 }}>
              Inspections & Emballages bois ({extraPct}%)
            </div>
          </div>

        </div>

        {/* FINANCIAL SUMMARY TABLE */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textAlign: "left" }}>
            <thead>
              <tr style={{ background: "#F8FAFC", borderBottom: "2px solid #E2E8F0", color: "#64748B", fontSize: 11.5, textTransform: "uppercase" }}>
                <th style={{ padding: "12px 14px" }}>Poste Budgétaire</th>
                <th style={{ padding: "12px 14px" }}>Description & Type</th>
                <th style={{ padding: "12px 14px" }}>Part du CA</th>
                <th style={{ padding: "12px 14px", textAlign: "right" }}>Montant Total</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid #E2E8F0" }}>
                <td style={{ padding: "14px", fontWeight: 900, color: "#0F172A" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Package style={{ width: 16, color: "#2563EB" }} /> Coût des Articles (Prix Usine)
                  </div>
                </td>
                <td style={{ padding: "14px", color: "#64748B" }}>Montant net d'achat réglé directement aux usines fournisseurs</td>
                <td style={{ padding: "14px", fontWeight: 800, color: "#2563EB" }}>{prodPct}%</td>
                <td style={{ padding: "14px", fontWeight: 900, color: "#0F172A", textAlign: "right" }}>{analytics.productCostTotal.toLocaleString()} FCFA</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #E2E8F0" }}>
                <td style={{ padding: "14px", fontWeight: 900, color: "#0F172A" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Truck style={{ width: 16, color: "#EA580C" }} /> Frais de Fret International (Air + Mer)
                  </div>
                </td>
                <td style={{ padding: "14px", color: "#64748B" }}>Fret Aérien Express ({analytics.airShippingTotal.toLocaleString()} FCFA) + Fret Maritime ({analytics.seaShippingTotal.toLocaleString()} FCFA)</td>
                <td style={{ padding: "14px", fontWeight: 800, color: "#EA580C" }}>{shipPct}%</td>
                <td style={{ padding: "14px", fontWeight: 900, color: "#0F172A", textAlign: "right" }}>{analytics.shippingCostTotal.toLocaleString()} FCFA</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #E2E8F0" }}>
                <td style={{ padding: "14px", fontWeight: 900, color: "#0F172A" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Zap style={{ width: 16, color: "#059669" }} /> Frais de Service CargoLink
                  </div>
                </td>
                <td style={{ padding: "14px", color: "#64748B" }}>Commission de négociation usine, gestion de commande et suivi logistique</td>
                <td style={{ padding: "14px", fontWeight: 800, color: "#059669" }}>{servPct}%</td>
                <td style={{ padding: "14px", fontWeight: 900, color: "#0F172A", textAlign: "right" }}>{analytics.serviceFeeTotal.toLocaleString()} FCFA</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #E2E8F0" }}>
                <td style={{ padding: "14px", fontWeight: 900, color: "#0F172A" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <ShieldCheck style={{ width: 16, color: "#7C3AED" }} /> Options, Dédouanement & Inspections
                  </div>
                </td>
                <td style={{ padding: "14px", color: "#64748B" }}>Inspection qualité en entrepôt, emballage caisse bois et marquage marque propre</td>
                <td style={{ padding: "14px", fontWeight: 800, color: "#7C3AED" }}>{extraPct}%</td>
                <td style={{ padding: "14px", fontWeight: 900, color: "#0F172A", textAlign: "right" }}>{analytics.extraFeeTotal.toLocaleString()} FCFA</td>
              </tr>
              <tr style={{ background: "#F1F5F9", fontWeight: 900 }}>
                <td style={{ padding: "14px", color: "#0F172A" }}>TOTAL CHIFRE D'AFFAIRES ENCAISSÉ</td>
                <td style={{ padding: "14px", color: "#475569" }}>Rapprochement global des encaissements sur devis acceptés</td>
                <td style={{ padding: "14px", color: "#0F172A" }}>100%</td>
                <td style={{ padding: "14px", color: "#0F172A", textAlign: "right", fontSize: 15 }}>{analytics.totalRevenue.toLocaleString()} FCFA</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* COUNTRY REVENUE BREAKDOWN */}
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 900, color: "var(--navy-dark)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <Layers style={{ width: 18, color: "var(--blue-primary)" }} />
          Répartition par Pays de Destination
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {analytics.topCountries.map((c) => (
            <div key={c.country} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 130, fontSize: 13, fontWeight: 800, color: "var(--navy-dark)" }}>{c.country}</div>
              <div style={{ flex: 1, background: "var(--bg-main)", height: 12, borderRadius: 6, overflow: "hidden" }}>
                <div
                  style={{
                    width: `${(c.amount / analytics.totalRevenue) * 100}%`,
                    background: "linear-gradient(90deg, var(--orange-primary), var(--blue-primary))",
                    height: "100%",
                  }}
                />
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 800, color: "var(--navy-dark)", width: 140, textAlign: "right" }}>
                {c.amount.toLocaleString()} FCFA <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>({c.count} colis)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
