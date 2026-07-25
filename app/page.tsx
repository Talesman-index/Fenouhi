"use client";

import React, { useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { Sparkles, ArrowRight, ShieldCheck, Truck, Clock, Search } from "lucide-react";

export default function HomePage() {
  const [searchUrl, setSearchUrl] = useState("");

  const categories = [
    { name: "High-Tech & Audio", img: "/images/assets/cat_audio.jpg", link: "/catalog?cat=electronics" },
    { name: "Mode & Chaussures", img: "/images/assets/cat_shoes.jpg", link: "/catalog?cat=fashion" },
    { name: "Gros & Grossistes", img: "/images/assets/cat_wholesale.jpg", link: "/catalog?cat=wholesale" },
    { name: "Beauté & Soins", img: "/images/assets/cat_beauty.jpg", link: "/catalog?cat=beauty" },
    { name: "Électroménager", img: "/images/assets/cat_home.jpg", link: "/catalog?cat=appliances" },
    { name: "Outillage & PME", img: "/images/assets/cat_tools.jpg", link: "/catalog?cat=machinery" },
  ];

  const deals = [
    { id: "1", title: "Montre Connectée SmartFit Pro X", price: "12 500 FCFA", oldPrice: "18 000 FCFA", image: "/images/assets/item_1.jpg" },
    { id: "2", title: "Écouteurs Bluetooth ANC SoundBass", price: "8 900 FCFA", oldPrice: "14 000 FCFA", image: "/images/assets/item_2.jpg" },
    { id: "3", title: "Casque Audio Over-Ear Wireless", price: "15 000 FCFA", oldPrice: "22 000 FCFA", image: "/images/assets/item_3.jpg" },
    { id: "4", title: "Coffret Bijoux Doré 24k Luxury", price: "6 800 FCFA", oldPrice: "9 500 FCFA", image: "/images/assets/item_7.jpg" },
    { id: "5", title: "Baskets Urban Sport Sneaker Pro", price: "8 500 FCFA", oldPrice: "12 000 FCFA", image: "/images/assets/item_4.jpg" },
  ];

  const textileProducts = [
    { id: "6", title: "Veste Blouson Imperméable Workwear", price: "12 000 FCFA", image: "/images/assets/item_8.jpg" },
    { id: "7", title: "Sweat-shirt Fleece Warm Thermal", price: "5 000 FCFA", image: "/images/assets/item_6.jpg" },
    { id: "8", title: "Gants de Protection & Travail Cuir", price: "2 500 FCFA", image: "/images/assets/item_9.jpg" },
    { id: "9", title: "Parka Rembourrée Capuche Fourrure", price: "18 000 FCFA", image: "/images/assets/item_10.jpg" },
    { id: "10", title: "Pull Maille Tricot Femme Casual", price: "6 000 FCFA", image: "/images/assets/item_11.jpg" },
  ];

  return (
    <div>
      {/* HERO BANNERS SECTION */}
      <section className="hero-banners-section">
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
              <div>
                <span className="badge" style={{ background: "var(--green-bg)", color: "var(--green-success)", marginBottom: 8 }}>
                  SUIVI GPS LOGISTIQUE
                </span>
                <h2 style={{ fontSize: 22, fontWeight: 900, color: "#FFF", marginBottom: 6 }}>
                  Vol Direct Guangzhou ➔ Cotonou
                </h2>
                <p style={{ fontSize: 12.5, color: "#94A3B8" }}>
                  Livraison Aérienne Express 5 à 10 jours.
                </p>
              </div>
              <Link href="/dashboard" className="btn btn-pill-sm" style={{ background: "#FFF", color: "var(--navy-dark)", width: "fit-content" }}>
                Suivre mon colis
              </Link>
              <img className="hero-banner-side-img" src="/images/assets/hero_samsung.png" alt="Samsung S24" />
            </div>
          </div>
        </div>
      </section>

      {/* POPULAR CATEGORIES */}
      <section style={{ padding: "20px 0 40px" }}>
        <div className="container">
          <div className="section-title-row">
            <h2 className="section-title">Explore Popular Categories</h2>
            <Link href="/catalog" className="view-all-link">Voir tout &gt;</Link>
          </div>

          <div className="categories-circle-row">
            {categories.map((c, idx) => (
              <Link key={idx} href={c.link} className="category-circle-card">
                <div className="category-circle-box">
                  <img src={c.img} alt={c.name} />
                </div>
                <div className="category-circle-name">{c.name}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FLASH DEALS GRID */}
      <section style={{ padding: "20px 0 40px" }}>
        <div className="container">
          <div className="section-title-row">
            <h2 className="section-title">Top Deals Usines Chine — Sélection Directe</h2>
            <Link href="/catalog" className="view-all-link">Voir tout &gt;</Link>
          </div>

          <div className="grid-5">
            {deals.map((d) => (
              <ProductCard key={d.id} {...d} />
            ))}
          </div>
        </div>
      </section>

      {/* CARGOLINK AI SOURCING BANNER */}
      <section className="container" style={{ margin: "20px auto 40px" }}>
        <div className="cargolink-ai-banner">
          <span className="badge" style={{ background: "var(--orange-light)", color: "var(--orange-hover)", marginBottom: 12 }}>
            <Sparkles style={{ width: 14, display: "inline", marginRight: 4 }} /> IA SOURCING CHINE
          </span>
          <h2 style={{ fontSize: "clamp(24px, 3.5vw, 32px)", fontWeight: 900, color: "var(--navy-dark)", marginBottom: 8 }}>
            CargoLink AI — Trouvez n'importe quel produit en Chine
          </h2>
          <p style={{ fontSize: 14, color: "var(--text-muted)", maxWidth: 600, margin: "0 auto 20px" }}>
            Collez un lien 1688, Taobao, Alibaba ou décrivez simplement votre besoin. Notre algorithme identifie l'usine la moins chère.
          </p>

          <div style={{ maxWidth: 560, margin: "0 auto", display: "flex", gap: 8, background: "#FFF", padding: 6, borderRadius: 9999, boxShadow: "var(--shadow-md)" }}>
            <input
              type="text"
              value={searchUrl}
              onChange={(e) => setSearchUrl(e.target.value)}
              placeholder="Ex: Lien 1688 ou '200 casques bluetooth avec logo'..."
              style={{ flex: 1, border: "none", outline: "none", padding: "0 16px", fontSize: 13.5, fontWeight: 700, borderRadius: 9999 }}
            />
            <Link 
              href={`/quote-request?url=${encodeURIComponent(searchUrl)}`}
              className="btn btn-orange btn-pill-sm"
              style={{ borderRadius: 9999, padding: "10px 20px" }}
            >
              <Search style={{ width: 16 }} /> Trouver l'Usine
            </Link>
          </div>
        </div>
      </section>

      {/* TEXTILE GRID */}
      <section style={{ padding: "20px 0 60px" }}>
        <div className="container">
          <div className="section-title-row">
            <h2 className="section-title">60% Off Or More On Textile & Wear</h2>
            <Link href="/catalog?cat=fashion" className="view-all-link">Voir tout &gt;</Link>
          </div>

          <div className="grid-5">
            {textileProducts.map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
