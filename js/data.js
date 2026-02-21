/**
 * ÉVOLUTION ÉNERGIE - Données du jeu (V3 : Arbre Tech, Météo, Stocks)
 * 7 Âges, 14 Bâtiments, Recherche, Saisons, Stocks Fossiles
 */

const GAME_DATA = {
    // Configuration générale
    config: {
        villageBaseProduction: 5,   // ⚡ Production de base du village/tour
        co2BudgetMax: 1000,             // 🌍 Budget carbone max (Gt CO₂) — Game Over
    },

    // Les 7 époques/niveaux
    // ageThreshold = production nette/tour requise pour avancer
    levels: [
        {
            id: 1,
            name: "Préhistoire",
            icon: "🔥",
            color: "#f97316",
            ageThreshold: 0,
            unlockMessage: "Bienvenue ! Tout commence par la maîtrise du feu.",
            objective: "Découvre le feu pour survivre."
        },
        {
            id: 2,
            name: "Néolithique",
            icon: "🐂",
            color: "#84cc16",
            ageThreshold: 15,
            unlockMessage: "L'agriculture change tout. La force animale aide les hommes.",
            objective: "Utilise la force animale pour développer le village."
        },
        {
            id: 3,
            name: "Antiquité",
            icon: "🏛️",
            color: "#06b6d4",
            ageThreshold: 50,
            unlockMessage: "L'eau devient une force motrice puissante.",
            objective: "Maîtrise la force de l'eau."
        },
        {
            id: 4,
            name: "Moyen Âge",
            icon: "🏰",
            color: "#a855f7",
            ageThreshold: 100,
            unlockMessage: "Le vent et le charbon offrent de nouvelles perspectives.",
            objective: "Exploite le vent et les premières ressources minières."
        },
        {
            id: 5,
            name: "Révolution Industrielle",
            icon: "🏭",
            color: "#6b7280",
            ageThreshold: 400,
            unlockMessage: "La vapeur et l'électricité révolutionnent le monde !",
            objective: "Lance ta révolution industrielle, mais attention à la pollution."
        },
        {
            id: 6,
            name: "1900-1950",
            icon: "🛢️",
            color: "#3b82f6",
            ageThreshold: 1000,
            unlockMessage: "Le pétrole devient l'énergie reine du transport et de l'industrie.",
            objective: "Exploite le pétrole pour répondre à une demande croissante."
        },
        {
            id: 7,
            name: "1950-2000",
            icon: "⚛️",
            color: "#8b5cf6",
            ageThreshold: 1500,
            unlockMessage: "L'atome et les premiers panneaux solaires font leur apparition.",
            objective: "Maîtrise la puissance de l'atome et commence la transition."
        },
        {
            id: 8,
            name: "21ème Siècle",
            icon: "🌍",
            color: "#22c55e",
            ageThreshold: 2000,
            unlockMessage: "L'heure de la transition écologique et du stockage.",
            objective: "Atteins l'autonomie durable avec un minimum de pollution."
        },
        {
            id: 9,
            name: "Futur",
            icon: "🚀",
            color: "#10b981",
            ageThreshold: 2500,
            unlockMessage: "VICTOIRE.",
            objective: "Bravo, tu as atteint l'autonomie durable du futur !"
        }
    ],

    // Météo Aléatoire (Indicateurs au lieu de saisons)
    weather: {
        sun: [
            { name: "Nuit/Nuages", icon: "🌑", multiplier: 0.0, desc: "Pas de production solaire." },
            { name: "Couvert", icon: "☁️", multiplier: 0.5, desc: "Production réduite par les nuages." },
            { name: "Beau temps", icon: "☀️", multiplier: 1.0, desc: "Production normale." },
            { name: "Plein soleil", icon: "🌞", multiplier: 1.5, desc: "Production maximale !" }
        ],
        wind: [
            { name: "Calme", icon: "🍃", multiplier: 0.0, desc: "Pas de production éolienne." },
            { name: "Brise", icon: "🌬️", multiplier: 0.5, desc: "Production faible." },
            { name: "Venté", icon: "💨", multiplier: 1.0, desc: "Production normale." },
            { name: "Tempête", icon: "🌪️", multiplier: 1.5, desc: "Production maximale !" }
        ]
    },

    // Contenu de la Modale de Règles (Au démarrage)
    rulesContent: `
        <h3>Bienvenue dans EnerSim ! 🌍</h3>
        <p>Tu diriges le développement énergétique d'un village à travers les âges, de la Préhistoire au futur.</p>
        
        <div style="background: rgba(255,255,255,0.1); padding: 10px; border-radius: 8px; margin: 10px 0;">
            <strong>Tes Objectifs :</strong>
            <ul style="margin: 5px 0; padding-left: 20px;">
                <li>⚡ A chaque tour de jeu tu dois <strong>produire de l'énergie</strong> pour faire évoluer ta civilisation.</li>
                <li>🔬 <strong>Rechercher</strong> de nouvelles technologies.</li>
                <li>🌍 <strong>Limiter tes émissions CO₂</strong> sous 1000 Gt (sinon Game Over !) Attention au changement climatique!</li>
            </ul>
        </div>

        <div style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px; margin: 10px 0;">
            <strong>Ton Score Final :</strong><br>
            Il sera calculé à la fin selon 3 critères :
            <ul style="margin: 5px 0; padding-left: 20px;">
                <li>🟢 <strong>+ Ton évolution finale</strong> (Objectif d'énergie de l'âge atteint)</li>
                <li>🔴 <strong>- Ton manque de sobriété</strong> (-0,1 PT par ⚡ dépensée)</li>
                <li>🔴 <strong>- Ton empreinte pollution</strong> (-0,5 PT par Gt de CO₂)</li>
            </ul>
        </div>

        <div style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px; margin: 10px 0;">
            <strong>Barème de réussite (Score Total) :</strong>
            <ul style="margin: 5px 0; padding-left: 20px;">
                <li>🌟 <strong>700 et +</strong> : Excellent</li>
                <li>🏆 <strong>500 à 699</strong> : Super</li>
                <li>🚀 <strong>300 à 499</strong> : Très bien</li>
                <li>👍 <strong>100 à 299</strong> : Bien</li>
                <li>🙁 <strong>Moins de 100</strong> : Pas Super</li>
            </ul>
        </div>
    `,

    // Sources d'énergie (14 bâtiments)
    // output = ⚡ produit/tour
    // pollutionPerTurn = 🏭 pollution/tour
    // buildCostPerTurn = ⚡ coût construction/tour
    // buildTime = tours de construction
    // researchTime = tours de recherche
    // researchCostPerTurn = ⚡ coût recherche/tour
    // fuelStock = stock initial (null si illimité)
    // requires = ID du bâtiment prérequis (tech tree)
    sources: [
        // ── Âge 1 : Préhistoire ──
        {
            id: "wood",
            name: "Feu de camp",
            icon: "🔥",
            level: 1,
            output: 5,
            pollutionPerTurn: 0.1,  // Gt CO₂ — biomasse
            buildCostPerTurn: 5,
            buildTime: 0,
            researchTime: 1,
            researchCostPerTurn: 1,
            fuelStock: null,
            renewable: true,
            requires: null,
            zone: "forest",
            description: "La première source d'énergie : chaleur et lumière. Cette ressource est inépuisable."
        },

        // ── Âge 2 : Néolithique ──
        {
            id: "animal",
            name: "Traction animale",
            icon: "🐂",
            level: 2,
            output: 10,
            pollutionPerTurn: 1,  // Gt CO₂ — méthane
            buildCostPerTurn: 10,
            buildTime: 1,
            researchTime: 1,
            researchCostPerTurn: 5,
            fuelStock: null,
            renewable: true,
            requires: "wood", // Il faut avoir maîtrisé le feu
            zone: "enclosure",
            description: "La force musculaire des animaux pour les travaux lourds."
        },

        // ── Âge 3 : Antiquité ──
        {
            id: "watermill",
            name: "Moulin à eau",
            icon: "💧",
            level: 3,
            output: 35,
            pollutionPerTurn: 0,
            buildCostPerTurn: 25,
            buildTime: 2,
            researchTime: 2,
            researchCostPerTurn: 10,
            fuelStock: null,
            renewable: true,
            requires: "animal",
            zone: "river",
            description: "L'énergie hydraulique inépuisable des rivières."
        },

        // ── Âge 4 : Moyen Âge ──
        {
            id: "windmill",
            name: "Moulin à vent",
            icon: "🌬️",
            level: 4,
            output: 35,
            pollutionPerTurn: 0,
            buildCostPerTurn: 25,
            buildTime: 2,
            researchTime: 1,
            researchCostPerTurn: 12,
            fuelStock: null,
            renewable: true,
            weatherDependent: true, // Affecté par le vent
            weatherType: "wind",
            requires: "watermill",
            zone: "wind",
            description: "Capter la force du vent pour moudre le grain."
        },
        {
            id: "coal_mine",
            name: "Mine de charbon",
            icon: "⛏️",
            level: 4,
            output: 50, // Produit du charbon (énergie brute)
            pollutionPerTurn: 4,    // Gt CO₂ — ~1000 gCO₂/kWh
            buildCostPerTurn: 50,
            buildTime: 1,
            researchTime: 1,
            researchCostPerTurn: 25,
            fuelStock: 1500, // S'épuise
            renewable: false,
            requires: "watermill", // La mécanique aide à creuser
            zone: "mountain",
            description: "Extraction de combustible fossile riche en énergie."
        },

        // ── Âge 5 : Révolution Industrielle ──
        {
            id: "steam_engine",
            name: "Machine à vapeur",
            icon: "🚂",
            level: 5,
            output: 100,
            pollutionPerTurn: 10,    // Gt CO₂ — combustion charbon intensive
            buildCostPerTurn: 100,
            buildTime: 1,
            researchTime: 3,
            researchCostPerTurn: 50,
            fuelStock: 1500,
            renewable: false,
            requires: "coal_mine",
            zone: "mountain",
            upgradesFrom: "coal_mine",  // ⬆️ Upgrade de la mine
            description: "Convertit la chaleur du charbon en mouvement puissant."
        },
        {
            id: "coal_plant",
            name: "Centrale Thermique à Charbon",
            icon: "🏭",
            level: 5,
            output: 200,
            pollutionPerTurn: 25,    // Gt CO₂ — plus gros émetteur
            buildCostPerTurn: 200,
            buildTime: 1,
            researchTime: 3,
            researchCostPerTurn: 100,
            fuelStock: 1500,
            renewable: false,
            requires: "steam_engine",
            zone: "mountain",
            upgradesFrom: "steam_engine", // ⬆️ Upgrade de la machine à vapeur
            description: "Production massive d'électricité, mais pollution extrême."
        },
        {
            id: "dam",
            name: "Barrage Hydro",
            icon: "🌊",
            level: 5,
            output: 150,
            pollutionPerTurn: 0,
            buildCostPerTurn: 150,
            buildTime: 2,
            researchTime: 3,
            researchCostPerTurn: 75,
            fuelStock: null,
            renewable: true,
            requires: "watermill",
            zone: "river",
            upgradesFrom: "watermill",  // ⬆️ Upgrade du moulin à eau
            description: "Maîtrise totale des rivières pour l'électricité."
        },

        // ── Âge 6 : 20ème Siècle ──
        {
            id: "oil_rig",
            name: "Puits de Pétrole",
            icon: "🛢️",
            level: 6,
            output: 250,
            pollutionPerTurn: 30,    // Gt CO₂ — ~800 gCO₂/kWh
            buildCostPerTurn: 250,
            buildTime: 1,
            researchTime: 2,
            researchCostPerTurn: 125,
            fuelStock: 1000,
            renewable: false,
            requires: "coal_plant", // Technologie de forage/pompage
            zone: "oil_field",
            description: "L'or noir ! Énergie dense mais polluante et limitée."
        },
        {
            id: "nuclear",
            name: "Centrale Nucléaire",
            icon: "⚛️",
            level: 7,
            output: 750,
            pollutionPerTurn: 0,  // Gt CO₂ — cycle de vie seulement
            buildCostPerTurn: 750,
            buildTime: 4,
            researchTime: 3,
            researchCostPerTurn: 500,
            fuelStock: 10000, // Uranium
            renewable: false,
            requires: "oil_rig", // High-tech industriel
            zone: "uranium_soil",
            description: "Énergie colossale sans CO₂, mais déchets radioactifs."
        },
        {
            id: "wind_turbine",
            name: "Éolienne Moderne",
            icon: "🪁",
            level: 7,
            output: 150,
            pollutionPerTurn: 0,
            buildCostPerTurn: 100,
            buildTime: 1,
            researchTime: 2,
            researchCostPerTurn: 50,
            fuelStock: null,
            renewable: true,
            weatherDependent: true,
            weatherType: "wind",
            requires: "coal_plant",
            zone: "wind",
            upgradesFrom: "windmill",  // ⬆️ Upgrade du moulin à vent
            description: "Version moderne et efficace des moulins à vent."
        },
        {
            id: "solar",
            name: "Panneau Solaire",
            icon: "☀️",
            level: 7,
            output: 150,
            pollutionPerTurn: 0,
            buildCostPerTurn: 100,
            buildTime: 1,
            researchTime: 2,
            researchCostPerTurn: 50,
            fuelStock: null,
            renewable: true,
            weatherDependent: true,
            weatherType: "sun",
            requires: "coal_plant", // Nécessite industrie avancée (silicium)
            zone: "sun",
            description: "Capter directement la lumière de notre étoile."
        },

        // ── Âge 7 : 21ème Siècle ──
        {
            id: "battery",
            name: "Batterie Lithium",
            icon: "🔋",
            level: 8,
            output: 0,
            pollutionPerTurn: 0,  // Gt CO₂ — extraction lithium
            buildCostPerTurn: 150,
            buildTime: 1,
            researchTime: 2,
            researchCostPerTurn: 75,
            fuelStock: null,
            renewable: false,
            special: "storage", // Stocke l'énergie
            requires: "solar",
            zone: "plain",
            description: "Stocke les surplus pour compenser la météo (Enlève le Malus ENR)."
        },
        {
            id: "smartgrid",
            name: "Smart Grid",
            icon: "🔗",
            level: 8,
            output: 0,
            pollutionPerTurn: 0,
            buildCostPerTurn: 250,
            buildTime: 2,
            researchTime: 3,
            researchCostPerTurn: 125,
            fuelStock: null,
            renewable: true,
            special: "efficiency", // Boost production globale
            requires: "wind_turbine", // Gestion réseau complexe
            zone: "plain",
            description: "Une intelligence artificielle optimise tout le réseau (+20%)."
        },

        // ── Âge 8 : Le Futur ──
        {
            id: "fusion",
            name: "Fusion Nucléaire",
            icon: "🧬",
            level: 9,
            output: 2000,
            pollutionPerTurn: 0,
            buildCostPerTurn: 1000,
            buildTime: 4,
            researchTime: 10,
            researchCostPerTurn: 1250,
            fuelStock: null, // Deutérium "illimité"
            renewable: true,
            requires: "nuclear", // Le sommet de la tech
            zone: "plain",
            description: "Le feu du soleil sur Terre. Propre, inépuisable et surpuissant."
        }
    ],

    // Contenu Pédagogique (Leçon + Quiz)
    // 14 bâtiments
    quizzes: {
        "wood": {
            title: "Maîtrise du Feu 🔥",
            lesson: `
                <h3>La Découverte du Feu</h3>
                <p>Il y a 400 000 ans, la maîtrise du feu a changé la vie des humains.</p>
                <br>
                <p>Le feu apporte :</p>
                <ul>
                    <li>🔥 De la <strong>chaleur</strong> pour survivre au froid.</li>
                    <li>💡 De la <strong>lumière</strong> pour voir la nuit.</li>
                    <li>🍖 La <strong>cuisson</strong> des aliments (meilleure digestion).</li>
                    <li>🛡️ Une <strong>protection</strong> contre les bêtes sauvages.</li>
                </ul>
                <br>
                <p>C'est la première transformation d'énergie : l'énergie <strong>chimique</strong> du bois devient de l'énergie <strong>thermique</strong> et <strong>lumineuse</strong>.</p>
                <br>
                <p><strong>Chaîne d'énergie :</strong></p>
                <p><strong>Source</strong> : Bois (énergie chimique) → <strong>Transformation</strong> : Feu (Combustion) → <strong>Énergie utile</strong> : thermique et lumineuse</p>
                <br>

             `,
            questions: [
                {
                    question: "Quelle énergie libère le bois qui brûle ?",
                    options: ["Thermique et Lumineuse", "Nucléaire et Électrique", "Mécanique et Sonore"],
                    correct: 0,
                    explanation: "La combustion transforme l'énergie chimique du bois en chaleur (thermique) et lumière."
                },
                {
                    question: "Sous quelle forme l'énergie est-elle stockée dans le bois ?",
                    options: ["Énergie mécanique", "Énergie chimique", "Énergie électrique"],
                    correct: 1,
                    explanation: "Le bois stocke de l'énergie chimique qui se libère par combustion."
                },
                {
                    question: "À quoi ne servait PAS le feu aux hommes préhistoriques ?",
                    options: ["Cuire la viande", "S'éclairer", "Faire fonctionner des machines"],
                    correct: 2,
                    explanation: "Les machines n'existaient pas encore ! Le feu servait à la survie de base."
                },
            ]
        },
        "animal": {
            title: "Force Animale 🐂",
            lesson: `
                <h3>La Force Animale</h3>
                <br>
                <p>Au Néolithique, l'homme se sédentarise et domestique les animaux (bœufs, chevaux).</p>
                <br>
                <p>Un animal de trait fournit une <strong>énergie mécanique</strong> (musculaire) bien supérieure à celle de l'homme :</p>
                <ul>
                    <li>🚜 Pour tirer les charrues (agriculture).</li>
                    <li>📦 Pour transporter des charges lourdes.</li>
                    <li>⚙️ Pour actionner des mécanismes (norias).</li>
                </ul>
                <p>La force animale est une énergie <strong>renouvelable</strong> car les animaux se reproduisent et se nourrissent.</p>
                <br>
                <p><strong>Chaîne d'énergie :</strong></p>
                <p><strong>Source</strong> : Animaux (énergie chimique) → <strong>Transformation</strong> : Muscles (énergie mécanique) → <strong>Énergie utile</strong> : mouvement</p>
            `,
            questions: [
                {
                    question: "Quelle forme d'énergie fournit un bœuf qui tire une charrue ?",
                    options: ["Électrique", "Mécanique (musculaire)", "Thermique"],
                    correct: 1,
                    explanation: "Les muscles convertissent l'énergie chimique des aliments en mouvement (énergie mécanique)."
                },
                {
                    question: "Quel avantage apporte la traction animale ?",
                    options: ["Elle pollue beaucoup", "Elle permet de travailler plus fort et plus longtemps que l'homme", "Elle produit de l'électricité"],
                    correct: 1,
                    explanation: "Un bœuf ou un cheval est bien plus puissant qu'un humain pour les travaux agricoles."
                },
                {
                    question: "La traction animale est-elle une énergie renouvelable ?",
                    options: ["Non, les animaux s'épuisent", "Oui, car les animaux se reproduisent et se nourrissent", "Seulement en été"],
                    correct: 1,
                    explanation: "Tant qu'on nourrit les animaux, leur énergie musculaire est renouvelable."
                }
            ]
        },
        "watermill": {
            title: "Moulin à Eau 💧",
            lesson: `
                <h3>La Force de l'Eau</h3>
                <br>
                <p>Dès l'Antiquité, on utilise la force des rivières pour produire de l'énergie et effectuer des tâches lourdes.</p>
                <br>
                <p>L'eau en mouvement possède de l'énergie <strong>cinétique</strong>.</p>
                <br>
                <p>En frappant les pales d'une roue, elle crée un mouvement de rotation (énergie <strong>mécanique</strong>) qui permet de :</p>
                <ul>
                    <li>🥖 Moudre le grain pour faire de la farine.</li>
                    <li>🔨 Actionner des marteaux de forge.</li>
                    <li>🪚 Scier du bois.</li>
                </ul>
            `,
            questions: [
                {
                    question: "Quelle énergie utilise le moulin à eau ?",
                    options: ["L'énergie thermique de l'eau", "L'énergie cinétique du courant", "L'énergie chimique de l'eau"],
                    correct: 1,
                    explanation: "C'est le mouvement de l'eau (énergie cinétique) qui fait tourner la roue."
                },
                {
                    question: "L'énergie hydraulique est-elle renouvelable ?",
                    options: ["Oui, car le cycle de l'eau ramène la pluie", "Non, l'eau s'use", "Non, elle consomme trop d'eau"],
                    correct: 0,
                    explanation: "Grâce au soleil, l'eau s'évapore et retombe en pluie : c'est une source inépuisable."
                },
                {
                    question: "Quel mécanisme convertit le mouvement de l'eau en travail utile ?",
                    options: ["Un alternateur", "Une roue", "Une pompe"],
                    correct: 1,
                    explanation: "La roue à aubes (ou roue hydraulique) transforme le courant en rotation mécanique."
                }
            ]
        },
        "windmill": {
            title: "Moulin à Vent 🌬️",
            lesson: `
                <h3>Capturer l'énergie du vent</h3>
                <br>
                <p>Le moulin à vent apparaît plus tard (Moyen Âge en Europe). Il permet de moudre du grain ou pomper de l'eau là où il n'y a pas de rivière.</p>
                <br>
                <p><strong>Avantage :</strong> Le vent est gratuit et disponible partout (ou presque).</p>
                <br>
                <p><strong>Inconvénient :</strong> Il est <strong>intermittent</strong>, il ne souffle pas tout le temps. S'il n'y a pas de vent, il n'y a pas d'énergie !</p>
            `,
            questions: [
                {
                    question: "Quelle énergie le vent transporte-t-il ?",
                    options: ["Électrique", "Nucléaire", "Cinétique (mouvement de l'air)"],
                    correct: 2,
                    explanation: "Le vent est un déplacement d'air, donc de l'énergie cinétique."
                },
                {
                    question: "Que signifie 'intermittent' pour une source d'énergie ?",
                    options: ["Elle coûte cher", "Elle ne fonctionne pas en permanence", "Elle est dangereuse"],
                    correct: 1,
                    explanation: "Intermittent = la production dépend de conditions naturelles (vent, soleil) qui varient."
                },
                {
                    question: "Quel est le principal défaut du vent ?",
                    options: ["Il est trop cher", "Il est intermittent (pas toujours là)", "Il pollue"],
                    correct: 1,
                    explanation: "Le vent est gratuit et propre, mais il ne souffle pas toujours (intermittence)."
                },
            ]
        },
        "coal_mine": {
            title: "Le Charbon ⛏️",
            lesson: `
                <h3>Le charbon: une énergie fossile</h3>
                <br>
                <p>Le charbon est une roche noire formée par l'accumulation de forêts enfouies et fossilisées il y a 300 millions d'années.</p>
                <br>
                <p>C'est un combustible <strong>fossile</strong> :</p>
                <ul>
                    <li>🔥 Très riche en énergie (chaleur).</li>
                    <li>⏳ <strong>Non renouvelable</strong> : il met des millions d'années à se former.</li>
                    <li>📉 Le stock disponible sur Terre est limité.</li>
                    <li> 🌋 Très polluant.</li>
                </ul>
                <br>
                <p>Le charbon est utilisé pour :</p>
                <ul>
                    <li>🔥 Chauffer des maisons.</li>
                    <li>🔥 Faire chauffer de l'eau pour produire de la vapeur dans le cadre des centrales thermiques et machines à vapeur.</li>
                </ul>
                <div class="video-container" style="margin: 1rem 0;">
                    <iframe width="560" height="315" src="https://www.youtube.com/embed/LJ6ycSarzv4?si=A5_-uEYT2FqlfEpM" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
                    <p style="font-size: 0.8rem; text-align: center; margin-top: 0.5rem;">
                        <a href="https://www.youtube.com/watch?v=LJ6ycSarzv4" target="_blank" style="color: var(--color-energy); text-decoration: underline;">Voir la vidéo directement sur YouTube ↗️</a> (si le lecteur ne s'affiche pas)
                    </p>
                </div>  
            `,
            questions: [
                {
                    question: "D'où vient l'énergie du charbon ?",
                    options: ["Des volcans", "De forêts fossilisées", "Du centre de la Terre"],
                    correct: 1,
                    explanation: "Le charbon est une ressource fossile : des végétaux anciens transformés sous terre."
                },
                {
                    question: "Le charbon est-il inépuisable ?",
                    options: ["Oui", "Non, les stocks sont limités", "Ça dépend du prix"],
                    correct: 1,
                    explanation: "C'est une ressource finie. Une fois consommé, il n'y en a plus pour des millions d'années."
                },
                {
                    question: "Pourquoi dit-on que le charbon est 'fossile' ?",
                    options: ["Parce qu'il est très vieux", "Parce qu'il vient de la fossilisation de matière organique ancienne", "Parce qu'il sent mauvais"],
                    correct: 1,
                    explanation: "Fossile = formé par la transformation de matière vivante enfouie pendant des millions d'années."
                }
            ]
        },
        "steam_engine": {
            title: "Machine à Vapeur 🚂",
            lesson: `
                <h3>La Vapeur change le Monde</h3>
                <br>
                <p>Au 18ème siècle, James Watt perfectionne la machine à vapeur. C'est le début de la Révolution Industrielle.</p>
                <br>
                <div class="video-container" style="margin: 1rem 0;">
                    <iframe width="100%" height="315" src="https://www.youtube-nocookie.com/embed/fOP8cxLf1XE" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen style="border-radius: 8px; border: 1px solid var(--bg-card-hover);"></iframe>
                    <p style="font-size: 0.8rem; text-align: center; margin-top: 0.5rem;">
                        <a href="https://www.youtube.com/watch?v=fOP8cxLf1XE" target="_blank" style="color: var(--color-energy); text-decoration: underline;">Voir la vidéo directement sur YouTube ↗️</a> (si le lecteur ne s'affiche pas)
                    </p>
                </div>
                <br>
                <p><strong>Principe :</strong></p>
                <ol>
                    <li>On brûle du charbon (Chaleur).</li>
                    <li>On chauffe de l'eau pour faire de la vapeur sous pression.</li>
                    <li>La pression pousse un piston (Mouvement).</li>
                </ol>
                <br>
                <p>Cela permet de créer les trains, les usines, et les bateaux à vapeur.</p>
                <br>
                <p>Chaine d'énergie : charbon (chimique) → Combustion : chaleur (thermique) → piston (mécanique).</p>
                <br>
            `,
            questions: [
                {
                    question: "Que fait une machine à vapeur ?",
                    options: ["Elle crée de l'eau", "Elle convertit la chaleur en mouvement", "Elle brûle de l'eau"],
                    correct: 1,
                    explanation: "Elle transforme l'énergie thermique (chaleur) en énergie mécanique (mouvement)."
                },
                {
                    question: "Quel combustible utilise-t-elle principalement ?",
                    options: ["Du bois", "Du charbon", "Du vent"],
                    correct: 1,
                    explanation: "Le charbon permet d'obtenir des températures très élevées pour chauffer l'eau."
                },
                {
                    question: "Quelle est la chaîne d'énergie de la machine à vapeur ?",
                    options: ["Chimique → Thermique → Mécanique", "Électrique → Mécanique", "Nucléaire → Thermique"],
                    correct: 0,
                    explanation: "Charbon (chimique) → Combustion : chaleur (thermique) → piston (mécanique)."
                }
            ]
        },
        "coal_plant": {
            title: "Centrale Thermique à Charbon 🏭",
            lesson: `
                <h3>L'Électricité à grande échelle</h3>
                <br>
                <p>Pour alimenter les villes et les usines, on construit d'immenses centrales thermiques.</p>
                <br>
                <p>Elles fonctionnent comme une grosse machine à vapeur, mais le mouvement fait tourner un <strong>alternateur</strong> pour produire de l'électricité.</p>
                <br>
                <p><strong>Problème :</strong> En brûlant des tonnes de charbon, elles rejettent énormément de <strong>CO₂</strong>, responsable du réchauffement climatique et de pollution de l'air.</p>
            `,
            questions: [
                {
                    question: "Quel est le gros problème des centrales à charbon ?",
                    options: ["Elles rejettent beaucoup de CO₂", "Elles sont trop bruyantes", "Elles produisent trop peu"],
                    correct: 0,
                    explanation: "La combustion du charbon émet énormément de CO₂, un gaz à effet de serre."
                },
                {
                    question: "Quelle conversion d'énergie a lieu ?",
                    options: ["Chimique → Thermique → Mécanique → Électrique", "Chimique → Électrique", "Thermique → Chimique"],
                    correct: 0,
                    explanation: "Charbon (Chimique) → Vapeur (Thermique) → Turbine (Mécanique) → Alternateur (Électrique)."
                },
                {
                    question: "Quel composant transforme le mouvement en électricité ?",
                    options: ["La chaudière", "L'alternateur (Génératrice)", "Le condenseur"],
                    correct: 1,
                    explanation: "L'alternateur convertit l'énergie mécanique de rotation en courant électrique."
                }
            ]
        },
        "dam": {
            title: "Barrage Hydroélectrique 🌊",
            lesson: `
                <h3>L'hydroélectricité</h3>
                <p>À la fin du 19ème siècle, on apprend à produire de l'électricité avec l'eau : c'est l'hydroélectricité.</p>
                <p>Un barrage retient une grande quantité d'eau en hauteur et stock de l'énergie potentielle. En ouvrant les vannes :</p>
                <ul>
                    <li>L'eau chute avec force (Énergie potentielle → Cinétique).</li>
                    <li>Elle fait tourner une turbine géante.</li>
                    <li>La turbine entraîne l'alternateur.</li>
                </ul>
                <p>C'est une énergie renouvelable, stockable et pilotable !</p>
                <br>
                <div class="video-container" style="margin: 1rem 0;">
                    <iframe width="100%" height="315" src="https://www.youtube-nocookie.com/embed/EGk095p3hJs" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen style="border-radius: 8px; border: 1px solid var(--bg-card-hover);"></iframe>
                    <p style="font-size: 0.8rem; text-align: center; margin-top: 0.5rem;">
                        <a href="https://www.youtube.com/watch?v=EGk095p3hJs" target="_blank" style="color: var(--color-energy); text-decoration: underline;">Voir la vidéo directement sur YouTube ↗️</a> (si le lecteur ne s'affiche pas)
                    </p>
                </div>
            `,
            questions: [
                {
                    question: "Comment un barrage stocke-t-il de l'énergie ?",
                    options: ["Dans des batteries", "En retenant de l'eau en hauteur", "En chauffant l'eau"],
                    correct: 1,
                    explanation: "L'eau stockée en hauteur possède de l'énergie potentielle de pesanteur."
                },
                {
                    question: "Peut-on produire de l'électricité à la demande avec un barrage ?",
                    options: ["Non, c'est comme le vent", "Oui, il suffit d'ouvrir les vannes", "Seulement s'il pleut"],
                    correct: 1,
                    explanation: "Oui ! Contrairement à l'éolien, on choisit quand on utilise l'eau du réservoir."
                },
                {
                    question: "Quelle énergie l'eau stockée en hauteur possède-t-elle ?",
                    options: ["Énergie cinétique", "Énergie potentielle de pesanteur", "Énergie thermique"],
                    correct: 1,
                    explanation: "Plus l'eau est haute, plus elle possède d'énergie potentielle convertible en mouvement."
                }
            ]
        },
        "oil_rig": {
            title: "Le Pétrole 🛢️",
            lesson: `
                <h3>L'Or Noir</h3>
                <p>Au 20ème siècle, le pétrole devient l'énergie reine. Liquide, il est facile à transporter, stocket et contient enormement d'énergie.</p>
                <p>Il est formé à partir de micro-organismes marins morts il y a des millions d'années.</p>
                <p>Il permet :</p>
                <ul>
                    <li>De faire rouler les voitures (essence/diesel).</li>
                    <li>De faire voler les avions (kérosène).</li>
                    <li>De fabriquer du plastique.</li>
                </ul>
                <p>Mais comme le charbon, il est épuisable et polluant (CO₂).</p>
            `,
            questions: [
                {
                    question: "Pourquoi le pétrole a-t-il remplacé le charbon pour les transports ?",
                    options: ["Il est moins cher", "Il est liquide et plus facile à stocker dans un réservoir", "Il sent meilleur"],
                    correct: 1,
                    explanation: "Sa forme liquide permet de remplir facilement les réservoirs des voitures et avions."
                },
                {
                    question: "Le pétrole est-il une énergie propre ?",
                    options: ["Oui, il est très peu polluant", "Non, sa combustion rejette du CO₂ et des polluants", "Oui, c'est naturel"],
                    correct: 1,
                    explanation: "Comme toute énergie fossile, brûler du pétrole libère beaucoup de gaz à effet de serre."
                },
                {
                    question: "De quoi est composé le pétrole à l'origine ?",
                    options: ["De roches volcaniques", "De micro-organismes marins fossilisés", "De charbon liquéfié"],
                    correct: 1,
                    explanation: "Le pétrole provient de la transformation de plancton et micro-organismes marins enfouis."
                }
            ]
        },
        "nuclear": {
            title: "Le Nucléaire ⚛️",
            lesson: `
                <h3>L'Énergie de l'Atome</h3>
                <br>
                <p>En cassant des atomes d'uranium (fission), on libère une chaleur immense. C'est le principe des centrales nucléaires.</p>
                <p>👍 <strong>Avantages :</strong> Produit énormément d'électricité sans rejeter de CO₂.</p>
                <p>👎 <strong>Inconvénients :</strong> Produit des déchets radioactifs dangereux pendant des milliers d'années et présente un risque d'accident grave.</p>
                <br>
                <div class="video-container" style="margin: 1rem 0;">
                    <iframe width="100%" height="315" src="https://www.youtube.com/embed/oNsVUW7m1gE?si=SFIWLi9Cj_pxX9xf" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen style="border-radius: 8px; border: 1px solid var(--bg-card-hover);"></iframe>
                    <p style="font-size: 0.8rem; text-align: center; margin-top: 0.5rem;">
                        <a href="https://www.youtube.com/watch?v=oNsVUW7m1gE" target="_blank" style="color: var(--color-energy); text-decoration: underline;">Voir la vidéo directement sur YouTube ↗️</a> (si le lecteur ne s'affiche pas)
                    </p>
                </div>
            `,
            questions: [
                {
                    question: "Quel métal radioactif est utilisé comme \"combustible\" ?",
                    options: ["Le Fer", "L'Uranium", "Le Charbon"],
                    correct: 1,
                    explanation: "La fission des atomes d'Uranium libère une chaleur colossale."
                },
                {
                    question: "La centrale nucléaire rejette-t-elle du CO₂ ?",
                    options: ["Oui, beaucoup", "Non", "Seulement la nuit"],
                    correct: 1,
                    explanation: "Elle n'utilise pas de combustion, donc n'émet pas de CO₂ en fonctionnement."
                },
                {
                    question: "A quoi sert le système de refroidissement ?",
                    options: ["Refroidir les déchets radioactifs", "Refroidir le réacteur", "Refroidir les turbines"],
                    correct: 1,
                    explanation: "Le réacteur produit une chaleur intense qui doit être évacuée pour éviter la surchauffe."
                }
            ]
        },
        "wind_turbine": {
            title: "Éolienne Moderne 🪁",
            lesson: `
                <h3>Le Retour du Vent</h3>
                <br>
                <p>Face au réchauffement climatique, on redécouvre le vent. Les éoliennes modernes sont des moulins high-tech.</p>
                <p>Elles transforment l'énergie cinétique du vent en électricité propre.</p>
                <p>Cependant, le vent ne souffle pas toujours : c'est une énergie <strong>intermittente</strong>. Il faut d'autres sources pour compenser quand il n'y a pas de vent.</p>
                <p>Afin de maximiser la production d'électricité, les éoliennes sont installées en hauteur ou en mer, là où le vent souffle plus fort et plus régulièrement.</p>
                <div class="video-container" style="margin: 1rem 0;">
                    <iframe width="560" height="315" src="https://www.youtube.com/embed/7SMu4i7hy0Q?si=IU6Dm4Iu7nIhywib" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
                    <p style="font-size: 0.8rem; text-align: center; margin-top: 0.5rem;">
                        <a href="https://www.youtube.com/watch?v=7SMu4i7hy0Q" target="_blank" style="color: var(--color-energy); text-decoration: underline;">Voir la vidéo directement sur YouTube ↗️</a> (si le lecteur ne s'affiche pas)
                    </p>
                </div>  
            `,
            questions: [
                {
                    question: "Que produit l'alternateur dans une éolienne ?",
                    options: ["Du vent", "De la chaleur", "De l'électricité"],
                    correct: 2,
                    explanation: "Le mouvement des pales entraîne l'alternateur qui génère le courant."
                },
                {
                    question: "Que se passe-t-il s'il n'y a pas de vent ?",
                    options: ["L'éolienne ne produit rien", "Elle utilise une batterie interne", "Elle produit son propre vent"],
                    correct: 0,
                    explanation: "Pas de vent = pas de production. C'est l'intermittence."
                },
                {
                    question: "Pourquoi place-t-on les éoliennes en hauteur ou en mer ?",
                    options: ["Pour décorer le paysage", "Parce que le vent y est plus fort et régulier", "Pour éviter les oiseaux"],
                    correct: 1,
                    explanation: "En altitude ou en mer, le vent est moins gêné par les obstacles et plus constant."
                }
            ]
        },
        "solar": {
            title: "Énergie Solaire ☀️",
            lesson: `
                <h3>Lumière en Électricité</h3>
                <br>
                <p>Le soleil nous envoie une énergie colossale chaque jour. Les panneaux photovoltaïques la captent.</p>
                <p>C'est propre et inépuisable, mais cela ne fonctionne que le jour et dépend des nuages.</p>
                <br>
                <div class="video-container" style="margin: 1rem 0;">
                    <iframe width="560" height="315" src="https://www.youtube.com/embed/7BUjVyw5LaM?si=j3bSl4uIBGdGBOuq" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
                    <p style="font-size: 0.8rem; text-align: center; margin-top: 0.5rem;">
                        <a href="https://www.youtube.com/watch?v=7BUjVyw5LaM" target="_blank" style="color: var(--color-energy); text-decoration: underline;">Voir la vidéo directement sur YouTube ↗️</a> (si le lecteur ne s'affiche pas)
                    </p>
                </div>  
            `,
            questions: [
                {
                    question: "Quelle énergie du soleil le panneau photovoltaïque utilise-t-il ?",
                    options: ["La chaleur", "La lumière", "La gravité"],
                    correct: 1,
                    explanation: "Les cellules photovoltaïques convertissent directement la lumière (photons) en électrons."
                },
                {
                    question: "Le panneau solaire produit-il la nuit ?",
                    options: ["Oui, avec la lune", "Non", "Oui, s'il fait chaud"],
                    correct: 1,
                    explanation: "Sans lumière du soleil, la production tombe à zéro."
                },
                {
                    question: "De quel matériau sont faites les cellules photovoltaïques ?",
                    options: ["Du cuivre", "Du silicium", "Du plastique"],
                    correct: 1,
                    explanation: "Le silicium (issu du sable) est un semi-conducteur qui réagit aux photons de lumière."
                }
            ]
        },
        "battery": {
            title: "Stockage Batterie 🔋",
            lesson: `
                <h3>Stocker pour Réguler</h3>
                <br>
                <p>Comme le vent et le soleil ne sont pas toujours là, il faut stocker l'électricité quand il y en a trop.</p>
                <p>Les batteries géantes (au Lithium) permettent de garder l'énergie produite quand il y en a beaucoup (solaire) pour l'utiliser quand il n'y en a pas.</p>
                <p>C'est indispensable pour un monde 100% renouvelable !</p>
                <div class="video-container" style="margin: 1rem 0;">
                    <iframe width="560" height="315" src="https://www.youtube.com/embed/EDRDrT8zSHA?si=009NDHLb_RPR9slC" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
                    <p style="font-size: 0.8rem; text-align: center; margin-top: 0.5rem;">
                        <a href="https://www.youtube.com/watch?v=EDRDrT8zSHA" target="_blank" style="color: var(--color-energy); text-decoration: underline;">Voir la vidéo directement sur YouTube ↗️</a> (si le lecteur ne s'affiche pas)
                    </p>
                </div>  
            `,
            questions: [
                {
                    question: "A quoi sert une batterie géante sur le réseau ?",
                    options: ["À polluer moins", "À stocker les énergies intermittentes", "À compenser le manque de charbon"],
                    correct: 1,
                    explanation: "Elle lisse la production : elle stocke les surplus et les restitue en cas de manque."
                },
                {
                    question: "Quelle est la limite actuelle des batteries ?",
                    options: ["Elles sont trop légères", "Elles coûtent cher et nécessitent des métaux rares", "Elles sont éternelles"],
                    correct: 1,
                    explanation: "Le Lithium et le Cobalt sont coûteux à extraire et difficiles à recycler."
                },
                {
                    question: "Comment la batterie produit-elle de l'électricité ?",
                    options: ["Par la chaleur", "Par la lumière", "Grace au mouvement des électrons entre les deux électrodes"],
                    correct: 2,
                    explanation: "Les électrons circulent d'une électrode (Anode) à l'autre (Cathode), créant un courant électrique."
                }
            ]
        },
        "smartgrid": {
            title: "Smart Grid 🔗",
            lesson: `
                <h3>Le Réseau Intelligent</h3>
                <br>
                <p>Le réseau électrique de demain (Smart Grid) utilise l'informatique et l'IA pour optimiser la production et la consommation d'électricité.</p>
                <ul>
                    <li>Il anticipe la météo pour prévoir la production solaire/éolienne.</li>
                    <li>Il demande aux usines de consommer moins quand il y a peu d'électricité.</li>
                    <li>Il intègre des millions de petits producteurs (maisons avec panneaux solaires).</li>
                </ul>
                <p>C'est le cerveau du système énergétique !</p>
            `,
            questions: [
                {
                    question: "Qu'est-ce qu'un 'Smart Grid' ?",
                    options: ["Un câble magique", "Un réseau électrique piloté par informatique", "Une centrale secrète"],
                    correct: 1,
                    explanation: "C'est l'alliance de l'électricité et du numérique pour optimiser les flux."
                },
                {
                    question: "Quel est le but principal du Smart Grid ?",
                    options: ["Équilibrer la production et la consommation intelligemment", "Produire plus de charbon", "Couper l'électricité"],
                    correct: 0,
                    explanation: "Il assure que l'électricité produite est utilisée au bon moment et au bon endroit."
                },
                {
                    question: "Comment le Smart Grid anticipe-t-il les variations de production ?",
                    options: ["En brûlant du charbon", "En utilisant les prévisions météo et l'IA", "En coupant le courant"],
                    correct: 1,
                    explanation: "Il analyse les données météo pour prévoir la production solaire/éolienne et ajuster la demande."
                }
            ]
        }
    }
};
