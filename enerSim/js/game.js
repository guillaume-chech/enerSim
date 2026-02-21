/**
 * EnerSim - Moteur de jeu
 * Gestion des tours, recherche, météo, stocks fossiles
 */

class Game {
    constructor() {
        this.reset();
    }

    reset() {
        this.currentLevel = 0; // 0 = Préhistoire (Index des levels dans data.js est 0-6)
        this.currentTurn = 1;

        // Flux (calculés chaque tour)
        this.energyProduction = 0;
        this.constructionCost = 0;
        this.turnBalance = 0;      // Gain/perte net de ce tour
        this.energyStock = 5;      // Accumulation (Objectif d'âge)
        this.pollutionPerTurn = 0; // Émissions CO₂ ce tour (Gt/tour)
        this.pollution = 0;        // CO₂ cumulé (Gt) — Game Over si >= budget

        // Installations: { sourceId, cellIndex, turnsUntilReady, fuelStock }
        this.installations = [];

        // Technologies et Recherche
        this.unlockedSources = []; // Le feu doit être recherché (V3)
        this.currentResearch = null; // { sourceId, turnsLeft, totalTurns }

        // Météo Aléatoire (Indicateurs au lieu de saisons)
        this.currentWeather = {
            windIndex: 2, // Moyen par défaut
            sunIndex: 2   // Moyen par défaut
        };

        // Score
        this.totalTurns = 0;
        this.totalEnergySpent = 0;

        // États de fin
        this.gameOver = false;
        this.victory = false;
        this.gameWon = false; // Pour éviter le spam de victoire

        // Quiz (temporaire pour un quiz en cours)
        this.quizState = {
            currentQuestion: 0,
            correctAnswers: 0,
            targetSourceId: null
        };

        // Pénalité quiz (coût supplémentaire en flux/tour)
        this.quizPenaltyCost = 0;

        // Anti-exploit : mémoriser le stock de combustible des bâtiments détruits
        // Clé: `${cellIndex}_${sourceId}`, Valeur: stock restant
        this.destroyedFuelStocks = {};

        this.recalculateFlows();
    }

    // ==========================================
    // RECHERCHE & ARBRE TECH
    // ==========================================

    /**
     * Retourne les technologies disponibles à la recherche
     * Conditions :
     * 1. Niveau suffisant (source.level <= currentLevel + 1) -> On permet de voir 1 âge d'avance ? Non, restons à l'âge courant.
     * 2. Pas déjà débloqué
     * 3. Prérequis (requires) débloqué ET construit au moins une fois ?
     *    -> Le brief disait "prérequis technologique". Simplification : prérequis débloqué suffit ?
     *    -> Non, le user a dit "prerequis de batiment construit au prealable".
     */
    getAvailableResearch() {
        // On regarde jusqu'au niveau actuel + 1 (pour teaser ?) Non, restons strict
        // Le niveau est stocké en index 0..6, data.js level est 1..7
        const currentAge = this.currentLevel + 1;

        return GAME_DATA.sources.filter(source => {
            // Déjà débloqué ?
            if (this.unlockedSources.includes(source.id)) return false;

            // Niveau suffisant ?
            if (source.level > currentAge) return false;

            // Prérequis technologique ?
            if (source.requires) {
                // Le prérequis doit être DÉBLOQUÉ
                if (!this.unlockedSources.includes(source.requires)) return false;
            }

            return true;
        });
    }

    startResearch(sourceId) {
        if (this.currentResearch) return false;

        const source = GAME_DATA.sources.find(s => s.id === sourceId);
        if (!source) return false;

        // Si la recherche prend 0 tour (ex: Feu), elle est débloquée instantanément
        if (source.researchTime === 0) {
            this.unlockedSources.push(source.id);
            return "instant"; // Signal pour l'UI
        }

        this.currentResearch = {
            sourceId: source.id,
            turnsLeft: source.researchTime,
            totalTurns: source.researchTime
        };

        this.recalculateFlows();
        return true;
    }

    isResearching() {
        return this.currentResearch !== null;
    }

    // ==========================================
    // GESTION MÉTÉO ALÉATOIRE
    // ==========================================

    getCurrentWeather() {
        return {
            wind: GAME_DATA.weather.wind[this.currentWeather.windIndex],
            sun: GAME_DATA.weather.sun[this.currentWeather.sunIndex]
        };
    }

    updateWeather() {
        // Tire au sort l'intensité du vent et du soleil (0 à 3)
        // 0: Aucun, 1: Faible, 2: Moyen, 3: Fort
        this.currentWeather.windIndex = Math.floor(Math.random() * 4);
        this.currentWeather.sunIndex = Math.floor(Math.random() * 4);
    }

    // ==========================================
    // CONSTRUCTION & GESTION INSTALLATIONS
    // ==========================================

    canBuild(sourceId, cellIndex) {
        // Vérifier si débloqué
        if (!this.unlockedSources.includes(sourceId)) return false;

        const source = GAME_DATA.sources.find(s => s.id === sourceId);
        const existing = this.installations.find(i => i.cellIndex === cellIndex);

        // Upgrade logic : la techno doit être construite SUR le bâtiment prérequis
        if (source.upgradesFrom) {
            if (!existing || existing.sourceId !== source.upgradesFrom) return false;
            // Vérifier que le bâtiment prérequis est terminé (pas en construction)
            if (existing.turnsUntilReady > 0) return false;
        } else {
            // Construction normale : la case doit être vide
            if (existing) return false;
        }

        // Vérifier coût : le FLUX d'énergie (turnBalance) doit être suffisant pour absorber le coût de construction.
        // Déficit non autorisé.
        if (source.buildCostPerTurn > 0) {
            if (this.turnBalance < source.buildCostPerTurn) return false;
        }

        return true;
    }

    /**
     * Vérifie si le joueur est en faillite énergétique (plus de stock et flux négatif)
     */
    isEnergyBankrupt() {
        return this.energyStock <= 0 && this.turnBalance < 0;
    }

    buildInstallation(sourceId, cellIndex) {
        if (!this.canBuild(sourceId, cellIndex)) return false;

        const source = GAME_DATA.sources.find(s => s.id === sourceId);
        const existing = this.installations.find(i => i.cellIndex === cellIndex);

        let fuelStock = source.fuelStock;

        // Upgrade : hériter du stock de combustible
        if (source.upgradesFrom && existing) {
            if (existing.fuelStock !== null) {
                fuelStock = existing.fuelStock; // Stock hérité du prédécesseur
            }
            // Retirer l'ancien bâtiment
            this.installations = this.installations.filter(i => i.cellIndex !== cellIndex);
        }

        // Anti-exploit : si on reconstruit sur la même case,
        // on récupère le stock épuisé (pas de reset gratuit)
        if (fuelStock !== null) {
            if (this.destroyedFuelStocks[cellIndex] !== undefined) {
                fuelStock = this.destroyedFuelStocks[cellIndex];
                delete this.destroyedFuelStocks[cellIndex]; // Consommé
            }
        }

        this.installations.push({
            sourceId,
            cellIndex,
            turnsUntilReady: source.buildTime,
            fuelStock: fuelStock
        });

        this.recalculateFlows();
        return true;
    }

    destroyInstallation(cellIndex) {
        const index = this.installations.findIndex(i => i.cellIndex === cellIndex);
        if (index === -1) return false;

        const inst = this.installations[index];

        // Impossible de détruire une source épuisée, la marque est définitive
        if (inst.fuelStock !== null && inst.fuelStock <= 0) {
            return false;
        }
        // Sauvegarder le stock restant pour empêcher le reset par destroy/rebuild
        if (inst.fuelStock !== null) {
            this.destroyedFuelStocks[cellIndex] = inst.fuelStock;
        }

        this.installations.splice(index, 1);
        this.recalculateFlows();
        return true;
    }

    getInstallationAtCell(cellIndex) {
        return this.installations.find(i => i.cellIndex === cellIndex);
    }

    // ==========================================
    // MOTEUR DE FLUX (Cœur du jeu)
    // ==========================================

    recalculateFlows() {
        let totalProduction = GAME_DATA.config.villageBaseProduction;
        let totalPollution = 0;
        let totalConstructionCost = 0;

        const weather = this.getCurrentWeather();
        let globalEfficiency = 1.0;
        let hasBattery = false;

        // 1. Vérifier bonus globaux (Smart Grid) et Batterie
        this.installations.forEach(inst => {
            if (inst.turnsUntilReady === 0) {
                const source = GAME_DATA.sources.find(s => s.id === inst.sourceId);
                if (source.special === 'efficiency') {
                    globalEfficiency += 0.2; // +20%
                }
                if (source.special === 'storage') {
                    hasBattery = true; // Batterie présente et active
                }
            }
        });

        // 2. Calculer production et coûts
        this.installations.forEach(inst => {
            const source = GAME_DATA.sources.find(s => s.id === inst.sourceId);

            if (inst.turnsUntilReady > 0) {
                // En construction
                totalConstructionCost += source.buildCostPerTurn;
            } else {
                // Actif : production dépend des stocks et météo

                // Vérifier Stock Fossile
                if (inst.fuelStock !== null && inst.fuelStock <= 0) {
                    // Épuisé ! Pas de prod, pas de pollution
                    return;
                }

                // Calcul Production de base
                let prod = source.output;

                // Modificateur Météo Aléatoire & Batterie
                if (source.weatherDependent) {
                    let weatherMod = 1.0;
                    if (source.weatherType === 'sun') weatherMod = weather.sun.multiplier;
                    if (source.weatherType === 'wind') weatherMod = weather.wind.multiplier;

                    // EFFET BATTERIE : Lissage (Empêche la prod de tomber bas)
                    if (hasBattery && weatherMod < 1.0) {
                        weatherMod = 1.0; // La batterie compense les jours sans vent/soleil
                    }

                    prod *= weatherMod;
                }

                // Appliquer efficacité globale (Smart Grid)
                if (source.output > 0) { // Ne pas booster les bâtiments passifs
                    prod *= globalEfficiency;
                }

                totalProduction += Math.floor(prod);
                totalPollution += source.pollutionPerTurn;
            }
        });

        // 3. Coût de la Recherche en cours
        let researchCost = 0;
        if (this.currentResearch) {
            researchCost = 0; // La recherche est désormais gratuite
        }

        // 4. Pénalité quiz (mauvaises réponses = coût supplémentaire/tour)
        const quizCost = this.quizPenaltyCost || 0;

        this.energyProduction = totalProduction;
        this.constructionCost = totalConstructionCost;
        this.researchCost = researchCost + quizCost;
        this.pollutionPerTurn = totalPollution;
        this.turnBalance = totalProduction - totalConstructionCost - researchCost - quizCost;
        return this.turnBalance;
    }

    /**
     * Calcule le mix énergétique actuel (Production renouvelable vs fossile)
     */
    calculateMix() {
        let totalProduction = 0;
        let renewables = 0;
        let fossiles = 0;

        const weather = this.getCurrentWeather();
        let globalEfficiency = 1.0;
        let hasBattery = false;

        this.installations.forEach(inst => {
            if (inst.turnsUntilReady === 0) {
                const source = GAME_DATA.sources.find(s => s.id === inst.sourceId);
                if (source && source.special === 'efficiency') globalEfficiency += 0.2;
                if (source && source.special === 'storage') hasBattery = true;
            }
        });

        this.installations.forEach(inst => {
            const source = GAME_DATA.sources.find(s => s.id === inst.sourceId);
            if (!source || inst.turnsUntilReady > 0) return;

            // Vérifier Stock Fossile
            if (inst.fuelStock !== null && inst.fuelStock <= 0) return;

            let prod = source.output;
            if (source.weatherDependent) {
                let weatherMod = 1.0;
                if (source.weatherType === 'sun') weatherMod = weather.sun.multiplier;
                if (source.weatherType === 'wind') weatherMod = weather.wind.multiplier;

                if (hasBattery && weatherMod < 1.0) weatherMod = 1.0; // Lissage Batterie
                prod *= weatherMod;
            }
            if (source.output > 0) prod *= globalEfficiency;

            prod = Math.floor(prod);
            totalProduction += prod;

            if (source.renewable) {
                renewables += prod;
            } else {
                fossiles += prod;
            }
        });

        return {
            totalProduction,
            renewables,
            fossiles,
            renewableRatio: totalProduction > 0 ? (renewables / totalProduction) : 0
        };
    }

    processTurn() {
        // 0. Appliquer les flux du tour qui vient de s'écouler AVANT de mettre à jour l'état
        this.energyStock += this.turnBalance;
        if (this.energyStock < 0) this.energyStock = 0;

        // Cumul de l'énergie dépensée (Sobriété) et de la pollution
        this.totalEnergySpent += this.constructionCost + this.researchCost;
        this.pollution += this.pollutionPerTurn;

        // 1. Avancer les chantiers (uniquement si énergie disponible)
        let newlyCompleted = [];
        const hasEnergy = this.energyStock > 0 || this.turnBalance >= 0;

        this.installations.forEach(inst => {
            if (inst.turnsUntilReady > 0) {
                if (hasEnergy) {
                    inst.turnsUntilReady--;
                    if (inst.turnsUntilReady === 0) {
                        newlyCompleted.push(inst);
                    }
                }
            } else {
                const source = GAME_DATA.sources.find(s => s.id === inst.sourceId);
                // 2. Consommer les stocks (seulement si actif et si stock > 0)
                if (inst.fuelStock !== null && inst.fuelStock > 0) {
                    inst.fuelStock -= source.output;
                    if (inst.fuelStock < 0) inst.fuelStock = 0;
                }
                // 3. Régénération biomasse (ressources renouvelables avec regenRate)
                if (source.regenRate && inst.fuelStock !== null && source.fuelStock !== null) {
                    inst.fuelStock = Math.min(inst.fuelStock + source.regenRate, source.fuelStock);
                }
            }
        });

        // 3. Avancer la Recherche
        let researchCompleted = null;
        if (this.currentResearch) {
            this.currentResearch.turnsLeft--;
            if (this.currentResearch.turnsLeft <= 0) {
                this.unlockedSources.push(this.currentResearch.sourceId);
                researchCompleted = this.currentResearch.sourceId;
                this.currentResearch = null;
                this.quizPenaltyCost = 0; // Reset pénalité quiz à la fin de la recherche
            }
        }

        // 4. Mettre à jour Météo Aléatoire
        this.currentTurn++;
        this.totalTurns++;
        this.updateWeather();

        // 5. Recalculer les flux du NOUVEAU tour
        this.recalculateFlows();

        // 6. Vérifier Avancement d'âge automatique
        let ageAdvanced = false;
        if (this.canAdvanceAge()) {
            ageAdvanced = true;
        }

        // 8. Vérifier Game Over (budget carbone dépassé)
        if (this.pollution >= GAME_DATA.config.co2BudgetMax) {
            this.gameOver = true;
        }

        return {
            newlyCompleted,
            researchCompleted,
            ageAdvanced,
            weather: this.getCurrentWeather(),
            gameOver: this.gameOver,
            victory: this.victory
        };
    }

    // ==========================================
    // PROGRESSION ET SCORE
    // ==========================================

    canAdvanceAge() {
        if (this.currentLevel >= GAME_DATA.levels.length - 1) return false;
        const nextLevelData = GAME_DATA.levels[this.currentLevel + 1];
        // L'avancement d'âge est basé sur le FLUX (production nette/tour), pas le stock accumulé
        return this.turnBalance >= nextLevelData.ageThreshold;
    }

    advanceAge() {
        if (this.canAdvanceAge()) {
            this.currentLevel++;
            return true;
        }
        return false;
    }

    getCurrentLevel() {
        return GAME_DATA.levels[this.currentLevel];
    }

    getNextLevel() {
        if (this.currentLevel >= GAME_DATA.levels.length - 1) return null;
        return GAME_DATA.levels[this.currentLevel + 1];
    }

    /**
     * Retourne toutes les sources débloquées ET valides pour l'âge en cours
     * (Utile pour savoir ce qu'on peut construire)
     */
    getConstructibleSources() {
        return GAME_DATA.sources.filter(s => this.unlockedSources.includes(s.id));
    }

    getUnlockedSources() {
        // Retourne les objets sources complets
        return GAME_DATA.sources.filter(s => this.unlockedSources.includes(s.id));
    }

    calculateScore() {
        const mix = this.calculateMix();

        // Nouvelle formule : 
        // Points de base = Seuil d'énergie de l'âge atteint
        const level = GAME_DATA.levels[this.currentLevel];
        const baseScore = level.ageThreshold;

        // Malus : -0.5 par Gt de CO2 et -0.1 par unité d'énergie dépensée
        const pollutionPenalty = Math.floor(this.pollution * 0.5);
        const sobrietyPenalty = Math.floor((this.totalEnergySpent || 0) * 0.1);

        let total = Math.floor(baseScore - sobrietyPenalty - pollutionPenalty);
        if (total < 0) total = 0; // Pas de score négatif

        // Si Game Over atteint (défaite par pollution), on applique un diviseur drastique
        if (this.gameOver && !this.victory) {
            total = Math.floor(total * 0.2);
        }

        // Ratings simplifiés
        let rating = ":(";
        let message = "Pas Super";
        if (total >= 700) { rating = "🌟"; message = "Excellent"; }
        else if (total >= 500) { rating = "🏆"; message = "Super"; }
        else if (total >= 300) { rating = "🚀"; message = "Très bien"; }
        else if (total >= 100) { rating = "👍"; message = "Bien"; }

        const renewablePercent = mix.totalProduction > 0
            ? ((mix.renewables / mix.totalProduction) * 100).toFixed(0)
            : 0;

        return {
            total,
            turns: this.totalTurns,
            production: mix.totalProduction,
            baseScore: baseScore,
            pollution: this.pollution.toFixed(1),
            pollutionPenalty: pollutionPenalty,
            sobrietyValue: (this.totalEnergySpent || 0),
            sobrietyPenalty: sobrietyPenalty,
            age: this.currentLevel + 1,
            ageName: level.name,
            renewablePercent: renewablePercent,
            rating,
            message
        };
    }
    // ==========================================
    // QUIZ (Intermédiaire Recherche)
    // ==========================================

    startQuiz(sourceId) {
        this.quizState = {
            currentQuestion: 0,
            correctAnswers: 0,
            targetSourceId: sourceId
        };
    }

    checkQuizAnswer(questionIndex, answerIndex) {
        const quiz = GAME_DATA.quizzes[this.quizState.targetSourceId];
        if (!quiz) return false;

        const question = quiz.questions[questionIndex];
        const isCorrect = (question.correct === answerIndex);

        return isCorrect;
    }

    getQuizForSource(sourceId) {
        return GAME_DATA.quizzes[sourceId];
    }
}

// Démarrer (auto ou via UI ?)
// Pour l'instant on instancie pour que UI puisse s'y accrocher (après chargement scripts)
window.game = new Game();
