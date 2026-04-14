class FinalPopup {
    constructor(data, onClose) {
        this.data = data;
        this.onClose = onClose;
        this.createPopup();
    }

    createPopup() {
        this.overlay = document.createElement('div');
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;

        this.modal = document.createElement('div');
        this.modal.style.cssText = `
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            text-align: center;
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
        `;

        const title = document.createElement('h2');
        title.textContent = 'Game Summary - Fitts Law Analysis';
        title.style.cssText = `
            margin-bottom: 20px;
            color: #333;
            font-family: Arial, sans-serif;
        `;

        const content = document.createElement('div');
        content.style.cssText = `
            text-align: left;
            font-family: Arial, sans-serif;
            font-size: 14px;
            color: #555;
        `;

        // Calculate averages from LERP data
        const ballsWithLerp = this.data.balls.filter(ball => ball.duration !== undefined);
        const avgMovementTime = ballsWithLerp.length > 0 
            ? ballsWithLerp.reduce((sum, ball) => sum + ball.duration, 0) / ballsWithLerp.length
            : 0;
        const totalDistance = ballsWithLerp.reduce((sum, ball) => sum + ball.distance, 0);
        const avgDistance = ballsWithLerp.length > 0 ? totalDistance / ballsWithLerp.length : 0;

        // Fitts Law calculations
        const avgID = ballsWithLerp.length > 0
            ? ballsWithLerp.reduce((sum, ball) => sum + (ball.indexOfDifficulty || 0), 0) / ballsWithLerp.length
            : 0;
        const avgFittsMetric = ballsWithLerp.length > 0
            ? ballsWithLerp.reduce((sum, ball) => sum + (ball.fittsBallMetric || 0), 0) / ballsWithLerp.length
            : 0;

        const totalBallsPlayed = this.data.ballsPlayed || this.data.balls.length;

        content.innerHTML = `
            <h3>Player: ${this.data.playerName}</h3>
            <p><strong>Balls Played:</strong> ${totalBallsPlayed}</p>
            <p><strong>Final Score:</strong> ${this.data.finalScore || 0} runs</p>
            <hr style="border: 1px solid #ddd; margin: 15px 0;">
            <h4>Fitts Law Analysis (LERP Batsman Movement)</h4>
            <p><strong>Average Movement Time:</strong> ${avgMovementTime.toFixed(2)}ms</p>
            <p><strong>Average Distance Traveled:</strong> ${avgDistance.toFixed(2)} units</p>
            <p><strong>Average Index of Difficulty (ID):</strong> ${avgID.toFixed(2)}</p>
            <p><strong>Movement Efficiency (MT/ID):</strong> ${avgFittsMetric.toFixed(2)}ms/ID</p>
            <hr style="border: 1px solid #ddd; margin: 15px 0;">
            <h4>Per-Ball LERP Details:</h4>
            <ul>
                ${this.data.balls.map((ball, i) => `
                    <li>Ball ${i+1}: Time ${(ball.duration || 0).toFixed(0)}ms, Distance ${(ball.distance || 0).toFixed(2)}u, ID ${(ball.indexOfDifficulty || 0).toFixed(2)}, Eff ${(ball.fittsBallMetric || 0).toFixed(2)}</li>
                `).join('')}
            </ul>
        `;

        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.style.cssText = `
            background: #4CAF50;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
            margin-top: 20px;
        `;
        closeButton.onclick = () => this.close();

        this.modal.appendChild(title);
        this.modal.appendChild(content);
        this.modal.appendChild(closeButton);
        this.overlay.appendChild(this.modal);
        document.body.appendChild(this.overlay);
    }

    close() {
        this.overlay.remove();
        this.onClose();
    }
}

export default FinalPopup;