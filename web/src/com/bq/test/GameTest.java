/**
 * 
 */
package com.bq.test;

import com.bq.logic.Room;
import com.bq.room.manager.RoomManagerFactory;

/**
 * @author Hitesh
 *
 */
public class GameTest {

	/**
	 * @param args
	 */
	public static void main(String[] args) {
		// TODO Auto-generated method stub
		Room game = RoomManagerFactory.getInstance().getRoom("vdppl");
		
		System.out.println("Player added:" + game.addPlayer("Hitesh"));
		System.out.println("Player added:" + game.addPlayer("Mayank"));
		System.out.println("Player added:" + game.addPlayer("Vishal"));
		System.out.println("Player added:" + game.addPlayer("Kushal"));
		System.out.println("Player added:" + game.addPlayer("Sheri"));
		System.out.println("Player added:" + game.addPlayer("Barkha"));

		game.deal();
		
		System.out.println("Hitesh:"+game.getPlayer("Hitesh").getHandCardsJson());
		System.out.println("Mayank:"+game.getPlayer("Mayank").getHandCardsJson());
		System.out.println("Vishal:"+game.getPlayer("Vishal").getHandCardsJson());
		System.out.println("Kushal:"+game.getPlayer("Kushal").getHandCardsJson());
		System.out.println("Sheri :"+game.getPlayer("Sheri").getHandCardsJson());
		System.out.println("Barkha:"+game.getPlayer("Barkha").getHandCardsJson());

	}

}
