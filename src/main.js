import "./ui/ui.js";
import { createThreeScene } from "./controllers/threeSceneController.js";
import Ticker from "./ui/ticker.js";
import MotorMovementDetector from "./tracking/motorMovement.js";
import LerpDetector from "./tracking/lerpDetection.js";
import CalculationPopup from "./ui/calculationPopup.js";
import FinalPopup from "./ui/finalPopup.js";
import MysteryBox from "./ui/mysteryBox.js";
import DataManager from "./data/dataManager.js";

const canvas = document.getElementById("app");

// Global instances
window.ticker = new Ticker();
window.motorDetector = new MotorMovementDetector(window.ticker);
window.dataManager = new DataManager();
window.mysteryBoxShown = false;
window.gamePaused = false;
window.addEventListener('game-pause', () => {
    window.gamePaused = true;
});
window.addEventListener('game-resume', () => {
    window.gamePaused = false;
});

// After the existing onboarding (in ui.js), create the scene
window.addEventListener('game-started', () => {
    window.ticker.startGame();
    createThreeScene(canvas);
    hookGameEvents();
});

function hookGameEvents() {
    // Create lerp detector
    window.lerpDetector = new LerpDetector(window.ticker, (lerpData) => {
        const ballData = {
            movementType: lerpData.movementType || 'batting',
            movementTime: lerpData.duration,
            lerpTime: lerpData.duration,
            distance: lerpData.distance,
            ballNumber: lerpData.ballNumber,
            indexOfDifficulty: lerpData.indexOfDifficulty,
            fittsBallMetric: lerpData.fittsBallMetric,
            duration: lerpData.duration
        };

        // 🔥 COLLECT DATA SILENTLY - NO PER-BALL POPUPS
        // All analysis (LERP + Motor) will be shown ONLY in the final summary
        window.dataManager.addBallData(ballData);
        // ❌ REMOVED: new CalculationPopup(ballData);
    });

    // Listen for game end event from controller
    window.addEventListener('game-end', (e) => {
        const details = e.detail;
        const data = window.dataManager.getData();
        data.finalScore = details.finalScore;
        data.ballsPlayed = details.ballsPlayed;
        data.lerpResults = details.lerpResults;
        data.lerpSummary = details.lerpSummary;
        // 🔥 ATTACH MOTOR ANALYSIS SUMMARY
        data.motorAnalysisSummary = window.motorDetector?.formatPerBallResultsForDisplay() || '';
        data.motorAnalysisStats = window.motorDetector?.getSummaryStatistics() || {};

        new FinalPopup(data, () => {
            // Reset for new game
            window.dataManager.resetBalls();
            window.motorDetector?.reset();
            window.mysteryBoxShown = false;
        });
    });

    // Mystery box trigger (randomly once per game)
    setTimeout(() => {
        if (!window.mysteryBoxShown) {
            window.mysteryBoxShown = true;
            new MysteryBox((reward) => {
                // No ticker message for mystery box
            });
        }
    }, Math.random() * 30000 + 10000); // Random between 10-40 seconds
}