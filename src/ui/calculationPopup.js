class CalculationPopup {
    constructor(data) {
        this.data = data;
        this.createPopup();
        this.animateText();
    }

    createPopup() {
        this.overlay = document.createElement('div');
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;

        this.modal = document.createElement('div');
        this.modal.style.cssText = `
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            text-align: center;
            max-width: 500px;
            width: 90%;
            position: relative;
        `;

        this.title = document.createElement('h3');
        this.title.textContent = 'Ball Analysis';
        this.title.style.cssText = `
            margin-bottom: 15px;
            color: #333;
            font-family: Arial, sans-serif;
        `;

        this.content = document.createElement('div');
        this.content.style.cssText = `
            font-family: monospace;
            font-size: 14px;
            color: #555;
            margin-bottom: 20px;
            min-height: 100px;
        `;

        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.style.cssText = `
            background: #1976d2;
            color: white;
            border: none;
            padding: 10px 18px;
            border-radius: 6px;
            font-size: 14px;
            cursor: pointer;
        `;
        closeButton.onclick = () => this.close();

        this.modal.appendChild(this.title);
        this.modal.appendChild(this.content);
        this.modal.appendChild(closeButton);
        this.overlay.appendChild(this.modal);
        document.body.appendChild(this.overlay);
    }

    animateText() {
        const text = `LERP Time: ${this.data.lerpTime}ms\nMovement Time: ${this.data.movementTime}ms\nDistance: ${this.data.distance} units\nType: ${this.data.movementType}`;
        let index = 0;
        this.content.textContent = '';

        const interval = setInterval(() => {
            if (index < text.length) {
                this.content.textContent += text[index];
                index++;
            } else {
                clearInterval(interval);
            }
        }, 50);
    }

    close() {
        this.overlay.remove();
    }
}

export default CalculationPopup;