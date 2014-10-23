/**
 * 
 */
package com.bq.logic;

import com.google.appengine.labs.repackaged.org.json.JSONException;
import com.google.appengine.labs.repackaged.org.json.JSONObject;

/**
 * @author Hitesh
 *
 */
public class Message {

	public enum Type {
		NOTIFICATION, CHAT, STATUS, KICK, PLAYERS, CARDS, BID, SPEC, PLAY, STATE, 
	};

	private Type type;
	private String message;

	public Message(Type type, String message) {
		super();
		this.type = type;
		this.message = message;
	}

	@Override
	public String toString() {
		JSONObject json = new JSONObject();
		try {
			json.put("type", type.toString().toLowerCase());
			json.put("message", message);
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return json.toString();
	}

}
