"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { z } from "zod";
import { UserPlus, ArrowRight, AlertCircle, CheckCircle2, ShieldCheck, Eye, EyeOff } from "lucide-react";
import type { AccountType } from "@/types/supabase";

const signUpSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Adresse email invalide"),
  phone: z.string().min(6, "Numéro de téléphone invalide"),
  country: z.string().min(2, "Veuillez sélectionner votre pays"),
  city: z.string().min(2, "Veuillez préciser votre ville"),
  accountType: z.enum(["individual", "reseller", "business"] as const),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "Vous devez accepter les conditions d'utilisation",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type SignUpFormData = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<SignUpFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "Bénin",
    city: "Cotonou",
    accountType: "individual",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setServerError(null);

    const result = signUpSchema.safeParse(formData);
    if (!result.success) {
      const formattedErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          formattedErrors[issue.path[0] as string] = issue.message;
        }
      });
      setErrors(formattedErrors);
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          country: formData.country,
          city: formData.city,
          account_type: formData.accountType,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (error) {
      setServerError(error.message);
    } else {
      router.push(`/auth/check-email?email=${encodeURIComponent(formData.email)}`);
    }
  };

  return (
    <div style={{ padding: "40px 0", background: "var(--bg-main)" }}>
      <div className="container" style={{ maxWidth: 620, margin: "0 auto" }}>
        
        <div className="card admin-card" style={{ padding: 32 }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <span className="badge" style={{ background: "var(--orange-light)", color: "var(--orange-hover)", marginBottom: 8 }}>
              INSCRIPTION COMMERÇANT & PME
            </span>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: "var(--navy-dark)", margin: "4px 0" }}>
              Créer un Compte CargoLink
            </h1>
            <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>
              Accédez à nos tarifs usines Chine et au suivi logistique en temps réel.
            </p>
          </div>

          {serverError && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", color: "#991B1B", padding: 12, borderRadius: "var(--radius-sm)", marginBottom: 20, fontSize: 13, display: "flex", gap: 10, alignItems: "center" }}>
              <AlertCircle style={{ width: 18, flexShrink: 0 }} />
              <div>{serverError}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            
            {/* PRÉNOM & NOM */}
            <div className="grid-2" style={{ gap: 16 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: "var(--navy-dark)", display: "block", marginBottom: 6 }}>
                  PRÉNOM *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Jean Marc"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="admin-input"
                  style={{ borderColor: errors.firstName ? "#EF4444" : undefined }}
                />
                {errors.firstName && <span style={{ color: "#EF4444", fontSize: 11, marginTop: 4, display: "block" }}>{errors.firstName}</span>}
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: "var(--navy-dark)", display: "block", marginBottom: 6 }}>
                  NOM *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Koffi"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="admin-input"
                  style={{ borderColor: errors.lastName ? "#EF4444" : undefined }}
                />
                {errors.lastName && <span style={{ color: "#EF4444", fontSize: 11, marginTop: 4, display: "block" }}>{errors.lastName}</span>}
              </div>
            </div>

            {/* EMAIL & TÉLÉPHONE */}
            <div className="grid-2" style={{ gap: 16 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: "var(--navy-dark)", display: "block", marginBottom: 6 }}>
                  ADRESSE EMAIL *
                </label>
                <input
                  type="email"
                  required
                  placeholder="exemple@domaine.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="admin-input"
                  style={{ borderColor: errors.email ? "#EF4444" : undefined }}
                />
                {errors.email && <span style={{ color: "#EF4444", fontSize: 11, marginTop: 4, display: "block" }}>{errors.email}</span>}
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: "var(--navy-dark)", display: "block", marginBottom: 6 }}>
                  TÉLÉPHONE WHATSAPP *
                </label>
                <input
                  type="text"
                  required
                  placeholder="+229 97 00 11 22"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="admin-input"
                  style={{ borderColor: errors.phone ? "#EF4444" : undefined }}
                />
                {errors.phone && <span style={{ color: "#EF4444", fontSize: 11, marginTop: 4, display: "block" }}>{errors.phone}</span>}
              </div>
            </div>

            {/* PAYS & VILLE */}
            <div className="grid-2" style={{ gap: 16 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: "var(--navy-dark)", display: "block", marginBottom: 6 }}>
                  PAYS DE LIVRAISON *
                </label>
                <select
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="admin-input"
                  style={{ background: "#FFF" }}
                >
                  <option value="Bénin">🇧🇯 Bénin</option>
                  <option value="Togo">🇹🇬 Togo</option>
                  <option value="Côte d'Ivoire">🇨🇮 Côte d'Ivoire</option>
                  <option value="Sénégal">🇸🇳 Sénégal</option>
                  <option value="Cameroun">🇨🇲 Cameroun</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: "var(--navy-dark)", display: "block", marginBottom: 6 }}>
                  VILLE *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Cotonou"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="admin-input"
                  style={{ borderColor: errors.city ? "#EF4444" : undefined }}
                />
                {errors.city && <span style={{ color: "#EF4444", fontSize: 11, marginTop: 4, display: "block" }}>{errors.city}</span>}
              </div>
            </div>

            {/* TYPE DE COMPTE */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 800, color: "var(--navy-dark)", display: "block", marginBottom: 6 }}>
                TYPE DE COMPTE COMMERÇANT *
              </label>
              <select
                value={formData.accountType}
                onChange={(e) => setFormData({ ...formData, accountType: e.target.value as AccountType })}
                className="admin-input"
                style={{ background: "#FFF" }}
              >
                <option value="individual">Particulier / Acheteur Individuel</option>
                <option value="reseller">Revendeur / Boutique Physique ou En Ligne</option>
                <option value="business">Entreprise / PME Importatrice</option>
              </select>
            </div>

            {/* MOT DE PASSE & CONFIRMATION */}
            <div className="grid-2" style={{ gap: 16 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: "var(--navy-dark)", display: "block", marginBottom: 6 }}>
                  MOT DE PASSE (MIN. 8 CARACTÈRES) *
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="admin-input"
                    style={{ borderColor: errors.password ? "#EF4444" : undefined, paddingRight: 40 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
                  >
                    {showPassword ? <EyeOff style={{ width: 16 }} /> : <Eye style={{ width: 16 }} />}
                  </button>
                </div>
                {errors.password && <span style={{ color: "#EF4444", fontSize: 11, marginTop: 4, display: "block" }}>{errors.password}</span>}
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: "var(--navy-dark)", display: "block", marginBottom: 6 }}>
                  CONFIRMER MOT DE PASSE *
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="admin-input"
                  style={{ borderColor: errors.confirmPassword ? "#EF4444" : undefined }}
                />
                {errors.confirmPassword && <span style={{ color: "#EF4444", fontSize: 11, marginTop: 4, display: "block" }}>{errors.confirmPassword}</span>}
              </div>
            </div>

            {/* CONDITIONS GENERALES */}
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginTop: 6 }}>
              <input
                type="checkbox"
                id="acceptTerms"
                checked={formData.acceptTerms}
                onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                style={{ marginTop: 2 }}
              />
              <label htmlFor="acceptTerms" style={{ fontSize: 12.5, color: "var(--text-muted)", cursor: "pointer" }}>
                J'accepte les <Link href="/terms" target="_blank" style={{ color: "var(--orange-primary)", fontWeight: 700 }}>Conditions Générales</Link> et la <Link href="/privacy-policy" target="_blank" style={{ color: "var(--orange-primary)", fontWeight: 700 }}>Politique de Confidentialité</Link> de CargoLink Africa.
              </label>
            </div>
            {errors.acceptTerms && <span style={{ color: "#EF4444", fontSize: 11 }}>{errors.acceptTerms}</span>}

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-orange admin-btn"
              style={{ padding: 14, fontSize: 15, marginTop: 10 }}
            >
              {loading ? "Création du compte..." : "Créer Mon Compte Client"}
            </button>

            <div style={{ textAlign: "center", fontSize: 13, color: "var(--text-muted)", marginTop: 12 }}>
              Vous avez déjà un compte ?{" "}
              <Link href="/auth/login" style={{ color: "var(--navy-dark)", fontWeight: 800 }}>
                Se connecter
              </Link>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
