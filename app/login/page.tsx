"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
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
  const [activeImg, setActiveImg] = useState(0);
  const [quoteIndex, setQuoteIndex] = useState(0);

  const images = [
    { url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80", label: "💪 Entraînement" },
    { url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80", label: "🥗 Nutrition" },
    { url: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80", label: "🥤 Lifestyle sain" },
  ];

  const quotes = [
    { text: "Ton corps peut tout supporter! C'est ton esprit qu'il faut convaincre.", author: "— Mentalité ShineUp" },
    { text: "La discipline, c'est choisir entre ce que tu veux maintenant et ce que tu veux le plus.", author: "— Abraham Lincoln" },
    { text: "Chaques efforts est un investissement dans la meilleure version de toi-même.", author: "— Coach ShineUp" },
    { text: "La motivation ne suffit pas, il faut de la discipline.", author: "— Mentalité ShineUp" },
  ];

  useEffect(() => {
    const t1 = setInterval(() => setActiveImg((i) => (i + 1) % images.length), 3500);
    const t2 = setInterval(() => setQuoteIndex((i) => (i + 1) % quotes.length), 4000);
    return () => { clearInterval(t1); clearInterval(t2); };
  }, []);

  const isValidPhone = (p: string) => /^[0-9+\s]{8,15}$/.test(p);

  const translateError = (msg: string): string => {
    if (msg.includes("User already registered") || msg.includes("already been registered"))
      return "Cet email est déjà utilisé. Connecte-toi plutôt.";
    if (msg.includes("Invalid login credentials"))
      return "Email ou mot de passe incorrect.";
    if (msg.includes("Email not confirmed"))
      return "Confirme ton email avant de te connecter.";
    if (msg.includes("Password should be at least"))
      return "Le mot de passe doit faire au moins 6 caractères.";
    if (msg.includes("Unable to validate email"))
      return "Adresse email invalide.";
    if (msg.includes("rate limit") || msg.includes("too many requests"))
      return "Trop de tentatives. Attends quelques minutes.";
    return msg;
  };

  const handleAuth = async () => {
    setError(""); setSuccess(""); setLoading(true);

    if (!email || !password) {
      setError("Email et mot de passe obligatoires");
      setLoading(false); return;
    }

    if (mode === "signup") {
      if (!whatsapp || !isValidPhone(whatsapp)) {
        setError("Numéro WhatsApp invalide (ex: 0341234567)");
        setLoading(false); return;
      }
      if (!gender) {
        setError("Genre obligatoire");
        setLoading(false); return;
      }

      const { data: existingPhone } = await supabase
        .from("profiles").select("id").eq("whatsapp", whatsapp).maybeSingle();
      if (existingPhone) {
        setError("Ce numéro WhatsApp est déjà associé à un compte.");
        setLoading(false); return;
      }

      const { data, error: signErr } = await supabase.auth.signUp({
        email, password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: { whatsapp, gender },
        },
      });

      if (signErr) { setError(translateError(signErr.message)); setLoading(false); return; }
      if (data.user && data.user.identities?.length === 0) {
        setError("Cet email est déjà utilisé. Connecte-toi plutôt.");
        setLoading(false); return;
      }

      setSuccess("Email envoyé ! Vérifie ta boîte mail pour confirmer ton compte.");
      setLoading(false); return;
    }

    if (mode === "login") {
      const { data, error: loginErr } = await supabase.auth.signInWithPassword({ email, password });
      if (loginErr) { setError(translateError(loginErr.message)); setLoading(false); return; }

      const userId = data.user.id;
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).single();
      if (profile?.role === "admin") { window.location.href = "/admin"; return; }

      const { data: formExists } = await supabase.from("form_data").select("id").eq("user_id", userId).maybeSingle();
      const { data: paymentExists } = await supabase.from("payments").select("id").eq("user_id", userId).eq("status", "confirmed").maybeSingle();

      setLoading(false);
      if (!formExists) window.location.href = "/form";
      else if (!paymentExists) window.location.href = "/payment";
      else window.location.href = "/dashboard";
    }
  };

  const inp: React.CSSProperties = {
    width: "100%", padding: "12px 14px", borderRadius: "10px",
    background: "#1e1e1e", border: "1px solid #2a2a2a",
    color: "#f0f0f0", fontSize: "14px", outline: "none",
    fontFamily: "inherit", boxSizing: "border-box",
  };

  return (
    <main style={{ minHeight: "100vh", background: "#0a0a0a", color: "#f0f0f0", display: "grid", gridTemplateColumns: "1fr 1fr" }}>

      {/* ── GAUCHE ─────────────────────────────────────────────────────── */}
      <div style={{ position: "relative", overflow: "hidden" }}>

        {/* Images slider */}
        {images.map((img, i) => (
          <div key={i} style={{
            position: "absolute", inset: 0,
            backgroundImage: `url(${img.url})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: activeImg === i ? 1 : 0,
            transition: "opacity 1s ease-in-out",
          }} />
        ))}

        {/* Overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, #0a0a0a66 0%, #0a0a0a88 50%, #0a0a0a 100%)",
        }} />

        {/* Contenu */}
        <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "2.5rem" }}>

          {/* Logo */}
          <div>
            <Logo size="md" />
          </div>

          {/* Bas */}
          <div>
            <p style={{ color: "#F5C842", fontSize: "12px", fontWeight: 500, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "12px" }}>
              Programme coaching 3 mois
            </p>

            <h1 style={{ fontSize: "34px", fontWeight: 700, lineHeight: 1.2, margin: "0 0 14px", color: "#fff" }}>
              Ce n&apos;est pas un simple coaching.<br />
              <span style={{ color: "#F5C842" }}>C&apos;est un pas vers ta meilleure version.</span>
            </h1>

            <p style={{ color: "#aaa", fontSize: "14px", lineHeight: 1.7, margin: "0 0 1.5rem", maxWidth: "380px" }}>
              Programme nutrition, sport et lifestyle 100% personnalisé — conçu pour toi, suivi semaine après semaine.
            </p>

            {/* Stats */}
            <div style={{ display: "flex", gap: "2rem", marginBottom: "1.5rem" }}>
              {[
                { value: "3 mois", label: "Programme complet" },
                { value: "100%", label: "Personnalisé" },
                { value: "48h", label: "Délai de livraison" },
              ].map((s) => (
                <div key={s.label}>
                  <div style={{ color: "#F5C842", fontSize: "22px", fontWeight: 700 }}>{s.value}</div>
                  <div style={{ color: "#555", fontSize: "11px", marginTop: "2px" }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Dots navigation */}
            <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "1.5rem" }}>
              {images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)} style={{
                  width: activeImg === i ? "28px" : "8px", height: "8px",
                  borderRadius: "99px",
                  background: activeImg === i ? "#F5C842" : "#444",
                  border: "none", cursor: "pointer",
                  transition: "all 0.3s", padding: 0,
                }} />
              ))}
              <span style={{ color: "#555", fontSize: "12px", marginLeft: "6px" }}>{images[activeImg].label}</span>
            </div>

            {/* Citation rotative */}
            <div style={{
              background: "#00000066",
              borderLeft: "3px solid #F5C842",
              borderRadius: "0 10px 10px 0",
              padding: "14px 18px",
              backdropFilter: "blur(8px)",
            }}>
              <p style={{ color: "#c9a820", fontSize: "13px", lineHeight: 1.7, margin: "0 0 6px", fontStyle: "italic" }}>
                &ldquo;{quotes[quoteIndex].text}&rdquo;
              </p>
              <p style={{ color: "#555", fontSize: "11px", margin: 0 }}>
                {quotes[quoteIndex].author}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── DROITE — Formulaire ─────────────────────────────────────────── */}
      <div style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "3rem 2rem", overflowY: "auto",
        background: "#0f0f0f",
        borderLeft: "1px solid #1a1a1a",
      }}>
        <div style={{ width: "100%", maxWidth: "380px" }}>

          {/* Toggle */}
          <div style={{
            display: "flex", background: "#141414",
            border: "1px solid #1e1e1e", borderRadius: "12px",
            padding: "4px", marginBottom: "2rem",
          }}>
            {(["signup", "login"] as const).map((m) => (
              <button key={m} onClick={() => { setMode(m); setError(""); setSuccess(""); }} style={{
                flex: 1, padding: "10px", borderRadius: "9px", border: "none",
                background: mode === m ? "#F5C842" : "transparent",
                color: mode === m ? "#000" : "#666",
                fontWeight: mode === m ? 600 : 400,
                fontSize: "13px", cursor: "pointer",
              }}>
                {m === "signup" ? "Créer un compte" : "Se connecter"}
              </button>
            ))}
          </div>

          <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#f0f0f0", margin: "0 0 6px" }}>
            {mode === "signup" ? "Commence ta transformation" : "Bon retour 👋"}
          </h2>
          <p style={{ color: "#555", fontSize: "13px", marginBottom: "1.5rem" }}>
            {mode === "signup"
              ? "Crée ton compte et reçois ton programme personnalisé."
              : "Connecte-toi pour accéder à ton espace ShineUp."}
          </p>

          {error && (
            <div style={{ background: "#1a0808", border: "1px solid #5a1a1a", borderRadius: "10px", padding: "12px 14px", fontSize: "13px", color: "#f87171", marginBottom: "1rem" }}>
              ❌ {error}
              {error.includes("déjà utilisé") && mode === "signup" && (
                <span onClick={() => { setMode("login"); setError(""); }}
                  style={{ display: "block", marginTop: "6px", color: "#F5C842", cursor: "pointer", textDecoration: "underline", fontSize: "12px" }}>
                  → Se connecter à la place
                </span>
              )}
            </div>
          )}

          {success && (
            <div style={{ background: "#0a1a0a", border: "1px solid #1a5a1a", borderRadius: "10px", padding: "12px 14px", fontSize: "13px", color: "#5faa5f", marginBottom: "1rem" }}>
              ✅ {success}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <input style={inp} placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

            <div style={{ position: "relative" }}>
              <input style={{ ...inp, paddingRight: "44px" }} placeholder="Mot de passe"
                type={showPassword ? "text" : "password"} value={password}
                onChange={(e) => setPassword(e.target.value)} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#666", fontSize: "18px", padding: 0 }}>
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>

            {mode === "signup" && (
              <>
                <input style={inp} placeholder="WhatsApp (ex: 0341234567)" type="tel"
                  value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
                <select style={{ ...inp, cursor: "pointer" }} value={gender} onChange={(e) => setGender(e.target.value)}>
                  <option value="">Genre</option>
                  <option value="male">Homme</option>
                  <option value="female">Femme</option>
                  <option value="other">Autre</option>
                </select>
              </>
            )}
          </div>

          <button onClick={handleAuth} disabled={loading} style={{
            width: "100%", marginTop: "1.2rem",
            background: loading ? "#1e1e1e" : "#F5C842",
            color: loading ? "#555" : "#000",
            border: loading ? "1px solid #2a2a2a" : "none",
            padding: "14px", borderRadius: "12px",
            fontSize: "15px", fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
          }}>
            {loading ? "Chargement..." : mode === "signup" ? "Commencer mon programme →" : "Se connecter →"}
          </button>

          {mode === "signup" && (
            <p style={{ color: "#333", fontSize: "11px", textAlign: "center", marginTop: "1rem", lineHeight: 1.6 }}>
              En créant un compte, tu acceptes nos conditions d&apos;utilisation.
              Tes données sont protégées et confidentielles.
            </p>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          main { grid-template-columns: 1fr !important; }
          main > div:first-child { min-height: 300px; max-height: 340px; }
          main > div:first-child h1 { font-size: 22px !important; }
          main > div:last-child { padding: 2rem 1.5rem !important; }
        }
      `}</style>
    </main>
  );
}