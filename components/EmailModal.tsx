// src/components/EmailModal.tsx
// Modal d'envoi d'email depuis l'admin — éditable avant envoi

"use client";

import { useState } from "react";

type Subscriber = {
  id: string;
  email: string;
  name?: string;
  whatsapp?: string;
};

type EmailModalProps = {
  subscriber: Subscriber;
  appUrl?: string;
  onClose: () => void;
};

// ── Générateur du template email ─────────────────────────────────────────────
function generateWelcomeEmail(name: string, appUrl: string): { subject: string; html: string; preview: string } {
  const firstName = name?.split(" ")[0] || "toi";
  const loginUrl = `${appUrl}/login`;

  const preview = `Bienvenue dans la famille SHINEUP, ${firstName} ! ✨`;

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; background: #0a0a0a; color: #f0f0f0; }
  .wrapper { max-width: 580px; margin: 40px auto; background: #141414; border-radius: 20px; overflow: hidden; border: 1px solid #2a2a2a; }
  .header { background: #111; padding: 36px 32px; text-align: center; border-bottom: 1px solid #2a2a2a; }
  .logo { font-size: 34px; font-weight: 900; color: #F5C842; letter-spacing: 5px; font-family: Arial Black, sans-serif; }
  .tagline { color: #666; font-size: 12px; letter-spacing: 3px; margin-top: 6px; text-transform: uppercase; }
  .body { padding: 36px 32px; }
  p { color: #ccc; line-height: 1.8; font-size: 15px; margin-bottom: 16px; }
  .highlight { color: #F5C842; font-weight: bold; }
  .safe-place { background: #1a1600; border-left: 3px solid #F5C842; border-radius: 0 10px 10px 0; padding: 16px 20px; margin: 20px 0; }
  .safe-place p { margin: 0; color: #c9a820; font-style: italic; font-size: 14px; }
  .dashboard-box { background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 12px; padding: 20px; margin: 20px 0; }
  .dashboard-box h3 { color: #F5C842; font-size: 14px; letter-spacing: 1px; margin-bottom: 14px; text-transform: uppercase; }
  .feature { display: flex; gap: 10px; margin-bottom: 10px; font-size: 14px; color: #aaa; }
  .feature-icon { color: #F5C842; min-width: 20px; }
  .btn-wrapper { text-align: center; margin: 28px 0; }
  .btn { display: inline-block; background: #F5C842; color: #000; font-weight: 700; font-size: 15px; padding: 14px 36px; border-radius: 12px; text-decoration: none; letter-spacing: 0.5px; }
  .quote { background: #0d1a0d; border: 1px solid #1a3a1a; border-radius: 12px; padding: 20px 24px; margin: 24px 0; text-align: center; }
  .quote p { color: #5faa5f; font-style: italic; font-size: 15px; margin: 0; line-height: 1.7; }
  .quote .author { color: #3a6a3a; font-size: 12px; margin-top: 8px; }
  .slogan { text-align: center; margin: 24px 0 8px; }
  .slogan span { color: #F5C842; font-size: 18px; font-weight: 900; letter-spacing: 2px; font-family: Arial Black, sans-serif; }
  .slogan p { color: #555; font-size: 12px; letter-spacing: 2px; margin-top: 4px; }
  .footer { padding: 24px 32px; border-top: 1px solid #1a1a1a; text-align: center; color: #444; font-size: 12px; line-height: 1.8; }
  .footer a { color: #666; text-decoration: none; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <div class="logo">SHINEUP</div>
    <div class="tagline">Coach Remise en Forme</div>
  </div>

  <div class="body">
    <p>Bonjour <span class="highlight">${firstName}</span> 👋</p>

    <p>
      Félicitations et <strong style="color:#f0f0f0">bienvenue dans la famille SHINEUP !</strong> 🎉<br>
      Tu fais désormais partie d'une communauté de personnes qui ont décidé de <span class="highlight">briller</span> — et on est tellement fiers que tu nous fasses confiance pour ce voyage.
    </p>

    <div class="safe-place">
      <p>✨ Ici, c'est une safe place. On ne juge pas, on ne compare pas. On avance ensemble, à ton rythme, vers la meilleure version de toi-même.</p>
    </div>

    <p>
      On est là pour toi — pas seulement pour te donner un programme, mais pour t'accompagner, te motiver et célébrer chaque petit progrès avec toi. <span class="highlight">Ton objectif devient notre objectif.</span>
    </p>

    <div class="dashboard-box">
      <h3>🚀 Ton espace personnel t'attend</h3>
      <p style="color:#888; font-size:13px; margin-bottom:14px">Connecte-toi sur ton dashboard pour accéder à :</p>
      <div class="feature"><span class="feature-icon">🎯</span><span><strong style="color:#f0f0f0">Ton programme sur-mesure</strong> — nutrition, sport et lifestyle pensés uniquement pour toi sur 3 mois</span></div>
      <div class="feature"><span class="feature-icon">🥗</span><span><strong style="color:#f0f0f0">Plan alimentaire détaillé</strong> — ce que tu manges, quand, et pourquoi</span></div>
      <div class="feature"><span class="feature-icon">💪</span><span><strong style="color:#f0f0f0">Planning sportif semaine par semaine</strong> — adapté à ton niveau et tes équipements</span></div>
      <div class="feature"><span class="feature-icon">🌿</span><span><strong style="color:#f0f0f0">Conseils lifestyle</strong> — sommeil, stress, hydratation, habitudes gagnantes</span></div>
      <div class="feature"><span class="feature-icon">📋</span><span><strong style="color:#f0f0f0">Suivi hebdomadaire</strong> — check-in chaque semaine + réponses personnalisées de ton coach</span></div>
      <div class="feature"><span class="feature-icon">📱</span><span><strong style="color:#f0f0f0">Suivi WhatsApp</strong> — on est disponibles pour toi au quotidien</span></div>
    </div>

    <div class="btn-wrapper">
      <a href="${loginUrl}" class="btn">Accéder à mon espace →</a>
    </div>
    <p style="text-align:center; color:#555; font-size:12px; margin-top: -16px">${loginUrl}</p>

    <div class="quote">
      <p>"Le voyage de mille kilomètres commence par un seul pas.<br>Tu viens de le faire. Maintenant, on marche ensemble."</p>
      <div class="author">— L'équipe SHINEUP</div>
    </div>

    <div class="slogan">
      <span>SHINE. RISE. REPEAT.</span>
      <p>Brille. Élève-toi. Recommence.</p>
    </div>

    <p style="text-align:center; margin-top:24px">
      Avec tout notre soutien,<br>
      <strong style="color:#F5C842">L'équipe SHINEUP 💛</strong>
    </p>
  </div>

  <div class="footer">
    © 2025 SHINEUP Coach — Tous droits réservés<br>
    Des questions ? Réponds directement à cet email ou contacte-nous sur WhatsApp.<br>
    <a href="${loginUrl}">shineup-coach.com</a>
  </div>
</div>
</body>
</html>`;

  return { subject: `✨ Bienvenue dans la famille SHINEUP, ${firstName} !`, html, preview };
}

// ── Modal principal ───────────────────────────────────────────────────────────
export default function EmailModal({ subscriber, appUrl = "https://shineup.vercel.app", onClose }: EmailModalProps) {
  const generated = generateWelcomeEmail(subscriber.name || subscriber.email, appUrl);

  const [subject, setSubject] = useState(generated.subject);
  const [htmlContent, setHtmlContent] = useState(generated.html);
  const [viewMode, setViewMode] = useState<"preview" | "edit">("preview");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const sendEmail = async () => {
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/send-program-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: subscriber.email, subject, html: htmlContent }),
      });
      const data = await res.json();
      if (data.success) {
        setSent(true);
      } else {
        setError("Erreur : " + data.error);
      }
    } catch {
      setError("Impossible d'envoyer l'email");
    }
    setSending(false);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "#1a1a1a", border: "1px solid #2a2a2a",
    color: "#f0f0f0", borderRadius: "8px", padding: "10px 12px",
    fontSize: "13px", outline: "none", fontFamily: "inherit", boxSizing: "border-box",
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "#000000dd", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: "1.5rem" }}>
      <div style={{ background: "#141414", borderRadius: "20px", border: "1px solid #2a2a2a", width: "100%", maxWidth: "720px", maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ padding: "1.5rem", borderBottom: "1px solid #1e1e1e", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div>
            <div style={{ fontWeight: 500, fontSize: "15px" }}>📧 Email de bienvenue</div>
            <div style={{ color: "#666", fontSize: "13px", marginTop: "2px" }}>Pour : {subscriber.name || "—"} · {subscriber.email}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: "22px" }}>×</button>
        </div>

        {/* Contenu scrollable */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>

          {sent ? (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <div style={{ fontSize: "48px", marginBottom: "1rem" }}>✅</div>
              <div style={{ color: "#5faa5f", fontSize: "18px", fontWeight: 500 }}>Email envoyé !</div>
              <div style={{ color: "#666", fontSize: "13px", marginTop: "8px" }}>L'email a bien été envoyé à {subscriber.email}</div>
            </div>
          ) : (
            <>
              {/* Sujet */}
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", color: "#888", fontSize: "12px", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "1px" }}>Sujet</label>
                <input style={inputStyle} value={subject} onChange={(e) => setSubject(e.target.value)} />
              </div>

              {/* Tabs preview / edit */}
              <div style={{ display: "flex", gap: "8px", marginBottom: "1rem" }}>
                {(["preview", "edit"] as const).map((m) => (
                  <button key={m} onClick={() => setViewMode(m)} style={{
                    background: viewMode === m ? "#F5C842" : "#1a1a1a",
                    color: viewMode === m ? "#000" : "#888",
                    border: `1px solid ${viewMode === m ? "#F5C842" : "#2a2a2a"}`,
                    borderRadius: "8px", padding: "7px 16px", cursor: "pointer", fontSize: "13px", fontWeight: viewMode === m ? 600 : 400,
                  }}>
                    {m === "preview" ? "👁️ Aperçu" : "✏️ Modifier le HTML"}
                  </button>
                ))}
              </div>

              {/* Aperçu */}
              {viewMode === "preview" && (
                <div style={{ background: "#0a0a0a", borderRadius: "12px", border: "1px solid #1e1e1e", overflow: "hidden" }}>
                  <iframe
                    srcDoc={htmlContent}
                    style={{ width: "100%", height: "500px", border: "none", borderRadius: "12px" }}
                    title="Aperçu email"
                  />
                </div>
              )}

              {/* Éditeur HTML */}
              {viewMode === "edit" && (
                <textarea
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  rows={20}
                  style={{ ...inputStyle, resize: "vertical", fontFamily: "monospace", fontSize: "12px", lineHeight: 1.5 }}
                />
              )}

              {error && (
                <div style={{ background: "#3a0a0a", border: "1px solid #7a1a1a", borderRadius: "8px", padding: "10px", fontSize: "13px", color: "#f87171", marginTop: "1rem" }}>
                  {error}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer boutons */}
        {!sent && (
          <div style={{ padding: "1.25rem 1.5rem", borderTop: "1px solid #1e1e1e", display: "flex", gap: "10px", flexShrink: 0 }}>
            <button onClick={sendEmail} disabled={sending} style={{
              flex: 1, background: sending ? "#888" : "#F5C842", color: "#000",
              border: "none", padding: "13px", borderRadius: "10px",
              fontWeight: 600, cursor: sending ? "not-allowed" : "pointer", fontSize: "14px",
            }}>
              {sending ? "Envoi en cours..." : "Envoyer l'email ✓"}
            </button>
            <button onClick={onClose} style={{ background: "none", border: "1px solid #2a2a2a", color: "#888", padding: "13px 20px", borderRadius: "10px", cursor: "pointer", fontSize: "13px" }}>
              Annuler
            </button>
          </div>
        )}
        {sent && (
          <div style={{ padding: "1.25rem 1.5rem", borderTop: "1px solid #1e1e1e" }}>
            <button onClick={onClose} style={{ width: "100%", background: "#F5C842", color: "#000", border: "none", padding: "13px", borderRadius: "10px", fontWeight: 600, cursor: "pointer" }}>
              Fermer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
