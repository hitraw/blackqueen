package com.bq.connection;

import java.io.IOException;
import java.util.List;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.bq.logic.Room;
import com.bq.logic.Scoreboard;
import com.bq.room.manager.RoomManagerFactory;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.FetchOptions;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.labs.repackaged.org.json.JSONArray;
import com.google.appengine.labs.repackaged.org.json.JSONException;
import com.google.appengine.labs.repackaged.org.json.JSONObject;

@SuppressWarnings("serial")
public class ScoreboardServlet extends HttpServlet {

	private static Logger log = Logger.getLogger(ScoreboardServlet.class
			.getName());

	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		processRequest(req, resp);
	}

	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		processRequest(req, resp);
	}

	private void processRequest(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {

		log.info("scoreboard req received");

		String roomName = req.getParameter("r");
		String action = req.getParameter("action");

		log.info(roomName + ":" + action);
		resp.setContentType("text/plain");
		Room room = RoomManagerFactory.getInstance().getRoom(roomName);

		// The 'Game' object exposes a method which creates a unique string
		// based on the game's key and the user's id.

		switch (action) {
		case "history":
			resp.setStatus(200);
			resp.getWriter().println(getScoreboardHistory(roomName));
			break;
		case "archive":
			if (!room.getScoreboard().hasData()) {
				resp.setStatus(401);
				resp.getWriter().println("It's a clean sheet, nothing to archive!");
			} else if (archiveScoreboard(room)) {
				room.resetScoreboard();
				resp.setStatus(200);
				resp.getWriter().println("Score sheet successfully archived!");
			} else {
				resp.setStatus(401);
				resp.getWriter().println(
						"Score sheet could not be archived. Please try again!");
			}
			break;
		case "reset":
			room.resetScoreboard();
			resp.setStatus(200);
			resp.getWriter().println("Score sheet successfully cleared!");
			break;
		default:
			break;
		}

	}

	private boolean archiveScoreboard(Room room) {
		boolean archived = false;

		Scoreboard scoreboard = room.getScoreboard();

		if (scoreboard.hasData()) {

			Key roomKey = KeyFactory.createKey("Room", room.getName());

			Entity sbEntity = new Entity("Scoreboard", roomKey);
			sbEntity.setProperty("date", System.currentTimeMillis());
			sbEntity
					.setProperty("scoreboard", scoreboard.getJSON());

			DatastoreService datastore = DatastoreServiceFactory
					.getDatastoreService();
			datastore.put(sbEntity);

			archived = true;
		}
		return archived;
	}

	/**
	 * 
	 * @param roomName
	 * @return JSON Array of all scoreboards of this room
	 */
	private String getScoreboardHistory(String roomName) {
		
		JSONArray scoreboardsJSON = new JSONArray();
		JSONObject scoreboardJSON;
		
		DatastoreService datastore = DatastoreServiceFactory
				.getDatastoreService();
		Key roomKey = KeyFactory.createKey("Room", roomName);
		// Run an ancestor query to ensure we see the most recent
		// list of the Scoreboard(s) of this particular Room.
		Query query = new Query("Scoreboard", roomKey).addSort("date",
				Query.SortDirection.DESCENDING);
		List<Entity> scoreboards = datastore.prepare(query).asList(
				FetchOptions.Builder.withLimit(5));
		
		if(!scoreboards.isEmpty()){
			for (Entity scoreboard : scoreboards) {
		        try {
		        	scoreboardJSON = new JSONObject();
					scoreboardJSON.put("date", scoreboard.getProperty("date"));
					scoreboardJSON.put("scoreboard", scoreboard.getProperty("scoreboard"));
				    scoreboardsJSON.put(scoreboardJSON);
				} catch (JSONException e) {
					log.severe("Error in building scoreboard json from the datastore entity");
					e.printStackTrace();
				}
		      
			}
		}
			
		return scoreboardsJSON.toString();
	}

}
