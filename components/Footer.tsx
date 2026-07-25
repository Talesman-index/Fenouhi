"use client";

import React from "react";
import Link from "next/link";
import { Store, Box, CreditCard, Headphones } from "lucide-react";

export default function Footer() {
  return (
    <footer className="footer-wrapper">
      <div className="container">
        {/* GUARANTEE CARDS ROW */}
        <div className="guarantee-cards-row">
          <div className="guarantee-card">
            <div className="guarantee-card-icon">
              <Store style={{ width: 28, height: 28 }} />
            </div>
            <div>
              <div className="guarantee-card-title">Retrait Entrepôt Gratuit</div>
              <div className="guarantee-card-sub">Dépôt Cotonou & Guangzhou</div>
            </div>
          </div>

          <div className="guarantee-card">
            <div className="guarantee-card-icon">
              <Box style={{ width: 28, height: 28 }} />
            </div>
            <div>
              <div className="guarantee-card-title">Fret Aérien & Maritime</div>
              <div className="guarantee-card-sub">Livraison express 5-10 jours</div>
            </div>
          </div>

          <div className="guarantee-card">
            <div className="guarantee-card-icon">
              <CreditCard style={{ width: 28, height: 28 }} />
            </div>
            <div>
              <div className="guarantee-card-title">Paiement Flexible</div>
              <div className="guarantee-card-sub">Kkiapay, Celtiis, MTN, Moov</div>
            </div>
          </div>

          <div className="guarantee-card">
            <div className="guarantee-card-icon">
              <Headphones style={{ width: 28, height: 28 }} />
            </div>
            <div>
              <div className="guarantee-card-title">Assistance 7j/7</div>
              <div className="guarantee-card-sub">Support WhatsApp dédié</div>
            </div>
          </div>
        </div>

        {/* 4 NAVIGATION COLUMNS */}
        <div className="footer-nav-grid">
          <div>
            <div className="footer-col-title">À propos de CargoLink</div>
            <ul className="footer-col-links">
              <li><Link href="/">Présentation de la plateforme</Link></li>
              <li><Link href="/suppliers">Réseau d'usines partenaires</Link></li>
              <li><Link href="/shipping-policy">Entrepôts Guangzhou & Shenzhen</Link></li>
              <li><Link href="/shipping-policy">Dédouanement Afrique de l'Ouest</Link></li>
              <li><Link href="/quote-request">Programme Revendeurs PME</Link></li>
              <li><Link href="/terms">Mentions & Directives</Link></li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">Commandes & Achats</div>
            <ul className="footer-col-links">
              <li><Link href="/dashboard?tab=orders">Vérifier le statut du colis</Link></li>
              <li><Link href="/shipping-policy">Politique d'Expédition & Fret</Link></li>
              <li><Link href="/returns-warranty">Retours & Garanties Colis</Link></li>
              <li><Link href="/returns-warranty">Garantie Meilleur Prix Usine</Link></li>
              <li><Link href="/quote-request">Demande de Devis Sur-Mesure</Link></li>
              <li><Link href="/quote-request">Programme Trade-In / Import</Link></li>
              <li><Link href="/quote-request">Bons d'achat & Avantages PME</Link></li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">Catégories Populaires</div>
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
              <li><Link href="/contact">Contactez le Support Client</Link></li>
              <li><Link href="/returns-warranty">Gestion des litiges colis</Link></li>
              <li><Link href="/returns-warranty">Garantie Remboursement CargoLink</Link></li>
            </ul>

            <div className="region-country-box">
              <div className="region-country-label">Pays de Livraison</div>
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

        {/* BOTTOM 2 WIDGET COLUMNS */}
        <div className="footer-bottom-widgets">
          <div>
            <div className="widget-title">Moyens de Paiement Sécurisés</div>
            <div className="payment-methods-row">
              <div className="pay-logo-badge" title="Kkiapay"><img src="/images/payments/kkiapay.png" alt="Kkiapay" /></div>
              <div className="pay-logo-badge" title="Celtiis Cash"><img src="/images/payments/celtiis.png" alt="Celtiis" /></div>
              <div className="pay-logo-badge" title="MTN Mobile Money"><img src="/images/payments/mtn.png" alt="MTN Mobile Money" /></div>
              <div className="pay-logo-badge" title="Moov Africa"><img src="/images/payments/moov.png" alt="Moov Africa" /></div>
              <div className="pay-logo-badge" title="VISA"><img src="/images/payments/visa.png" alt="VISA" /></div>
              <div className="pay-logo-badge" title="Mastercard"><img src="/images/payments/mastercard.png" alt="Mastercard" /></div>
            </div>
          </div>

          <div>
            <div className="widget-title">Restez Connecté</div>
            <div className="social-circle-buttons">
              <a href="https://wa.me/22997001122" target="_blank" rel="noopener noreferrer" className="social-circle-btn" title="WhatsApp Direct">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
              </a>
            </div>
          </div>
        </div>

        {/* LEGAL BOTTOM BAR */}
        <div className="footer-legal-bar">
          <div>© 2026 CargoLink Africa. Tous droits réservés.</div>
          <div className="footer-legal-links">
            <Link href="/privacy-policy">Politique de Confidentialité</Link>
            <Link href="/terms">Conditions d'Utilisation</Link>
            <Link href="/returns-warranty">Politique de Garantie</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
