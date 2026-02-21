/**
 * EnerSim - Gestion de l'Interface
 * Gère le DOM, les événements et l'affichage
 */

const UI = {
    elements: {},

    init() {
        console.log('UI Init...');
        try {
            this.cacheElements();
            console.log('Elements cached');
            this.bindEvents();
            console.log('Events bound');

            // Afficher la modale de règles au démarrage
            this.showRulesModal();

            // Initialiser l'affichage
            this.updateWeatherDisplay();
            this.updateGameUI();

            console.log('Creating grid...');
            this.createGrid();
            console.log('Grid created');
        } catch (e) {
            console.error("UI Init Failed:", e);
            alert("Erreur initialisation jeu: " + e.message);
        }
    },

    cacheElements() {
        this.elements = {
            // Écrans
            screens: {
                home: document.getElementById('screen-home'),
                game: document.getElementById('screen-game'),
                quiz: document.getElementById('screen-quiz'),
                learn: document.getElementById('screen-learn'),
                levelComplete: document.getElementById('screen-level-complete'),
                gameOver: document.getElementById('screen-game-over')
            },
            // Boutons
            buttons: {
                start: document.getElementById('btn-start'),
                menu: document.getElementById('btn-menu'),
                research: null, // Removed — panel is always visible now
                endTurn: document.getElementById('btn-end-turn'),
                finishGame: document.getElementById('btn-finish-game'), // Bouton Fin de partie manuel
                nextLevel: document.getElementById('btn-next-level'),
                startQuiz: document.getElementById('btn-start-quiz'),
                restart: document.getElementById('btn-restart'),
                closeResearch: null, // Removed — panel is always visible
                closeBuild: document.querySelector('#build-modal .close-modal'),
                closeRules: document.querySelector('#rules-modal .close-modal'),
                rulesOk: document.getElementById('btn-rules-ok'),
                confirmOk: document.getElementById('btn-confirm-ok'),
                confirmCancel: document.getElementById('btn-confirm-cancel')
            },
            // Jeu
            game: {
                map: document.getElementById('map-grid'),
                epochIcon: document.getElementById('game-epoch-icon'),
                epochName: document.getElementById('game-epoch-name'),
                turn: document.getElementById('current-turn'),
                weatherDisplay: document.getElementById('weather-display'),
                sunIcon: document.getElementById('sun-icon'),
                sunName: document.getElementById('sun-name'),
                windIcon: document.getElementById('wind-icon'),
                windName: document.getElementById('wind-name'),
                researchBadge: document.getElementById('research-badge')
            },
            // Jauges
            gauges: {
                energyFill: document.getElementById('gauge-energy-fill'),
                pollutionFill: document.getElementById('gauge-pollution-fill'),
                sobrietyFill: document.getElementById('gauge-sobriety-fill'),
                energyNet: document.getElementById('energy-net'),
                pollutionValue: document.getElementById('pollution-value'),
                pollutionPerTurn: document.getElementById('pollution-per-turn'),
                sobrietyValue: document.getElementById('sobriety-value'),
                ageThreshold: document.getElementById('age-threshold'),
                ageThresholdValue: document.getElementById('age-threshold-value')
            },
            // Modales / Panneaux
            modals: {
                build: document.getElementById('build-modal'),
                rules: document.getElementById('rules-modal'),
                confirm: document.getElementById('modal-confirm'),
                buildOptions: document.getElementById('modal-build-options'),
                zoneTitle: document.getElementById('modal-zone-title'),
                rulesText: document.getElementById('rules-text'),
                confirmTitle: document.getElementById('confirm-title'),
                confirmMessage: document.getElementById('confirm-message')
            },
            sidebar: {
                research: document.getElementById('research-panel'),
                researchList: document.getElementById('research-list')
            },
            // Quiz
            quiz: {
                current: document.getElementById('quiz-current'),
                total: document.getElementById('quiz-total'),
                question: document.getElementById('quiz-question'),
                options: document.getElementById('quiz-options'),
                feedback: document.getElementById('quiz-feedback')
            },
            // Learn & Event
            learn: {
                title: document.getElementById('learn-title'),
                content: document.getElementById('learn-content'),
                epoch: document.getElementById('learn-epoch')
            },
            eventBanner: {
                el: document.getElementById('event-banner'),
                text: document.getElementById('event-text'),
                icon: document.getElementById('event-icon')
            }
        };
    },

    bindEvents() {
        // Navigation
        this.elements.buttons.start.addEventListener('click', () => {
            this.showScreen('game');
            // Lancer le tutoriel après l'entrée dans l'écran de jeu (première fois)
            setTimeout(() => this.startTutorial(), 300);
        });

        this.elements.buttons.menu.addEventListener('click', () => {
            this.showConfirmationModal(
                "Retour à l'accueil",
                "Ta progression sera perdue. Veux-tu vraiment quitter ?",
                () => location.reload()
            );
        });

        document.getElementById('btn-close-learn-cross').addEventListener('click', () => {
            this.showScreen('game');
        });

        // Règles
        const closeRules = () => {
            this.elements.modals.rules.classList.add('hidden');
            this.updateGameUI();
        };
        this.elements.buttons.closeRules.addEventListener('click', closeRules);
        this.elements.buttons.rulesOk.addEventListener('click', closeRules);

        // Recherche (panel statique — pas besoin de toggle)

        // Jeu
        this.elements.buttons.endTurn.addEventListener('click', () => this.endTurn());

        // Bouton Fin de partie (manuel / à tout moment)
        this.elements.buttons.finishGame.addEventListener('click', () => {
            const msg = "Es-tu sûr de vouloir terminer la partie maintenant ?\nTon score sera calculé en fonction de ton âge actuel, de ton efficacité et de ta pollution.";
            if (confirm(msg)) {
                // Pas forcément une victoire, on force juste la fin
                game.gameOver = true;
                this.showGameOver(game.victory);
            }
        });

        // Modales - Fermeture via croix ou fond non gérée pour confirm (bloquant)
        this.elements.buttons.closeBuild.addEventListener('click', () => this.closeModal());

        // Confirmation
        this.elements.buttons.confirmCancel.addEventListener('click', () => {
            this.elements.modals.confirm.classList.add('hidden');
        });

        // Learn / Quiz
        this.elements.buttons.nextLevel.addEventListener('click', () => {
            this.updateGameUI();
            this.showScreen('game');
        });

        this.elements.buttons.startQuiz.addEventListener('click', () => {
            this.startQuizFromLesson();
        });

        this.elements.buttons.restart.addEventListener('click', () => {
            game.reset();
            this.createGrid();
            this.updateGameUI();
            this.showScreen('game');
            this.showRulesModal();
        });
    },

    // ==========================================
    // AFFICHAGE ÉCRANS & MODALES
    // ==========================================

    showScreen(screenId) {
        Object.values(this.elements.screens).forEach(el => el.classList.remove('active'));
        this.elements.screens[screenId].classList.add('active');
    },

    showRulesModal() {
        this.elements.modals.rulesText.innerHTML = GAME_DATA.rulesContent;
        this.elements.modals.rules.classList.remove('hidden');
    },

    showConfirmationModal(title, message, onConfirm) {
        this.elements.modals.confirmTitle.textContent = title;
        this.elements.modals.confirmMessage.textContent = message;

        // Nettoyer l'ancien event listener pour éviter les doublons/leaks
        // Méthode simple : cloner bouton
        const newBtn = this.elements.buttons.confirmOk.cloneNode(true);
        this.elements.buttons.confirmOk.parentNode.replaceChild(newBtn, this.elements.buttons.confirmOk);
        this.elements.buttons.confirmOk = newBtn;

        this.elements.buttons.confirmOk.addEventListener('click', () => {
            onConfirm();
            this.elements.modals.confirm.classList.add('hidden');
        });

        this.elements.modals.confirm.classList.remove('hidden');
    },

    toggleResearchPanel() {
        // Panel is now always visible — just refresh content
        this.renderResearchList();
    },

    closeModal() {
        this.elements.modals.build.classList.add('hidden');
    },

    // ==========================================
    // LOGIQUE DE JEU & UI UPDATES
    // ==========================================

    createGrid() {
        const grid = this.elements.game.map;
        grid.innerHTML = '';

        // Configuration de la carte fixe (7x4 = 28 cases) - Multi-terrain (Option C)
        // Chaque case a un tableau de tags correspondant aux ressources visibles sur l'image
        const terrainMap = [
            // Row 0 (0-7)
            ['oil_field'],              // 0  R0C0
            ['mountain'],               // 1  R0C1
            ['plain'],                  // 4  R0C4
            ['village'],                // 3  R0C3
            ['plain'],                  // 4  R0C4
            ['enclosure'],              // 5  R0C5
            ['sun'],                    // 6  R0C6
            ['oil_field'],              // 7  R0C7


            // Row 1 (8-15)
            ['river'],                 // 8  R1C0
            ['enclosure'],              // 9  R1C1
            ['plain'],                  // 10 R1C2
            ['plain'],                  // 11 R1C3
            ['plain'],                  // 12 R1C4
            ['forest'],                 // 13 R1C5
            ['wind'],                   // 14 R1C6
            ['sun'],                  // 15 R1C7

            // Row 2 (16-23)
            ['river'],                  // 16 R2C0
            ['river'],                  // 17 R2C1
            ['river'],                  // 18 R2C2
            ['enclosure'],              // 19 R2C3
            ['mountain'],               // 20 R2C4
            ['uranium_soil'],           // 21 R2C5
            ['sun'],                    // 22 R2C6
            ['forest'],                  // 23 R2C7

            // Row 3 (24-31)
            ['mountain'],               // 24 R3C0
            ['forest'],                 // 25 R3C1
            ['wind'],                   // 26 R3C2
            ['mountain'],               // 27 R3C3
            ['oil_field'],              // 28 R3C4
            ['forest'],                 // 29 R3C5
            ['oil_field'],              // 30 R3C6
            ['forest'],                 // 31 R3C7
        ];

        // Noms affichés dans les tooltips
        const tooltipNames = {
            'forest': '🌲 Forêt',
            'river': '💧 Rivière',
            'mountain': '⛏️ Charbon',
            'oil_field': '🛢️ Pétrole',
            'uranium_soil': '☢️ Uranium',
            'sun': '☀️ Soleil',
            'wind': '💨 Vent',
            'plain': '🏗️ Plaine',
            'enclosure': '🐂 Enclos'
        };

        for (let i = 0; i < 32; i++) {
            const cell = document.createElement('div');
            cell.className = 'map-cell';
            cell.dataset.index = i;

            const types = terrainMap[i]; // Tableau de tags
            cell.dataset.terrain = types.join(',');
            types.forEach(t => cell.classList.add(t));

            // Cas particulier du village (non constructible, non cliquable)
            if (types.includes('village')) {
                cell.classList.add('village');
                const sprite = document.createElement('span');
                sprite.className = 'village-sprite';
                sprite.textContent = '🏘️';
                cell.appendChild(sprite);
            } else {
                // Tooltip multi-terrain
                const tooltipText = types.map(t => tooltipNames[t] || t).join(' · ');
                const tooltip = document.createElement('div');
                tooltip.className = 'cell-tooltip';
                tooltip.textContent = tooltipText;
                cell.appendChild(tooltip);

                cell.addEventListener('click', () => this.handleCellClick(i, types));
            }

            grid.appendChild(cell);
        }
    },

    updateGridCells() {
        const cells = document.querySelectorAll('.map-cell');
        cells.forEach(cell => {
            cell.classList.remove('pulsing', 'depleted', 'construction', 'stalled', 'built');
            const existingContent = cell.querySelector('.building-sprite');
            if (existingContent) existingContent.remove();
            // Fallback pour anciens noms de classe
            const legacyContent = cell.querySelector('.installation-content');
            if (legacyContent) legacyContent.remove();
            const existingGauge = cell.querySelector('.fuel-gauge');
            if (existingGauge) existingGauge.remove();
            const existingBadge = cell.querySelector('.cell-production-badge');
            if (existingBadge) existingBadge.remove();
            const existingPollBadge = cell.querySelector('.cell-pollution-badge');
            if (existingPollBadge) existingPollBadge.remove();
            const existingStock = cell.querySelector('.cell-stock-counter');
            if (existingStock) existingStock.remove();
        });

        const weather = game.getCurrentWeather();

        game.installations.forEach(inst => {
            const cell = cells[inst.cellIndex];
            const source = GAME_DATA.sources.find(s => s.id === inst.sourceId);

            cell.classList.add('built');

            const div = document.createElement('div');
            div.className = 'building-sprite';
            div.innerHTML = `<span style="font-size:2rem;">${source.icon}</span>`;

            if (inst.turnsUntilReady > 0) {
                const isPaused = game.energyStock <= 0 && game.turnBalance < 0;
                div.innerHTML += `<span class="build-timer ${isPaused ? 'paused' : ''}">${isPaused ? '⚠️ STOP' : '🚧 ' + inst.turnsUntilReady}</span>`;
                cell.classList.add('construction');
                if (isPaused) cell.classList.add('stalled');

                // Badge construction
                const badge = document.createElement('span');
                badge.className = `cell-production-badge building ${isPaused ? 'paused' : ''}`;
                badge.textContent = isPaused ? '⚠️' : `🚧${inst.turnsUntilReady}`;
                cell.appendChild(badge);
            } else {
                // Calculer production effective pour cette installation
                let prod = source.output;
                const isEpuise = inst.fuelStock !== null && inst.fuelStock <= 0;

                if (isEpuise) {
                    prod = 0;
                    cell.classList.add('depleted');
                } else {
                    // Modificateur météo & Batterie
                    if (source.weatherDependent) {
                        let mult = 1.0;
                        if (source.weatherType === 'sun') mult = weather.sun.multiplier;
                        if (source.weatherType === 'wind') mult = weather.wind.multiplier;

                        // Vérifier si une batterie est active
                        const hasBattery = game.installations.some(i => i.turnsUntilReady === 0 && GAME_DATA.sources.find(s => s.id === i.sourceId)?.special === 'storage');
                        if (hasBattery && mult < 1.0) mult = 1.0;

                        prod *= mult;
                    }

                    // Bonus Smart Grid (+20%)
                    const hasSmartGrid = game.installations.some(i =>
                        i.turnsUntilReady === 0 &&
                        GAME_DATA.sources.find(s => s.id === i.sourceId)?.special === 'efficiency'
                    );
                    if (hasSmartGrid && source.output > 0) {
                        prod *= 1.2;
                    }
                    prod = Math.floor(prod);
                }

                // Badge de production (toujours affiché si installé et actif)
                if (prod > 0) {
                    const badge = document.createElement('span');
                    badge.className = 'cell-production-badge';
                    badge.textContent = `+${prod}⚡`;
                    cell.appendChild(badge);
                }

                // Badge de pollution (si polluant)
                if (source.pollutionPerTurn > 0) {
                    const pollBadge = document.createElement('span');
                    pollBadge.className = 'cell-pollution-badge';
                    pollBadge.textContent = `🏭${source.pollutionPerTurn}`;
                    cell.appendChild(pollBadge);
                }
            }

            // Jauge de stock + compteur numérique (pour les ressources épuisables)
            if (inst.fuelStock !== null) {
                const max = source.fuelStock;
                const pct = Math.max(0, (inst.fuelStock / max) * 100);
                const gauge = document.createElement('div');
                gauge.className = 'fuel-gauge';
                gauge.innerHTML = `<div class="fuel-fill ${pct < 20 ? 'low' : ''}" style="width:${pct}%"></div>`;
                cell.appendChild(gauge);

                // Compteur numérique du stock
                const counter = document.createElement('span');
                counter.className = 'cell-stock-counter';
                if (inst.fuelStock <= 0 && source.regenRate) {
                    counter.classList.add('regenerating');
                    counter.textContent = `♻ regen`;
                } else if (pct < 20) {
                    counter.classList.add('low');
                    counter.textContent = `${Math.ceil(inst.fuelStock)}/${max}`;
                } else {
                    counter.textContent = `${Math.ceil(inst.fuelStock)}/${max}`;
                }
                cell.appendChild(counter);
            }

            cell.appendChild(div);
        });
    },

    updateGameUI() {
        const currentLevel = game.getCurrentLevel();
        this.elements.game.epochIcon.textContent = currentLevel.icon;
        this.elements.game.epochName.textContent = currentLevel.name;
        this.elements.game.epochName.style.color = currentLevel.color;
        this.elements.game.turn.textContent = game.currentTurn;

        this.updateWeatherDisplay();

        // 1. Jauge d'énergie (FLUX) scalée sur l'objectif
        const nextLevel = game.getNextLevel();
        const lastLevel = GAME_DATA.levels[GAME_DATA.levels.length - 1];
        const targetEnergy = nextLevel ? nextLevel.ageThreshold : lastLevel.ageThreshold;

        const energyPercent = Math.min(100, Math.max(0, (game.turnBalance / targetEnergy) * 100));
        this.elements.gauges.energyFill.style.width = `${energyPercent}%`;

        // Affichage du solde du tour dans le texte (ex: +5)
        const balanceValue = game.turnBalance;
        const balanceSign = balanceValue >= 0 ? '+' : '';
        this.elements.gauges.energyNet.textContent = `${balanceSign}${balanceValue}`;
        this.elements.gauges.energyNet.style.color = balanceValue < 0 ? '#ef4444' : '#22c55e';

        if (nextLevel) {
            this.elements.gauges.ageThresholdValue.textContent = nextLevel.ageThreshold;
            this.elements.gauges.ageThreshold.style.display = 'inline';
        } else {
            this.elements.gauges.ageThreshold.style.display = 'none';
        }

        // 2. Pollution CO₂ (cumulée, en Gt)
        const co2Budget = GAME_DATA.config.co2BudgetMax;
        const pollutionPercent = Math.min(100, (game.pollution / co2Budget) * 100);
        this.elements.gauges.pollutionFill.style.width = `${pollutionPercent}%`;
        this.elements.gauges.pollutionValue.textContent = `${game.pollution.toFixed(1)} / ${co2Budget}`;
        this.elements.gauges.pollutionPerTurn.textContent = `+${game.pollutionPerTurn.toFixed(1)}/tour`;

        if (pollutionPercent >= 80) this.elements.gauges.pollutionFill.style.background = '#ef4444';
        else if (pollutionPercent >= 50) this.elements.gauges.pollutionFill.style.background = '#f59e0b';
        else this.elements.gauges.pollutionFill.style.background = 'var(--color-secondary)';

        // 3. Sobriété (Énergie dépensée)
        const totalSpent = game.totalEnergySpent || 0;
        this.elements.gauges.sobrietyValue.textContent = Math.floor(totalSpent);
        // On remplit la jauge sur une base de 10000    pour la visualisation (malus croissant)
        const sobrietyPercent = Math.min(100, (totalSpent / 10000) * 100);
        this.elements.gauges.sobrietyFill.style.width = `${sobrietyPercent}%`;

        // 4. Panneau Recherche (toujours visible)
        const badge = this.elements.game.researchBadge;
        if (game.isResearching()) {
            const r = game.currentResearch;
            badge.textContent = `⏳ ${r.turnsLeft} tour(s)`;
            badge.className = 'research-status-badge in-progress';
        } else {
            const availableResearch = game.getAvailableResearch();
            if (availableResearch.length > 0) {
                badge.textContent = `${availableResearch.length} dispo`;
                badge.className = 'research-status-badge available';
            } else {
                badge.textContent = '';
                badge.className = 'research-status-badge complete';
            }
        }

        // 4. Gestion Bouton Fin de Partie (Toujours visible)
        this.elements.buttons.finishGame.style.display = 'inline-block';
        if (game.currentLevel >= GAME_DATA.levels.length - 1) { // Animation si on atteint l'âge futur
            if (!this.elements.buttons.finishGame.classList.contains('animated')) {
                this.elements.buttons.finishGame.classList.add('animated', 'pulse');
            }
        }
        this.renderResearchList();

        this.updateGridCells();
    },

    updateWeatherDisplay() {
        const weather = game.getCurrentWeather();

        // Mise à jour du Soleil
        this.elements.game.sunIcon.textContent = weather.sun.icon;
        this.elements.game.sunName.textContent = weather.sun.name;
        document.getElementById('sun-display').title = `Soleil : ${weather.sun.desc}`;

        // Mise à jour du Vent
        this.elements.game.windIcon.textContent = weather.wind.icon;
        this.elements.game.windName.textContent = weather.wind.name;
        document.getElementById('wind-display').title = `Vent : ${weather.wind.desc}`;
    },

    // ==========================================
    // ACTIONS JOUEUR
    // ==========================================

    handleCellClick(index, terrainTags) {
        // 1. Case occupée ? Proposer upgrade ou destruction
        const existing = game.getInstallationAtCell(index);
        if (existing) {
            const existingSource = GAME_DATA.sources.find(s => s.id === existing.sourceId);
            // Chercher si un upgrade est disponible (même non recherché)
            const availableUpgrade = GAME_DATA.sources.find(s => s.upgradesFrom === existing.sourceId);

            if (availableUpgrade && existing.turnsUntilReady === 0) {
                // Proposer upgrade ET destruction, même si on n'a pas les ressources (le bouton upgrade sera grisé)
                this.openUpgradeModal(existingSource, availableUpgrade, existing, index);
            } else {
                if (existing.fuelStock !== null && existing.fuelStock <= 0) {
                    this.showEventBanner('⚠️ Terrain épuisé, destruction impossible.');
                    return;
                }
                // Seulement destruction
                this.showConfirmationModal(
                    "Démolition",
                    "Détruire ce bâtiment ? Cette action est irréversible mais gratuite.",
                    () => {
                        game.destroyInstallation(index);
                        this.updateGridCells();
                        this.updateGameUI();
                    }
                );
            }
            return;
        }

        // 2. Construction - chercher les techs dont la zone correspond
        //    ET qui ne sont PAS des upgrades (celles-ci nécessitent un bâtiment existant)
        const unlocked = game.getUnlockedSources();
        const compatibleSources = unlocked.filter(s =>
            terrainTags.includes(s.zone) && !s.upgradesFrom
        );

        if (compatibleSources.length === 0) return;

        this.openBuildModal(compatibleSources, index);
    },

    openBuildModal(sources, cellIndex) {
        this.elements.modals.zoneTitle.textContent = "Choisir une construction";
        const container = this.elements.modals.buildOptions;
        container.innerHTML = '';
        container.classList.add('build-options-grid');

        const canAfford = !(game.energyStock <= 0 && game.turnBalance <= 0);

        if (!canAfford) {
            const warning = document.createElement('div');
            warning.style.cssText = 'grid-column: 1 / -1; text-align:center; padding:0.5rem; color:#ef4444; font-size:0.85rem; background:rgba(239,68,68,0.1); border-radius:6px; margin-bottom:0.5rem;';
            warning.textContent = '⚠️ Stock d\'énergie épuisé ! Impossible de construire.';
            container.appendChild(warning);
        }

        sources.forEach(source => {
            const btn = document.createElement('div');
            btn.className = 'source-card';
            if (!canAfford) btn.classList.add('disabled');

            let prodDisplay = `⚡ +${source.output}`;
            const weather = game.getCurrentWeather();
            if (source.weatherDependent) {
                let mult = 1;
                if (source.weatherType === 'sun') mult = weather.sun.multiplier;
                if (source.weatherType === 'wind') mult = weather.wind.multiplier;
                const currentProd = Math.floor(source.output * mult);
                prodDisplay = `⚡ +${currentProd} <small>(base ${source.output})</small>`;
            }

            btn.innerHTML = `
                <div style="font-size: 2rem; text-align: center;">${source.icon}</div>
                <div style="font-weight: bold; text-align: center; margin: 0.5rem 0;">${source.name}</div>
                <div style="font-size: 0.8rem; display: grid; grid-template-columns: 1fr 1fr; gap: 5px;">
                    <span>${prodDisplay}</span>
                    <span>🏭 ${source.pollutionPerTurn} Gt/Tour</span>
                    <span>🔧 -${source.buildCostPerTurn}⚡</span>
                    <span>⏱️ ${source.buildTime}tour</span>
                </div>
            `;

            const canBuildThis = game.canBuild(source.id, cellIndex);
            if (!canBuildThis) {
                btn.classList.add('disabled');
                btn.style.cursor = 'not-allowed';
                btn.style.opacity = '0.7';
                btn.style.filter = 'grayscale(0.5)';
                const missing = source.buildCostPerTurn - game.turnBalance;
                btn.innerHTML += `<div style="color:#ef4444; font-weight:bold; margin-top:8px; text-align:center;">⚠️ Manque ${missing} ⚡/tour</div>`;
            }

            if (canBuildThis) {
                btn.addEventListener('click', () => {
                    game.buildInstallation(source.id, cellIndex);
                    this.closeModal();
                    this.updateGridCells();
                    this.updateGameUI();
                });
            }

            container.appendChild(btn);
        });

        this.elements.modals.build.classList.remove('hidden');
    },

    openUpgradeModal(currentSource, upgradeSource, existingInst, cellIndex) {
        this.elements.modals.zoneTitle.textContent = "⬆️ Amélioration disponible";
        const container = this.elements.modals.buildOptions;
        container.innerHTML = '';
        container.classList.add('build-options-grid');

        // Carte upgrade
        const upgradeBtn = document.createElement('div');
        upgradeBtn.className = 'source-card upgrade-card';
        upgradeBtn.style.cssText = 'border: 2px solid #22c55e; background: rgba(34,197,94,0.1);';

        const stockInfo = existingInst.fuelStock !== null
            ? `<span style="color:#f59e0b;">📦 Stock hérité: ${Math.ceil(existingInst.fuelStock)}</span>`
            : `<span style="color:#22c55e;">♻️ Illimité</span>`;

        upgradeBtn.innerHTML = `
            <div style="font-size: 2rem; text-align: center;">${upgradeSource.icon}</div>
            <div style="font-weight: bold; text-align: center; margin: 0.5rem 0;">
                ⬆️ ${upgradeSource.name}
            </div>
            <div style="font-size: 0.75rem; text-align:center; color:var(--text-muted); margin-bottom:0.3rem;">
                Remplace ${currentSource.icon} ${currentSource.name}
            </div>
            <div style="font-size: 0.8rem; display: grid; grid-template-columns: 1fr 1fr; gap: 5px;">
                <span style="color:#22c55e;">⚡ +${upgradeSource.output} <small>(était ${currentSource.output})</small></span>
                <span>🌍 ${upgradeSource.pollutionPerTurn} Gt CO₂</span>
                <span style="color:#60a5fa;">🔧 -${upgradeSource.buildCostPerTurn}⚡</span>
                <span>⏱️ ${upgradeSource.buildTime}tour(s)</span>
                ${stockInfo}
            </div>
        `;
        const isUnlocked = game.unlockedSources.includes(upgradeSource.id);
        let btnDisabled = false;
        let upgradeError = "";

        if (!isUnlocked) {
            btnDisabled = true;
            upgradeError = `🔒 Requiert la recherche : ${upgradeSource.name}`;
        } else {
            const canUpgrade = game.canBuild(upgradeSource.id, cellIndex);
            if (!canUpgrade) {
                btnDisabled = true;
                const cost = upgradeSource.buildCostPerTurn;
                const missing = cost - game.turnBalance;
                upgradeError = `⚠️ Manque ${missing} ⚡/tour`;
            }
        }

        if (btnDisabled) {
            upgradeBtn.classList.add('disabled');
            upgradeBtn.style.cursor = 'not-allowed';
            upgradeBtn.style.opacity = '0.7';
            upgradeBtn.style.filter = 'grayscale(0.5)';
            upgradeBtn.innerHTML += `<div style="color:#ef4444; font-weight:bold; margin-top:8px; text-align:center;">${upgradeError}</div>`;
        } else {
            upgradeBtn.addEventListener('click', () => {
                game.buildInstallation(upgradeSource.id, cellIndex);
                this.closeModal();
                this.updateGridCells();
                this.updateGameUI();
            });
        }
        container.appendChild(upgradeBtn);

        // Carte destruction
        const destroyBtn = document.createElement('div');
        if (existingInst.fuelStock !== null && existingInst.fuelStock <= 0) {
            destroyBtn.className = 'source-card disabled';
            destroyBtn.style.cssText = 'border: 2px solid #555; background: rgba(0,0,0,0.5); opacity: 0.5; cursor: not-allowed;';
            destroyBtn.innerHTML = `
                <div style="font-size: 2rem; text-align: center;">💥</div>
                <div style="font-weight: bold; text-align: center; margin: 0.5rem 0;">Détruire</div>
                <div style="font-size: 0.8rem; text-align:center; color:#ef4444;">
                    Épuisé ! Indestructible.
                </div>
            `;
            destroyBtn.addEventListener('click', () => {
                this.showEventBanner('⚠️ Terrain épuisé, destruction impossible.');
            });
        } else {
            destroyBtn.className = 'source-card';
            destroyBtn.style.cssText = 'border: 2px solid #ef4444; background: rgba(239,68,68,0.1); cursor: pointer;';
            destroyBtn.innerHTML = `
                <div style="font-size: 2rem; text-align: center;">💥</div>
                <div style="font-weight: bold; text-align: center; margin: 0.5rem 0;">Détruire</div>
                <div style="font-size: 0.8rem; text-align:center; color:var(--text-muted);">
                    Supprime ${currentSource.icon} ${currentSource.name}
                </div>
            `;
            destroyBtn.addEventListener('click', () => {
                game.destroyInstallation(cellIndex);
                this.closeModal();
                this.updateGridCells();
                this.updateGameUI();
            });
        }
        container.appendChild(destroyBtn);

        this.elements.modals.build.classList.remove('hidden');
    },

    endTurn() {
        if (this._endTurnCooldown) return;
        this._endTurnCooldown = true;

        const btn = this.elements.buttons.endTurn;
        btn.classList.add('disabled', 'click-gold-glow');
        btn.classList.remove('pulse-glow');

        setTimeout(() => {
            btn.classList.remove('disabled', 'click-gold-glow');
            this._endTurnCooldown = false;
        }, 1000);

        const result = game.processTurn();

        if (result.newlyCompleted.length > 0) {
            this.showEventBanner(`🏗️ Construction terminée !`);
        }

        if (result.researchCompleted) {
            const s = GAME_DATA.sources.find(src => src.id === result.researchCompleted);
            this.showEventBanner(`💡 Recherche terminée : ${s.name} débloqué !`);

            // Tutoriel upgrade : affiché UNE SEULE FOIS quand la 1ère techno upgrade est débloquée
            if (s.upgradesFrom && !this._upgradeTutorialShown) {
                this._upgradeTutorialShown = true;
                const parentSource = GAME_DATA.sources.find(p => p.id === s.upgradesFrom);
                setTimeout(() => {
                    this.showTutorialStepSingle({
                        title: '⬆️ Amélioration technologique !',
                        text: `Tu as découvert ${s.icon} ${s.name} !\n\nC'est une amélioration de ${parentSource.icon} ${parentSource.name}. Clique sur un ${parentSource.name} existant pour le remplacer par cette nouvelle technologie.\n\n📦 Le stock de combustible est conservé !\n⚡ Production augmentée : ${parentSource.output} → ${s.output}\n🌍 CO₂ : ${parentSource.pollutionPerTurn} → ${s.pollutionPerTurn} Gt/tour`
                    }, () => { });
                }, 1500);
            }

            // Tutoriel de la toute première construction (Feu de camp)
            if (s.id === 'wood' && game.currentTurn === 1 && !this._woodBuildTutorialShown) {
                this._woodBuildTutorialShown = true;
                setTimeout(() => {
                    // C5R1 est l'index 13
                    const targetIdx = 13;
                    const forestCell = document.querySelector(`.map-cell[data-index="${targetIdx}"]`);
                    if (forestCell) {
                        this.showTutorialStepSingle({
                            target: `.map-cell[data-index="${targetIdx}"]`,
                            title: '🔥 Prêt à construire !',
                            text: "Maintenant que tu as fait ta première recherche, clique sur la forêt (C5R1) pour y construire ton premier feu et commencer à sauver ton village du froid. \n\nAttention, sa construction va te coûter 5 ⚡ au prochain tour."
                        }, () => { });
                    }
                }, 1000);
            }
        }

        if (result.gameOver) this.showGameOver(false);
        else if (result.victory) this.showGameOver(true);
        else {
            if (result.ageAdvanced) {
                game.advanceAge();
                this.showLevelUpScreen(); // Nouvelle méthode
            } else {
                this.updateGameUI();
            }
        }
    },

    showEventBanner(msg) {
        const banner = this.elements.eventBanner.el;
        this.elements.eventBanner.text.textContent = msg;
        banner.classList.remove('hidden');
        banner.classList.add('visible');
        setTimeout(() => {
            banner.classList.remove('visible');
            banner.classList.add('hidden');
        }, 3000);
    },

    // ==========================================
    // RECHERCHE (Sidebar)
    // ==========================================

    renderResearchList() {
        const list = this.elements.sidebar.researchList;
        list.innerHTML = '';

        let researchingHtml = [];
        if (game.isResearching()) {
            const r = game.currentResearch;
            const source = GAME_DATA.sources.find(s => s.id === r.sourceId);

            const div = document.createElement('div');
            div.className = 'tech-card researching';
            const progress = ((r.totalTurns - r.turnsLeft) / r.totalTurns) * 100;

            let costStr = game.quizPenaltyCost > 0 ? `<br> <span style="color:#ef4444;font-size:0.8em;">⚠️ Pénalité quiz : -${game.quizPenaltyCost}⚡/tour</span>` : `<br> <span style="color:#22c55e;font-size:0.8em;">(Gratuit)</span>`;

            div.innerHTML = `
                <div class="tech-header">
                    <div class="tech-icon">${source.icon}</div>
                    <div class="tech-info">
                        <h3>${source.name} (Recherche en cours...)</h3>
                        <p>Temps restant : ${r.turnsLeft} tour(s) <br> 🔬 Coût Recherche : -${source.researchCostPerTurn}⚡/tour</p>
                    </div>
                </div>
                <div class="research-progress">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
            `;
            researchingHtml.push(div);
        }

        const unlocked = game.getUnlockedSources();
        const available = game.getAvailableResearch();
        const researchingId = game.isResearching() ? game.currentResearch.sourceId : null;

        const unlockedHtml = [];
        const availableHtml = [];
        const lockedHtml = [];

        // Boucle sur toutes les sources et prépare le HTML
        GAME_DATA.sources.forEach(source => {
            if (source.id === researchingId) return; // Déjà affiché en haut

            const isUnlocked = unlocked.find(s => s.id === source.id);
            const isAvailable = available.includes(source);

            // Hide distant spoilers removed to show all future tech in "Bloquées"
            // if (source.level > game.currentLevel + 1 && !isUnlocked && !isAvailable) return;

            const card = document.createElement('div');

            if (isUnlocked) {
                card.className = 'tech-card researched';
                card.innerHTML = `
                    <div class="tech-header">
                        <div class="tech-icon">${source.icon}</div>
                        <div class="tech-info">
                            <h3>${source.name} <span style="background:#22c55e;color:#000;padding:1px 6px;border-radius:4px;font-size:0.65rem;vertical-align:middle;">✓ DÉBLOQUÉ</span></h3>
                            <p style="color:var(--text-muted); font-size: 0.75rem;">Clique pour revoir la Fiche Pédagogique</p>
                        </div>
                    </div>
                `;
                card.style.cursor = 'pointer';
                card.addEventListener('click', () => {
                    this.startLessonInteraction(source);
                });
                unlockedHtml.push(card);
            } else if (isAvailable) {
                if (game.isResearching()) {
                    card.className = 'tech-card locked';
                    card.style.opacity = '0.5';
                    card.style.border = '1px dashed #555';
                    card.style.filter = 'grayscale(1)';
                    card.innerHTML = `
                        <div class="tech-header">
                            <div class="tech-icon">${source.icon}</div>
                            <div class="tech-info">
                                <h3>${source.name}</h3>
                                <p style="color:#fca5a5; font-size: 0.75rem;">Recherche déjà en cours 🛑</p>
                            </div>
                        </div>
                    `;
                } else {
                    card.className = 'tech-card available';

                    if (source.id === 'wood' && game.currentTurn === 1 && !game.isResearching() && localStorage.getItem('evolution-energie-tutorial-done') === 'true') {
                        card.classList.add('pulse-glow');
                    }

                    card.innerHTML = `
                        <div class="tech-header">
                            <div class="tech-icon">${source.icon}</div>
                            <div class="tech-info">
                                <h3>${source.name} ${source.upgradesFrom ? '<span style="background:#22c55e;color:#000;padding:1px 6px;border-radius:4px;font-size:0.65rem;vertical-align:middle;">⬆️ UPGRADE</span>' : ''}${source.special === 'efficiency' ? '<span style="background:#3b82f6;color:#fff;padding:1px 6px;border-radius:4px;font-size:0.65rem;vertical-align:middle;">🔗 +20%</span>' : ''}</h3>
                                <p style="color:var(--text-muted); font-size: 0.75rem;">Nouvelle recherche disponible</p>
                            </div>
                        </div>
                        <div class="tech-actions" style="display:flex; flex-direction:column; gap:4px; font-size:0.75rem; background:rgba(0,0,0,0.2); padding: 5px; border-radius: 4px; margin-top: 5px;">
                            <span style="color:#a1a1aa">🔬 <strong>Recherche :</strong> ${source.researchTime} tour(s) </span>
                            <span style="color:#a1a1aa">🔧 <strong>Construction :</strong> ${source.buildTime} tour(s) (-${source.buildCostPerTurn}⚡/tour)</span>
                            ${source.special === 'storage'
                            ? `<span style="color:#fbbf24">🔋 <strong>Effet :</strong> Stockage (Supprime malus ENR)</span>`
                            : source.special === 'efficiency'
                                ? `<span style="color:#3b82f6">🔗 <strong>Effet :</strong> Smart Grid (+20% production)</span>`
                                : `<span style="color:#22c55e">⚡ <strong>Gain :</strong> +${source.output}/tour ${source.pollutionPerTurn > 0 ? `<span style="color:#ef4444">| 🏭 ${source.pollutionPerTurn} Gt</span>` : ''}</span>`
                        }
                        </div>
                    `;
                    card.style.cursor = 'pointer';
                    card.addEventListener('click', () => {
                        this.startLessonInteraction(source);
                    });
                }
                availableHtml.push(card);
            } else {
                card.className = 'tech-card locked';
                card.style.opacity = '0.6';
                card.style.border = '1px dashed #555';

                let conditions = [];
                // 1. Condition d'Âge
                if (source.level > game.currentLevel + 1) {
                    conditions.push(`📅 Âge : ${GAME_DATA.levels[source.level - 1].name}`);
                }

                // 2. Condition de Technologie / Construction
                if (source.requires) {
                    const reqSource = GAME_DATA.sources.find(s => s.id === source.requires);
                    const reqName = reqSource ? `${reqSource.icon} ${reqSource.name}` : source.requires;

                    if (!game.unlockedSources.includes(source.requires)) {
                        // Techno pas encore apprise
                        conditions.push(`🔬 Rechercher : ${reqName}`);
                    }
                }

                if (conditions.length === 0) conditions.push("🔒 Verrouillé");

                card.innerHTML = `
                    <div class="tech-header" style="filter: grayscale(1);">
                         <div class="tech-icon">${source.icon}</div>
                         <div class="tech-info">
                            <h3 style="color:var(--text-muted);">${source.name}</h3>
                            <div style="color:#fca5a5; font-size:0.75rem; line-height:1.4;">
                                ${conditions.join('<br>')}
                            </div>
                        </div>
                    </div>
                `;
                card.style.cursor = 'pointer';
                card.addEventListener('click', () => {
                    this.startLessonInteraction(source);
                });
                lockedHtml.push(card);
            }
        });

        // Fonction helper pour créer une section
        const createSection = (title, items, icon) => {
            if (items.length === 0) return null;
            const section = document.createElement('div');
            section.className = 'research-section';
            section.style.marginBottom = '1rem';

            section.innerHTML = `
                <h3 style="font-size: 0.85rem; margin-bottom: 0.5rem; padding-bottom: 0.3rem; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--text-secondary); text-transform: uppercase; display: flex; align-items: center; gap: 5px;">
                    ${icon} ${title} <span style="font-size: 0.7rem; background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 10px; margin-left: auto;">${items.length}</span>
                </h3>
            `;
            const container = document.createElement('div');
            container.style.maxHeight = '28vh';
            container.style.overflowY = 'auto';
            container.style.paddingRight = '5px';

            items.forEach(card => container.appendChild(card));
            section.appendChild(container);
            return section;
        };

        // Création des sections
        const researchingSection = createSection('En cours', researchingHtml, '🔬');
        const availableSection = createSection('Disponibles', availableHtml, '✨');
        const unlockedSection = createSection('Connues', unlockedHtml, '🎓');
        const lockedSection = createSection('Bloquées', lockedHtml, '🔒');

        // Ajout au DOM
        if (researchingSection) list.appendChild(researchingSection);
        if (availableSection) list.appendChild(availableSection);
        if (unlockedSection) list.appendChild(unlockedSection);
        if (lockedSection) list.appendChild(lockedSection);
    },

    startLessonInteraction(source) {
        this.currentLessonSource = source; // Stocker pour le quiz après
        this.showLesson(source);
    },

    showLesson(source) {
        const quizData = game.getQuizForSource(source.id);
        const lessonHtml = quizData && quizData.lesson ? quizData.lesson : "<p>Apprends cette technologie pour la débloquer !</p>";

        // Configurer l'écran Learn pour le mode "Fiche Pédagogique"
        this.elements.learn.epoch.textContent = `Fiche Pédagogique : ${source.name}`;
        this.elements.learn.epoch.style.backgroundColor = "var(--color-info)";
        this.elements.learn.title.textContent = quizData ? quizData.title : source.name;

        // Entête des caractéristiques en grand
        let statsHtml = `
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(150px, 1fr)); gap:10px; font-size:1.1rem; margin-bottom: 2rem; padding:1.5rem; background:rgba(255,255,255,0.05); border-radius:12px; border-left: 5px solid var(--color-primary);">
                <div style="display:flex; flex-direction:column; align-items:flex-start;">
                    <span style="color:var(--text-muted); font-size:0.8rem; text-transform:uppercase;">${source.special ? 'Effet Spécial' : 'Production'}</span>
                    ${source.special === 'storage'
                ? `<strong style="color:#fbbf24;">🔋 Stockage ENR</strong>`
                : source.special === 'efficiency'
                    ? `<strong style="color:#3b82f6;">🔗 Boost +20%</strong>`
                    : `<strong style="color:#22c55e;">⚡ +${source.output}/tour</strong>`
            }
                </div>
                <div style="display:flex; flex-direction:column; align-items:flex-start;">
                    <span style="color:var(--text-muted); font-size:0.8rem; text-transform:uppercase;">Pollution</span>
                    <strong style="color:${source.pollutionPerTurn > 0 ? '#ef4444' : '#22c55e'};">🏭 ${source.pollutionPerTurn} Gt CO₂</strong>
                </div>
                <div style="display:flex; flex-direction:column; align-items:flex-start;">
                    <span style="color:var(--text-muted); font-size:0.8rem; text-transform:uppercase;">Construction</span>
                    <strong style="color:#f59e0b;">⏱️ ${source.buildTime}tour(s) (-${source.buildCostPerTurn}⚡/tour)</strong>
                </div>
                <div style="display:flex; flex-direction:column; align-items:flex-start;">
                    <span style="color:var(--text-muted); font-size:0.8rem; text-transform:uppercase;">Recherche</span>
                    <strong style="color:#22c55e;">⏱️ ${source.researchTime}tour(s)</strong>
                </div>
                <div style="display:flex; flex-direction:column; align-items:flex-start;">
                    <span style="color:var(--text-muted); font-size:0.8rem; text-transform:uppercase;">Stock </span>
                    <strong>${source.fuelStock ? `<span style="color:#f59e0b;">📦 Stock de ${source.fuelStock}</span>` : `<span style="color:#22c55e;">♻️ Illimité</span>`}</strong>
                </div>
                ${source.weatherDependent ? `<div style="display:flex; flex-direction:column; align-items:flex-start;">
                    <span style="color:var(--text-muted); font-size:0.8rem; text-transform:uppercase;">Météo-sensible</span>
                    <strong style="color:#93c5fd;">🌤️ Oui</strong>
                </div>` : ''}
            </div>
        `;

        this.elements.learn.content.innerHTML = statsHtml + lessonHtml;

        // Afficher bouton Quiz, cacher bouton Level Up
        this.elements.buttons.nextLevel.classList.add('hidden');
        const btnQuiz = this.elements.buttons.startQuiz;
        btnQuiz.classList.remove('hidden');

        // Changer le texte et le comportement au clic
        const isUnlocked = game.unlockedSources.includes(source.id);
        const isResearching = game.currentResearch && game.currentResearch.sourceId === source.id;
        const available = game.getAvailableResearch();
        const quizAlreadyDone = localStorage.getItem('enerSim-quiz-' + source.id) === 'true';

        // Nettoyer tous les évènements attachés au bouton (on va le recréer ou écraser)
        const newBtn = btnQuiz.cloneNode(true);
        btnQuiz.parentNode.replaceChild(newBtn, btnQuiz);
        this.elements.buttons.startQuiz = newBtn;
        newBtn.style.backgroundColor = '';
        newBtn.style.cursor = '';

        if (isUnlocked || isResearching || !available.includes(source)) {
            newBtn.textContent = "Fermer la fiche ✖️";
            // Si elle est dispo mais qu'une aure recherche tourne
            if (!isUnlocked && !isResearching && available.includes(source)) {
                newBtn.textContent = "Recherche déjà en cours 🛑";
            }
            newBtn.addEventListener('click', () => {
                this.showScreen('game');
            });
        } else if (game.isResearching()) {
            newBtn.textContent = "Une recherche est déjà en cours 🛑";
            newBtn.style.backgroundColor = 'var(--text-muted)';
            newBtn.style.cursor = 'not-allowed';
            newBtn.addEventListener('click', () => {
                // Ne fait rien
            });
        } else {
            if (quizAlreadyDone || (!quizData || !quizData.questions || quizData.questions.length === 0)) {
                newBtn.textContent = "Lancer la recherche 🔬";
                // Raccourci direct
                newBtn.addEventListener('click', () => {
                    const status = game.startResearch(source.id);
                    this.updateGameUI();
                    this.showScreen('game');

                    // Glow sur Fin de tour pour guider le joueur (Feu de camp Tour 1)
                    if (source.id === 'wood' && game.currentTurn === 1) {
                        this.elements.buttons.endTurn.classList.add('pulse-glow');
                    }

                    if (status === "instant") {
                        this.showEventBanner(`✨ Technologie apprise : ${source.name}`);
                    } else {
                        this.showEventBanner(`🔬 Recherche lancée : ${source.name}`);
                    }
                });
            } else {
                newBtn.textContent = "Je suis prêt : Passer au Quiz 🧠";
                newBtn.addEventListener('click', () => {
                    this.startQuizFromLesson();
                });
            }
        }

        this.showScreen('learn');
    },

    startQuizFromLesson() {
        const source = this.currentLessonSource;
        game.startQuiz(source.id); // Set logic state
        const quiz = game.getQuizForSource(source.id);

        // Au cas où
        if (!quiz || !quiz.questions || quiz.questions.length === 0) {
            this.showScreen('game');
            return;
        }

        // Première fois qu'on fait un quiz ? Afficher la modale explicative
        if (!this.quizExplained) {
            this.quizExplained = true;
            this.showQuizExplanationModal(() => {
                this.launchQuiz(quiz);
            });
            return;
        }

        this.launchQuiz(quiz);
    },

    showQuizExplanationModal(onClose) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = 'quiz-explanation-modal';
        overlay.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <h2 style="color: var(--color-primary); margin-bottom: 1rem;">🧠 Comment fonctionnent les Quiz ?</h2>
                <div style="line-height: 1.7; color: var(--text-secondary);">
                    <p>Pour débloquer chaque technologie, tu dois répondre à <strong>3 questions</strong>.</p>
                    <div style="background: rgba(239,68,68,0.1); padding: 10px; border-radius: 8px; margin: 10px 0; border-left: 3px solid #ef4444;">
                        <strong>⚠️ Attention !</strong>
                        <ul style="margin: 5px 0; padding-left: 20px; font-size: 0.9em;">
                            <li>Chaque <strong>mauvaise réponse</strong> te coûte <strong>20% de l'objectif d'énergie</strong> de l'âge actuel.</li>
                            <li>Le quiz <strong>recommence depuis le début</strong> avec les réponses mélangées.</li>
                        </ul>
                    </div>
                    <p style="color: var(--color-energy);"><strong>💡 Conseil :</strong> Lis bien la fiche pédagogique avant de répondre !</p>
                </div>
                <button id="btn-quiz-explanation-ok" class="button button-primary" style="width: 100%; margin-top: 1rem;">
                    J'ai compris ! 🚀
                </button>
            </div>
        `;
        document.body.appendChild(overlay);
        document.getElementById('btn-quiz-explanation-ok').addEventListener('click', () => {
            overlay.remove();
            onClose();
        });
    },

    launchQuiz(quiz) {
        // Pénalité cumulée pour ce quiz
        this.quizPenalty = 0;

        // Setup Quiz UI
        this.currentQuizQuestionIndex = 0;
        this.elements.quiz.total.textContent = quiz.questions.length;
        this.showQuizQuestion(0);
        this.showScreen('quiz');
    },

    /**
     * Mélange un tableau (Fisher-Yates) et retourne { shuffled, originalIndices }
     */
    shuffleOptions(options) {
        const indices = options.map((_, i) => i);
        const shuffled = [...options];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        return { shuffled, originalIndices: indices };
    },

    showQuizQuestion(index) {
        const quiz = game.getQuizForSource(game.quizState.targetSourceId);
        const q = quiz.questions[index];
        this.elements.quiz.current.textContent = index + 1;
        this.elements.quiz.question.textContent = q.question;
        this.elements.quiz.options.innerHTML = '';
        this.elements.quiz.feedback.classList.add('hidden');

        // Mélanger les options
        const { shuffled, originalIndices } = this.shuffleOptions(q.options);
        this.currentShuffleMap = originalIndices; // Pour retrouver le bon index

        shuffled.forEach((opt, displayIndex) => {
            const btn = document.createElement('button');
            btn.className = 'button button-outline quiz-option';
            btn.textContent = opt;
            btn.addEventListener('click', () => {
                // L'index original de cette option dans le tableau non-mélangé
                const originalIndex = originalIndices[displayIndex];
                this.handleQuizAnswer(index, originalIndex, btn);
            });
            this.elements.quiz.options.appendChild(btn);
        });
    },

    handleQuizAnswer(qIndex, aIndex, btnElement) {
        // Empêcher double clic
        if (btnElement.disabled) return;

        const isCorrect = game.checkQuizAnswer(qIndex, aIndex);
        const options = this.elements.quiz.options.querySelectorAll('button');
        options.forEach(b => b.disabled = true); // Bloquer tout

        if (isCorrect) {
            btnElement.classList.add('correct');
            this.elements.quiz.feedback.textContent = "Correct ! " + GAME_DATA.quizzes[game.quizState.targetSourceId].questions[qIndex].explanation;
            this.elements.quiz.feedback.className = "feedback-msg success visible";

            setTimeout(() => {
                const quiz = game.getQuizForSource(game.quizState.targetSourceId);
                if (qIndex < quiz.questions.length - 1) {
                    this.showQuizQuestion(qIndex + 1);
                } else {
                    // Quiz terminé avec succès
                    const sourceId = game.quizState.targetSourceId;
                    // Sauver en cache que l'utilisateur a déjà réussi ce quiz (persistant)
                    localStorage.setItem('enerSim-quiz-' + sourceId, 'true');

                    const status = game.startResearch(sourceId);
                    game.recalculateFlows();
                    this.showScreen('game');
                    this.updateGameUI();

                    // Glow sur Fin de tour pour guider le joueur (Feu de camp Tour 1)
                    if (sourceId === 'wood' && game.currentTurn === 1) {
                        this.elements.buttons.endTurn.classList.add('pulse-glow');
                    }

                    const s = GAME_DATA.sources.find(src => src.id === sourceId);
                    if (status === "instant") {
                        this.showEventBanner(`🧠 Quiz réussi ! Technologie apprise : ${s.name}`);
                    } else {
                        this.showEventBanner(`🧠 Quiz réussi ! Recherche lancée : ${s.name}`);
                    }
                }
            }, 2000);

        } else {
            btnElement.classList.add('wrong');

            // Calculer la pénalité (20% du seuil de l'âge = coût supplémentaire/tour)
            const nextLevel = game.getNextLevel();
            const threshold = nextLevel ? nextLevel.ageThreshold : GAME_DATA.levels[game.currentLevel].ageThreshold;
            const penalty = Math.ceil(threshold * 0.2);
            game.quizPenaltyCost = (game.quizPenaltyCost || 0) + penalty;
            game.recalculateFlows(); // Met à jour le turnBalance immédiatement

            this.elements.quiz.feedback.innerHTML = `
                <strong>❌ Mauvaise réponse !</strong><br>
                <span style="color: #ef4444;">+${penalty} ⚡/tour de coût de recherche</span><br>
                <span style="font-size: 0.9em; color: var(--text-muted);">Le quiz recommence depuis le début...</span>
            `;
            this.elements.quiz.feedback.className = "feedback-msg error visible";

            // Reset quiz après un délai : retour à la question 1 avec shuffle
            setTimeout(() => {
                this.showQuizQuestion(0);
            }, 3000);
        }
    },

    // ==========================================
    // LEARN & GAME OVER
    // ==========================================

    showLevelUpScreen() {
        // Mode "Nouvel Âge"
        const level = game.getCurrentLevel();

        this.elements.learn.epoch.textContent = level.name;
        this.elements.learn.epoch.style.backgroundColor = level.color;
        this.elements.learn.title.textContent = `Bienvenue à l'${level.name}`;
        this.elements.learn.content.innerHTML = `
            <h2>${level.unlockMessage}</h2>
            <p style="font-size: 1.2rem; margin-top: 1rem;">Objectif : ${level.objective}</p>
            <p style="margin-top: 2rem; color: #fbbf24;">
                Nouvelles technologies disponibles dans le menu Recherche 🔬
            </p>
        `;

        // Afficher bouton Continue, cacher bouton Quiz
        this.elements.buttons.nextLevel.classList.remove('hidden');
        this.elements.buttons.startQuiz.classList.add('hidden');

        this.showScreen('learn');

        // Déclencher le tutoriel météo si on arrive au Moyen Âge (Index 3)
        if (game.currentLevel === 3 && !localStorage.getItem('evolution-energie-weather-done')) {
            setTimeout(() => {
                this.showWeatherTutorial();
            }, 1000);
        }
    },

    showWeatherTutorial() {
        const step = {
            target: '#weather-display',
            title: '🌤️ Météo Aléatoire',
            text: 'Les éléments météorologiques (Vent / Soleil) s\'activent ! Leurs intensités changent à chaque tour. Surveille ces indicateurs car ils affecteront la production de tes éoliennes et panneaux solaires.'
        };

        // On utilise le même système que showTutorialStep mais simplifié pour une seule bulle
        this.showTutorialStepSingle(step, () => {
            localStorage.setItem('evolution-energie-weather-done', 'true');
        });
    },

    showTutorialStepSingle(step, onDone) {
        const targetEl = document.querySelector(step.target);
        if (!targetEl) return;

        targetEl.style.position = 'relative';
        targetEl.style.zIndex = '3005';
        targetEl.style.boxShadow = '0 0 20px 4px rgba(250, 204, 21, 0.5)';
        targetEl.classList.add('pulse-glow');

        const rect = targetEl.getBoundingClientRect();
        const pad = 8;
        const overlay = document.createElement('div');
        overlay.id = 'tutorial-overlay';
        overlay.innerHTML = `
            <div class="tutorial-spotlight" style="
                top: ${rect.top - pad}px; left: ${rect.left - pad}px;
                width: ${rect.width + pad * 2}px; height: ${rect.height + pad * 2}px;
            "></div>
            <div class="tutorial-bubble" style="
                top: ${rect.bottom + 16}px;
                left: ${Math.max(16, Math.min(rect.left, window.innerWidth - 340))}px;
            ">
                <h3 style="margin: 0 0 0.5rem 0; color: var(--color-energy);">${step.title}</h3>
                <p style="margin: 0 0 1rem 0; color: var(--text-secondary); line-height: 1.5; font-size: 0.9rem;">${step.text}</p>
                <div style="text-align: right;">
                    <button class="button button-primary tutorial-done" style="font-size: 0.85rem; padding: 0.4rem 0.8rem;">J'ai compris !</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        overlay.querySelector('.tutorial-done').addEventListener('click', () => {
            targetEl.style.removeProperty('position');
            targetEl.style.removeProperty('z-index');
            targetEl.style.removeProperty('box-shadow');
            targetEl.classList.remove('pulse-glow');
            overlay.remove();
            if (onDone) onDone();
        });
    },

    showGameOver(victory) {
        const score = game.calculateScore();
        const title = this.elements.screens.gameOver.querySelector('#game-over-title');
        const scoreVal = document.getElementById('score-value');
        const breakdown = document.getElementById('score-breakdown');

        if (victory) {
            title.textContent = "🎉 VICTOIRE ! 🎉";
            title.style.color = "#22c55e";
        } else if (game.pollution >= GAME_DATA.config.co2BudgetMax) {
            title.textContent = "☠️ GAME OVER ☠️";
            title.style.color = "#ef4444";
        } else {
            title.textContent = "⏱️ FIN DE PARTIE ⏱️";
            title.style.color = "#f59e0b";
        }

        scoreVal.textContent = score.total;

        const co2Color = game.pollution >= GAME_DATA.config.co2BudgetMax ? '#ef4444' :
            game.pollution < GAME_DATA.config.co2VictoryThreshold ? '#22c55e' : '#f59e0b';

        breakdown.innerHTML = `
            <div class="score-row" style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 5px; margin-bottom: 5px;">
                <span>🟢 Évolution (${score.ageName}) :</span>
                <span class="text-energy">+ ${score.baseScore} PTS</span>
            </div>
            <div class="score-row" style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 5px; margin-bottom: 5px;">
                <span>🔴 Sobriété (-0,1 PT x ${score.sobrietyValue} ⚡) :</span>
                <span class="text-error">- ${score.sobrietyPenalty} PTS</span>
            </div>
            <div class="score-row" style="color:${co2Color}; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 5px; margin-bottom: 5px;">
                <span>🔴 Pollution (-0,5 PT x ${score.pollution} Gt) :</span>
                <span>- ${score.pollutionPenalty} PTS</span>
            </div>
            <div class="score-row" style="font-weight: 700; font-size: 1.1rem; margin-top: 10px;">
                <span>TOTAL :</span>
                <span>${score.total} PTS</span>
            </div>
            ${game.pollution >= GAME_DATA.config.co2BudgetMax ? `<div class="score-row malus" style="color:#ef4444; font-size:0.85rem; margin-top: 10px;">
                <span>⚠️ Budget carbone dépassé (${GAME_DATA.config.co2BudgetMax} Gt) : Score divisé par 5 !</span>
            </div>` : ''}
            <div class="score-rating" style="text-align:center; font-size: 2rem; margin-top: 1rem;">
                ${score.rating} <br>
                <span style="font-size: 1rem; color: var(--text-muted)">${score.message}</span>
            </div>
        `;

        this.showScreen('gameOver');
    },

    // ==========================================
    // TUTORIEL INTERACTIF (Spotlight pas-à-pas)
    // ==========================================

    tutorialSteps: [
        {
            target: '.energy-gauge',
            title: '⚡ Jauge d\'énergie',
            text: 'Cette jauge montre ton flux d\'énergie net par tour. Le flux d\'énergie est la différence entre l\'énergie produite et l\'énergie consommée. Tu gagnes de l\'énergie en construisant des sources d\'énergie (bois, vent, soleil...) sur la carte.'
        },
        {
            target: '.pollution-gauge',
            title: '🏭 Pollution',
            text: 'Attention à cette jauge ! Si elle atteint 100%, c\'est Game Over. Privilégie les énergies propres pour limiter la pollution.'
        },
        {
            target: '.sobriety-gauge',
            title: '🧘 Sobriété',
            text: 'Toute construction consomme de l\'énergie. Moins tu dépenses, meilleur sera ton score final !'
        },
        {
            target: '#research-panel',
            title: '🔬 Recherche',
            text: 'Ce panneau liste les technologies à découvrir. Chaque recherche demande de réussir un quiz et coûte de l\'énergie par tour.'
        },
        {
            target: '#game-map',
            title: '🗺️ La Carte',
            text: 'Clique sur une case pour construire tes bâtiments. Chaque terrain (rivière, forêt, plaine) permet de construire des technologies différentes.'
        },
        {
            target: '#btn-end-turn',
            title: '⏳ Fin de tour',
            text: 'Une fois tes actions terminées, clique ici pour passer au tour suivant. Ton énergie et ta recherche progresseront.'
        },
        {
            target: '.epoch-info',
            title: '🏛️ Âge Actuel',
            text: 'Atteins l\'objectif d\'énergie nette pour changer d\'époque et débloquer le futur !'
        }
    ],

    startTutorial() {
        // Ne montrer le tuto qu'une seule fois (localStorage)
        if (localStorage.getItem('evolution-energie-tutorial-done')) return;

        this.currentTutorialStep = 0;
        this.showTutorialStep(0);
    },

    showTutorialStep(index) {
        // Supprimer l'overlay précédent et restaurer l'élément précédent
        const existing = document.getElementById('tutorial-overlay');
        if (existing) existing.remove();
        if (this._tutorialPrevEl) {
            this._tutorialPrevEl.style.removeProperty('position');
            this._tutorialPrevEl.style.removeProperty('z-index');
            this._tutorialPrevEl.style.removeProperty('box-shadow');
            this._tutorialPrevEl = null;
        }

        if (index >= this.tutorialSteps.length) {
            // Tutoriel terminé
            localStorage.setItem('evolution-energie-tutorial-done', 'true');
            this.renderResearchList(); // Pour faire apparaître le glow du feu de camp immédiatement
            return;
        }

        const step = this.tutorialSteps[index];
        const targetEl = document.querySelector(step.target);
        if (!targetEl) {
            this.showTutorialStep(index + 1);
            return;
        }

        // Faire ressortir l'élément ciblé au-dessus de l'overlay
        targetEl.style.position = 'relative';
        targetEl.style.zIndex = '3005';
        targetEl.style.boxShadow = '0 0 20px 4px rgba(250, 204, 21, 0.5)';
        this._tutorialPrevEl = targetEl;

        const rect = targetEl.getBoundingClientRect();
        const pad = 8;

        // Calculer la position de la bulle : en dessous par défaut, au-dessus si débordement
        const bubbleEstHeight = 180; // estimation hauteur bulle
        const spaceBelow = window.innerHeight - rect.bottom;
        const placeAbove = spaceBelow < bubbleEstHeight + 24;

        const bubbleTop = placeAbove
            ? rect.top - bubbleEstHeight - 16
            : rect.bottom + 16;

        const bubbleLeft = Math.max(16, Math.min(rect.left, window.innerWidth - 340));

        // Créer l'overlay (un seul élément sombre + bulle, pas de double backdrop)
        const overlay = document.createElement('div');
        overlay.id = 'tutorial-overlay';
        overlay.innerHTML = `
            <div class="tutorial-spotlight" style="
                top: ${rect.top - pad}px; left: ${rect.left - pad}px;
                width: ${rect.width + pad * 2}px; height: ${rect.height + pad * 2}px;
            "></div>
            <div class="tutorial-bubble ${placeAbove ? 'above' : ''}" style="
                top: ${bubbleTop}px;
                left: ${bubbleLeft}px;
            ">
                <h3 style="margin: 0 0 0.5rem 0; color: var(--color-energy);">${step.title}</h3>
                <p style="margin: 0 0 1rem 0; color: var(--text-secondary); line-height: 1.5; font-size: 0.9rem;">${step.text}</p>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: var(--text-muted); font-size: 0.8rem;">${index + 1} / ${this.tutorialSteps.length}</span>
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="button button-secondary tutorial-skip" style="font-size: 0.85rem; padding: 0.4rem 0.8rem;">Passer ✕</button>
                        <button class="button button-primary tutorial-next" style="font-size: 0.85rem; padding: 0.4rem 0.8rem;">
                            ${index < this.tutorialSteps.length - 1 ? 'Suivant →' : 'C\'est parti ! 🚀'}
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        overlay.querySelector('.tutorial-next').addEventListener('click', () => {
            this.showTutorialStep(index + 1);
        });
        overlay.querySelector('.tutorial-skip').addEventListener('click', () => {
            // Restaurer l'élément
            targetEl.style.removeProperty('position');
            targetEl.style.removeProperty('z-index');
            targetEl.style.removeProperty('box-shadow');
            overlay.remove();
            localStorage.setItem('evolution-energie-tutorial-done', 'true');
            this.renderResearchList(); // Pour faire apparaître le glow du feu de camp immédiatement
        });
    }
};

