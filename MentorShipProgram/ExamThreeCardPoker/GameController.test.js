import GameController from './Controller';
import Card from './Card';

describe('GameController', () => {
  let gameController;

  beforeEach(() => {
    gameController = new GameController(['Player1', 'Player2', 'Player3', 'Player4']);
    gameController.startGame();
  });

  // test cases here
  test('Game initialization', () => {
    expect(gameController.players.length).toBe(4);
    expect(gameController.players.every(player => player.hand.length === 13)).toBe(true);
    expect(gameController.currentPlay).toEqual([]);
    expect(gameController.lastPlay).toEqual([]);
    expect(gameController.passCount).toBe(0);
  });


  test('Find starting player', () => {
    const startingPlayerIndex = gameController.players.findIndex(player =>
      player.hand.some(card => card.rank === '3' && card.suit === 'Spades')
    );
    expect(gameController.currentPlayerIndex).toBe(startingPlayerIndex);
  });

  test('Valid play - single card', () => {
    const currentPlayer = gameController.players[gameController.currentPlayerIndex];
    const cardToPlay = currentPlayer.hand[0];
    expect(() => gameController.playTurn([cardToPlay])).not.toThrow();
    expect(currentPlayer.hand.length).toBe(12);
    expect(gameController.currentPlay).toEqual([cardToPlay]);
  });


  test('Invalid play - wrong player', () => {
    const wrongPlayerIndex = (gameController.currentPlayerIndex + 1) % 4;
    const wrongPlayer = gameController.players[wrongPlayerIndex];
    const cardToPlay = wrongPlayer.hand[0];
    expect(() => gameController.playTurn([cardToPlay])).toThrow('Invalid play');
  });

  test('Valid play - pair', () => {
    const currentPlayer = gameController.players[gameController.currentPlayerIndex];
    const pairCards = currentPlayer.hand.filter(card => card.rank === currentPlayer.hand[0].rank).slice(0, 2);
    expect(() => gameController.playTurn(pairCards)).not.toThrow();
    expect(currentPlayer.hand.length).toBe(11);
    expect(gameController.currentPlay).toEqual(pairCards);
  });

  test('Invalid play - non-matching pair', () => {
    const currentPlayer = gameController.players[gameController.currentPlayerIndex];
    const nonMatchingCards = [currentPlayer.hand[0], currentPlayer.hand[1]];
    expect(() => gameController.playTurn(nonMatchingCards)).toThrow('Invalid play');
  });

  test('Valid play - straight', () => {
    const currentPlayer = gameController.players[gameController.currentPlayerIndex];
    const straight = [
      new Card('Hearts', '3'),
      new Card('Spades', '4'),
      new Card('Diamonds', '5'),
      new Card('Clubs', '6'),
      new Card('Hearts', '7')
    ];
    currentPlayer.hand = [...straight, ...currentPlayer.hand.slice(5)];
    expect(() => gameController.playTurn(straight)).not.toThrow();
    expect(currentPlayer.hand.length).toBe(8);
    expect(gameController.currentPlay).toEqual(straight);
  });

  test('Invalid play - non-straight', () => {
    const currentPlayer = gameController.players[gameController.currentPlayerIndex];
    const nonStraight = [
      new Card('Hearts', '3'),
      new Card('Spades', '4'),
      new Card('Diamonds', '5'),
      new Card('Clubs', '7'),
      new Card('Hearts', '8')
    ];
    currentPlayer.hand = [...nonStraight, ...currentPlayer.hand.slice(5)];
    expect(() => gameController.playTurn(nonStraight)).toThrow('Invalid play');
  });

  test('Valid play - four of a kind', () => {
    const currentPlayer = gameController.players[gameController.currentPlayerIndex];
    const fourOfAKind = [
      new Card('Hearts', '5'),
      new Card('Spades', '5'),
      new Card('Diamonds', '5'),
      new Card('Clubs', '5')
    ];
    currentPlayer.hand = [...fourOfAKind, ...currentPlayer.hand.slice(4)];
    expect(() => gameController.playTurn(fourOfAKind)).not.toThrow();
    expect(currentPlayer.hand.length).toBe(9);
    expect(gameController.currentPlay).toEqual(fourOfAKind);
  });

  test('Pass turn', () => {
    const initialPlayerIndex = gameController.currentPlayerIndex;
    gameController.pass();
    expect(gameController.currentPlayerIndex).toBe((initialPlayerIndex + 1) % 4);
    expect(gameController.passCount).toBe(1);
  });

  test('Game end condition', () => {
    const winningPlayer = gameController.players[gameController.currentPlayerIndex];
    winningPlayer.hand = [new Card('Hearts', 'A')];
    const result = gameController.playTurn([winningPlayer.hand[0]]);
    expect(result).toBe(`${winningPlayer.name} wins the game!`);
  });

  test('Chop 2 with four of a kind', () => {
    gameController.currentPlay = [new Card('Spades', '2')];
    const currentPlayer = gameController.players[gameController.currentPlayerIndex];
    const fourOfAKind = [
      new Card('Hearts', '5'),
      new Card('Spades', '5'),
      new Card('Diamonds', '5'),
      new Card('Clubs', '5')
    ];
    currentPlayer.hand = [...fourOfAKind, ...currentPlayer.hand.slice(4)];
    expect(() => gameController.playTurn(fourOfAKind)).not.toThrow();
    expect(gameController.currentPlay).toEqual(fourOfAKind);
  });

  test('Chop pair of 2s with four of a kind', () => {
    gameController.currentPlay = [new Card('Spades', '2'), new Card('Hearts', '2')];
    const currentPlayer = gameController.players[gameController.currentPlayerIndex];
    const fourOfAKind = [
      new Card('Hearts', '5'),
      new Card('Spades', '5'),
      new Card('Diamonds', '5'),
      new Card('Clubs', '5')
    ];
    currentPlayer.hand = [...fourOfAKind, ...currentPlayer.hand.slice(4)];
    expect(() => gameController.playTurn(fourOfAKind)).not.toThrow();
    expect(gameController.currentPlay).toEqual(fourOfAKind);
  });
});