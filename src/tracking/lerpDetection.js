class LerpDetector {
    constructor() {
        this.current = null;
        this.results = [];
    }

    lerp(A, B, t) {
        return (1 - t) * A + t * B;
    }

    startBatsmanLerp(startX, targetX, ballNumber) {
        if (this.current) return;

        this.current = {
            ballNumber,
            startX,
            targetX
        };
    }

    endBatsmanLerp(ballNumber, endX) {
        if (!this.current) return;

        const A = this.current.startX;
        const B = endX;

        const data = {
            ballNumber,
            startX: A,
            endX: B,
            distance: Math.abs(B - A),

            lerp: {
                t0: this.lerp(A, B, 0),
                t05: this.lerp(A, B, 0.5),
                t1: this.lerp(A, B, 1)
            }
        };

        this.results.push(data);

        console.log(`🏏 Ball ${ballNumber}:`, data);

        this.current = null;
    }

    getResults() {
        return this.results;
    }
}

export default LerpDetector;