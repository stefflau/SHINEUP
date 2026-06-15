// src/lib/coachEngine.ts
// Version Mistral AI avec règles nutritionnelles intégrées + aliments malgaches

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

export type FoodItem = {
  name: string; portion: string; calories: number;
  protein_g: number; carbs_g: number; fat_g: number; notes: string;
};

export type FoodLibrary = {
  proteins: FoodItem[]; carbs: FoodItem[]; fats: FoodItem[];
  vegetables: FoodItem[]; fruits: FoodItem[]; snacks: FoodItem[];
};

export type CoachProgram = {
  summary: string;
  coach_case_analysis: string;
  nutrition: {
    daily_calories: number; protein_g: number; carbs_g: number;
    fats_g: number; hydration_L: number; meal_plan_example: string;
    foods_to_favor: string[]; foods_to_avoid: string[]; supplements: string[];
  };
  food_library: FoodLibrary;
  training: {
    weekly_schedule: Array<{
      day: string; type: string; duration_min: number;
      exercises: Array<{ name: string; sets: string; reps: string; rest: string; notes?: string }>;
    }>;
    cardio_recommendation: string;
    rest_advice: string;
    progression_guide: string;
  };
  lifestyle: {
    sleep_tips: string; stress_management: string;
    daily_habits: string[]; things_to_avoid: string[];
    morning_routine: string[]; evening_routine: string[]; glow_up_tips: string[];
  };
  monthly_progression: Array<{
    month: number; focus: string; objective: string;
    expected_change: string; checklist: string[];
  }>;
  expected_results: string;
  coach_message: string;
  coaching_notes: string;
};

// ─── Calculs métaboliques ─────────────────────────────────────────────────────
function calcBMI(w: number, h: number) { return Math.round((w / ((h/100) ** 2)) * 10) / 10; }

function calcBMR(w: number, h: number, age: number, gender: string) {
  return gender === "Femme" || gender === "female"
    ? 10*w + 6.25*h - 5*age - 161
    : 10*w + 6.25*h - 5*age + 5;
}

function activityFactor(lifestyle: string) {
  const map: Record<string, number> = {
    "Sédentaire (bureau)": 1.2, "Actif léger": 1.375,
    "Actif moyen": 1.55, "Très actif (travail physique)": 1.725,
  };
  return map[lifestyle] ?? 1.375;
}

function calcMacros(tdee: number, goal: string, weight: number) {
  let calories: number, proteinRatio: number, fatRatio: number;
  if (goal.toLowerCase().includes("perte") || goal.toLowerCase().includes("poids")) {
    calories = Math.round(tdee * 0.8); proteinRatio = 2.2; fatRatio = 0.25;
  } else if (goal.toLowerCase().includes("prise") || goal.toLowerCase().includes("masse")) {
    calories = Math.round(tdee * 1.1); proteinRatio = 2.0; fatRatio = 0.25;
  } else if (goal.toLowerCase().includes("recomposition") || goal.toLowerCase().includes("reconstituer")) {
    calories = Math.round(tdee * 0.95); proteinRatio = 2.4; fatRatio = 0.28;
  } else {
    calories = Math.round(tdee * 0.9); proteinRatio = 1.8; fatRatio = 0.27;
  }
  const protein = Math.round(weight * proteinRatio);
  const fats = Math.round((calories * fatRatio) / 9);
  const carbs = Math.round((calories - protein * 4 - fats * 9) / 4);
  const hydration = goal.toLowerCase().includes("perte") ? 2.5 : 2.0;
  return { calories, protein, fats, carbs, hydration };
}

// ─── Règles nutritionnelles ───────────────────────────────────────────────────
function getNutritionalRules(d: FormData) {
  const forbidden: string[] = [], mandatory: string[] = [];
  const warnings: string[] = [], supplements: string[] = [];
  const health = d.health_issues?.join(" ").toLowerCase() || "";
  const allergies = d.allergies?.toLowerCase() || "";
  const diet = d.diet?.toLowerCase() || "";

  if (allergies.includes("lactose") || diet.includes("lactose")) {
    forbidden.push("Lait de vache, fromage, yaourt classique, crème fraîche, beurre");
    mandatory.push("Lait de soja local, lait de coco, yaourt végétal");
    supplements.push("Calcium 1000mg/jour — matin avec repas");
    supplements.push("Vitamine D3 1000 UI/jour — matin");
  }
  if (health.includes("hormonal") || health.includes("sopk")) {
    forbidden.push("Sucre raffiné, sodas sucrés, jus industriels, pâtisseries industrielles");
    mandatory.push("Aliments à IG bas : patate douce, légumineuses, riz complet, avoine");
    mandatory.push("Légumes verts à chaque repas : brèdes, chou, haricots verts");
    warnings.push("SOPK : alimentation anti-inflammatoire et IG bas pour réguler l'insuline");
    warnings.push("Manger toutes les 3-4h pour stabiliser les hormones");
    supplements.push("Magnésium 300mg/jour — soir");
    supplements.push("Oméga-3 1000mg/jour — avec repas");
  }
  if (health.includes("cardiaque") || health.includes("tension") || health.includes("hypertension")) {
    forbidden.push("Sel en excès, charcuterie, friture, alcool, caféine en excès");
    mandatory.push("Poisson local 2-3x/semaine, patate douce, banane, épinards/brèdes");
    warnings.push("Cardio : intensité modérée uniquement, jamais HIIT intense, échauffement 10min obligatoire");
    supplements.push("Oméga-3 1000mg/jour — cardioprotecteur");
    supplements.push("Magnésium 300mg/jour — régule rythme cardiaque");
  }
  if (d.goal?.toLowerCase().includes("perte")) {
    mandatory.push("Protéines maigres à chaque repas : poulet, poisson, oeufs, légumineuses");
    mandatory.push("Légumes à volonté : brèdes, chou, carottes, tomates, concombre");
    forbidden.push("Grignotage, sauces industrielles, alcool");
  }
  if (d.goal?.toLowerCase().includes("prise")) {
    mandatory.push("Manger toutes les 3h, repas post-training dans les 30min");
    supplements.push("Créatine monohydrate 5g/jour");
  }
  return { forbidden, mandatory, warnings, supplements };
}

// ─── Règles sportives ─────────────────────────────────────────────────────────
function getSportRules(d: FormData) {
  const health = d.health_issues?.join(" ").toLowerCase() || "";
  const rules: string[] = [];
  if (health.includes("cardiaque") || health.includes("cardio")) {
    rules.push("Cardio modéré uniquement (60-70% FC max), max 140 bpm, échauffement 10min obligatoire");
  }
  if (health.includes("hormonal") || health.includes("sopk")) {
    rules.push("Éviter surentraînement, max 5 séances/semaine, récupération active 2x/semaine");
  }
  if (d.fitness_level?.includes("Débutant")) {
    rules.push("Charges légères, maîtriser technique avant d'augmenter, +2.5kg max/semaine");
  }
  return rules.length > 0 ? rules.join(" | ") : "Pas de restriction sportive particulière";
}

// ─── Routines lifestyle ───────────────────────────────────────────────────────
function getLifestyleRoutine(d: FormData) {
  const health = d.health_issues?.join(" ").toLowerCase() || "";
  const morningRoutine = [
    "🌅 Réveil à heure fixe tous les jours — régule l'horloge biologique",
    "💧 Boire 500ml d'eau tiède dès le réveil — hydrate et active le métabolisme",
    "🧘 5-10 min d'étirements doux — réveille le corps en douceur",
    "☀️ S'exposer à la lumière naturelle dans les 30 premières minutes",
    "🚫 Ne pas regarder son téléphone pendant 30 min — protège l'énergie mentale",
    "🥣 Petit-déjeuner riche en protéines dans l'heure — stabilise la glycémie",
    "📝 Écrire 3 intentions pour la journée — focalise et motive",
  ];
  const eveningRoutine = [
    "🌙 Ralentir 2h avant le coucher — pas d'activité intense le soir",
    "📵 Éteindre les écrans 1h avant de dormir — la lumière bleue bloque la mélatonine",
    "🛁 Douche tiède — fait baisser la température et favorise l'endormissement",
    "📖 15-20 min de lecture ou journaling — calme le système nerveux",
    "🌿 Tisane camomille ou valériane — aide à décrocher",
    "🧘 Respiration 4-7-8 : inspirer 4s, retenir 7s, expirer 8s (x4)",
    "🙏 Gratitude : noter 3 choses positives de la journée",
  ];
  const glowUpTips = [
    "✨ PEAU : boire 2-2.5L d'eau/jour — meilleur soin de peau qui existe",
    "✨ PEAU : manger papaye, goyave, mangue — riches en vitamines et antioxydants",
    "✨ PEAU : limiter sucre raffiné — provoque acné hormonale",
    "✨ CHEVEUX : protéines + brèdes mouroum (moringa) riche en fer et biotine",
    "✨ CORPS : musculation sculpte là où le cardio seul ne le fait pas",
    "✨ ÉNERGIE : glucides complexes (riz complet, patate douce) pour énergie stable",
    "✨ MENTAL : le sport libère endorphines et dopamine — antidépresseur naturel",
    "✨ DIGESTION : mâcher lentement — améliore absorption et réduit ballonnements",
  ];
  if (health.includes("hormonal") || health.includes("sopk")) {
    glowUpTips.push("✨ SOPK : sport + IG bas réduit naturellement les symptômes de 30-40%");
    glowUpTips.push("✨ SOPK PEAU : éviter sucre et produits laitiers — stimulent sébum et acné");
  }
  const sleepRules = d.sleep < 6
    ? ["⚠️ Moins de 6h de sommeil — PRIORITÉ : viser 7-9h, le corps brûle les graisses en dormant"]
    : ["Bon niveau de sommeil — maintenir cette régularité"];
  if (health.includes("hormonal") || health.includes("sopk")) {
    sleepRules.push("SOPK : dormir avant 23h est essentiel pour l'équilibre hormonal");
  }
  const stressRules = d.stress >= 7
    ? ["⚠️ Stress élevé — cortisol chronique bloque la perte de poids", "Respiration carrée 4s/4s/4s/4s dès que stress monte"]
    : ["Stress modéré — yoga, méditation ou marche 3x/semaine"];
  return { morningRoutine, eveningRoutine, glowUpTips, sleepRules, stressRules };
}

// ─── Aliments Madagascar ──────────────────────────────────────────────────────
function getMadagascarFoodLibrary(d: FormData): FoodLibrary {
  const diet = d.diet?.toLowerCase() || "";
  const allergies = d.allergies?.toLowerCase() || "";

  const proteins: FoodItem[] = [];
  if (!diet.includes("vegan") && !diet.includes("végét")) {
    proteins.push({ name: "Poulet local grillé", portion: "100g", calories: 165, protein_g: 31, carbs_g: 0, fat_g: 3.6, notes: "Très accessible à Tana, ~3000-5000 Ar/100g" });
    proteins.push({ name: "Tilapia", portion: "100g", calories: 128, protein_g: 26, carbs_g: 0, fat_g: 2.7, notes: "Poisson local économique" });
    proteins.push({ name: "Sardines en boîte (Saupiquet)", portion: "100g", calories: 208, protein_g: 25, carbs_g: 0, fat_g: 12, notes: "Disponible partout, riche en oméga-3" });
    proteins.push({ name: "Œuf entier", portion: "1 unité (60g)", calories: 86, protein_g: 6, carbs_g: 0.6, fat_g: 6, notes: "~500 Ar/unité, le moins cher" });
  }
  proteins.push({ name: "Lentilles cuites", portion: "100g", calories: 116, protein_g: 9, carbs_g: 20, fat_g: 0.4, notes: "Très économique, riche en fer" });
  proteins.push({ name: "Haricots rouges cuits", portion: "100g", calories: 127, protein_g: 8.7, carbs_g: 23, fat_g: 0.5, notes: "Base alimentaire malgache" });
  if (!allergies.includes("soja")) {
    proteins.push({ name: "Tofu local", portion: "100g", calories: 144, protein_g: 17, carbs_g: 2.8, fat_g: 9, notes: "Épiceries asiatiques à Tana" });
  }

  const carbs: FoodItem[] = [
    { name: "Riz complet cuit", portion: "100g", calories: 130, protein_g: 2.7, carbs_g: 28, fat_g: 0.3, notes: "Préférer riz complet, IG plus bas" },
    { name: "Patate douce cuite", portion: "150g", calories: 130, protein_g: 2, carbs_g: 30, fat_g: 0.1, notes: "Très accessible, riche en vitamines" },
    { name: "Banane mûre", portion: "1 moyenne (120g)", calories: 107, protein_g: 1.3, carbs_g: 27, fat_g: 0.4, notes: "Fruit le plus accessible à Tana" },
    { name: "Flocons d'avoine", portion: "50g sec", calories: 180, protein_g: 6, carbs_g: 30, fat_g: 3, notes: "Supermarché, excellent petit-déjeuner" },
    { name: "Pain complet", portion: "2 tranches (60g)", calories: 150, protein_g: 5, carbs_g: 28, fat_g: 2, notes: "Disponible en supermarché" },
    { name: "Manioc cuit", portion: "100g", calories: 160, protein_g: 1.4, carbs_g: 38, fat_g: 0.3, notes: "Avec modération, IG élevé" },
  ];

  const fats: FoodItem[] = [
  { name: "Huile d'olive", portion: "1 c.à.s (15ml)", calories: 119, protein_g: 0, carbs_g: 0, fat_g: 14, notes: "Meilleure pour santé cardiaque. Supermarché" },
  { name: "Huile de tournesol", portion: "1 c.à.s (15ml)", calories: 124, protein_g: 0, carbs_g: 0, fat_g: 14, notes: "Disponible partout, riche en vitamine E" },
  { name: "Huile de soja", portion: "1 c.à.s (15ml)", calories: 120, protein_g: 0, carbs_g: 0, fat_g: 14, notes: "Bonne source oméga-6. Très accessible" },
  { name: "Huile de colza", portion: "1 c.à.s (15ml)", calories: 120, protein_g: 0, carbs_g: 0, fat_g: 14, notes: "Meilleur ratio oméga-3/oméga-6" },
  { name: "Cacahuètes nature", portion: "30g", calories: 170, protein_g: 7, carbs_g: 5, fat_g: 14, notes: "Snack économique, ~500-1000 Ar/portion" },
  { name: "Avocat local", portion: "1/2 (75g)", calories: 120, protein_g: 1.5, carbs_g: 6, fat_g: 11, notes: "Saison mai-octobre, très bon marché" },
  { name: "Graines de sésame", portion: "20g", calories: 114, protein_g: 3.5, carbs_g: 3.5, fat_g: 9.8, notes: "Riche en calcium et zinc. Marché local" },
  { name: "Graines de courge", portion: "20g", calories: 113, protein_g: 6, carbs_g: 2, fat_g: 9, notes: "Riche en zinc et magnésium. Marché local" },
    { name: "Cacahuètes nature", portion: "30g", calories: 170, protein_g: 7, carbs_g: 5, fat_g: 14, notes: "Snack économique, ~500-1000 Ar/portion" },
    { name: "Avocat local", portion: "1/2 (75g)", calories: 120, protein_g: 1.5, carbs_g: 6, fat_g: 11, notes: "Saison mai-octobre, très bon marché" },
    { name: "Noix de coco fraîche", portion: "50g râpée", calories: 177, protein_g: 1.7, carbs_g: 7.6, fat_g: 17, notes: "Disponible toute l'année" },
 { name: "Amandes", portion: "30g", calories: 174, protein_g: 6, carbs_g: 6, fat_g: 15, notes: "Riche en vitamine E et magnésium. Supermarché" },
{ name: "Graines de chia", portion: "20g", calories: 97, protein_g: 3.3, carbs_g: 8.5, fat_g: 6.2, notes: "Riche en oméga-3 et fibres. Supermarché ou commande en ligne" },
  ];

  const vegetables: FoodItem[] = [
  { name: "Brèdes mouroum (moringa)", portion: "100g", calories: 64, protein_g: 9, carbs_g: 8, fat_g: 1.4, notes: "SUPERFOOD local — fer, calcium, vitamines A/C" },
  { name: "Brèdes anamalaho", portion: "100g", calories: 38, protein_g: 3.5, carbs_g: 6, fat_g: 0.5, notes: "Légume vert local riche en fer et acide folique" },
  { name: "Brèdes marofo (feuilles patate douce)", portion: "100g", calories: 40, protein_g: 3.2, carbs_g: 6, fat_g: 0.5, notes: "Très riches en vitamines A et C" },
  { name: "Chou vert", portion: "100g", calories: 25, protein_g: 1.3, carbs_g: 5.8, fat_g: 0.1, notes: "Très économique, riche en vitamine C et K" },
  { name: "Carottes locales", portion: "100g", calories: 41, protein_g: 0.9, carbs_g: 9.6, fat_g: 0.2, notes: "Toute l'année, riches en bêta-carotène" },
  { name: "Tomates locales", portion: "100g", calories: 18, protein_g: 0.9, carbs_g: 3.9, fat_g: 0.2, notes: "Riches en lycopène" },
  { name: "Haricots verts", portion: "100g", calories: 31, protein_g: 1.8, carbs_g: 7, fat_g: 0.1, notes: "Fibres et vitamines" },
  { name: "Anandrano (cresson d'eau)", portion: "100g", calories: 32, protein_g: 2.3, carbs_g: 4.4, fat_g: 0.4, notes: "Légume aquatique local très nutritif, riche en fer et vitamine C" },
];

  const fruits: FoodItem[] = [
    { name: "Papaye", portion: "150g", calories: 60, protein_g: 0.7, carbs_g: 15, fat_g: 0.4, notes: "Très accessible, excellente digestion" },
    { name: "Goyave", portion: "100g", calories: 68, protein_g: 2.6, carbs_g: 14, fat_g: 1, notes: "Très riche en vitamine C, économique" },
    { name: "Ananas local", portion: "150g", calories: 78, protein_g: 0.9, carbs_g: 19, fat_g: 0.2, notes: "Anti-inflammatoire, toute l'année" },
    { name: "Mangue locale", portion: "150g", calories: 99, protein_g: 1.4, carbs_g: 25, fat_g: 0.6, notes: "Saison nov-mars, riche en vitamines A et C" },
    { name: "Pastèque", portion: "200g", calories: 60, protein_g: 1.2, carbs_g: 15, fat_g: 0.2, notes: "Hydratante, peu calorique" },
  ];

  const snacks: FoodItem[] = [
    { name: "Cacahuètes + banane", portion: "30g + 1 banane", calories: 277, protein_g: 8, carbs_g: 32, fat_g: 14, notes: "Combo idéal pré/post entraînement, ~1500 Ar" },
    { name: "Œuf dur", portion: "2 œufs", calories: 172, protein_g: 12, carbs_g: 1.2, fat_g: 12, notes: "Collation portable, ~1000 Ar" },
    { name: "Papaye fraîche", portion: "150g", calories: 60, protein_g: 0.7, carbs_g: 15, fat_g: 0.4, notes: "Collation légère et digestive" },
    { name: "Pain complet + haricots écrasés", portion: "1 tranche + 50g", calories: 150, protein_g: 7, carbs_g: 25, fat_g: 2, notes: "Houmous local économique" },
  ];

  return { proteins, carbs, fats, vegetables, fruits, snacks };
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

  return `Tu es un coach sportif et nutritionniste expert. Génère un programme sur 3 mois STRICT et CONCIS et soit loique dans les choix d'aliments proposer surtout les collations.

## PROFIL
- ${d.name} | ${d.age} ans | ${d.gender} | ${d.city}
- Poids: ${d.weight}kg | Taille: ${d.height}cm | IMC: ${bmi} | Cible: ${d.target_weight || "Non précisé"}kg
- Objectif: ${d.goal} | Délai: ${d.deadline || "3 mois"}
- Niveau sport: ${d.fitness_level} | Sports: ${d.sports?.join(", ")}
- Équipement: ${d.equipment} | Jours: ${d.training_days?.join(", ")} | Durée: ${d.session_duration}

## MACROS EXACTS (ne pas modifier)
- Calories: ${macros.calories} kcal | Protéines: ${macros.protein}g | Glucides: ${macros.carbs}g | Lipides: ${macros.fats}g | Eau: ${macros.hydration}L

## SANTÉ
- Antécédents: ${d.health_issues?.join(", ") || "Aucun"}
- Médicaments: ${d.medications || "Aucun"}
- Règles sport: ${sportRules}

## ALIMENTATION
- Régime: ${d.diet} | Allergies: ${d.allergies || "Aucune"}
- Budget: ${d.food_budget}
${nutritionRules.forbidden.length > 0 ? `- INTERDITS: ${nutritionRules.forbidden.join(", ")}` : ""}
${nutritionRules.mandatory.length > 0 ? `- OBLIGATOIRES: ${nutritionRules.mandatory.join(", ")}` : ""}
${nutritionRules.supplements.length > 0 ? `- COMPLÉMENTS: ${nutritionRules.supplements.join(" | ")}` : ""}

## CONTEXTE MADAGASCAR — utiliser UNIQUEMENT ces aliments locaux mais n'oublie pas de voir la logique des collations que tu proposes
Protéines: poulet local, tilapia, sardines en boîte, oeufs, lentilles, haricots, tofu
Glucides: riz complet, patate douce, banane, avoine, pain complet, manioc
Lipides: cacahuètes, avocat local, noix de coco
Légumes: brèdes mouroum (moringa), brèdes mafana, chou, carottes, tomates, haricots verts
Fruits: papaye, goyave, ananas, mangue, pastèque

---

Réponds UNIQUEMENT avec ce JSON (sois CONCIS pour chaque champ texte) :

{
  "summary": "Résumé 2-3 lignes max",
  "coach_case_analysis": "Analyse du cas en 3-4 lignes",
  "nutrition": {
    "daily_calories": ${macros.calories},
    "protein_g": ${macros.protein},
    "carbs_g": ${macros.carbs},
    "fats_g": ${macros.fats},
    "hydration_L": ${macros.hydration},
    "meal_plan_example": "Petit-déj: [aliment+grammes]. Collation: [aliment]. Déjeuner: [aliment+grammes]. Collation: [aliment]. Dîner: [aliment+grammes]",
    "foods_to_favor": ["8 aliments max"],
    "foods_to_avoid": ["6 aliments max"],
    "supplements": ${JSON.stringify(nutritionRules.supplements.length > 0 ? nutritionRules.supplements : ["Aucun complément spécifique"])}
  },
  "training": {
    "weekly_schedule": [
      { "day": "Lundi", "type": "Type séance", "duration_min": 30, "exercises": [{ "name": "Exercice", "sets": "3", "reps": "12", "rest": "60s", "notes": "conseil" }] }
    ],
    "progression_guide": "Guide progression en 2-3 lignes",
    "cardio_recommendation": "Cardio adapté en 2 lignes",
    "rest_advice": "Conseils récup en 2 lignes"
  },
  "lifestyle": {
    "sleep_tips": "${routine.sleepRules.join(' | ')}",
    "stress_management": "${routine.stressRules.join(' | ')}",
    "daily_habits": ["6 habitudes max"],
    "things_to_avoid": ["5 choses max"],
    "morning_routine": ${JSON.stringify(routine.morningRoutine)},
    "evening_routine": ${JSON.stringify(routine.eveningRoutine)},
    "glow_up_tips": ${JSON.stringify(routine.glowUpTips)}
  },
  "monthly_progression": [
    { "month": 1, "focus": "Focus mois 1", "objective": "Objectif précis", "expected_change": "Changement attendu", "checklist": ["objectif 1", "objectif 2", "objectif 3", "objectif 4", "objectif 5"] },
    { "month": 2, "focus": "Focus mois 2", "objective": "Objectif précis", "expected_change": "Changement attendu", "checklist": ["objectif 1", "objectif 2", "objectif 3", "objectif 4", "objectif 5"] },
    { "month": 3, "focus": "Focus mois 3", "objective": "Objectif précis", "expected_change": "Changement attendu", "checklist": ["objectif 1", "objectif 2", "objectif 3", "objectif 4", "objectif 5"] }
  ],
  "expected_results": "Résultats réalistes en 2-3 lignes",
  "coach_message": "Message motivant personnalisé en 2 lignes",
  "coaching_notes": "Notes coach confidentielles en 2-3 lignes"
}`;
}

// ─── Fonction principale ──────────────────────────────────────────────────────
export async function generateCoachProgram(formData: FormData): Promise<CoachProgram> {
  const prompt = buildPrompt(formData);
  const madagascarFoodLibrary = getMadagascarFoodLibrary(formData);

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
      max_tokens: 4000,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Mistral API error: ${response.status} — ${errText}`);
  }

  const result = await response.json();
  const rawText = result.choices?.[0]?.message?.content || "";
  const clean = rawText.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();

  let program: CoachProgram;
  try {
    program = JSON.parse(clean) as CoachProgram;
  } catch {
    const jsonMatch = clean.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      program = JSON.parse(jsonMatch[0]) as CoachProgram;
    } else {
      throw new Error("Impossible de parser la réponse Mistral : " + clean.slice(0, 300));
    }
  }

  // Injecter la food_library hardcodée — pas générée par Mistral
  program.food_library = madagascarFoodLibrary;

  return program;
}