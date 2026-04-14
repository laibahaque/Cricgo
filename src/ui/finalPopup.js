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
            max-width: 700px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
        `;

        const title = document.createElement('h2');
        title.textContent = 'Game Summary';
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
            line-height: 1.6;
        `;

        const totalBallsPlayed = this.data.ballsPlayed || 0;
        const finalScore = this.data.finalScore || 0;
        const lerpSummary = this.data.lerpSummary || '';
        const motorAnalysisSummary = this.data.motorAnalysisSummary || '';
        const motorAnalysisStats = this.data.motorAnalysisStats || {};
        
        console.log("FinalPopup data:", this.data);
        console.log("LERP Summary:", lerpSummary);
        console.log("Motor Analysis Summary:", motorAnalysisSummary);

        let lerpContent = '';
        if (lerpSummary && lerpSummary.trim() !== '') {
            lerpContent = `
                <h4>LERP Batsman Movement Results:</h4>
                <pre style="background: #f5f5f5; padding: 12px; border-radius: 5px; text-align: left; font-size: 13px; overflow-x: auto; border-left: 4px solid #4CAF50;">
${lerpSummary}
                </pre>
            `;
        } else {
            lerpContent = `
                <h4>LERP Batsman Movement Results:</h4>
                <p style="color: #999; font-style: italic;">No LERP data available</p>
            `;
        }

        // 🔥 MOTOR ANALYSIS DISPLAY
        let motorContent = '';
        if (motorAnalysisSummary && motorAnalysisSummary.trim() !== '') {
            motorContent = `
                <hr style="border: 1px solid #ddd; margin: 15px 0;">
                <h4>Motor Analysis Per Ball (Fitts' Law):</h4>
                <pre style="background: #f0f9ff; padding: 12px; border-radius: 5px; text-align: left; font-size: 13px; overflow-x: auto; border-left: 4px solid #2196F3;">
${motorAnalysisSummary}
                </pre>
            `;
        } else {
            motorContent = `
                <hr style="border: 1px solid #ddd; margin: 15px 0;">
                <h4>Motor Analysis Per Ball:</h4>
                <p style="color: #999; font-style: italic;">No motor analysis data available</p>
            `;
        }

        // 🔥 SUMMARY STATISTICS
        let motorStatsContent = '';
        if (motorAnalysisStats.ballsAnalyzed > 0) {
            motorStatsContent = `
                <h4>Motor Analysis Summary:</h4>
                <ul style="list-style: none; padding: 0;">
                    <li><strong>Average Index of Difficulty:</strong> ${motorAnalysisStats.avgID}</li>
                    <li><strong>Average Movement Time:</strong> ${motorAnalysisStats.avgMovementTime} ms</li>
                    <li><strong>Average Throughput:</strong> ${motorAnalysisStats.avgThroughput} bits/ms</li>
            `;
        }

        content.innerHTML = `
            <p><strong>Balls Played:</strong> ${totalBallsPlayed}</p>
            <p><strong>Final Score:</strong> ${finalScore} runs</p>
            <hr style="border: 1px solid #ddd; margin: 15px 0;">
            ${lerpContent}
            ${motorContent}
            ${motorStatsContent}
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