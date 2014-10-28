/**
 * 
 */
package com.bq.logic;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

import com.google.appengine.labs.repackaged.org.json.JSONArray;
import com.google.appengine.labs.repackaged.org.json.JSONException;
import com.google.appengine.labs.repackaged.org.json.JSONObject;

/**
 * @author Hitesh
 *
 */
public class Player {

	// Different loyalties player can belong to
	enum Loyalty {
		NEUTRAL, BIDDER, PARTNER, OPPONENT
	}

	// Player attributes for current game session
	private String name;

	// Player attributes for current round
	private List<Card> handCards;
	private List<Card> pointCards;
	private Loyalty loyalty;
	private boolean turn;
	private int bid;
	private int score;

	public Player(String name) {
		super();
		this.name = name;
		reset();
	}

	public void reset() {
		handCards = new ArrayList<Card>();
		pointCards = new ArrayList<Card>();
		loyalty = Loyalty.NEUTRAL;
		bid = 0;
	}

	public void addHandCard(Card card) {
		handCards.add(card);
	}

	public Card playCard(int index) {
		this.turn = false;
		return handCards.remove(index);
	}

	public void orderCards() {
		// TODO: add logic to order cards held in hand
	}

	public void addPointCards(List<Card> cards) {
		for (Card c : cards) {
			pointCards.add(c);
		}
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}
	
	public int getScore() {
		return score;
	}

	public void setScore(int score) {
		this.score = score;
	}

	@Override
	public String toString() {
		return name;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		Player other = (Player) obj;
		if (name == null) {
			if (other.name != null)
				return false;
		} else if (!name.equals(other.name))
			return false;
		return true;
	}

	public void clearHandCards() {
		handCards = new ArrayList<Card>();
	}

	public void sort(List<Card> cards) {
		Collections.sort(cards, new Comparator<Card>() {

			@Override
			public int compare(Card o1, Card o2) {
				if (!o1.getSuit().equals(o2.getSuit())) {
					return o1.getSuit().compareTo(o2.getSuit());
				} else
					return o2.getValue() - o1.getValue();
			}
		});
	}

	public List<Card> getHandCards() {
		sort(handCards);// needed??
		return handCards;
	}

	public String getHandCardsJson() {
		// arrange cards in order
		sort(handCards);

		// form JSON array of cards
		JSONArray cards = new JSONArray();
		for (Card c : handCards) {
			cards.put(c.getCode());
		}
		return cards.toString();
	}

	public int getPoints() {
		int points = 0;
		for (Card c : pointCards) {
			points += c.getPoints();
		}
		return points;
	}

	public String getPointCards() throws JSONException {
//		Collections.sort(pointCards, new Comparator<Card>() {
//
//			@Override
//			public int compare(Card o1, Card o2) {
//				if (!o1.getSuit().equals(o2.getSuit())) {
//					return o1.getSuit().compareTo(o2.getSuit());
//				} else
//					// following should ensure QS is placed ahead of AS
//					return (o2.getValue()  + o2.getPoints()) - 
//							(o1.getValue() + o1.getPoints());
//			}
//		});
		sort(pointCards);

		JSONArray cards = new JSONArray();
		int points = 0;
		for (Card c : pointCards) {
			cards.put(c.getCode());
			points += c.getPoints();
		}
		JSONObject pointsObj = new JSONObject();
		pointsObj.put("points", points);
		pointsObj.put("cards", cards);

		return pointsObj.toString();
	}

	public Loyalty getLoyalty() {
		return loyalty;
	}

	public void setLoyalty(Loyalty loyalty) {
		this.loyalty = loyalty;
	}

	public boolean isTurn() {
		return turn;
	}

	public void setTurn() {
		this.turn = true;
	}

	public void removeTurn() {
		turn = false;
	}

	public int getBid() {
		return bid;
	}

	public JSONObject getJSON() throws JSONException {
		JSONObject playerJSON = new JSONObject();
		playerJSON.put("name", name);
		playerJSON.put("turn", turn);
		playerJSON.put("loyalty", loyalty.toString().toLowerCase());
		playerJSON.put("bid", bid);

		JSONArray cardArray = new JSONArray();
		int points = 0;
		for (Card c : pointCards) {
			points += c.getPoints();
			cardArray.put(c.getCode());
		}
		playerJSON.put("points", points);
		playerJSON.put("pointCards", cardArray);
		playerJSON.put("score", score);
		return playerJSON;
	}

	public void setBid(int bid) {
		this.bid = bid;
	}

	public int getCardIndex(String cardCode) {
		// TODO Auto-generated method stub
		for (int i = 0; i < handCards.size(); i++) {
			if (cardCode.equals(handCards.get(i).getCode()))
				return i;
		}
		return -1;
	}

	public void winRound(List<Card> table) {
		for(Card c: table)
			if(c.getPoints() > 0)
				pointCards.add(c);
	}

}
