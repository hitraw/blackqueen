function showError(errorMessage) {
	$('#error').html(errorMessage).show().fadeOut(5000);
}

function openNewChannel() {
	$.post('/getToken', {
		u : sessionStorage.username,
		g : sessionStorage.gameKey
	}, function(result) {
			$('body').html(result);
	}).fail(function(error) {
		showError(error.responseText);
		console.log("Error in obtaining token:" + error.responseText);
	});
}


function enter(name) {
	if (name.length >= 3 && name !== 'Name') {
		sessionStorage.gameKey = $('#slGames').val();
		sessionStorage.username = name;
		openNewChannel();
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
			enter($('#txtName').val());
		}
	});

	$('#btnEnter').click(function() {
		enter($('#txtName').val());
	});
});	