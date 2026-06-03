// src/lib/coachEngine.ts
// Version Mistral AI avec règles nutritionnelles intégrées

export type FormData = {
  name: string; age: string; gender: string; city: string;
  weight: string; height: string; morphology: string; target_weight: string;
  goal: string; deadline: string;
  stress: number; sleep: number; energy: number; hydration: number; lifestyle: string;
  diet: string; meals_per_day: string; allergies: string; hated_foods: string; food_budget: string;
  fitness_level: string; sports: string[]; equipment: string;
  health_issues: string[]; injuries: string; menstrual_cycle: string; medications: string;
  training_days: string[]; session_duration: string; training_time: string;
  motivation: string; tried_before: string;
};

export type CoachProgram = {
  summary: string;
  nutrition: {
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
  training: {
    weekly_schedule: Array<{
      day: string;
      type: string;
      duration_min: number;
      exercises: Array<{ name: string; sets: string; reps: string; rest: string; notes?: string }>;
    }>;
    cardio_recommendation: string;
    rest_advice: string;
  };
  lifestyle: {
    sleep_tips: string;
    stress_management: string;
    daily_habits: string[];
    things_to_avoid: string[];
    morning_routine: string[];
    evening_routine: string[];
    glow_up_tips: string[];
  };
  monthly_progression: Array<{
    month: number;
    focus: string;
    objective: string;
    expected_change: string;
  }>;
  expected_results: string;
  coach_message: string;
};

// ─── Calculs métaboliques ─────────────────────────────────────────────────────
function calcBMI(weightKg: number, heightCm: number): number {
  const h = heightCm / 100;
  return Math.round((weightKg / (h * h)) * 10) / 10;
}

function calcBMR(weight: number, height: number, age: number, gender: string): number {
  if (gender === "Femme" || gender === "female") {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
  return 10 * weight + 6.25 * height - 5 * age + 5;
}

function activityFactor(lifestyle: string): number {
  const map: Record<string, number> = {
    "Sédentaire (bureau)": 1.2,
    "Actif léger": 1.375,
    "Actif moyen": 1.55,
    "Très actif (travail physique)": 1.725,
  };
  return map[lifestyle] ?? 1.375;
}

// ─── Calcul des macros selon l'objectif ──────────────────────────────────────
function calcMacros(tdee: number, goal: string, weight: number) {
  let calories: number;
  let proteinRatio: number;
  let fatRatio: number;

  if (goal.toLowerCase().includes("perte") || goal.toLowerCase().includes("poids")) {
    calories = Math.round(tdee * 0.8); // déficit 20%
    proteinRatio = 2.2; // g/kg — protéines élevées pour préserver le muscle
    fatRatio = 0.25;    // 25% des calories en lipides
  } else if (goal.toLowerCase().includes("prise") || goal.toLowerCase().includes("masse")) {
    calories = Math.round(tdee * 1.1); // surplus 10%
    proteinRatio = 2.0;
    fatRatio = 0.25;
  } else if (goal.toLowerCase().includes("recomposition") || goal.toLowerCase().includes("reconstituer")) {
    calories = Math.round(tdee * 0.95); // légèrement sous maintenance
    proteinRatio = 2.4; // protéines très élevées pour recomposition
    fatRatio = 0.28;
  } else { // remise en forme, endurance, tonification
    calories = Math.round(tdee * 0.9);
    proteinRatio = 1.8;
    fatRatio = 0.27;
  }

  const protein = Math.round(weight * proteinRatio);
  const fats = Math.round((calories * fatRatio) / 9);
  const carbs = Math.round((calories - protein * 4 - fats * 9) / 4);
  const hydration = goal.toLowerCase().includes("perte") ? 2.5 : 2.0;

  return { calories, protein, fats, carbs, hydration };
}

// ─── Règles nutritionnelles selon les conditions de santé ────────────────────
function getNutritionalRules(d: FormData): {
  forbidden: string[];
  mandatory: string[];
  warnings: string[];
  supplements: string[];
} {
  const forbidden: string[] = [];
  const mandatory: string[] = [];
  const warnings: string[] = [];
  const supplements: string[] = [];

  const health = d.health_issues?.join(" ").toLowerCase() || "";
  const meds = d.medications?.toLowerCase() || "";
  const allergies = d.allergies?.toLowerCase() || "";
  const diet = d.diet?.toLowerCase() || "";

  // ── Intolérance lactose ────────────────────────────────────────────────────
  if (allergies.includes("lactose") || diet.includes("lactose")) {
    forbidden.push("Lait de vache, fromage, yaourt classique, crème fraîche, beurre");
    mandatory.push("Lait végétal (amande, coco, avoine, soja), yaourt végétal, fromage végétal");
    supplements.push("Calcium 1000mg/jour (car pas de produits laitiers) — matin avec repas");
    supplements.push("Vitamine D3 1000 UI/jour — matin");
  }

  // ── SOPK / déséquilibre hormonal ──────────────────────────────────────────
  if (health.includes("hormonal") || health.includes("sopk") || meds.includes("fémionne") || meds.includes("femionne") || health.includes("thyroïde") || health.includes("thyroide")) {
    forbidden.push("Sucre raffiné, sirop de maïs, sodas sucrés, jus industriels, pâtisseries industrielles");
    forbidden.push("Huiles végétales raffinées (tournesol, maïs), aliments ultra-transformés");
    mandatory.push("Aliments à index glycémique bas : quinoa, patate douce, légumineuses, avoine");
    mandatory.push("Légumes verts à chaque repas (brocoli, épinards, courgette, haricots verts)");
    mandatory.push("Graisses saines : avocat, huile d'olive, noix, graines de lin, poisson gras");
    mandatory.push("Protéines maigres à chaque repas pour stabiliser la glycémie");
    warnings.push("SOPK : favoriser une alimentation anti-inflammatoire et à IG bas pour réguler l'insuline");
    warnings.push("Éviter le jeûne prolongé — manger toutes les 3-4h pour stabiliser les hormones");
    supplements.push("Magnésium bisglycinate 300mg/jour — soir avant coucher (aide SOPK et sommeil)");
    supplements.push("Oméga-3 1000mg/jour — avec repas (anti-inflammatoire, aide régulation hormonale)");
    supplements.push("Inositol (Myo-inositol) 2g/jour — si possible, très efficace pour le SOPK");
    supplements.push("Vitamine B6 50mg/jour — aide l'équilibre hormonal");
  }

  // ── Problèmes cardiaques ───────────────────────────────────────────────────
  if (health.includes("cardiaque") || health.includes("cardio") || health.includes("tension") || health.includes("hypertension")) {
    forbidden.push("Sel en excès (max 5g/jour), charcuterie, plats industriels très salés");
    forbidden.push("Graisses saturées en excès : viande rouge grasse, friture, beurre en grande quantité");
    forbidden.push("Caféine en excès (max 1 café/jour), alcool");
    mandatory.push("Poissons gras 2-3x/semaine (saumon, sardines, maquereau) — Oméga-3 cardioprotecteurs");
    mandatory.push("Fruits et légumes riches en potassium : banane, épinards, patate douce, avocat");
    mandatory.push("Grains entiers : avoine, quinoa, riz complet");
    warnings.push("Problèmes cardiaques : éviter les efforts intenses d'un coup — montée progressive OBLIGATOIRE");
    warnings.push("Toujours s'échauffer 10 min avant l'entraînement et récupérer 10 min après");
    supplements.push("Oméga-3 1000mg/jour — cardioprotecteur");
    supplements.push("Magnésium 300mg/jour — régule le rythme cardiaque");
    supplements.push("Coenzyme Q10 100mg/jour — si possible, excellent pour la santé cardiaque");
  }

  // ── Diabète / résistance insuline ─────────────────────────────────────────
  if (health.includes("diabète") || health.includes("diabete")) {
    forbidden.push("Sucres rapides : bonbons, sodas, jus de fruits, pain blanc, riz blanc en excès");
    mandatory.push("Féculents à IG bas uniquement : patate douce, légumineuses, quinoa, avoine");
    mandatory.push("Fibres à chaque repas pour ralentir l'absorption du glucose");
    warnings.push("Contrôler la glycémie avant et après l'entraînement");
    supplements.push("Chrome 200mcg/jour — améliore la sensibilité à l'insuline");
    supplements.push("Cannelle 1g/jour avec les repas — aide à réguler la glycémie");
  }

  // ── Régime vegan/végétarien ───────────────────────────────────────────────
  if (diet.includes("vegan") || diet.includes("végétalien")) {
    mandatory.push("Associations protéines complètes : légumineuses + céréales (riz+lentilles, pain+houmous)");
    mandatory.push("Tofu, tempeh, edamame, seitan comme sources de protéines principales");
    forbidden.push("Toute protéine animale");
    supplements.push("Vitamine B12 1000mcg/semaine — INDISPENSABLE pour les vegans");
    supplements.push("Fer non-héminique + Vitamine C pour meilleure absorption — midi");
    supplements.push("Zinc 15mg/jour — souvent déficitaire en alimentation végane");
    supplements.push("Protéine végétale en poudre (pois/chanvre) si objectif musculaire");
  } else if (diet.includes("végétarien")) {
    mandatory.push("Oeufs, produits laitiers (si tolérés) pour compléter les protéines");
    mandatory.push("Légumineuses quotidiennes : lentilles, pois chiches, haricots");
    supplements.push("Vitamine B12 500mcg/jour");
    supplements.push("Fer + Vitamine C si fatigue fréquente");
  }

  // ── Allergie gluten ────────────────────────────────────────────────────────
  if (allergies.includes("gluten")) {
    forbidden.push("Blé, orge, seigle, épeautre, kamut — pain classique, pâtes classiques, biscuits");
    mandatory.push("Alternatives sans gluten : riz, quinoa, maïs, sarrasin, millet, patate douce");
  }

  // ── Objectif perte de poids ───────────────────────────────────────────────
  if (d.goal?.toLowerCase().includes("perte") || d.goal?.toLowerCase().includes("poids")) {
    mandatory.push("Protéines maigres à chaque repas : blanc de poulet, dinde, thon, oeufs, légumineuses");
    mandatory.push("Légumes non-féculents à volonté : courgette, concombre, salade, tomate, épinards");
    mandatory.push("Féculents uniquement le matin et avant l'entraînement");
    forbidden.push("Grignotage entre les repas, sauces industrielles, vinaigrettes grasses");
    forbidden.push("Alcool — 7 kcal/g, favorise le stockage des graisses");
    warnings.push("Manger lentement et s'arrêter à 80% de satiété");
    warnings.push("Préparer les repas à l'avance (meal prep) pour éviter les écarts");
  }

  // ── Objectif prise de masse ───────────────────────────────────────────────
  if (d.goal?.toLowerCase().includes("prise") || d.goal?.toLowerCase().includes("masse")) {
    mandatory.push("Manger toutes les 3h — ne jamais être en déficit calorique");
    mandatory.push("Repas post-entraînement dans les 30min : protéines + glucides rapides");
    mandatory.push("Féculents à chaque repas : riz, pâtes, pain complet, patate douce");
    supplements.push("Créatine monohydrate 5g/jour — avant ou après entraînement (très efficace prise de masse)");
  }

  // ── Budget serré ──────────────────────────────────────────────────────────
  if (d.food_budget?.includes("erré") || d.food_budget?.includes("50")) {
    mandatory.push("Protéines économiques : oeufs, thon en boîte, légumineuses sèches, blanc de poulet");
    mandatory.push("Légumes de saison et locaux — plus économiques et nutritifs");
    warnings.push("Budget alimentaire serré : privilégier les achats en vrac et cuisiner soi-même");
  }

  return { forbidden, mandatory, warnings, supplements };
}

// ─── Règles sportives selon conditions de santé ───────────────────────────────
function getSportRules(d: FormData): string {
  const health = d.health_issues?.join(" ").toLowerCase() || "";
  const rules: string[] = [];

  if (health.includes("cardiaque") || health.includes("cardio")) {
    rules.push("CARDIO : intensité modérée uniquement (60-70% FC max), jamais d'HIIT intense, toujours échauffement 10min");
    rules.push("Surveiller la fréquence cardiaque — ne pas dépasser 140 bpm au début");
    rules.push("Commencer par 15-20 min de cardio léger et augmenter progressivement de 5 min par semaine");
  }

  if (health.includes("dos") || health.includes("hernie")) {
    rules.push("Éviter : soulevé de terre, squat avec charge lourde, exercices qui compriment la colonne");
    rules.push("Renforcer : gainage, muscles du dos profonds (bird-dog, superman), étirements lombaires");
  }

  if (health.includes("genou")) {
    rules.push("Éviter : jumping squats, fentes avec impact, course sur asphalte dur");
    rules.push("Préférer : vélo, natation, squats partiels, leg press à amplitude réduite");
  }

  if (health.includes("hormonal") || health.includes("sopk")) {
    rules.push("SOPK : éviter le surentraînement qui augmente le cortisol et aggrave les déséquilibres hormonaux");
    rules.push("Maximum 5 séances/semaine, intégrer des séances de récupération active (yoga, marche)");
    rules.push("Privilégier la musculation douce + cardio modéré plutôt que HIIT intense");
  }

  if (d.fitness_level?.includes("Débutant")) {
    rules.push("Débutant : commencer par des mouvements simples sans charge, maîtriser la technique avant d'augmenter le poids");
    rules.push("Progression : augmenter la charge de 2.5kg maximum par semaine");
  }

  return rules.length > 0 ? rules.join("\n- ") : "Pas de restriction sportive particulière";
}


// ─── Routine de vie & Glow Up intégrée ───────────────────────────────────────
function getLifestyleRoutine(d: FormData): {
  morningRoutine: string[];
  eveningRoutine: string[];
  glowUpTips: string[];
  sleepRules: string[];
  stressRules: string[];
} {
  const health = d.health_issues?.join(" ").toLowerCase() || "";
  const stress = d.stress || 5;
  const sleep = d.sleep || 7;

  // ── Routine matin universelle SHINEUP ──────────────────────────────────────
  const morningRoutine = [
    "🌅 Réveil à heure fixe tous les jours (même le weekend) — régule l'horloge biologique",
    "💧 Boire 500ml d'eau tiède avec citron dès le réveil — hydrate, active le métabolisme, détoxifie",
    "🧘 5-10 minutes d'étirements ou yoga doux au lit ou au sol — réveille le corps en douceur",
    "☀️ S'exposer à la lumière naturelle dans les 30 premières minutes — régule le cortisol et la sérotonine",
    "🚫 Ne pas regarder son téléphone pendant les 30 premières minutes — protège l'énergie mentale",
    "🥣 Petit-déjeuner riche en protéines dans l'heure suivant le réveil — stabilise la glycémie toute la journée",
    "📝 Écrire 3 intentions pour la journée — focalise l'esprit et booste la motivation",
  ];

  // ── Routine soir universelle SHINEUP ───────────────────────────────────────
  const eveningRoutine = [
    "🌙 Commencer à ralentir 2h avant le coucher — pas d'activité intense le soir",
    "📵 Éteindre les écrans (téléphone, TV) 1h avant de dormir — la lumière bleue bloque la mélatonine",
    "🛁 Douche tiède ou froide le soir — fait baisser la température corporelle et favorise l'endormissement",
    "📖 15-20 minutes de lecture ou journaling — calme le système nerveux",
    "🌿 Tisane relaxante : camomille, valériane, mélisse ou ashwagandha — aide à décrocher",
    "🧘 Exercice de respiration 4-7-8 : inspirer 4s, retenir 7s, expirer 8s (x4) — réduit l'anxiété",
    "❄️ Chambre fraîche (18-20°C idéalement) et obscurité totale pour un sommeil profond",
    "🙏 Gratitude : noter 3 choses positives de la journée — reprogramme le cerveau vers le positif",
  ];

  // ── Règles sommeil selon profil ────────────────────────────────────────────
  const sleepRules: string[] = [];
  if (sleep < 6) {
    sleepRules.push("⚠️ Tu dors moins de 6h — PRIORITÉ ABSOLUE : le manque de sommeil sabote la perte de poids, la récupération musculaire et les hormones");
    sleepRules.push("Viser 7-9h de sommeil par nuit — c'est pendant le sommeil que le corps brûle les graisses et reconstruit les muscles");
    sleepRules.push("Coucher et lever à heures fixes — même le weekend, décalage max 30 minutes");
  } else if (sleep < 7) {
    sleepRules.push("Ajouter 30-45 minutes de sommeil progressivement — ton corps a besoin de 7-8h pour optimiser la récupération");
  } else {
    sleepRules.push("Bon niveau de sommeil — maintenir cette régularité, c'est un de tes meilleurs atouts pour progresser");
  }

  if (health.includes("hormonal") || health.includes("sopk")) {
    sleepRules.push("SOPK : le sommeil régule directement les hormones — dormir avant 23h est essentiel pour l'équilibre hormonal");
    sleepRules.push("Éviter de manger dans les 2h avant le coucher — stabilise l'insuline nocturne");
  }

  // ── Gestion du stress selon niveau ────────────────────────────────────────
  const stressRules: string[] = [];
  if (stress >= 7) {
    stressRules.push("⚠️ Niveau de stress élevé — le cortisol chronique favorise le stockage abdominal et bloque la perte de poids");
    stressRules.push("Technique urgence stress : respiration carrée (4s inspir, 4s hold, 4s expir, 4s hold) — à faire dès que le stress monte");
    stressRules.push("Intégrer 10 minutes de marche après le déjeuner — réduit le cortisol de 15-20%");
    stressRules.push("Limiter la caféine à 1 café le matin — la caféine amplifie la réponse au stress");
  } else if (stress >= 5) {
    stressRules.push("Stress modéré — intégrer une pratique de relaxation 3x/semaine minimum");
    stressRules.push("Yoga, méditation ou marche en nature sont excellents pour réguler le système nerveux");
  } else {
    stressRules.push("Bon niveau de gestion du stress — maintenir les pratiques actuelles");
  }

  // ── Glow Up tips universels SHINEUP ───────────────────────────────────────
  const glowUpTips = [
    "✨ PEAU : boire 2-2.5L d'eau/jour — c'est le meilleur soin de peau qui existe, hydrate de l'intérieur",
    "✨ PEAU : manger des aliments riches en antioxydants (fruits rouges, thé vert, légumes colorés) — combat le vieillissement cellulaire",
    "✨ PEAU : limiter le sucre raffiné — il provoque de l'inflammation et de l'acné hormonale",
    "✨ CHEVEUX : protéines suffisantes + fer + zinc + biotine — les cheveux sont faits de kératine (protéine)",
    "✨ CORPS : la musculation sculpte le corps là où le cardio seul ne le fait pas — le muscle donne la forme",
    "✨ ÉNERGIE : exit le sucre rapide qui donne un pic puis un crash — miser sur les glucides complexes pour une énergie stable",
    "✨ MENTAL : l'exercice libère des endorphines et de la dopamine — c'est le meilleur antidépresseur naturel",
    "✨ POSTURE : renforcer le gainage et les muscles du dos — une bonne posture change complètement la silhouette",
    "✨ DIGESTION : mâcher lentement et manger sans écrans — améliore l'absorption des nutriments et réduit les ballonnements",
    "✨ CYCLE HORMONAL : synchroniser l'entraînement avec ton cycle — phase folliculaire pour l'intensité, phase lutéale pour la douceur",
  ];

  // Ajouts spécifiques SOPK
  if (health.includes("hormonal") || health.includes("sopk")) {
    glowUpTips.push("✨ SOPK GLOW UP : le sport régulier + alimentation IG bas peut réduire naturellement les symptômes du SOPK de 30-40%");
    glowUpTips.push("✨ SOPK PEAU : éviter les produits laitiers et le sucre — ils stimulent la production de sébum et l'acné hormonale");
    glowUpTips.push("✨ SOPK CHEVEUX : les oméga-3 + zinc + vitamine B6 aident à réduire la chute de cheveux liée aux déséquilibres hormonaux");
  }

  return { morningRoutine, eveningRoutine, glowUpTips, sleepRules, stressRules };
}

// ─── Construction du prompt ───────────────────────────────────────────────────
function buildPrompt(d: FormData): string {
  const weight = parseFloat(d.weight);
  const height = parseFloat(d.height);
  const age = parseInt(d.age);
  const bmi = calcBMI(weight, height);
  const bmr = Math.round(calcBMR(weight, height, age, d.gender));
  const tdee = Math.round(bmr * activityFactor(d.lifestyle));
  const macros = calcMacros(tdee, d.goal, weight);
  const nutritionRules = getNutritionalRules(d);
  const sportRules = getSportRules(d);
  const routine = getLifestyleRoutine(d);

  return `Tu es un coach sportif et nutritionniste expert. Génère un programme complet sur 3 mois en respectant STRICTEMENT les règles nutritionnelles et sportives ci-dessous.

## PROFIL
- Nom : ${d.name} | Âge : ${d.age} ans | Genre : ${d.gender} | Ville : ${d.city}
- Poids : ${d.weight} kg | Taille : ${d.height} cm | IMC : ${bmi}
- Morphologie : ${d.morphology || "Non précisé"} | Poids cible : ${d.target_weight ? d.target_weight + " kg" : "Non précisé"}
- Objectif : ${d.goal} | Délai : ${d.deadline || "3 mois"}
- Motivation : ${d.motivation || "Non précisé"}

## MACROS CALCULÉS (UTILISE CES VALEURS EXACTES)
- Calories : ${macros.calories} kcal/jour
- Protéines : ${macros.protein}g/jour (${Math.round(macros.protein * 4)} kcal)
- Glucides : ${macros.carbs}g/jour (${Math.round(macros.carbs * 4)} kcal)
- Lipides : ${macros.fats}g/jour (${Math.round(macros.fats * 9)} kcal)
- Hydratation : ${macros.hydration}L/jour minimum

## RÈGLES NUTRITIONNELLES OBLIGATOIRES
${nutritionRules.forbidden.length > 0 ? `
❌ ALIMENTS STRICTEMENT INTERDITS pour ce profil :
- ${nutritionRules.forbidden.join("\n- ")}` : ""}

${nutritionRules.mandatory.length > 0 ? `
✅ ALIMENTS OBLIGATOIRES à intégrer :
- ${nutritionRules.mandatory.join("\n- ")}` : ""}

${nutritionRules.warnings.length > 0 ? `
⚠️ AVERTISSEMENTS IMPORTANTS :
- ${nutritionRules.warnings.join("\n- ")}` : ""}

## COMPLÉMENTS RECOMMANDÉS (utilise exactement cette liste)
${nutritionRules.supplements.length > 0
  ? nutritionRules.supplements.map(s => `- ${s}`).join("\n")
  : "- Aucun complément spécifique nécessaire"}

## RÈGLES SPORTIVES OBLIGATOIRES
- ${sportRules}
- Jours disponibles : ${d.training_days?.join(", ")}
- Durée séance : ${d.session_duration}
- Moment : ${d.training_time}
- Équipement : ${d.equipment}
- Niveau : ${d.fitness_level}
- Sports pratiqués : ${d.sports?.join(", ")}

## MODE DE VIE
- Stress : ${d.stress}/10 | Sommeil : ${d.sleep}h | Énergie : ${d.energy}/10
- Rythme de vie : ${d.lifestyle}
- Régime : ${d.diet} | Repas/jour : ${d.meals_per_day}
- Allergies : ${d.allergies || "Aucune"} | Aliments détestés : ${d.hated_foods || "Aucun"}
- Budget : ${d.food_budget}
- Médicaments : ${d.medications || "Aucun"}

---

INSTRUCTIONS :
1. Utilise EXACTEMENT les calories et macros calculés ci-dessus
2. Respecte STRICTEMENT les aliments interdits et obligatoires
3. Le meal_plan_example doit être détaillé avec quantités en grammes pour chaque repas (petit-déjeuner, collation, déjeuner, collation, dîner)
4. Le planning sportif doit respecter les règles sportives du profil
5. Réponds UNIQUEMENT avec le JSON ci-dessous, rien d'autre

{
  "summary": "Résumé 3-4 lignes de la stratégie globale adaptée au profil",
  "nutrition": {
    "daily_calories": ${macros.calories},
    "protein_g": ${macros.protein},
    "carbs_g": ${macros.carbs},
    "fats_g": ${macros.fats},
    "hydration_L": ${macros.hydration},
    "meal_plan_example": "Petit-déjeuner (7h) : [détail avec grammes]. Collation (10h) : [détail]. Déjeuner (13h) : [détail avec grammes]. Collation (16h) : [détail]. Dîner (19h) : [détail avec grammes]",
    "foods_to_favor": ["minimum 10 aliments adaptés au profil"],
    "foods_to_avoid": ["minimum 8 aliments interdits pour ce profil"],
    "supplements": ${JSON.stringify(nutritionRules.supplements.length > 0 ? nutritionRules.supplements : ["Aucun complément spécifique"])}
  },
  "training": {
    "weekly_schedule": [
      {
        "day": "Jour selon disponibilités",
        "type": "Type de séance",
        "duration_min": 30,
        "exercises": [
          { "name": "Nom", "sets": "3", "reps": "12", "rest": "60s", "notes": "conseil technique" }
        ]
      }
    ],
    "cardio_recommendation": "Cardio adapté aux conditions de santé",
    "rest_advice": "Conseils récupération personnalisés"
  },
  "lifestyle": {
    "sleep_tips": "${routine.sleepRules.join(' | ')}",
    "stress_management": "${routine.stressRules.join(' | ')}",
    "daily_habits": ["minimum 6 habitudes quotidiennes adaptées au profil"],
    "things_to_avoid": ["minimum 5 choses à éviter pour ce profil"],
    "morning_routine": ${JSON.stringify(routine.morningRoutine)},
    "evening_routine": ${JSON.stringify(routine.eveningRoutine)},
    "glow_up_tips": ${JSON.stringify(routine.glowUpTips)}
  },
  "monthly_progression": [
    { "month": 1, "focus": "focus mois 1", "objective": "objectif précis mois 1", "expected_change": "changement physique attendu" },
    { "month": 2, "focus": "focus mois 2", "objective": "objectif précis mois 2", "expected_change": "changement physique attendu" },
    { "month": 3, "focus": "focus mois 3", "objective": "objectif précis mois 3", "expected_change": "changement physique attendu" }
  ],
  "expected_results": "Résultats réalistes et précis à 3 mois (poids, mesures, énergie, forme)",
  "coach_message": "Message personnel motivant qui mentionne le prénom et l'objectif spécifique"
}`;
}

// ─── Fonction principale ──────────────────────────────────────────────────────
export async function generateCoachProgram(formData: FormData): Promise<CoachProgram> {
  const prompt = buildPrompt(formData);

  const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.MISTRAL_API_KEY}`,
    },
    body: JSON.stringify({
      model: "mistral-small-latest",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 8000,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Mistral API error: ${response.status} — ${errText}`);
  }

  const result = await response.json();
  const rawText = result.choices?.[0]?.message?.content || "";

  const clean = rawText
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  try {
    return JSON.parse(clean) as CoachProgram;
  } catch {
    const jsonMatch = clean.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]) as CoachProgram;
    throw new Error("Impossible de parser la réponse Mistral : " + clean.slice(0, 300));
  }
}
