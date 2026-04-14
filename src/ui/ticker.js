class Ticker {
    constructor() {
        this.isActive = false;
        this.defaultMessage = "Welcome to CricGo";
        this.messageTimeout = null;
        this.isShowingMessage = false;
        this.createTicker();
    }

    createTicker() {
        this.ticker = document.createElement('div');
        this.ticker.style.cssText = `
            position: fixed;
            top: 0px;
            left: 0px;
            right: 0px;
            width: 100%;
            height: 42px;
            padding: 0 20px;
            background: #000000;
            color: white;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 14px;
            display: flex;
            align-items: center;
            overflow: hidden;
            z-index: 999;
            box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
            backdrop-filter: blur(10px);
        `;

        this.content = document.createElement('div');
        this.content.style.cssText = `
            white-space: nowrap;
            animation: scroll 45s linear infinite;
        `;

        this.ticker.appendChild(this.content);
        document.body.appendChild(this.ticker);

        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes scroll {
                0% { transform: translateX(100%); }
                100% { transform: translateX(-100%); }
            }
        `;
        document.head.appendChild(style);
    }

    startGame() {
        if (this.isActive) return;
        this.isActive = true;
        this.showDefaultMessage();
    }

    showDefaultMessage() {
        // Create multiple repetitions for smooth scrolling
        const repetitions = 8;
        this.content.textContent = Array(repetitions).fill(this.defaultMessage).join(' ••• ');
        this.content.style.color = 'white';
        // Left align for scrolling
        this.ticker.style.justifyContent = 'flex-start';
    }

    showEventMessage(message, color = 'white', duration = 2500) {
        if (!this.isActive) return;

        // Clear any pending timeout
        if (this.messageTimeout) {
            clearTimeout(this.messageTimeout);
        }

        // Stop animation temporarily
        this.content.style.animation = 'none';
        this.content.textContent = message;
        this.content.style.color = color;
        // Center align for event messages
        this.ticker.style.justifyContent = 'center';

        // Return to default after duration
        this.messageTimeout = setTimeout(() => {
            this.content.style.animation = 'scroll 45s linear infinite';
            this.showDefaultMessage();
        }, duration);
    }

    // Event methods
    onBowlerAnimation() {
        this.showEventMessage("Bowler throws a ball");
    }

    onLerpStart(ballNumber) {
        this.showEventMessage(`📍 Ball ${ballNumber}: Batsman positioning detected`, "#FFD700", 3000);
    }

    onLerpComplete(ballNumber, data) {
        const distanceDisplay = Math.abs(data.endX - data.startX).toFixed(2);
        this.showEventMessage(`✓ Ball ${ballNumber}: Position interpolated (distance: ${distanceDisplay})`, "#00FF00", 2500);
    }

    onFittsLawAnalysis(ballNumber, data) {
        const message = `🎯 Ball ${ballNumber}: Fitts Law - D=${data.distance.toFixed(2)} | ID=${data.indexOfDifficulty.toFixed(2)} bits | MT=${data.movementTime}ms | TP=${data.throughput.toFixed(3)} bits/ms`;
        this.showEventMessage(message, "#FF6B6B", 3500);
    }

    onScore(score) {
        if (score === 6) {
            this.showEventMessage("🔥 Batsman hit a 6!", "#FFD700");
        } else if (score === 4) {
            this.showEventMessage("⭐ Batsman hit a 4!", "#87CEEB");
        }
        // No message for other scores
    }
}

export default Ticker;