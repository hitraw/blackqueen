/**
 * 
 */
package com.bq.room.manager;

import com.bq.logic.Scoreboard;

/**
 * @author Hitesh
 *
 */
public class ScoreboardManager {
	
	private Scoreboard scoreboard;
	private static ScoreboardManager sm;
	
	private ScoreboardManager(){
		
	}
	
	public static ScoreboardManager getInstance(){
		if(sm == null)
			sm = new ScoreboardManager();
		return sm;
	}
	
	public Scoreboard getScoreboard(){
		return scoreboard;
	}
}
