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
public class ConnectedServlet extends HttpServlet {

	private static Logger log = Logger.getLogger(ConnectedServlet.class
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

		// In the handler for _ah/channel/connected/
		ChannelService channelService = ChannelServiceFactory
				.getChannelService();
		ChannelPresence presence = channelService.parsePresence(req);

		String client = presence.clientId();
		log.info(client + " connected.");

		String[] splits = client.split(Room.KEY_DELIMITER);
		String roomName = splits[0];
		String username = splits[1];
//		boolean spectator = false;
		
		Room room = RoomManagerFactory.getInstance().getRoom(roomName);
		
		log.info(username + " connected?" + room.connected(username));
		
		// if this user connected is in the spectator list already
//		Player player = room.getPlayer(username);
//		if(player == null){
//			player = room.getSpectator(username);
//			spectator = true;
//		}	
//		if(player != null){
//			
//			/*ideally we should be catching up player at time of adding to the room
//			but because we would have no way of knowing if a connection is for spectator
//			in this servlet, we add the player in TokenServlet itself, we can only get client Id
//			in this servlet and including spectator flag in the Id won't be clean design*/
//			room.connected(username);
//			
//			//catchup spectator to current state of the game
//			room.catchupPlayer(player);
//			
//			// send message to all that (s)he has joined the room
//			room.sendMessageToAll(new Message(Message.Type.ROOM_NOTIFICATION,
//					username + " joined" + (spectator?", as a spectator":null)  + "."));
//		}
//		else 	
//			// add user as player
//			log.info(room.addPlayer(username) + " added");
	}

}
