"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";
import { Store, Box, CreditCard, Headphones, Facebook, Instagram, ShieldCheck, MapPin } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <footer className="footer-wrapper" style={{ background: "#FFFFFF", borderTop: "1px solid #E2E8F0", padding: isHomePage ? "48px 0 24px" : "24px 0 24px" }}>
      <div className="container" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
        
        {/* 1. SOBER FEATURE ROW & NAV COLUMNS (HOMEPAGE ONLY) */}
        {isHomePage && (
          <>
            <div 
              className="guarantee-sober-row"
              style={{
                borderTop: "1px solid #F1F5F9",
                borderBottom: "1px solid #F1F5F9",
                padding: "28px 0",
                marginBottom: 44,
              }}
            >
              <div 
                style={{ 
                  display: "grid", 
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", 
                  gap: 32,
                }}
              >
                {/* FEATURE 1 */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <Store style={{ width: 22, height: 22, color: "#165491", flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>
                      Retrait en Hub Agence
                    </div>
                    <div style={{ fontSize: 12.5, color: "#64748B", marginTop: 3, lineHeight: 1.45 }}>
                      Retrait sans frais à Cotonou et suivi de colis sur place
                    </div>
                  </div>
                </div>

                {/* FEATURE 2 */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <Box style={{ width: 22, height: 22, color: "#165491", flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>
                      Fret Direct Chine
                    </div>
                    <div style={{ fontSize: 12.5, color: "#64748B", marginTop: 3, lineHeight: 1.45 }}>
                      Aérien Express (5–12j) & Maritime groupé économique
                    </div>
                  </div>
                </div>

                {/* FEATURE 3 */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <CreditCard style={{ width: 22, height: 22, color: "#165491", flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>
                      Paiement Sécurisé Bénin
                    </div>
                    <div style={{ fontSize: 12.5, color: "#64748B", marginTop: 3, lineHeight: 1.45 }}>
                      MTN MoMo, Moov Money et cartes bancaires internationales
                    </div>
                  </div>
                </div>

                {/* FEATURE 4 */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <Headphones style={{ width: 22, height: 22, color: "#165491", flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>
                      Service Client 7j/7
                    </div>
                    <div style={{ fontSize: 12.5, color: "#64748B", marginTop: 3, lineHeight: 1.45 }}>
                      Assistance sourcing usine et cotation sur-mesure rapide
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* BRAND LOGO ROW */}
            <div style={{ marginBottom: 28, paddingTop: 6 }}>
              <Logo size={38} subtitleText="LOGISTIQUE DIRECTE CHINE ➔ BÉNIN & AFRIQUE" />
            </div>

            {/* MAIN 4 NAVIGATION COLUMNS */}
            <div className="footer-nav-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 32, marginBottom: 36 }}>
              {/* COL 1: À PROPOS */}
              <div>
                <div className="footer-col-title" style={{ fontSize: 14, fontWeight: 900, color: "#0F172A", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  À Propos de FENOUHIMIN
                </div>
                <ul className="footer-col-links" style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
                  <li><Link href="/" style={{ color: "#64748B", textDecoration: "none", transition: "color 0.2s" }}>Accueil & Services</Link></li>
                  <li><Link href="/catalog" style={{ color: "#64748B", textDecoration: "none" }}>Catalogue Direct Usines</Link></li>
                  <li><Link href="/categories" style={{ color: "#64748B", textDecoration: "none" }}>Univers & Catégories Produits</Link></li>
                  <li><Link href="/quote-request" style={{ color: "#64748B", textDecoration: "none" }}>Demande de Devis Sur-Mesure</Link></li>
                  <li><Link href="/terms" style={{ color: "#64748B", textDecoration: "none" }}>Conditions Générales d'Utilisation</Link></li>
                </ul>
              </div>

              {/* COL 2: COMMANDES & ACHATS */}
              <div>
                <div className="footer-col-title" style={{ fontSize: 14, fontWeight: 900, color: "#0F172A", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Commandes & Fret
                </div>
                <ul className="footer-col-links" style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
                  <li><Link href="/cart" style={{ color: "#64748B", textDecoration: "none" }}>Mon Panier d'Achats</Link></li>
                  <li><Link href="/checkout" style={{ color: "#64748B", textDecoration: "none" }}>Fret & Livraison au Bénin</Link></li>
                  <li><Link href="/dashboard" style={{ color: "#64748B", textDecoration: "none" }}>Suivi de mes Commandes</Link></li>
                  <li><Link href="/shipping-policy" style={{ color: "#64748B", textDecoration: "none" }}>Délais & Tarifs d'Expédition</Link></li>
                  <li><Link href="/returns-warranty" style={{ color: "#64748B", textDecoration: "none" }}>Garantie & Conformité Usine</Link></li>
                </ul>
              </div>

              {/* COL 3: CATÉGORIES POPULAIRES */}
              <div>
                <div className="footer-col-title" style={{ fontSize: 14, fontWeight: 900, color: "#0F172A", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Catégories Usines
                </div>
                <ul className="footer-col-links" style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
                  <li><Link href="/catalog?cat=electronics" style={{ color: "#64748B", textDecoration: "none" }}>Électronique & High-Tech</Link></li>
                  <li><Link href="/catalog?cat=fashion" style={{ color: "#64748B", textDecoration: "none" }}>Mode, Chaussures & Textile</Link></li>
                  <li><Link href="/catalog?cat=home" style={{ color: "#64748B", textDecoration: "none" }}>Maison & Électroménager</Link></li>
                  <li><Link href="/catalog?cat=machinery" style={{ color: "#64748B", textDecoration: "none" }}>Machines & Outillage PME</Link></li>
                  <li><Link href="/catalog?cat=beauty" style={{ color: "#64748B", textDecoration: "none" }}>Beauté & Cosmétiques</Link></li>
                  <li><Link href="/catalog" style={{ color: "#165491", fontWeight: 700, textDecoration: "none" }}>Voir tout le catalogue →</Link></li>
                </ul>
              </div>

              {/* COL 4: SUPPORT & CONTACT */}
              <div>
                <div className="footer-col-title" style={{ fontSize: 14, fontWeight: 900, color: "#0F172A", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Support & Contact
                </div>
                <ul className="footer-col-links" style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
                  <li><Link href="/quote-request" style={{ color: "#64748B", textDecoration: "none" }}>Demander un Devis Gratuit</Link></li>
                  <li><Link href="/contact" style={{ color: "#64748B", textDecoration: "none" }}>Contactez notre Équipe</Link></li>
                  <li><Link href="/returns-warranty" style={{ color: "#64748B", textDecoration: "none" }}>Gestion des Litiges & Colis</Link></li>
                  <li><Link href="/shipping-policy" style={{ color: "#64748B", textDecoration: "none" }}>Hub Logistique Cotonou</Link></li>
                </ul>

                <div className="region-country-box" style={{ marginTop: 18, background: "#F8FAFC", padding: "12px 14px", borderRadius: 12, border: "1px solid #E2E8F0" }}>
                  <div className="region-country-label" style={{ fontSize: 11.5, fontWeight: 800, color: "#64748B", marginBottom: 4, textTransform: "uppercase" }}>Pays de Livraison</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 800, color: "#0F172A" }}>
                    <MapPin style={{ width: 15, height: 15, color: "#165491" }} />
                    <span>Bénin (Cotonou, Calavi & Régions)</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* 3. BOTTOM WIDGETS ROW (REAL PAYMENT LOGOS & SOCIAL LINKS) */}
        <div className="footer-bottom-widgets" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24, borderTop: "1px solid #E2E8F0", borderBottom: "1px solid #E2E8F0", padding: "20px 0", marginBottom: 20, flexWrap: "wrap" }}>
          {/* PAYMENT METHODS */}
          <div>
            <div className="widget-title" style={{ fontSize: 12.5, fontWeight: 800, color: "#0F172A", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>Moyens de Paiement Sécurisés</div>
            <div className="payment-methods-row" style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <div className="pay-logo-badge" title="MTN Mobile Money" style={{ background: "#FFFFFF", border: "1.5px solid #EAB308", borderRadius: 10, padding: "4px 10px", height: 38, display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.03)" }}>
                <img src="/images/payments/mtn.png" alt="MTN Mobile Money" style={{ height: 24, width: "auto", objectFit: "contain" }} />
              </div>
              <div className="pay-logo-badge" title="Moov Africa" style={{ background: "#FFFFFF", border: "1.5px solid #2563EB", borderRadius: 10, padding: "4px 10px", height: 38, display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.03)" }}>
                <img src="/images/payments/moov_africa_official.png" alt="Moov Africa" style={{ height: 24, width: "auto", objectFit: "contain" }} />
              </div>
              <div className="pay-logo-badge" title="VISA" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 10, padding: "4px 10px", height: 38, display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.03)" }}>
                <img src="/images/payments/visa.png" alt="VISA" style={{ height: 20, width: "auto", objectFit: "contain" }} />
              </div>
              <div className="pay-logo-badge" title="Mastercard" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 10, padding: "4px 10px", height: 38, display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.03)" }}>
                <img src="/images/payments/mastercard.png" alt="Mastercard" style={{ height: 22, width: "auto", objectFit: "contain" }} />
              </div>
            </div>
          </div>

          {/* SOCIAL LINKS */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <div className="widget-title" style={{ fontSize: 12.5, fontWeight: 800, color: "#0F172A", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>Suivez FENOUHIMIN</div>
            <div className="social-circle-buttons" style={{ display: "flex", gap: 12, alignItems: "center" }}>
              {/* FACEBOOK */}
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noreferrer"
                title="Facebook FENOUHIMIN"
                style={{
                  width: 40,
                  height: 40,
                  background: "#1877F2",
                  color: "#FFFFFF",
                  borderRadius: "50%",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  boxShadow: "0 4px 12px rgba(24, 119, 242, 0.3)",
                }}
              >
                <Facebook style={{ width: 18, height: 18, fill: "#FFFFFF", stroke: "#1877F2", strokeWidth: 1 }} />
              </a>

              {/* INSTAGRAM */}
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noreferrer"
                title="Instagram FENOUHIMIN"
                style={{
                  width: 40,
                  height: 40,
                  background: "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%,#d6249f 60%,#285AEB 90%)",
                  color: "#FFFFFF",
                  borderRadius: "50%",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  boxShadow: "0 4px 12px rgba(220, 39, 67, 0.3)",
                }}
              >
                <Instagram style={{ width: 18, height: 18, stroke: "#FFFFFF", strokeWidth: 2, fill: "none" }} />
              </a>

              {/* TIKTOK */}
              <a 
                href="https://tiktok.com" 
                target="_blank" 
                rel="noreferrer"
                title="TikTok FENOUHIMIN"
                style={{
                  width: 40,
                  height: 40,
                  background: "#000000",
                  color: "#FFFFFF",
                  borderRadius: "50%",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                }}
              >
                <svg viewBox="0 0 24 24" fill="#FFFFFF" style={{ width: 17, height: 17 }}>
                  <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 2.49 6.34 6.34 0 0 0 1.077 8.371 6.342 6.342 0 0 0 8.016-.324 6.34 6.34 0 0 0 1.764-4.256V9.162a8.163 8.163 0 0 0 4.773 1.524V7.24a4.826 4.826 0 0 1-1.003-.554z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* 4. LEGAL BOTTOM BAR */}
        <div className="footer-legal-bar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: "#64748B", flexWrap: "wrap", gap: 12 }}>
          <div>© FENOUHIMIN. Tous droits réservés.</div>
          <div className="footer-legal-links" style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <Link href="/privacy-policy" style={{ color: "#64748B", textDecoration: "none" }}>Politique de Confidentialité</Link>
            <Link href="/terms" style={{ color: "#64748B", textDecoration: "none" }}>Conditions d'Utilisation</Link>
            <Link href="/returns-warranty" style={{ color: "#64748B", textDecoration: "none" }}>Garantie & Retours</Link>
            <Link href="/shipping-policy" style={{ color: "#64748B", textDecoration: "none" }}>Politique d'Expédition</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
