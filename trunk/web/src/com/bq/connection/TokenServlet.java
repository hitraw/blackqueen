package com.bq.connection;

import java.io.IOException;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.bq.logic.Player;
import com.bq.logic.Room;
import com.bq.room.manager.RoomManagerFactory;
import com.google.appengine.api.channel.ChannelService;
import com.google.appengine.api.channel.ChannelServiceFactory;

@SuppressWarnings("serial")
public class TokenServlet extends HttpServlet {

	private static Logger log = Logger.getLogger(TokenServlet.class.getName());

	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		processLogin(req, resp);
	}

	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		processLogin(req, resp);
	}

	private void processLogin(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {

		String roomName = req.getParameter("r");
		String username = req.getParameter("u");
		String spectator = req.getParameter("s");
		
		boolean isSpectator = Boolean.parseBoolean(spectator);
		resp.setContentType("text/plain");
		String token;

		Room room = RoomManagerFactory.getInstance().getRoom(roomName);
		// The 'room' object exposes a method which creates a unique string
		// based on the room name and user name

		Player p = isSpectator? room.getSpectator(username):room.getPlayer(username);
		
		// if player/spectator with same name already exists, 
		if (p!=null) {
			// if (s) he is not connected
			if(!p.isConnected()){
				// allow this user to replace disconnected user, so give the token 
				token = generateToken(room, username);
				resp.getWriter().println(token);
				
				// TODO but how do we ensure concurrent check
				// check again when user connects, refuse connection, but how???
			}
			else {
				// raise error
				resp.setStatus(401);
				resp.getWriter().println(
						"User already exists. Please try another Name.");
			}
		} else // check if user trying to enter as spectator
		if (isSpectator) {
			// add this user as spectator to the room
			room.addSpectator(username);
			
			token = generateToken(room, username);
			// req.setAttribute("token", token.trim());
			// req.getRequestDispatcher("/game").forward(req, resp);
			resp.getWriter().println(token);

		} else // check if room is full or game in progress
		if (!room.isFull()) { // if room is not full i.e. add player to room
			
			room.addPlayer(username);
			token = generateToken(room, username);
			// req.setAttribute("token", token.trim());
			// req.getRequestDispatcher("/game").forward(req, resp);
			resp.getWriter().println(token);

		} // else return error code/message - room full/game in progress
		else {
			resp.setStatus(403);
			resp.getWriter().println(
					"Game in progress. Please join as spectator.");
		}

		/*
		 * Player p = game.getPlayer(username);
		 * 
		 * if (p != null) { // if player with this name already exists if
		 * (!p.isConnected()) { // if that player is disconnected, allow to
		 * reconnect token = getToken(game.getChannelKey(username));
		 * resp.getWriter().println(token); }else{ // if that player is
		 * connected, refuse connection for this name resp.setStatus(403);
		 * resp.getWriter().println("User already exists. Try another Name."); }
		 * } else { //if player with this name doesn't exist if
		 * (game.addPlayer(username)) { token =
		 * getToken(game.getChannelKey(username));
		 * resp.getWriter().println(token); } else { resp.setStatus(401);
		 * resp.getWriter().println("Room full. Try another Room."); } }
		 */
	}

	private String generateToken(Room room, String username) {
		//generate token
		ChannelService channelService = ChannelServiceFactory
				.getChannelService();
		String token = channelService.createChannel(room.getChannelKey(username));
		log.info("token=" + token);
		return token;
	}

}
