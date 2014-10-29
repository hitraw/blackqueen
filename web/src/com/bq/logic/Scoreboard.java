/**
 * 
 */
package com.bq.logic;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.google.appengine.labs.repackaged.org.json.JSONArray;
import com.google.appengine.labs.repackaged.org.json.JSONException;
import com.google.appengine.labs.repackaged.org.json.JSONObject;

/**
 * @author Hitesh
 *
 */
public class Scoreboard {

	private List<String> names;
	private List<Scorecard> scorecards;

	public Scoreboard() {
		names = new ArrayList<String>();
		scorecards = new ArrayList<Scorecard>();
	}

	public void addScoreCard(List<Player> players, String bidSpec,
			String bidTarget, String bidder) {

		for (Player p : players)
			if (!names.contains(p.getName()))
				names.add(p.getName());

		scorecards.add(new Scorecard(players, bidSpec, bidTarget, bidder));
	}

	public boolean hasData() {
		return (names.size() > 0 && scorecards.size() > 0);
	}

	public String getJSON() {
		JSONObject scoreboard = new JSONObject();
		try {
			scoreboard.put("players", new JSONArray(names));
			JSONArray scorecardsJSON = new JSONArray();
			for (Scorecard scorecard : scorecards)
				scorecardsJSON.put(scorecard.getJSON());
			scoreboard.put("scorecards", scorecardsJSON);
		} catch (JSONException e) {
			e.printStackTrace();
		}
		return scoreboard.toString();
	}

	class Scorecard {

		private Map<String, Integer> scores;
		private String bidSpec;
		private String bidTarget;
		private String bidder;

		private Scorecard(List<Player> players, String bidSpec,
				String bidTarget, String bidder) {
			super();
			this.bidSpec = bidSpec;
			this.bidTarget = bidTarget;
			this.bidder = bidder;
			scores = new HashMap<String, Integer>();
			for (Player p : players)
				scores.put(p.getName(), p.getScore());

		}

		private JSONObject getJSON() {
			JSONObject scorecard = new JSONObject();
			try {
				scorecard.put("bidSpec", bidSpec);
				scorecard.put("bidTarget", bidTarget);
				scorecard.put("bidder", bidder);
				scorecard.put("scores", new JSONObject(scores));
			} catch (JSONException e) {
				e.printStackTrace();
			}
			return scorecard;
		}
	}
}
