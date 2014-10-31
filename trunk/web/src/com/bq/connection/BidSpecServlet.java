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
public class BidSpecServlet extends HttpServlet {

	private static Logger log = Logger
			.getLogger(BidSpecServlet.class.getName());

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
		String roomName = req.getParameter("r");
		String partner = req.getParameter("p");
		String trump = req.getParameter("t");
		Room room = RoomManagerFactory.getInstance().getRoom(roomName);

		log.info("Player " + ": " + username + " chose partner:" + partner
				+ " and trump:" + trump);
		resp.setContentType("text/plain");

		if (partner != null && trump != null) {
			room.setBidSpec(partner, trump);
			resp.setStatus(200);
			resp.getWriter().println("Spec registered");
		} else {
			resp.setStatus(401);
			resp.getWriter().println("Invalid Bid Specification");
		}

	}

}
