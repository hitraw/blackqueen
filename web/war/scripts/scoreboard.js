
$(document).ready(function() {
	$('#lbMessage').hide();
	$('#sbListContainer').hide();
	$('#scoreWindow').hide();
	
	// Call scoreboard servlet and save the scoreboards in our global variable
	$.post('/scoreboard', {
		r : $('#slRooms').val(),
		action : "history"
	}, function(result) {
		// following should result a JSON array getting converted to JS Array
		scoreboards = JSON.parse(result);
		console.log(scoreboards);
		if(scoreboards.length > 0){
			$('#lbMessage').hide();
			// call listDates to list scoreboard dates on left side
			list(scoreboards);
			// call showScore to display first scoreboard on right side
			showScore(JSON.parse(scoreboards[0]["scoreboard"]));
			var scoreDate = scoreboards[0]["date"];
			$('.papyrusHeader').html("Score sheet - " + new Date(scoreDate).toLocaleString());
		} else {
			//TODO: display message there are no scoreboards currently to display
			$('#sbListContainer').hide();
			$('#scoreWindow').hide();
			$('#lbMessage').html("There are no previous scoreboards to display.").show();
		}
	}).error(function() {
		$('#error').html("Error in getting list of scoreboards").fadeOut(5000);
	});

});

function list(scoreboards) {
	$('#sbList').html(""); // clear list

	var $lnkScoreboard;

	if (scoreboards.length > 0) {
		for (var i = 0; i < scoreboards.length; i++) {
			var longDate = scoreboards[i]["date"];
			$lnkScoreboard = $(
					"<a id='" + i + "' href='#'>"+ new Date(longDate).toLocaleString()  +"</a>").click(function() {
						var scoreDate = scoreboards[$(this).prop('id')]["date"];
						$('.papyrusHeader').html("Score sheet - " + new Date(scoreDate).toLocaleString());
						showScore(JSON.parse(scoreboards[$(this).prop('id')]["scoreboard"]));
			});
			$('#sbList').append("<br/>");
			$('#sbList').append($lnkScoreboard);
			$('#sbList').append("<br/>");
		}
		$('#sbListContainer').show();
	}
}

function showScore(scoreboard) {
	var players = scoreboard["players"];
	var totals = new Array();
	var scorecards = scoreboard["scorecards"];
	
	if (players !== undefined && players.length > 0 
			&& scorecards !== undefined
			&& scorecards.length > 0) {
		
		var scoreHTML = "<table id='scoreTable' class='scorecard'>"
			
		scoreHTML += ("<tr>");
		
		
		// header
		var width = Math.round(60/players.length);
		scoreHTML += ("<td class='score' width='5%'>#</td>");
		
		for(var i in players){
			scoreHTML += ("<td class='score number' width='"+width+"%'>"+players[i]+"</td>");
			totals.push(0);
		}
		
		scoreHTML += ("<td class='score' width='13%'>Bid / Opp</td>");
		scoreHTML += ("<td class='score rightItem' width='22%'>Partner / Trump</td>");
		
		scoreHTML += ("</tr>");
		
		var scorecard, scores, bidSpec, bidTarget, bidder, score;
		for(var j = 0; j<scorecards.length; j++){
			
			scorecard = scorecards[j];
			scores = scorecard["scores"];
			bidSpec = scorecard["bidSpec"];
			bidTarget = scorecard["bidTarget"];
			bidder = scorecard["bidder"];
			
			bidSpec = bidSpec.replace(/H/g, "&hearts;")
							.replace(/S/g, "&spades;")
							.replace(/C/g, "&clubs;")
							.replace(/D/g, "&diams;");
			
			scoreHTML += ("<tr>");
			scoreHTML += ("<td class='score'>"+(j+1)+"</td>");
			
			for(var i in players){
				
				score = scores[players[i]];
				if(score === undefined)
					score = "-";
				else totals[i] += score;
				
				if(players[i] === bidder)
					score = "<b>" + score + "</b>";
				scoreHTML += ("<td class='score number'>" + score + "</td>");
			}	

			scoreHTML += ("<td class='score'>"+bidTarget+"</td>");
			scoreHTML += ("<td class='score rightItem'>"+bidSpec+"</td>");
			
			scoreHTML += ("</tr>");
		}
		
		// total
		scoreHTML += ("<tr>");
		scoreHTML += ("<th class='score'></th>");

		for(var i in players)
			scoreHTML += ("<th class='score number'>"+totals[i]+"</th>");
		
		scoreHTML += ("<th colspan='2' class='score rightItem'>TOTAL</th>");
		
		scoreHTML += ("</tr>");
		
		scoreHTML += ("</table>");
		
		$('#scoreLog').html(scoreHTML);
		$('#scoreWindow').show();
	}
	// scroll to bottom of score window
	var scoreLog = document.getElementById('scoreLog');
	scoreLog.scrollTop = scoreLog.scrollHeight;
}