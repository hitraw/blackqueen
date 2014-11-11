$(document).ready(function() {
	$('#btnLookup').click(function() {
		$.post('/admin', {
			room : $('#slRooms').val(),
			action : "list"
		}, function(result) {
			var players = JSON.parse(result);
			list(players);
		}).error(function() {
			$('#error').html("Error in getting list of players").fadeOut(5000);
		});
	});
	
	$('#btnReset').click(function() {
		$.post('/admin', {
			room : $('#slRooms').val(),
			action : "reset"
		}, function(result) {
			$('#error').html("Scoreboard reset!").fadeOut(5000);
		}).error(function() {
			$('#error').html("Error in getting list of players").fadeOut(5000);
		});
	});
});

function list(players) {
	
	var table = "<table width='300px'><tr><th width='33%'>Name</th>" +
		"<th width='34%'></th><th width='33%'></th></tr>";
	
	
//	$('#result').html("<table width='300px'><tr><th width='3c3%'>Name</th>" +
//			"<th width='34%'></th><th width='33%'></th></tr>"); 

	var $btnRemove;

	if (players.length > 0) {
		for (var i = 0; i < players.length; i++) {
			
			table += ("<tr>");
//			$('#result').append("<tr>");
			
			table += ("<td>") + (players[i]) + ("</td>");
//			$('#result').append("<td>").append(players[i]).append("</td>");
			
			table += "<td><input type='button' class='actionButton' id='" 
				+ players[i] + "' value='Disconnect' />" + "</td>";
			
			table += "<td><input type='button' class='actionButton' id='" 
				+ players[i] + "' value='Remove' />" + "</td>";
			
			table += ("</tr>");
//			$btnDisconnect = $(
//					"<input type='button' id='" + players[i] + "' value='Disconnect"  
//							+ "' />'");
//							.click(function() {
//				$.post('/admin', {
//					room : $('#slRooms').val(),
//					action : "disconnect",
//					player : $(this).prop('id')
//				}, function(result) {
//					list(JSON.parse(result));
//					// $('#player' + $(this).attr('id')).html("");
//				});
//			});
			
//			$('#result').append("<td>").append($btnDisconnect).append("</td>");
			
//			$btnRemove = $(
//					"<input type='button' id='" + players[i] + "' value='Remove"  
//							+ "' />'");
//							.click(function() {
//				$.post('/admin', {
//					room : $('#slRooms').val(),
//					action : "remove",
//					player : $(this).prop('id')
//				}, function(result) {
//					list(JSON.parse(result));
//				});
//			});
//			$('#result').append("<td>").append($btnRemove).append("</td>");
			
//			$('#result').append("</tr>");
			// "<tr id='player" + i + "'><td>");
			// "<div id='player"+i+"'>"
			// + players[i] + "");
			// $('#player'+i).append("<td>" + $btnRemove + "</td>");
			// $('#player'+i).append("</td></tr>");
			// $('#result').append("</div>");
		}
//		$('#result').append("</table>");
		
		$('#result').html(table);
			$('.actionButton').click(function(){
				console.log("click captured");
				$.post('/admin', {
					room : $('#slRooms').val(),
					action : $(this).val().toLowerCase(),
					player : $(this).prop('id')
				}, function(result) {
					list(JSON.parse(result));
				}).fail(function(error) {
					alert(error.responseText);
				});
			});
	}

}