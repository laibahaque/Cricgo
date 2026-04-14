// Main scene controller - orchestrates all game systems
import * as THREE from "three";
import { createSceneEnvironment, setupCameraResize } from "../modules/game/sceneSetup.js";
import { createGround } from "../objects/Ground.js";
import { createPitch } from "../objects/Pitch.js";
import { createWickets, createBails, resetBails } from "../modules/game/wickets.js";
import { createBall, updateBallPhysics, resetBallPosition, checkBoundaryCollision } from "../objects/Ball.js";
import { createBat, updateBatSwing, startBatSwing, attachBatToHand } from "../objects/Bat.js";
import {
    loadBatsman, loadBowler, loadStadium
} from "../objects/Character.js";
import {
    createMovementState, setupKeyboardControls, updateCameraMovement, isAnyPopupOpen
} from "../modules/input/inputControls.js";
import {
    createBowlingTrajectory, setRandomBowlingDirection, calculateBallTrajectory, kmhToMs
} from "../modules/physics/bowlingPhysics.js";
import {
    checkBallWicketCollision, checkBatBallCollision, updateBatsmanPosition,
    handleBallHit, handleWicketHit, calculateHitPower, updateBailPhysics
} from "../modules/game/gameLogic.js";
import { isGameStarted, getCurrentScore, updateScore } from "../ui/ui.js";

let gameState = {
    ballLaunched: false,
    bailFalling: false,
    stopGame: false,
    batHitTriggered: false,
    score: 0,
    ballSpeedKmh: 0,
    ballSpeed: 0,
    elapsedTime: 0,
    t: 0,
    releaseTime: 0,
    bowlStartTime: 0,
    ballsPlayed: 0,
    gameEnded: false,
    isPaused: false
};

export function createThreeScene(canvas) {
    const initialSpeed = 90; // Default speed
    gameState.ballSpeedKmh = initialSpeed;
    gameState.ballSpeed = kmhToMs(initialSpeed);

    // Setup
    const { scene, camera, renderer, controls } = createSceneEnvironment();
    setupCameraResize(camera, renderer);

    // Ground setup
    const ground = createGround(scene);
    const pitch = createPitch(scene);

    // Game elements
    const wickets = createWickets(scene);
    const bails = createBails(scene);
    const ball = createBall(scene);
    const bat = createBat(scene);

    // Bowling setup
    const trajectory = createBowlingTrajectory();
    setRandomBowlingDirection(trajectory);

    // Character refs
    const characters = {};
    const movement = createMovementState();

    // Ball tracking
    let previousBallPosition = new THREE.Vector3();
    let playTipVisible = false;

    function setPlayTipVisible(visible) {
        if (playTipVisible === visible) return;
        playTipVisible = visible;
        window.dispatchEvent(new Event(visible ? 'show-play-tip' : 'hide-play-tip'));
    }

    window.addEventListener('game-pause', () => {
        gameState.isPaused = true;
        setPlayTipVisible(false);
    });

    window.addEventListener('game-resume', () => {
        gameState.isPaused = false;
    });

    // Initialize game state
    gameState.score = getCurrentScore();
    updateScore(gameState.score);

    // Load all character models
    Promise.all([
        loadBatsman(scene),
        loadBowler(scene),
        loadStadium(scene)
    ]).then(([batsmanData, bowlerData, stadiumData]) => {
        characters.batsman = batsmanData;
        characters.bowler = bowlerData;

        // Attach bat to batsman's hand
        attachBatToHand(bat.group, characters.batsman.model);
    });

    // INPUT HANDLING
    const { handleKeyDown, handleKeyUp } = setupKeyboardControls(
        movement,
        null,
        null,
        (movementType) => {
            if (window.motorDetector) {
                window.motorDetector.detectMovement(movementType);
            }
        }
    );

    function conditionalKeyDown(e) {
        if (!isAnyPopupOpen()) handleKeyDown(e);
    }
    function conditionalKeyUp(e) {
        if (!isAnyPopupOpen()) handleKeyUp(e);
    }

    function triggerGameEnd() {
        if (gameState.gameEnded) return;
        gameState.gameEnded = true;
        gameState.stopGame = true;
        gameState.ballLaunched = false;

        // Collect LERP results for final summary
        const lerpResults = window.lerpDetector ? window.lerpDetector.getResults() : [];

        // Dispatch event to trigger final popup with LERP data
        window.dispatchEvent(new CustomEvent('game-end', {
            detail: {
                ballsPlayed: gameState.ballsPlayed,
                finalScore: gameState.score,
                lerpResults: lerpResults,
                lerpSummary: window.lerpDetector ? window.lerpDetector.formatResultsForDisplay() : ''
            }
        }));
    }

    window.addEventListener('keydown', conditionalKeyDown);
    window.addEventListener('keyup', conditionalKeyUp);

    // EVENTS
    window.addEventListener("player-resume", () => {
        gameState.score = getCurrentScore();
        updateScore(gameState.score);
    });

    window.addEventListener("reset-game", () => {
        gameState.t = 0;
        gameState.elapsedTime = 0;
        updateScore(gameState.score);
        gameState.stopGame = false;
        gameState.ballLaunched = true;
        gameState.bailFalling = false;
        gameState.batHitTriggered = false;

        if (characters.batsman?.model?.userData) {
            characters.batsman.model.userData.wasMoving = false;
            characters.batsman.model.userData.lerpT = 0;
            characters.batsman.model.userData.hasCompletedMove = false;
        }

        resetBails(bails);
        resetBallPosition(ball, trajectory.ballStart);
    });

    window.addEventListener("ball-restart", () => {
        gameState.t = 0;
        gameState.elapsedTime = 0;
        gameState.ballLaunched = true;
        gameState.batHitTriggered = false;

        // Reset state tracking for new ball
        if (characters.batsman?.model?.userData) {
            characters.batsman.model.userData.wasMoving = false;
            characters.batsman.model.userData.lerpT = 0;
            characters.batsman.model.userData.hasCompletedMove = false;
        }

        resetBails(bails);
        resetBallPosition(ball, trajectory.ballStart);
        setRandomBowlingDirection(trajectory);
    });

    // CLICK TO BOWL
    window.addEventListener("click", () => {
        if (!isGameStarted()) return;
        if (!characters.bowler?.throwAction || characters.bowler.throwAction.isRunning()) return;

        resetBails(bails);
        resetBallPosition(ball, trajectory.ballStart);
        gameState.t = 0;
        gameState.elapsedTime = 0;
        gameState.ballLaunched = false;
        gameState.batHitTriggered = false;

        setRandomBowlingDirection(trajectory);

        const d1 = trajectory.ballStart.distanceTo(trajectory.bouncePoint);
        const d2 = trajectory.bouncePoint.distanceTo(trajectory.ballEnd);
        const totalDistance = d1 + d2;

        const BALL_TIME_SCALE = 3.5;
        const travelTime = (totalDistance / gameState.ballSpeed) * BALL_TIME_SCALE;

        gameState.elapsedTime = 0;

        gameState.d1 = d1;
        gameState.d2 = d2;
        gameState.totalDistance = totalDistance;
        gameState.travelTime = travelTime;

        ball.userData.released = false;

        const DEFAULT_SPEED_KMH = 90;
        const animationSpeedFactor = gameState.ballSpeedKmh / DEFAULT_SPEED_KMH;
        characters.bowler.throwAction.timeScale = animationSpeedFactor;

        const RELEASE_PROGRESS = 0.3;
        const animationClipDuration = characters.bowler.throwAction.getClip().duration;
        gameState.releaseTime = (RELEASE_PROGRESS * animationClipDuration) / animationSpeedFactor;
        gameState.bowlStartTime = 0;
        bowlTimeElapsed = 0;  // Reset bowl timer

        characters.bowler.throwAction.reset().play();
        ball.userData.velocity = null;
        ball.userData.hasTouchedGround = false;
        gameState.ballsPlayed += 1;
        window.currentBall = gameState.ballsPlayed;

        // Motor movement detection
        if (window.motorDetector) {
            window.motorDetector.detectMovement('bowler_animation');
        }
    });

    // ANIMATION LOOP
    const clock = new THREE.Clock();
    const BATSMAN_SPEED = 4;
    let bowlTimeElapsed = 0;
    function animate() {
        requestAnimationFrame(animate);
        previousBallPosition.copy(ball.position);

        // Pause handling
        if (gameState.isPaused) {
            controls.enabled = false;
            renderer.render(scene, camera);
            return;
        }

        // Camera and controls
        const isBallInFlight = gameState.ballLaunched && !gameState.batHitTriggered && gameState.elapsedTime <= gameState.travelTime;
        const isBowlerIdle = !characters.bowler?.throwAction || !characters.bowler.throwAction.isRunning();
        const shouldShowPlayTip = isGameStarted() && isBowlerIdle && !isAnyPopupOpen() && !isBallInFlight && !gameState.isPaused;
        setPlayTipVisible(shouldShowPlayTip);

        if (!isAnyPopupOpen() && !isBallInFlight) {
            updateCameraMovement(camera, movement);
            controls.enabled = true;
        } else {
            controls.enabled = false;
        }

        let delta = clock.getDelta();
        delta = Math.min(delta, 0.033);

        // Bowler throw animation and ball release timing
        if (characters.bowler?.throwAction && characters.bowler.throwAction.isRunning() && !ball.userData.released) {
            bowlTimeElapsed += delta;

            if (bowlTimeElapsed >= gameState.releaseTime) {
                gameState.ballLaunched = true;
                ball.userData.released = true;
                bowlTimeElapsed = 0;

                if (characters.batsman?.action) {
                    const DEFAULT_SPEED_KMH = 90;
                    const batsmanAnimationSpeedFactor = gameState.ballSpeedKmh / DEFAULT_SPEED_KMH;
                    characters.batsman.action.timeScale = batsmanAnimationSpeedFactor;

                    characters.batsman.action.reset();
                    characters.batsman.action.play();
                }
            }
        }

        // Ball trajectory animation
        if (
            isGameStarted() &&
            gameState.ballLaunched &&
            !gameState.stopGame &&
            !gameState.batHitTriggered &&
            gameState.elapsedTime <= gameState.travelTime
        ) {
    gameState.elapsedTime += delta;
    gameState.t = gameState.elapsedTime / gameState.travelTime;

    const { ballPosition } = calculateBallTrajectory(
        delta,
        gameState.t,
        trajectory,
        gameState.ballSpeed
    );

    ball.position.copy(ballPosition);

    // Batsman tracking and LERP movement
    if (characters.batsman?.model && gameState.ballLaunched && !gameState.batHitTriggered) {
        updateBatsmanPosition(
            characters.batsman.model,
            ball.position,
            -1.2, 1.2,
            BATSMAN_SPEED,
            delta
        );
    }

    // Wicket collision
    if (!gameState.batHitTriggered) {
        if (checkBallWicketCollision(ball, wickets.boxes, wickets.meshes)) {
            gameState.bailFalling = true;
            gameState.stopGame = true;
            gameState.t = 1.05;
            ball.userData.velocity = null;
            handleWicketHit();
            triggerGameEnd();
        }
    }
        }

        // Safety: Ensure LERP completes if ball travel ends
        if (gameState.ballLaunched && gameState.elapsedTime > gameState.travelTime && !gameState.batHitTriggered && characters.batsman?.model?.userData?.wasMoving) {
            // Force t to 1 to complete movement
            characters.batsman.model.userData.lerpT = 1;

            // Manually call the LERP end since movement loop won't trigger
            if (window.lerpDetector) {
                window.lerpDetector.endBatsmanLerp(
                    window.currentBall,
                    characters.batsman.model.position.x
                );
            }

            characters.batsman.model.userData.wasMoving = false;
            characters.batsman.model.userData.hasCompletedMove = true;
        }

        // Bat-ball collision
        if (bat.group && bat.blade && gameState.ballLaunched && !gameState.batHitTriggered) {
            if (checkBatBallCollision(ball, bat, previousBallPosition)) {
                gameState.batHitTriggered = true;
                ball.userData.state = "hit";
                ball.userData.scoredWide = false;
                ball.userData.scoredSix = false;
                ball.userData.hasTouchedGround = false;
                ball.userData.fourAwarded = false;

                // Motor movement detection
                if (window.motorDetector) {
                    window.motorDetector.detectMovement('batsman_hit');
                }

                startBatSwing(bat);

                // Calculate hit
                const angle = Math.random() * Math.PI * 2;
                const { power, height, isSix } = calculateHitPower(gameState.ballSpeedKmh);

                const direction = new THREE.Vector3(
                    Math.cos(angle),
                    height,
                    Math.sin(angle)
                );

                ball.userData.velocity = direction.normalize().multiplyScalar(power);

                if (isSix) {
                    gameState.score = handleBallHit(ball, gameState.score, 6);
                }
            }
        }

        // Slow ball
        if (gameState.ballLaunched && !gameState.batHitTriggered && ball.position.z < -4.8) {
            gameState.elapsedTime -= delta * 0.6;
        }
        const distanceFromCenter = checkBoundaryCollision(ball, ground.radius);

        if (
            gameState.batHitTriggered &&
            ball.userData.hasTouchedGround &&
            !ball.userData.scoredSix &&
            !ball.userData.fourAwarded &&
            distanceFromCenter >= ground.boundaryRadius
        ) {
            gameState.score = handleBallHit(ball, gameState.score, 4);
        }

        if (distanceFromCenter > ground.radius - 0.2) {
            const angle = Math.atan2(ball.position.z, ball.position.x);
            ball.position.x = Math.cos(angle) * (ground.radius - 0.2);
            ball.position.z = Math.sin(angle) * (ground.radius - 0.2);
        }

        if (
            gameState.batHitTriggered &&
            ball.userData.hasTouchedGround &&
            !ball.userData.scoredSix &&
            !ball.userData.fourAwarded &&
            ball.userData.velocity === null
        ) {
            gameState.score = handleBallHit(ball, gameState.score, 1);
        }

        // Bail falling animation
        if (gameState.bailFalling) {
            updateBailPhysics(bails, delta, pitch.bounds);
        }

        // Ball physics
        updateBallPhysics(ball, delta);

        if (gameState.ballsPlayed >= 6 && !gameState.gameEnded && gameState.ballLaunched && ball.userData.velocity === null) {
            triggerGameEnd();
        }

        if (characters.bowler?.mixer) characters.bowler.mixer.update(delta);
        if (characters.batsman?.mixer && characters.batsman.action) {
            characters.batsman.mixer.update(delta);
        }

        controls.update();
        renderer.render(scene, camera);
    }

animate();
}
