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
});

function list(players) {
	$('#result').html(""); // clear list

	var $btnRemove;

	if (players.length > 0) {
		for (var i = 0; i < players.length; i++) {
			$btnRemove = $(
					"<input type='button' id='" + i + "' value='" + players[i]
							+ "' />'").click(function() {
				// console.log($(this).attr('id') + ":" +
				// players[$(this).attr('id')]);
				$.post('/admin', {
					room : $('#slRooms').val(),
					action : "remove",
					player : $(this).val()
				// players[$(this).attr('id')]
				}, function(result) {
					list(JSON.parse(result));
					// $('#player' + $(this).attr('id')).html("");
				});
			});
			$('#result').append($btnRemove);
			// "<tr id='player" + i + "'><td>");
			// "<div id='player"+i+"'>"
			// + players[i] + "");
			// $('#player'+i).append("<td>" + $btnRemove + "</td>");
			// $('#player'+i).append("</td></tr>");
			// $('#result').append("</div>");
		}
	}

}