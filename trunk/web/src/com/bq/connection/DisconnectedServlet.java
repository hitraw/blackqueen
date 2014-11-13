package com.bq.connection;

import java.io.IOException;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.bq.logic.Room;
import com.bq.room.manager.RoomManagerFactory;
import com.google.appengine.api.channel.ChannelPresence;
import com.google.appengine.api.channel.ChannelService;
import com.google.appengine.api.channel.ChannelServiceFactory;

@SuppressWarnings("serial")
public class DisconnectedServlet extends HttpServlet {

	private static Logger log = Logger.getLogger(DisconnectedServlet.class
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

		// In the handler for _ah/channel/disconnected/
		ChannelService channelService = ChannelServiceFactory
				.getChannelService();
		ChannelPresence presence = channelService.parsePresence(req);

		String client = presence.clientId();
		log.info(client + " disconnected from server, disconnecting from game...");

		String[] splits = client.split(Room.KEY_DELIMITER);
		String roomName = splits[0];
		String playerName = splits[1];

		Room room = RoomManagerFactory.getInstance().getRoom(roomName);
		if(room.disconnected(playerName))
			log.info(client + " disconnected from game.");
		else
			log.info(client + " could NOT be disconnected from game.");
		
		// first check & remove from spectator list
//		if(room.removeSpectator(playerName) != null){
//			log.info(playerName + "(S) left.");
//		} else // if not found in there, remove from player list
//			if(room.removePlayer(playerName) != null){
//			log.info(playerName + " left.");
//		}	

	}

}
