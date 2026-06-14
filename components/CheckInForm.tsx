"use client";

import { useState } from "react";
import { supabase } from "@/app/lib/supabase";

type CheckInFormProps = {
  userId: string;
  email: string;
  currentWeek: number;
  goal: string;
  onClose: () => void;
  onSuccess: () => void;
};

function getEncouragementMessage(
  goal: string,
  previousWeight: number | null,
  currentWeight: number | null,
  week: number
): string {
  if (!previousWeight || !currentWeight) {
    return week === 1
      ? "💪 Premier check-in — tu as fait le premier pas, c'est le plus important !"
      : "📊 Continue comme ça, chaque semaine compte !";
  }
  const diff = currentWeight - previousWeight;
  const isLoss = goal.toLowerCase().includes("perte") || goal.toLowerCase().includes("poids");
  const isGain = goal.toLowerCase().includes("prise") || goal.toLowerCase().includes("masse");
  if (isLoss) {
    if (diff < -0.5) return `🎉 Incroyable ! Tu as perdu ${Math.abs(diff).toFixed(1)}kg cette semaine !`;
    if (diff <= 0) return `✨ ${Math.abs(diff).toFixed(1)}kg de moins — continue !`;
    if (diff <= 0.5) return `💙 Légère variation — c'est normal, reste constante !`;
    return `🌱 La balance a monté un peu — pas de panique, c'est souvent de la rétention d'eau !`;
  }
  if (isGain) {
    if (diff > 0.3) return `💪 Excellent ! +${diff.toFixed(1)}kg — les muscles se construisent !`;
    if (diff >= 0) return `✨ Progression stable — continue !`;
    return `💙 Légère baisse — vérifie ton apport calorique.`;
  }
  if (diff < -0.3) return `🎉 ${Math.abs(diff).toFixed(1)}kg en moins, ton corps se recompose !`;
  if (diff > 0.3) return `💪 +${diff.toFixed(1)}kg — fais confiance au processus !`;
  return `✨ Poids stable — souvent signe que tu perds de la graisse et gagnes du muscle !`;
}

export default function CheckInForm({ userId, email, currentWeek, goal, onClose, onSuccess }: CheckInFormProps) {
  const [weight, setWeight] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [energyLevel, setEnergyLevel] = useState(5);
  const [sleepQuality, setSleepQuality] = useState(5);
  const [stressLevel, setStressLevel] = useState(5);
  const [trainingDone, setTrainingDone] = useState(0);
  const [nutritionScore, setNutritionScore] = useState(5);
  const [waterIntake, setWaterIntake] = useState(1.5);
  const [wins, setWins] = useState("");
  const [struggles, setStruggles] = useState("");
  const [questions, setQuestions] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [encouragement, setEncouragement] = useState("");
  const [submitError, setSubmitError] = useState("");

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "#1e1e1e", border: "1px solid #2a2a2a",
    color: "#f0f0f0", borderRadius: "8px", padding: "10px 12px",
    fontSize: "13px", outline: "none", fontFamily: "inherit", boxSizing: "border-box",
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("Photo trop grande (max 5MB)"); return; }
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleWeightChange = async (val: string) => {
    setWeight(val);
    if (!val || isNaN(parseFloat(val))) return;

    // FIX: maybeSingle() au lieu de single() pour éviter le throw si aucun résultat
    const { data: lastCheckin } = await supabase
      .from("weekly_checkins")
      .select("weight_current")
      .eq("user_id", userId)
      .order("week_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    const msg = getEncouragementMessage(
      goal,
      lastCheckin?.weight_current ?? null,
      parseFloat(val),
      currentWeek
    );
    setEncouragement(msg);
  };

  const submit = async () => {
    setSubmitting(true);
    setSubmitError("");
    let photoUrl: string | null = null;

    // Upload photo si présente — erreur non bloquante
    if (photo) {
      const ext = photo.name.split(".").pop() || "jpg";
      const fileName = `${userId}/week-${currentWeek}-${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("progress-photos")
        .upload(fileName, photo, { contentType: photo.type, upsert: true });

      if (uploadErr) {
        // On log mais on ne bloque pas le check-in
        console.warn("Upload photo échoué:", uploadErr.message);
      } else {
        const { data: urlData } = supabase.storage
          .from("progress-photos")
          .getPublicUrl(fileName);
        photoUrl = urlData.publicUrl;
      }
    }

    // Insert check-in
    const { error: insertErr } = await supabase.from("weekly_checkins").insert([{
      user_id: userId,
      email,
      week_number: currentWeek,
      weight_current: weight ? parseFloat(weight) : null,
      photo_url: photoUrl,
      energy_level: energyLevel,
      sleep_quality: sleepQuality,
      stress_level: stressLevel,
      training_done: trainingDone,
      nutrition_score: nutritionScore,
      water_intake: waterIntake,
      wins: wins.trim() || null,
      struggles: struggles.trim() || null,
      questions: questions.trim() || null,
      check_date: new Date().toISOString().split("T")[0],
      coach_replied: false,
    }]);

    setSubmitting(false);

    if (insertErr) {
      setSubmitError("Erreur lors de l'envoi : " + insertErr.message);
      return;
    }

    onSuccess();
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "#000000cc", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "1rem" }}>
      <div style={{ background: "#141414", borderRadius: "20px", border: "1px solid #2a2a2a", width: "100%", maxWidth: "500px", maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>

        <div style={{ padding: "1.2rem 1.5rem", borderBottom: "1px solid #1e1e1e", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: "15px" }}>Check-in — Semaine {currentWeek}</div>
            <div style={{ color: "#666", fontSize: "12px", marginTop: "2px" }}>Ton bilan de la semaine</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: "22px" }}>×</button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>

          {/* Poids */}
          <div style={{ marginBottom: "1.2rem" }}>
            <label style={{ display: "block", color: "#888", fontSize: "12px", marginBottom: "6px" }}>
              ⚖️ Mon poids cette semaine (kg)
            </label>
            <input
              style={{ ...inputStyle, fontSize: "18px", fontWeight: 600, textAlign: "center" }}
              type="number"
              step="0.1"
              placeholder="Ex: 62.5"
              value={weight}
              onChange={(e) => handleWeightChange(e.target.value)}
            />
            {encouragement && (
              <div style={{ background: "#1a1600", border: "1px solid #3a2e00", borderRadius: "10px", padding: "10px 14px", marginTop: "8px", fontSize: "13px", color: "#c9a820", lineHeight: 1.5 }}>
                {encouragement}
              </div>
            )}
          </div>

          {/* Photo */}
          <div style={{ marginBottom: "1.2rem" }}>
            <label style={{ display: "block", color: "#888", fontSize: "12px", marginBottom: "6px" }}>
              📸 Photo de progression (optionnel)
            </label>
            {photoPreview ? (
              <div style={{ position: "relative" }}>
                <img src={photoPreview} alt="Preview" style={{ width: "100%", borderRadius: "10px", maxHeight: "200px", objectFit: "cover" }} />
                <button
                  onClick={() => { setPhoto(null); setPhotoPreview(null); }}
                  style={{ position: "absolute", top: "8px", right: "8px", background: "#000000cc", border: "none", color: "#fff", borderRadius: "50%", width: "28px", height: "28px", cursor: "pointer", fontSize: "14px" }}>
                  ×
                </button>
              </div>
            ) : (
              <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px", background: "#1e1e1e", border: "2px dashed #2a2a2a", borderRadius: "10px", padding: "24px", cursor: "pointer", color: "#555" }}>
                <span style={{ fontSize: "32px" }}>📷</span>
                <span style={{ fontSize: "13px" }}>Clique pour ajouter une photo</span>
                <span style={{ fontSize: "11px" }}>JPG, PNG — max 5MB</span>
                <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: "none" }} />
              </label>
            )}
          </div>

          {/* Sliders */}
          {[
            { label: "⚡ Niveau d'énergie", value: energyLevel, set: setEnergyLevel, min: 1, max: 10, unit: "/10" },
            { label: "😴 Qualité du sommeil", value: sleepQuality, set: setSleepQuality, min: 1, max: 10, unit: "/10" },
            { label: "🧘 Niveau de stress", value: stressLevel, set: setStressLevel, min: 1, max: 10, unit: "/10" },
            { label: "💪 Séances réalisées", value: trainingDone, set: setTrainingDone, min: 0, max: 7, unit: " séances" },
            { label: "🥗 Respect alimentation", value: nutritionScore, set: setNutritionScore, min: 1, max: 10, unit: "/10" },
            { label: "💧 Eau / jour", value: waterIntake, set: setWaterIntake, min: 0, max: 4, unit: "L", step: 0.5 },
          ].map(({ label, value, set, min, max, unit, step }) => (
            <div key={label} style={{ marginBottom: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <label style={{ color: "#888", fontSize: "12px" }}>{label}</label>
                <span style={{ color: "#F5C842", fontSize: "13px", fontWeight: 600 }}>{value}{unit}</span>
              </div>
              <input type="range" min={min} max={max} step={step || 1} value={value}
                onChange={(e) => set(parseFloat(e.target.value))}
                style={{ width: "100%", accentColor: "#F5C842" }} />
            </div>
          ))}

          {/* Textes libres */}
          {[
            { label: "✅ Ce qui a bien marché", value: wins, set: setWins, placeholder: "Ex: j'ai fait mes 3 séances, bien mangé le midi..." },
            { label: "⚠️ Les difficultés", value: struggles, set: setStruggles, placeholder: "Ex: j'ai craqué le weekend, j'ai mal dormi..." },
            { label: "❓ Questions pour le coach", value: questions, set: setQuestions, placeholder: "Ex: j'ai mal aux genoux, est-ce normal ?" },
          ].map(({ label, value, set, placeholder }) => (
            <div key={label} style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", color: "#888", fontSize: "12px", marginBottom: "6px" }}>{label}</label>
              <textarea
                style={{ ...inputStyle, resize: "vertical" as const }}
                rows={2}
                placeholder={placeholder}
                value={value}
                onChange={(e) => set(e.target.value)}
              />
            </div>
          ))}

          {submitError && (
            <div style={{ background: "#3a0a0a", border: "1px solid #7a1a1a", borderRadius: "10px", padding: "12px", fontSize: "13px", color: "#f87171", marginBottom: "12px" }}>
              {submitError}
            </div>
          )}
        </div>

        <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid #1e1e1e", flexShrink: 0 }}>
          <button onClick={submit} disabled={submitting} style={{
            width: "100%", background: submitting ? "#888" : "#F5C842",
            color: "#000", border: "none", padding: "13px", borderRadius: "10px",
            fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer", fontSize: "14px",
          }}>
            {submitting ? "Envoi en cours..." : "Envoyer mon check-in ✓"}
          </button>
        </div>
      </div>
    </div>
  );
}
