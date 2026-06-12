"use client";

import { useState } from "react";

// ─── Base de données nutritionnelle Madagascar ────────────────────────────────
const NUTRITION_DB = {
  proteines: {
    label: "🥩 Protéines",
    color: "#5faa5f",
    description: "Construisent et réparent les muscles. Besoin : 1.6-2.4g/kg/jour selon objectif.",
    items: [
      { name: "Poulet (blanc)", portion: "100g", cal: 165, prot: 31, gluc: 0, lip: 3.6, info: "Meilleure source protéique accessible à Tana. ~3000-5000 Ar/100g" },
      { name: "Tilapia grillé", portion: "100g", cal: 128, prot: 26, gluc: 0, lip: 2.7, info: "Poisson local le plus économique. Riche en protéines maigres" },
      { name: "Capitaine grillé", portion: "100g", cal: 140, prot: 28, gluc: 0, lip: 3.2, info: "Poisson local savoureux, disponible au marché" },
      { name: "Sardines en boîte", portion: "100g", cal: 208, prot: 25, gluc: 0, lip: 12, info: "Saupiquet disponible partout. Riche en oméga-3 cardioprotecteurs" },
      { name: "Thon en boîte", portion: "100g", cal: 184, prot: 30, gluc: 0, lip: 6, info: "Pratique et économique. Bon pour salades et sandwichs" },
      { name: "Œuf entier", portion: "1 unité (60g)", cal: 86, prot: 6, gluc: 0.6, lip: 6, info: "~500 Ar/unité. Protéine complète avec tous les acides aminés essentiels" },
      { name: "Blanc d'œuf", portion: "2 blancs (60g)", cal: 34, prot: 7, gluc: 0.5, lip: 0.1, info: "Protéine pure, zéro lipides. Idéal pour objectif perte de poids" },
      { name: "Lentilles cuites", portion: "100g", cal: 116, prot: 9, gluc: 20, lip: 0.4, info: "Économique, riche en fer et fibres. Excellente protéine végétale" },
      { name: "Haricots rouges", portion: "100g", cal: 127, prot: 8.7, gluc: 23, lip: 0.5, info: "Base alimentaire malgache. Associer au riz pour protéine complète" },
      { name: "Haricots blancs", portion: "100g", cal: 139, prot: 9.7, gluc: 25, lip: 0.4, info: "Riche en fibres et potassium. Bon pour cœur" },
      { name: "Pois du cap (ambérique)", portion: "100g", cal: 118, prot: 8, gluc: 21, lip: 0.5, info: "Légumineuse locale très accessible au marché" },
      { name: "Tofu local", portion: "100g", cal: 144, prot: 17, gluc: 2.8, lip: 9, info: "Épiceries asiatiques à Tana. Excellent pour végétariens/vegans" },
      { name: "Lait de soja", portion: "250ml", cal: 105, prot: 9, gluc: 12, lip: 4, info: "Alternative lait sans lactose. Disponible en supermarché" },
      { name: "Fromage de zébu", portion: "30g", cal: 110, prot: 7, gluc: 0.5, lip: 9, info: "Produit local. Éviter si intolérance lactose" },
    ]
  },
  glucides: {
    label: "🌾 Glucides",
    color: "#88aaff",
    description: "Carburant principal du corps et du cerveau. Préférer IG bas pour énergie stable.",
    items: [
      { name: "Riz complet", portion: "100g cuit", cal: 130, prot: 2.7, gluc: 28, lip: 0.3, info: "IG 50 — Préférer au riz blanc (IG 72). Plus de fibres et vitamines B" },
      { name: "Riz rouge local", portion: "100g cuit", cal: 135, prot: 3, gluc: 27, lip: 0.5, info: "IG 55 — Riche en antioxydants. Très disponible à Madagascar" },
      { name: "Riz blanc", portion: "100g cuit", cal: 130, prot: 2.7, gluc: 28, lip: 0.3, info: "IG 72 — À limiter. Consommer en petite quantité avec légumes et protéines" },
      { name: "Patate douce", portion: "150g cuite", cal: 130, prot: 2, gluc: 30, lip: 0.1, info: "IG 50 — Excellente ! Riche en bêta-carotène et potassium" },
      { name: "Manioc cuit", portion: "100g", cal: 160, prot: 1.4, gluc: 38, lip: 0.3, info: "IG 65 — Consommer avec modération. Associer à protéines et légumes" },
      { name: "Flocons d'avoine", portion: "50g sec", cal: 180, prot: 6, gluc: 30, lip: 3, info: "IG 40 — Excellent pour petit-déjeuner. Disponible en supermarché" },
      { name: "Pain complet", portion: "2 tranches (60g)", cal: 150, prot: 5, gluc: 28, lip: 2, info: "IG 45 — Préférer au pain blanc. Riche en fibres" },
      { name: "Pain blanc", portion: "2 tranches (60g)", cal: 160, prot: 5, gluc: 32, lip: 1.5, info: "IG 75 — À limiter. Peu de nutriments" },
      { name: "Banane mûre", portion: "1 moyenne (120g)", cal: 107, prot: 1.3, gluc: 27, lip: 0.4, info: "IG 52 — Fruit le plus accessible. Excellent pré-entraînement" },
      { name: "Banane verte", portion: "100g", cal: 89, prot: 1.1, gluc: 23, lip: 0.3, info: "IG 30 — Résistant à l'amidon, excellent pour microbiote intestinal" },
      { name: "Maïs cuit", portion: "100g", cal: 86, prot: 3.2, gluc: 19, lip: 1.2, info: "IG 52 — Bonne source d'énergie. Disponible partout" },
      { name: "Voandzou (pois de terre)", portion: "100g cuit", cal: 150, prot: 7, gluc: 24, lip: 4, info: "IG 35 — Légumineuse locale très nutritive. Marché d'Analakely" },
    ]
  },
  lipides: {
    label: "🥑 Lipides",
    color: "#c9a820",
    description: "Essentiels pour hormones, cerveau et absorption vitamines. Privilégier graisses insaturées.",
    items: [
      { name: "Huile d'olive", portion: "1 c.à.s (15ml)", cal: 119, prot: 0, gluc: 0, lip: 14, info: "Riche en oméga-9. Excellente pour santé cardiaque. Supermarché" },
      { name: "Huile de tournesol", portion: "1 c.à.s (15ml)", cal: 124, prot: 0, gluc: 0, lip: 14, info: "Riche en vitamine E. Disponible partout. Pour cuisson basse température" },
      { name: "Huile de soja", portion: "1 c.à.s (15ml)", cal: 120, prot: 0, gluc: 0, lip: 14, info: "Bonne source d'oméga-6 et oméga-3. Très accessible" },
      { name: "Huile de colza", portion: "1 c.à.s (15ml)", cal: 120, prot: 0, gluc: 0, lip: 14, info: "Meilleur ratio oméga-3/oméga-6. Idéale pour l'équilibre hormonal" },
      { name: "Avocat local", portion: "1/2 (75g)", cal: 120, prot: 1.5, gluc: 6, lip: 11, info: "Saison mai-octobre à Tana. Riche en oméga-9 et potassium" },
      { name: "Cacahuètes nature", portion: "30g", cal: 170, prot: 7, gluc: 5, lip: 14, info: "~500-1000 Ar/portion. Riche en protéines et graisses saines" },
      { name: "Graines de sésame", portion: "20g", cal: 114, prot: 3.5, gluc: 3.5, lip: 9.8, info: "Riche en calcium et zinc. Marché local, économique" },
      { name: "Graines de tournesol", portion: "20g", cal: 116, prot: 4, gluc: 3, lip: 10, info: "Riche en vitamine E et magnésium. Disponible en supermarché" },
      { name: "Graines de courge", portion: "20g", cal: 113, prot: 6, gluc: 2, lip: 9, info: "Très riche en zinc et magnésium. Marché local" },
      { name: "Noix de coco fraîche", portion: "50g râpée", cal: 177, prot: 1.7, gluc: 7.6, lip: 17, info: "Disponible toute l'année. Riche en acides gras à chaîne moyenne" },
      { name: "Sardines (avec huile)", portion: "100g", cal: 208, prot: 25, gluc: 0, lip: 12, info: "Meilleure source d'oméga-3 accessible à Madagascar" },
    ]
  },
  legumes: {
    label: "🥦 Légumes",
    color: "#5faaaa",
    description: "Vitamines, minéraux, fibres et antioxydants. Manger minimum 500g/jour de légumes variés.",
    items: [
      { name: "Brèdes mouroum (moringa)", portion: "100g", cal: 64, prot: 9, gluc: 8, lip: 1.4, info: "SUPERFOOD MALGACHE ! Fer, calcium, vit A, B, C, E. Le légume le plus nutritif" },
      { name: "Brèdes anamalaho", portion: "100g", cal: 38, prot: 3.5, gluc: 6, lip: 0.5, info: "Légume vert local riche en fer et acide folique. Très économique" },
      { name: "Brèdes betsileo", portion: "100g", cal: 35, prot: 3, gluc: 5, lip: 0.4, info: "Variété locale nutritive. Disponible au marché" },
      { name: "Brèdes marofo", portion: "100g", cal: 40, prot: 3.2, gluc: 6, lip: 0.5, info: "Feuilles de patate douce — très riches en vitamines A et C" },
      { name: "Chou vert", portion: "100g", cal: 25, prot: 1.3, gluc: 5.8, lip: 0.1, info: "Très économique. Riche en vitamine C, K et fibres. Anti-inflammatoire" },
      { name: "Carottes", portion: "100g", cal: 41, prot: 0.9, gluc: 9.6, lip: 0.2, info: "Toute l'année. Riche en bêta-carotène (vitamine A)" },
      { name: "Tomates locales", portion: "100g", cal: 18, prot: 0.9, gluc: 3.9, lip: 0.2, info: "Riche en lycopène (anticancer). Disponible toute l'année" },
      { name: "Haricots verts", portion: "100g", cal: 31, prot: 1.8, gluc: 7, lip: 0.1, info: "Riche en fibres et vitamines K et C" },
      { name: "Concombre", portion: "100g", cal: 15, prot: 0.6, gluc: 3.6, lip: 0.1, info: "Très hydratant (96% eau). Idéal pour collation légère" },
      { name: "Oignons", portion: "50g", cal: 20, prot: 0.6, gluc: 4.7, lip: 0.1, info: "Anti-inflammatoire et prébiotique. Base de toute la cuisine malgache" },
      { name: "Ail", portion: "10g (3 gousses)", cal: 13, prot: 0.6, gluc: 3, lip: 0.04, info: "Antibiotique naturel, régule tension artérielle" },
      { name: "Gingembre frais", portion: "10g", cal: 8, prot: 0.2, gluc: 1.7, lip: 0.1, info: "Anti-inflammatoire puissant. Aide digestion et nausées" },
      { name: "Courgettes", portion: "100g", cal: 17, prot: 1.2, gluc: 3.1, lip: 0.3, info: "Faible en calories. Disponible en supermarché" },
    ]
  },
  fruits: {
    label: "🍌 Fruits",
    color: "#F5C842",
    description: "Vitamines, antioxydants et énergie naturelle. Consommer 2-3 portions/jour.",
    items: [
      { name: "Banane", portion: "1 moyenne (120g)", cal: 107, prot: 1.3, gluc: 27, lip: 0.4, info: "Fruit le plus accessible. Potassium, magnésium. Idéal pré-entraînement" },
      { name: "Papaye", portion: "150g", cal: 60, prot: 0.7, gluc: 15, lip: 0.4, info: "Très accessible. Papaïne = enzyme digestive. Riche en vit C et A" },
      { name: "Goyave", portion: "100g", cal: 68, prot: 2.6, gluc: 14, lip: 1, info: "4x plus de vitamine C que l'orange ! Économique et disponible" },
      { name: "Mangue locale", portion: "150g", cal: 99, prot: 1.4, gluc: 25, lip: 0.6, info: "Saison nov-mars. Riche en vit A, C, E et antioxydants" },
      { name: "Ananas local", portion: "150g", cal: 78, prot: 0.9, gluc: 19, lip: 0.2, info: "Bromélaïne = enzyme anti-inflammatoire. Aide digestion des protéines" },
      { name: "Pastèque", portion: "200g", cal: 60, prot: 1.2, gluc: 15, lip: 0.2, info: "92% eau. Lycopène, citrulline. Hydratation post-entraînement" },
      { name: "Litchi", portion: "100g", cal: 66, prot: 0.8, gluc: 17, lip: 0.4, info: "Saison déc-jan. Très riche en vitamine C et antioxydants" },
      { name: "Grenadelle (fruit de la passion)", portion: "50g (2 fruits)", cal: 46, prot: 1, gluc: 11, lip: 0.4, info: "Riche en fibres et vit C. Antioxydants puissants" },
      { name: "Jacque (jaque)", portion: "100g", cal: 95, prot: 1.7, gluc: 23, lip: 0.6, info: "Fruit local très énergétique. Riche en potassium et magnésium" },
    ]
  },
  vitamines: {
    label: "💊 Vitamines & Minéraux",
    color: "#f87171",
    description: "Nutriments essentiels pour le fonctionnement optimal du corps. Sources alimentaires locales.",
    items: [
      { name: "Fer", portion: "Besoin: 15-18mg/j (femmes)", cal: 0, prot: 0, gluc: 0, lip: 0, info: "Sources locales : brèdes mouroum (28mg/100g), lentilles (3.3mg), haricots (2.5mg), sardines (2.7mg). Associer vit C pour meilleure absorption" },
      { name: "Calcium", portion: "Besoin: 1000mg/j", cal: 0, prot: 0, gluc: 0, lip: 0, info: "Sources locales : brèdes mouroum (440mg/100g!), lentilles (35mg), sardines avec arêtes (380mg), tofu (350mg)" },
      { name: "Magnésium", portion: "Besoin: 300-400mg/j", cal: 0, prot: 0, gluc: 0, lip: 0, info: "Sources locales : graines de courge (262mg/100g), graines de sésame (356mg), haricots noirs (171mg), avoine (177mg)" },
      { name: "Vitamine C", portion: "Besoin: 75-90mg/j", cal: 0, prot: 0, gluc: 0, lip: 0, info: "Sources locales : goyave (228mg/100g!), moringa (51mg), mangue (27mg), papaye (62mg), chou (41mg)" },
      { name: "Vitamine A", portion: "Besoin: 700-900µg/j", cal: 0, prot: 0, gluc: 0, lip: 0, info: "Sources locales : brèdes marofo (feuilles patate douce), carottes (835µg), mangue (38µg), papaye (47µg)" },
      { name: "Vitamine D", portion: "Besoin: 600-800 UI/j", cal: 0, prot: 0, gluc: 0, lip: 0, info: "Soleil 15-20min/jour (Madagascar = pays ensoleillé!). Sardines (272 UI/100g), thon (227 UI)" },
      { name: "Vitamine B12", portion: "Besoin: 2.4µg/j", cal: 0, prot: 0, gluc: 0, lip: 0, info: "UNIQUEMENT dans produits animaux. Sources : sardines (8.9µg/100g), thon (2.5µg), œufs (1.3µg). Supplément obligatoire si vegan" },
      { name: "Zinc", portion: "Besoin: 8-11mg/j", cal: 0, prot: 0, gluc: 0, lip: 0, info: "Sources locales : graines de courge (7.6mg/100g), graines de sésame (7.8mg), lentilles (3.3mg), poulet (3.5mg)" },
      { name: "Potassium", portion: "Besoin: 3500mg/j", cal: 0, prot: 0, gluc: 0, lip: 0, info: "Sources locales : banane (358mg), patate douce (337mg), haricots blancs (561mg), avocat (485mg)" },
      { name: "Oméga-3", portion: "Besoin: 1-2g/j", cal: 0, prot: 0, gluc: 0, lip: 0, info: "ANTI-INFLAMMATOIRE PUISSANT. Sources locales : sardines (2.2g/100g), thon (1.3g), huile de colza (9g/100g), graines de lin (si disponibles)" },
      { name: "Acide folique (B9)", portion: "Besoin: 400µg/j", cal: 0, prot: 0, gluc: 0, lip: 0, info: "Essentiel femmes enceintes. Sources : lentilles (181µg/100g), brèdes (70µg), haricots (130µg), avocat (81µg)" },
      { name: "Iode", portion: "Besoin: 150µg/j", cal: 0, prot: 0, gluc: 0, lip: 0, info: "Essentiel thyroïde. Sources : poissons de mer locaux, sel iodé (utiliser sel iodé en cuisine)" },
    ]
  },
  complements: {
    label: "🧪 Compléments recommandés",
    color: "#aa88ff",
    description: "Compléments utiles selon objectif et profil. Disponibilité à Tana.",
    items: [
      { name: "Magnésium bisglycinate", portion: "300mg/soir", cal: 0, prot: 0, gluc: 0, lip: 0, info: "Meilleure forme absorbable. Aide sommeil, stress, crampes, SOPK. Pharmacies à Tana" },
      { name: "Vitamine D3", portion: "1000-2000 UI/jour", cal: 0, prot: 0, gluc: 0, lip: 0, info: "Même à Madagascar le manque est fréquent. Aide immunité, hormones, humeur. Pharmacies" },
      { name: "Oméga-3 (fish oil)", portion: "1000mg/jour", cal: 0, prot: 0, gluc: 0, lip: 0, info: "Anti-inflammatoire, cardioprotecteur, aide SOPK. Supermarché ou pharmacie" },
      { name: "Calcium", portion: "500-1000mg/jour", cal: 0, prot: 0, gluc: 0, lip: 0, info: "Si sans lactose. Prendre avec repas. Pharmacies" },
      { name: "Fer + Vitamine C", portion: "Selon carence", cal: 0, prot: 0, gluc: 0, lip: 0, info: "Si anémie ou fatigue chronique. Toujours associer à vitamine C. Sur ordonnance recommandé" },
      { name: "Myo-Inositol", portion: "2-4g/jour", cal: 0, prot: 0, gluc: 0, lip: 0, info: "Très efficace pour SOPK, régule insuline et hormones. Pharmacies spécialisées ou commande en ligne" },
      { name: "Vitamine B12", portion: "500-1000µg/jour", cal: 0, prot: 0, gluc: 0, lip: 0, info: "INDISPENSABLE si végétalien/vegan. Pharmacies" },
      { name: "Zinc", portion: "15-25mg/jour", cal: 0, prot: 0, gluc: 0, lip: 0, info: "Immunité, peau, cheveux, hormones. Pharmacies" },
      { name: "Créatine monohydrate", portion: "5g/jour", cal: 0, prot: 0, gluc: 0, lip: 0, info: "Pour prise de masse. Augmente force et récupération. Commande en ligne possible" },
      { name: "Coenzyme Q10", portion: "100mg/jour", cal: 0, prot: 0, gluc: 0, lip: 0, info: "Pour problèmes cardiaques. Énergie cellulaire. Pharmacies spécialisées" },
    ]
  },
};

type Category = keyof typeof NUTRITION_DB;

export default function AdminNutritionPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("proteines");
  const [search, setSearch] = useState("");

  const category = NUTRITION_DB[activeCategory];
  const filtered = category.items.filter(item =>
    !search || item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.info.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#f0f0f0" }}>

      {/* Header */}
      <header style={{ background: "#0f0f0f", borderBottom: "1px solid #1a1a1a", padding: "1rem 2rem", display: "flex", alignItems: "center", gap: "16px" }}>
        <a href="/admin" style={{ background: "none", border: "1px solid #2a2a2a", color: "#888", padding: "8px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", textDecoration: "none" }}>
          ← Admin
        </a>
        <div>
          <div style={{ fontWeight: 600, fontSize: "16px" }}>📚 Bibliothèque Nutritionnelle</div>
          <div style={{ color: "#666", fontSize: "12px" }}>Aliments disponibles à Madagascar + valeurs nutritionnelles</div>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un aliment..."
            style={{ background: "#1e1e1e", border: "1px solid #2a2a2a", color: "#f0f0f0", borderRadius: "8px", padding: "8px 14px", fontSize: "13px", outline: "none", width: "220px" }}
          />
        </div>
      </header>

      {/* Catégories */}
      <div style={{ background: "#0f0f0f", borderBottom: "1px solid #1a1a1a", padding: "0 2rem", display: "flex", gap: "4px", overflowX: "auto" }}>
        {(Object.keys(NUTRITION_DB) as Category[]).map(cat => (
          <button key={cat} onClick={() => { setActiveCategory(cat); setSearch(""); }} style={{
            background: "none", border: "none",
            borderBottom: `2px solid ${activeCategory === cat ? NUTRITION_DB[cat].color : "transparent"}`,
            color: activeCategory === cat ? NUTRITION_DB[cat].color : "#666",
            padding: "14px 16px", cursor: "pointer", fontSize: "13px",
            fontWeight: activeCategory === cat ? 500 : 400, whiteSpace: "nowrap",
          }}>
            {NUTRITION_DB[cat].label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "2rem" }}>

        {/* Description catégorie */}
        <div style={{ background: "#141414", border: `1px solid ${category.color}33`, borderRadius: "12px", padding: "14px 16px", marginBottom: "1.5rem" }}>
          <p style={{ color: category.color, margin: 0, fontSize: "14px" }}>{category.description}</p>
        </div>

        {/* En-tête tableau */}
        {activeCategory !== "vitamines" && activeCategory !== "complements" && (
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 80px 80px 80px 80px", gap: "8px", padding: "8px 12px", marginBottom: "6px" }}>
            {["Aliment", "Portion", "Cal", "Prot.", "Gluc.", "Lip."].map(h => (
              <div key={h} style={{ color: "#444", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px" }}>{h}</div>
            ))}
          </div>
        )}

        {/* Liste aliments */}
        {filtered.map((item, i) => (
          <div key={i} style={{ background: "#141414", border: "1px solid #1e1e1e", borderRadius: "10px", padding: "12px 16px", marginBottom: "8px" }}>
            {activeCategory !== "vitamines" && activeCategory !== "complements" ? (
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 80px 80px 80px 80px", gap: "8px", alignItems: "center", marginBottom: "6px" }}>
                <div style={{ fontWeight: 500, color: "#f0f0f0", fontSize: "14px" }}>{item.name}</div>
                <div style={{ color: "#666", fontSize: "12px" }}>{item.portion}</div>
                <div style={{ color: "#F5C842", fontWeight: 600, fontSize: "13px" }}>{item.cal}</div>
                <div style={{ color: "#5faa5f", fontWeight: 600, fontSize: "13px" }}>{item.prot}g</div>
                <div style={{ color: "#88aaff", fontWeight: 600, fontSize: "13px" }}>{item.gluc}g</div>
                <div style={{ color: "#c9a820", fontWeight: 600, fontSize: "13px" }}>{item.lip}g</div>
              </div>
            ) : (
              <div style={{ marginBottom: "6px" }}>
                <span style={{ fontWeight: 600, color: category.color, fontSize: "14px" }}>{item.name}</span>
                <span style={{ color: "#555", fontSize: "12px", marginLeft: "10px" }}>{item.portion}</span>
              </div>
            )}
            <div style={{ color: "#888", fontSize: "12px", lineHeight: 1.5 }}>{item.info}</div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", color: "#444", padding: "2rem" }}>Aucun aliment trouvé</div>
        )}

        {/* Légende macros */}
        {activeCategory !== "vitamines" && activeCategory !== "complements" && (
          <div style={{ display: "flex", gap: "16px", marginTop: "1.5rem", flexWrap: "wrap" }}>
            {[["Cal", "#F5C842", "kcal"], ["Prot.", "#5faa5f", "protéines (g)"], ["Gluc.", "#88aaff", "glucides (g)"], ["Lip.", "#c9a820", "lipides (g)"]].map(([k, c, v]) => (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: c }} />
                <span style={{ color: "#555" }}>{k} = {v}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}