package com.bq.connection;

import java.io.IOException;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.bq.logic.Message;
import com.bq.logic.Room;
import com.bq.room.manager.RoomManagerFactory;

@SuppressWarnings("serial")
public class EndServlet extends HttpServlet {

	private static Logger log = Logger.getLogger(EndServlet.class
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

		String roomName = req.getParameter("r");
		String username = req.getParameter("u");
		
		Room room = RoomManagerFactory.getInstance().getRoom(roomName);
		
		log.info(username + " ended the game.");
		room.sendMessageToAll(new Message(Message.Type.ROOM_NOTIFICATION, username + " ended the game."));
		room.endGame();
		
		resp.setContentType("text/plain");
		resp.getWriter().println("Message sent");

	}

}
