"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

// ── Types ──────────────────────────────────────────────────────────────────────
type ChipGroupProps = {
  options: string[];
  multi?: boolean;
  value: string | string[];
  onChange: (val: string | string[]) => void;
};

// ── Design tokens ──────────────────────────────────────────────────────────────
const S = {
  input: {
    width: "100%", padding: "11px 14px", borderRadius: "8px",
    background: "#13141A", border: "1px solid rgba(255,255,255,0.07)",
    color: "#F2F0EB", fontSize: "14px", outline: "none", fontFamily: "inherit",
  } as React.CSSProperties,
  select: {
    width: "100%", padding: "11px 14px", borderRadius: "8px",
    background: "#13141A", border: "1px solid rgba(255,255,255,0.07)",
    color: "#F2F0EB", fontSize: "14px", outline: "none", fontFamily: "inherit",
    cursor: "pointer",
  } as React.CSSProperties,
  textarea: {
    width: "100%", padding: "11px 14px", borderRadius: "8px",
    background: "#13141A", border: "1px solid rgba(255,255,255,0.07)",
    color: "#F2F0EB", fontSize: "14px", outline: "none", fontFamily: "inherit",
    resize: "vertical" as const, minHeight: "80px",
  } as React.CSSProperties,
};

// ── ChipGroup ──────────────────────────────────────────────────────────────────
function ChipGroup({ options, multi, value, onChange }: ChipGroupProps) {
  const toggle = (opt: string) => {
    if (multi) {
      const arr = Array.isArray(value) ? value : [];
      onChange(arr.includes(opt) ? arr.filter((x) => x !== opt) : [...arr, opt]);
    } else {
      onChange(opt);
    }
  };
  const active = (opt: string) => Array.isArray(value) ? value.includes(opt) : value === opt;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
      {options.map((opt) => (
        <button key={opt} type="button" onClick={() => toggle(opt)} style={{
          padding: "8px 16px", borderRadius: "99px", fontSize: "13px",
          border: `1px solid ${active(opt) ? "#C9A84C" : "rgba(255,255,255,0.07)"}`,
          background: active(opt) ? "rgba(201,168,76,0.12)" : "#13141A",
          color: active(opt) ? "#C9A84C" : "#8E8F96",
          fontWeight: active(opt) ? 500 : 400, cursor: "pointer",
          transition: "all 0.15s", fontFamily: "inherit",
        }}>
          {opt}
        </button>
      ))}
    </div>
  );
}

// ── Slider ─────────────────────────────────────────────────────────────────────
function Slider({ label, min, max, step = 1, value, unit = "", onChange }: {
  label: string; min: number; max: number; step?: number;
  value: number; unit?: string; onChange: (v: number) => void;
}) {
  return (
    <div style={{ marginBottom: "1.25rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
        <label style={{ fontSize: "13px", color: "#8E8F96" }}>{label}</label>
        <span style={{ fontSize: "14px", fontWeight: 500, color: "#C9A84C" }}>{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: "100%", accentColor: "#C9A84C", height: "4px", cursor: "pointer" }} />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#4A4B52", marginTop: "4px" }}>
        <span>{min}{unit}</span><span>{max}{unit}</span>
      </div>
    </div>
  );
}

// ── Field ──────────────────────────────────────────────────────────────────────
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "1.25rem" }}>
      <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#F2F0EB", marginBottom: hint ? "4px" : "8px" }}>
        {label}
      </label>
      {hint && <p style={{ fontSize: "12px", color: "#4A4B52", marginBottom: "8px" }}>{hint}</p>}
      {children}
    </div>
  );
}

// ── CardOption ─────────────────────────────────────────────────────────────────
function CardOption({ options, value, onChange }: {
  options: { icon: string; title: string; sub: string; value: string }[];
  value: string; onChange: (v: string) => void;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px" }}>
      {options.map((o) => (
        <button key={o.value} type="button" onClick={() => onChange(o.value)} style={{
          padding: "14px", borderRadius: "12px", textAlign: "left", cursor: "pointer",
          border: `1px solid ${value === o.value ? "#C9A84C" : "rgba(255,255,255,0.07)"}`,
          background: value === o.value ? "rgba(201,168,76,0.07)" : "#13141A",
          transition: "all 0.15s", fontFamily: "inherit",
        }}>
          <div style={{ fontSize: "22px", marginBottom: "8px" }}>{o.icon}</div>
          <div style={{ fontSize: "13px", fontWeight: 500, color: value === o.value ? "#C9A84C" : "#F2F0EB" }}>{o.title}</div>
          <div style={{ fontSize: "11px", color: "#4A4B52", marginTop: "2px" }}>{o.sub}</div>
        </button>
      ))}
    </div>
  );
}

// ── Initial state ──────────────────────────────────────────────────────────────
const INIT = {
  name: "", age: "", gender: "", city: "",
  weight: "", height: "", morphology: "", target_weight: "",
  goal: "", deadline: "",
  stress: 5, sleep: 7, energy: 5, hydration: 1.5, lifestyle: "",
  diet: "", meals_per_day: "", allergies: "", hated_foods: "", food_budget: "",
  fitness_level: "", sports: [] as string[], equipment: "",
  health_issues: [] as string[], injuries: "", menstrual_cycle: "", medications: "",
  training_days: [] as string[], session_duration: "", training_time: "",
  motivation: "", tried_before: "",
};

const STEP_TITLES = [
  { icon: "👤", title: "Profil de base", sub: "Informations générales" },
  { icon: "⚖️", title: "Corps & morphologie", sub: "Taille, poids, objectif physique" },
  { icon: "🎯", title: "Objectif principal", sub: "Ce que tu veux atteindre" },
  { icon: "🌙", title: "Mode de vie", sub: "Stress, sommeil, énergie" },
  { icon: "🥗", title: "Alimentation", sub: "Habitudes et préférences" },
  { icon: "💪", title: "Activité physique", sub: "Niveau et sports pratiqués" },
  { icon: "❤️", title: "Santé & antécédents", sub: "Informations médicales confidentielles" },
  { icon: "📅", title: "Disponibilités", sub: "Organisation de tes entraînements" },
];

const TOTAL = 8;

// ── Main component ─────────────────────────────────────────────────────────────
export default function FormPage() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState(INIT);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: u }) => {
      if (!u.user) window.location.href = "/login";
    });
  }, []);

  const set = (key: string, val: unknown) => setData((d) => ({ ...d, [key]: val }));

  const validate = () => {
    if (step === 0) return !!(data.name && data.age && data.gender);
    if (step === 1) return !!(data.weight && data.height);
    if (step === 2) return !!(data.goal);
    if (step === 3) return !!(data.lifestyle);
    if (step === 4) return !!(data.diet);
    if (step === 5) return !!(data.fitness_level);
    return true;
  };

  const next = () => {
    if (!validate()) { setError("⚠️ Remplis les champs obligatoires avant de continuer"); return; }
    setError(""); setStep((s) => s + 1); window.scrollTo(0, 0);
  };
  const prev = () => { setError(""); setStep((s) => s - 1); window.scrollTo(0, 0); };

  const submit = async () => {
    setSubmitting(true); setError("");
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) { setError("Tu dois être connecté"); setSubmitting(false); return; }
    const { error: dbErr } = await supabase.from("form_data").upsert([
      { ...data, email: user.email, user_id: user.id, completed_at: new Date().toISOString() },
    ]);
    if (dbErr) { setError("Erreur : " + dbErr.message); setSubmitting(false); return; }
    window.location.href = "/payment";
  };

  const progress = ((step + 1) / TOTAL) * 100;
  const current = STEP_TITLES[step];

  // ── Step content ─────────────────────────────────────────────────────────────
  const steps = [
    // 0 — Profil
    <div key={0} className="fade-up">
      <Field label="Prénom complet *">
        <input style={S.input} value={data.name} placeholder="Ex: Marie Dupont"
          onChange={(e) => set("name", e.target.value)} />
      </Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <Field label="Âge *">
          <select style={S.select} value={data.age} onChange={(e) => set("age", e.target.value)}>
            <option value="">Âge</option>
            {Array.from({ length: 60 }, (_, i) => (
              <option key={i} value={18 + i}>{18 + i} ans</option>
            ))}
          </select>
        </Field>
        <Field label="Genre *">
          <select style={S.select} value={data.gender} onChange={(e) => set("gender", e.target.value)}>
            <option value="">Genre</option>
            <option value="Femme">Femme</option>
            <option value="Homme">Homme</option>
            <option value="Autre">Autre</option>
          </select>
        </Field>
      </div>
      <Field label="Ville / Pays">
        <input style={S.input} value={data.city} placeholder="Ex: Antananarivo, Madagascar"
          onChange={(e) => set("city", e.target.value)} />
      </Field>
    </div>,

    // 1 — Corps
    <div key={1} className="fade-up">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <Field label="Poids actuel (kg) *">
          <select style={S.select} value={data.weight} onChange={(e) => set("weight", e.target.value)}>
            <option value="">Poids</option>
            {Array.from({ length: 120 }, (_, i) => <option key={i} value={35 + i}>{35 + i} kg</option>)}
          </select>
        </Field>
        <Field label="Taille (cm) *">
          <select style={S.select} value={data.height} onChange={(e) => set("height", e.target.value)}>
            <option value="">Taille</option>
            {Array.from({ length: 70 }, (_, i) => <option key={i} value={140 + i}>{140 + i} cm</option>)}
          </select>
        </Field>
      </div>
      <Field label="Morphologie" hint="Ton type de corps naturel avant toute activité intensive">
        <CardOption value={data.morphology} onChange={(v) => set("morphology", v)} options={[
          { icon: "📏", title: "Ectomorphe", sub: "Mince, du mal à grossir", value: "Ectomorphe (mince)" },
          { icon: "💪", title: "Mésomorphe", sub: "Athlétique naturellement", value: "Mésomorphe (athlétique)" },
          { icon: "🔵", title: "Endomorphe", sub: "Tendance à stocker", value: "Endomorphe (corpulent)" },
        ]} />
      </Field>
      <Field label="Poids cible (kg) — facultatif">
        <input style={S.input} type="number" value={data.target_weight} placeholder="Ex: 65"
          onChange={(e) => set("target_weight", e.target.value)} />
      </Field>
    </div>,

    // 2 — Objectif
    <div key={2} className="fade-up">
      <div style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: "10px", padding: "12px 14px", fontSize: "13px", color: "#C9A84C", marginBottom: "1.25rem" }}>
        ✦ Ton objectif définit entièrement ton programme. Sois honnête avec toi-même !
      </div>
      <Field label="Objectif principal *">
        <CardOption value={data.goal} onChange={(v) => set("goal", v)} options={[
          { icon: "🔥", title: "Perte de poids", sub: "Déficit calorique", value: "Perte de poids" },
          { icon: "🏋️", title: "Prise de masse", sub: "Surplus calorique", value: "Prise de masse" },
          { icon: "🔄", title: "Recomposition", sub: "Gras → Muscle", value: "Recomposition corporelle" },
          { icon: "🏃", title: "Endurance", sub: "Cardio & performance", value: "Améliorer l'endurance" },
          { icon: "🌿", title: "Remise en forme", sub: "Santé globale", value: "Remise en forme générale" },
          { icon: "✨", title: "Tonification", sub: "Galbe & fermeté", value: "Tonification" },
        ]} />
      </Field>
      <Field label="Délai souhaité">
        <ChipGroup options={["3 mois", "6 mois", "1 an"]} value={data.deadline} onChange={(v) => set("deadline", v)} />
      </Field>
    </div>,

    // 3 — Mode de vie
    <div key={3} className="fade-up">
      <Slider label="Niveau de stress quotidien" min={1} max={10} value={data.stress} onChange={(v) => set("stress", v)} />
      <Slider label="Heures de sommeil / nuit" min={4} max={12} value={data.sleep} unit="h" onChange={(v) => set("sleep", v)} />
      <Slider label="Niveau d'énergie général" min={1} max={10} value={data.energy} onChange={(v) => set("energy", v)} />
      <Slider label="Litres d'eau / jour" min={0} max={5} step={0.5} value={data.hydration} unit="L" onChange={(v) => set("hydration", v)} />
      <Field label="Rythme de vie *">
        <ChipGroup options={["Sédentaire (bureau)", "Actif léger", "Actif moyen", "Très actif (travail physique)"]}
          value={data.lifestyle} onChange={(v) => set("lifestyle", v)} />
      </Field>
    </div>,

    // 4 — Alimentation
    <div key={4} className="fade-up">
      <Field label="Régime alimentaire *">
        <ChipGroup options={["Omnivore", "Végétarien", "Vegan", "Halal", "Sans gluten", "Sans lactose"]}
          value={data.diet} onChange={(v) => set("diet", v)} />
      </Field>
      <Field label="Nombre de repas / jour">
        <ChipGroup options={["2 repas", "3 repas", "4 repas", "5 repas+"]}
          value={data.meals_per_day} onChange={(v) => set("meals_per_day", v)} />
      </Field>
      <Field label="Allergies / intolérances">
        <input style={S.input} value={data.allergies} placeholder="Ex: arachides, lait, gluten..."
          onChange={(e) => set("allergies", e.target.value)} />
      </Field>
      <Field label="Aliments que tu détestes">
        <input style={S.input} value={data.hated_foods} placeholder="Ex: brocoli, foie..."
          onChange={(e) => set("hated_foods", e.target.value)} />
      </Field>
      <Field label="Budget alimentaire / mois">
        <ChipGroup options={["Serré (< 200 000 Ar)", "Moyen (200-400k Ar)", "Confortable (400k Ar+)"]}
          value={data.food_budget} onChange={(v) => set("food_budget", v)} />
      </Field>
    </div>,

    // 5 — Sport
    <div key={5} className="fade-up">
      <Field label="Niveau sportif actuel *">
        <ChipGroup options={["Débutant (jamais pratiqué)", "Irrégulier", "Régulier (1-2x/sem)", "Avancé (3x+/sem)"]}
          value={data.fitness_level} onChange={(v) => set("fitness_level", v)} />
      </Field>
      <Field label="Sports pratiqués ou souhaités" hint="Plusieurs choix possibles">
        <ChipGroup multi options={["Musculation", "Course à pied", "Yoga", "Natation", "Cyclisme", "Danse", "Arts martiaux", "Football", "HIIT", "Pilates", "Randonnée", "Corde à sauter"]}
          value={data.sports} onChange={(v) => set("sports", v)} />
      </Field>
      <Field label="Équipement disponible">
        <ChipGroup options={["Aucun (maison)", "Basique (haltères, tapis)", "Salle de sport", "Home gym complet"]}
          value={data.equipment} onChange={(v) => set("equipment", v)} />
      </Field>
    </div>,

    // 6 — Santé
    <div key={6} className="fade-up">
      <div style={{ background: "rgba(159,232,112,0.06)", border: "1px solid rgba(159,232,112,0.15)", borderRadius: "10px", padding: "12px 14px", fontSize: "13px", color: "#9FE870", marginBottom: "1.25rem" }}>
        🔒 Ces informations sont strictement confidentielles. Elles servent uniquement à adapter ton programme.
      </div>
      <Field label="Antécédents médicaux" hint="Plusieurs choix possibles">
        <ChipGroup multi options={["Aucun", "Mal de dos", "Problèmes de genoux", "Problèmes cardiaques", "Hypertension", "Diabète", "Thyroïde", "Apnée du sommeil", "Déséquilibre hormonal", "Autre"]}
          value={data.health_issues} onChange={(v) => set("health_issues", v)} />
      </Field>
      <Field label="Blessures actuelles ou récentes">
        <input style={S.input} value={data.injuries} placeholder="Ex: entorse cheville, hernie discale..."
          onChange={(e) => set("injuries", e.target.value)} />
      </Field>
      {(data.gender === "Femme" || data.gender === "Autre") && (
        <Field label="Cycle menstruel — facultatif">
          <ChipGroup options={["Régulier", "Irrégulier", "Ménopause / post-ménopause", "N/A"]}
            value={data.menstrual_cycle} onChange={(v) => set("menstrual_cycle", v)} />
        </Field>
      )}
      <Field label="Médicaments ou compléments actuels">
        <input style={S.input} value={data.medications} placeholder="Ex: oméga-3, pilule, metformine..."
          onChange={(e) => set("medications", e.target.value)} />
      </Field>
    </div>,

    // 7 — Disponibilités
    <div key={7} className="fade-up">
      <Field label="Jours disponibles pour t'entraîner">
        <ChipGroup multi options={["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"]}
          value={data.training_days} onChange={(v) => set("training_days", v)} />
      </Field>
      <Field label="Durée de séance souhaitée">
        <ChipGroup options={["30 min", "45 min", "1 heure", "1h30+"]}
          value={data.session_duration} onChange={(v) => set("session_duration", v)} />
      </Field>
      <Field label="Moment préféré pour s'entraîner">
        <ChipGroup options={["Matin", "Midi", "Soir", "Flexible"]}
          value={data.training_time} onChange={(v) => set("training_time", v)} />
      </Field>
      <Field label="Ta motivation principale — pourquoi maintenant ?">
        <textarea style={S.textarea} rows={3} value={data.motivation}
          placeholder="Ex: mariage dans 6 mois, confiance en soi, problèmes de santé..."
          onChange={(e) => set("motivation", e.target.value)} />
      </Field>
      <Field label="Ce que tu as déjà essayé sans succès">
        <textarea style={S.textarea} rows={2} value={data.tried_before}
          placeholder="Ex: régimes yo-yo, salle abandonnée..."
          onChange={(e) => set("tried_before", e.target.value)} />
      </Field>
    </div>,
  ];

  return (
    <main style={{ minHeight: "100vh", background: "#0A0B0D", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", padding: "2rem 1rem" }}>

      {/* Logo */}
      <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
        <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "22px", fontWeight: 700, color: "#F2F0EB" }}>
          Dé<span style={{ color: "#C9A84C" }}>voile</span>
        </div>
        <div style={{ fontSize: "12px", color: "#4A4B52", marginTop: "2px" }}>
          Étape {step + 1} / {TOTAL}
        </div>
      </div>

      <div style={{ width: "100%", maxWidth: "540px" }}>

        {/* Progress bar */}
        <div style={{ background: "#1A1C24", borderRadius: "99px", height: "3px", marginBottom: "2rem", overflow: "hidden" }}>
          <div style={{
            background: "linear-gradient(90deg, #C9A84C, #9FE870)",
            borderRadius: "99px", height: "3px",
            width: `${progress}%`, transition: "width 0.5s cubic-bezier(.4,0,.2,1)",
          }} />
        </div>

        {/* Card */}
        <div style={{ background: "#13141A", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "2rem" }}>

          {/* Step header */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1.75rem", paddingBottom: "1.25rem", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "#1A1C24", border: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>
              {current.icon}
            </div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: 500, color: "#F2F0EB" }}>{current.title}</div>
              <div style={{ fontSize: "12px", color: "#4A4B52" }}>{current.sub}</div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: "rgba(240,110,110,0.08)", border: "1px solid rgba(240,110,110,0.25)", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "#F06E6E", marginBottom: "1.25rem" }}>
              {error}
            </div>
          )}

          {/* Step content */}
          {steps[step]}

          {/* Navigation */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1.75rem", paddingTop: "1.25rem", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            {step > 0 ? (
              <button onClick={prev} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#8E8F96", padding: "10px 22px", borderRadius: "99px", cursor: "pointer", fontSize: "14px", fontFamily: "inherit" }}>
                ← Retour
              </button>
            ) : <div />}

            {/* Dots */}
            <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
              {Array.from({ length: TOTAL }).map((_, i) => (
                <div key={i} style={{ width: i === step ? "18px" : "6px", height: "6px", borderRadius: "99px", background: i === step ? "#C9A84C" : "#1A1C24", transition: "all 0.2s" }} />
              ))}
            </div>

            {step < TOTAL - 1 ? (
              <button onClick={next} style={{ background: "#C9A84C", color: "#0A0B0D", border: "none", padding: "10px 26px", borderRadius: "99px", cursor: "pointer", fontSize: "14px", fontWeight: 600, fontFamily: "inherit", transition: "all 0.15s" }}>
                Continuer →
              </button>
            ) : (
              <button onClick={submit} disabled={submitting} style={{ background: submitting ? "#4A4B52" : "#C9A84C", color: "#0A0B0D", border: "none", padding: "10px 26px", borderRadius: "99px", cursor: submitting ? "not-allowed" : "pointer", fontSize: "14px", fontWeight: 600, fontFamily: "inherit" }}>
                {submitting ? "Envoi..." : "Valider mon bilan ✦"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Responsive */}
      <style>{`
        @media (max-width: 600px) {
          main > div:last-child { padding: 1.25rem !important; }
        }
      `}</style>
    </main>
  );
}
