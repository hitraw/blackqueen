package com.bq.connection;

import java.io.IOException;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.bq.logic.Room;
import com.bq.room.manager.RoomManagerFactory;

@SuppressWarnings("serial")
public class BidServlet extends HttpServlet {

	private static Logger log = Logger.getLogger(BidServlet.class.getName());

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
		String roomName = req.getParameter("g");
		String index = req.getParameter("i");
		String message = req.getParameter("m");
		Room room = RoomManagerFactory.getInstance().getRoom(roomName);

		log.info("Player " + index + ": " + username + " bid " + message);
		resp.setContentType("text/plain");

		if (room.bid(index, message)) {
			resp.setStatus(200);
			resp.getWriter().println("Message sent");
		} else {
			resp.setStatus(401);
			resp.getWriter().println("Invalid Bid");
		}

	}

}
