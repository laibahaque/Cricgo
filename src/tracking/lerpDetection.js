class LerpDetector {
    constructor(ticker, onLerpComplete = null) {
        this.ticker = ticker;
        this.onLerpComplete = onLerpComplete; // 🔥 CALLBACK FOR PER-BALL COMPLETION
        this.current = null;
        this.results = [];
        this.startTime = null; // 🔥 TRACK LERP DURATION
    }

    lerp(A, B, t) {
        return (1 - t) * A + t * B;
    }

    startBatsmanLerp(startX, targetX, ballNumber) {
        if (this.current) return;

        this.current = {
            ballNumber,
            lerpStartX: startX,  // A
            lerpTargetX: targetX  // B
        };
        
        this.startTime = performance.now(); // 🔥 TRACK START TIME
    }

    endBatsmanLerp(ballNumber, endX) {
        if (!this.current) return;

        const A = this.current.lerpStartX;
        const B = endX;  // Final position reached
        
        // 🔥 CALCULATE LERP DURATION
        const lerpDuration = this.startTime ? performance.now() - this.startTime : 0;

        // Calculate TRUE LERP value at t=0.5 (midpoint)
        const lerpMidpoint = this.lerp(A, B, 0.5);

        const data = {
            ballNumber,
            startX: A,
            endX: B,
            distance: Math.abs(B - A),
            lerpResult: lerpMidpoint,  // Value at t=0.5
            duration: lerpDuration, // 🔥 ADD DURATION

            // Full curve for reference
            lerp: {
                t0: this.lerp(A, B, 0),
                t05: this.lerp(A, B, 0.5),
                t1: this.lerp(A, B, 1),
                t025: this.lerp(A, B, 0.25),
                t075: this.lerp(A, B, 0.75)
            }
        };

        this.results.push(data);

        console.log(`🏏 Ball ${ballNumber}:`, {
            startX: A.toFixed(3),
            endX: B.toFixed(3),
            lerpResult: lerpMidpoint.toFixed(3),
            duration: lerpDuration.toFixed(0)
        });
        
        // 🔥 TRIGGER CALLBACK IF PROVIDED
        if (this.onLerpComplete) {
            this.onLerpComplete(data);
        }

        this.current = null;
        this.startTime = null;
    }

    getResults() {
        return this.results;
    }

    // Format results for final popup display
    formatResultsForDisplay() {
        return this.results.map(result => 
            `Ball ${result.ballNumber} → (start: ${result.startX.toFixed(2)}, end: ${result.endX.toFixed(2)}, lerp: ${result.lerpResult.toFixed(2)})`
        ).join('\n');
    }
}

export default LerpDetector;