import DataManager from '../data/dataManager.js';

class OnboardingPopup {
    constructor(onComplete) {
        this.onComplete = onComplete;
        this.dataManager = new DataManager();
        this.createPopup();
    }

    createPopup() {
        // Create modal overlay
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

        // Create modal content
        this.modal = document.createElement('div');
        this.modal.style.cssText = `
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            text-align: center;
            max-width: 400px;
            width: 90%;
        `;

        // Title
        const title = document.createElement('h2');
        title.textContent = 'Welcome to CricGo!';
        title.style.cssText = `
            margin-bottom: 20px;
            color: #333;
            font-family: Arial, sans-serif;
        `;

        // Input label
        const label = document.createElement('label');
        label.textContent = 'Enter your player name:';
        label.style.cssText = `
            display: block;
            margin-bottom: 10px;
            color: #555;
            font-family: Arial, sans-serif;
        `;

        // Input field
        this.input = document.createElement('input');
        this.input.type = 'text';
        this.input.placeholder = 'Player';
        this.input.style.cssText = `
            width: 100%;
            padding: 10px;
            margin-bottom: 20px;
            border: 2px solid #ddd;
            border-radius: 5px;
            font-size: 16px;
            box-sizing: border-box;
        `;

        // Start button
        const button = document.createElement('button');
        button.textContent = 'Start Game';
        button.style.cssText = `
            background: #4CAF50;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
            transition: background 0.3s;
        `;
        button.onmouseover = () => button.style.background = '#45a049';
        button.onmouseout = () => button.style.background = '#4CAF50';
        button.onclick = () => this.startGame();

        // Assemble modal
        this.modal.appendChild(title);
        this.modal.appendChild(label);
        this.modal.appendChild(this.input);
        this.modal.appendChild(button);
        this.overlay.appendChild(this.modal);
        document.body.appendChild(this.overlay);

        // Focus input
        this.input.focus();
    }

    startGame() {
        const name = this.input.value.trim() || 'Player';
        this.dataManager.setPlayerName(name);
        this.overlay.remove();
        this.onComplete();
    }
}

export default OnboardingPopup;