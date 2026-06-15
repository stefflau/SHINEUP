"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────
type ChipGroupProps = {
  id: string;
  options: string[];
  multi?: boolean;
  value: string | string[];
  onChange: (val: string | string[]) => void;
};

// ─── Chip Group Component ─────────────────────────────────────────────────────
function ChipGroup({ options, multi, value, onChange }: ChipGroupProps) {
  const toggle = (opt: string) => {
    if (multi) {
      const arr = Array.isArray(value) ? value : [];
      const next = arr.includes(opt) ? arr.filter((x) => x !== opt) : [...arr, opt];
      onChange(next);
    } else {
      onChange(opt);
    }
  };

  const isActive = (opt: string) =>
    Array.isArray(value) ? value.includes(opt) : value === opt;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => toggle(opt)}
          style={{
            padding: "8px 16px",
            borderRadius: "99px",
            border: `1px solid ${isActive(opt) ? "#F5C842" : "#2a2a2a"}`,
            background: isActive(opt) ? "#F5C842" : "#1e1e1e",
            color: isActive(opt) ? "#000" : "#888",
            fontSize: "13px",
            cursor: "pointer",
            fontWeight: isActive(opt) ? 500 : 400,
            transition: "all 0.15s",
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

// ─── Slider Component ─────────────────────────────────────────────────────────
function Slider({
  label, min, max, step = 1, value, unit = "", onChange,
}: {
  label: string; min: number; max: number; step?: number;
  value: number; unit?: string; onChange: (v: number) => void;
}) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <label style={{ display: "block", fontSize: "13px", color: "#888", marginBottom: "8px" }}>
        {label}
      </label>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          style={{ flex: 1, accentColor: "#F5C842" }}
        />
        <span style={{ fontSize: "15px", fontWeight: 500, color: "#F5C842", minWidth: "40px", textAlign: "right" }}>
          {value}{unit}
        </span>
      </div>
    </div>
  );
}

// ─── Field Component ──────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <label style={{ display: "block", fontSize: "13px", color: "#888", marginBottom: "6px" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

// ─── Initial form state ───────────────────────────────────────────────────────
const INIT = {
  // Step 0 — Base
  name: "", age: "", gender: "", city: "",
  // Step 1 — Corps
  weight: "", height: "", morphology: "", target_weight: "",
  // Step 2 — Objectif
  goal: "", deadline: "",
  // Step 3 — Mode de vie
  stress: 5, sleep: 7, energy: 5, hydration: 1.5, lifestyle: "",
  // Step 4 — Alimentation
  diet: "", meals_per_day: "", allergies: "", hated_foods: "", food_budget: "",
  // Step 5 — Activité physique
  fitness_level: "", sports: [] as string[], equipment: "",
  // Step 6 — Santé
  health_issues: [] as string[], injuries: "", menstrual_cycle: "", medications: "",
  // Step 7 — Préférences
  training_days: [] as string[], session_duration: "", training_time: "",
  motivation: "", tried_before: "",
};

// ─── Main Form ────────────────────────────────────────────────────────────────
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

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 14px", borderRadius: "10px",
    background: "#1e1e1e", border: "1px solid #2a2a2a",
    color: "#f0f0f0", fontSize: "14px", outline: "none",
    fontFamily: "inherit",
  };

  const selectStyle = { ...inputStyle };
  const textareaStyle = { ...inputStyle, resize: "vertical" as const };

  // ─── Validation per step ────────────────────────────────────────────────────
  const validate = (): boolean => {
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
    setError("");
    setStep((s) => s + 1);
    window.scrollTo(0, 0);
  };

  const prev = () => { setError(""); setStep((s) => s - 1); window.scrollTo(0, 0); };

  // ─── Submit ─────────────────────────────────────────────────────────────────
  const submit = async () => {
    setSubmitting(true);
    setError("");

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) { setError("Tu dois être connecté"); setSubmitting(false); return; }

    const { error: dbErr } = await supabase.from("form_data").upsert([
      { ...data, email: user.email, user_id: user.id, completed_at: new Date().toISOString() },
    ]);

    if (dbErr) { setError("Erreur lors de l'enregistrement : " + dbErr.message); setSubmitting(false); return; }

    window.location.href = "/payment";
  };

  const TOTAL = 8;
  const progress = ((step + 1) / TOTAL) * 100;

  // ─── Step content ────────────────────────────────────────────────────────────
  const steps = [
    // ── 0 — Informations de base
    <div key={0}>
      <Field label="Prénom complet *">
        <input style={inputStyle} value={data.name} placeholder="Ex: Marie Dupont"
          onChange={(e) => set("name", e.target.value)} />
      </Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <Field label="Âge *">
          <select style={selectStyle} value={data.age} onChange={(e) => set("age", e.target.value)}>
            <option value="">Âge</option>
            {Array.from({ length: 60 }, (_, i) => (
              <option key={i} value={18 + i}>{18 + i} ans</option>
            ))}
          </select>
        </Field>
        <Field label="Genre *">
          <select style={selectStyle} value={data.gender} onChange={(e) => set("gender", e.target.value)}>
            <option value="">Genre</option>
            <option>Homme</option>
            <option>Femme</option>
            <option>Autre</option>
          </select>
        </Field>
      </div>
      <Field label="Ville / Pays">
        <input style={inputStyle} value={data.city} placeholder="Ex: Antananarivo, Madagascar"
          onChange={(e) => set("city", e.target.value)} />
      </Field>
    </div>,

    // ── 1 — Corps & morphologie
    <div key={1}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <Field label="Poids actuel (kg) *">
          <select style={selectStyle} value={data.weight} onChange={(e) => set("weight", e.target.value)}>
            <option value="">Poids</option>
            {Array.from({ length: 120 }, (_, i) => (
              <option key={i} value={35 + i}>{35 + i} kg</option>
            ))}
          </select>
        </Field>
        <Field label="Taille (cm) *">
          <select style={selectStyle} value={data.height} onChange={(e) => set("height", e.target.value)}>
            <option value="">Taille</option>
            {Array.from({ length: 70 }, (_, i) => (
              <option key={i} value={140 + i}>{140 + i} cm</option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Morphologie">
        <ChipGroup id="morpho" options={["Ectomorphe (mince)", "Mésomorphe (athlétique)", "Endomorphe (corpulent)"]}
          value={data.morphology} onChange={(v) => set("morphology", v)} />
      </Field>
      <Field label="Poids cible (kg) — facultatif">
        <input style={inputStyle} type="number" value={data.target_weight} placeholder="Ex: 65"
          onChange={(e) => set("target_weight", e.target.value)} />
      </Field>
    </div>,

    // ── 2 — Objectif
    <div key={2}>
      <div style={{ background: "#1a1600", border: "1px solid #3a2e00", borderRadius: "10px", padding: "12px 14px", fontSize: "13px", color: "#c9a820", marginBottom: "1rem" }}>
        Ton objectif définit entièrement ton programme. Sois honnête avec toi-même !
      </div>
      <Field label="Objectif principal *">
        <ChipGroup id="goal" options={["Perte de poids", "Prise de masse", "Recomposition corporelle", "Améliorer l'endurance", "Remise en forme générale", "Tonification"]}
          value={data.goal} onChange={(v) => set("goal", v)} />
      </Field>
      <Field label="Délai souhaité">
        <ChipGroup id="deadline" options={["3 mois", "6 mois", "1 an"]}
          value={data.deadline} onChange={(v) => set("deadline", v)} />
      </Field>
    </div>,

    // ── 3 — Mode de vie
    <div key={3}>
      <Slider label="Niveau de stress quotidien (1 = zen, 10 = très stressé)" min={1} max={10}
        value={data.stress} onChange={(v) => set("stress", v)} />
      <Slider label="Heures de sommeil par nuit" min={4} max={12} value={data.sleep}
        unit="h" onChange={(v) => set("sleep", v)} />
      <Slider label="Niveau d'énergie général (1 = épuisé, 10 = plein d'énergie)" min={1} max={10}
        value={data.energy} onChange={(v) => set("energy", v)} />
      <Slider label="Litres d'eau / jour" min={0} max={5} step={0.5} value={data.hydration}
        unit="L" onChange={(v) => set("hydration", v)} />
      <Field label="Rythme de vie *">
        <ChipGroup id="lifestyle" options={["Sédentaire (bureau)", "Actif léger", "Actif moyen", "Très actif (travail physique)"]}
          value={data.lifestyle} onChange={(v) => set("lifestyle", v)} />
      </Field>
    </div>,

    // ── 4 — Alimentation
    <div key={4}>
      <Field label="Régime alimentaire *">
        <ChipGroup id="diet" options={["Omnivore", "Végétarien", "Vegan", "Halal", "Sans gluten", "Sans lactose"]}
          value={data.diet} onChange={(v) => set("diet", v)} />
      </Field>
      <Field label="Nombre de repas par jour">
        <ChipGroup id="meals" options={["2 repas", "3 repas", "4 repas", "5 repas+"]}
          value={data.meals_per_day} onChange={(v) => set("meals_per_day", v)} />
      </Field>
      <Field label="Allergies / intolérances">
        <input style={inputStyle} value={data.allergies} placeholder="Ex: arachides, lait..."
          onChange={(e) => set("allergies", e.target.value)} />
      </Field>
      <Field label="Aliments que tu détestes">
        <input style={inputStyle} value={data.hated_foods} placeholder="Ex: brocoli, foie..."
          onChange={(e) => set("hated_foods", e.target.value)} />
      </Field>
      <Field label="Budget alimentaire / mois">
        <ChipGroup id="budget" options={["Serré (< 200 000 Ar)", "Moyen (200 000 - 400 000 Ar)", "Confortable (400 000 Ar+)"]}
          value={data.food_budget} onChange={(v) => set("food_budget", v)} />
      </Field>
    </div>,

    // ── 5 — Activité physique
    <div key={5}>
      <Field label="Niveau sportif actuel *">
        <ChipGroup id="fit_level" options={["Débutant (jamais pratiqué)", "Irrégulier", "Régulier (1-2x/sem)", "Avancé (3x+/sem)"]}
          value={data.fitness_level} onChange={(v) => set("fitness_level", v)} />
      </Field>
      <Field label="Sports / activités (plusieurs possibles)">
        <ChipGroup id="sports" multi options={["Musculation", "Course à pied", "Yoga", "Natation", "Cyclisme", "Danse", "Arts martiaux", "Football", "HIIT", "Pilates", "Randonnée", "Corde à sauter"]}
          value={data.sports} onChange={(v) => set("sports", v)} />
      </Field>
      <Field label="Équipement disponible">
        <ChipGroup id="equip" options={["Aucun (maison)", "Basique (haltères, tapis)", "Salle de sport", "Home gym complet"]}
          value={data.equipment} onChange={(v) => set("equipment", v)} />
      </Field>
    </div>,

    // ── 6 — Santé & antécédents
    <div key={6}>
      <div style={{ background: "#0d1a0d", border: "1px solid #1a3a1a", borderRadius: "10px", padding: "12px 14px", fontSize: "13px", color: "#5faa5f", marginBottom: "1rem" }}>
        🔒 Ces informations sont strictement confidentielles. Elles servent uniquement à adapter ton programme.
      </div>
      <Field label="Antécédents médicaux (plusieurs possibles)">
        <ChipGroup id="health" multi options={["Aucun", "Mal de dos", "Problèmes de genoux", "Problèmes cardiaques", "Hypertension", "Diabète", "Thyroïde", "Apnée du sommeil", "Déséquilibre hormonal", "Autre"]}
          value={data.health_issues} onChange={(v) => set("health_issues", v)} />
      </Field>
      <Field label="Blessures actuelles ou récentes">
        <input style={inputStyle} value={data.injuries} placeholder="Ex: entorse cheville, hernie discale..."
          onChange={(e) => set("injuries", e.target.value)} />
      </Field>
      <Field label="Cycle menstruel (femmes) — facultatif">
        <ChipGroup id="cycle" options={["Régulier", "Irrégulier", "Ménopause / post-ménopause", "N/A"]}
          value={data.menstrual_cycle} onChange={(v) => set("menstrual_cycle", v)} />
      </Field>
      <Field label="Médicaments ou compléments actuels">
        <input style={inputStyle} value={data.medications} placeholder="Ex: oméga-3, pilule, metformine..."
          onChange={(e) => set("medications", e.target.value)} />
      </Field>
    </div>,

    // ── 7 — Préférences & disponibilités
    <div key={7}>
      <Field label="Jours disponibles pour s'entraîner">
        <ChipGroup id="days" multi options={["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"]}
          value={data.training_days} onChange={(v) => set("training_days", v)} />
      </Field>
      <Field label="Durée de séance souhaitée">
        <ChipGroup id="duration" options={["30 min", "45 min", "1 heure", "1h30+"]}
          value={data.session_duration} onChange={(v) => set("session_duration", v)} />
      </Field>
      <Field label="Moment préféré pour s'entraîner">
        <ChipGroup id="timing" options={["Matin", "Midi", "Soir", "Flexible"]}
          value={data.training_time} onChange={(v) => set("training_time", v)} />
      </Field>
      <Field label="Ta motivation principale (pourquoi maintenant ?)">
        <textarea style={textareaStyle} rows={3} value={data.motivation}
          placeholder="Ex: mariage dans 6 mois, problèmes de santé, confiance en soi..."
          onChange={(e) => set("motivation", e.target.value)} />
      </Field>
      <Field label="Ce que tu as déjà essayé sans succès">
        <textarea style={textareaStyle} rows={2} value={data.tried_before}
          placeholder="Ex: régimes yo-yo, salle de sport abandonnée..."
          onChange={(e) => set("tried_before", e.target.value)} />
      </Field>
    </div>,
  ];

  const STEP_TITLES = [
    "Informations de base",
    "Ton corps & morphologie",
    "Objectif principal",
    "Mode de vie",
    "Alimentation",
    "Activité physique",
    "Santé & antécédents",
    "Préférences & disponibilités",
  ];

  return (
    <main style={{ minHeight: "100vh", background: "#0a0a0a", color: "#f0f0f0", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "2rem 1rem" }}>
      <div style={{ width: "100%", maxWidth: "520px", background: "#141414", borderRadius: "20px", padding: "2rem" }}>

        {/* Header */}
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "28px", color: "#F5C842", textAlign: "center", letterSpacing: "3px", marginBottom: "4px" }}>
          SHINEUP
        </h1>
        <p style={{ textAlign: "center", fontSize: "13px", color: "#666", marginBottom: "1.5rem" }}>
          Ton programme sur-mesure — Étape {step + 1} / {TOTAL}
        </p>

        {/* Progress bar */}
        <div style={{ background: "#2a2a2a", borderRadius: "99px", height: "4px", marginBottom: "2rem" }}>
          <div style={{ background: "#F5C842", borderRadius: "99px", height: "4px", width: `${progress}%`, transition: "width 0.4s ease" }} />
        </div>

        {/* Step title */}
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "22px", color: "#F5C842", letterSpacing: "1px", marginBottom: "1.5rem" }}>
          {STEP_TITLES[step]}
        </h2>

        {/* Error */}
        {error && (
          <div style={{ background: "#3a0a0a", border: "1px solid #7a1a1a", borderRadius: "10px", padding: "12px", fontSize: "13px", color: "#f87171", marginBottom: "1rem" }}>
            {error}
          </div>
        )}

        {/* Step content */}
        {steps[step]}

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1.5rem" }}>
          {step > 0 ? (
            <button onClick={prev} style={{ background: "none", border: "1px solid #2a2a2a", color: "#888", padding: "12px 22px", borderRadius: "10px", cursor: "pointer", fontSize: "14px" }}>
              ← Retour
            </button>
          ) : <div />}

          {/* Dots */}
          <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
            {STEPS.map((_, i) => (
              <div key={i} style={{ width: i === step ? "18px" : "6px", height: "6px", borderRadius: "99px", background: i === step ? "#F5C842" : "#2a2a2a", transition: "all 0.2s" }} />
            ))}
          </div>

          {step < TOTAL - 1 ? (
            <button onClick={next} style={{ background: "#F5C842", color: "#000", border: "none", padding: "12px 28px", borderRadius: "10px", cursor: "pointer", fontSize: "14px", fontWeight: 500 }}>
              Suivant →
            </button>
          ) : (
            <button onClick={submit} disabled={submitting} style={{ background: submitting ? "#888" : "#F5C842", color: "#000", border: "none", padding: "12px 24px", borderRadius: "10px", cursor: submitting ? "not-allowed" : "pointer", fontSize: "14px", fontWeight: 500 }}>
              {submitting ? "Envoi..." : "Soumettre ✓"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

// Dummy STEPS array for dot count (used in JSX above)
const STEPS = Array.from({ length: 8 });
