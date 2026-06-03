"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────
type PaymentMethod = "mvola" | "orange_money" | "card";

type UserProfile = {
  id: string;
  email: string;
  whatsapp: string;
  name?: string;
};

// ─── Config paiement ──────────────────────────────────────────────────────────
const PRICE_MGA = 250000; // 150 000 Ariary ≈ 30€
const PRICE_DISPLAY = "250 000 Ar";
const MVOLA_NUMBER = "038 10 502 72";     // ← remplace par ton numéro MVola
const ORANGE_NUMBER = "038 10 502 72";   // ← remplace par ton numéro Orange Money

export default function PaymentPage() {
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [step, setStep] = useState<"choose" | "instructions" | "confirm" | "success">("choose");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [txRef, setTxRef] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { window.location.href = "/login"; return; }
      const { data: profile } = await supabase
        .from("profiles").select("*").eq("id", data.user.id).single();
      setUser({ id: data.user.id, email: data.user.email!, whatsapp: profile?.whatsapp || "", name: profile?.name || "" });
      setPhone(profile?.whatsapp || "");
    });
  }, []);

  // ─── Confirmer paiement mobile money ────────────────────────────────────────
  const confirmMobilePay = async () => {
    if (!txRef.trim()) { setError("Entre la référence de ta transaction"); return; }
    if (!phone.trim()) { setError("Entre ton numéro de téléphone"); return; }
    setLoading(true); setError("");

    // Enregistrer le paiement en base (status: pending — à confirmer manuellement côté admin)
    const { error: dbErr } = await supabase.from("payments").insert([{
      user_id: user?.id,
      email: user?.email,
      amount: PRICE_MGA,
      currency: "MGA",
      method: method,
      transaction_ref: txRef.trim(),
      status: "pending",
    }]);

    if (dbErr) { setError("Erreur : " + dbErr.message); setLoading(false); return; }

    // Envoyer email de confirmation (via Supabase Edge Function ou Resend)
    await fetch("/api/send-confirmation-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user?.email, name: user?.name, method, txRef }),
    });

    setLoading(false);
    setStep("success");
  };

  // ─── Paiement carte via PayDunya ─────────────────────────────────────────────
  const payWithCard = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/paydunya-init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: PRICE_MGA,
          email: user?.email,
          name: user?.name || user?.email,
          userId: user?.id,
        }),
      });
      const data = await res.json();
      if (data.redirect_url) {
        window.location.href = data.redirect_url;
      } else {
        setError("Erreur PayDunya : " + (data.error || "inconnue"));
      }
    } catch {
      setError("Impossible de joindre le service de paiement");
    }
    setLoading(false);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 14px", borderRadius: "10px",
    background: "#1e1e1e", border: "1px solid #2a2a2a",
    color: "#f0f0f0", fontSize: "14px", outline: "none", fontFamily: "inherit",
  };

  // ─── Step : choisir méthode ──────────────────────────────────────────────────
  const ChooseStep = () => (
    <div>
      <p style={{ color: "#888", fontSize: "14px", marginBottom: "1.5rem", lineHeight: 1.6 }}>
        Choisis ta méthode de paiement pour activer ton programme personnalisé.
      </p>

      {/* Cards méthode */}
      {[
        { id: "mvola" as PaymentMethod, label: "MVola", sub: "Telma — Paiement mobile", icon: "📱", color: "#e60000" },
        { id: "orange_money" as PaymentMethod, label: "Orange Money", sub: "Orange Madagascar", icon: "🟠", color: "#ff7700" },
        { id: "card" as PaymentMethod, label: "Carte bancaire", sub: "Visa / Mastercard via PayDunya", icon: "💳", color: "#3b82f6" },
      ].map((m) => (
        <button
          key={m.id}
          onClick={() => setMethod(m.id)}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: "14px",
            background: method === m.id ? "#1a1a2e" : "#1e1e1e",
            border: `1px solid ${method === m.id ? "#F5C842" : "#2a2a2a"}`,
            borderRadius: "12px", padding: "14px 16px", cursor: "pointer",
            marginBottom: "10px", transition: "all 0.15s", textAlign: "left",
          }}
        >
          <span style={{ fontSize: "24px" }}>{m.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#f0f0f0", fontWeight: 500, fontSize: "15px" }}>{m.label}</div>
            <div style={{ color: "#666", fontSize: "12px", marginTop: "2px" }}>{m.sub}</div>
          </div>
          <div style={{ width: "18px", height: "18px", borderRadius: "50%", border: `2px solid ${method === m.id ? "#F5C842" : "#444"}`, background: method === m.id ? "#F5C842" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {method === m.id && <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#000" }} />}
          </div>
        </button>
      ))}

      {/* Prix */}
      <div style={{ background: "#1a1600", border: "1px solid #3a2e00", borderRadius: "12px", padding: "16px", marginTop: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ color: "#888", fontSize: "12px" }}>Programme 3 mois complet</div>
          <div style={{ color: "#F5C842", fontSize: "22px", fontWeight: 700, marginTop: "4px" }}>{PRICE_DISPLAY}</div>
        </div>
        <div style={{ color: "#555", fontSize: "12px", textAlign: "right" }}>
          Paiement unique<br />Accès à vie
        </div>
      </div>

      <button
        onClick={() => { if (!method) { setError("Choisis une méthode"); return; } setError(""); method === "card" ? payWithCard() : setStep("instructions"); }}
        disabled={!method || loading}
        style={{ width: "100%", marginTop: "1rem", background: method ? "#F5C842" : "#333", color: method ? "#000" : "#666", border: "none", padding: "14px", borderRadius: "12px", fontSize: "15px", fontWeight: 600, cursor: method ? "pointer" : "not-allowed" }}
      >
        {loading ? "Chargement..." : "Continuer →"}
      </button>
    </div>
  );

  // ─── Step : instructions mobile money ───────────────────────────────────────
  const InstructionsStep = () => {
    const isMvola = method === "mvola";
    const number = isMvola ? MVOLA_NUMBER : ORANGE_NUMBER;
    const appName = isMvola ? "MVola" : "Orange Money";

    return (
      <div>
        <div style={{ background: "#0d1a0d", border: "1px solid #1a3a1a", borderRadius: "12px", padding: "16px", marginBottom: "1.5rem" }}>
          <div style={{ color: "#5faa5f", fontWeight: 500, marginBottom: "12px", fontSize: "14px" }}>
            📋 Instructions {appName}
          </div>
          {[
            `Ouvre l'application ${appName} sur ton téléphone`,
            `Va dans "Envoyer de l'argent" ou "Paiement marchand"`,
            `Entre le numéro : ${number}`,
            `Montant : ${PRICE_DISPLAY}`,
            `Motif : SHINEUP - ${user?.email}`,
            "Confirme avec ton code PIN",
            "Note la référence de transaction affichée",
          ].map((step, i) => (
            <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "8px", fontSize: "13px", color: "#ccc" }}>
              <span style={{ color: "#F5C842", fontWeight: 600, minWidth: "20px" }}>{i + 1}.</span>
              <span>{step}</span>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", fontSize: "13px", color: "#888", marginBottom: "6px" }}>
            Référence de transaction *
          </label>
          <input style={inputStyle} value={txRef} placeholder="Ex: MVola-123456789"
            onChange={(e) => setTxRef(e.target.value)} />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", fontSize: "13px", color: "#888", marginBottom: "6px" }}>
            Ton numéro {appName} *
          </label>
          <input style={inputStyle} value={phone} placeholder="Ex: 034 XX XXX XX"
            onChange={(e) => setPhone(e.target.value)} />
        </div>

        <button onClick={confirmMobilePay} disabled={loading}
          style={{ width: "100%", background: "#F5C842", color: "#000", border: "none", padding: "14px", borderRadius: "12px", fontSize: "15px", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? "Vérification..." : "Confirmer mon paiement ✓"}
        </button>

        <button onClick={() => setStep("choose")}
          style={{ width: "100%", background: "none", border: "none", color: "#666", padding: "10px", cursor: "pointer", fontSize: "13px", marginTop: "6px" }}>
          ← Changer de méthode
        </button>
      </div>
    );
  };

  // ─── Step : succès ───────────────────────────────────────────────────────────
  const SuccessStep = () => (
    <div style={{ textAlign: "center", padding: "1rem 0" }}>
      <div style={{ fontSize: "56px", marginBottom: "1rem" }}>🎉</div>
      <h2 style={{ color: "#F5C842", fontSize: "22px", fontWeight: 700, marginBottom: "8px" }}>
        Paiement reçu !
      </h2>
      <p style={{ color: "#888", fontSize: "14px", lineHeight: 1.7, marginBottom: "1.5rem" }}>
        Ton paiement est en cours de vérification.<br />
        Tu recevras un email de confirmation sous peu, et ton programme personnalisé complet sera envoyé <strong style={{ color: "#f0f0f0" }}>dans les 48h</strong>.
      </p>
      <div style={{ background: "#1a1600", border: "1px solid #3a2e00", borderRadius: "12px", padding: "16px", marginBottom: "1.5rem", fontSize: "13px", color: "#c9a820" }}>
        📱 On te contactera aussi sur WhatsApp <strong>{user?.whatsapp}</strong> pour le suivi hebdomadaire.
      </div>
      <button onClick={() => window.location.href = "/dashboard"}
        style={{ width: "100%", background: "#F5C842", color: "#000", border: "none", padding: "14px", borderRadius: "12px", fontSize: "15px", fontWeight: 600, cursor: "pointer" }}>
        Accéder à mon espace →
      </button>
    </div>
  );

  return (
    <main style={{ minHeight: "100vh", background: "#0a0a0a", color: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1rem" }}>
      <div style={{ width: "100%", maxWidth: "460px", background: "#141414", borderRadius: "20px", padding: "2rem" }}>

        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "28px", color: "#F5C842", textAlign: "center", letterSpacing: "3px", marginBottom: "4px" }}>
          SHINEUP
        </h1>
        <p style={{ textAlign: "center", fontSize: "13px", color: "#666", marginBottom: "1.5rem" }}>
          {step === "success" ? "Confirmation" : "Finalise ton abonnement"}
        </p>

        {/* Étapes visuelles */}
        {step !== "success" && (
          <div style={{ display: "flex", gap: "6px", marginBottom: "1.5rem" }}>
            {["Méthode", "Instructions", "Confirmation"].map((s, i) => {
              const idx = step === "choose" ? 0 : step === "instructions" ? 1 : 2;
              return (
                <div key={i} style={{ flex: 1, height: "3px", borderRadius: "99px", background: i <= idx ? "#F5C842" : "#2a2a2a", transition: "background 0.3s" }} />
              );
            })}
          </div>
        )}

        {error && (
          <div style={{ background: "#3a0a0a", border: "1px solid #7a1a1a", borderRadius: "10px", padding: "12px", fontSize: "13px", color: "#f87171", marginBottom: "1rem" }}>
            {error}
          </div>
        )}

        {step === "choose" && <ChooseStep />}
        {step === "instructions" && <InstructionsStep />}
        {step === "success" && <SuccessStep />}
      </div>
    </main>
  );
}
