import DataManager from '../data/dataManager.js';

class MotorMovementDetector {
    constructor(ticker) {
        this.ticker = ticker;
        this.dataManager = new DataManager();

        this.events = [];

        this.lastMovementTime = 0;
        this.startPosition = null;

        this.totalClicks = 0;
        this.successfulHits = 0;
    }

    // 🔷 SET ORIGINAL POSITION
    setStartPosition(pos) {
        this.startPosition = pos;
    }

    // 🔷 DETECT MOVEMENT
    detectMovement(type, currentPosition) {
        const timestamp = Date.now();

        if (!this.startPosition || !currentPosition) {
            this.startPosition = currentPosition;
            this.lastMovementTime = timestamp;
            return;
        }

        // 🔷 Movement Time
        const movementTime = timestamp - this.lastMovementTime;
        this.lastMovementTime = timestamp;

        // 🔷 Distance (D)
        const dx = currentPosition.x - this.startPosition.x;
        const dy = currentPosition.y - this.startPosition.y;
        const dz = currentPosition.z - this.startPosition.z;

        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        // 🔷 Target Width (W)
        const W = 0.5; // you can tweak (bat width / tolerance)

        // 🔥 CORRECT FITTS LAW
        const ID = Math.log2((distance / W) + 1);

        // 🔥 THROUGHOUT (REAL PERFORMANCE)
        const throughput = (movementTime > 0 && ID > 0)
            ? Number((ID / movementTime).toFixed(4))
            : 0;

        this.totalClicks++;

        let isHit = false;
        if (type === 'batsman_hit') {
            this.successfulHits++;
            isHit = true;
            this.ticker?.onBatsmanHit?.();
        }

        const event = {
            type,
            timestamp,
            movementTime,
            distance,
            indexOfDifficulty: Number(ID.toFixed(3)),
            throughput,
            isHit
        };

        this.events.push(event);

        // 🔥 UPDATE START POSITION (VERY IMPORTANT)
        this.startPosition = currentPosition;

        this.dataManager.save('motorData', this.events);

        console.log("✅ MOTOR EVENT:", event);
    }

    // 🔥 FINAL RESULT
    getFinalResult() {
        let totalTime = 0;
        let totalID = 0;
        let totalTP = 0;
        let count = 0;

        this.events.forEach(e => {
            if (e.movementTime > 0) {
                totalTime += e.movementTime;
                totalID += e.indexOfDifficulty;
                totalTP += e.throughput;
                count++;
            }
        });

        return {
            avgMovementTime: Math.round(totalTime / count || 0),
            avgID: Number((totalID / count || 0).toFixed(3)),
            avgThroughput: Number((totalTP / count || 0).toFixed(4)),
            accuracy: this.totalClicks > 0
                ? Number(((this.successfulHits / this.totalClicks) * 100).toFixed(1))
                : 0,
            totalClicks: this.totalClicks,
            events: this.events
        };
    }

    reset() {
        this.events = [];
        this.startPosition = null;
        this.lastMovementTime = 0;
        this.totalClicks = 0;
        this.successfulHits = 0;
    }
}

export default MotorMovementDetector;