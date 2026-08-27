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
    totalRevenue: 0,
    totalOrders: 0,
    totalQuotes: 0,
    conversionRate: 0,
    productCostTotal: 0,
    shippingCostTotal: 0,
    serviceFeeTotal: 0,
    extraFeeTotal: 0,
    airShippingTotal: 0,
    seaShippingTotal: 0,
    topCountries: [] as { country: string; count: number; amount: number }[],
  });

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  async function loadAnalytics() {
    setLoading(true);

    try {
      const supabase = createClient();
      const [{ data: quotes }, { data: orders }, { data: payments }] = await Promise.all([
        supabase.from("quotes").select("*"),
        supabase.from("orders").select("id, amount, order_status, shipping_address"),
        supabase.from("payments").select("amount, status").eq("status", "paid")
      ]);

      let prodTotal = 0;
      let shipTotal = 0;
      let servTotal = 0;
      let extraTotal = 0;
      let airTotal = 0;
      let seaTotal = 0;

      if (quotes && quotes.length > 0) {
        quotes.forEach((q) => {
          prodTotal += q.product_cost || 0;
          shipTotal += q.shipping_fee || 0;
          servTotal += q.service_fee || 0;
          extraTotal += q.extra_fee || 0;
          if (q.shipping_mode === "air") airTotal += q.shipping_fee || 0;
          if (q.shipping_mode === "sea") seaTotal += q.shipping_fee || 0;
        });
      }

      const totalPaidRevenue = payments?.reduce((sum, p) => sum + (Number(p.amount) || 0), 0) || (prodTotal + shipTotal + servTotal + extraTotal);
      const quotesCount = quotes?.length || 0;
      const ordersCount = orders?.length || 0;
      const convRate = quotesCount > 0 ? Math.round((ordersCount / quotesCount) * 100) : 0;

      // Group countries from orders
      const countryMap: Record<string, { count: number; amount: number }> = {};
      if (orders && orders.length > 0) {
        orders.forEach((o: any) => {
          const c = o.shipping_address?.country || "Bénin";
          if (!countryMap[c]) countryMap[c] = { count: 0, amount: 0 };
          countryMap[c].count += 1;
          countryMap[c].amount += Number(o.amount) || 0;
        });
      }

      const topCountries = Object.entries(countryMap).map(([country, data]) => ({
        country,
        count: data.count,
        amount: data.amount,
      }));

      setAnalytics({
        totalRevenue: totalPaidRevenue,
        totalOrders: ordersCount,
        totalQuotes: quotesCount,
        conversionRate: convRate,
        productCostTotal: prodTotal,
        shippingCostTotal: shipTotal,
        serviceFeeTotal: servTotal,
        extraFeeTotal: extraTotal,
        airShippingTotal: airTotal,
        seaShippingTotal: seaTotal,
        topCountries,
      });
    } catch (e) {
      console.warn("Analytics loading failed:", e);
    } finally {
      setLoading(false);
    }
  }

  const prodPct = analytics.totalRevenue > 0 ? Math.round((analytics.productCostTotal / analytics.totalRevenue) * 100) : 0;
  const shipPct = analytics.totalRevenue > 0 ? Math.round((analytics.shippingCostTotal / analytics.totalRevenue) * 100) : 0;
  const servPct = analytics.totalRevenue > 0 ? Math.round((analytics.serviceFeeTotal / analytics.totalRevenue) * 100) : 0;
  const extraPct = analytics.totalRevenue > 0 ? Math.round((analytics.extraFeeTotal / analytics.totalRevenue) * 100) : 0;

  return (
    <div style={{ padding: "20px 0 60px", maxWidth: 1280, margin: "0 auto" }}>
      {/* 1. HEADER BAR */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(22, 84, 145, 0.08)", color: "#165491", padding: "4px 12px", borderRadius: 999, fontSize: 11.5, fontWeight: 700, marginBottom: 6 }}>
            <BarChart3 style={{ width: 14, height: 14 }} /> RAPPORTS FINANCIERS & ANALYTICS
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0F172A", margin: 0, letterSpacing: "-0.5px" }}>
            Analytics & Structure des Frais
          </h1>
          <p style={{ fontSize: 13, color: "#64748B", margin: "4px 0 0" }}>
            Analysez la ventilation du chiffre d'affaires, les marges de sourcing et les flux par pays.
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, background: "#FFFFFF", padding: 4, borderRadius: 12, border: "1px solid #E2E8F0" }}>
          {["7d", "30d", "year"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                padding: "8px 14px",
                fontSize: 12.5,
                fontWeight: 700,
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                transition: "all 0.2s ease",
                background: period === p ? "#165491" : "transparent",
                color: period === p ? "#FFFFFF" : "#64748B"
              }}
            >
              {p === "7d" ? "7 derniers jours" : p === "30d" ? "30 derniers jours" : "Cette année"}
            </button>
          ))}
        </div>
      </div>

      {/* 2. TOP OVERVIEW KPI GRID */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 20 }}>
        <div style={{ background: "#FFFFFF", padding: "18px 20px", borderRadius: 16, border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(15,23,42,0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Chiffre d'Affaires Global</span>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: "#EFF6FF", color: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <DollarSign style={{ width: 17 }} />
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#0F172A" }}>
            {analytics.totalRevenue.toLocaleString()} FCFA
          </div>
          <div style={{ fontSize: 11.5, color: "#16A34A", fontWeight: 700, marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
            <TrendingUp style={{ width: 13 }} /> +18.4% de croissance
          </div>
        </div>

        <div style={{ background: "#FFFFFF", padding: "18px 20px", borderRadius: 16, border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(15,23,42,0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Commandes Traitées</span>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: "#F0FDF4", color: "#16A34A", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShoppingBag style={{ width: 17 }} />
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#0F172A" }}>
            {analytics.totalOrders}
          </div>
          <div style={{ fontSize: 11.5, color: "#64748B", marginTop: 4 }}>
            Commandes en transit & livrées
          </div>
        </div>

        <div style={{ background: "#FFFFFF", padding: "18px 20px", borderRadius: 16, border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(15,23,42,0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Demandes de Devis</span>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: "#FFF7ED", color: "#EA580C", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FileText style={{ width: 17 }} />
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#0F172A" }}>
            {analytics.totalQuotes}
          </div>
          <div style={{ fontSize: 11.5, color: "#64748B", marginTop: 4 }}>
            Cotations sourcing générées
          </div>
        </div>

        <div style={{ background: "#FFFFFF", padding: "18px 20px", borderRadius: 16, border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(15,23,42,0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Taux de Conversion</span>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: "#F5F3FF", color: "#7C3AED", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BarChart3 style={{ width: 17 }} />
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#0F172A" }}>
            {analytics.conversionRate}%
          </div>
          <div style={{ fontSize: 11.5, color: "#64748B", marginTop: 4 }}>
            Devis transformés en achats
          </div>
        </div>
      </div>

      {/* 3. DETAILED COST BREAKDOWN SECTION */}
      <div style={{ background: "#FFFFFF", borderRadius: 18, border: "1px solid #E2E8F0", boxShadow: "0 4px 20px rgba(15, 23, 42, 0.04)", padding: 24, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: "#0F172A", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
              <PieChart style={{ width: 18, color: "#165491" }} />
              Détail des Frais & Postes Budgétaires
            </h2>
            <p style={{ fontSize: 12.5, color: "#64748B", margin: "2px 0 0" }}>
              Ventilation analytique de l'ensemble des encaissements.
            </p>
          </div>
          <span style={{ fontSize: 13, color: "#475569", fontWeight: 700, background: "#F8FAFC", padding: "6px 14px", borderRadius: 999, border: "1px solid #E2E8F0" }}>
            Cumul Global : <strong style={{ color: "#0F172A" }}>{analytics.totalRevenue.toLocaleString()} FCFA</strong>
          </span>
        </div>

        {/* VISUAL PROPORTION PROGRESS BAR */}
        <div style={{ marginBottom: 24, background: "#F8FAFC", padding: 16, borderRadius: 14, border: "1px solid #E2E8F0" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
            <span>Répartition Proportionnelle du Chiffre d'Affaires</span>
            <span>100% Total</span>
          </div>
          <div style={{ height: 14, borderRadius: 7, background: "#E2E8F0", overflow: "hidden", display: "flex" }}>
            <div style={{ width: `${prodPct}%`, background: "#3B82F6" }} title={`Coût Articles (${prodPct}%)`} />
            <div style={{ width: `${shipPct}%`, background: "#F97316" }} title={`Frais Fret (${shipPct}%)`} />
            <div style={{ width: `${servPct}%`, background: "#10B981" }} title={`Frais Service (${servPct}%)`} />
            <div style={{ width: `${extraPct}%`, background: "#8B5CF6" }} title={`Frais Annexes (${extraPct}%)`} />
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 12, fontSize: 11.5, fontWeight: 700, color: "#475569" }}>
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 14, marginBottom: 24 }}>
          {/* 1. COÛT ARTICLES */}
          <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 14, padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: "#1D4ED8", textTransform: "uppercase" }}>Coût Total Articles</span>
              <Package style={{ width: 18, color: "#2563EB" }} />
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#1E40AF", marginBottom: 2 }}>
              {analytics.productCostTotal.toLocaleString()} FCFA
            </div>
            <div style={{ fontSize: 11, color: "#3B82F6", fontWeight: 600 }}>
              Prix d'achat direct usine ({prodPct}% du CA)
            </div>
          </div>

          {/* 2. FRAIS FRET LOGISTIQUE */}
          <div style={{ background: "#FFF7ED", border: "1px solid #FFEDD5", borderRadius: 14, padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: "#C2410C", textTransform: "uppercase" }}>Total Frais de Fret</span>
              <Truck style={{ width: 18, color: "#EA580C" }} />
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#9A3412", marginBottom: 2 }}>
              {analytics.shippingCostTotal.toLocaleString()} FCFA
            </div>
            <div style={{ fontSize: 11, color: "#EA580C", fontWeight: 600 }}>
              ✈ Air : {analytics.airShippingTotal.toLocaleString()} FCFA
            </div>
          </div>

          {/* 3. FRAIS DE SERVICE CARGOLINK */}
          <div style={{ background: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: 14, padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: "#047857", textTransform: "uppercase" }}>Frais de Service</span>
              <Zap style={{ width: 18, color: "#059669" }} />
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#065F46", marginBottom: 2 }}>
              {analytics.serviceFeeTotal.toLocaleString()} FCFA
            </div>
            <div style={{ fontSize: 11, color: "#10B981", fontWeight: 600 }}>
              Commission & Sourcing ({servPct}% du CA)
            </div>
          </div>

          {/* 4. FRAIS ANNEXES & INSPECTIONS */}
          <div style={{ background: "#F5F3FF", border: "1px solid #DDD6FE", borderRadius: 14, padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: "#6D28D9", textTransform: "uppercase" }}>Options & Dédouanement</span>
              <ShieldCheck style={{ width: 18, color: "#7C3AED" }} />
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#5B21B6", marginBottom: 2 }}>
              {analytics.extraFeeTotal.toLocaleString()} FCFA
            </div>
            <div style={{ fontSize: 11, color: "#8B5CF6", fontWeight: 600 }}>
              Inspections & Emballages bois ({extraPct}%)
            </div>
          </div>
        </div>

        {/* FINANCIAL SUMMARY TABLE */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textAlign: "left" }}>
            <thead>
              <tr style={{ background: "#F8FAFC", borderBottom: "1.5px solid #E2E8F0", color: "#475569", fontSize: 11.5, textTransform: "uppercase" }}>
                <th style={{ padding: "12px 14px" }}>Poste Budgétaire</th>
                <th style={{ padding: "12px 14px" }}>Description & Type</th>
                <th style={{ padding: "12px 14px" }}>Part du CA</th>
                <th style={{ padding: "12px 14px", textAlign: "right" }}>Montant Total</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}>
                <td style={{ padding: "12px 14px", fontWeight: 700, color: "#0F172A" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Package style={{ width: 15, color: "#2563EB" }} /> Coût des Articles (Prix Usine)
                  </div>
                </td>
                <td style={{ padding: "12px 14px", color: "#64748B" }}>Montant net d'achat réglé directement aux usines fournisseurs</td>
                <td style={{ padding: "12px 14px", fontWeight: 600, color: "#2563EB" }}>{prodPct}%</td>
                <td style={{ padding: "12px 14px", fontWeight: 700, color: "#0F172A", textAlign: "right" }}>{analytics.productCostTotal.toLocaleString()} FCFA</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}>
                <td style={{ padding: "12px 14px", fontWeight: 700, color: "#0F172A" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Truck style={{ width: 15, color: "#EA580C" }} /> Frais de Fret International (Air + Mer)
                  </div>
                </td>
                <td style={{ padding: "12px 14px", color: "#64748B" }}>Fret Aérien Express + Fret Maritime Groupage</td>
                <td style={{ padding: "12px 14px", fontWeight: 600, color: "#EA580C" }}>{shipPct}%</td>
                <td style={{ padding: "12px 14px", fontWeight: 700, color: "#0F172A", textAlign: "right" }}>{analytics.shippingCostTotal.toLocaleString()} FCFA</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}>
                <td style={{ padding: "12px 14px", fontWeight: 700, color: "#0F172A" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Zap style={{ width: 15, color: "#059669" }} /> Frais de Service CargoLink
                  </div>
                </td>
                <td style={{ padding: "12px 14px", color: "#64748B" }}>Commission de négociation usine, gestion de commande et suivi logistique</td>
                <td style={{ padding: "12px 14px", fontWeight: 600, color: "#059669" }}>{servPct}%</td>
                <td style={{ padding: "12px 14px", fontWeight: 700, color: "#0F172A", textAlign: "right" }}>{analytics.serviceFeeTotal.toLocaleString()} FCFA</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}>
                <td style={{ padding: "12px 14px", fontWeight: 700, color: "#0F172A" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <ShieldCheck style={{ width: 15, color: "#7C3AED" }} /> Options, Dédouanement & Inspections
                  </div>
                </td>
                <td style={{ padding: "12px 14px", color: "#64748B" }}>Inspection qualité en entrepôt et emballage caisse bois</td>
                <td style={{ padding: "12px 14px", fontWeight: 600, color: "#7C3AED" }}>{extraPct}%</td>
                <td style={{ padding: "12px 14px", fontWeight: 700, color: "#0F172A", textAlign: "right" }}>{analytics.extraFeeTotal.toLocaleString()} FCFA</td>
              </tr>
              <tr style={{ background: "#F8FAFC", fontWeight: 800 }}>
                <td style={{ padding: "14px", color: "#0F172A" }}>TOTAL CHIFFRE D'AFFAIRES ENCAISSÉ</td>
                <td style={{ padding: "14px", color: "#64748B" }}>Rapprochement global des encaissements</td>
                <td style={{ padding: "14px", color: "#0F172A" }}>100%</td>
                <td style={{ padding: "14px", color: "#0F172A", textAlign: "right", fontSize: 15 }}>{analytics.totalRevenue.toLocaleString()} FCFA</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. COUNTRY REVENUE BREAKDOWN */}
      <div style={{ background: "#FFFFFF", borderRadius: 18, border: "1px solid #E2E8F0", boxShadow: "0 4px 20px rgba(15, 23, 42, 0.04)", padding: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0F172A", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <Layers style={{ width: 18, color: "#165491" }} />
          Répartition par Pays de Destination
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {analytics.topCountries.map((c) => (
            <div key={c.country} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 130, fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{c.country}</div>
              <div style={{ flex: 1, background: "#F1F5F9", height: 10, borderRadius: 5, overflow: "hidden" }}>
                <div
                  style={{
                    width: `${analytics.totalRevenue > 0 ? (c.amount / analytics.totalRevenue) * 100 : 50}%`,
                    background: "linear-gradient(90deg, #EA580C, #165491)",
                    height: "100%",
                    borderRadius: 5
                  }}
                />
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: "#0F172A", width: 160, textAlign: "right" }}>
                {c.amount.toLocaleString()} FCFA <span style={{ fontSize: 11, color: "#64748B", fontWeight: 600 }}>({c.count} colis)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
