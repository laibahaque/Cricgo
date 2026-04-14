class DataManager {
    constructor() {
        this.key = 'cricgoPlayerData';
        this.loadData();
    }

    loadData() {
        const data = localStorage.getItem(this.key);
        if (data) {
            this.data = JSON.parse(data);
        } else {
            this.data = {
                playerName: '',
                balls: []
            };
        }
    }

    saveData() {
        localStorage.setItem(this.key, JSON.stringify(this.data));
    }

    setPlayerName(name) {
        this.data.playerName = name;
        this.saveData();
    }

    addBallData(ballData) {
        this.data.balls.push(ballData);
        this.saveData();
    }

    getData() {
        return this.data;
    }

    resetBalls() {
        this.data.balls = [];
        this.saveData();
    }
}

export default DataManager;