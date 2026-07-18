"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

type Subscriber = {
  id: string;
  email: string;
  whatsapp: string;
  gender: string;
  subscription_status: string;
  subscription_start: string;
  subscription_end: string;
  form_completed: boolean;
  created_at: string;
  name?: string;
  goal?: string;
  weight?: string;
  height?: string;
  age?: string;
  city?: string;
};

type Payment = {
  id: string;
  email: string;
  amount: number;
  currency: string;
  method: string;
  transaction_ref: string;
  status: string;
  created_at: string;
  confirmed_at: string;
};

type Tab = "overview" | "subscribers" | "payments";

const statusBadge = (status: string) => {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    active:    { bg: "#0d1a0d", color: "#5faa5f", label: "Actif" },
    pending:   { bg: "#1a1600", color: "#c9a820", label: "En attente" },
    confirmed: { bg: "#0d1a0d", color: "#5faa5f", label: "Confirmé" },
    expired:   { bg: "#1a1010", color: "#aa5f5f", label: "Expiré" },
    free:      { bg: "#1a1a1a", color: "#666",    label: "Gratuit" },
    failed:    { bg: "#1a1010", color: "#f87171", label: "Échoué" },
  };
  const s = map[status] || { bg: "#1a1a1a", color: "#888", label: status };
  return (
    <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}33`, borderRadius: "99px", padding: "3px 10px", fontSize: "11px", fontWeight: 500 }}>
      {s.label}
    </span>
  );
};

const fmt = (iso: string) => iso ? new Date(iso).toLocaleDateString("fr-FR") : "—";

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQ, setSearchQ] = useState("");
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { window.location.href = "/login"; return; }
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
      if (profile?.role !== "admin") { window.location.href = "/dashboard"; return; }
      loadAll();
    });
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [{ data: profs }, { data: pays }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("payments").select("*").order("created_at", { ascending: false }),
    ]);

    const enriched = await Promise.all((profs || []).map(async (p) => {
      const { data: fd } = await supabase
        .from("form_data")
        .select("name,goal,weight,height,age,city")
        .eq("user_id", p.id)
        .limit(1);
      return { ...p, ...(fd?.[0] || {}) };
    }));

    setSubscribers(enriched);
    setPayments(pays || []);
    setLoading(false);
  }, []);

  const confirmPayment = async (payment: Payment) => {
    await supabase.from("payments")
      .update({ status: "confirmed", confirmed_at: new Date().toISOString() })
      .eq("id", payment.id);

    const sub = subscribers.find((s) => s.email === payment.email);
    if (sub) {
      await supabase.from("profiles").update({
        subscription_status: "active",
        subscription_start: new Date().toISOString(),
        subscription_end: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      }).eq("id", sub.id);
      await supabase.from("coaching_plan")
        .update({ status: "active" })
        .eq("user_id", sub.id)
        .eq("status", "pending_payment");
    }
    loadAll();
  };

  const stats = {
    total: subscribers.length,
    active: subscribers.filter((s) => s.subscription_status === "active").length,
    pending: payments.filter((p) => p.status === "pending").length,
    revenue: payments.filter((p) => p.status === "confirmed").reduce((acc, p) => acc + p.amount, 0),
  };

  const filtered = subscribers.filter((s) =>
    !searchQ ||
    s.email?.includes(searchQ) ||
    s.name?.toLowerCase().includes(searchQ.toLowerCase()) ||
    s.whatsapp?.includes(searchQ)
  );

  const pageStyle: React.CSSProperties = {
    minHeight: "100vh", background: "#0a0a0a", color: "#f0f0f0", display: "flex",
  };
  const inputStyle: React.CSSProperties = {
    background: "#1e1e1e", border: "1px solid #2a2a2a", color: "#f0f0f0",
    borderRadius: "8px", padding: "8px 12px", fontSize: "13px",
    outline: "none", fontFamily: "inherit",
  };

  if (loading) return (
    <div style={{ ...pageStyle, alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#F5C842", fontSize: "18px" }}>Chargement...</div>
    </div>
  );

  return (
    <div style={pageStyle}>

      {/* Sidebar */}
      <aside style={{ width: "220px", background: "#0f0f0f", borderRight: "1px solid #1a1a1a", padding: "1.5rem 1rem", flexShrink: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "22px", color: "#F5C842", letterSpacing: "3px", marginBottom: "2rem", paddingLeft: "8px" }}>
          SHINEUP
        </div>
        <div style={{ fontSize: "10px", color: "#444", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "8px", paddingLeft: "8px" }}>
          Admin
        </div>
<button
  onClick={() => router.push("/admin/nutrition")}
  style={{
    width: "100%", display: "flex", alignItems: "center", gap: "10px",
    background: "none", border: "1px solid transparent",
    borderRadius: "8px", padding: "10px 12px", cursor: "pointer",
    color: "#888", fontSize: "13px", marginBottom: "4px", textAlign: "left",
  }}>
  <span>📚</span>Bibliothèque nutrition
</button>
<button
  onClick={() => router.push("/admin/exercices")}
  style={{
    width: "100%", display: "flex", alignItems: "center", gap: "10px",
    background: "none", border: "1px solid transparent",
    borderRadius: "8px", padding: "10px 12px", cursor: "pointer",
    color: "#888", fontSize: "13px", marginBottom: "4px", textAlign: "left",
  }}>
  <span>🏋️</span>Bibliothèque exercices
</button>
        {([
          ["overview",     "📊", "Vue d'ensemble"],
          ["subscribers",  "👥", "Abonnés"],
          ["payments",     "💰", "Paiements"],
        ] as [Tab, string, string][]).map(([id, icon, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            width: "100%", display: "flex", alignItems: "center", gap: "10px",
            background: tab === id ? "#1a1a1a" : "none",
            border: `1px solid ${tab === id ? "#F5C842" : "transparent"}`,
            borderRadius: "8px", padding: "10px 12px", cursor: "pointer",
            color: tab === id ? "#F5C842" : "#888", fontSize: "13px",
            marginBottom: "4px", textAlign: "left",
          }}>
            <span>{icon}</span>{label}
            {id === "payments" && stats.pending > 0 && (
              <span style={{ marginLeft: "auto", background: "#e60000", color: "#fff", borderRadius: "99px", padding: "2px 7px", fontSize: "10px" }}>
                {stats.pending}
              </span>
            )}
          </button>
        ))}

        <button
          onClick={() => { supabase.auth.signOut(); window.location.href = "/login"; }}
          style={{ width: "100%", background: "none", border: "1px solid #2a2a2a", color: "#555", padding: "10px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", marginTop: "auto" }}
        >
          Déconnexion
        </button>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: "2rem", overflowY: "auto" }}>

        {/* OVERVIEW */}
        {tab === "overview" && (
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 500, marginBottom: "1.5rem" }}>Vue d&apos;ensemble</h1>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px", marginBottom: "2rem" }}>
              {[
                { label: "Abonnés total",       value: stats.total,  color: "#F5C842" },
                { label: "Abonnés actifs",       value: stats.active, color: "#5faa5f" },
                { label: "Paiements en attente", value: stats.pending, color: "#c9a820" },
                { label: "Revenus confirmés",    value: (stats.revenue / 1000).toFixed(0) + "k Ar", color: "#F5C842" },
              ].map((s) => (
                <div key={s.label} style={{ background: "#141414", border: "1px solid #1e1e1e", borderRadius: "12px", padding: "16px" }}>
                  <div style={{ color: "#666", fontSize: "12px", marginBottom: "6px" }}>{s.label}</div>
                  <div style={{ color: s.color, fontSize: "26px", fontWeight: 700 }}>{s.value}</div>
                </div>
              ))}
            </div>

            <h2 style={{ fontSize: "16px", fontWeight: 500, marginBottom: "1rem", color: "#c9a820" }}>⚠️ Paiements à confirmer</h2>
            {payments.filter((p) => p.status === "pending").map((p) => (
              <div key={p.id} style={{ background: "#141414", border: "1px solid #3a2e00", borderRadius: "10px", padding: "14px 16px", marginBottom: "8px", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: "14px" }}>{p.email}</div>
                  <div style={{ color: "#666", fontSize: "12px" }}>
                    {p.method?.toUpperCase()} — Réf: {p.transaction_ref} — {fmt(p.created_at)}
                  </div>
                </div>
                <div style={{ color: "#F5C842", fontWeight: 600 }}>{(p.amount / 1000).toFixed(0)}k Ar</div>
                <button onClick={() => confirmPayment(p)} style={{ background: "#5faa5f", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "13px" }}>
                  Confirmer ✓
                </button>
              </div>
            ))}
            {payments.filter((p) => p.status === "pending").length === 0 && (
              <div style={{ color: "#444", fontSize: "13px" }}>Aucun paiement en attente 🎉</div>
            )}
          </div>
        )}

        {/* ABONNÉS */}
        {tab === "subscribers" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h1 style={{ fontSize: "22px", fontWeight: 500 }}>Abonnés ({filtered.length})</h1>
              <input
                style={{ ...inputStyle, width: "220px" }}
                placeholder="Rechercher..."
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
              />
            </div>

            <div style={{ display: "grid", gap: "10px" }}>
              {filtered.map((s) => (
                <div key={s.id}
                  style={{ background: "#141414", border: "1px solid #1e1e1e", borderRadius: "12px", padding: "14px 16px", display: "flex", alignItems: "center", gap: "14px", cursor: "pointer" }}
                  onClick={() => router.push(`/admin/subscriber/${s.id}`)}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#1e1e1e", border: "1px solid #2a2a2a", display: "flex", alignItems: "center", justifyContent: "center", color: "#F5C842", fontWeight: 600, fontSize: "14px", flexShrink: 0 }}>
                    {(s.name || s.email)?.[0]?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: "14px" }}>
                      {s.name || "—"} <span style={{ color: "#555", fontWeight: 400 }}>{s.email}</span>
                    </div>
                    <div style={{ color: "#666", fontSize: "12px", marginTop: "2px" }}>
                      📱 {s.whatsapp || "—"} · {s.goal || "Pas de formulaire"} · {s.city || "—"}
                    </div>
                  </div>
                  {statusBadge(s.subscription_status)}
                  <div style={{ color: "#444", fontSize: "12px" }}>{fmt(s.created_at)}</div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div style={{ color: "#444", textAlign: "center", padding: "2rem" }}>Aucun abonné trouvé</div>
              )}
            </div>
          </div>
        )}

        {/* PAIEMENTS */}
        {tab === "payments" && (
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 500, marginBottom: "1.5rem" }}>Paiements</h1>
            <div style={{ display: "grid", gap: "8px" }}>
              {payments.map((p) => (
                <div key={p.id} style={{ background: "#141414", border: `1px solid ${p.status === "pending" ? "#3a2e00" : "#1e1e1e"}`, borderRadius: "10px", padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: "14px" }}>{p.email}</div>
                    <div style={{ color: "#666", fontSize: "12px", marginTop: "2px" }}>
                      {p.method?.toUpperCase()} · Réf: {p.transaction_ref} · {fmt(p.created_at)}
                    </div>
                  </div>
                  <div style={{ color: "#F5C842", fontWeight: 600, fontSize: "14px" }}>
                    {(p.amount / 1000).toFixed(0)}k Ar
                  </div>
                  {statusBadge(p.status)}
                  {p.status === "pending" && (
                    <button onClick={() => confirmPayment(p)} style={{ background: "#5faa5f", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "12px" }}>
                      Confirmer ✓
                    </button>
                  )}
                </div>
              ))}
              {payments.length === 0 && (
                <div style={{ color: "#444", textAlign: "center", padding: "2rem" }}>Aucun paiement</div>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}