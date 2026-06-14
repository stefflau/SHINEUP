"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import CheckInForm from "@/components/CheckInForm";
import ProgressGallery from "@/components/ProgressGallery";

type CoachProgram = {
  summary?: string;
  nutrition?: {
    daily_calories: number;
    protein_g: number;
    carbs_g: number;
    fats_g: number;
    hydration_L: number;
    meal_plan_example: string;
    foods_to_favor: string[];
    foods_to_avoid: string[];
    supplements: string[];
  };
  training?: {
    weekly_schedule: Array<{
      day: string;
      type: string;
      duration_min: number;
      exercises: Array<{ name: string; sets: string; reps: string; rest: string; notes?: string }>;
    }>;
    cardio_recommendation: string;
    rest_advice: string;
  };
  lifestyle?: {
    sleep_tips: string;
    stress_management: string;
    daily_habits: string[];
    things_to_avoid: string[];
    morning_routine?: string[];
    evening_routine?: string[];
    glow_up_tips?: string[];
  };
  monthly_progression?: Array<{ month: number; focus: string; objective: string; expected_change: string }>;
  expected_results?: string | Record<string, unknown>;
  coach_message?: string;
};

type Plan = {
  id: string;
  goal: string;
  calories: number;
  status: string;
  program_json: CoachProgram;
  generated_at: string;
};

type CheckIn = {
  id: string;
  week_number: number;
  weight_current: number;
  energy_level: number;
  sleep_quality: number;
  stress_level: number;
  training_done: number;
  wins: string;
  struggles: string;
  coach_feedback: string;
  coach_replied: boolean;
  check_date: string;
  photo_url?: string;
};

type Profile = {
  id: string;
  email: string;
  whatsapp: string;
  subscription_status: string;
  subscription_end: string;
};

type FormDataType = {
  name: string;
  goal: string;
  weight: string;
};

type Tab = "programme" | "nutrition" | "sport" | "lifestyle" | "suivi";

export default function DashboardPage() {
  const [tab, setTab] = useState<Tab>("programme");
  const [plan, setPlan] = useState<Plan | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [formData, setFormData] = useState<FormDataType | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCheckinForm, setShowCheckinForm] = useState(false);

  const load = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) { window.location.href = "/login"; return; }
    const uid = userData.user.id;

    const [{ data: prof }, { data: pl }, { data: chks }, { data: fd }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", uid).single(),
      // FIX: on ne filtre plus sur status="active" ici — on affiche le plan dès qu'il existe
      // Le statut "actif" est vérifié via profile.subscription_status
      supabase.from("coaching_plan").select("*").eq("user_id", uid).order("generated_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("weekly_checkins").select("*").eq("user_id", uid).order("week_number", { ascending: false }),
      supabase.from("form_data").select("name,goal,weight").eq("user_id", uid).maybeSingle(),
    ]);

    setProfile(prof ? { ...prof, id: uid } : null);
    setPlan(pl);
    setCheckins(chks || []);
    setFormData(fd);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const prog = plan?.program_json;

  // FIX: calcul du compte à rebours depuis profile.subscription_end
  const daysLeft = profile?.subscription_end
    ? Math.max(0, Math.ceil((new Date(profile.subscription_end).getTime() - Date.now()) / 86400000))
    : 0;

  // FIX: vérification que l'abonnement est actif ET que le plan existe
  const isSubscriptionActive = profile?.subscription_status === "active";
  const hasPlan = !!plan;

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#F5C842", fontSize: "16px" }}>Chargement de ton programme...</div>
    </div>
  );

  // FIX: état intermédiaire — paiement en attente de confirmation
  if (!isSubscriptionActive) return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ textAlign: "center", maxWidth: "420px" }}>
        <div style={{ fontSize: "48px", marginBottom: "1rem" }}>⏳</div>
        <h1 style={{ color: "#F5C842", fontSize: "22px", marginBottom: "8px" }}>Programme en préparation</h1>
        <p style={{ color: "#888", lineHeight: 1.7 }}>
          Ton paiement est en cours de vérification. Ton programme personnalisé sera disponible ici{" "}
          <strong style={{ color: "#f0f0f0" }}>dans les 48 heures</strong>.
        </p>
        <p style={{ color: "#555", fontSize: "13px", marginTop: "1rem" }}>
          📱 On te contactera sur WhatsApp : {profile?.whatsapp}
        </p>
      </div>
    </div>
  );

  // FIX: abonnement actif mais programme pas encore généré par l'admin
  if (isSubscriptionActive && !hasPlan) return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ textAlign: "center", maxWidth: "420px" }}>
        <div style={{ fontSize: "48px", marginBottom: "1rem" }}>🤖</div>
        <h1 style={{ color: "#F5C842", fontSize: "22px", marginBottom: "8px" }}>Ton programme est en cours de création</h1>
        <p style={{ color: "#888", lineHeight: 1.7 }}>
          Paiement confirmé ✅ Ton coach génère ton programme personnalisé. Il sera disponible très bientôt !
        </p>
        <p style={{ color: "#555", fontSize: "13px", marginTop: "1rem" }}>
          📱 On te prévient sur WhatsApp : {profile?.whatsapp}
        </p>
      </div>
    </div>
  );

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: "programme", label: "Résumé",    icon: "🎯" },
    { id: "nutrition", label: "Nutrition", icon: "🥗" },
    { id: "sport",     label: "Sport",     icon: "💪" },
    { id: "lifestyle", label: "Lifestyle", icon: "🌿" },
    { id: "suivi",     label: "Suivi",     icon: "📋" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#f0f0f0" }}>

      {/* Header */}
      <header style={{ background: "#0f0f0f", borderBottom: "1px solid #1a1a1a", padding: "1rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "22px", color: "#F5C842", letterSpacing: "3px" }}>SHINEUP</div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {/* FIX: affiche le compte à rebours correctement */}
          <span style={{ background: "#0d1a0d", color: "#5faa5f", border: "1px solid #5faa5f33", borderRadius: "99px", padding: "4px 12px", fontSize: "12px" }}>
            ✅ Actif — {daysLeft} jour{daysLeft !== 1 ? "s" : ""} restant{daysLeft !== 1 ? "s" : ""}
          </span>
          <button onClick={() => { supabase.auth.signOut(); window.location.href = "/login"; }}
            style={{ background: "none", border: "1px solid #2a2a2a", color: "#555", padding: "6px 12px", borderRadius: "8px", cursor: "pointer", fontSize: "12px" }}>
            Déconnexion
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div style={{ background: "#0f0f0f", borderBottom: "1px solid #1a1a1a", padding: "0 1.5rem", display: "flex", gap: "4px", overflowX: "auto" }}>
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            background: "none", border: "none",
            borderBottom: `2px solid ${tab === t.id ? "#F5C842" : "transparent"}`,
            color: tab === t.id ? "#F5C842" : "#666",
            padding: "14px 16px", cursor: "pointer", fontSize: "13px",
            fontWeight: tab === t.id ? 500 : 400, whiteSpace: "nowrap",
          }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: "700px", margin: "0 auto", padding: "2rem 1.5rem" }}>

        {/* ── RÉSUMÉ ──────────────────────────────────────────────────────── */}
        {tab === "programme" && (
          <div>
            {!!prog?.coach_message && (
              <div style={{ background: "#1a1600", border: "1px solid #3a2e00", borderRadius: "14px", padding: "18px", marginBottom: "1.5rem" }}>
                <div style={{ color: "#888", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "8px" }}>Message de ton coach</div>
                <p style={{ color: "#c9a820", lineHeight: 1.7, margin: 0, fontSize: "14px" }}>{String(prog.coach_message)}</p>
              </div>
            )}

            {!!prog?.summary && (
              <div style={{ background: "#141414", border: "1px solid #1e1e1e", borderRadius: "14px", padding: "18px", marginBottom: "1.5rem" }}>
                <div style={{ color: "#888", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "8px" }}>Stratégie globale</div>
                <p style={{ color: "#ccc", lineHeight: 1.7, margin: 0, fontSize: "14px" }}>{String(prog.summary)}</p>
              </div>
            )}

            {prog?.nutrition && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px", marginBottom: "1.5rem" }}>
                {[
                  { label: "Calories / jour", value: prog.nutrition.daily_calories + " kcal", color: "#F5C842" },
                  { label: "Protéines",        value: prog.nutrition.protein_g + "g",          color: "#5faa5f" },
                  { label: "Glucides",          value: prog.nutrition.carbs_g + "g",            color: "#88aaff" },
                  { label: "Lipides",           value: prog.nutrition.fats_g + "g",             color: "#c9a820" },
                ].map((s) => (
                  <div key={s.label} style={{ background: "#141414", border: "1px solid #1e1e1e", borderRadius: "12px", padding: "14px" }}>
                    <div style={{ color: "#555", fontSize: "11px", marginBottom: "4px" }}>{s.label}</div>
                    <div style={{ color: s.color, fontSize: "22px", fontWeight: 700 }}>{s.value}</div>
                  </div>
                ))}
              </div>
            )}

            {!!prog?.expected_results && (
              <div style={{ background: "#0d1a0d", border: "1px solid #1a3a1a", borderRadius: "14px", padding: "16px", marginBottom: "1.5rem" }}>
                <div style={{ color: "#5faa5f", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "8px" }}>🎯 Résultats attendus à 3 mois</div>
                {typeof prog.expected_results === "object" ? (
                  Object.entries(prog.expected_results as Record<string, unknown>).map(([k, v]) => (
                    <div key={k} style={{ padding: "5px 0", borderBottom: "1px solid #1a3a1a", fontSize: "13px" }}>
                      <span style={{ color: "#5faa5f", fontWeight: 500 }}>{k.replace(/_/g, " ")} : </span>
                      <span style={{ color: "#ccc" }}>{String(v)}</span>
                    </div>
                  ))
                ) : (
                  <p style={{ color: "#ccc", lineHeight: 1.7, margin: 0, fontSize: "14px" }}>{String(prog.expected_results)}</p>
                )}
              </div>
            )}

            {prog?.monthly_progression && (
              <div style={{ marginTop: "1.5rem" }}>
                <div style={{ color: "#888", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "12px" }}>Progression sur 3 mois</div>
                {prog.monthly_progression.map((m) => (
                  <div key={m.month} style={{ background: "#141414", border: "1px solid #1e1e1e", borderRadius: "12px", padding: "14px", marginBottom: "8px", display: "flex", gap: "14px" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#1a1600", border: "1px solid #F5C842", display: "flex", alignItems: "center", justifyContent: "center", color: "#F5C842", fontWeight: 700, fontSize: "14px", flexShrink: 0 }}>
                      {m.month}
                    </div>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: "14px", color: "#f0f0f0" }}>{m.focus}</div>
                      <div style={{ color: "#888", fontSize: "13px", marginTop: "2px" }}>{m.objective}</div>
                      <div style={{ color: "#5faa5f", fontSize: "12px", marginTop: "4px" }}>→ {m.expected_change}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── NUTRITION ───────────────────────────────────────────────────── */}
        {tab === "nutrition" && prog?.nutrition && (
          <div>
            <div style={{ background: "#141414", border: "1px solid #1e1e1e", borderRadius: "14px", padding: "18px", marginBottom: "1.5rem" }}>
              <div style={{ color: "#888", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "12px" }}>Exemple de journée alimentaire</div>
              <p style={{ color: "#ccc", lineHeight: 1.8, margin: 0, fontSize: "14px", whiteSpace: "pre-line" }}>{prog.nutrition.meal_plan_example}</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "1.5rem" }}>
              <div style={{ background: "#0d1a0d", border: "1px solid #1a3a1a", borderRadius: "12px", padding: "14px" }}>
                <div style={{ color: "#5faa5f", fontSize: "12px", fontWeight: 500, marginBottom: "10px" }}>✅ À favoriser</div>
                {prog.nutrition.foods_to_favor?.map((f, i) => (
                  <div key={i} style={{ color: "#ccc", fontSize: "13px", padding: "3px 0", borderBottom: "1px solid #1a3a1a" }}>• {f}</div>
                ))}
              </div>
              <div style={{ background: "#1a0d0d", border: "1px solid #3a1a1a", borderRadius: "12px", padding: "14px" }}>
                <div style={{ color: "#f87171", fontSize: "12px", fontWeight: 500, marginBottom: "10px" }}>❌ À éviter</div>
                {prog.nutrition.foods_to_avoid?.map((f, i) => (
                  <div key={i} style={{ color: "#ccc", fontSize: "13px", padding: "3px 0", borderBottom: "1px solid #3a1a1a" }}>• {f}</div>
                ))}
              </div>
            </div>

            {prog.nutrition.supplements?.length > 0 && (
              <div style={{ background: "#141414", border: "1px solid #1e1e1e", borderRadius: "12px", padding: "14px" }}>
                <div style={{ color: "#888", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "10px" }}>Compléments recommandés</div>
                {prog.nutrition.supplements.map((s, i) => (
                  <div key={i} style={{ color: "#ccc", fontSize: "13px", padding: "4px 0", borderBottom: "1px solid #1a1a1a" }}>💊 {s}</div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── SPORT ───────────────────────────────────────────────────────── */}
        {tab === "sport" && prog?.training && (
          <div>
            {prog.training.weekly_schedule?.map((day, i) => (
              <div key={i} style={{ background: "#141414", border: "1px solid #1e1e1e", borderRadius: "14px", padding: "16px", marginBottom: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "15px", color: "#F5C842" }}>{day.day}</div>
                    <div style={{ color: "#888", fontSize: "13px" }}>{day.type}</div>
                  </div>
                  <span style={{ background: "#1a1a1a", color: "#666", borderRadius: "99px", padding: "4px 12px", fontSize: "12px" }}>
                    {day.duration_min} min
                  </span>
                </div>
                {day.exercises?.length > 0 ? (
                  <div style={{ display: "grid", gap: "6px" }}>
                    {day.exercises.map((ex, j) => (
                      <div key={j} style={{ background: "#1a1a1a", borderRadius: "8px", padding: "10px 12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                          <span style={{ color: "#f0f0f0", fontSize: "13px", fontWeight: 500 }}>{ex.name}</span>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <span style={{ color: "#F5C842", fontSize: "12px" }}>{ex.sets}×{ex.reps}</span>
                            <span style={{ color: "#555", fontSize: "12px" }}>repos {ex.rest}</span>
                          </div>
                        </div>
                        {ex.notes && <div style={{ color: "#555", fontSize: "11px", marginTop: "4px" }}>ℹ️ {ex.notes}</div>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: "#444", fontSize: "13px" }}>Repos / récupération active</div>
                )}
              </div>
            ))}

            {prog.training.cardio_recommendation && (
              <div style={{ background: "#0d1a1a", border: "1px solid #1a3a3a", borderRadius: "12px", padding: "14px", marginTop: "8px" }}>
                <div style={{ color: "#5faaaa", fontSize: "12px", fontWeight: 500, marginBottom: "6px" }}>🏃 Cardio</div>
                <p style={{ color: "#ccc", fontSize: "13px", margin: 0, lineHeight: 1.6 }}>{prog.training.cardio_recommendation}</p>
              </div>
            )}

            {prog.training.rest_advice && (
              <div style={{ background: "#141414", border: "1px solid #1e1e1e", borderRadius: "12px", padding: "14px", marginTop: "8px" }}>
                <div style={{ color: "#888", fontSize: "12px", fontWeight: 500, marginBottom: "6px" }}>😴 Récupération</div>
                <p style={{ color: "#ccc", fontSize: "13px", margin: 0, lineHeight: 1.6 }}>{prog.training.rest_advice}</p>
              </div>
            )}
          </div>
        )}

        {/* ── LIFESTYLE ───────────────────────────────────────────────────── */}
        {tab === "lifestyle" && prog?.lifestyle && (
          <div>
            {prog.lifestyle.morning_routine && prog.lifestyle.morning_routine.length > 0 && (
              <div style={{ background: "#1a1600", border: "1px solid #3a2e00", borderRadius: "14px", padding: "16px", marginBottom: "10px" }}>
                <div style={{ color: "#F5C842", fontSize: "13px", fontWeight: 600, marginBottom: "12px" }}>🌅 Routine Matin SHINEUP</div>
                {prog.lifestyle.morning_routine.map((h, i) => (
                  <div key={i} style={{ color: "#ccc", fontSize: "13px", padding: "6px 0", borderBottom: "1px solid #2a2000", lineHeight: 1.6 }}>{h}</div>
                ))}
              </div>
            )}

            {prog.lifestyle.evening_routine && prog.lifestyle.evening_routine.length > 0 && (
              <div style={{ background: "#0d0d1a", border: "1px solid #1a1a3a", borderRadius: "14px", padding: "16px", marginBottom: "10px" }}>
                <div style={{ color: "#88aaff", fontSize: "13px", fontWeight: 600, marginBottom: "12px" }}>🌙 Routine Soir SHINEUP</div>
                {prog.lifestyle.evening_routine.map((h, i) => (
                  <div key={i} style={{ color: "#ccc", fontSize: "13px", padding: "6px 0", borderBottom: "1px solid #1a1a3a", lineHeight: 1.6 }}>{h}</div>
                ))}
              </div>
            )}

            <div style={{ background: "#141414", border: "1px solid #1e1e1e", borderRadius: "14px", padding: "16px", marginBottom: "10px" }}>
              <div style={{ color: "#F5C842", fontSize: "12px", fontWeight: 500, marginBottom: "8px" }}>😴 Conseils Sommeil</div>
              <p style={{ color: "#ccc", fontSize: "14px", margin: 0, lineHeight: 1.7 }}>{prog.lifestyle.sleep_tips}</p>
            </div>

            <div style={{ background: "#141414", border: "1px solid #1e1e1e", borderRadius: "14px", padding: "16px", marginBottom: "10px" }}>
              <div style={{ color: "#F5C842", fontSize: "12px", fontWeight: 500, marginBottom: "8px" }}>🧘 Gestion du Stress</div>
              <p style={{ color: "#ccc", fontSize: "14px", margin: 0, lineHeight: 1.7 }}>{prog.lifestyle.stress_management}</p>
            </div>

            {prog.lifestyle.glow_up_tips && prog.lifestyle.glow_up_tips.length > 0 && (
              <div style={{ background: "linear-gradient(135deg, #1a1200, #1a0a1a)", border: "1px solid #F5C842", borderRadius: "14px", padding: "16px", marginBottom: "10px" }}>
                <div style={{ color: "#F5C842", fontSize: "13px", fontWeight: 600, marginBottom: "12px" }}>✨ Ton Glow Up Guide</div>
                {prog.lifestyle.glow_up_tips.map((tip, i) => (
                  <div key={i} style={{ color: "#ddd", fontSize: "13px", padding: "6px 0", borderBottom: "1px solid #2a1a00", lineHeight: 1.6 }}>{tip}</div>
                ))}
              </div>
            )}

            <div style={{ background: "#0d1a0d", border: "1px solid #1a3a1a", borderRadius: "14px", padding: "16px", marginBottom: "10px" }}>
              <div style={{ color: "#5faa5f", fontSize: "12px", fontWeight: 500, marginBottom: "10px" }}>✅ Habitudes Quotidiennes</div>
              {prog.lifestyle.daily_habits?.map((h, i) => (
                <div key={i} style={{ color: "#ccc", fontSize: "13px", padding: "5px 0", borderBottom: "1px solid #1a3a1a", display: "flex", gap: "8px" }}>
                  <span style={{ color: "#5faa5f" }}>•</span> {h}
                </div>
              ))}
            </div>

            <div style={{ background: "#1a0d0d", border: "1px solid #3a1a1a", borderRadius: "14px", padding: "16px" }}>
              <div style={{ color: "#f87171", fontSize: "12px", fontWeight: 500, marginBottom: "10px" }}>❌ Choses à Éviter</div>
              {prog.lifestyle.things_to_avoid?.map((h, i) => (
                <div key={i} style={{ color: "#ccc", fontSize: "13px", padding: "5px 0", borderBottom: "1px solid #3a1a1a", display: "flex", gap: "8px" }}>
                  <span style={{ color: "#f87171" }}>•</span> {h}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SUIVI ───────────────────────────────────────────────────────── */}
        {tab === "suivi" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <div>
                <div style={{ fontSize: "16px", fontWeight: 500 }}>Suivi hebdomadaire</div>
                <div style={{ color: "#555", fontSize: "13px" }}>Semaine {(checkins[0]?.week_number || 0) + 1} en cours</div>
              </div>
              <button onClick={() => setShowCheckinForm(true)}
                style={{ background: "#F5C842", color: "#000", border: "none", padding: "10px 18px", borderRadius: "10px", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}>
                + Check-in semaine {(checkins[0]?.week_number || 0) + 1}
              </button>
            </div>

            <ProgressGallery
              checkins={checkins}
              goal={formData?.goal || ""}
              initialWeight={parseFloat(formData?.weight || "0")}
              isAdmin={false}
            />
          </div>
        )}
      </div>

      {/* ── Modal check-in ──────────────────────────────────────────────────── */}
      {showCheckinForm && (
        <CheckInForm
          userId={profile?.id || ""}
          email={profile?.email || ""}
          currentWeek={(checkins[0]?.week_number || 0) + 1}
          goal={formData?.goal || ""}
          onClose={() => setShowCheckinForm(false)}
          onSuccess={() => { setShowCheckinForm(false); load(); }}
        />
      )}
    </div>
  );
}
