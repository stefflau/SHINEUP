"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import EmailModal from "@/components/EmailModal";
import ProgressGallery from "@/components/ProgressGallery";
// ─── Types ────────────────────────────────────────────────────────────────────
type Profile = {
  id: string; email: string; whatsapp: string; gender: string;
  subscription_status: string; subscription_start: string;
  subscription_end: string; created_at: string; role: string;
};

type FormDataType = {
  name: string; age: string; city: string; weight: string; height: string;
  morphology: string; target_weight: string; goal: string; deadline: string;
  stress: number; sleep: number; energy: number; hydration: number; lifestyle: string;
  diet: string; meals_per_day: string; allergies: string; hated_foods: string; food_budget: string;
  fitness_level: string; sports: string[]; equipment: string;
  health_issues: string[]; injuries: string; menstrual_cycle: string; medications: string;
  training_days: string[]; session_duration: string; training_time: string;
  motivation: string; tried_before: string;
};

type CheckIn = {
  id: string; week_number: number; weight_current: number; energy_level: number;
  sleep_quality: number; stress_level: number; training_done: number;
  nutrition_score: number; wins: string; struggles: string; questions: string;
  coach_feedback: string; coach_replied: boolean; check_date: string;
};

type CoachPlan = {
  id: string; goal: string; calories: number; status: string;
  generated_at: string; program_json: Record<string, unknown>;
};

type AdminNote = {
  id: string; note: string; created_at: string; type: string;
};

type Tab = "fiche" | "programme" | "sport" | "nutrition" | "checkins" | "notes";

const fmt = (iso: string) => iso ? new Date(iso).toLocaleDateString("fr-FR") : "—";

const inputStyle: React.CSSProperties = {
  width: "100%", background: "#1e1e1e", border: "1px solid #2a2a2a",
  color: "#f0f0f0", borderRadius: "8px", padding: "10px 12px",
  fontSize: "13px", outline: "none", fontFamily: "inherit", boxSizing: "border-box",
};

export default function SubscriberPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [tab, setTab] = useState<Tab>("fiche");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [formData, setFormData] = useState<FormDataType | null>(null);
  const [plan, setPlan] = useState<CoachPlan | null>(null);
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [notes, setNotes] = useState<AdminNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [noteType, setNoteType] = useState("general");
  const [feedbackText, setFeedbackText] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [showEmail, setShowEmail] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: prof }, { data: fd }, { data: pl }, { data: chks }, { data: ns }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).single(),
      supabase.from("form_data").select("*").eq("user_id", userId).single(),
      supabase.from("coaching_plan").select("*").eq("user_id", userId).order("generated_at", { ascending: false }).limit(1).single(),
      supabase.from("weekly_checkins").select("*").eq("user_id", userId).order("week_number", { ascending: false }),
      supabase.from("admin_notes").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    ]);
    setProfile(prof);
    setFormData(fd);
    setPlan(pl);
    setCheckins(chks || []);
    setNotes(ns || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push("/login"); return; }
      const { data: p } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
      if (p?.role !== "admin") { router.push("/dashboard"); return; }
      load();
    });
  }, [load, router]);

  const generateProgram = async () => {
    if (!formData) return;
    setGenerating(true);
    const res = await fetch("/api/generate-program", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formData, userId, email: profile?.email }),
    });
    if (res.ok) { load(); } else { alert("Erreur génération"); }
    setGenerating(false);
  };

  const addNote = async () => {
    if (!newNote.trim()) return;
    await supabase.from("admin_notes").insert([{
      user_id: userId, note: newNote, type: noteType, created_at: new Date().toISOString(),
    }]);
    setNewNote("");
    load();
  };

  const replyCheckin = async (checkinId: string) => {
    if (!feedbackText.trim()) return;
    await supabase.from("weekly_checkins").update({
      coach_feedback: feedbackText, coach_replied: true,
      coach_reply_at: new Date().toISOString(),
    }).eq("id", checkinId);
    setReplyingTo(null);
    setFeedbackText("");
    load();
  };

  const prog = plan?.program_json;
  const training = prog?.training as Record<string, unknown> | undefined;
  const monthlyProgression = prog?.monthly_progression as Array<Record<string, unknown>> | undefined;
  const weeklySchedule = training?.weekly_schedule as Array<Record<string, unknown>> | undefined;
  const expectedResults = prog?.expected_results as Record<string, unknown> | string | undefined;

  const daysLeft = profile?.subscription_end
    ? Math.max(0, Math.ceil((new Date(profile.subscription_end).getTime() - Date.now()) / 86400000))
    : 0;

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: "fiche",      label: "Fiche",        icon: "👤" },
    { id: "programme",  label: "Programme",    icon: "🎯" },
    { id: "sport",      label: "Sport 3 mois", icon: "💪" },
    { id: "nutrition",  label: "Nutrition",    icon: "🥗" },
    { id: "checkins",   label: "Suivi hebdo",  icon: "📋" },
    { id: "notes",      label: "Mes notes",    icon: "📝" },
  ];

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#F5C842" }}>Chargement du profil...</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#f0f0f0" }}>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header style={{ background: "#0f0f0f", borderBottom: "1px solid #1a1a1a", padding: "1rem 2rem", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
        <button onClick={() => router.push("/admin")}
          style={{ background: "none", border: "1px solid #2a2a2a", color: "#888", padding: "8px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "13px" }}>
          ← Retour admin
        </button>
        <div>
          <div style={{ fontWeight: 600, fontSize: "16px" }}>{formData?.name || "—"}</div>
          <div style={{ color: "#666", fontSize: "12px" }}>{profile?.email} · {profile?.whatsapp}</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          {/* Bouton email */}
          <button onClick={() => setShowEmail(true)}
            style={{ background: "#1a1600", border: "1px solid #F5C842", color: "#F5C842", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: 500 }}>
            📧 Envoyer email
          </button>
          {/* Badge statut */}
          <span style={{
            background: profile?.subscription_status === "active" ? "#0d1a0d" : "#1a1010",
            color: profile?.subscription_status === "active" ? "#5faa5f" : "#f87171",
            border: `1px solid ${profile?.subscription_status === "active" ? "#5faa5f33" : "#f8717133"}`,
            borderRadius: "99px", padding: "4px 12px", fontSize: "12px",
          }}>
            {profile?.subscription_status === "active" ? `✅ Actif — ${daysLeft}j restants` : "❌ Inactif"}
          </span>
        </div>
      </header>

      {/* ── Tabs ────────────────────────────────────────────────────────────── */}
      <div style={{ background: "#0f0f0f", borderBottom: "1px solid #1a1a1a", padding: "0 2rem", display: "flex", gap: "4px", overflowX: "auto" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            background: "none", border: "none",
            borderBottom: `2px solid ${tab === t.id ? "#F5C842" : "transparent"}`,
            color: tab === t.id ? "#F5C842" : "#666",
            padding: "14px 16px", cursor: "pointer", fontSize: "13px",
            fontWeight: tab === t.id ? 500 : 400, whiteSpace: "nowrap",
          }}>
            {t.icon} {t.label}
            {t.id === "checkins" && checkins.filter(c => !c.coach_replied).length > 0 && (
              <span style={{ marginLeft: "6px", background: "#F5C842", color: "#000", borderRadius: "99px", padding: "1px 6px", fontSize: "10px" }}>
                {checkins.filter(c => !c.coach_replied).length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem" }}>

        {/* ── FICHE ───────────────────────────────────────────────────────── */}
        {tab === "fiche" && (
          <div>
            {/* Analyse du cas */}
            {!!prog?.coach_case_analysis && (
              <div style={{ background: "#1a1600", border: "1px solid #F5C842", borderRadius: "14px", padding: "20px", marginBottom: "1.5rem" }}>
                <div style={{ color: "#F5C842", fontWeight: 600, fontSize: "14px", marginBottom: "10px" }}>
                  🧠 Analyse du cas — Notes de coaching
                </div>
                <p style={{ color: "#c9a820", fontSize: "14px", lineHeight: 1.8, margin: 0 }}>
                  {String(prog.coach_case_analysis)}
                </p>
              </div>
            )}

            {/* Protocole */}
            {!!prog?.coaching_notes && (
              <div style={{ background: "#0d1a0d", border: "1px solid #1a3a1a", borderRadius: "14px", padding: "20px", marginBottom: "1.5rem" }}>
                <div style={{ color: "#5faa5f", fontWeight: 600, fontSize: "14px", marginBottom: "10px" }}>
                  📋 Protocole de suivi recommandé
                </div>
                <p style={{ color: "#ccc", fontSize: "14px", lineHeight: 1.8, margin: 0 }}>
                  {String(prog.coaching_notes)}
                </p>
              </div>
            )}

            {/* Profil + Corps */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "1.5rem" }}>
              <div style={{ background: "#141414", border: "1px solid #1e1e1e", borderRadius: "14px", padding: "16px" }}>
                <div style={{ color: "#888", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "12px" }}>Profil</div>
                {([
                  ["Nom", formData?.name],
                  ["Âge", formData?.age ? formData.age + " ans" : null],
                  ["Genre", profile?.gender],
                  ["Ville", formData?.city],
                  ["WhatsApp", profile?.whatsapp],
                  ["Inscrit le", fmt(profile?.created_at || "")],
                ] as [string, string | undefined][]).map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #1a1a1a", fontSize: "13px" }}>
                    <span style={{ color: "#666" }}>{k}</span>
                    <span style={{ color: "#f0f0f0" }}>{v || "—"}</span>
                  </div>
                ))}
              </div>

              <div style={{ background: "#141414", border: "1px solid #1e1e1e", borderRadius: "14px", padding: "16px" }}>
                <div style={{ color: "#888", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "12px" }}>Corps & Objectif</div>
                {([
                  ["Poids actuel", formData?.weight ? formData.weight + " kg" : null],
                  ["Taille", formData?.height ? formData.height + " cm" : null],
                  ["Poids cible", formData?.target_weight ? formData.target_weight + " kg" : null],
                  ["Morphologie", formData?.morphology],
                  ["Objectif", formData?.goal],
                  ["Délai", formData?.deadline],
                ] as [string, string | undefined][]).map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #1a1a1a", fontSize: "13px" }}>
                    <span style={{ color: "#666" }}>{k}</span>
                    <span style={{ color: "#f0f0f0", textAlign: "right", maxWidth: "160px" }}>{v || "—"}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Santé */}
            <div style={{ background: "#141414", border: "1px solid #1e1e1e", borderRadius: "14px", padding: "16px", marginBottom: "12px" }}>
              <div style={{ color: "#f87171", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "12px" }}>🏥 Santé & Antécédents</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                {([
                  ["Antécédents", formData?.health_issues?.join(", ")],
                  ["Blessures", formData?.injuries],
                  ["Cycle menstruel", formData?.menstrual_cycle],
                  ["Médicaments", formData?.medications],
                ] as [string, string | undefined][]).map(([k, v]) => (
                  <div key={k} style={{ padding: "8px", background: "#1a1a1a", borderRadius: "8px" }}>
                    <div style={{ color: "#555", fontSize: "11px", marginBottom: "4px" }}>{k}</div>
                    <div style={{ color: v ? "#f87171" : "#444", fontSize: "13px" }}>{v || "Aucun"}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sport + Lifestyle */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "1.5rem" }}>
              <div style={{ background: "#141414", border: "1px solid #1e1e1e", borderRadius: "14px", padding: "16px" }}>
                <div style={{ color: "#888", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "12px" }}>💪 Sport</div>
                {([
                  ["Niveau", formData?.fitness_level],
                  ["Sports", formData?.sports?.join(", ")],
                  ["Équipement", formData?.equipment],
                  ["Jours dispo", formData?.training_days?.join(", ")],
                  ["Durée séance", formData?.session_duration],
                  ["Moment", formData?.training_time],
                ] as [string, string | undefined][]).map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #1a1a1a", fontSize: "13px" }}>
                    <span style={{ color: "#666" }}>{k}</span>
                    <span style={{ color: "#f0f0f0", textAlign: "right", maxWidth: "150px" }}>{v || "—"}</span>
                  </div>
                ))}
              </div>

              <div style={{ background: "#141414", border: "1px solid #1e1e1e", borderRadius: "14px", padding: "16px" }}>
                <div style={{ color: "#888", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "12px" }}>🌿 Mode de vie</div>
                {([
                  ["Stress", formData?.stress ? formData.stress + "/10" : null],
                  ["Sommeil", formData?.sleep ? formData.sleep + "h" : null],
                  ["Énergie", formData?.energy ? formData.energy + "/10" : null],
                  ["Hydratation", formData?.hydration ? formData.hydration + "L/j" : null],
                  ["Rythme", formData?.lifestyle],
                  ["Régime", formData?.diet],
                  ["Allergies", formData?.allergies],
                  ["Budget alim.", formData?.food_budget],
                ] as [string, string | undefined][]).map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #1a1a1a", fontSize: "13px" }}>
                    <span style={{ color: "#666" }}>{k}</span>
                    <span style={{ color: "#f0f0f0", textAlign: "right", maxWidth: "150px" }}>{v || "—"}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Motivation */}
            {!!formData?.motivation && (
              <div style={{ background: "#141414", border: "1px solid #1e1e1e", borderRadius: "12px", padding: "14px", marginBottom: "12px" }}>
                <div style={{ color: "#888", fontSize: "11px", marginBottom: "6px" }}>💬 Motivation</div>
                <p style={{ color: "#ccc", fontSize: "13px", margin: 0, lineHeight: 1.6 }}>{formData.motivation}</p>
              </div>
            )}

            {/* Bouton générer */}
            <button onClick={generateProgram} disabled={generating} style={{
              width: "100%", background: generating ? "#1a1a1a" : "#F5C842",
              color: generating ? "#F5C842" : "#000",
              border: generating ? "1px solid #F5C842" : "none",
              padding: "14px", borderRadius: "12px", fontWeight: 600,
              cursor: generating ? "not-allowed" : "pointer", fontSize: "15px", marginTop: "8px",
            }}>
              {generating ? "⏳ Génération IA en cours (30-60s)..." : "🤖 Générer / Regénérer le programme IA"}
            </button>
          </div>
        )}

        {/* ── PROGRAMME 3 MOIS ────────────────────────────────────────────── */}
        {tab === "programme" && (
          <div>
            {!prog ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "#444" }}>
                Aucun programme généré. Va dans Fiche pour en générer un.
              </div>
            ) : (
              <>
                {!!prog.summary && (
                  <div style={{ background: "#1a1600", border: "1px solid #3a2e00", borderRadius: "14px", padding: "16px", marginBottom: "1.5rem" }}>
                    <div style={{ color: "#F5C842", fontWeight: 500, marginBottom: "8px" }}>🎯 Stratégie globale</div>
                    <p style={{ color: "#c9a820", fontSize: "14px", lineHeight: 1.7, margin: 0 }}>{String(prog.summary)}</p>
                  </div>
                )}

                <div style={{ display: "flex", gap: "8px", marginBottom: "1.5rem" }}>
                  {[1, 2, 3].map(m => (
                    <button key={m} onClick={() => setSelectedMonth(m)} style={{
                      flex: 1, padding: "12px", borderRadius: "10px",
                      background: selectedMonth === m ? "#F5C842" : "#141414",
                      color: selectedMonth === m ? "#000" : "#888",
                      border: `1px solid ${selectedMonth === m ? "#F5C842" : "#2a2a2a"}`,
                      cursor: "pointer", fontWeight: selectedMonth === m ? 600 : 400, fontSize: "14px",
                    }}>
                      Mois {m}
                    </button>
                  ))}
                </div>

                {monthlyProgression?.filter(m => Number(m.month) === selectedMonth).map((m, i) => (
                  <div key={i} style={{ background: "#141414", border: "1px solid #1e1e1e", borderRadius: "14px", padding: "16px", marginBottom: "1rem" }}>
                    <div style={{ color: "#F5C842", fontWeight: 600, fontSize: "15px", marginBottom: "10px" }}>
                      Mois {String(m.month)} — {String(m.focus)}
                    </div>
                    <div style={{ color: "#ccc", fontSize: "14px", marginBottom: "8px" }}>🎯 {String(m.objective)}</div>
                    <div style={{ color: "#5faa5f", fontSize: "13px", marginBottom: "12px" }}>→ {String(m.expected_change)}</div>

                    {(m.checklist as string[] || []).length > 0 && (
                      <div>
                        <div style={{ color: "#888", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>
                          Checklist objectifs
                        </div>
                        {(m.checklist as string[]).map((item, j) => {
                          const key = `m${String(m.month)}-${j}`;
                          return (
                            <div key={j} onClick={() => setChecklist(prev => ({ ...prev, [key]: !prev[key] }))}
                              style={{ display: "flex", gap: "10px", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #1a1a1a", cursor: "pointer" }}>
                              <div style={{ width: "18px", height: "18px", borderRadius: "4px", border: `2px solid ${checklist[key] ? "#5faa5f" : "#2a2a2a"}`, background: checklist[key] ? "#5faa5f" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                {checklist[key] && <span style={{ color: "#000", fontSize: "11px" }}>✓</span>}
                              </div>
                              <span style={{ color: checklist[key] ? "#5faa5f" : "#ccc", fontSize: "13px", textDecoration: checklist[key] ? "line-through" : "none" }}>
                                {item}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}

                {!!training?.progression_guide && (
                  <div style={{ background: "#0d1a1a", border: "1px solid #1a3a3a", borderRadius: "14px", padding: "16px", marginBottom: "1rem" }}>
                    <div style={{ color: "#5faaaa", fontWeight: 500, marginBottom: "8px" }}>📈 Guide de progression sur 3 mois</div>
                    <p style={{ color: "#ccc", fontSize: "13px", lineHeight: 1.7, margin: 0 }}>
                      {String(training.progression_guide)}
                    </p>
                  </div>
                )}

                {/* Résultats attendus */}
                {!!prog.expected_results && (
                  <div style={{ background: "#0d1a0d", border: "1px solid #1a3a1a", borderRadius: "14px", padding: "16px", marginBottom: "1rem" }}>
                    <div style={{ color: "#5faa5f", fontWeight: 500, marginBottom: "10px" }}>🎯 Résultats attendus à 3 mois</div>
                    {typeof prog.expected_results === "object" ? (
                      Object.entries(prog.expected_results as Record<string, unknown>).map(([k, v]) => (
                        <div key={k} style={{ padding: "6px 0", borderBottom: "1px solid #1a3a1a", fontSize: "13px" }}>
                          <span style={{ color: "#5faa5f", fontWeight: 500, textTransform: "capitalize" }}>
                            {k.replace(/_/g, " ")} :
                          </span>
                          <span style={{ color: "#ccc", marginLeft: "6px" }}>{String(v)}</span>
                        </div>
                      ))
                    ) : (
                      <p style={{ color: "#ccc", fontSize: "13px", margin: 0, lineHeight: 1.7 }}>{String(prog.expected_results)}</p>
                    )}
                  </div>
                )}

                {/* Message coach */}
                {!!prog.coach_message && (
                  <div style={{ background: "#1a1600", border: "1px solid #3a2e00", borderRadius: "14px", padding: "16px" }}>
                    <div style={{ color: "#F5C842", fontWeight: 500, marginBottom: "8px" }}>💬 Message du coach</div>
                    <p style={{ color: "#c9a820", fontSize: "14px", lineHeight: 1.7, margin: 0, fontStyle: "italic" }}>
                      {String(prog.coach_message)}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── SPORT 3 MOIS ────────────────────────────────────────────────── */}
        {tab === "sport" && (
          <div>
            {!weeklySchedule || weeklySchedule.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "#444" }}>Programme non encore généré. Va dans Fiche pour générer un programme.</div>
            ) : (
              <>
                {/* Progression guide */}
                {!!training?.cardio_recommendation && (
                  <div style={{ background: "#0d1a1a", border: "1px solid #1a3a3a", borderRadius: "12px", padding: "14px", marginBottom: "1.5rem" }}>
                    <div style={{ color: "#5faaaa", fontWeight: 500, marginBottom: "6px" }}>🏃 Cardio recommandé</div>
                    <p style={{ color: "#ccc", fontSize: "13px", lineHeight: 1.6, margin: 0 }}>{String(training.cardio_recommendation)}</p>
                  </div>
                )}

                {!!training?.rest_advice && (
                  <div style={{ background: "#141414", border: "1px solid #1e1e1e", borderRadius: "12px", padding: "14px", marginBottom: "1.5rem" }}>
                    <div style={{ color: "#888", fontWeight: 500, marginBottom: "6px" }}>😴 Récupération</div>
                    <p style={{ color: "#ccc", fontSize: "13px", lineHeight: 1.6, margin: 0 }}>{String(training.rest_advice)}</p>
                  </div>
                )}

                {/* Progression par mois */}
                <div style={{ display: "flex", gap: "8px", marginBottom: "1.5rem" }}>
                  {[1, 2, 3].map(m => (
                    <button key={m} onClick={() => setSelectedMonth(m)} style={{
                      flex: 1, padding: "12px", borderRadius: "10px",
                      background: selectedMonth === m ? "#F5C842" : "#141414",
                      color: selectedMonth === m ? "#000" : "#888",
                      border: `1px solid ${selectedMonth === m ? "#F5C842" : "#2a2a2a"}`,
                      cursor: "pointer", fontWeight: selectedMonth === m ? 600 : 400,
                    }}>
                      Mois {m}
                    </button>
                  ))}
                </div>

                {/* Info progression du mois sélectionné */}
                {monthlyProgression?.filter(m => Number(m.month) === selectedMonth).map((m, i) => (
                  <div key={i} style={{ background: "#1a1600", border: "1px solid #3a2e00", borderRadius: "12px", padding: "14px", marginBottom: "1.5rem" }}>
                    <div style={{ color: "#F5C842", fontWeight: 600, marginBottom: "4px" }}>
                      Mois {String(m.month)} — {String(m.focus)}
                    </div>
                    <div style={{ color: "#c9a820", fontSize: "13px" }}>🎯 {String(m.objective)}</div>
                    <div style={{ color: "#5faa5f", fontSize: "13px", marginTop: "4px" }}>→ {String(m.expected_change)}</div>
                  </div>
                ))}

                {/* Planning hebdomadaire */}
                <div style={{ color: "#888", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "12px" }}>
                  Planning hebdomadaire type
                  {selectedMonth > 1 && (
                    <span style={{ color: "#555", marginLeft: "8px", fontSize: "11px", textTransform: "none" }}>
                      — Augmenter les charges de {selectedMonth === 2 ? "2-3kg" : "4-5kg"} vs mois 1
                    </span>
                  )}
                </div>

                {(training?.weekly_schedule as Array<Record<string, unknown>> || []).map((day, di) => (
                  <div key={di} style={{ background: "#141414", border: "1px solid #1e1e1e", borderRadius: "14px", padding: "16px", marginBottom: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                      <div>
                        <div style={{ fontWeight: 600, color: "#F5C842", fontSize: "14px" }}>{String(day.day)}</div>
                        <div style={{ color: "#888", fontSize: "12px", marginTop: "2px" }}>{String(day.type)}</div>
                      </div>
                      <span style={{ color: "#555", fontSize: "12px" }}>{String(day.duration_min)} min</span>
                    </div>
                    {(day.exercises as Array<Record<string, unknown>> || []).map((ex, ei) => (
                      <div key={ei} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "6px 0", borderBottom: "1px solid #1a1a1a", fontSize: "12px" }}>
                        <div style={{ flex: 1 }}>
                          <span style={{ color: "#ccc" }}>• {String(ex.name)}</span>
                          {!!ex.notes && <div style={{ color: "#555", fontSize: "11px", marginTop: "2px" }}>ℹ️ {String(ex.notes)}</div>}
                        </div>
                        <div style={{ display: "flex", gap: "8px", flexShrink: 0, marginLeft: "8px" }}>
                          <span style={{ color: "#F5C842" }}>{String(ex.sets)}×{String(ex.reps)}</span>
                          <span style={{ color: "#555" }}>{String(ex.rest)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* ── NUTRITION ───────────────────────────────────────────────────── */}
        {tab === "nutrition" && (
          <div>
            {!prog?.nutrition ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "#444" }}>Programme non encore généré.</div>
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "1.5rem" }}>
                  {([
                    ["Calories", String((prog.nutrition as Record<string, unknown>).daily_calories) + " kcal", "#F5C842"],
                    ["Protéines", String((prog.nutrition as Record<string, unknown>).protein_g) + "g", "#5faa5f"],
                    ["Glucides", String((prog.nutrition as Record<string, unknown>).carbs_g) + "g", "#88aaff"],
                    ["Lipides", String((prog.nutrition as Record<string, unknown>).fats_g) + "g", "#c9a820"],
                  ] as [string, string, string][]).map(([k, v, c]) => (
                    <div key={k} style={{ background: "#141414", border: "1px solid #1e1e1e", borderRadius: "12px", padding: "14px", textAlign: "center" }}>
                      <div style={{ color: "#555", fontSize: "11px", marginBottom: "4px" }}>{k}</div>
                      <div style={{ color: c, fontSize: "20px", fontWeight: 700 }}>{v}</div>
                    </div>
                  ))}
                </div>

                <div style={{ background: "#141414", border: "1px solid #1e1e1e", borderRadius: "14px", padding: "16px", marginBottom: "1.5rem" }}>
                  <div style={{ color: "#F5C842", fontWeight: 500, marginBottom: "10px" }}>🍽️ Exemple de journée type</div>
                  <p style={{ color: "#ccc", fontSize: "13px", lineHeight: 1.8, margin: 0, whiteSpace: "pre-line" }}>
                    {String((prog.nutrition as Record<string, unknown>).meal_plan_example)}
                  </p>
                </div>

                {/* Aliments à favoriser / éviter */}
                {!!(prog.nutrition as Record<string, unknown>)?.foods_to_favor && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "1.5rem" }}>
                    <div style={{ background: "#0d1a0d", border: "1px solid #1a3a1a", borderRadius: "12px", padding: "14px" }}>
                      <div style={{ color: "#5faa5f", fontSize: "12px", fontWeight: 500, marginBottom: "10px" }}>✅ À favoriser</div>
                      {((prog.nutrition as Record<string, unknown>).foods_to_favor as string[] || []).map((f, i) => (
                        <div key={i} style={{ color: "#ccc", fontSize: "13px", padding: "4px 0", borderBottom: "1px solid #1a3a1a" }}>• {f}</div>
                      ))}
                    </div>
                    <div style={{ background: "#1a0d0d", border: "1px solid #3a1a1a", borderRadius: "12px", padding: "14px" }}>
                      <div style={{ color: "#f87171", fontSize: "12px", fontWeight: 500, marginBottom: "10px" }}>❌ À éviter</div>
                      {((prog.nutrition as Record<string, unknown>).foods_to_avoid as string[] || []).map((f, i) => (
                        <div key={i} style={{ color: "#ccc", fontSize: "13px", padding: "4px 0", borderBottom: "1px solid #3a1a1a" }}>• {f}</div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Compléments */}
                {!!(prog.nutrition as Record<string, unknown>)?.supplements && (
                  <div style={{ background: "#141414", border: "1px solid #1e1e1e", borderRadius: "12px", padding: "14px" }}>
                    <div style={{ color: "#F5C842", fontSize: "12px", fontWeight: 500, marginBottom: "10px" }}>💊 Compléments recommandés</div>
                    {((prog.nutrition as Record<string, unknown>).supplements as string[] || []).map((s, i) => (
                      <div key={i} style={{ color: "#ccc", fontSize: "13px", padding: "5px 0", borderBottom: "1px solid #1a1a1a" }}>• {s}</div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
<ProgressGallery
  checkins={checkins}
  goal={formData?.goal || ""}
  initialWeight={parseFloat(formData?.weight || "0")}
  isAdmin={true}
/>
        {/* ── SUIVI HEBDO ─────────────────────────────────────────────────── */}
        {tab === "checkins" && (
          <div>
            <div style={{ color: "#888", fontSize: "13px", marginBottom: "1.5rem" }}>
              {checkins.length === 0
                ? "L'abonné n'a pas encore soumis de check-in. Il peut le faire depuis son dashboard."
                : `${checkins.length} check-in(s) — ${checkins.filter(c => !c.coach_replied).length} sans réponse`}
            </div>

            {checkins.map(c => (
              <div key={c.id} style={{ background: "#141414", border: `1px solid ${!c.coach_replied ? "#3a2e00" : "#1e1e1e"}`, borderRadius: "14px", padding: "16px", marginBottom: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <div style={{ fontWeight: 600, color: "#F5C842" }}>Semaine {c.week_number}</div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <span style={{ color: "#555", fontSize: "12px" }}>{fmt(c.check_date)}</span>
                    {!c.coach_replied
                      ? <span style={{ background: "#1a1600", color: "#c9a820", border: "1px solid #c9a82033", borderRadius: "99px", padding: "3px 10px", fontSize: "11px" }}>À répondre</span>
                      : <span style={{ background: "#0d1a0d", color: "#5faa5f", border: "1px solid #5faa5f33", borderRadius: "99px", padding: "3px 10px", fontSize: "11px" }}>Répondu ✓</span>
                    }
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "8px", marginBottom: "12px" }}>
                  {([
                    ["Poids", c.weight_current ? c.weight_current + " kg" : "—"],
                    ["Énergie", c.energy_level + "/10"],
                    ["Sommeil", c.sleep_quality + "/10"],
                    ["Stress", c.stress_level + "/10"],
                    ["Séances", c.training_done + "x"],
                  ] as [string, string][]).map(([k, v]) => (
                    <div key={k} style={{ background: "#1a1a1a", borderRadius: "8px", padding: "8px", textAlign: "center" }}>
                      <div style={{ color: "#555", fontSize: "10px", marginBottom: "3px" }}>{k}</div>
                      <div style={{ color: "#F5C842", fontWeight: 600, fontSize: "13px" }}>{v}</div>
                    </div>
                  ))}
                </div>

                {c.wins && <div style={{ color: "#5faa5f", fontSize: "13px", marginBottom: "4px" }}>✅ {c.wins}</div>}
                {c.struggles && <div style={{ color: "#c9a820", fontSize: "13px", marginBottom: "4px" }}>⚠️ {c.struggles}</div>}
                {c.questions && <div style={{ color: "#88aaff", fontSize: "13px", marginBottom: "10px" }}>❓ {c.questions}</div>}

                {c.coach_feedback && (
                  <div style={{ background: "#0d1a0d", border: "1px solid #1a3a1a", borderRadius: "8px", padding: "10px", fontSize: "13px", color: "#5faa5f", marginBottom: "10px" }}>
                    💬 {c.coach_feedback}
                  </div>
                )}

                {replyingTo === c.id ? (
                  <div>
                    <textarea value={feedbackText} onChange={e => setFeedbackText(e.target.value)} rows={3}
                      placeholder="Ton feedback personnalisé..." style={{ ...inputStyle, resize: "vertical" as const }} />
                    <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                      <button onClick={() => replyCheckin(c.id)} style={{ flex: 1, background: "#F5C842", color: "#000", border: "none", padding: "10px", borderRadius: "8px", cursor: "pointer", fontWeight: 600, fontSize: "13px" }}>
                        Envoyer ✓
                      </button>
                      <button onClick={() => setReplyingTo(null)} style={{ background: "none", border: "1px solid #2a2a2a", color: "#888", padding: "10px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "13px" }}>
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => { setReplyingTo(c.id); setFeedbackText(c.coach_feedback || ""); }}
                    style={{ background: c.coach_replied ? "#1a1a1a" : "#F5C842", color: c.coach_replied ? "#888" : "#000", border: c.coach_replied ? "1px solid #2a2a2a" : "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: 500 }}>
                    {c.coach_replied ? "Modifier la réponse" : "Répondre"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── NOTES COACH ─────────────────────────────────────────────────── */}
        {tab === "notes" && (
          <div>
            <div style={{ background: "#141414", border: "1px solid #1e1e1e", borderRadius: "14px", padding: "16px", marginBottom: "1.5rem" }}>
              <div style={{ color: "#888", fontSize: "12px", marginBottom: "10px" }}>Ajouter une note</div>
              <div style={{ display: "flex", gap: "8px", marginBottom: "10px", flexWrap: "wrap" }}>
                {(["general", "alerte", "progression", "nutrition", "sport"] as const).map(t => (
                  <button key={t} onClick={() => setNoteType(t)} style={{
                    padding: "6px 12px", borderRadius: "99px",
                    border: `1px solid ${noteType === t ? "#F5C842" : "#2a2a2a"}`,
                    background: noteType === t ? "#F5C842" : "none",
                    color: noteType === t ? "#000" : "#666",
                    cursor: "pointer", fontSize: "12px", fontWeight: noteType === t ? 500 : 400,
                  }}>
                    {t === "general" ? "📝 Général" : t === "alerte" ? "⚠️ Alerte" : t === "progression" ? "📈 Progression" : t === "nutrition" ? "🥗 Nutrition" : "💪 Sport"}
                  </button>
                ))}
              </div>
              <textarea value={newNote} onChange={e => setNewNote(e.target.value)} rows={3}
                placeholder="Note de coaching, observation, alerte santé, progression..."
                style={{ ...inputStyle, resize: "vertical" as const }} />
              <button onClick={addNote} style={{ marginTop: "10px", background: "#F5C842", color: "#000", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: 600, fontSize: "13px" }}>
                Ajouter la note
              </button>
            </div>

            {notes.length === 0 ? (
              <div style={{ color: "#444", textAlign: "center", padding: "2rem" }}>Aucune note pour cet abonné.</div>
            ) : notes.map(n => {
              const colors: Record<string, string> = { general: "#888", alerte: "#f87171", progression: "#5faa5f", nutrition: "#88aaff", sport: "#F5C842" };
              const icons: Record<string, string> = { general: "📝", alerte: "⚠️", progression: "📈", nutrition: "🥗", sport: "💪" };
              return (
                <div key={n.id} style={{ background: "#141414", borderLeft: `3px solid ${colors[n.type] || "#2a2a2a"}`, borderRadius: "10px", padding: "14px", marginBottom: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ color: colors[n.type], fontSize: "12px", fontWeight: 500 }}>
                      {icons[n.type]} {n.type.charAt(0).toUpperCase() + n.type.slice(1)}
                    </span>
                    <span style={{ color: "#444", fontSize: "11px" }}>{fmt(n.created_at)}</span>
                  </div>
                  <p style={{ color: "#ccc", fontSize: "13px", margin: 0, lineHeight: 1.6 }}>{n.note}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Modal Email ─────────────────────────────────────────────────────── */}
      {showEmail && profile && (
        <EmailModal
          subscriber={{
            id: profile.id,
            email: profile.email,
            name: formData?.name,
            whatsapp: profile.whatsapp,
          }}
          appUrl={process.env.NEXT_PUBLIC_APP_URL || "https://shineup.vercel.app"}
          onClose={() => setShowEmail(false)}
        />
      )}
    </div>
  );
}
