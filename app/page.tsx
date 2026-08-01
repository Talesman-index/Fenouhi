"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getPublicProducts } from "@/lib/supabase/catalog";
import type { Product } from "@/types/catalog";
import { Sparkles, ArrowRight, Search, Zap, DollarSign, Truck } from "lucide-react";

export default function HomePage() {
  const [searchUrl, setSearchUrl] = useState("");
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadHomeProducts() {
      try {
        const [featured, recent] = await Promise.all([
          getPublicProducts({ isFeatured: true, limit: 5 }),
          getPublicProducts({ limit: 10 })
        ]);
        setFeaturedProducts(featured);
        setRecentProducts(recent);
      } catch {}
    }
    loadHomeProducts();
  }, []);

  const categories = [
    { name: "Electronics", img: "/images/assets/item_3.jpg", link: "/catalog?cat=electronics" },
    { name: "Fashion", img: "/images/assets/item_6.jpg", link: "/catalog?cat=fashion" },
    { name: "Liquors & Bags", img: "/images/assets/hero_bag.png", link: "/catalog?cat=wholesale" },
    { name: "Home Decor", img: "/images/assets/item_1.jpg", link: "/catalog?cat=appliances" },
    { name: "Health & Beauty", img: "/images/assets/item_5.jpg", link: "/catalog?cat=beauty" },
    { name: "Groceries & Agro", img: "/images/assets/hero_agro.png", link: "/catalog?cat=agro" },
    { name: "Sneakers & Tools", img: "/images/assets/item_4.jpg", link: "/catalog?cat=machinery" },
  ];

  const todayDeals = [
    { id: "1", title: "Montre Connectée SmartFit Pro X GPS", price: "3 500 FCFA", oldPrice: "5 500 FCFA", image: "/images/assets/item_1.jpg" },
    { id: "2", title: "Écouteurs Bluetooth ANC SoundBass Pro", price: "2 200 FCFA", oldPrice: "4 000 FCFA", image: "/images/assets/item_2.jpg" },
    { id: "3", title: "Casque Audio Over-Ear Wireless Hi-Fi", price: "4 500 FCFA", oldPrice: "7 000 FCFA", image: "/images/assets/item_3.jpg" },
    { id: "4", title: "Coffret Montres & Bijoux Luxury 24k", price: "1 800 FCFA", oldPrice: "3 000 FCFA", image: "/images/assets/item_7.jpg" },
    { id: "5", title: "Baskets Urban High-Top Sneaker Pro", price: "2 800 FCFA", oldPrice: "4 500 FCFA", image: "/images/assets/item_4.jpg" },
  ];

  const fashionProducts = [
    { id: "6", title: "T-Shirt Graphic Streetwear Red Edition", price: "1 200 FCFA", oldPrice: "2 000 FCFA", image: "/images/assets/item_6.jpg" },
    { id: "7", title: "Sac de Voyage & Maroquinerie Luxe", price: "3 400 FCFA", oldPrice: "5 000 FCFA", image: "/images/assets/hero_bag.png" },
    { id: "8", title: "T-Shirt Workwear Vintage Impermeable", price: "3 200 FCFA", oldPrice: "5 000 FCFA", image: "/images/assets/item_8.jpg" },
    { id: "9", title: "Sacoches & Trousses Waterproof Voyage", price: "750 FCFA", oldPrice: "1 400 FCFA", image: "/images/assets/item_9.jpg" },
    { id: "10", title: "Parka Rembourrée Capuche Fourrure", price: "4 800 FCFA", oldPrice: "7 500 FCFA", image: "/images/assets/item_10.jpg" },
  ];

  const laptopsShowcase = [
    { title: "Smartphones", img: "/images/assets/hero_iphone16.png", link: "/catalog?cat=electronics" },
    { title: "Écouteurs TWS", img: "/images/assets/item_2.jpg", link: "/catalog?cat=electronics" },
    { title: "Samsung Galaxy", img: "/images/assets/hero_samsung.png", link: "/catalog?cat=electronics" },
    { title: "Smartwatch", img: "/images/assets/item_1.jpg", link: "/catalog?cat=electronics" },
    { title: "Casques Hi-Fi", img: "/images/assets/item_3.jpg", link: "/catalog?cat=electronics" },
  ];

  const samplePrompts = [
    "1688.com/offer/67891234.html",
    "200 Casques Bluetooth ANC TWS",
    "50 Sacs à main Cuir Véritable",
    "Lot Baskets Running Sport"
  ];

  return (
    <div style={{ background: "#F8FAFC", paddingBottom: 60 }}>
      {/* HERO BANNERS SECTION */}
      <section className="hero-banners-section" style={{ padding: "20px 0" }}>
        <div className="container">
          <div className="hero-banners-grid">
            {/* MAIN HERO BANNER */}
            <div className="hero-banner-main">
              <div className="hero-banner-main-content">
                <span className="badge" style={{ background: "var(--orange-light)", color: "var(--orange-hover)", marginBottom: 12 }}>
                  ⚡ IMPORTATION DIRECTE CHINE → AFRIQUE
                </span>
                <h1 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 900, lineHeight: 1.15, marginBottom: 12, color: "#FFF" }}>
                  Achetez en Usine.<br />Faites-vous Livrer en Afrique.
                </h1>
                <p style={{ fontSize: 14, color: "#CBD5E1", marginBottom: 24, lineHeight: 1.5 }}>
                  Commandez sur 1688, Taobao, Alibaba ou parmi notre catalogue d'usines vérifiées. Devis transparents et fret sécurisé.
                </p>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <Link href="/quote-request" className="btn btn-orange">
                    Demander un Devis <ArrowRight style={{ width: 16 }} />
                  </Link>
                  <Link href="/catalog" className="btn btn-primary" style={{ background: "rgba(255,255,255,0.15)" }}>
                    Parcourir le Catalogue
                  </Link>
                </div>
              </div>
              <img className="hero-banner-main-img" src="/images/assets/hero_box.png" alt="CargoLink Box" />
            </div>

            {/* SIDE BANNER */}
            <div className="hero-banner-side">
              <div className="hero-banner-side-content">
                <span className="hero-side-badge">
                  ✈ SUIVI GPS LOGISTIQUE
                </span>
                <h2 className="hero-side-title">
                  Vol Direct<br />Guangzhou ➔ Cotonou
                </h2>
                <p className="hero-side-desc">
                  Livraison Aérienne Express<br />5 à 10 jours ouvrés.
                </p>
              </div>
              <Link href="/dashboard" className="hero-side-cta">
                Suivre mon colis <span>→</span>
              </Link>
              <img className="hero-banner-side-img" src="/images/assets/hero_samsung.png" alt="Samsung S24" />
            </div>
          </div>
        </div>
      </section>

      {/* POPULAR CATEGORIES */}
      <section style={{ padding: "20px 0 30px" }}>
        <div className="container">
          <div className="section-title-row">
            <h2 className="section-title">Explore Popular Categories</h2>
            <Link href="/catalog" className="view-all-link">Voir tout &gt;</Link>
          </div>

          <div className="categories-circle-row">
            {categories.map((c, idx) => (
              <Link key={idx} href={c.link} className="category-circle-card">
                <div className="category-circle-box">
                  <img src={c.img} alt="" />
                </div>
                <div className="category-circle-name">{c.name}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TODAY'S BEST DEALS */}
      <section style={{ padding: "20px 0 30px" }}>
        <div className="container">
          <div className="section-title-row">
            <h2 className="section-title">Nouveautés & Offres Direct Usine</h2>
            <Link href="/catalog" className="view-all-link">Voir tout &gt;</Link>
          </div>

          <div className="grid-5">
            {featuredProducts.map((p) => {
              const img = p.images?.[0]?.public_image_url || "/images/assets/item_1.jpg";
              return (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  title={p.name}
                  price={`${p.price.toLocaleString()} ${p.currency}`}
                  image={img}
                  category={p.category?.name || "Général"}
                  isDemo={p.is_demo}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* STYLE & FASHION SECTION */}
      <section style={{ padding: "20px 0 30px" }}>
        <div className="container">
          <div className="section-title-row">
            <h2 className="section-title">Sélection Catalogue Produits</h2>
            <Link href="/catalog" className="view-all-link">Voir le catalogue complet &gt;</Link>
          </div>

          <div className="grid-5">
            {recentProducts.slice(5, 10).map((p) => {
              const img = p.images?.[0]?.public_image_url || "/images/assets/item_1.jpg";
              return (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  title={p.name}
                  price={`${p.price.toLocaleString()} ${p.currency}`}
                  image={img}
                  category={p.category?.name || "Général"}
                  isDemo={p.is_demo}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* ELECTRONICS SHOWCASE BANNER CONTAINER */}
      <section style={{ padding: "20px 0 40px" }}>
        <div className="container">
          <div style={{ background: "#F1F5F9", borderRadius: 24, padding: "28px 24px", border: "1px solid #E2E8F0" }}>
            <div className="section-title-row" style={{ marginBottom: 20 }}>
              <h2 className="section-title" style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#0F172A" }}>
                High-Tech & Electronics Usines
              </h2>
              <Link href="/catalog?cat=electronics" className="view-all-link" style={{ fontWeight: 800, color: "#165491" }}>
                View All &gt;
              </Link>
            </div>

            <div className="grid-5">
              {laptopsShowcase.map((item, idx) => (
                <Link 
                  key={idx} 
                  href={item.link}
                  style={{
                    background: "#FFFFFF",
                    borderRadius: 16,
                    padding: 16,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "space-between",
                    minHeight: 180,
                    textDecoration: "none",
                    boxShadow: "0 4px 12px rgba(15, 23, 42, 0.04)",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease"
                  }}
                >
                  <div style={{ height: 110, width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <img src={item.img} alt={item.title} style={{ maxHeight: 95, maxWidth: "100%", objectFit: "contain" }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 800, color: "#0F172A", marginTop: 10, textAlign: "center" }}>{item.title}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CARGOLINK AI SOURCING HERO CARD (FULLY RESPONSIVE DESIGN) */}
      <section className="container" style={{ margin: "30px auto 50px" }}>
        <div className="cargolink-ai-card">
          
          {/* AMBIENT GLOW EFFECTS */}
          <div style={{ position: "absolute", top: -80, left: "30%", width: 300, height: 300, background: "rgba(56, 189, 248, 0.15)", filter: "blur(90px)", borderRadius: "50%", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -80, right: "20%", width: 260, height: 260, background: "rgba(249, 115, 22, 0.12)", filter: "blur(90px)", borderRadius: "50%", pointerEvents: "none" }} />

          {/* AI BADGE */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(56, 189, 248, 0.12)", border: "1px solid rgba(56, 189, 248, 0.3)", borderRadius: 9999, padding: "6px 14px", color: "#38BDF8", fontSize: 11.5, fontWeight: 900, letterSpacing: "0.5px", marginBottom: 16, maxWidth: "100%", boxSizing: "border-box" }}>
            <Sparkles style={{ width: 14, flexShrink: 0 }} /> <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>IA SOURCING CHINE — 1688 / TAOBAO / ALIBABA</span>
          </div>

          {/* HEADLINE */}
          <h2 style={{ fontSize: "clamp(22px, 4vw, 36px)", fontWeight: 900, color: "#FFFFFF", marginBottom: 12, lineHeight: 1.2, letterSpacing: "-0.5px" }}>
            Trouvez N'importe Quel Produit Direct Usine Chine
          </h2>
          <p style={{ fontSize: 13.5, color: "#94A3B8", maxWidth: 640, margin: "0 auto 24px", lineHeight: 1.6 }}>
            Collez un lien <strong style={{ color: "#FFF" }}>1688, Taobao ou Alibaba</strong> ou décrivez votre besoin. Notre algorithme IA identifie l'usine la moins chère et calcule votre devis rendu Afrique.
          </p>

          {/* FLOATING SEARCH INPUT BAR (RESPONSIVE STACK ON MOBILE) */}
          <div className="cargolink-ai-search-box">
            <div className="cargolink-ai-search-box-input-wrap" style={{ display: "flex", alignItems: "center", flex: 1, gap: 8, paddingLeft: 8 }}>
              <span style={{ color: "#38BDF8", display: "flex", alignItems: "center" }}>
                <Sparkles style={{ width: 18 }} />
              </span>
              <input
                type="text"
                value={searchUrl}
                onChange={(e) => setSearchUrl(e.target.value)}
                placeholder="Collez un lien 1688 / Taobao ou décrivez votre produit..."
                style={{ width: "100%", border: "none", outline: "none", fontSize: 13.5, fontWeight: 600, color: "#0F172A", background: "transparent" }}
              />
            </div>
            <Link 
              href={`/quote-request?url=${encodeURIComponent(searchUrl)}`}
              className="btn btn-orange cargolink-ai-search-btn"
              style={{ borderRadius: 9999, padding: "12px 24px", fontSize: 13.5, fontWeight: 900, display: "inline-flex", alignItems: "center", gap: 8, background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)", boxShadow: "0 6px 20px rgba(249,115,22,0.35)", whiteSpace: "nowrap" }}
            >
              <Search style={{ width: 16 }} /> Trouver l'Usine <ArrowRight style={{ width: 16 }} />
            </Link>
          </div>

          {/* SAMPLE SUGGESTION CHIPS */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, flexWrap: "wrap", marginTop: 18 }}>
            <span style={{ fontSize: 11, color: "#64748B", fontWeight: 700, width: "100%", marginBottom: 4 }}>Exemples :</span>
            {samplePrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => setSearchUrl(prompt)}
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: 9999,
                  padding: "4px 10px",
                  color: "#CBD5E1",
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* 3 REASSURANCE FEATURE PILLS (RESPONSIVE 1-COLUMN ON MOBILE) */}
          <div className="cargolink-ai-features-grid">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: "#E2E8F0", fontSize: 12, fontWeight: 700 }}>
              <Zap style={{ width: 15, color: "#38BDF8", flexShrink: 0 }} /> Scan Instantané 1688 & Taobao
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: "#E2E8F0", fontSize: 12, fontWeight: 700 }}>
              <DollarSign style={{ width: 15, color: "#10B981", flexShrink: 0 }} /> Prix Usine sans Intermédiaire
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: "#E2E8F0", fontSize: 12, fontWeight: 700 }}>
              <Truck style={{ width: 15, color: "#F97316", flexShrink: 0 }} /> Fret & Dédouanement Afrique
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
