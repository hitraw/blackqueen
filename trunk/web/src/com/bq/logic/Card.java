package com.bq.logic;

/**
 * @author Hitesh
 *
 */
public class Card {

	private static final String BLACK_QUEEN_CODE = "QS";
	private static final int BLACK_QUEEN_POINTS = 30;

	enum Suit {SPADES, HEARTS, CLUBS, DIAMS};
//		SPADES(1), HEARTS(2), CLUBS(3), DIAMS(4);
//		private final int order;
//		
//		private Suit(int order){
//			this.order = order;
//		}
//		
//		public int getOrder(){
//			return order;
//		}
		// when above strings are converted to lower case and surrounded by &
		// and ; will render the following symbols in HTML

		// SPADE ("♠"), HEART("♥"), CLUB("♣"), DIAMOND("♦");
		// private final String symbol;
		//
		// private Suit(String symbol){
		// this.symbol = symbol;
		// }
		//
		// public String getSymbol(){
		// return this.symbol;
		// }
//	}

	enum Rank {
		TWO("2", 2, 0), THREE("3", 3, 0), FOUR("4", 4, 0), FIVE("5", 5, 5), SIX(
				"6", 6, 0), SEVEN("7", 7, 0), EIGHT("8", 8, 0), NINE("9", 9, 0), TEN(
				"10", 10, 10), JACK("J", 11, 0), QUEEN("Q", 12, 0), KING("K",
				13, 0), ACE("A", 14, 10);

		private final String key;
		private final int value;
		private final int points;

		private Rank(String key, int value, int points) {
			this.key = key;
			this.value = value;
			this.points = points;
		}
	}

	private Suit suit;
	private String code;
	private int value;
	private int points;

	public Card(Suit suit, Rank rank) {
		super();
		this.suit = suit;
		this.code = rank.key + suit.name().substring(0, 1);
		this.value = rank.value;
		if (BLACK_QUEEN_CODE.equals(this.code))
			this.points = BLACK_QUEEN_POINTS;
		else
			this.points = rank.points;
	}

	public Suit getSuit() {
		return suit;
	}

	public String getCode() {
		return code;
	}

	public int getValue() {
		return value;
	}

	public int getPoints() {
		return points;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		Card other = (Card) obj;
		if (code == null) {
			if (other.code != null)
				return false;
		} else if (!code.equals(other.code))
			return false;
		return true;
	}

	@Override
	public String toString() {
		return "Card [code=" + code + ", value=" + value + ", points=" + points
				+ "]";
	}
	
	

}
