import Deck from './Deck.js';
import Player from './Player.js';

class GameController {
    constructor(playerNames) {
        this.deck = new Deck();
        this.players = playerNames.map(name => new Player(name));
        this.currentPlayerIndex = 0;
        this.currentPlay = [];
        this.lastPlay = [];
        this.passCount = 0;
    }

    startGame() {
        this.deck.shuffle();
        this.dealCards();
        this.findStartingPlayer();
    }

    dealCards() {
        while (this.deck.cards.length > 0) {
            this.players[this.currentPlayerIndex].addCard(this.deck.deal());
            this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        }
    }

    findStartingPlayer() {
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].hand.some(card => card.rank === '3' && card.suit === 'Spades')) {
                this.currentPlayerIndex = i;
                break;
            }
        }
    }

    playTurn(cards) {
        const currentPlayer = this.players[this.currentPlayerIndex];

        if (this.isValidPlay(cards)) {
            this.lastPlay = this.currentPlay;
            this.currentPlay = cards;
            cards.forEach(card => currentPlayer.playCard(card));
            this.passCount = 0;

            if (currentPlayer.hand.length === 0) {
                return this.endGame(currentPlayer);
            }

            this.nextPlayer();
        } else {
            throw new Error("Invalid play");
        }
    }

    pass() {
        this.passCount++;
        if (this.passCount === this.players.length - 1) {
            this.currentPlay = [];
            this.passCount = 0;
        }
        this.nextPlayer();
    }

    nextPlayer() {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    }

    isValidStartingPlay(cards) {
        const playType = this.getPlayType(cards);
        return playType !== 'invalid';
    }

    getPlayType(cards) {
        if (cards.length === 1) return 'single';
        if (cards.length === 2 && cards[0].rank === cards[1].rank) return 'pair';
        if (cards.length === 3 && cards.every(card => card.rank === cards[0].rank)) return 'triple';
        if (cards.length === 4 && cards.every(card => card.rank === cards[0].rank)) return 'four_of_a_kind';
        if (this.isStraight(cards)) return 'straight';
        if (this.isDoubleStraight(cards)) return 'double_straight';
        return 'invalid';
    }

    isDoubleStraight(cards) {
        if (cards.length < 6 || cards.length % 2 !== 0) return false;
        const ranks = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2'];
        const sortedCards = cards.sort((a, b) => ranks.indexOf(a.rank) - ranks.indexOf(b.rank));

        for (let i = 0; i < sortedCards.length; i += 2) {
            if (sortedCards[i].rank !== sortedCards[i+1].rank) return false;
            if (i > 0 && ranks.indexOf(sortedCards[i].rank) - ranks.indexOf(sortedCards[i-2].rank) !== 1) return false;
        }
        return true;
    }

    isStraight(cards) {
        if (cards.length < 3) return false;
        const ranks = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2'];
        const sortedCards = cards.sort((a, b) => ranks.indexOf(a.rank) - ranks.indexOf(b.rank));

        for (let i = 1; i < sortedCards.length; i++) {
            if (ranks.indexOf(sortedCards[i].rank) - ranks.indexOf(sortedCards[i-1].rank) !== 1) {
                return false;
            }
        }
        return true;
    }

    compareHands(hand1, hand2) {
        const type1 = this.getPlayType(hand1);
        const type2 = this.getPlayType(hand2);

        if (type1 !== type2) {
            return this.compareTypes(type1, type2);
        }

        const ranks = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2'];
        const maxRank1 = Math.max(...hand1.map(card => ranks.indexOf(card.rank)));
        const maxRank2 = Math.max(...hand2.map(card => ranks.indexOf(card.rank)));

        return maxRank2 - maxRank1;
    }

    compareTypes(type1, type2) {
        const typeOrder = ['single', 'pair', 'triple', 'straight', 'double_straight', 'four_of_a_kind'];
        return typeOrder.indexOf(type2) - typeOrder.indexOf(type1);
    }

    endGame(winner) {
        return `${winner.name} wins the game!`;
    }

    isValidPlay(cards) {
        if (cards.length === 0) return false;
        if (this.currentPlay.length === 0) return this.isValidStartingPlay(cards);

        const playType = this.getPlayType(cards);
        const currentPlayType = this.getPlayType(this.currentPlay);

        // Cho phép chặt heo bằng tứ quý
        if (currentPlayType === 'single' && this.currentPlay[0].rank === '2' && playType === 'four_of_a_kind') {
            return true;
        }

        // Cho phép chặt đôi 2 bằng tứ quý
        if (currentPlayType === 'pair' && this.currentPlay[0].rank === '2' && playType === 'four_of_a_kind') {
            return true;
        }

        if (playType !== currentPlayType) return false;

        return this.compareHands(cards, this.currentPlay) > 0;
    }
}

export default GameController;