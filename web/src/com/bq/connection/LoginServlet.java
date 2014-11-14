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

@SuppressWarnings("serial")
public class LoginServlet extends HttpServlet {

	private static Logger log = Logger.getLogger(LoginServlet.class.getName());

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

		log.info("Authorizing " + username + " for game room: " + roomName);
		resp.setContentType("text/plain");
		String result;

		Room room = RoomManagerFactory.getInstance().getRoom(roomName);

		// check if player exists in this room
		Player p = room.getPlayer(username);

		// if not in player list check if this player exists in spectator list
		// of this room
		if (p == null)
			p = room.getSpectator(username);

		// if player with this name doesn't exist or exists but is NOT connected
		if (p == null || !p.isConnected()) {
			// authorization success
			log.info("Authorization Success");
			result = "success";
			resp.getWriter().println(result);
		} else {
			// raise error
			resp.setStatus(401);
			resp.getWriter().println(
					"User already exists. Please try another Name.");
		}
	}
}
