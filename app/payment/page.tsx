"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

type PaymentMethod = "mvola" | "orange_money" | "airtel_money" | "card";
type UserProfile = { id: string; email: string; whatsapp: string; name?: string };

const PRICE_MGA = 250000;
const PRICE_DISPLAY = "250 000 Ar";
const COACH_NUMBER = "038 10 502 72";
const COACH_NAME = "Steffy Lauren";

// ── Design tokens ──────────────────────────────────────────────────────────────
const inp: React.CSSProperties = {
  width: "100%", padding: "11px 14px", borderRadius: "8px",
  background: "#1A1C24", border: "1px solid rgba(255,255,255,0.07)",
  color: "#F2F0EB", fontSize: "14px", outline: "none",
  fontFamily: "inherit", boxSizing: "border-box",
};

export default function PaymentPage() {
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [step, setStep] = useState<"choose" | "instructions" | "pending" | "success">("choose");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [txRef, setTxRef] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { window.location.href = "/login"; return; }
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single();
      const { data: fd } = await supabase.from("form_data").select("name").eq("user_id", data.user.id).maybeSingle();
      setUser({ id: data.user.id, email: data.user.email!, whatsapp: profile?.whatsapp || "", name: fd?.name || "" });
      setPhone(profile?.whatsapp || "");
      if (profile?.subscription_status === "active") { window.location.href = "/dashboard"; return; }
      const { data: payment } = await supabase.from("payments").select("id,status").eq("user_id", data.user.id).in("status", ["pending", "confirmed"]).maybeSingle();
      if (payment) setStep("pending");
      setPageLoading(false);
    });
  }, []);

  const confirmMobilePay = async () => {
    if (!txRef.trim()) { setError("Entre la référence de ta transaction"); return; }
    if (!phone.trim()) { setError("Entre ton numéro de téléphone"); return; }
    setLoading(true); setError("");
    const { data: existing } = await supabase.from("payments").select("id").eq("user_id", user?.id).in("status", ["pending", "confirmed"]).maybeSingle();
    if (existing) { setStep("pending"); setLoading(false); return; }
    const { error: dbErr } = await supabase.from("payments").insert([{
      user_id: user?.id, email: user?.email, amount: PRICE_MGA, currency: "MGA",
      method, transaction_ref: txRef.trim(), phone_number: phone.trim(), status: "pending",
    }]);
    if (dbErr) { setError("Erreur : " + dbErr.message); setLoading(false); return; }
    await fetch("/api/send-confirmation-email", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user?.email, name: user?.name, method, txRef }),
    });
    setLoading(false); setStep("success");
  };

  const payWithCard = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/paydunya-init", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: PRICE_MGA, email: user?.email, name: user?.name, userId: user?.id }),
      });
      const data = await res.json();
      if (data.redirect_url) { window.location.href = data.redirect_url; }
      else setError("Erreur paiement : " + (data.error || "inconnue"));
    } catch { setError("Impossible de joindre le service de paiement"); }
    setLoading(false);
  };

  const handleContinue = () => {
    if (!method) { setError("Choisis une méthode de paiement"); return; }
    setError("");
    if (method === "card") payWithCard();
    else setStep("instructions");
  };

  const methodLabel = { mvola: "MVola", orange_money: "Orange Money", airtel_money: "Airtel Money", card: "Carte bancaire" };

  if (pageLoading) return (
    <main style={{ minHeight: "100vh", background: "#0A0B0D", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#C9A84C", fontFamily: "'Playfair Display', serif", fontSize: "18px" }}>Chargement...</div>
    </main>
  );

  return (
    <main style={{ minHeight: "100vh", background: "#0A0B0D", color: "#F2F0EB", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1rem" }}>
      <div style={{ width: "100%", maxWidth: "460px" }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "22px", fontWeight: 700, color: "#F2F0EB" }}>
            Dé<span style={{ color: "#C9A84C" }}>voile</span>
          </div>
          <div style={{ fontSize: "12px", color: "#4A4B52", marginTop: "4px" }}>
            {step === "success" || step === "pending" ? "Confirmation" : "Finalise ton abonnement"}
          </div>
        </div>

        {/* Card */}
        <div style={{ background: "#13141A", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "2rem" }}>

          {/* Progress steps */}
          {step !== "success" && step !== "pending" && (
            <div style={{ display: "flex", gap: "6px", marginBottom: "2rem" }}>
              {["Méthode", "Instructions", "Confirmation"].map((s, i) => {
                const idx = step === "choose" ? 0 : 1;
                return (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div style={{ height: "2px", borderRadius: "99px", background: i <= idx ? "#C9A84C" : "#1A1C24", transition: "background 0.3s" }} />
                    <div style={{ fontSize: "10px", color: i <= idx ? "#C9A84C" : "#4A4B52", textAlign: "center" }}>{s}</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── CHOOSE ── */}
          {step === "choose" && (
            <div>
              {/* Prix */}
              <div style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.15)", borderRadius: "12px", padding: "1.25rem", marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: "11px", color: "#4A4B52", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>Programme 3 mois complet</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", fontWeight: 700, color: "#C9A84C" }}>{PRICE_DISPLAY}</div>
                  <div style={{ fontSize: "12px", color: "#4A4B52", marginTop: "2px" }}>≈ 55€ · Paiement unique</div>
                </div>
                <div style={{ fontSize: "11px", color: "#4A4B52", textAlign: "right", lineHeight: 1.7 }}>
                  ✦ Plan alimentaire<br />✦ Programme sport<br />✦ Routine de vie<br />✦ Suivi 3 mois
                </div>
              </div>

              <p style={{ fontSize: "13px", color: "#8E8F96", marginBottom: "1.25rem" }}>Choisis ta méthode de paiement :</p>

              {[
                { id: "mvola" as PaymentMethod, label: "MVola", sub: "Telma — Paiement mobile", icon: "📱" },
                { id: "orange_money" as PaymentMethod, label: "Orange Money", sub: "Orange Madagascar", icon: "🟠" },
                { id: "airtel_money" as PaymentMethod, label: "Airtel Money", sub: "Airtel Madagascar", icon: "🔴" },
                { id: "card" as PaymentMethod, label: "Carte bancaire", sub: "Visa / Mastercard", icon: "💳" },
              ].map((m) => (
                <button key={m.id} onClick={() => setMethod(m.id)} style={{
                  width: "100%", display: "flex", alignItems: "center", gap: "14px",
                  background: method === m.id ? "rgba(201,168,76,0.07)" : "#1A1C24",
                  border: `1px solid ${method === m.id ? "#C9A84C" : "rgba(255,255,255,0.07)"}`,
                  borderRadius: "10px", padding: "14px 16px", cursor: "pointer",
                  marginBottom: "8px", textAlign: "left", transition: "all 0.15s", fontFamily: "inherit",
                }}>
                  <span style={{ fontSize: "22px" }}>{m.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "#F2F0EB", fontWeight: 500, fontSize: "14px" }}>{m.label}</div>
                    <div style={{ color: "#4A4B52", fontSize: "12px", marginTop: "2px" }}>{m.sub}</div>
                  </div>
                  <div style={{ width: "18px", height: "18px", borderRadius: "50%", border: `2px solid ${method === m.id ? "#C9A84C" : "rgba(255,255,255,0.15)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {method === m.id && <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#C9A84C" }} />}
                  </div>
                </button>
              ))}

              {error && <div style={{ background: "rgba(240,110,110,0.08)", border: "1px solid rgba(240,110,110,0.2)", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "#F06E6E", marginTop: "1rem" }}>{error}</div>}

              <button onClick={handleContinue} disabled={!method || loading} style={{
                width: "100%", marginTop: "1.25rem",
                background: method ? "#C9A84C" : "#1A1C24",
                color: method ? "#0A0B0D" : "#4A4B52",
                border: "none", padding: "14px", borderRadius: "99px",
                fontSize: "15px", fontWeight: 600, cursor: method ? "pointer" : "not-allowed",
                fontFamily: "inherit", transition: "all 0.15s",
              }}>
                {loading ? "Chargement..." : "Continuer →"}
              </button>
            </div>
          )}

          {/* ── INSTRUCTIONS MOBILE MONEY ── */}
          {step === "instructions" && method && method !== "card" && (
            <div>
              <div style={{ background: "rgba(159,232,112,0.06)", border: "1px solid rgba(159,232,112,0.15)", borderRadius: "10px", padding: "1rem", marginBottom: "1.5rem" }}>
                <div style={{ color: "#9FE870", fontWeight: 500, marginBottom: "12px", fontSize: "13px" }}>
                  📋 Instructions {methodLabel[method]}
                </div>
                {[
                  `Ouvre l'application ${methodLabel[method]} sur ton téléphone`,
                  `Va dans "Envoyer de l'argent" ou "Paiement marchand"`,
                  `Numéro : ${COACH_NUMBER} — ${COACH_NAME}`,
                  `Montant : ${PRICE_DISPLAY}`,
                  `Motif : DEVOILE`,
                  "Confirme avec ton code PIN",
                  "Note la référence de transaction affichée",
                ].map((s, i) => (
                  <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "8px", fontSize: "13px", color: "#8E8F96" }}>
                    <span style={{ color: "#C9A84C", fontWeight: 600, minWidth: "18px" }}>{i + 1}.</span>
                    <span>{s}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "12px", color: "#8E8F96", marginBottom: "6px" }}>Référence de transaction *</label>
                <input style={inp} value={txRef} placeholder="Ex: MVola-123456789" onChange={(e) => setTxRef(e.target.value)} />
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "12px", color: "#8E8F96", marginBottom: "6px" }}>Ton numéro {methodLabel[method]} *</label>
                <input style={inp} value={phone} placeholder="Ex: 034 XX XXX XX" onChange={(e) => setPhone(e.target.value)} type="tel" />
              </div>

              {error && <div style={{ background: "rgba(240,110,110,0.08)", border: "1px solid rgba(240,110,110,0.2)", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "#F06E6E", marginBottom: "12px" }}>{error}</div>}

              <button onClick={confirmMobilePay} disabled={loading} style={{ width: "100%", background: "#C9A84C", color: "#0A0B0D", border: "none", padding: "14px", borderRadius: "99px", fontSize: "15px", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                {loading ? "Vérification..." : "Confirmer mon paiement ✦"}
              </button>
              <button onClick={() => { setStep("choose"); setError(""); }} style={{ width: "100%", background: "none", border: "none", color: "#4A4B52", padding: "10px", cursor: "pointer", fontSize: "13px", marginTop: "6px", fontFamily: "inherit" }}>
                ← Changer de méthode
              </button>
            </div>
          )}

          {/* ── PENDING ── */}
          {step === "pending" && (
            <div style={{ textAlign: "center", padding: "1rem 0" }}>
              <div style={{ fontSize: "52px", marginBottom: "1rem" }}>⏳</div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#C9A84C", fontSize: "22px", marginBottom: "8px" }}>Paiement en attente</h2>
              <p style={{ color: "#8E8F96", fontSize: "14px", lineHeight: 1.7, marginBottom: "1.5rem" }}>
                Ton paiement a bien été reçu et est en cours de vérification.<br />
                Ton programme sera disponible <strong style={{ color: "#F2F0EB" }}>dans les 48h</strong>.
              </p>
              <div style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.15)", borderRadius: "10px", padding: "14px", marginBottom: "1.5rem", fontSize: "13px", color: "#C9A84C" }}>
                📱 On te contactera sur WhatsApp : <strong>{user?.whatsapp}</strong>
              </div>
              <button onClick={() => window.location.href = "/dashboard"} style={{ width: "100%", background: "#C9A84C", color: "#0A0B0D", border: "none", padding: "14px", borderRadius: "99px", fontSize: "15px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                Accéder à mon espace →
              </button>
            </div>
          )}

          {/* ── SUCCESS ── */}
          {step === "success" && (
            <div style={{ textAlign: "center", padding: "1rem 0" }}>
              <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "rgba(201,168,76,0.1)", border: "2px solid rgba(201,168,76,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", margin: "0 auto 1.25rem" }} className="pulse-gold">
                ✉️
              </div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#C9A84C", fontSize: "24px", marginBottom: "8px" }}>Paiement reçu !</h2>
              <p style={{ color: "#8E8F96", fontSize: "14px", lineHeight: 1.75, marginBottom: "1.5rem" }}>
                Merci {user?.name} ! Ton paiement est en cours de vérification.<br />
                Ton programme complet sera envoyé <strong style={{ color: "#F2F0EB" }}>dans les 48h</strong>.
              </p>
              <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", color: "#C9A84C", fontSize: "15px", marginBottom: "1.5rem", opacity: 0.85 }}>
                "Ton voyage vers ta meilleure version vient de commencer. ✦"
              </p>
              <div style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.15)", borderRadius: "10px", padding: "14px", marginBottom: "1.5rem", fontSize: "13px", color: "#C9A84C" }}>
                📱 On te contactera sur WhatsApp : <strong>{user?.whatsapp}</strong>
              </div>
              <button onClick={() => window.location.href = "/dashboard"} style={{ width: "100%", background: "#C9A84C", color: "#0A0B0D", border: "none", padding: "14px", borderRadius: "99px", fontSize: "15px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                Accéder à mon espace →
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
