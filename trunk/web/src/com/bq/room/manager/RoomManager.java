package com.bq.room.manager;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import com.bq.logic.Room;

public class RoomManager {

	private Map<String, Room> rooms;

/*	GameManager is not a pure static class because we need this default room
	creation logic to go in this constructor, why not static block?
	Let's just keep GameManager on the Heap with other objects and not in Perm
	The reference to GameManager in GMF goes to the Perm, that's it.
*/
	public RoomManager() {
		if (rooms == null) {
			rooms = new HashMap<String, Room>();
			rooms.put("vdppl", new Room("vdppl"));
		}
	}

	public boolean createRoom(String roomName) {
		boolean created = false;
		if (rooms == null) {
			rooms = new HashMap<String, Room>();
			created = (rooms.put(roomName, new Room(roomName)) == null);
		}
		return created;
	}

	public Room getRoom(String roomName) {
		if (rooms != null)
			return rooms.get(roomName);
		return null;
	}

	public String[] getRoomList() {
		if (rooms != null && rooms.keySet() != null) {
			Set<String> keys = rooms.keySet();
			return keys.toArray(new String[keys.size()]);
		} else
			return null;
	}

}
