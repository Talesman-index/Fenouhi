"use client";

import React from "react";
import Link from "next/link";
import { Store, Box, CreditCard, Headphones, Facebook, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="footer-wrapper">
      <div className="container">
        {/* 1. GUARANTEE CARDS ROW (4 FLOATING WHITE CARDS) */}
        <div className="guarantee-cards-row">
          <div className="guarantee-card">
            <div className="guarantee-card-icon">
              <Store style={{ width: 26, height: 26 }} />
            </div>
            <div>
              <div className="guarantee-card-title">Free in-store pick up</div>
              <div className="guarantee-card-sub">24/7 Amazing services</div>
            </div>
          </div>

          <div className="guarantee-card">
            <div className="guarantee-card-icon">
              <Box style={{ width: 26, height: 26 }} />
            </div>
            <div>
              <div className="guarantee-card-title">Free Shipping</div>
              <div className="guarantee-card-sub">24/7 Amazing services</div>
            </div>
          </div>

          <div className="guarantee-card">
            <div className="guarantee-card-icon">
              <CreditCard style={{ width: 26, height: 26 }} />
            </div>
            <div>
              <div className="guarantee-card-title">Flexible Payment</div>
              <div className="guarantee-card-sub">24/7 Amazing services</div>
            </div>
          </div>

          <div className="guarantee-card">
            <div className="guarantee-card-icon">
              <Headphones style={{ width: 26, height: 26 }} />
            </div>
            <div>
              <div className="guarantee-card-title">Convenient help</div>
              <div className="guarantee-card-sub">24/7 Amazing services</div>
            </div>
          </div>
        </div>

        {/* 2. MAIN 4 NAVIGATION COLUMNS */}
        <div className="footer-nav-grid">
          <div>
            <div className="footer-col-title">About CargoLink</div>
            <ul className="footer-col-links">
              <li><Link href="/">Company info</Link></li>
              <li><Link href="/suppliers">News & Usines Chine</Link></li>
              <li><Link href="/shipping-policy">Entrepôts Guangzhou & Shenzhen</Link></li>
              <li><Link href="/shipping-policy">Careers & Affiliés</Link></li>
              <li><Link href="/quote-request">Programme Revendeurs PME</Link></li>
              <li><Link href="/terms">Policies & Directives</Link></li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">Order & Purchases</div>
            <ul className="footer-col-links">
              <li><Link href="/dashboard?tab=orders">Check order Status</Link></li>
              <li><Link href="/shipping-policy">Shipping, Delivery & Pickup</Link></li>
              <li><Link href="/returns-warranty">Returns & Exchanges</Link></li>
              <li><Link href="/returns-warranty">Price Match Guarantee</Link></li>
              <li><Link href="/quote-request">Demande de Devis Sur-Mesure</Link></li>
              <li><Link href="/quote-request">Trade In Program</Link></li>
              <li><Link href="/quote-request">Gift Cards & Bons d'achat</Link></li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">Popular Categories</div>
            <ul className="footer-col-links">
              <li><Link href="/catalog?cat=electronics">Smartphones & High-Tech</Link></li>
              <li><Link href="/catalog?cat=fashion">Mode & Chaussures Gros</Link></li>
              <li><Link href="/catalog?cat=appliances">Maison & Électroménager</Link></li>
              <li><Link href="/catalog?cat=machinery">Machines & Outillage PME</Link></li>
              <li><Link href="/catalog?cat=beauty">Beauté & Cosmétiques</Link></li>
              <li><Link href="/catalog">Toutes les catégories</Link></li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">Support & Services</div>
            <ul className="footer-col-links">
              <li><Link href="/suppliers">Espace Fournisseurs Chine</Link></li>
              <li><Link href="/contact">Contact Us</Link></li>
              <li><Link href="/returns-warranty">Gestion des litiges colis</Link></li>
              <li><Link href="/returns-warranty">CargoLink Money Back Guarantee</Link></li>
            </ul>

            <div className="region-country-box" style={{ marginTop: 20 }}>
              <div className="region-country-label" style={{ fontSize: 13, fontWeight: 800, color: "#0F172A", marginBottom: 6 }}>Region Country</div>
              <select className="region-select-pill">
                <option>🇧🇯 Bénin (Cotonou)</option>
                <option>🇹🇬 Togo (Lomé)</option>
                <option>🇨🇮 Côte d'Ivoire (Abidjan)</option>
                <option>🇸🇳 Sénégal (Dakar)</option>
                <option>🇨🇲 Cameroun (Douala)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. BOTTOM WIDGETS ROW (REAL PAYMENT LOGOS & 3 SOCIALS: FACEBOOK, INSTAGRAM, TIKTOK) */}
        <div className="footer-bottom-widgets" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24, borderTop: "1px solid #E2E8F0", borderBottom: "1px solid #E2E8F0", padding: "20px 0", marginBottom: 20 }}>
          {/* PAYMENT METHODS (REAL IMAGE LOGOS) */}
          <div>
            <div className="widget-title" style={{ fontSize: 13, fontWeight: 800, color: "#0F172A", marginBottom: 10 }}>Payment Method</div>
            <div className="payment-methods-row" style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <div className="pay-logo-badge" title="Kkiapay" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 8, padding: "4px 10px", height: 38, display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.03)" }}>
                <img src="/images/payments/kkiapay.png" alt="Kkiapay" style={{ height: 22, width: "auto", objectFit: "contain" }} />
              </div>
              <div className="pay-logo-badge" title="Celtiis Cash" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 8, padding: "4px 10px", height: 38, display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.03)" }}>
                <img src="/images/payments/celtiis.png" alt="Celtiis Cash" style={{ height: 22, width: "auto", objectFit: "contain" }} />
              </div>
              <div className="pay-logo-badge" title="MTN Mobile Money" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 8, padding: "4px 10px", height: 38, display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.03)" }}>
                <img src="/images/payments/mtn.png" alt="MTN Mobile Money" style={{ height: 22, width: "auto", objectFit: "contain" }} />
              </div>
              <div className="pay-logo-badge" title="Moov Africa" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 8, padding: "4px 10px", height: 38, display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.03)" }}>
                <img src="/images/payments/moov.png" alt="Moov Africa" style={{ height: 22, width: "auto", objectFit: "contain" }} />
              </div>
              <div className="pay-logo-badge" title="VISA" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 8, padding: "4px 10px", height: 38, display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.03)" }}>
                <img src="/images/payments/visa.png" alt="VISA" style={{ height: 20, width: "auto", objectFit: "contain" }} />
              </div>
              <div className="pay-logo-badge" title="Mastercard" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 8, padding: "4px 10px", height: 38, display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.03)" }}>
                <img src="/images/payments/mastercard.png" alt="Mastercard" style={{ height: 22, width: "auto", objectFit: "contain" }} />
              </div>
            </div>
          </div>

          {/* STAY CONNECTED (ONLY 3 SOCIALS: FACEBOOK, INSTAGRAM, TIKTOK) */}
          <div style={{ textAlign: "right" }}>
            <div className="widget-title" style={{ fontSize: 13, fontWeight: 800, color: "#0F172A", marginBottom: 10 }}>Stay Connected</div>
            <div className="social-circle-buttons" style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              {/* FACEBOOK */}
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noreferrer"
                title="Facebook CargoLink"
                className="social-circle-btn" 
                style={{ width: 36, height: 36, background: "#1877F2", color: "#FFF", borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", textDecoration: "none", boxShadow: "0 2px 6px rgba(24,119,242,0.3)" }}
              >
                <Facebook style={{ width: 18, height: 18 }} />
              </a>

              {/* INSTAGRAM */}
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noreferrer"
                title="Instagram CargoLink"
                className="social-circle-btn" 
                style={{ width: 36, height: 36, background: "linear-gradient(45deg, #F09433 0%, #E6683C 25%, #DC2743 50%, #CC2366 75%, #BC1888 100%)", color: "#FFF", borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", textDecoration: "none", boxShadow: "0 2px 6px rgba(220,39,67,0.3)" }}
              >
                <Instagram style={{ width: 18, height: 18 }} />
              </a>

              {/* TIKTOK */}
              <a 
                href="https://tiktok.com" 
                target="_blank" 
                rel="noreferrer"
                title="TikTok CargoLink"
                className="social-circle-btn" 
                style={{ width: 36, height: 36, background: "#000000", color: "#FFF", borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", textDecoration: "none", boxShadow: "0 2px 6px rgba(0,0,0,0.3)" }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 16, height: 16 }}>
                  <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 2.49 6.34 6.34 0 0 0 1.077 8.371 6.342 6.342 0 0 0 8.016-.324 6.34 6.34 0 0 0 1.764-4.256V9.162a8.163 8.163 0 0 0 4.773 1.524V7.24a4.826 4.826 0 0 1-1.003-.554z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* 4. LEGAL BOTTOM BAR */}
        <div className="footer-legal-bar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: "#64748B" }}>
          <div>© CargoLink All Rights Reserved.</div>
          <div className="footer-legal-links" style={{ display: "flex", gap: 20 }}>
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/terms">Terms of Use</Link>
            <Link href="/returns-warranty">Warranty Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
