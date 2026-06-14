"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";
import Logo from "../../components/logo";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [whatsapp, setWhatsapp] = useState("");
  const [gender, setGender] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidPhone = (phone: string) => /^[0-9+\s]{8,15}$/.test(phone);

  const translateError = (msg: string): string => {
    if (msg.includes("User already registered") || msg.includes("already been registered"))
      return "❌ Cet email est déjà utilisé. Connecte-toi plutôt.";
    if (msg.includes("Invalid login credentials"))
      return "❌ Email ou mot de passe incorrect.";
    if (msg.includes("Email not confirmed"))
      return "❌ Confirme ton email avant de te connecter. Vérifie ta boîte mail.";
    if (msg.includes("Password should be at least"))
      return "❌ Le mot de passe doit faire au moins 6 caractères.";
    if (msg.includes("Unable to validate email"))
      return "❌ Adresse email invalide.";
    if (msg.includes("rate limit") || msg.includes("too many requests"))
      return "❌ Trop de tentatives. Attends quelques minutes.";
    return "❌ " + msg;
  };

  const handleAuth = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    if (!email || !password) {
      setError("❌ Email et mot de passe obligatoires");
      setLoading(false);
      return;
    }

    // ── SIGNUP ──────────────────────────────────────────────────────────────
    if (mode === "signup") {
      if (!whatsapp || !isValidPhone(whatsapp)) {
        setError("❌ Numéro WhatsApp invalide (ex: 0341234567)");
        setLoading(false);
        return;
      }
      if (!gender) {
        setError("❌ Genre obligatoire");
        setLoading(false);
        return;
      }

      const { data: existingPhone } = await supabase
        .from("profiles").select("id").eq("whatsapp", whatsapp).maybeSingle();

      if (existingPhone) {
        setError("❌ Ce numéro WhatsApp est déjà associé à un compte.");
        setLoading(false);
        return;
      }

      const { data, error: signErr } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });

      if (signErr) { setError(translateError(signErr.message)); setLoading(false); return; }

      if (data.user && data.user.identities?.length === 0) {
        setError("❌ Cet email est déjà utilisé. Connecte-toi plutôt.");
        setLoading(false);
        return;
      }


      setSuccess("📩 Email envoyé ! Vérifie ta boîte mail pour confirmer ton compte.");
      setLoading(false);
      return;
    }

    // ── LOGIN ────────────────────────────────────────────────────────────────
    if (mode === "login") {
      const { data, error: loginErr } = await supabase.auth.signInWithPassword({ email, password });

      if (loginErr) { setError(translateError(loginErr.message)); setLoading(false); return; }

      const userId = data.user.id;
console.log("userId connecté:", userId);
      const { data: profile } = await supabase
        .from("profiles").select("role").eq("id", userId).single();

      if (profile?.role === "admin") {
        window.location.href = "/admin";
        return;
      }

      const { data: formExists } = await supabase
        .from("form_data").select("id").eq("user_id", userId).maybeSingle();
console.log("formExists:", formExists);
      const { data: paymentExists } = await supabase
  .from("payments")
  .select("id")
  .eq("user_id", userId)
  .eq("status", "confirmed")
  .maybeSingle();
      setLoading(false);

      if (!formExists) {
        window.location.href = "/form";
      } else if (!paymentExists) {
        window.location.href = "/payment";
      } else {
        window.location.href = "/dashboard";
      }
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 14px", borderRadius: "10px",
    background: "#1e1e1e", border: "1px solid #2a2a2a",
    color: "#f0f0f0", fontSize: "14px", outline: "none",
    fontFamily: "inherit", boxSizing: "border-box",
  };

  return (
    <main style={{ minHeight: "100vh", background: "#0a0a0a", color: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ width: "100%", maxWidth: "420px", background: "#141414", borderRadius: "20px", padding: "2rem" }}>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
          <Logo size="md" />
        </div>

        <h2 style={{ textAlign: "center", fontSize: "16px", color: "#888", fontWeight: 400, marginBottom: "1.5rem" }}>
          {mode === "signup" ? "Créer un compte" : "Se connecter"}
        </h2>

        {error && (
          <div style={{ background: "#3a0a0a", border: "1px solid #7a1a1a", borderRadius: "10px", padding: "12px 14px", fontSize: "13px", color: "#f87171", marginBottom: "1rem" }}>
            {error}
            {error.includes("déjà utilisé") && mode === "signup" && (
              <span onClick={() => { setMode("login"); setError(""); }}
                style={{ display: "block", marginTop: "6px", color: "#F5C842", cursor: "pointer", textDecoration: "underline", fontSize: "12px" }}>
                → Se connecter à la place
              </span>
            )}
          </div>
        )}

        {success && (
          <div style={{ background: "#0d1a0d", border: "1px solid #1a3a1a", borderRadius: "10px", padding: "12px 14px", fontSize: "13px", color: "#5faa5f", marginBottom: "1rem" }}>
            {success}
          </div>
        )}

        <div style={{ marginBottom: "12px" }}>
          <input style={inputStyle} placeholder="Email" type="email" value={email}
            onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div style={{ marginBottom: "12px", position: "relative" }}>
          <input style={{ ...inputStyle, paddingRight: "44px" }} placeholder="Mot de passe"
            type={showPassword ? "text" : "password"} value={password}
            onChange={(e) => setPassword(e.target.value)} />
          <button type="button" onClick={() => setShowPassword(!showPassword)}
            style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#666", fontSize: "18px", padding: 0 }}>
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>

        {mode === "signup" && (
          <>
            <div style={{ marginBottom: "12px" }}>
              <input style={inputStyle} placeholder="WhatsApp (ex: 0341234567)" type="tel"
                value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
            </div>
            <div style={{ marginBottom: "12px" }}>
              <select style={{ ...inputStyle, cursor: "pointer" }} value={gender}
                onChange={(e) => setGender(e.target.value)}>
                <option value="">Genre</option>
                <option value="male">Homme</option>
                <option value="female">Femme</option>
                <option value="other">Autre</option>
              </select>
            </div>
          </>
        )}

        <button onClick={handleAuth} disabled={loading} style={{
          width: "100%", marginTop: "8px",
          background: loading ? "#888" : "#F5C842",
          color: "#000", border: "none", padding: "14px", borderRadius: "12px",
          fontSize: "15px", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
        }}>
          {loading ? "Chargement..." : mode === "signup" ? "Créer mon compte" : "Se connecter"}
        </button>

        <p onClick={() => { setMode(mode === "signup" ? "login" : "signup"); setError(""); setSuccess(""); }}
          style={{ textAlign: "center", fontSize: "13px", color: "#666", marginTop: "1rem", cursor: "pointer" }}>
          {mode === "signup" ? "Déjà un compte ? " : "Pas de compte ? "}
          <span style={{ color: "#F5C842", textDecoration: "underline" }}>
            {mode === "signup" ? "Se connecter" : "S'inscrire"}
          </span>
        </p>
      </div>
    </main>
  );
}
