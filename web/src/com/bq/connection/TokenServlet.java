package com.bq.connection;

import java.io.IOException;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

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

		String roomName = req.getParameter("g");
		String username = req.getParameter("u");
		resp.setContentType("text/plain");
		String token;

		Room room = RoomManagerFactory.getInstance().getRoom(roomName);
		// The 'room' object exposes a method which creates a unique string
		// based on the room name and user name
		
		if (!room.isFull()) { // if room is not full i.e. guest or new
			// and if player with same name doesn't exist
			if (room.getPlayer(username) == null) {
				// grant token
				ChannelService channelService = ChannelServiceFactory
						.getChannelService();
				token = channelService.createChannel(room.getChannelKey(username));
				log.info("token="+token);
				
//				req.setAttribute("token", token.trim());
//				req.getRequestDispatcher("/game.jsp").forward(req, resp);
				resp.getWriter().println(token);
			} // else return error - user already exists
			else {
				resp.setStatus(401);
				resp.getWriter().println("User already exists. Please try another Name.");
			}
		} // else return error - room full
		else {
			resp.setStatus(401);
			resp.getWriter().println("Game in progress. Please try again later.");
		}	
		
/*		Player p = game.getPlayer(username);

		if (p != null) {	// if player with this name already exists
			if (!p.isConnected()) {		// if that player is disconnected, allow to reconnect
				token = getToken(game.getChannelKey(username));
				resp.getWriter().println(token);
			}else{	// if that player is connected, refuse connection for this name
				resp.setStatus(403);
				resp.getWriter().println("User already exists. Try another Name.");
			}
		} else {	//if player with this name doesn't exist
			if (game.addPlayer(username)) {
				token = getToken(game.getChannelKey(username));
				resp.getWriter().println(token);
			} else {
				resp.setStatus(401);
				resp.getWriter().println("Room full. Try another Room.");
			}
		}
*/	}

}
