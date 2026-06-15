"use client";

import { useState } from "react";
export const dynamic = "force-dynamic";
const EXERCISES_DB = {
  dos: {
    label: "🔙 Dos",
    color: "#5faa5f",
    muscles: "Grand dorsal, rhomboïdes, trapèzes, érecteurs du rachis",
    items: [
      {
        name: "Tirage horizontal bande élastique",
        niveau: "Débutant",
        equipement: "Bande élastique",
        muscles_cibles: "Grand dorsal, rhomboïdes",
        series: "3x12-15",
        repos: "60s",
        comment_faire: "Assis au sol, bande autour des pieds. Tirer vers le ventre en serrant les omoplates. Dos droit.",
        adapte_pour: ["Débutant", "Maison", "Problèmes de dos légers", "Femmes"],
        contre_indique: ["Hernie discale sévère"],
        calories_estime: "3-4 kcal/min",
      },
      {
        name: "Tirage vertical bande élastique",
        niveau: "Débutant",
        equipement: "Bande élastique",
        muscles_cibles: "Grand dorsal, biceps",
        series: "3x12",
        repos: "60s",
        comment_faire: "Bande fixée en hauteur. Tirer vers la poitrine en gardant les coudes près du corps.",
        adapte_pour: ["Débutant", "Maison", "Femmes", "Remise en forme"],
        contre_indique: ["Épaule opérée récemment"],
        calories_estime: "3-5 kcal/min",
      },
      {
        name: "Superman (extension dorsale sol)",
        niveau: "Débutant",
        equipement: "Tapis",
        muscles_cibles: "Érecteurs du rachis, fessiers, ischio-jambiers",
        series: "3x15",
        repos: "45s",
        comment_faire: "Allongé ventre sol. Lever bras et jambes simultanément. Tenir 2s. Redescendre lentement.",
        adapte_pour: ["Débutant", "Mal de dos", "Maison", "Femmes enceintes (premier trimestre)"],
        contre_indique: ["Hernie discale", "Grossesse avancée"],
        calories_estime: "2-3 kcal/min",
      },
      {
        name: "Rowing haltères",
        niveau: "Intermédiaire",
        equipement: "Haltères",
        muscles_cibles: "Grand dorsal, rhomboïdes, biceps",
        series: "4x10-12",
        repos: "75s",
        comment_faire: "Un genou sur banc, dos parallèle au sol. Tirer l'haltère vers la hanche. Coude près du corps.",
        adapte_pour: ["Intermédiaire", "Prise de masse", "Maison avec haltères"],
        contre_indique: ["Hernie discale", "Douleur lombaire aiguë"],
        calories_estime: "5-7 kcal/min",
      },
      {
        name: "Good morning (sans charge)",
        niveau: "Débutant",
        equipement: "Aucun",
        muscles_cibles: "Érecteurs du rachis, ischio-jambiers, fessiers",
        series: "3x15",
        repos: "60s",
        comment_faire: "Debout, mains derrière la tête. Incliner le buste en avant (dos droit) jusqu'à 45°. Revenir.",
        adapte_pour: ["Débutant", "Renforcement lombaire", "Prévention mal de dos"],
        contre_indique: ["Hernie discale", "Sciatique active"],
        calories_estime: "3-4 kcal/min",
      },
    ]
  },
  poitrine: {
    label: "💪 Poitrine",
    color: "#F5C842",
    muscles: "Grand pectoral, petit pectoral, deltoïde antérieur, triceps",
    items: [
      {
        name: "Pompes classiques",
        niveau: "Débutant",
        equipement: "Aucun",
        muscles_cibles: "Grand pectoral, triceps, deltoïde antérieur",
        series: "3x10-15",
        repos: "60s",
        comment_faire: "Corps aligné, mains largeur épaules. Descendre jusqu'à 2cm du sol. Pousser en expirant.",
        adapte_pour: ["Tous niveaux", "Maison", "Femmes", "Débutants"],
        contre_indique: ["Poignet blessé", "Épaule opérée récemment"],
        calories_estime: "5-8 kcal/min",
      },
      {
        name: "Pompes inclinées (mains surélevées)",
        niveau: "Débutant",
        equipement: "Chaise ou mur",
        muscles_cibles: "Grand pectoral bas, triceps",
        series: "3x12-15",
        repos: "60s",
        comment_faire: "Mains sur chaise ou mur. Corps aligné. Plus facile que pompes au sol — idéal pour débuter.",
        adapte_pour: ["Grand débutant", "Femmes", "Personnes en surpoids", "Maison"],
        contre_indique: [],
        calories_estime: "3-5 kcal/min",
      },
      {
        name: "Écarté haltères allongé",
        niveau: "Intermédiaire",
        equipement: "Haltères + tapis",
        muscles_cibles: "Grand pectoral, deltoïde antérieur",
        series: "3x12",
        repos: "75s",
        comment_faire: "Allongé, haltères au-dessus poitrine. Ouvrir les bras en arc de cercle. Légère flexion coudes.",
        adapte_pour: ["Intermédiaire", "Tonification", "Maison avec haltères"],
        contre_indique: ["Problèmes cardiaques (effort modéré)", "Épaule instable"],
        calories_estime: "4-6 kcal/min",
      },
      {
        name: "Développé haltères allongé",
        niveau: "Intermédiaire",
        equipement: "Haltères + tapis",
        muscles_cibles: "Grand pectoral, triceps, deltoïde",
        series: "4x10-12",
        repos: "90s",
        comment_faire: "Allongé, haltères à hauteur poitrine. Pousser vers le haut. Contrôler la descente.",
        adapte_pour: ["Intermédiaire", "Prise de masse", "Maison avec haltères"],
        contre_indique: ["Problèmes cardiaques sévères", "Épaule opérée"],
        calories_estime: "5-7 kcal/min",
      },
    ]
  },
  epaules: {
    label: "🔝 Épaules",
    color: "#88aaff",
    muscles: "Deltoïde antérieur, médial et postérieur, trapèzes",
    items: [
      {
        name: "Élévations latérales haltères",
        niveau: "Débutant",
        equipement: "Haltères légers (2-3kg)",
        muscles_cibles: "Deltoïde médial",
        series: "3x12-15",
        repos: "60s",
        comment_faire: "Debout, bras le long du corps. Lever les bras sur les côtés jusqu'à hauteur épaules. Mouvement lent.",
        adapte_pour: ["Débutant", "Femmes", "Tonification épaules", "Maison"],
        contre_indique: ["Tendinite épaule", "Problèmes cardiaques (garder légèreté)"],
        calories_estime: "3-5 kcal/min",
      },
      {
        name: "Développé militaire haltères assis",
        niveau: "Intermédiaire",
        equipement: "Haltères",
        muscles_cibles: "Deltoïde antérieur et médial, triceps",
        series: "3x10-12",
        repos: "75s",
        comment_faire: "Assis, dos droit. Haltères à hauteur épaules. Pousser vers le haut sans bloquer les coudes.",
        adapte_pour: ["Intermédiaire", "Prise de masse", "Force épaules"],
        contre_indique: ["Hypertension (éviter blocage)", "Problèmes cervicaux", "Épaule instable"],
        calories_estime: "5-7 kcal/min",
      },
      {
        name: "Cercles de bras",
        niveau: "Débutant",
        equipement: "Aucun",
        muscles_cibles: "Deltoïdes, coiffe des rotateurs",
        series: "3x20",
        repos: "30s",
        comment_faire: "Bras tendus sur les côtés. Faire des petits cercles puis grands cercles. Avant et arrière.",
        adapte_pour: ["Débutant", "Échauffement", "Rééducation épaule douce", "Seniors"],
        contre_indique: [],
        calories_estime: "2-3 kcal/min",
      },
      {
        name: "Face pull bande élastique",
        niveau: "Débutant",
        equipement: "Bande élastique",
        muscles_cibles: "Deltoïde postérieur, rhomboïdes, coiffe rotateurs",
        series: "3x15",
        repos: "60s",
        comment_faire: "Bande à hauteur visage. Tirer vers le visage en écartant les mains. Coudes hauts.",
        adapte_pour: ["Tous niveaux", "Correction posturale", "Prévention blessures épaule"],
        contre_indique: [],
        calories_estime: "3-4 kcal/min",
      },
    ]
  },
  bras: {
    label: "💪 Bras",
    color: "#c9a820",
    muscles: "Biceps, triceps, avant-bras",
    items: [
      {
        name: "Curl biceps haltères",
        niveau: "Débutant",
        equipement: "Haltères",
        muscles_cibles: "Biceps brachial",
        series: "3x12-15",
        repos: "60s",
        comment_faire: "Debout, coudes collés au corps. Fléchir les avant-bras en montant les haltères. Contrôler la descente.",
        adapte_pour: ["Tous niveaux", "Maison", "Femmes", "Tonification bras"],
        contre_indique: ["Tendinite biceps", "Coude blessé"],
        calories_estime: "3-5 kcal/min",
      },
      {
        name: "Extension triceps bande élastique",
        niveau: "Débutant",
        equipement: "Bande élastique",
        muscles_cibles: "Triceps",
        series: "3x12-15",
        repos: "60s",
        comment_faire: "Bande fixée en haut. Coudes près de la tête. Étendre les bras vers le bas. Revenir lentement.",
        adapte_pour: ["Débutant", "Maison", "Femmes", "Affinage bras"],
        contre_indique: ["Coude opéré"],
        calories_estime: "3-4 kcal/min",
      },
      {
        name: "Dips entre deux chaises",
        niveau: "Intermédiaire",
        equipement: "2 chaises stables",
        muscles_cibles: "Triceps, pectoraux, deltoïdes",
        series: "3x10-15",
        repos: "75s",
        comment_faire: "Mains sur bords de chaises, jambes tendues. Fléchir les coudes jusqu'à 90°. Pousser pour remonter.",
        adapte_pour: ["Intermédiaire", "Maison", "Force triceps"],
        contre_indique: ["Problèmes poignets", "Épaule instable", "Débutant complet"],
        calories_estime: "5-8 kcal/min",
      },
      {
        name: "Marteau haltères (hammer curl)",
        niveau: "Débutant",
        equipement: "Haltères",
        muscles_cibles: "Biceps, brachial, avant-bras",
        series: "3x12",
        repos: "60s",
        comment_faire: "Comme curl biceps mais paumes face à face (position neutre). Plus naturel pour les poignets.",
        adapte_pour: ["Tous niveaux", "Douleur poignet légère", "Maison"],
        contre_indique: ["Tendinite sévère"],
        calories_estime: "3-5 kcal/min",
      },
    ]
  },
  abdos: {
    label: "🎯 Abdominaux",
    color: "#f87171",
    muscles: "Rectus abdominis, obliques, transverse",
    items: [
      {
        name: "Gainage ventral (planche)",
        niveau: "Débutant",
        equipement: "Tapis",
        muscles_cibles: "Transverse, rectus abdominis, stabilisateurs",
        series: "3x20-45s",
        repos: "45s",
        comment_faire: "Sur coudes et pointes de pieds. Corps aligné de la tête aux talons. Respirer normalement.",
        adapte_pour: ["Tous niveaux", "Mal de dos (renforce)", "Femmes", "SOPK", "Problèmes cardiaques"],
        contre_indique: ["Hernie discale sévère", "Grossesse avancée"],
        calories_estime: "3-4 kcal/min",
      },
      {
        name: "Gainage latéral",
        niveau: "Débutant",
        equipement: "Tapis",
        muscles_cibles: "Obliques, abducteurs",
        series: "3x20-30s chaque côté",
        repos: "45s",
        comment_faire: "Sur coude et pied latéral. Corps aligné. Hanche ne doit pas tomber.",
        adapte_pour: ["Tous niveaux", "Taille affinée", "Maison", "Femmes"],
        contre_indique: ["Problème d'épaule (appui coude)"],
        calories_estime: "2-3 kcal/min",
      },
      {
        name: "Crunchs",
        niveau: "Débutant",
        equipement: "Tapis",
        muscles_cibles: "Rectus abdominis",
        series: "3x15-20",
        repos: "45s",
        comment_faire: "Allongé, genoux fléchis. Monter les épaules en contractant les abdos. NE PAS tirer sur la nuque.",
        adapte_pour: ["Débutant", "Maison", "Femmes"],
        contre_indique: ["Hernie discale", "Douleur cervicale", "Grossesse"],
        calories_estime: "3-5 kcal/min",
      },
      {
        name: "Dead bug",
        niveau: "Débutant",
        equipement: "Tapis",
        muscles_cibles: "Transverse, stabilisateurs lombaires",
        series: "3x10 chaque côté",
        repos: "60s",
        comment_faire: "Allongé, bras vers le ciel, jambes à 90°. Descendre bras droit + jambe gauche simultanément. Alterner.",
        adapte_pour: ["Tous niveaux", "Mal de dos", "Rééducation", "Grossesse (1er trimestre)"],
        contre_indique: ["Hernie discale active"],
        calories_estime: "2-3 kcal/min",
      },
      {
        name: "Abdos hypopressifs",
        niveau: "Intermédiaire",
        equipement: "Tapis",
        muscles_cibles: "Transverse profond, plancher pelvien",
        series: "3x10 respirations",
        repos: "60s",
        comment_faire: "Debout ou allongé. Expirer à fond, rentrer le ventre au maximum. Tenir 10s. Inspirations normales.",
        adapte_pour: ["Post-partum", "SOPK", "Problèmes plancher pelvien", "Diastase"],
        contre_indique: ["Hypertension (apnée)", "Grossesse"],
        calories_estime: "1-2 kcal/min",
      },
    ]
  },
  jambes: {
    label: "🦵 Jambes & Fessiers",
    color: "#aa88ff",
    muscles: "Quadriceps, ischio-jambiers, fessiers, mollets",
    items: [
      {
        name: "Squat poids du corps",
        niveau: "Débutant",
        equipement: "Aucun",
        muscles_cibles: "Quadriceps, fessiers, ischio-jambiers",
        series: "3x15-20",
        repos: "60s",
        comment_faire: "Pieds largeur épaules. Descendre comme pour s'asseoir. Genoux dans l'axe des orteils. Dos droit.",
        adapte_pour: ["Tous niveaux", "Maison", "Femmes", "Débutants", "Perte de poids"],
        contre_indique: ["Douleur genou sévère", "Prothèse genou récente"],
        calories_estime: "5-8 kcal/min",
      },
      {
        name: "Fentes avant",
        niveau: "Débutant",
        equipement: "Aucun (ou haltères)",
        muscles_cibles: "Quadriceps, fessiers, mollets",
        series: "3x10 par jambe",
        repos: "60s",
        comment_faire: "Pas en avant, genou avant à 90°. Genou arrière vers le sol. Dos droit. Pousser sur talon avant.",
        adapte_pour: ["Tous niveaux", "Maison", "Femmes", "Équilibre et coordination"],
        contre_indique: ["Douleur genou", "Problème d'équilibre sévère"],
        calories_estime: "5-8 kcal/min",
      },
      {
        name: "Pont fessier (hip thrust sol)",
        niveau: "Débutant",
        equipement: "Tapis",
        muscles_cibles: "Fessiers, ischio-jambiers, lombaires",
        series: "3x15-20",
        repos: "60s",
        comment_faire: "Allongé dos, pieds au sol. Lever les hanches en serrant les fessiers. Tenir 2s en haut.",
        adapte_pour: ["Tous niveaux", "Femmes", "Post-partum", "Maison", "SOPK", "Mal de dos léger"],
        contre_indique: ["Hernie discale sévère"],
        calories_estime: "4-6 kcal/min",
      },
      {
        name: "Leg curl allongé bande élastique",
        niveau: "Débutant",
        equipement: "Bande élastique",
        muscles_cibles: "Ischio-jambiers",
        series: "3x12-15",
        repos: "60s",
        comment_faire: "Allongé ventre sol, bande autour des chevilles. Fléchir les genoux. Contrôler la descente.",
        adapte_pour: ["Débutant", "Maison", "Femmes", "Rééducation genou"],
        contre_indique: ["Douleur genou sévère"],
        calories_estime: "3-4 kcal/min",
      },
      {
        name: "Élévations mollets debout",
        niveau: "Débutant",
        equipement: "Aucun (ou marche)",
        muscles_cibles: "Gastrocnémiens, soléaire",
        series: "3x20-25",
        repos: "45s",
        comment_faire: "Debout, monter sur la pointe des pieds. Tenir 1s. Redescendre lentement. Sur une marche pour plus d'amplitude.",
        adapte_pour: ["Tous niveaux", "Maison", "Cardio problème genou", "Circulation"],
        contre_indique: ["Tendinite achille aiguë"],
        calories_estime: "3-4 kcal/min",
      },
      {
        name: "Squat sumo",
        niveau: "Débutant",
        equipement: "Aucun (ou haltère)",
        muscles_cibles: "Quadriceps internes, fessiers, adducteurs",
        series: "3x15",
        repos: "60s",
        comment_faire: "Pieds très écartés, orteils vers l'extérieur. Descendre en gardant le dos droit. Genoux suivent les orteils.",
        adapte_pour: ["Tous niveaux", "Femmes", "Intérieur cuisses", "Maison"],
        contre_indique: ["Douleur hanche sévère"],
        calories_estime: "5-7 kcal/min",
      },
    ]
  },
  cardio: {
    label: "🏃 Cardio",
    color: "#5faaaa",
    muscles: "Cœur, poumons, système cardiovasculaire",
    items: [
      {
        name: "Marche rapide",
        niveau: "Débutant",
        equipement: "Aucun",
        muscles_cibles: "Cardio, jambes, fessiers",
        series: "20-45 min",
        repos: "N/A",
        comment_faire: "Marcher à allure soutenue (légère transpiration). FC 50-65% max. Bras en mouvement.",
        adapte_pour: ["Tous niveaux", "Problèmes cardiaques", "Débutant", "SOPK", "Surpoids", "Seniors"],
        contre_indique: [],
        calories_estime: "4-5 kcal/min",
      },
      {
        name: "Saut à la corde",
        niveau: "Intermédiaire",
        equipement: "Corde à sauter",
        muscles_cibles: "Cardio, mollets, épaules, coordination",
        series: "3x2-3 min",
        repos: "60s",
        comment_faire: "Sauts légers sur pointes de pieds. Commencer par 30s puis augmenter progressivement.",
        adapte_pour: ["Intermédiaire", "Perte de poids rapide", "Maison"],
        contre_indique: ["Problèmes cardiaques", "Genoux fragiles", "Surpoids important", "Débutant complet"],
        calories_estime: "10-15 kcal/min",
      },
      {
        name: "Danse (Zumba, afro, libre)",
        niveau: "Débutant",
        equipement: "Aucun",
        muscles_cibles: "Corps entier, cardio, coordination",
        series: "20-45 min",
        repos: "N/A",
        comment_faire: "Danser librement ou suivre une vidéo YouTube. Intensité modérée. Très motivant !",
        adapte_pour: ["Tous niveaux", "Femmes", "SOPK", "Maison", "Motivation"],
        contre_indique: [],
        calories_estime: "5-8 kcal/min",
      },
      {
        name: "Step (monter/descendre chaise)",
        niveau: "Débutant",
        equipement: "Chaise ou marche",
        muscles_cibles: "Cardio, quadriceps, fessiers, mollets",
        series: "3x2 min",
        repos: "60s",
        comment_faire: "Monter un pied puis l'autre sur la chaise. Descendre. Alterner le pied qui monte en premier.",
        adapte_pour: ["Débutant", "Maison", "Femmes", "Perte de poids"],
        contre_indique: ["Douleur genou", "Vertige"],
        calories_estime: "6-8 kcal/min",
      },
      {
        name: "Marche sur place genoux hauts",
        niveau: "Débutant",
        equipement: "Aucun",
        muscles_cibles: "Cardio, abdos, fléchisseurs hanches",
        series: "3x1 min",
        repos: "30s",
        comment_faire: "Marcher sur place en montant les genoux à hauteur hanches. Bras en mouvement opposé.",
        adapte_pour: ["Débutant", "Maison", "Problèmes cardiaques (intensité modérée)", "Seniors"],
        contre_indique: [],
        calories_estime: "4-6 kcal/min",
      },
    ]
  },
  yoga_stretching: {
    label: "🧘 Yoga & Étirements",
    color: "#88aaff",
    muscles: "Flexibilité, mobilité, récupération",
    items: [
      {
        name: "Salutation au soleil (version douce)",
        niveau: "Débutant",
        equipement: "Tapis",
        muscles_cibles: "Corps entier, flexibilité, respiration",
        series: "3-5 cycles",
        repos: "Respiration",
        comment_faire: "Enchaîner les postures lentement en synchronisant avec la respiration. Vidéo YouTube recommandée.",
        adapte_pour: ["Tous niveaux", "SOPK", "Stress", "Récupération", "Maison"],
        contre_indique: ["Hypertension sévère (éviter inversions)"],
        calories_estime: "2-4 kcal/min",
      },
      {
        name: "Étirement ischio-jambiers allongé",
        niveau: "Débutant",
        equipement: "Tapis",
        muscles_cibles: "Ischio-jambiers, mollets",
        series: "3x30s par jambe",
        repos: "15s",
        comment_faire: "Allongé, lever une jambe tendue. Tenir avec les mains ou un tissu. Pas de douleur vive.",
        adapte_pour: ["Tous niveaux", "Mal de dos", "Post-entraînement", "Sédentaires"],
        contre_indique: ["Sciatique aiguë"],
        calories_estime: "1 kcal/min",
      },
      {
        name: "Posture de l'enfant (child's pose)",
        niveau: "Débutant",
        equipement: "Tapis",
        muscles_cibles: "Lombaires, hanches, épaules",
        series: "1-3x1 min",
        repos: "N/A",
        comment_faire: "À genoux, s'asseoir sur les talons, étendre les bras devant soi. Respirer profondément.",
        adapte_pour: ["Tous niveaux", "Stress", "Mal de dos", "Récupération", "SOPK"],
        contre_indique: ["Problème de genou sévère"],
        calories_estime: "1 kcal/min",
      },
      {
        name: "Étirement fessiers (figure 4)",
        niveau: "Débutant",
        equipement: "Tapis",
        muscles_cibles: "Fessiers, piriforme, hanche",
        series: "3x30s par côté",
        repos: "15s",
        comment_faire: "Allongé, croiser une cheville sur le genou opposé. Tirer la jambe vers soi. Sentir l'étirement fessier.",
        adapte_pour: ["Tous niveaux", "Sédentaires", "Mal de dos", "Post-entraînement jambes"],
        contre_indique: ["Prothèse hanche récente"],
        calories_estime: "1 kcal/min",
      },
    ]
  },
};

type Category = keyof typeof EXERCISES_DB;

const NIVEAU_COLORS: Record<string, string> = {
  "Débutant": "#5faa5f",
  "Intermédiaire": "#c9a820",
  "Avancé": "#f87171",
};

export default function AdminExercisesPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("jambes");
  const [search, setSearch] = useState("");
  const [selectedExercise, setSelectedExercise] = useState<number | null>(null);

  const category = EXERCISES_DB[activeCategory];
  const filtered = category.items.filter(item =>
    !search ||
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.muscles_cibles.toLowerCase().includes(search.toLowerCase()) ||
    item.adapte_pour.some(a => a.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#f0f0f0" }}>

      {/* Header */}
      <header style={{ background: "#0f0f0f", borderBottom: "1px solid #1a1a1a", padding: "1rem 2rem", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
        <a href="/admin" style={{ background: "none", border: "1px solid #2a2a2a", color: "#888", padding: "8px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", textDecoration: "none" }}>
          ← Admin
        </a>
        <div>
          <div style={{ fontWeight: 600, fontSize: "16px" }}>🏋️ Bibliothèque Exercices</div>
          <div style={{ color: "#666", fontSize: "12px" }}>Exercices adaptés à domicile • Muscles ciblés • Contre-indications</div>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher... (ex: SOPK, genou, débutant)"
            style={{ background: "#1e1e1e", border: "1px solid #2a2a2a", color: "#f0f0f0", borderRadius: "8px", padding: "8px 14px", fontSize: "13px", outline: "none", width: "260px" }}
          />
        </div>
      </header>

      {/* Catégories */}
      <div style={{ background: "#0f0f0f", borderBottom: "1px solid #1a1a1a", padding: "0 2rem", display: "flex", gap: "4px", overflowX: "auto" }}>
        {(Object.keys(EXERCISES_DB) as Category[]).map(cat => (
          <button key={cat} onClick={() => { setActiveCategory(cat); setSearch(""); setSelectedExercise(null); }} style={{
            background: "none", border: "none",
            borderBottom: `2px solid ${activeCategory === cat ? EXERCISES_DB[cat].color : "transparent"}`,
            color: activeCategory === cat ? EXERCISES_DB[cat].color : "#666",
            padding: "14px 16px", cursor: "pointer", fontSize: "13px",
            fontWeight: activeCategory === cat ? 500 : 400, whiteSpace: "nowrap",
          }}>
            {EXERCISES_DB[cat].label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "2rem" }}>

        {/* Info muscles */}
        <div style={{ background: "#141414", border: `1px solid ${category.color}33`, borderRadius: "12px", padding: "12px 16px", marginBottom: "1.5rem" }}>
          <span style={{ color: "#555", fontSize: "12px" }}>Muscles : </span>
          <span style={{ color: category.color, fontSize: "13px" }}>{category.muscles}</span>
        </div>

        {/* Liste exercices */}
        {filtered.map((item, i) => (
          <div key={i}
            style={{ background: "#141414", border: `1px solid ${selectedExercise === i ? category.color : "#1e1e1e"}`, borderRadius: "14px", padding: "16px", marginBottom: "10px", cursor: "pointer", transition: "border 0.15s" }}
            onClick={() => setSelectedExercise(selectedExercise === i ? null : i)}>

            {/* Header exercice */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px", flexWrap: "wrap", gap: "8px" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: "15px", color: "#f0f0f0" }}>{item.name}</div>
                <div style={{ color: "#666", fontSize: "12px", marginTop: "2px" }}>
                  🎯 {item.muscles_cibles} · ⏱️ {item.series} · 😴 repos {item.repos}
                </div>
              </div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                <span style={{ background: NIVEAU_COLORS[item.niveau] + "22", color: NIVEAU_COLORS[item.niveau], border: `1px solid ${NIVEAU_COLORS[item.niveau]}44`, borderRadius: "99px", padding: "3px 10px", fontSize: "11px" }}>
                  {item.niveau}
                </span>
                <span style={{ background: "#1a1a1a", color: "#666", borderRadius: "99px", padding: "3px 10px", fontSize: "11px" }}>
                  🏠 {item.equipement}
                </span>
                <span style={{ background: "#0d1a0d", color: "#5faa5f", borderRadius: "99px", padding: "3px 10px", fontSize: "11px" }}>
                  🔥 {item.calories_estime}
                </span>
              </div>
            </div>

            {/* Badges adapté pour */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: selectedExercise === i ? "12px" : "0" }}>
              {item.adapte_pour.map((a, j) => (
                <span key={j} style={{ background: "#0d1a0d", color: "#5faa5f", borderRadius: "99px", padding: "2px 8px", fontSize: "11px" }}>
                  ✅ {a}
                </span>
              ))}
              {item.contre_indique.map((c, j) => (
                <span key={j} style={{ background: "#1a0d0d", color: "#f87171", borderRadius: "99px", padding: "2px 8px", fontSize: "11px" }}>
                  ❌ {c}
                </span>
              ))}
            </div>

            {/* Détail au clic */}
            {selectedExercise === i && (
              <div style={{ background: "#1a1a1a", borderRadius: "10px", padding: "14px", marginTop: "4px" }}>
                <div style={{ color: "#888", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Comment faire</div>
                <p style={{ color: "#ccc", fontSize: "13px", lineHeight: 1.7, margin: 0 }}>{item.comment_faire}</p>
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", color: "#444", padding: "2rem" }}>
            Aucun exercice trouvé — essaie "SOPK", "débutant", "genou"...
          </div>
        )}
      </div>
    </div>
  );
}
