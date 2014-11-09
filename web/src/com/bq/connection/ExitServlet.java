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
public class ExitServlet extends HttpServlet {

	private static Logger log = Logger.getLogger(ExitServlet.class
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
		
		log.info(username + " leaving");

		Room room = RoomManagerFactory.getInstance().getRoom(roomName);
		
		// first check & remove from spectator list
		if(room.removeSpectator(username) != null){
			log.info(username + "(S) left.");
		} else // if not found in there, remove from player list
			if(room.removePlayer(username) != null){
			log.info(username + " left.");
		}	
	}
}
