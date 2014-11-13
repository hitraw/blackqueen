package com.bq.connection;

import java.io.IOException;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.bq.logic.Message;
import com.bq.logic.Player;
import com.bq.logic.Room;
import com.bq.room.manager.RoomManagerFactory;

@SuppressWarnings("serial")
public class AdminServlet extends HttpServlet {

	private static Logger log = Logger.getLogger(AdminServlet.class.getName());

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

		log.info("Admin req received");

		String roomName = req.getParameter("room");
		String action = req.getParameter("action");
		String username = req.getParameter("player");
		
		log.info(roomName + ":" + action +":" + username);
		resp.setContentType("text/plain");

		Room room = RoomManagerFactory.getInstance().getRoom(roomName);
		// The 'Game' object exposes a method which creates a unique string
		// based on the game's key and the user's id.
		log.info("playerList:" + room.getPlayerList());

		switch (action) {
		case "list":
			resp.setStatus(200);
			resp.getWriter().println(room.getPlayerList());
			break;
		case "disconnect":
			if (room.disconnected(username)) {
				resp.setStatus(200);
				resp.getWriter().println(room.getPlayerList());
			} else {
				resp.setStatus(400);
				resp.getWriter().println("Player could not be disconnected");
			}
			break;
		case "remove":
				
				Player p = room.removePlayer(username);
				
				if(p == null)
					room.removeSpectator(username);

				if(p != null){
					// if player left on his own, won't see this message
					// will see this only if window is still open, which
					// means admin kicked the player out.
					room.sendMessage(p, new Message(Message.Type.KICK,
							"You have been kicked out by the Admin."));
	
					resp.setStatus(200);
					resp.getWriter().println(room.getPlayerList());
			} else {
				resp.setStatus(400);
				resp.getWriter().println("Player could not be removed");
			}
			break;
		case "reset":
			room.resetScoreboard();
			resp.setStatus(200);
			resp.getWriter().println("Scoreboard successfully reset!");
			break;	
		default:
			break;
		}
	}
}
