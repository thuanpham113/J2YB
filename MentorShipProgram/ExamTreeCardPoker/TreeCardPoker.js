// Định nghĩa lớp Card
class Card {
    constructor(suit, rank) {
        this.suit = suit;
        this.rank = rank;
    }

    toString() {
        return `${this.rank} of ${this.suit}`;
    }
}

// Định nghĩa lớp Deck
class Deck {
    constructor() {
        this.cards = [];
        const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
        const ranks = ['K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4','3', '2', 'A'];
        for (let suit of suits) {
            for (let rank of ranks) {
                this.cards.push(new Card(suit, rank));
            }
        }
    }

    // Hàm trộn bài
    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    // Hàm chia bài
    deal(numCards) {
        return this.cards.splice(0, numCards);
    }
}

// Định nghĩa lớp Player
class Player {
    constructor(name) {
        this.name = name;
        this.hand = [];
        this.score = 0;
    }

    // Hàm nhận bài
    receiveCards(cards) {
        this.hand = cards;
    }

    // Hàm tính điểm
    calculateScore() {
        // Đơn giản hóa: chỉ tính tổng điểm
        this.score = this.hand.reduce((sum, card) => {
            const value = ['J', 'Q', 'K'].includes(card.rank) ? 10 :
                          card.rank === 'A' ? 1 :
                          parseInt(card.rank);
            return sum + value;
        }, 0) % 10;
    }
}

// Hàm chính để chạy trò chơi
function playGame(numPlayers) {
    const deck = new Deck();
    deck.shuffle();

    const players = [];
    for (let i = 1; i <= numPlayers; i++) {
        players.push(new Player(`Player ${i}`));
    }

    // Chia bài
    players.forEach(player => {
        player.receiveCards(deck.deal(3));
    });

    // Tính điểm
    players.forEach(player => {
        player.calculateScore();
        console.log(`${player.name}: ${player.hand.join(', ')} - Score: ${player.score}`);
    });

    // Tìm người thắng
    const winner = players.reduce((prev, current) =>
        (prev.score > current.score) ? prev : current
    );

    console.log(`The winner is ${winner.name} with a score of ${winner.score}`);
}

// Chạy trò chơi với 3 người chơi
playGame(3);