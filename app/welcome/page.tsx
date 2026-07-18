"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Welcome() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { window.location.href = "/login"; return; }
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <main style={{ minHeight: "100vh", background: "#0A0B0D", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#C9A84C", fontFamily: "'Playfair Display', serif" }}>Chargement...</div>
    </main>
  );

  return (
    <main style={{ minHeight: "100vh", background: "#0A0B0D", color: "#F2F0EB", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1rem" }}>

      {/* Glow */}
      <div style={{ position: "fixed", top: "30%", left: "50%", transform: "translate(-50%,-50%)", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(201,168,76,0.1) 0%, transparent 65%)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: "440px", background: "#13141A", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "2.5rem", textAlign: "center", position: "relative" }}>

        {/* Check icon */}
        <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "rgba(159,232,112,0.1)", border: "2px solid rgba(159,232,112,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "30px", margin: "0 auto 1.5rem" }}>
          ✓
        </div>

        {/* Logo */}
        <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "20px", fontWeight: 700, color: "#F2F0EB", marginBottom: "1rem" }}>
          Dé<span style={{ color: "#C9A84C" }}>voile</span>
        </div>

        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "26px", fontWeight: 700, color: "#F2F0EB", marginBottom: "12px" }}>
          Bienvenue ! ✦
        </h1>

        <p style={{ color: "#8E8F96", fontSize: "14px", lineHeight: 1.75, marginBottom: "1rem" }}>
          Ton email a bien été confirmé.<br />
          Tu peux maintenant accéder à ton coaching personnalisé.
        </p>

        <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", color: "#C9A84C", fontSize: "14px", marginBottom: "2rem", opacity: 0.85 }}>
          "Révèle la meilleure version de toi. ✦"
        </p>

        <a href="/login" style={{ display: "block", width: "100%", background: "#C9A84C", color: "#0A0B0D", padding: "14px", borderRadius: "99px", fontSize: "15px", fontWeight: 600, textDecoration: "none", textAlign: "center", fontFamily: "inherit" }}>
          Se connecter →
        </a>
      </div>
    </main>
  );
}
