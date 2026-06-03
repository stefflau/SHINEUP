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

type CheckIn = {
  id: string;
  email: string;
  week_number: number;
  weight_current: number;
  energy_level: number;
  sleep_quality: number;
  stress_level: number;
  training_done: number;
  wins: string;
  struggles: string;
  questions: string;
  coach_feedback: string;
  coach_replied: boolean;
  check_date: string;
};

type CoachPlan = {
  id: string;
  user_id: string;
  email: string;
  user_name: string;
  goal: string;
  calories: number;
  status: string;
  generated_at: string;
  program_json: Record<string, unknown>;
};

type Tab = "overview" | "subscribers" | "payments" | "checkins" | "programs";

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
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [plans, setPlans] = useState<CoachPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCheckin, setSelectedCheckin] = useState<CheckIn | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [programModal, setProgramModal] = useState<CoachPlan | null>(null);
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
    const [{ data: profs }, { data: pays }, { data: chks }, { data: pls }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("payments").select("*").order("created_at", { ascending: false }),
      supabase.from("weekly_checkins").select("*").order("check_date", { ascending: false }),
      supabase.from("coaching_plan").select("*").order("generated_at", { ascending: false }),
    ]);

    const enriched = await Promise.all((profs || []).map(async (p) => {
      const { data: fd } = await supabase.from("form_data").select("name,goal,weight,height,age,city").eq("user_id", p.id).single();
      return { ...p, ...fd };
    }));

    setSubscribers(enriched);
    setPayments(pays || []);
    setCheckins(chks || []);
    setPlans(pls || []);
    setLoading(false);
  }, []);

  const confirmPayment = async (payment: Payment) => {
    await supabase.from("payments").update({ status: "confirmed", confirmed_at: new Date().toISOString() }).eq("id", payment.id);
    const sub = subscribers.find((s) => s.email === payment.email);
    if (sub) {
      await supabase.from("profiles").update({
        subscription_status: "active",
        subscription_start: new Date().toISOString(),
        subscription_end: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      }).eq("id", sub.id);
      await supabase.from("coaching_plan").update({ status: "active" }).eq("user_id", sub.id).eq("status", "pending_payment");
    }
    loadAll();
  };

  const replyCheckin = async () => {
    if (!selectedCheckin || !feedbackText.trim()) return;
    await supabase.from("weekly_checkins").update({
      coach_feedback: feedbackText,
      coach_replied: true,
      coach_reply_at: new Date().toISOString(),
    }).eq("id", selectedCheckin.id);
    setSelectedCheckin(null);
    setFeedbackText("");
    loadAll();
  };

  const stats = {
    total: subscribers.length,
    active: subscribers.filter((s) => s.subscription_status === "active").length,
    pending: payments.filter((p) => p.status === "pending").length,
    checkins_unreplied: checkins.filter((c) => !c.coach_replied).length,
    revenue: payments.filter((p) => p.status === "confirmed").reduce((acc, p) => acc + p.amount, 0),
  };

  const filtered = subscribers.filter((s) =>
    !searchQ || s.email?.includes(searchQ) || s.name?.toLowerCase().includes(searchQ.toLowerCase()) || s.whatsapp?.includes(searchQ)
  );

  const pageStyle: React.CSSProperties = { minHeight: "100vh", background: "#0a0a0a", color: "#f0f0f0", display: "flex" };
  const inputStyle: React.CSSProperties = { background: "#1e1e1e", border: "1px solid #2a2a2a", color: "#f0f0f0", borderRadius: "8px", padding: "8px 12px", fontSize: "13px", outline: "none", fontFamily: "inherit" };

  if (loading) return (
    <div style={{ ...pageStyle, alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#F5C842", fontSize: "18px" }}>Chargement...</div>
    </div>
  );

  return (
    <div style={pageStyle}>

      {/* Sidebar */}
      <aside style={{ width: "220px", background: "#0f0f0f", borderRight: "1px solid #1a1a1a", padding: "1.5rem 1rem", flexShrink: 0 }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "22px", color: "#F5C842", letterSpacing: "3px", marginBottom: "2rem", paddingLeft: "8px" }}>
          SHINEUP
        </div>
        <div style={{ fontSize: "10px", color: "#444", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "8px", paddingLeft: "8px" }}>Admin</div>

        {([ ["overview", "📊", "Vue d'ensemble"], ["subscribers", "👥", "Abonnés"], ["payments", "💰", "Paiements"], ["checkins", "📋", "Suivi hebdo"], ["programs", "🤖", "Programmes IA"] ] as [Tab, string, string][]).map(([id, icon, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            width: "100%", display: "flex", alignItems: "center", gap: "10px",
            background: tab === id ? "#1a1a1a" : "none",
            border: `1px solid ${tab === id ? "#F5C842" : "transparent"}`,
            borderRadius: "8px", padding: "10px 12px", cursor: "pointer",
            color: tab === id ? "#F5C842" : "#888", fontSize: "13px", marginBottom: "4px", textAlign: "left",
          }}>
            <span>{icon}</span>{label}
            {id === "payments" && stats.pending > 0 && (
              <span style={{ marginLeft: "auto", background: "#e60000", color: "#fff", borderRadius: "99px", padding: "2px 7px", fontSize: "10px" }}>{stats.pending}</span>
            )}
            {id === "checkins" && stats.checkins_unreplied > 0 && (
              <span style={{ marginLeft: "auto", background: "#F5C842", color: "#000", borderRadius: "99px", padding: "2px 7px", fontSize: "10px" }}>{stats.checkins_unreplied}</span>
            )}
          </button>
        ))}

        <button onClick={() => { supabase.auth.signOut(); window.location.href = "/login"; }}
          style={{ width: "100%", background: "none", border: "1px solid #2a2a2a", color: "#555", padding: "10px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", marginTop: "2rem" } as React.CSSProperties}>
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
                { label: "Abonnés total", value: stats.total, color: "#F5C842" },
                { label: "Abonnés actifs", value: stats.active, color: "#5faa5f" },
                { label: "Paiements en attente", value: stats.pending, color: "#c9a820" },
                { label: "Check-ins sans réponse", value: stats.checkins_unreplied, color: "#f87171" },
                { label: "Revenus confirmés", value: (stats.revenue / 1000).toFixed(0) + "k Ar", color: "#F5C842" },
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
                  <div style={{ color: "#666", fontSize: "12px" }}>{p.method?.toUpperCase()} — Réf: {p.transaction_ref} — {fmt(p.created_at)}</div>
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
              <input style={{ ...inputStyle, width: "220px" }} placeholder="Rechercher..." value={searchQ} onChange={(e) => setSearchQ(e.target.value)} />
            </div>

            <div style={{ display: "grid", gap: "10px" }}>
              {filtered.map((s) => (
                <div key={s.id} style={{ background: "#141414", border: "1px solid #1e1e1e", borderRadius: "12px", padding: "14px 16px", display: "flex", alignItems: "center", gap: "14px", cursor: "pointer" }}
                  onClick={() => router.push(`/admin/subscriber/${s.id}`)}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#1e1e1e", border: "1px solid #2a2a2a", display: "flex", alignItems: "center", justifyContent: "center", color: "#F5C842", fontWeight: 600, fontSize: "14px", flexShrink: 0 }}>
                    {(s.name || s.email)?.[0]?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: "14px" }}>{s.name || "—"} <span style={{ color: "#555", fontWeight: 400 }}>{s.email}</span></div>
                    <div style={{ color: "#666", fontSize: "12px", marginTop: "2px" }}>📱 {s.whatsapp || "—"} · {s.goal || "Pas de formulaire"} · {s.city || "—"}</div>
                  </div>
                  {statusBadge(s.subscription_status)}
                  <div style={{ color: "#444", fontSize: "12px" }}>{fmt(s.created_at)}</div>
                </div>
              ))}
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
                    <div style={{ color: "#666", fontSize: "12px", marginTop: "2px" }}>{p.method?.toUpperCase()} · Réf: {p.transaction_ref} · {fmt(p.created_at)}</div>
                  </div>
                  <div style={{ color: "#F5C842", fontWeight: 600, fontSize: "14px" }}>{(p.amount / 1000).toFixed(0)}k Ar</div>
                  {statusBadge(p.status)}
                  {p.status === "pending" && (
                    <button onClick={() => confirmPayment(p)} style={{ background: "#5faa5f", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "12px" }}>
                      Confirmer ✓
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CHECK-INS */}
        {tab === "checkins" && (
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 500, marginBottom: "1.5rem" }}>Suivi hebdomadaire</h1>
            <div style={{ display: "grid", gap: "10px" }}>
              {checkins.map((c) => (
                <div key={c.id} style={{ background: "#141414", border: `1px solid ${!c.coach_replied ? "#3a2e00" : "#1e1e1e"}`, borderRadius: "12px", padding: "14px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <div>
                      <span style={{ fontWeight: 500, fontSize: "14px" }}>{c.email}</span>
                      <span style={{ color: "#666", fontSize: "12px", marginLeft: "10px" }}>Semaine {c.week_number} · {fmt(c.check_date)}</span>
                    </div>
                    {!c.coach_replied
                      ? <span style={{ background: "#1a1600", color: "#c9a820", border: "1px solid #c9a82033", borderRadius: "99px", padding: "3px 10px", fontSize: "11px" }}>À répondre</span>
                      : <span style={{ background: "#0d1a0d", color: "#5faa5f", border: "1px solid #5faa5f33", borderRadius: "99px", padding: "3px 10px", fontSize: "11px" }}>Répondu</span>
                    }
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginBottom: "10px" }}>
                    {([
                      ["Poids", c.weight_current ? c.weight_current + " kg" : "—"],
                      ["Énergie", c.energy_level + "/10"],
                      ["Sommeil", c.sleep_quality + "/10"],
                      ["Séances", c.training_done + " séances"],
                    ] as [string, string][]).map(([k, v]) => (
                      <div key={k} style={{ background: "#1a1a1a", borderRadius: "8px", padding: "8px", textAlign: "center" }}>
                        <div style={{ color: "#555", fontSize: "10px", marginBottom: "4px" }}>{k}</div>
                        <div style={{ color: "#F5C842", fontWeight: 600, fontSize: "14px" }}>{v}</div>
                      </div>
                    ))}
                  </div>

                  {c.wins && <div style={{ fontSize: "13px", color: "#5faa5f", marginBottom: "4px" }}>✅ {c.wins}</div>}
                  {c.struggles && <div style={{ fontSize: "13px", color: "#c9a820", marginBottom: "4px" }}>⚠️ {c.struggles}</div>}
                  {c.questions && <div style={{ fontSize: "13px", color: "#88aaff", marginBottom: "8px" }}>❓ {c.questions}</div>}
                  {c.coach_feedback && (
                    <div style={{ background: "#0d1a0d", border: "1px solid #1a3a1a", borderRadius: "8px", padding: "10px", fontSize: "13px", color: "#5faa5f", marginBottom: "8px" }}>
                      💬 {c.coach_feedback}
                    </div>
                  )}
                  {!c.coach_replied && (
                    <button onClick={() => { setSelectedCheckin(c); setFeedbackText(""); }}
                      style={{ background: "#F5C842", color: "#000", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: 500 }}>
                      Répondre
                    </button>
                  )}
                </div>
              ))}
            </div>

            {selectedCheckin && (
              <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "#000000cc", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
                <div style={{ background: "#141414", borderRadius: "16px", padding: "2rem", width: "460px", border: "1px solid #2a2a2a" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: 500, marginBottom: "1rem" }}>Répondre à {selectedCheckin.email}</h3>
                  <textarea value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} rows={5} placeholder="Ton feedback personnalisé pour cette semaine..."
                    style={{ width: "100%", background: "#1e1e1e", border: "1px solid #2a2a2a", color: "#f0f0f0", borderRadius: "10px", padding: "12px", fontSize: "14px", fontFamily: "inherit", resize: "vertical", outline: "none" }} />
                  <div style={{ display: "flex", gap: "10px", marginTop: "1rem" }}>
                    <button onClick={replyCheckin} style={{ flex: 1, background: "#F5C842", color: "#000", border: "none", padding: "12px", borderRadius: "10px", cursor: "pointer", fontWeight: 600 }}>
                      Envoyer ✓
                    </button>
                    <button onClick={() => setSelectedCheckin(null)} style={{ background: "none", border: "1px solid #2a2a2a", color: "#888", padding: "12px 20px", borderRadius: "10px", cursor: "pointer" }}>
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PROGRAMMES IA */}
        {tab === "programs" && (
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 500, marginBottom: "1.5rem" }}>Programmes IA générés</h1>
            <div style={{ display: "grid", gap: "10px" }}>
              {plans.map((plan) => (
                <div key={plan.id} style={{ background: "#141414", border: "1px solid #1e1e1e", borderRadius: "12px", padding: "14px 16px", display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: "14px" }}>{plan.user_name || "—"} <span style={{ color: "#555" }}>{plan.email}</span></div>
                    <div style={{ color: "#666", fontSize: "12px", marginTop: "2px" }}>
                      Objectif: {plan.goal} · {plan.calories} kcal · Généré le {fmt(plan.generated_at)}
                    </div>
                  </div>
                  {statusBadge(plan.status)}
                  {plan.program_json && (
                    <button onClick={() => setProgramModal(plan)}
                      style={{ background: "#1e1e1e", border: "1px solid #2a2a2a", color: "#F5C842", padding: "8px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "12px" }}>
                      Voir le programme
                    </button>
                  )}
                </div>
              ))}
            </div>

            {programModal && (
              <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "#000000cc", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "2rem" }}>
                <div style={{ background: "#141414", borderRadius: "16px", padding: "2rem", width: "100%", maxWidth: "700px", maxHeight: "85vh", overflowY: "auto", border: "1px solid #2a2a2a" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                    <h3 style={{ fontSize: "18px", fontWeight: 500 }}>Programme — {programModal.user_name}</h3>
                    <button onClick={() => setProgramModal(null)} style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: "22px" }}>×</button>
                  </div>

                  {programModal.program_json && (() => {
                    const p = programModal.program_json;
                    const nutrition = p.nutrition as Record<string, unknown> | undefined;
                    const training = p.training as Record<string, unknown> | undefined;
                    const monthly = p.monthly_progression as Array<Record<string, unknown>> | undefined;

                    return (
                      <div style={{ fontSize: "13px", lineHeight: 1.7 }}>
                        {!!p.summary && (
                          <div style={{ background: "#1a1a1a", borderRadius: "10px", padding: "14px", marginBottom: "1rem", color: "#ccc" }}>
                            {String(p.summary)}
                          </div>
                        )}

                        {nutrition && (
                          <div style={{ marginBottom: "1rem" }}>
                            <div style={{ color: "#F5C842", fontWeight: 500, marginBottom: "8px" }}>🥗 Nutrition</div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginBottom: "10px" }}>
                              {([
                                ["Calories", String(nutrition.daily_calories) + " kcal"],
                                ["Protéines", String(nutrition.protein_g) + "g"],
                                ["Glucides", String(nutrition.carbs_g) + "g"],
                                ["Lipides", String(nutrition.fats_g) + "g"],
                              ] as [string, string][]).map(([k, v]) => (
                                <div key={k} style={{ background: "#1a1a1a", borderRadius: "8px", padding: "8px", textAlign: "center" }}>
                                  <div style={{ color: "#555", fontSize: "10px" }}>{k}</div>
                                  <div style={{ color: "#F5C842", fontWeight: 600 }}>{v}</div>
                                </div>
                              ))}
                            </div>
                            {!!nutrition.meal_plan_example && (
                              <div style={{ color: "#ccc", background: "#1a1a1a", borderRadius: "8px", padding: "10px" }}>
                                {String(nutrition.meal_plan_example)}
                              </div>
                            )}
                          </div>
                        )}

                        {training && (
                          <div style={{ marginBottom: "1rem" }}>
                            <div style={{ color: "#F5C842", fontWeight: 500, marginBottom: "8px" }}>💪 Planning entraînement</div>
                            {(training.weekly_schedule as Array<Record<string, unknown>> || []).map((day, i) => (
                              <div key={i} style={{ background: "#1a1a1a", borderRadius: "8px", padding: "10px", marginBottom: "6px" }}>
                                <div style={{ fontWeight: 500, color: "#f0f0f0" }}>
                                  {String(day.day)} — {String(day.type)} ({String(day.duration_min)} min)
                                </div>
                                {(day.exercises as Array<Record<string, unknown>> || []).map((ex, j) => (
                                  <div key={j} style={{ color: "#888", marginTop: "4px" }}>
                                    • {String(ex.name)} — {String(ex.sets)}x{String(ex.reps)} | repos: {String(ex.rest)}
                                    {!!ex.notes && <span style={{ color: "#555" }}> ({String(ex.notes)})</span>}
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        )}

                        {monthly && (
                          <div style={{ marginBottom: "1rem" }}>
                            <div style={{ color: "#F5C842", fontWeight: 500, marginBottom: "8px" }}>📅 Progression mensuelle</div>
                            {monthly.map((m, i) => (
                              <div key={i} style={{ background: "#1a1a1a", borderRadius: "8px", padding: "10px", marginBottom: "6px" }}>
                                <div style={{ fontWeight: 500, color: "#f0f0f0" }}>Mois {String(m.month)} — {String(m.focus)}</div>
                                <div style={{ color: "#888" }}>{String(m.objective)}</div>
                                <div style={{ color: "#5faa5f", marginTop: "4px" }}>→ {String(m.expected_change)}</div>
                              </div>
                            ))}
                          </div>
                        )}

                        {!!p.expected_results && (
                          <div style={{ background: "#0d1a0d", border: "1px solid #1a3a1a", borderRadius: "8px", padding: "12px", color: "#5faa5f", marginBottom: "1rem" }}>
                            🎯 {String(p.expected_results)}
                          </div>
                        )}

                        {!!p.coach_message && (
                          <div style={{ background: "#1a1600", border: "1px solid #3a2e00", borderRadius: "8px", padding: "12px", color: "#c9a820" }}>
                            💬 {String(p.coach_message)}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
