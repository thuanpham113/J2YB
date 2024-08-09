import GameController from './GameController.js';

class Handler {
    constructor() {
        this.gameController = null;
    }

    startNewGame(playerNames) {
        this.gameController = new GameController(playerNames);
        this.gameController.startGame();
        return this.getGameState();
    }

    playCards(playerIndex, cardIndices) {
        if (playerIndex !== this.gameController.currentPlayerIndex) {
            throw new Error("Not your turn");
        }

        const player = this.gameController.players[playerIndex];
        const cards = cardIndices.map(index => player.hand[index]);

        try {
            const result = this.gameController.playTurn(cards);
            if (result) {
                // Game has ended
                return { gameOver: true, winner: result, state: this.getGameState() };
            }
            return { gameOver: false, state: this.getGameState() };
        } catch (error) {
            throw new Error("Invalid play: " + error.message);
        }
    }

    pass(playerIndex) {
        if (playerIndex !== this.gameController.currentPlayerIndex) {
            throw new Error("Not your turn");
        }

        this.gameController.pass();
        return this.getGameState();
    }

    getGameState() {
        return {
            players: this.gameController.players.map(player => ({
                name: player.name,
                handSize: player.hand.length
            })),
            currentPlayerIndex: this.gameController.currentPlayerIndex,
            currentPlay: this.gameController.currentPlay,
            lastPlay: this.gameController.lastPlay,
            passCount: this.gameController.passCount
        };
    }

    getPlayerHand(playerIndex) {
        return this.gameController.players[playerIndex].hand;
    }

    isValidPlay(playerIndex, cardIndices) {
        const player = this.gameController.players[playerIndex];
        const cards = cardIndices.map(index => player.hand[index]);
        return this.gameController.isValidPlay(cards);
    }
}

export default Handler;