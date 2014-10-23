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
public class StateServlet extends HttpServlet {

	private static Logger log = Logger.getLogger(StateServlet.class.getName());

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

		String gameKey = req.getParameter("g");
		String state = req.getParameter("s");
		boolean stateChanged = false;

			Room game = RoomManagerFactory.getInstance().getRoom(gameKey);
			log.info("current state:" + game.getStatus());
//			stateChanged = game.nextState(state);
			log.info("new state:" + state);

		resp.setContentType("text/plain");
		if(stateChanged){
			resp.setStatus(200);
			resp.getWriter().println("State changed");
		}
		else{
			resp.setStatus(402);
			resp.getWriter().println("State could not be changed");
		}
	}

}
