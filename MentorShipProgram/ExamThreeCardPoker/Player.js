class Player {
    constructor(name) {
        this.name = name;
        this.hand = [];
    }

    addCard(card) {
        this.hand.push(card);
    }

    playCard(card) {
        const index = this.hand.indexOf(card);
        if (index > -1) {
            return this.hand.splice(index, 1)[0];
        }
        return null;
    }
}

export default Player;