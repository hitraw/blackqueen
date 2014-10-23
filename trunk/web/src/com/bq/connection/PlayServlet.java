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
public class PlayServlet extends HttpServlet {

	private static Logger log = Logger.getLogger(PlayServlet.class
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

		String username = req.getParameter("u");
		String gameKey = req.getParameter("g");
		String m = req.getParameter("m");
		Room game = RoomManagerFactory.getInstance().getRoom(gameKey);

		Message message = new Message(Message.Type.PLAY, username + ": "+m);
		log.info(message.toString());
		game.sendMessageToAll(message);
		
		resp.setContentType("text/plain");
		resp.getWriter().println("Message sent");

	}

}
