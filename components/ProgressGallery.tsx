// src/components/ProgressGallery.tsx
// Galerie de progression photos + poids — utilisable côté abonné ET admin

"use client";

type CheckIn = {
  id: string;
  week_number: number;
  weight_current: number;
  photo_url?: string;
  energy_level: number;
  training_done: number;
  check_date: string;
  coach_feedback?: string;
  coach_replied?: boolean;
};

type ProgressGalleryProps = {
  checkins: CheckIn[];
  goal: string;
  initialWeight?: number; // poids au début du programme
  isAdmin?: boolean;
};

// Message d'encouragement selon progression totale
function getProgressMessage(goal: string, initial: number, current: number, week: number): { text: string; color: string } {
  const diff = current - initial;
  const isLoss = goal.toLowerCase().includes("perte") || goal.toLowerCase().includes("poids");
  const isGain = goal.toLowerCase().includes("prise") || goal.toLowerCase().includes("masse");

  if (isLoss) {
    if (diff <= -5) return { text: `🏆 Extraordinaire ! ${Math.abs(diff).toFixed(1)}kg perdus en ${week} semaines — tu es une vraie warrior !`, color: "#F5C842" };
    if (diff <= -3) return { text: `🎉 ${Math.abs(diff).toFixed(1)}kg perdus — tu avances à grands pas vers ton objectif !`, color: "#5faa5f" };
    if (diff <= -1) return { text: `✨ ${Math.abs(diff).toFixed(1)}kg perdus depuis le début — chaque gramme compte, continue !`, color: "#5faa5f" };
    if (diff < 0) return { text: `💙 Tu progresses ! Le corps prend du temps mais tu es sur la bonne voie.`, color: "#88aaff" };
    return { text: `🌱 Reste constante — les résultats arrivent toujours pour celles qui persistent !`, color: "#c9a820" };
  }

  if (isGain) {
    if (diff >= 3) return { text: `💪 +${diff.toFixed(1)}kg de masse — les muscles poussent ! Tu cartonnes !`, color: "#F5C842" };
    if (diff >= 1) return { text: `🎉 +${diff.toFixed(1)}kg depuis le début — belle prise de masse en cours !`, color: "#5faa5f" };
    return { text: `✨ Continue à bien manger et t'entraîner — la masse musculaire se construit doucement !`, color: "#88aaff" };
  }

  if (Math.abs(diff) <= 1) return { text: `✨ Recomposition en cours — le poids stable est souvent signe que tu perds de la graisse et gagnes du muscle !`, color: "#5faa5f" };
  return { text: `💪 Ton corps évolue — fais confiance au processus !`, color: "#88aaff" };
}

export default function ProgressGallery({ checkins, goal, initialWeight, isAdmin = false }: ProgressGalleryProps) {
  const sorted = [...checkins].sort((a, b) => a.week_number - b.week_number);
  const withPhotos = sorted.filter(c => c.photo_url);
  const withWeight = sorted.filter(c => c.weight_current);

  const firstWeight = initialWeight || withWeight[0]?.weight_current;
  const lastWeight = withWeight[withWeight.length - 1]?.weight_current;
  const totalDiff = firstWeight && lastWeight ? lastWeight - firstWeight : null;

  if (sorted.length === 0) return (
    <div style={{ textAlign: "center", padding: "3rem", color: "#444", fontSize: "14px" }}>
      Aucun check-in encore. {!isAdmin && "Fais ton premier check-in pour démarrer le suivi !"}
    </div>
  );

  return (
    <div>
      {/* Résumé progression */}
      {totalDiff !== null && firstWeight && lastWeight && (
        <div style={{ background: "#1a1600", border: "1px solid #3a2e00", borderRadius: "14px", padding: "16px", marginBottom: "1.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "12px" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#555", fontSize: "11px", marginBottom: "4px" }}>Départ</div>
              <div style={{ color: "#f0f0f0", fontSize: "20px", fontWeight: 700 }}>{firstWeight}kg</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#555", fontSize: "11px", marginBottom: "4px" }}>Évolution</div>
              <div style={{ color: totalDiff < 0 ? "#5faa5f" : totalDiff > 0 ? "#F5C842" : "#888", fontSize: "20px", fontWeight: 700 }}>
                {totalDiff > 0 ? "+" : ""}{totalDiff.toFixed(1)}kg
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#555", fontSize: "11px", marginBottom: "4px" }}>Actuel</div>
              <div style={{ color: "#f0f0f0", fontSize: "20px", fontWeight: 700 }}>{lastWeight}kg</div>
            </div>
          </div>

          {(() => {
            const msg = getProgressMessage(goal, firstWeight, lastWeight, sorted.length);
            return <div style={{ color: msg.color, fontSize: "13px", lineHeight: 1.5, textAlign: "center" }}>{msg.text}</div>;
          })()}
        </div>
      )}

      {/* Graphique poids simplifié */}
      {withWeight.length > 1 && (
        <div style={{ background: "#141414", border: "1px solid #1e1e1e", borderRadius: "14px", padding: "16px", marginBottom: "1.5rem" }}>
          <div style={{ color: "#888", fontSize: "12px", marginBottom: "12px" }}>📈 Courbe de poids</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: "80px" }}>
            {withWeight.map((c, i) => {
              const weights = withWeight.map(w => w.weight_current);
              const minW = Math.min(...weights);
              const maxW = Math.max(...weights);
              const range = maxW - minW || 1;
              const isLoss = goal.toLowerCase().includes("perte");
              const height = isLoss
                ? ((maxW - c.weight_current) / range) * 60 + 20
                : ((c.weight_current - minW) / range) * 60 + 20;

              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                  <div style={{ fontSize: "9px", color: "#555" }}>{c.weight_current}kg</div>
                  <div style={{ width: "100%", background: "#F5C842", borderRadius: "4px 4px 0 0", height: `${height}px`, opacity: i === withWeight.length - 1 ? 1 : 0.6 }} />
                  <div style={{ fontSize: "9px", color: "#444" }}>S{c.week_number}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Galerie photos chronologique */}
      {withPhotos.length > 0 && (
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ color: "#888", fontSize: "12px", marginBottom: "12px" }}>
            📸 Progression visuelle ({withPhotos.length} photo{withPhotos.length > 1 ? "s" : ""})
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "10px" }}>
            {withPhotos.map((c, i) => (
              <div key={i} style={{ position: "relative" }}>
                <img
                  src={c.photo_url}
                  alt={`Semaine ${c.week_number}`}
                  style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", borderRadius: "10px", border: "1px solid #2a2a2a" }}
                />
                <div style={{ position: "absolute", bottom: "8px", left: "8px", background: "#000000cc", borderRadius: "6px", padding: "4px 8px" }}>
                  <div style={{ color: "#F5C842", fontSize: "11px", fontWeight: 600 }}>Sem. {c.week_number}</div>
                  {c.weight_current && <div style={{ color: "#888", fontSize: "10px" }}>{c.weight_current}kg</div>}
                </div>
                {i === withPhotos.length - 1 && (
                  <div style={{ position: "absolute", top: "8px", right: "8px", background: "#F5C842", borderRadius: "6px", padding: "3px 8px" }}>
                    <div style={{ color: "#000", fontSize: "10px", fontWeight: 600 }}>Actuel</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline check-ins */}
      <div>
        <div style={{ color: "#888", fontSize: "12px", marginBottom: "12px" }}>📋 Historique semaine par semaine</div>
        {sorted.map((c, i) => (
          <div key={c.id} style={{ background: "#141414", border: "1px solid #1e1e1e", borderRadius: "12px", padding: "14px", marginBottom: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <div style={{ fontWeight: 600, color: "#F5C842", fontSize: "14px" }}>Semaine {c.week_number}</div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                {c.weight_current && (
                  <span style={{ color: "#f0f0f0", fontSize: "13px", fontWeight: 500 }}>{c.weight_current}kg</span>
                )}
                {c.weight_current && withWeight[i - 1]?.weight_current && (
                  <span style={{
                    fontSize: "11px",
                    color: c.weight_current < withWeight[i - 1].weight_current ? "#5faa5f" : "#f87171",
                  }}>
                    {c.weight_current < withWeight[i - 1]?.weight_current ? "↓" : "↑"}
                    {Math.abs(c.weight_current - withWeight[i - 1].weight_current).toFixed(1)}kg
                  </span>
                )}
                <span style={{ color: "#444", fontSize: "11px" }}>{new Date(c.check_date).toLocaleDateString("fr-FR")}</span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px", marginBottom: "8px" }}>
              {([
                ["Énergie", c.energy_level + "/10"],
                ["Sommeil", "—"],
                ["Séances", c.training_done + "x"],
                ["Photo", c.photo_url ? "✅" : "—"],
              ] as [string, string][]).map(([k, v]) => (
                <div key={k} style={{ background: "#1a1a1a", borderRadius: "6px", padding: "6px", textAlign: "center" }}>
                  <div style={{ color: "#444", fontSize: "10px" }}>{k}</div>
                  <div style={{ color: "#F5C842", fontSize: "12px", fontWeight: 600 }}>{v}</div>
                </div>
              ))}
            </div>

            {isAdmin && c.coach_feedback && (
              <div style={{ background: "#0d1a0d", borderRadius: "8px", padding: "8px 10px", fontSize: "12px", color: "#5faa5f" }}>
                💬 {c.coach_feedback}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
