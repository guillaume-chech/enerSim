/**
 * EnerSim - Point d'entrée
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialiser l'interface
    UI.init();

    console.log('🎮 EnerSim - Jeu initialisé !');
    console.log('📚 Niveaux disponibles :', GAME_DATA.levels.map(l => l.name).join(' → '));
});
