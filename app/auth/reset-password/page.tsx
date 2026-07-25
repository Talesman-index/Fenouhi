"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { z } from "zod";
import { Lock, AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";

const resetPasswordSchema = z.object({
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setFieldErrors({});

    const result = resetPasswordSchema.safeParse({ password, confirmPassword });
    if (!result.success) {
      const formattedErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          formattedErrors[issue.path[0] as string] = issue.message;
        }
      });
      setFieldErrors(formattedErrors);
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
    } else {
      router.push("/auth/login?message=PasswordResetSuccess");
    }
  };

  return (
    <div style={{ padding: "50px 0", background: "var(--bg-main)" }}>
      <div className="container" style={{ maxWidth: 460, margin: "0 auto" }}>
        <div className="card admin-card" style={{ padding: 32 }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--orange-light)", color: "var(--orange-primary)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
              <Lock style={{ width: 28 }} />
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--navy-dark)", margin: "4px 0" }}>
              Nouveau Mot de Passe
            </h1>
            <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>
              Saisissez votre nouveau mot de passe pour sécuriser votre compte.
            </p>
          </div>

          {errorMsg && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", color: "#991B1B", padding: 12, borderRadius: "var(--radius-sm)", marginBottom: 20, fontSize: 13, display: "flex", gap: 10, alignItems: "center" }}>
              <AlertCircle style={{ width: 18, flexShrink: 0 }} />
              <div>{errorMsg}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 800, color: "var(--navy-dark)", display: "block", marginBottom: 6 }}>
                NOUVEAU MOT DE PASSE (MIN. 8 CARACTÈRES) *
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="admin-input"
                  style={{ paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
                >
                  {showPassword ? <EyeOff style={{ width: 16 }} /> : <Eye style={{ width: 16 }} />}
                </button>
              </div>
              {fieldErrors.password && <span style={{ color: "#EF4444", fontSize: 11, marginTop: 4, display: "block" }}>{fieldErrors.password}</span>}
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 800, color: "var(--navy-dark)", display: "block", marginBottom: 6 }}>
                CONFIRMER LE NOUVEAU MOT DE PASSE *
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="admin-input"
              />
              {fieldErrors.confirmPassword && <span style={{ color: "#EF4444", fontSize: 11, marginTop: 4, display: "block" }}>{fieldErrors.confirmPassword}</span>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-orange admin-btn"
              style={{ padding: 14, fontSize: 15, marginTop: 6 }}
            >
              {loading ? "Enregistrement..." : "Enregistrer Mon Nouveau Mot de Passe"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
