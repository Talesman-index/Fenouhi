"use client";

import React, { useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { Sparkles, ArrowRight, ShieldCheck, Truck, Clock, Search, ChevronRight } from "lucide-react";

export default function HomePage() {
  const [searchUrl, setSearchUrl] = useState("");

  const categories = [
    { name: "Electronics", img: "/images/assets/item_3.jpg", link: "/catalog?cat=electronics" },
    { name: "Fashion", img: "/images/assets/item_4.jpg", link: "/catalog?cat=fashion" },
    { name: "Liquors & Bags", img: "/images/assets/hero_bag.png", link: "/catalog?cat=wholesale" },
    { name: "Home Decor", img: "/images/assets/item_1.jpg", link: "/catalog?cat=appliances" },
    { name: "Health & Beauty", img: "/images/assets/item_5.jpg", link: "/catalog?cat=beauty" },
    { name: "Groceries & Agro", img: "/images/assets/hero_agro.png", link: "/catalog?cat=agro" },
    { name: "Sneakers & Tools", img: "/images/assets/item_9.jpg", link: "/catalog?cat=machinery" },
  ];

  const todayDeals = [
    { id: "1", title: "Montre Connectée SmartFit Pro X", price: "12 500 FCFA", oldPrice: "18 000 FCFA", image: "/images/assets/item_1.jpg" },
    { id: "2", title: "Écouteurs Bluetooth ANC SoundBass", price: "8 900 FCFA", oldPrice: "14 000 FCFA", image: "/images/assets/item_2.jpg" },
    { id: "3", title: "Casque Audio Over-Ear Wireless", price: "15 000 FCFA", oldPrice: "22 000 FCFA", image: "/images/assets/item_3.jpg" },
    { id: "4", title: "Coffret Bijoux Doré 24k Luxury", price: "6 800 FCFA", oldPrice: "9 500 FCFA", image: "/images/assets/item_7.jpg" },
    { id: "5", title: "Baskets Urban Sport Sneaker Pro", price: "8 500 FCFA", oldPrice: "12 000 FCFA", image: "/images/assets/item_4.jpg" },
  ];

  const textileProducts = [
    { id: "6", title: "Veste Blouson Imperméable Workwear", price: "12 000 FCFA", oldPrice: "16 000 FCFA", image: "/images/assets/item_8.jpg" },
    { id: "7", title: "Sweat-shirt Fleece Warm Thermal", price: "5 000 FCFA", oldPrice: "7 500 FCFA", image: "/images/assets/item_6.jpg" },
    { id: "8", title: "Gants de Protection & Travail Cuir", price: "2 500 FCFA", oldPrice: "4 000 FCFA", image: "/images/assets/item_9.jpg" },
    { id: "9", title: "Parka Rembourrée Capuche Fourrure", price: "18 000 FCFA", oldPrice: "24 000 FCFA", image: "/images/assets/item_10.jpg" },
    { id: "10", title: "Pull Maille Tricot Femme Casual", price: "6 000 FCFA", oldPrice: "8 500 FCFA", image: "/images/assets/item_11.jpg" },
  ];

  const electronicsDeals = [
    { id: "11", title: "Apple iPhone 16 Pro Max 256GB Sourcing", price: "650 000 FCFA", oldPrice: "780 000 FCFA", image: "/images/assets/hero_iphone16.png" },
    { id: "12", title: "Samsung Galaxy S24 Ultra 5G Usine", price: "520 000 FCFA", oldPrice: "610 000 FCFA", image: "/images/assets/hero_samsung.png" },
    { id: "13", title: "Écouteurs TWS Pro Noise Cancelling", price: "7 500 FCFA", oldPrice: "11 000 FCFA", image: "/images/assets/item_2.jpg" },
    { id: "14", title: "Ordinateur Portable UltraSlim 15.6\"", price: "185 000 FCFA", oldPrice: "230 000 FCFA", image: "/images/assets/item_3.jpg" },
    { id: "15", title: "Power Bank Solaire 30000mAh Rugged", price: "9 500 FCFA", oldPrice: "14 000 FCFA", image: "/images/assets/item_1.jpg" },
  ];

  const beautyDeals = [
    { id: "16", title: "Sérum Visage Vitamine C Éclat 30ml", price: "3 500 FCFA", oldPrice: "5 000 FCFA", image: "/images/assets/item_5.jpg" },
    { id: "17", title: "Pack Soins Capillaires & Visage Bio", price: "12 000 FCFA", oldPrice: "17 000 FCFA", image: "/images/assets/hero_beauty.png" },
    { id: "18", title: "Coffret Maquillage Pro 24 Nuances", price: "9 800 FCFA", oldPrice: "13 500 FCFA", image: "/images/assets/item_7.jpg" },
    { id: "19", title: "Parfum Luxe Oriental Senteur 100ml", price: "6 500 FCFA", oldPrice: "9 000 FCFA", image: "/images/assets/item_5.jpg" },
    { id: "20", title: "Brosse Nettoyante Visage 2-en-1 Sonic", price: "4 200 FCFA", oldPrice: "6 000 FCFA", image: "/images/assets/item_5.jpg" },
  ];

  return (
    <div style={{ background: "#F8FAFC", paddingBottom: 60 }}>
      {/* 1. HERO BANNERS SECTION */}
      <section className="hero-banners-section" style={{ padding: "20px 0" }}>
        <div className="container">
          <div className="hero-banners-grid" style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
            
            {/* MAIN HERO BANNER */}
            <div className="hero-banner-main" style={{ background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)", borderRadius: 20, padding: 36, position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 320 }}>
              <div style={{ maxWidth: 380, zIndex: 2 }}>
                <span className="badge" style={{ background: "rgba(22, 84, 145, 0.3)", color: "#38BDF8", border: "1px solid rgba(56, 189, 248, 0.3)", marginBottom: 14 }}>
                  ⚡ IMPORTATION DIRECTE CHINE → AFRIQUE
                </span>
                <h1 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 900, lineHeight: 1.1, marginBottom: 14, color: "#FFF", letterSpacing: "-0.5px" }}>
                  Achetez en Usine.<br /><span style={{ color: "#38BDF8" }}>Faites-vous Livrer.</span>
                </h1>
                <p style={{ fontSize: 14, color: "#94A3B8", marginBottom: 24, lineHeight: 1.5 }}>
                  Commandez sur 1688, Taobao, Alibaba ou parmi notre catalogue d'usines vérifiées. Devis transparents et fret sécurisé.
                </p>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <Link href="/quote-request" className="btn btn-orange" style={{ padding: "12px 24px", fontSize: 14 }}>
                    Demander un Devis <ArrowRight style={{ width: 16 }} />
                  </Link>
                  <Link href="/catalog" className="btn" style={{ background: "rgba(255,255,255,0.1)", color: "#FFF", padding: "12px 20px", fontSize: 14, border: "1px solid rgba(255,255,255,0.2)" }}>
                    Parcourir le Catalogue
                  </Link>
                </div>
              </div>
              <img src="/images/assets/hero_iphone16.png" alt="iPhone 16 Pro Max Sourcing" style={{ height: 280, width: "auto", objectFit: "contain", zIndex: 1, filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.5))" }} />
            </div>

            {/* SECONDARY HERO BANNER */}
            <div className="hero-banner-side" style={{ background: "linear-gradient(135deg, #0284C7 0%, #0369A1 100%)", borderRadius: 20, padding: 28, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <span className="badge" style={{ background: "#FFF", color: "#0284C7", fontWeight: 900, marginBottom: 12 }}>
                  OFFRE PROMO EXPÉDITION
                </span>
                <h2 style={{ fontSize: 24, fontWeight: 900, color: "#FFF", lineHeight: 1.2, marginBottom: 8 }}>
                  Vol Direct Guangzhou ➔ Cotonou
                </h2>
                <p style={{ fontSize: 13, color: "#E0F2FE", lineHeight: 1.4 }}>
                  Livraison Aérienne Express 5 à 10 jours. Dédouanement inclus.
                </p>
              </div>
              <div style={{ marginTop: 20 }}>
                <Link href="/dashboard" className="btn" style={{ background: "#FFF", color: "#0369A1", fontWeight: 800, padding: "10px 18px", fontSize: 13, borderRadius: 9999 }}>
                  Suivre mon colis
                </Link>
              </div>
              <img src="/images/assets/hero_sneaker.png" alt="Fret Express" style={{ position: "absolute", bottom: -10, right: -10, height: 160, width: "auto", opacity: 0.9, pointerEvents: "none" }} />
            </div>

          </div>
        </div>
      </section>

      {/* 2. EXPLORE POPULAR CATEGORIES */}
      <section style={{ padding: "30px 0" }}>
        <div className="container">
          <div className="section-title-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 className="section-title" style={{ fontSize: 22, fontWeight: 900, color: "#0F172A", margin: 0 }}>
              Explore Popular Categories
            </h2>
            <Link href="/catalog" className="view-all-link" style={{ fontSize: 13, fontWeight: 800, color: "#165491", display: "flex", alignItems: "center", gap: 4 }}>
              Voir tout <ChevronRight style={{ width: 14 }} />
            </Link>
          </div>

          <div className="categories-circle-row" style={{ display: "flex", gap: 24, justifyContent: "space-between", overflowX: "auto", paddingBottom: 10 }}>
            {categories.map((c, idx) => (
              <Link key={idx} href={c.link} className="category-circle-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textDecoration: "none", flexShrink: 0 }}>
                <div className="category-circle-box" style={{ width: 96, height: 96, borderRadius: "50%", background: "#EAE8E1", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.06)", transition: "transform 0.2s ease" }}>
                  <img src={c.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 800, color: "#0F172A", textAlign: "center" }}>{c.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. TODAY'S BEST DEALS FOR YOU! */}
      <section style={{ padding: "24px 0 40px" }}>
        <div className="container">
          <div className="section-title-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 className="section-title" style={{ fontSize: 22, fontWeight: 900, color: "#0F172A", margin: 0 }}>
              Today's Best Deals For You!
            </h2>
            <Link href="/catalog" className="view-all-link" style={{ fontSize: 13, fontWeight: 800, color: "#165491", display: "flex", alignItems: "center", gap: 4 }}>
              Voir tout <ChevronRight style={{ width: 14 }} />
            </Link>
          </div>

          <div className="grid-5" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 18 }}>
            {todayDeals.map((d) => (
              <ProductCard key={d.id} {...d} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. 3-COLUMN FEATURE BANNERS (PROMO CARDS) */}
      <section style={{ padding: "10px 0 40px" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            
            {/* CARD 1: AGRO & GROSSISTES */}
            <div style={{ background: "linear-gradient(135deg, #881337 0%, #BE123C 100%)", borderRadius: 20, padding: 24, color: "#FFF", position: "relative", overflow: "hidden", minHeight: 220, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <span className="badge" style={{ background: "#FFE4E6", color: "#9F1239", fontWeight: 900, marginBottom: 10 }}>
                  GROSSISTES 1688 & ALIBABA
                </span>
                <h3 style={{ fontSize: 20, fontWeight: 900, margin: "6px 0", lineHeight: 1.25 }}>
                  Agro-Alimentaire & Matériel PME
                </h3>
                <p style={{ fontSize: 12.5, color: "#FECDD3" }}>
                  Sourcing direct auprès des usines certifiées avec inspection qualité.
                </p>
              </div>
              <div>
                <Link href="/catalog?cat=agro" className="btn" style={{ background: "#FFF", color: "#BE123C", fontWeight: 900, fontSize: 12, padding: "8px 16px", borderRadius: 9999 }}>
                  Commander en gros
                </Link>
              </div>
              <img src="/images/assets/hero_agro.png" alt="Agro" style={{ position: "absolute", bottom: -10, right: -10, height: 130, width: "auto", opacity: 0.85 }} />
            </div>

            {/* CARD 2: SAMSUNG & SMARTPHONES */}
            <div style={{ background: "linear-gradient(135deg, #0284C7 0%, #38BDF8 100%)", borderRadius: 20, padding: 24, color: "#FFF", position: "relative", overflow: "hidden", minHeight: 220, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <span className="badge" style={{ background: "#FFF", color: "#0284C7", fontWeight: 900, marginBottom: 10 }}>
                  SMARTPHONES & TECH
                </span>
                <h3 style={{ fontSize: 20, fontWeight: 900, margin: "6px 0", lineHeight: 1.25 }}>
                  SAMSUNG Galaxy S24 FE
                </h3>
                <p style={{ fontSize: 12.5, color: "#E0F2FE" }}>
                  Prix usine direct Shenzhen. Garantie officielle 12 mois.
                </p>
              </div>
              <div>
                <Link href="/quote-request?prod=Samsung" className="btn" style={{ background: "#0F172A", color: "#FFF", fontWeight: 900, fontSize: 12, padding: "8px 16px", borderRadius: 9999 }}>
                  Acheter au prix usine
                </Link>
              </div>
              <img src="/images/assets/hero_samsung.png" alt="Samsung" style={{ position: "absolute", bottom: 0, right: -10, height: 140, width: "auto" }} />
            </div>

            {/* CARD 3: RED FREIGHT PROMO */}
            <div style={{ background: "linear-gradient(135deg, #DC2626 0%, #EF4444 100%)", borderRadius: 20, padding: 24, color: "#FFF", position: "relative", overflow: "hidden", minHeight: 220, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <span className="badge" style={{ background: "#FEF2F2", color: "#991B1B", fontWeight: 900, marginBottom: 10 }}>
                  OFFRE EXPÉDITION EXPRESS
                </span>
                <h3 style={{ fontSize: 20, fontWeight: 900, margin: "6px 0", lineHeight: 1.25 }}>
                  Dédouanement & Fret Sécurisé
                </h3>
                <p style={{ fontSize: 12.5, color: "#FEE2E2" }}>
                  Expédition maritime & aérienne vers toute l'Afrique de l'Ouest.
                </p>
              </div>
              <div>
                <Link href="/quote-request" className="btn" style={{ background: "#FFF", color: "#DC2626", fontWeight: 900, fontSize: 12, padding: "8px 16px", borderRadius: 9999 }}>
                  Obtenir un devis fret
                </Link>
              </div>
              <img src="/images/assets/hero_box.png" alt="Fret Box" style={{ position: "absolute", bottom: -10, right: -10, height: 130, width: "auto", opacity: 0.9 }} />
            </div>

          </div>
        </div>
      </section>

      {/* 5. 60% OFF OR MORE ON WINTER-WEAR / TEXTILE & MODE */}
      <section style={{ padding: "20px 0 40px" }}>
        <div className="container">
          <div className="section-title-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 className="section-title" style={{ fontSize: 22, fontWeight: 900, color: "#0F172A", margin: 0 }}>
              60% Off Or More On Textile & Wear
            </h2>
            <Link href="/catalog?cat=fashion" className="view-all-link" style={{ fontSize: 13, fontWeight: 800, color: "#165491", display: "flex", alignItems: "center", gap: 4 }}>
              Voir tout <ChevronRight style={{ width: 14 }} />
            </Link>
          </div>

          <div className="grid-5" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 18 }}>
            {textileProducts.map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        </div>
      </section>

      {/* 6. CARGOLINK AI SOURCING BANNER WITH GALLERY */}
      <section className="container" style={{ margin: "20px auto 40px" }}>
        <div className="cargolink-ai-banner" style={{ background: "#FFF", border: "1.5px solid #E2E8F0", borderRadius: 24, padding: "40px 30px", textAlign: "center", boxShadow: "0 10px 30px rgba(0,0,0,0.04)" }}>
          <span className="badge" style={{ background: "var(--orange-light)", color: "var(--orange-hover)", marginBottom: 12 }}>
            <Sparkles style={{ width: 14, display: "inline", marginRight: 4 }} /> IA SOURCING CHINE
          </span>
          <h2 style={{ fontSize: "clamp(24px, 3.5vw, 32px)", fontWeight: 900, color: "var(--navy-dark)", marginBottom: 8 }}>
            CargoLink AI — Trouvez n'importe quel produit en Chine
          </h2>
          <p style={{ fontSize: 14, color: "var(--text-muted)", maxWidth: 600, margin: "0 auto 24px" }}>
            Collez un lien 1688, Taobao, Alibaba ou décrivez simplement votre besoin. Notre algorithme identifie l'usine la moins chère.
          </p>

          <div style={{ maxWidth: 560, margin: "0 auto", display: "flex", gap: 8, background: "#F8FAFC", padding: 6, borderRadius: 9999, border: "1.5px solid #E2E8F0" }}>
            <input
              type="text"
              value={searchUrl}
              onChange={(e) => setSearchUrl(e.target.value)}
              placeholder="Ex: Lien 1688 ou '200 casques bluetooth avec logo'..."
              style={{ flex: 1, border: "none", outline: "none", padding: "0 16px", fontSize: 13.5, fontWeight: 700, background: "transparent" }}
            />
            <Link 
              href={`/quote-request?url=${encodeURIComponent(searchUrl)}`}
              className="btn btn-orange btn-pill-sm"
              style={{ borderRadius: 9999, padding: "10px 22px" }}
            >
              <Search style={{ width: 16 }} /> Trouver l'Usine
            </Link>
          </div>
        </div>
      </section>

      {/* 7. TOP DEALS IN ELECTRONICS */}
      <section style={{ padding: "20px 0 40px" }}>
        <div className="container">
          <div className="section-title-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 className="section-title" style={{ fontSize: 22, fontWeight: 900, color: "#0F172A", margin: 0 }}>
              Top Deals In Electronics
            </h2>
            <Link href="/catalog?cat=electronics" className="view-all-link" style={{ fontSize: 13, fontWeight: 800, color: "#165491", display: "flex", alignItems: "center", gap: 4 }}>
              Voir tout <ChevronRight style={{ width: 14 }} />
            </Link>
          </div>

          <div className="grid-5" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 18 }}>
            {electronicsDeals.map((d) => (
              <ProductCard key={d.id} {...d} />
            ))}
          </div>
        </div>
      </section>

      {/* 8. BEST SELLERS IN BEAUTY & HEALTH */}
      <section style={{ padding: "20px 0 40px" }}>
        <div className="container">
          <div className="section-title-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 className="section-title" style={{ fontSize: 22, fontWeight: 900, color: "#0F172A", margin: 0 }}>
              Best Sellers In Beauty & Health
            </h2>
            <Link href="/catalog?cat=beauty" className="view-all-link" style={{ fontSize: 13, fontWeight: 800, color: "#165491", display: "flex", alignItems: "center", gap: 4 }}>
              Voir tout <ChevronRight style={{ width: 14 }} />
            </Link>
          </div>

          <div className="grid-5" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 18 }}>
            {beautyDeals.map((b) => (
              <ProductCard key={b.id} {...b} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
