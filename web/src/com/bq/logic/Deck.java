package com.bq.logic;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import com.bq.logic.Card.Rank;
import com.bq.logic.Card.Suit;

/**
 * @author Hitesh
 *
 */
public class Deck {

	// public enum Size {SINGLE, DOUBLE};
	private List<Card> cards;
	private int totalPoints;

	/**
	 * @return List of cards in the deck
	 */
	public List<Card> getCards() {
		return cards;
	}
	
	/**
	 * @return total points in the deck
	 */
	public int getTotalPoints() {
		return totalPoints;
	}

	/**
	 * Initialize a deck of cards for a given no. of players
	 * @param playerCount
	 */
	public Deck(int playerCount) {
		cards = new ArrayList<Card>();
		totalPoints = 0;
		if (build(playerCount))
			shuffle(2);
	}

	/**
	 * Build a deck of cards based on given no. of players
	 * @param playerCount
	 * @return
	 */
	private boolean build(int playerCount) {
		boolean built = false;
		Card c;

		Rank[] ranks = Rank.values();
		switch (playerCount) {
		case 4: // 4 player, single deck, remove 2,3,4 i.e. i=0,1,2; 40/4 = 10 each
			for (Suit s : Suit.values()) {
				for (int i = 3; i < ranks.length; i++) {
					c = new Card(s, ranks[i]);
					cards.add(c);
					totalPoints += c.getPoints();
				}
			}
			built = true;
			break;

		case 5: // 5 player, double deck, remove 2,3,4 i.e. i=0,1,2; 80/5 = 16 each
			for (Suit s : Suit.values()) {
				for (int i = 3; i < ranks.length; i++) {
					c = new Card(s, ranks[i]);
					cards.add(c);
					c = new Card(s, ranks[i]);
					cards.add(c);
					totalPoints += c.getPoints()*2;
				}
			}
			built = true;
			break;

		case 6: // 6 player, double deck, but remove 2's, 96/6 = 16 each
			for (Suit s : Suit.values()) {
				for (int i = 1; i < ranks.length; i++) {
					c = new Card(s, ranks[i]);
					cards.add(c);
					c = new Card(s, ranks[i]);
					cards.add(c);
					totalPoints += c.getPoints()*2;
				}
			}
			built = true;
			break;
			
		case 7: // 7 player, double deck, remove 2, 3, 4 
			//	80/7 = uneven, so we need to add 4 4's to make it 84/7 = 12 each 
			for (Suit s : Suit.values()) {
				c = new Card(s, ranks[2]); // index 2 is card value 4 of suit s
				cards.add(c);
				for (int i = 3; i < ranks.length; i++) {
					c = new Card(s, ranks[i]);
					cards.add(c);
					c = new Card(s, ranks[i]);
					cards.add(c);
					totalPoints += c.getPoints()*2;
				}
			}
			built = true;
			break;
			
		case 8: // 8 player, double decks, remove 2,3,4; 80/8 = 10 each 
			for (Suit s : Suit.values()) {
				for (int i = 3; i < ranks.length; i++) {
					c = new Card(s, ranks[i]);
					cards.add(c);
					c = new Card(s, ranks[i]);
					cards.add(c);
					totalPoints += c.getPoints()*2;
				}
			}
			built = true;
			break;	
		default:
			built = false;
		}
		return built;
	}

	/**
	 * Shuffle the deck 'n' no. of times
	 * @param n
	 */
	public void shuffle(int n) {
		if (cards != null) {
			for (int i = 0; i < n; i++)
				Collections.shuffle(cards);
		}
	}

	@Override
	public String toString() {
		StringBuilder sb = new StringBuilder("Deck [cards=");
		for (Card c : cards) {
			sb.append("\n" + c);
		}
		sb.append("\n]");
		return sb.toString();
	}

}
