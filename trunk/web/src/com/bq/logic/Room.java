/**
 * 
 */
package com.bq.logic;

import java.util.ArrayList;
import java.util.List;
import java.util.logging.Logger;

import com.bq.logic.Card.Suit;
import com.bq.logic.Player.Loyalty;
import com.google.appengine.api.channel.ChannelMessage;
import com.google.appengine.api.channel.ChannelService;
import com.google.appengine.api.channel.ChannelServiceFactory;
import com.google.appengine.labs.repackaged.org.json.JSONArray;
import com.google.appengine.labs.repackaged.org.json.JSONException;
import com.google.appengine.labs.repackaged.org.json.JSONObject;

/**
 * @author Hitesh
 *
 */
public class Room {

	private enum Status {
		WAITING_FOR_PLAYERS, READY_TO_DEAL, DEALING, BIDDING, ANNOUNCING_BID, PLAYING, END_OF_ROUND
	};

	private Logger log = Logger.getLogger(Room.class.getName());
	private static final int MIN_PLAYERS = 4;
	private static final int MAX_PLAYERS = 6;
	public static final String KEY_DELIMITER = ":";
	private String name;
	private List<Player> players;
	private List<Player> robots;
	// private List<Player> spectators;
	private Status status;
	private int dealTurnIndex;
	// private List<Game> scorecard;
	private Game currGame;

	/**
	 * Constructor to create new game with identifier gameKey
	 * 
	 * @param roomName
	 */
	public Room(String roomName) {
		this.name = roomName;
		players = new ArrayList<Player>();
		robots = new ArrayList<Player>();
		status = Status.WAITING_FOR_PLAYERS;
		dealTurnIndex = 0;
	}

	/**
	 * Method to generate a unique key for a socket connection (channel)
	 * 
	 * @param username
	 * @return channelKey
	 */
	public String getChannelKey(String username) {
		return name + KEY_DELIMITER + username;
	}

	/**
	 * Method to send a Message to a particular Player
	 * 
	 * @param player
	 * @param message
	 */
	public void sendMessage(Player player, Message message) {
		log.info("Sending message to " + player + ": " + message);
		ChannelService channelService = ChannelServiceFactory
				.getChannelService();
		channelService.sendMessage(new ChannelMessage(getChannelKey(player
				.getName()), message.toString()));
	}

	/**
	 * Method to send a Message to all players
	 * 
	 * @param message
	 */
	public void sendMessageToAll(Message message) {
		log.info("Sending message to all players:" + message);
		ChannelService channelService = ChannelServiceFactory
				.getChannelService();
		for (Player p : players)
			channelService.sendMessage(new ChannelMessage(getChannelKey(p
					.getName()), message.toString()));
	}

	/**
	 * Method to change room status and communicate the same to all players
	 * 
	 * @param status
	 */
	private void changeStatus(Status status) {
		// change status
		this.status = status;
		// inform all clients of the change in status
		sendMessageToAll(new Message(Message.Type.STATUS, getStatus()));
	}

	/**
	 * Method to switch the game to next logical state Not in use anymore
	 * 
	 * @return successFlag
	 */
	public boolean nextState(String state) {
		boolean changed = false;

		Status newState = Status.valueOf(state);
		switch (status) {
		case DEALING:
			if (newState.equals(Status.BIDDING)) {
				currGame.startBidding(); // startBidding
				changed = true;
			}
			break;
		case BIDDING:
			if (newState.equals(Status.PLAYING)) {
				currGame.startBidding(); // startBidding
				changed = true;
			}
			break;

		default: // do nothing
		}

		return changed;
	}

	/**
	 * Method to end the current game in progress abruptly TODO add code to
	 * handle logical completion of game
	 */
	public void endGame() {
		// remove robots from player list
		for (Player player : robots) {
			players.remove(player);
		}

		// reset robots list
		robots = new ArrayList<Player>();

		// reset player turn to false for all
		for (Player player : players) {
			player.removeTurn();
			player.setLoyalty(Loyalty.NEUTRAL);
		}
		dealTurnIndex = (dealTurnIndex + 1) % players.size();

		if (players.size() >= MIN_PLAYERS)
			readyToDeal();
		else {
			changeStatus(Status.WAITING_FOR_PLAYERS);
		}
		sendMessageToAll(new Message(Message.Type.PLAYERS, getPlayers()));
	}

	public void readyToDeal() {
		changeStatus(Status.READY_TO_DEAL);

		// capture and rotate turn - don't rotate as of now, TODO later
		int index = (dealTurnIndex) % players.size();
		players.get(index).setTurn();

	}

	public void deal() {
		// check room status again to see if we can deal
		if (Status.READY_TO_DEAL.equals(status)) {
			// create new round object and point currRound to it
			currGame = new Game((dealTurnIndex // + 1
					)
					% players.size());

			// first step of the round: deal hand cards to all
			currGame.dealHand();

			currGame.startBidding();
		} else { // log warning - status not ready
			log.warning("We can't deal because room status is not READY_TO_DEAL");
		}
	}

	public Player getPlayer(String name) {
		for (Player p : players) {
			if (name.equals(p.getName()))
				return p;
		}
		return null;
	}

	public boolean isFull() {
		return (robots.isEmpty() && (players.size() >= MAX_PLAYERS || (!status
				.equals(Status.WAITING_FOR_PLAYERS) && !status
				.equals(Status.READY_TO_DEAL))));
	}

	public Player addPlayer(String playerName) {
		Player p = null;
		// robot players need to be replaced first
		if (robots.size() > 0) {
			// replace last robot first, so robot numbering auto corrects
			p = robots.remove(robots.size() - 1);
			if (p != null) { // we found a robot player;
				String robotName = p.getName();
				log.info(playerName + " replaced " + robotName);
				p.setName(playerName);
				sendMessageToAll(new Message(Message.Type.NOTIFICATION,
						playerName + " joined, replacing " + robotName + "."));
				// need to send status to this newly added player only
				// for others no change in state in this case.
				sendMessage(p, new Message(Message.Type.STATUS, getStatus()));
				// if game has already begun, send the bid spec and other info
				// e.g. cards on the table
				if (Status.PLAYING.equals(status)){
					sendMessage(p,
							new Message(Message.Type.SPEC, currGame.getBidSpec()));
//					sendMessage(p,
//							new Message(Message.Type.STATE, currGame.getRoundInfo()));
				}	
				sendMessageToAll(new Message(Message.Type.PLAYERS, getPlayers()));
				sendMessage(p,
						new Message(Message.Type.CARDS, p.getHandCardsJson()));
			}
		} else if (players.size() < MAX_PLAYERS) {
			log.info("Adding " + playerName + " to game room:" + name);
			p = new Player(playerName);
			// if player was added, check if we have min players to start game
			if (players.add(p)) {
				sendMessageToAll(new Message(Message.Type.NOTIFICATION,
						playerName + " joined."));
				if (players.size() == MIN_PLAYERS)
					readyToDeal();
				else
					// we don't need to send following message to player
					// in above case, as readyToDeal will send it anyways
					sendMessage(p,
							new Message(Message.Type.STATUS, getStatus()));
			}
			sendMessageToAll(new Message(Message.Type.PLAYERS, getPlayers()));
		}
		return p;
	}

	public Player removePlayer(String playerName) {
		Player p = getPlayer(playerName);
		int index = players.indexOf(p);

		if (p != null) { // only in following conditions can player be removed
			if (Status.WAITING_FOR_PLAYERS.equals(status)
					|| Status.READY_TO_DEAL.equals(status)
					|| Status.END_OF_ROUND.equals(status)) {
				log.info("Removing " + playerName + " from game room:" + name);

				// if player was removed successfully
				if (players.remove(p)) {
					if (players.size() > 0) {
						sendMessageToAll(new Message(Message.Type.NOTIFICATION,
								playerName + " left."));

						// check if we have less than min players to start
						if (players.size() < MIN_PLAYERS) {
							changeStatus(Status.WAITING_FOR_PLAYERS);
							for (Player player : players)
								player.removeTurn();
							players.get(dealTurnIndex).removeTurn();
						}
						// if not & if it was turn of removed player to deal
						else if (p.isTurn()) {
							// pass the turn to next player
							players.get(index).setTurn();
						}
					}
					// if player left on his own, won't see this message
					// will see this only if window is still open, which
					// means admin kicked the player out.
					sendMessage(p, new Message(Message.Type.KICK,
							"You have been kicked out by the Admin."));
				}
			} else { // else (when game in progress) player is replaced by robot
				String robotName = "Robot " + (robots.size() + 1);
				p.setName(robotName);
				robots.add(p);
				sendMessageToAll(new Message(Message.Type.NOTIFICATION,
						playerName + " left, replaced by " + robotName + "."));
				// if player left on his own, won't see this message
				// will see this only if window is still open, which
				// means admin kicked the player out.
				sendMessage(p, new Message(Message.Type.KICK,
						"You have been kicked out by the Admin."));
			}
			sendMessageToAll(new Message(Message.Type.PLAYERS, getPlayers()));
		}
		return p;
	}

	public String getPlayers() {
		String json = null;
		if (players != null) {

			JSONArray playersJson = new JSONArray();
			try {
				for (Player p : players)
					playersJson.put(p.getJSON());
				json = playersJson.toString();
			} catch (JSONException e) {
				log.severe("Error in building player JSON array:"
						+ e.getStackTrace());
			}
		}
		// return new JSONArray(players).toString();
		return json;
	}

	public String getPlayerList() {
		String json = null;
		if (players != null) {
			JSONArray playersJson = new JSONArray();
			for (Player p : players)
				playersJson.put(p.getName());
			json = playersJson.toString();
		}
		// return new JSONArray(players).toString();
		return json;
	}

	public String getStatus() {
		return status.toString();
	}

	public boolean bid(String index, String message) {
		try {
			int playerIndex = Integer.parseInt(index);
			int bid = Integer.parseInt(message);
			return currGame.bid(playerIndex, bid);
		} catch (Exception e) {
			log.severe("Error in Integer.parseInt of playerIndex or Bid value"
					+ e.getStackTrace());
		}
		return false;
	}

	public void setBidSpec(String partner, String trump) {
		currGame.setBidSpec(partner, trump);
	}

	class Game {

		private final int PASS = -1; // pass bid

		private List<Integer> points;

		private int bidTarget;
		private int oppTarget;
		private int bidScore;
		private int oppScore;
		private int maxTarget;

		private String partnerCard;
		private Suit trumpSuit;

		private int turnIndex;
		private int bidderIndex;

		public Game(int turnIndex) {
			super();
			this.turnIndex = turnIndex;
			for (Player p : players) {
				p.initializeRound();
			}
		}

		private void dealHand() {

			// always good to clear player hands
			for (Player p : players)
				p.clearHandCards();

			// change status to DEALING
			changeStatus(Status.DEALING);

			// initialize a new deck based on no. of players
			Deck deck = new Deck(players.size());

			// and get cards from the deck for dealing
			List<Card> cards = deck.getCards();

			// set the max target of the round based on total points in the deck
			// Typically: 130 (4 players) or 260 (5 to 8 players)
			maxTarget = deck.getTotalPoints();

			// if we got the cards
			if (cards != null) {

				// deal the cards to player objects
				while (cards.size() > 0)
					for (Player p : players)
						p.addHandCard(cards.remove(0));

				// send cards to each player
				for (Player p : players)
					sendMessage(
							p, // (ordering done inside getHandCards()
							new Message(Message.Type.CARDS, p
									.getHandCardsJson()));

			} else { // log severe error - didn't get cards
				log.severe("Didn't get cards from deck to deal");
			}
		}

		private void startBidding() {
			// change status to Bidding
			changeStatus(Status.BIDDING);

			// identify index of current player and next player to start bidding
			int currIndex = (turnIndex);
			turnIndex = (turnIndex + 1) % players.size();

			// calculate starting bid as half of max points
			// again, typically 65 (for 4 players) or 130 (for 5-8 players)
			bidTarget = maxTarget / 2;

			Player dealer = players.get(currIndex);
			dealer.setBid(bidTarget);
			dealer.removeTurn();

			Player next = players.get(turnIndex);
			next.setTurn();

			sendBidMessage(currIndex);
		}

		public boolean bid(int playerIndex, int bid) {
			boolean bidRegistered = false;

			Player p = players.get(playerIndex);

			int playerCount = players.size();

			if (validateBid(p, bid)) {
				p.setBid(bid);
				// int count = 0;
				Player next = null;
				int startingIndex = (playerIndex + 1) % playerCount;
				int nextIndex;

				// if (bid == PASS)
				// count++; // if current bid is PASS, start count already

				// loop starts from one after the current bidder and
				// we search for the first player who has not passed
				search: {
					for (nextIndex = startingIndex; nextIndex < playerCount; nextIndex++) {
						next = players.get(nextIndex);
						if (next.getBid() != PASS)
							break search;
						// else
						// count++;
					}
					for (nextIndex = 0; nextIndex < playerIndex; nextIndex++) {
						next = players.get(nextIndex);
						if (next.getBid() != PASS)
							break search;
						// else
						// count++;
					}
				}

				// the bid winner logic has been moved to client side!
				// TODO: check repercussion
				// if all other players have passed
				// if (count == (playerCount - 1)) {
				// p.removeTurn();
				// announceBidWinner();
				//
				// } else {
				// pass Bid Turn from p to next player who has not passed.

				p.removeTurn();
				turnIndex = nextIndex;
				Player nextPlayer = players.get(nextIndex);
				nextPlayer.setTurn();

				// if existing player's bid is greater than highest bid
				if (p.getBid() > bidTarget) {
					// make this bid as the higest
					bidTarget = p.getBid();
					bidderIndex = playerIndex;

					// else if next player's existing bid equals highest bid
				} else if (nextPlayer.getBid() == bidTarget) {
					// declare him as the winner of the bid.
					nextPlayer.setLoyalty(Player.Loyalty.BIDDER);
					oppTarget = maxTarget - bidTarget + 5;

					// tell everyone this player has won the bid
					sendMessageToAll(new Message(Message.Type.NOTIFICATION,
							nextPlayer.getName() + " has won the bid at "
									+ nextPlayer.getBid() + "."));

				}
				// send the bid to all players
				sendBidMessage(playerIndex);
				// }
				bidRegistered = true;
			}
			log.info("bid Registered:" + bidRegistered);
			return bidRegistered;
		}

		private void sendBidMessage(int currentIndex) {

			JSONObject json = new JSONObject();
			try {
				json.put("currentBid", players.get(currentIndex).getBid());
				json.put("highestBid", bidTarget);
				json.put("currentIndex", currentIndex);
				json.put("nextIndex", turnIndex);
				sendMessageToAll(new Message(Message.Type.BID, json.toString()));
			} catch (JSONException e) {
				log.severe("Error in building BID json" + e.getStackTrace());
			}
		}

		private boolean validateBid(Player p, int bid) {

			// the following is just a server side check to ensure no one is
			// bidding an invalid value via hacking. checks are in place on
			// client side to ensure no one gets to bid an invalid value
			return (p != null && p.isTurn() && p.getBid() != PASS
					&& Status.BIDDING.equals(status) && (bid == PASS || (bid % 5 == 0 && (players
					.size() == 4 ? (bid >= 70 && bid <= 130)
					: (bid >= 135 && bid <= 260)))));
		}

		public void setBidSpec(String partnerCard, String trumpSuit) {
			this.partnerCard = partnerCard;
			this.trumpSuit = Card.Suit.valueOf(trumpSuit.toUpperCase().trim());
			changeStatus(Status.PLAYING);
			sendMessageToAll(new Message(Message.Type.SPEC, getBidSpec()));
		}

		private String getBidSpec() {
			JSONObject json = new JSONObject();
			try {
				json.put("bidTarget", bidTarget);
				json.put("oppTarget", oppTarget);
				json.put("partner", partnerCard);
				json.put("trump", trumpSuit.toString().toLowerCase());

			} catch (JSONException e) {
				log.severe("Error in building BID json" + e.getStackTrace());
			}
			return json.toString();
		}

		private void calculatePoints() {
			bidScore = 0;
			oppScore = 0;
			for (Player p : players) {
				switch (p.getLoyalty()) {
				case BIDDER:
					bidScore += p.getPoints();
					break;
				case PARTNER:
					bidScore += p.getPoints();
					break;
				case OPPONENT:
					oppScore += p.getPoints();
					break;
				default:
					break;
				}
			}
			if (bidScore >= bidTarget) {
				// declare bidding team has won
			}

			else if (oppScore >= oppTarget) {
				// declare opponents team has won
			}

			else {
				// game goes on.
			}

		}

		private boolean isCut = false;

		class Round {
			// list of cards on the table
			List<Card> table;
			Card[] tabCards;
			Player[] plyrs;
			// list of playerIndex for order
			List<Integer> indices;
			int highestCardIndex;
			Card highestCard;
			Suit startinSuit;

			private Round(int turnIndex) {
				tabCards = new Card[players.size()];
			}

			private boolean play(Player p, Card c) {
				if (validatePlay(p, c))

					return true;
				else
					return false;
			}

			private boolean validatePlay(Player p, Card c) {
				if (!p.isTurn()) // check if it's player's turn
					return false;

				return true;
			}
		}
	}

}
