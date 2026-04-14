import DataManager from '../data/dataManager.js';

class MotorMovementDetector {
    constructor(ticker) {
        this.ticker = ticker;

        // 🔥 PER-BALL MOTOR DATA - Each ball gets completely isolated data
        this.ballMotorData = {};  // Map: ballNumber -> ballMotorData (ISOLATED per ball)
        this.ballTimings = {};    // Map: ballNumber -> { clickTime, hitTime } (SEPARATE timing storage)
        
        this.currentBallNumber = 0;
        this.currentBallData = null;

        // Legacy compatibility (NOT used for timing)
        this.events = [];
        this.startPosition = null;
    }

    // 🔷 INITIALIZE PER-BALL MOTOR DATA
    initializeBallMotorData(ballNumber) {
        // 🔥 FRESH DATA FOR EACH BALL - Never reuse
        if (!this.ballMotorData[ballNumber]) {
            this.ballMotorData[ballNumber] = {
                ballNumber,
                startPosition: null,          // Position at click
                endPosition: null,            // Position at hit
                distance: 0,                  // D = |endX - startX|
                width: 0.5,                   // W parameter for Fitts Law
                indexOfDifficulty: 0,         // ID = log2(D/W + 1)
                movementTime: 0,              // 🔥 MT = movementStartTime - clickTime (NOT hitTime)
                throughput: 0,                // TP = ID / MT
                reactionTime: 0,              // Reaction Time = ballReachTime - clickTime
                lerpTime: 0,                  // LERP duration (separate)
                events: []
            };
        }
        
        // 🔥 CREATE ISOLATED TIMING OBJECT FOR THIS BALL
        if (!this.ballTimings[ballNumber]) {
            this.ballTimings[ballNumber] = {
                ballNumber,
                clickTime: null,              // When user clicked
                movementStartTime: null,      // 🔥 When batsman movement starts
                hitTime: null,                // When batsman hit (for logging only)
                movementTime: null            // 🔥 Calculated MT = movementStartTime - clickTime
            };
        }
        
        this.currentBallNumber = ballNumber;
        this.currentBallData = this.ballMotorData[ballNumber];
    }

    // 🔷 SET ORIGINAL POSITION
    setStartPosition(pos) {
        this.startPosition = pos;
    }

    // 🔷 DETECT MOVEMENT WITH CONTEXT
    detectMovement(type, currentPosition, context = {}) {
        const timestamp = performance.now();  // 🔥 Use performance.now() consistently
        const ballNumber = context.ballNumber || window.currentBall || this.currentBallNumber;

        // 🔥 ENSURE BALL DATA IS INITIALIZED
        if (ballNumber !== this.currentBallNumber) {
            this.initializeBallMotorData(ballNumber);
        }

        const ballData = this.ballMotorData[ballNumber];
        const ballTiming = this.ballTimings[ballNumber];
        
        // 🔥 WHEN USER CLICKS: Store clickTime in ISOLATED timing storage
        if (type === 'click') {
            if (context.clickTime) {
                ballTiming.clickTime = context.clickTime;  // 🔥 Store in isolated ballTiming
                ballData.startPosition = currentPosition ? { x: currentPosition.x } : null;
                console.log(`✅ CLICK EVENT (Ball ${ballNumber}): clickTime=${ballTiming.clickTime}ms, position.x=${currentPosition?.x ?? 'N/A'}`);
            }
            
            // Reset startPosition for movement tracking
            this.startPosition = null;
            return;
        }

        // 🔥 CAPTURE FIRST REAL MOVEMENT (not click, not initial)
        if (!this.startPosition && currentPosition) {
            this.startPosition = currentPosition.clone();
            // 🔥 FIRST MOVEMENT DETECTED - Capture movementStartTime immediately
            if (!ballTiming.movementStartTime && ballTiming.clickTime !== null) {
                ballTiming.movementStartTime = timestamp;
                // 🔥 CALCULATE MT = movementStartTime - clickTime (NOT hitTime)
                ballTiming.movementTime = Math.round(ballTiming.movementStartTime - ballTiming.clickTime);
                ballData.movementTime = ballTiming.movementTime;
                console.log(`✅ MOVEMENT START (Ball ${ballNumber}): movementStartTime=${ballTiming.movementStartTime}ms`);
                console.log(`   MT = ${ballTiming.movementTime}ms (movement - click)`);
            }
            return;
        }

        if (!this.startPosition || !currentPosition) {
            return;
        }

        // 🔷 Distance (D) - X-AXIS ONLY
        const dx = currentPosition.x - this.startPosition.x;
        const distance = Math.abs(dx);

        // 🔷 Target Width (W) - Bat width / tolerance
        const W = ballData.width;

        // 🔥 FITTS LAW: ID = log2(D / W + 1)
        const ID = Math.log2((distance / W) + 1);

        let isHit = false;
        let throughput = 0;

        // 🔥 WHEN BATSMAN HITS: Use existing MT (already calculated from movement start)
        if (type === 'batsman_hit') {
            isHit = true;
            
            // 🔥 LOG HIT TIME (for reference only, NOT for MT calculation)
            ballTiming.hitTime = timestamp;
            console.log(`✅ HIT EVENT (Ball ${ballNumber}):`);
            console.log(`   clickTime: ${ballTiming.clickTime}ms`);
            console.log(`   movementStartTime: ${ballTiming.movementStartTime}ms`);
            console.log(`   hitTime: ${ballTiming.hitTime}ms`);
            console.log(`   movementTime (already calculated): ${ballTiming.movementTime}ms`);
            
            // 🔥 CALCULATE THROUGHPUT USING EXISTING MOVEMENT TIME
            const movementTime = ballTiming.movementTime || 0;
            throughput = (movementTime > 0 && ID > 0)
                ? Number((ID / movementTime).toFixed(4))
                : 0;
            
            // 🔥 STORE ALL CALCULATED DATA IN ISOLATED BALL DATA
            ballData.endPosition = {
                x: currentPosition.x
            };
            ballData.distance = Number(distance.toFixed(3));
            ballData.width = W;
            ballData.indexOfDifficulty = Number(ID.toFixed(3));
            ballData.movementTime = movementTime;  // 🔥 USE EXISTING MT (NOT recalculated)
            ballData.throughput = throughput;
            ballData.reactionTime = context.reactionTime || 0;
            
            if (context.lerpData) {
                ballData.lerpTime = context.lerpData.lerpTime || 0;
            }
            
            console.log(`✅ FITTS LAW (Ball ${ballNumber}): D=${ballData.distance}, ID=${ballData.indexOfDifficulty}, MT=${ballData.movementTime}ms, TP=${ballData.throughput}`);
            
            // 🎯 TRIGGER TICKER MESSAGE FOR FITTS LAW ANALYSIS
            if (this.ticker && this.ticker.onFittsLawAnalysis) {
                this.ticker.onFittsLawAnalysis(ballNumber, ballData);
            }
            
            // Legacy callback
            this.ticker?.onBatsmanHit?.();
        }

        const event = {
            type,
            timestamp,
            movementTime: isHit ? (ballTiming.movementTime || 0) : 0,
            distance,
            indexOfDifficulty: Number(ID.toFixed(3)),
            throughput,
            isHit
        };

        this.events.push(event);
        if (ballData) {
            ballData.events.push(event);
        }

        // 🔥 UPDATE START POSITION FOR NEXT MOVEMENT (X-axis tracking)
        if (type !== 'batsman_hit') {
            this.startPosition = currentPosition.clone();
        }

        console.log(`✅ MOTOR EVENT (Ball ${ballNumber}):`, event);
    }

    // 🔥 GET PER-BALL MOTOR ANALYSIS RESULTS (FITTS LAW ONLY)
    getPerBallResults() {
        const results = [];
        
        // Motor analysis: D, W, ID, MT, TP only (no positions, no LERP)
        for (const ballNum in this.ballMotorData) {
            const data = this.ballMotorData[ballNum];
            
            results.push({
                ballNumber: data.ballNumber,
                distance: Number(data.distance.toFixed(3)),           // D
                width: data.width,                                     // W
                indexOfDifficulty: data.indexOfDifficulty,            // ID
                movementTime: Math.round(data.movementTime),          // MT
                throughput: data.throughput                            // TP
            });
        }
        
        return results;
    }

    // 🔥 FORMAT PER-BALL RESULTS FOR DISPLAY (FITTS LAW)
    formatPerBallResultsForDisplay() {
        const results = this.getPerBallResults();
        let formatted = '';
        
        results.forEach(ball => {
            formatted += `Ball ${ball.ballNumber}:\n`;
            formatted += `  Distance (D) = ${ball.distance.toFixed(3)} units\n`;
            formatted += `  Width (W) = ${ball.width} units\n`;
            formatted += `  Index of Difficulty (ID) = ${ball.indexOfDifficulty.toFixed(3)} bits\n`;
            formatted += `  Movement Time (MT) = ${ball.movementTime} ms\n`;
            formatted += `  Throughput (TP) = ${ball.throughput.toFixed(4)} bits/ms\n\n`;
        });
        
        return formatted.trim();
    }

    // 🔥 GET SUMMARY STATISTICS (FITTS LAW)
    getSummaryStatistics() {
        const results = this.getPerBallResults();
        
        if (results.length === 0) {
            return {
                ballsAnalyzed: 0,
                avgDistance: 0,
                avgWidth: 0,
                avgID: 0,
                avgMovementTime: 0,
                avgThroughput: 0
            };
        }

        let totalDistance = 0;
        let totalWidth = 0;
        let totalID = 0;
        let totalMovementTime = 0;
        let totalThroughput = 0;

        results.forEach(ball => {
            totalDistance += ball.distance;
            totalWidth += ball.width;
            totalID += ball.indexOfDifficulty;
            totalMovementTime += ball.movementTime;
            totalThroughput += ball.throughput;
        });

        const count = results.length;

        return {
            ballsAnalyzed: count,
            avgDistance: Number((totalDistance / count).toFixed(3)),
            avgWidth: Number((totalWidth / count).toFixed(3)),
            avgID: Number((totalID / count).toFixed(3)),
            avgMovementTime: Math.round(totalMovementTime / count),
            avgThroughput: Number((totalThroughput / count).toFixed(4))
        };
    }

    // 🔥 FINAL RESULT - FITTS LAW ANALYSIS
    getFinalResult() {
        const stats = this.getSummaryStatistics();
        
        return {
            motorAnalysis: {
                avgDistance: stats.avgDistance,
                avgWidth: stats.avgWidth,
                avgID: stats.avgID,
                avgMovementTime: stats.avgMovementTime,
                avgThroughput: stats.avgThroughput,
                ballsAnalyzed: stats.ballsAnalyzed
            },
            perBallResults: this.getPerBallResults(),
            events: this.events
        };
    }

    // 🔥 DEBUG: Display per-ball timing details (ISOLATED)
    displayPerBallTimings() {
        console.log("\n🔥 ===== PER-BALL TIMING DETAILS (ISOLATED) =====");
        for (const ballNum in this.ballTimings) {
            const timing = this.ballTimings[ballNum];
            const data = this.ballMotorData[ballNum];
            console.log(`\nBall ${ballNum}:`);
            console.log(`  clickTime: ${timing.clickTime}ms`);
            console.log(`  hitTime: ${timing.hitTime}ms`);
            console.log(`  movementTime: ${timing.movementTime}ms`);
            console.log(`  distance: ${data.distance}`);
            console.log(`  indexOfDifficulty: ${data.indexOfDifficulty}`);
            console.log(`  throughput: ${data.throughput}`);
        }
        console.log("🔥 =============================================\n");
    }

    reset() {
        this.ballMotorData = {};      // 🔥 Clear all ball data
        this.ballTimings = {};        // 🔥 Clear all timing data
        this.currentBallNumber = 0;
        this.currentBallData = null;
        this.events = [];
        this.startPosition = null;
    }
}

export default MotorMovementDetector;