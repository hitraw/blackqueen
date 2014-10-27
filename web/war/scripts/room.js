var channel;
var socket;
var status;
var connected = false;

var MessageType = {
	NOTIFICATION : "notification",
	CHAT : "chat",
	STATUS : "status",
	KICK : "kick",
	PLAYERS : "players",
	CARDS : "cards",
	BID : "bid",
	SPEC : "spec",
	PLAY : "play",
	ROUND : "round"
};

var RoomStatus = {
	WAITING_FOR_PLAYERS : "WAITING_FOR_PLAYERS",
	READY_TO_DEAL : "READY_TO_DEAL",
	DEALING : "DEALING",
	BIDDING : "BIDDING",
	PLAYING : "PLAYING",
	GAME_OVER : "GAME_OVER"
}

function sessionOn() {
	connected = true;
	$('#joinInfo').hide();
	$('#room').show();
}

function sessionOff() {
	connected = false;
	$('.pointCardsContainer').html("");
	// $('.pointCardsContainer').hide("");
	$('#joinInfo').show();
	$('#lsChat').html("");
	$('#lsNotif').html("");
	$('#room').hide();
	$('#bidControl').hide(); // hide bid control(card mat)
	$('#cardMat').hide(); // hide table(card mat)
	$('#bidSpecSelector').hide();
	$('.bidSpec').hide();
}

function showError(errorMessage) {
	$('#error').html(errorMessage).show().fadeOut(5000);
}

function setStatus(statusText) {
	// clear all this whenever status changes

	$tablePoints = $('#tablePoints')
	$tablePoints.html("");
	$('#cardMat').html($tablePoints);
	$('#cardMat').hide(); // hide table(card mat)

	// bid control for making bids
	$('#bidControl').hide();
	$('#bidControl1').html(""); // don't hide this, parent is hidden
	$('#bidControl2').html(""); // don't hide this, parent is hidden

	// overlay bid control shown to pick cards
	// don't wipe this, contains hard coded card deck
	// to pick partner and trump from
	$('#bidSpecSelector').hide();

	// left and right ear positioned spec controls
	$('.bidSpec').hide(); // don't wipe this, contains title
	$('#partnerTrump').html(""); // don't hide this, parent is hidden
	$('#bidTarget').html(""); // don't hide this, parent is hidden

	$('.points').html(""); // clear points inside player divs
	$('.bid').html(""); // clear bids inside player divs
	$('.pointCardsContainer').hide(); // hide the points div

	// clear hand only when new game is started
	if (statusText === RoomStatus.READY_TO_DEAL
			|| statusText === RoomStatus.WAITING_FOR_PLAYERS) {
		$('#myHand').html(""); // clear hand
	} else if (statusText === RoomStatus.BIDDING) {
		$('.bid').show();
		$('.pointCardsContainer').hide();
		$('.points').hide();
	} else if (statusText === RoomStatus.PLAYING) {
		$('.bid').hide();
		$('.pointCardsContainer').show();
		$('.points').show();
	}

	status = statusText;
	$('#status').html(status.replace(/_/g, " ")); // replace _ with space
}

function addChatMessage(message) {
	// add chat messages to chat window
	$('#lsChat').append("<li>" + message + "</li>");
	// scroll to bottom of chat window
	var chatLog = document.getElementById('chatLog');
	chatLog.scrollTop = chatLog.scrollHeight;
}

function addNotification(message) {
	// add notifications to notifications window
	$('#lsNotif').append("<li>" + message + "</li>");
	// scroll to bottom of notif window
	var notifLog = document.getElementById('notifLog');
	notifLog.scrollTop = notifLog.scrollHeight;
}

function onOpened() {
	sessionOn();
}

function onMessage(result) {
	var json = JSON.parse(result.data);
	var type = json["type"];
	var message = json["message"];

	switch (type) {
	case MessageType.CHAT:
		addChatMessage(message);
		break;
	case MessageType.NOTIFICATION:
		addNotification(message);
		break;
	case MessageType.STATUS:
		// update status on status bar
		setStatus(message);
		break;
	case MessageType.PLAYERS:
		// use players information redraw players on table
		showPlayers(JSON.parse(message));
		break;
	case MessageType.CARDS:
		// $('#lsNotif').append("<li>" + cards + "</li>");
		showCards(JSON.parse(message));
		break;
	case MessageType.BID:
		// update bid information on the screen
		manageBidMessage(JSON.parse(message));
		break;
	case MessageType.SPEC:
		// update bid spec on the screen
		manageSpecMessage(JSON.parse(message));
		break;
	case MessageType.PLAY:
		// update play information on the screen
		managePlayMessage(JSON.parse(message));
		break;
	case MessageType.ROUND:
		// update round information on the screen
		showCardTable(JSON.parse(message));
		break;
	case MessageType.KICK:
		// show notification, alert and close connection
		addNotification(message);
		alert(message);
		socket.close();
		window.close();
		break;
	default:
		// default: display it in notifications window
		// till we figure out how to handle this message
		$('#lsNotif').append("<li>" + message + "</li>");
	}
}

function onClose() {
	sessionOff();
}

function onError(error) {
	console.log("Error:" + error.code + ":" + error.description);
}

function openNewChannel() {
	$.post('/getToken', {
		u : sessionStorage.username,
		g : sessionStorage.gameKey
	}, function(result) {
		sessionStorage.token = result.trim();
		sessionStorage.tokenTS = new Date().getTime();
		openChannel(sessionStorage.token);
	}).fail(function(error) {
		showError(error.responseText);
		console.log("Error in obtaining token:" + error.responseText);
	});
}

function openChannel(token) {
	channel = new goog.appengine.Channel(token);
	socket = channel.open();
	socket.onopen = onOpened;
	socket.onmessage = onMessage;
	socket.onerror = onError;
	socket.onclose = onClose;
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
	sessionOff();
	// $('#txtName').focus();

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

	// var token = $('#token').val();
	// if(token !== undefined)
	// openChannel(token);

	$('#txtChat').keydown(function(e) {
		var key = e.charCode ? e.charCode : e.keyCode ? e.keyCode : 0;
		if (key == 13) {
			var msg = $('#txtChat').val();
			if (msg.length > 0)
				$.post('/chat', {
					u : sessionStorage.username,
					g : sessionStorage.gameKey,
					m : msg
				});
			$('#txtChat').val("");
			$('#txtChat').focus();
		}
	});

	$(window).on('beforeunload', function(e) {
		if (connected)
			return 'You are in the middle of the game.';
	});

});
