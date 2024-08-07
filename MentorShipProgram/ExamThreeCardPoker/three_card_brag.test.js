const { Card, Deck, Player } = require("./three_card_brag");

describe("Card", () => {
	// Test case 1 - Kiểm tra tạo một lá bài với suit và rank đúng
	test("should create a card with correct suit and rank", () => {
		const card = new Card("Hearts", "A");
		expect(card.suit).toBe("Hearts");
		expect(card.rank).toBe("A");
	});

	// Test case 2 - Kiểm tra chuyển đổi lá bài sang chuỗi đúng
	test("should convert card to string correctly", () => {
		const card = new Card("Spades", "K");
		expect(card.toString()).toBe("K of Spades");
	});
});

describe("Deck", () => {
	/**
	 * Test case 3 - Kiểm tra tạo một bộ bài với 52 lá bài
	 * Để kiểm tra bộ bài có 52 lá bài, ta sẽ tạo một bộ bài mới và kiểm tra số lượng lá bài
	 */
	test("should create a deck with 52 cards", () => {
		const deck = new Deck();
		expect(deck.cards.length).toBe(52);
	});

	/**
	 * Test case 4 - Kiểm tra trộn bài
	 * Để kiểm tra trộn bài, ta sẽ tạo một bộ bài mới, lấy ra thứ tự ban đầu của bộ bài
	 * sau đó trộn bài và so sánh với thứ tự ban đầu
	 * Đồng thời, ta cũng kiểm tra số lượng lá bài sau khi trộn
	 * */
	test("should shuffle the deck", () => {
		const deck = new Deck();
		const originalOrder = [...deck.cards];
		deck.shuffle();
		expect(deck.cards).not.toEqual(originalOrder);
		expect(deck.cards.length).toBe(52);
	});

	/**
	 * Test case 5 - Kiểm tra chia bài
	 * Để kiểm tra chia bài, ta sẽ tạo một bộ bài mới, chia 3 lá bài cho người chơi
	 * và kiểm tra số lượng lá bài còn lại trong
	 * bộ bài sau khi chia
	 * */
	test("should deal correct number of cards", () => {
		const deck = new Deck();
		const dealtCards = deck.deal(3);
		expect(dealtCards.length).toBe(3);
		expect(deck.cards.length).toBe(49);
	});
});

describe("Player", () => {
	/**
	 * Test case 6 - Kiểm tra tạo một người chơi với tên
	 * Để kiểm tra tạo một người chơi với tên, ta sẽ tạo một người chơi mới
	 * và kiểm tra tên của người chơi đó
	 * */
	test("should create a player with a name", () => {
		const player = new Player("Test Player");
		expect(player.name).toBe("Test Player");
		expect(player.hand).toEqual([]);
		expect(player.score).toBe(0);
	});

	// Test case 7 - Kiểm tra nhận bài
	test("should receive cards correctly", () => {
		const player = new Player("Test Player");
		// Create an array of cards - 3 cards
		const cards = [
			new Card("Hearts", "A"),
			new Card("Spades", "K"),
			new Card("Diamonds", "Q"),
		];
		player.receiveCards(cards);

		// Check if the player's hand is the same as the array of cards
		expect(player.hand).toEqual(cards);
	});

	// Test case 8 - Kiểm tra tính điểm
	test("should calculate score correctly", () => {
		const player = new Player("Test Player");
		player.receiveCards([
			new Card("Hearts", "A"),
			new Card("Spades", "K"),
			new Card("Diamonds", "Q"),
		]);
		player.calculateScore();
		expect(player.score).toBe(1); // (1 + 10 + 10) % 10 = 1
	});

	// Test case 9 - Kiểm tra tính điểm với các lá bài khác
	test("should calculate score correctly with different cards", () => {
		const player = new Player("Test Player");
		player.receiveCards([
			new Card("Hearts", "3"),
			new Card("Spades", "5"),
			new Card("Diamonds", "7"),
		]);
		player.calculateScore();
		expect(player.score).toBe(5); // (3 + 5 + 7) % 10 = 5
	});

	/**
	 * Test case 10 - Kiểm tra tính điểm với các lá bài khác
	 * Có 3 người chơi, mỗi người chơi nhận 3 lá bài có rank là 'J', 'Q', 'K' và tính điểm
	 * */
	test("should calculate score correctly with different cards", () => {
		const player1 = new Player("Player 1");
		const player2 = new Player("Player 2");
		const player3 = new Player("Player 3");

		player1.receiveCards([
			new Card("Hearts", "J"),
			new Card("Spades", "Q"),
			new Card("Diamonds", "K"),
		]);
		player2.receiveCards([
			new Card("Hearts", "J"),
			new Card("Spades", "Q"),
			new Card("Diamonds", "K"),
		]);
		player3.receiveCards([
			new Card("Hearts", "J"),
			new Card("Spades", "Q"),
			new Card("Diamonds", "K"),
		]);

		player1.calculateScore();
		player2.calculateScore();
		player3.calculateScore();

		expect(player1.score).toBe(0); // (10 + 10 + 10) % 10 = 0
		expect(player2.score).toBe(0); // (10 + 10 + 10) % 10 = 0
		expect(player3.score).toBe(0); // (10 + 10 + 10) % 10 = 0
	});
});
