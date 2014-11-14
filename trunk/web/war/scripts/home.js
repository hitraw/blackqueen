function showError(errorMessage) {
	$('#error').html(errorMessage).show().fadeOut(5000);
}

function login() {
	console.log(new Date().toLocaleString() + ": Authorizing...");
	$.post('/login', {
		u : sessionStorage.username,
		r : sessionStorage.roomName,
//		s : isSpectator
		s : sessionStorage.spectator
	}, function(result) {
		console.log(new Date().toLocaleString() + ": Authorization Result: " + result);
		console.log("result.length="+result.length);
		result = result.trim();
		console.log("result.length="+result.length);
		if(result === "success")
			window.location = '/game';
	}).fail(function(error) {
		console.log(new Date().toLocaleString() + ": Authorization failure: " + error.status + ":" + error.responseText)
		
		switch(error.status){
		// Authentication Error: name already in use, show error
		case 401:
			showError(error.responseText); 
			break;
		
		// Forbidden: room full, or game in progress, show option to 
		// join as spectator
		case 403: 	
			showError(error.responseText);
			if(confirm("It seems game has already started or " +
					"there isn't room for more players. Would you like " +
					"to join as a spectator?")){
//				$('#cbSpectator').prop('checked', true);
				// if user clicks on Yes, obtain token as spectator
				sessionStorage.spectator = true;
				login();
			}	
			break;
		
		default: // show error
			showError(error.responseText); 
			break;
		}
		
	});
}

function enterGame(username) {
	if (username.length >= 3 && username !== 'Name') {
		sessionStorage.roomName = $('#slRooms').val();
		sessionStorage.username = username;
		sessionStorage.spectator = false;
//		console.log("$('#cbSpectator').prop('checked')="+$('#cbSpectator').prop("checked") );
		// TODO: uncomment checkbox and set checkbox value in sessionStorage.spectator
		login();
	} else {
		showError("Please enter valid name! (3 to 12 characters long)");
	}
}

$(document).ready(function() {

	$('#txtName').focus(function() {
		if ($(this).val() == "Name")
			$(this).val("");
	}).blur(function() {
		if ($(this).val() == "")
			$(this).val("Name");
	});

	$('#txtName').keydown(function(e) {
		var key = e.charCode ? e.charCode : e.keyCode ? e.keyCode : 0;
		if (key == 13) {
			enterGame($('#txtName').val());
		}
	});

	$('#btnEnter').click(function() {
		enterGame($('#txtName').val());
	});
});	