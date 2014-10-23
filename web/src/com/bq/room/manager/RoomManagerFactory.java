/**
 * 
 */
package com.bq.room.manager;


/**
 * @author Hitesh
 *
 */
public class RoomManagerFactory {
//	private static final PersistenceManagerFactory pmfInstance = JDOHelper
//			.getPersistenceManagerFactory("transactions-optional");

	private static RoomManager gm = new RoomManager();
	
	private RoomManagerFactory() {
	}

//	public static PersistenceManagerFactory getInstance() {
//		return pmfInstance;
//	}
	
	public static RoomManager getInstance() {
		return gm;
	}
}
