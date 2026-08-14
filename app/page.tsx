"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getPublicProducts } from "@/lib/supabase/catalog";
import type { Product } from "@/types/catalog";
import { Sparkles, ArrowRight, ChevronRight, Search, Zap, DollarSign, Truck, Package, Plane, Ship } from "lucide-react";

export default function HomePage() {
  const [searchUrl, setSearchUrl] = useState("");
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const categoryRowRef = React.useRef<HTMLDivElement>(null);

  const handleScrollNext = () => {
    if (categoryRowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = categoryRowRef.current;
      if (scrollLeft + clientWidth >= scrollWidth - 20) {
        categoryRowRef.current.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        categoryRowRef.current.scrollBy({ left: 280, behavior: "smooth" });
      }
    }
  };

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

  const softCategories = [
    { name: "Électronique", img: "/images/assets/cat_electronics_v2.jpg", link: "/catalog?cat=electronics" },
    { name: "Mode", img: "/images/assets/cat_fashion_v2.jpg", link: "/catalog?cat=fashion" },
    { name: "Luxe", img: "/images/assets/cat_luxury.jpg", link: "/catalog?cat=luxury" },
    { name: "Maison & Déco", img: "/images/assets/cat_homedecor.jpg", link: "/catalog?cat=home" },
    { name: "Santé & Beauté", img: "/images/assets/cat_beauty.jpg", link: "/catalog?cat=beauty" },
    { name: "Épicerie", img: "/images/assets/cat_groceries.jpg", link: "/catalog?cat=groceries" },
    { name: "Baskets & Sport", img: "/images/assets/cat_sneakers.jpg", link: "/catalog?cat=sneakers" },
  ];

  const todayDeals = [
    { id: "1", title: "Smartwatch Sport GPS Étanche", price: "35 000 FCFA", oldPrice: "55 000 FCFA", image: "/images/assets/item_1.jpg", category: "Électronique" },
    { id: "2", title: "Écouteurs Bluetooth ANC Réduction de Bruit", price: "22 000 FCFA", oldPrice: "40 000 FCFA", image: "/images/assets/item_2.jpg", category: "Électronique" },
    { id: "3", title: "Casque Sans-Fil Hi-Fi Pro Audio", price: "45 000 FCFA", oldPrice: "70 000 FCFA", image: "/images/assets/cat_electronics.jpg", category: "Électronique" },
    { id: "4", title: "Sac à Main Luxe Designer Rose Pastel", price: "48 000 FCFA", oldPrice: "75 000 FCFA", image: "/images/assets/cat_luxury.jpg", category: "Luxe" },
    { id: "5", title: "Baskets Modernes Running Sport", price: "28 000 FCFA", oldPrice: "45 000 FCFA", image: "/images/assets/cat_sneakers.jpg", category: "Baskets & Sport" },
  ];

  const laptopsShowcase = [
    { title: "Smartphones", img: "/images/assets/card_hero_iphone.jpg", link: "/catalog?cat=electronics" },
    { title: "Écouteurs TWS", img: "/images/assets/cat_electronics.jpg", link: "/catalog?cat=electronics" },
    { title: "Sacs de Luxe", img: "/images/assets/cat_luxury.jpg", link: "/catalog?cat=luxury" },
    { title: "Smartwatch", img: "/images/assets/item_1.jpg", link: "/catalog?cat=electronics" },
    { title: "Chaussures Sport", img: "/images/assets/cat_sneakers.jpg", link: "/catalog?cat=sneakers" },
  ];

  const samplePrompts = [
    "200 Casques Bluetooth ANC TWS",
    "50 Sacs à main Cuir Véritable",
    "Lot Baskets Running Sport",
    "Panneaux Solaires Monocristallins 550W"
  ];

  return (
    <div style={{ background: "#F8FAFC", paddingBottom: 60, fontFamily: "var(--font-body), 'Plus Jakarta Sans', sans-serif" }}>
      
      {/* HERO 2-CARDS BANNERS SECTION */}
      <section style={{ padding: "24px 0 28px" }}>
        <div className="container">
          <div className="soft-hero-grid">

            {/* CARD 1: MAIN IPHONE HERO BANNER */}
            <div className="soft-banner-main" style={{ position: "relative", overflow: "hidden" }}>
              
              {/* Left text & CTAs */}
              <div style={{ zIndex: 2, maxWidth: 440, position: "relative" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.02em" }}>
                  iPhone 16 Pro Max
                </span>
                <h1 style={{ fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 800, color: "#FFFFFF", margin: "8px 0 10px", lineHeight: 1.15, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  À partir de 50 769 FCFA*
                </h1>
                <p style={{ fontSize: 13, color: "#CBD5E1", lineHeight: 1.5, margin: "0 0 24px" }}>
                  Puce A18. Ultra-rapide. Ultra-intelligent.<br />Historique, la plus forte baisse de prix.
                </p>
                <Link
                  href="/catalog?q=iphone+16"
                  style={{
                    background: "#0F172A",
                    color: "#FFFFFF",
                    borderRadius: 9999,
                    padding: "12px 28px",
                    fontSize: 13.5,
                    fontWeight: 800,
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.4)",
                    transition: "transform 0.2s ease"
                  }}
                >
                  <span>Acheter Maintenant</span>
                </Link>
              </div>

              {/* Full Right Side Seamless iPhone Visual (No inner box border) */}
              <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "55%", pointerEvents: "none", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                <img
                  src="/images/assets/hero_iphone16.png"
                  alt="iPhone 16 Pro Max"
                  style={{ height: "115%", width: "auto", objectFit: "contain", transform: "translate(5%, 6%)", filter: "drop-shadow(-20px 20px 40px rgba(0,0,0,0.6))" }}
                />
              </div>

              {/* Bottom footer bar with French note and dots */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", marginTop: 24, zIndex: 2, position: "relative" }}>
                <span style={{ fontSize: 11, color: "#94A3B8", fontWeight: 700 }}>
                  *Toutes les offres incluses
                </span>
                
                {/* Carousel Pagination Dots */}
                <div style={{ display: "flex", gap: 6, alignItems: "center", background: "rgba(255,255,255,0.1)", padding: "5px 12px", borderRadius: 9999 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#475569" }} />
                  <span style={{ width: 14, height: 6, borderRadius: 9999, background: "#0F172A" }} />
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#475569" }} />
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#475569" }} />
                </div>

                <div style={{ width: 80 }} />
              </div>
            </div>

            {/* CARD 2: PROMO SALE BANNER (FULL FILL BACKGROUND VISUAL) */}
            <div
              className="soft-banner-sale"
              style={{
                backgroundImage: "linear-gradient(180deg, rgba(6, 182, 212, 0.82) 0%, rgba(6, 182, 212, 0.45) 45%, rgba(15, 23, 42, 0.88) 100%), url('/images/assets/card_hero_sale_fr.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                position: "relative",
              }}
            >
              <div style={{ zIndex: 2 }}>
                <div style={{ background: "rgba(255, 255, 255, 0.3)", backdropFilter: "blur(10px)", display: "inline-block", padding: "6px 14px", borderRadius: 9999, marginBottom: 14 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 900, color: "#0F172A", letterSpacing: "0.04em" }}>
                    JUSQU'À -50% DE RÉDUCTION
                  </span>
                </div>
                <h2 style={{ fontSize: 25, fontWeight: 900, color: "#FFFFFF", margin: "0 0 8px", lineHeight: 1.25, textShadow: "0 2px 10px rgba(0,0,0,0.3)" }}>
                  Offres Exclusives<br />Baskets & Équipements
                </h2>
              </div>

              <div style={{ flex: 1 }} />

              <Link
                href="/catalog?cat=sneakers"
                style={{
                  zIndex: 2,
                  background: "#0F172A",
                  color: "#FFFFFF",
                  borderRadius: 9999,
                  padding: "13px 24px",
                  fontSize: 13.5,
                  fontWeight: 800,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  boxShadow: "0 8px 20px rgba(0,0,0,0.3)"
                }}
              >
                <span>Découvrir les offres</span>
                <ArrowRight style={{ width: 15, height: 15 }} />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* POPULAR CATEGORIES SECTION */}
      <section style={{ padding: "24px 0 32px" }}>
        <div className="container">
          
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0F172A", margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Explorer les Catégories Populaires
            </h2>
            <Link href="/catalog" style={{ fontSize: 13, fontWeight: 700, color: "#165491", textDecoration: "none", display: "flex", alignItems: "center", gap: 3 }}>
              <span>Voir Tout</span>
              <ChevronRight style={{ width: 14, height: 14 }} />
            </Link>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div ref={categoryRowRef} className="category-soft-pod-row" style={{ flex: 1 }}>
              {softCategories.map((c, idx) => (
                <Link key={idx} href={c.link} className="category-soft-pod">
                  <div className="category-soft-circle">
                    <img src={c.img} alt={c.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                  </div>
                  <span className="category-soft-label">{c.name}</span>
                </Link>
              ))}
            </div>

            {/* Circular Scroll Next Button */}
            <button 
              onClick={handleScrollNext} 
              className="scroll-next-btn" 
              aria-label="Catégories suivantes"
              title="Faire défiler les catégories"
            >
              <ChevronRight style={{ width: 20, height: 20 }} />
            </button>
          </div>

        </div>
      </section>

      {/* TODAY'S BEST DEALS FOR YOU SECTION */}
      <section style={{ padding: "20px 0 40px" }}>
        <div className="container">
          
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0F172A", margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Les Meilleures Offres du Jour pour Vous !
            </h2>
            <Link href="/catalog" style={{ fontSize: 13, fontWeight: 700, color: "#165491", textDecoration: "none", display: "flex", alignItems: "center", gap: 3 }}>
              <span>Voir Tout</span>
              <ChevronRight style={{ width: 14, height: 14 }} />
            </Link>
          </div>

          <div className="grid-5">
            {todayDeals.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                title={p.title}
                price={p.price}
                oldPrice={p.oldPrice}
                image={p.image}
                category={p.category}
              />
            ))}
          </div>

        </div>
      </section>

      {/* STYLE & FASHION SECTION */}
      <section style={{ padding: "20px 0 30px" }}>
        <div className="container">
          <div className="section-title-row">
            <h2 className="section-title">Sélection Catalogue Produits</h2>
            <Link href="/catalog" className="view-all-link">
              <span>Tout le catalogue</span>
              <ChevronRight style={{ width: 14, height: 14 }} />
            </Link>
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
              <h2 className="section-title" style={{ margin: 0, fontSize: 20, fontWeight: 900, color: "#0F172A" }}>
                High-Tech & Electronics Usines
              </h2>
              <Link href="/catalog?cat=electronics" className="view-all-link">
                <span>Voir tout</span>
                <ChevronRight style={{ width: 14, height: 14 }} />
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
            <Sparkles style={{ width: 14, flexShrink: 0 }} /> <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>IA SOURCING INTERNATIONAL — USINES CERTIFIÉES</span>
          </div>

          {/* HEADLINE */}
          <h2 style={{ fontSize: "clamp(22px, 4vw, 36px)", fontWeight: 900, color: "#FFFFFF", marginBottom: 12, lineHeight: 1.2, letterSpacing: "-0.5px" }}>
            Trouvez N'importe Quel Produit Direct Usine
          </h2>
          <p style={{ fontSize: 13.5, color: "#94A3B8", maxWidth: 640, margin: "0 auto 24px", lineHeight: 1.6 }}>
            Collez un lien produit ou décrivez votre besoin. Notre algorithme IA identifie les fournisseurs usines certifiés au meilleur prix et calcule votre devis rendu Afrique.
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
                placeholder="Collez un lien produit ou décrivez votre besoin..."
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
              <Zap style={{ width: 15, color: "#38BDF8", flexShrink: 0 }} /> Scan Instantané Usines
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: "#E2E8F0", fontSize: 12, fontWeight: 700 }}>
              <DollarSign style={{ width: 15, color: "#10B981", flexShrink: 0 }} /> Prix Usine Direct
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
