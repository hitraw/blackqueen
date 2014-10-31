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
public class ChatServlet extends HttpServlet {

	private static Logger log = Logger.getLogger(ChatServlet.class
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
		String m = req.getParameter("m");
		log.info("game="+roomName +": username=" + username + " :message=" + m );

		Room room = RoomManagerFactory.getInstance().getRoom(roomName);
		Message message = new Message(Message.Type.CHAT, "<b>" + username + "</b>: "+m);
		room.sendMessageToAll(message);
		
		resp.setContentType("text/plain");
		resp.getWriter().println("Message sent");

	}

}
