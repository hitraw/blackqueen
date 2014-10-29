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
		WAITING_FOR_PLAYERS, READY_TO_DEAL, DEALING, BIDDING, ANNOUNCING_BID, PLAYING, GAME_OVER
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
	private Scoreboard scoreboard;

	private Game currGame;
	private int gameCount;

	/**
	 * Constructor to create new game with identifier gameKey
	 * 
	 * @param roomName
	 */
	public Room(String roomName) {
		this.name = roomName;
		players = new ArrayList<Player>();
		robots = new ArrayList<Player>();
		// spectators = new ArrayList<Player>();
		status = Status.WAITING_FOR_PLAYERS;
		dealTurnIndex = 0;
		gameCount = 0;
		scoreboard = new Scoreboard();
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
			player.reset();
		}
		dealTurnIndex = (dealTurnIndex + 1) % players.size();

		if (players.size() >= MIN_PLAYERS)
			readyToDeal();
		else {
			changeStatus(Status.WAITING_FOR_PLAYERS);
		}
		sendMessageToAll(new Message(Message.Type.PLAYERS, getPlayersJSON()));
	}

	public void readyToDeal() {
		changeStatus(Status.READY_TO_DEAL);

		players.get(dealTurnIndex).setTurn();

	}

	public void deal() {
		// check room status again to see if we can deal
		if (Status.READY_TO_DEAL.equals(status)) {
			// create new round object and point currRound to it
			currGame = new Game(dealTurnIndex); // + 1

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
				sendMessageToAll(new Message(Message.Type.ROOM_NOTIFICATION,
						playerName + " joined, replacing " + robotName + "."));
				// need to send status to this newly added player only
				// for others no change in state in this case.
				sendMessage(p, new Message(Message.Type.STATUS, getStatus()));

				// and if game has already begun, send the bid spec and round
				// info e.g. cards on the table, points, etc.
				// ***
				// Imp: spec message has to be sent before players, but
				// round info only after players, bcoz of processing order on JS
				// ***
				if (Status.PLAYING.equals(status)
						|| Status.GAME_OVER.equals(status)) {
					sendMessage(
							p,
							new Message(Message.Type.SPEC, currGame
									.getBidSpec()));
				}

				// send updated player info to all players
				sendMessageToAll(new Message(Message.Type.PLAYERS,
						getPlayersJSON()));

				// and if game has already begun, send the round
				// info e.g. cards on the table, points, etc.
				// *** Imp: round message has to be sent after
				// players, but before cards ***
				if (Status.PLAYING.equals(status)) {
					sendMessage(p, new Message(Message.Type.ROUND,
							currGame.currRound.getRoundInfo()));
				}

				// send cards to this player
				sendMessage(p,
						new Message(Message.Type.CARDS, p.getHandCardsJson()));

			}
		} else if (players.size() < MAX_PLAYERS) {
			log.info("Adding " + playerName + " to game room:" + name);
			p = new Player(playerName);
			// if player was added, check if we have min players to start game
			if (players.add(p)) {
				sendMessageToAll(new Message(Message.Type.ROOM_NOTIFICATION,
						playerName + " joined."));
				if (players.size() == MIN_PLAYERS)
					readyToDeal();
				else
					// we don't need to send following message to player
					// in above case, as readyToDeal will send it anyways
					sendMessage(p,
							new Message(Message.Type.STATUS, getStatus()));
			}
			sendMessageToAll(new Message(Message.Type.PLAYERS, getPlayersJSON()));
		}
		return p;
	}

	public Player removePlayer(String playerName) {
		Player p = getPlayer(playerName);
		int index = players.indexOf(p);

		if (p != null) { // only in following conditions can player be removed
			if (Status.WAITING_FOR_PLAYERS.equals(status)
					|| Status.READY_TO_DEAL.equals(status)) {
				log.info("Removing " + playerName + " from game room:" + name);

				// if player was removed successfully
				if (players.remove(p)) {
					if (players.size() > 0) {
						sendMessageToAll(new Message(
								Message.Type.ROOM_NOTIFICATION, playerName
										+ " left."));

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
				sendMessageToAll(new Message(Message.Type.ROOM_NOTIFICATION,
						playerName + " left, replaced by " + robotName + "."));
				// if player left on his own, won't see this message
				// will see this only if window is still open, which
				// means admin kicked the player out.
				sendMessage(p, new Message(Message.Type.KICK,
						"You have been kicked out by the Admin."));
			}
			sendMessageToAll(new Message(Message.Type.PLAYERS, getPlayersJSON()));
		}
		return p;
	}

	public String getPlayersJSON() {
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

	public boolean play(String strPlayerIndex, String card) {
		boolean success = false;
		try {
			int playerIndex = Integer.parseInt(strPlayerIndex);
			success = currGame.play(playerIndex, card);

			if (success) {

				if (currGame.isGameOver) {

					currGame.assignPoints();

					Room.this.changeStatus(Status.GAME_OVER);
					sendMessageToAll(new Message(Message.Type.PLAYERS,
							getPlayersJSON()));

					if ("gameEnd".equals(Thread.currentThread().getName()))
						Thread.sleep(2000);
					currGame.addToScoreboard();

					// sendMessageToAll(new Message(Message.Type.SCORE,
					// scoreboard.getJSON()));
					// endGame();
				}

				/*
				 * if (currRound.isRoundOver) { // pause for few seconds then
				 * start new round, update // player info: points, point cards,
				 * etc. // try { // Thread.sleep(4000); // } catch
				 * (InterruptedException e) { //
				 * log.severe("Error in pausing the game"); //
				 * e.printStackTrace(); // }
				 * 
				 * players.get(currRound.roundWinnerIndex).setTurn(); currRound
				 * = new Round(currRound.roundWinnerIndex);
				 * 
				 * sendMessageToAll(new Message(Message.Type.PLAYERS,
				 * getPlayers())); sendMessageToAll(new
				 * Message(Message.Type.ROUND, currRound.getRoundInfo()));
				 */
			}

		} catch (Exception e) {
			log.severe("Error in playing card");
			e.printStackTrace();
		}
		return success;
	}

	class Game {

		private final int PASS = -1; // pass bid

		// this is for scoreboard, will hold final player points for this game
		// private List<Integer> finalPointsList; // for score

		// for bidding
		private int turnIndex;
		private int bidWinnerIndex; // for score

		// for bid and game play
		private int bidTarget; // for score
		private int oppTarget; // for score
		private int bidScore;
		private int oppScore;
		private int maxTarget;

		// for game play
		private String partnerCard; // for score
		private Suit trumpSuit; // for score
		private boolean isCut;
		private boolean isGameOver;
		private int partnerCount;
		private int maxPartnerCount;
		private Round currRound;

		public Game(int turnIndex) {
			super();
			this.turnIndex = turnIndex;
			for (Player p : players) {
				p.reset();
			}
			gameCount++;
			isCut = false;
			isGameOver = false;
			trumpSuit = null;
			partnerCard = null;
			partnerCount = 0;

		}

		public void addToScoreboard() {
			scoreboard.addScoreCard(players,
					partnerCard + "/" + trumpSuit.getShortCode(), bidTarget
							+ "/" + oppTarget, players.get(bidWinnerIndex)
							.getName());
		}

		public boolean play(int playerIndex, String card) {
			boolean success = currRound.play(playerIndex, card);

			if (success) {
				// if round has been won
				if (currRound.isRoundOver) {
					calculatePoints();

					players.get(currRound.roundWinnerIndex).setTurn();
					currRound = new Round(currRound.roundWinnerIndex);

					// no need to send this any more TODO: check
//					sendMessageToAll(new Message(Message.Type.PLAYERS,
//							getPlayersJSON()));
//					sendMessageToAll(new Message(Message.Type.ROUND,
//							currRound.getRoundInfo()));

				}
			}
			return success;
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
			maxPartnerCount = deck.getTotalPoints() <= 130 ? 1 : 2;

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
					// make this bid as the highest
					bidTarget = p.getBid();
					bidWinnerIndex = playerIndex;

					// else if next player's existing bid equals highest bid
				} else if (nextPlayer.getBid() == bidTarget) {
					// declare him as the winner of the bid.
					nextPlayer.setLoyalty(Player.Loyalty.BIDDER);
					oppTarget = maxTarget - bidTarget + 5;

					// tell everyone this player has won the bid
					sendMessageToAll(new Message(
							Message.Type.GAME_NOTIFICATION,
							nextPlayer.getName() + " wins the bid at "
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
				json.put("gameNo", gameCount);
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
			this.trumpSuit = Card.Suit.getSuitEnum(trumpSuit);
			changeStatus(Status.PLAYING);
			sendMessageToAll(new Message(Message.Type.SPEC, getBidSpec()));
			currRound = new Round(bidWinnerIndex);
			sendMessageToAll(new Message(Message.Type.ROUND,
					currRound.getRoundInfo()));
		}

		private String getBidSpec() {
			JSONObject json = new JSONObject();
			try {
				json.put("bidTarget", bidTarget);
				json.put("oppTarget", oppTarget);
				json.put("partner", partnerCard);
				json.put("trump", trumpSuit.getShortCode());
				json.put("gameNo", gameCount);

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
				sendMessageToAll(new Message(Message.Type.GAME_NOTIFICATION,
						"Game over. Bidding team made " + bidScore + " points."));
				isGameOver = true;
				bidScore = bidTarget;
				oppScore = 0;

			}

			else if (oppScore >= oppTarget) {
				// declare opponents team has won
				sendMessageToAll(new Message(Message.Type.GAME_NOTIFICATION,
						"Game over. Opposition team made " + oppScore
								+ " points."));
				isGameOver = true;
				oppScore = oppTarget;
				bidScore = 0;
			} else {
				// game goes on, do nothing
			}
		}

		private void assignPoints() {

			for (Player player : players) {
				// if all partners haven't been declared,
				// identify and set their loyalties.
				if (partnerCount < maxPartnerCount)
					if (Loyalty.NEUTRAL.equals(player.getLoyalty())) {
						List<Card> cards = player.getHandCards();
						boolean isPartner = false;
						for (Card card : cards)
							if (card.getCode().equals(partnerCard)) {
								isPartner = true;
								partnerCount++;
							}
						if (isPartner)
							player.setLoyalty(Loyalty.PARTNER);
						else
							player.setLoyalty(Loyalty.OPPONENT);
					}

				// then assign points
				switch (player.getLoyalty()) {
				case BIDDER:
					player.setScore(bidScore);
					break;
				case PARTNER:
					player.setScore(bidScore);
					break;
				case OPPONENT:
					player.setScore(oppScore);
					break;
				default:
					// do nothing;
					break;
				}
			}
		}

		class Round {
			// list of cards on the table
			List<Card> table;
			// list of playerIndex for order
			List<Integer> indices;
			Suit startingSuit;
			Card highestCard;
			int roundWinnerIndex;
			boolean isRoundOver;

			// total no. of points till now in this round/hand
			int tablePoints;

			private Round(int startingTurnIndex) {
				turnIndex = startingTurnIndex;
				table = new ArrayList<Card>();
				indices = new ArrayList<Integer>();
				tablePoints = 0;
				roundWinnerIndex = 0;
				highestCard = null;
				startingSuit = null;
				isRoundOver = false;
			}

			public String getRoundInfo() {
				JSONObject json = new JSONObject();

				JSONArray tableJson = new JSONArray();
				JSONArray indicesJson = new JSONArray();

				for (int i = 0; i < table.size(); i++) {
					tableJson.put(table.get(i).getCode());
					indicesJson.put(indices.get(i).intValue());
				}
				try {
					json.put("gameNo", gameCount);
					json.put("startingSuit", startingSuit == null ? null
							: startingSuit.getShortCode());
					json.put("highestCard", highestCard == null ? null
							: highestCard.getCode());
					json.put("points", tablePoints);
					json.put("roundOver", isRoundOver);
					json.put("cut", isCut);
					json.put("winnerIndex", roundWinnerIndex);
					json.put("table", tableJson);
					json.put("indices", indicesJson);

				} catch (JSONException e) {
					log.severe("Error in building ROUND json"
							+ e.getStackTrace());
				}
				return json.toString();
			}

			private boolean play(int playerIndex, String cardCode) {
				Player p = players.get(playerIndex);

				int cardIndex = p.getCardIndex(cardCode);
				log.info("cardIndex=" + cardIndex);
				Card c = p.getHandCards().get(cardIndex);

				/*
				 * we are retrieving index first and then card from that index,
				 * not operating on card directly because there might be 2 cards
				 * with same code in this player's hand and we don't want to
				 * remove both, when he is playing only 1 hence retrieving index
				 * of first and playing that one
				 */

				if (validatePlay(p, c)) {
					table.add(p.getHandCards().remove(cardIndex));

					// for order, who played which card, not sure if we need
					indices.add(playerIndex);
					tablePoints += c.getPoints();

					if (startingSuit == null)
						startingSuit = c.getSuit();

					if (isHigher(c, highestCard)) {
						highestCard = c;
						roundWinnerIndex = playerIndex;
					}

					if (c.getCode().equals(partnerCard)) {
						p.setLoyalty(Loyalty.PARTNER);
						JSONArray loyalties = new JSONArray();
						JSONObject updatedLoyalty = new JSONObject();
						try {
							updatedLoyalty.put("index", playerIndex);
							updatedLoyalty.put("loyalty", Loyalty.PARTNER
									.toString().toLowerCase());
							loyalties.put(updatedLoyalty);

							sendMessageToAll(new Message(
									Message.Type.GAME_NOTIFICATION, p.getName()
											+ " is revealed as Partner."));
							partnerCount++;

							// if max partners are declared
							if (partnerCount == maxPartnerCount)
								// declare all neutral players as opponents
								for (int i = 0; i < players.size(); i++) {
									Player other = players.get(i);
									if (Loyalty.NEUTRAL.equals(other
											.getLoyalty())) {
										other.setLoyalty(Loyalty.OPPONENT);
										updatedLoyalty = new JSONObject();
										updatedLoyalty.put("index", i);
										updatedLoyalty.put("loyalty",
												Loyalty.OPPONENT.toString()
														.toLowerCase());
										loyalties.put(updatedLoyalty);
									}
								}

						} catch (JSONException e) {
							// TODO Auto-generated catch block
							e.printStackTrace();
						}
						// mid round update declaring change in loyalties (partial/complete)
						sendMessageToAll(new Message(Message.Type.LOYALTIES,
								loyalties.toString()));
					}

					p.removeTurn();
					// if round is still going on
					if (table.size() != players.size()) {
						// pass turn
						turnIndex = (playerIndex + 1) % players.size();
						players.get(turnIndex).setTurn();
					} else {
						isRoundOver = true;
						turnIndex = roundWinnerIndex;
						players.get(roundWinnerIndex).winRound(table);
						// give turn for next round to winner of this round.
						// turnIndex = roundWinnerIndex;
					}
					sendPlayMessage(playerIndex, c);
					return true;
				} else
					return false;
			}

			private void sendPlayMessage(int currentIndex, Card c) {

				JSONObject json = new JSONObject();
				try {
					json.put("card", c.getCode());
					json.put("highestCard", highestCard.getCode());
					json.put("currentIndex", currentIndex);
					json.put("nextIndex", turnIndex);
					json.put("startingSuit", startingSuit.getShortCode());
					json.put("points", tablePoints);
					json.put("cut", isCut);
					json.put("roundOver", isRoundOver);

					if (isRoundOver) {
						json.put("winnerIndex", roundWinnerIndex);
						json.put("winnerPoints", players.get(roundWinnerIndex)
								.getPoints());
						json.put("winnerPointCards",
								players.get(roundWinnerIndex)
										.getPointCardsJSON());
					}

					sendMessageToAll(new Message(Message.Type.PLAY,
							json.toString()));
				} catch (JSONException e) {
					log.severe("Error in building PLAY json"
							+ e.getStackTrace());
				}
			}

			private boolean validatePlay(Player p, Card c) {
				if (c == null || p == null || !p.isTurn())
					// check for null objects if it's player's turn
					return false;

				// TODO: add more server side validation based on logic from
				// setPlayableCards in cards.js

				return true;
			}

			/**
			 * 
			 * @param c1
			 * @param c2
			 * @return true if c1 is greater (or equal) to c2
			 */
			private boolean isHigher(Card c1, Card c2) {
				if (c1 != null && c2 != null) {
					// if c1 is of the same suit as c2
					if (c1.getSuit().equals(c2.getSuit())) {

						// check the card value, if c1 value is greater or equal
						// equal also because assume c1 is played after c2,
						// so latter wins, if needs to be former change this to
						// >
						if (c1.getValue() >= c2.getValue())
							return true;
						// if same suit but lesser value, c1 is lower
						else
							return false;
					}
					// else i.e. if different suit
					else {
						// if c1 is trump suit, c1 is higher
						if (c1.getSuit().equals(trumpSuit)) {
							isCut = true;
							return true;
						}// else lower
						else
							return false;
					}
				} else
					return true;
			}
		}
	}
}
