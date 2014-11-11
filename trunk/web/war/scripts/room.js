var channel;
var socket;
var status;
var connected = false;
var quit = false;
var spectator = false;
var forceRefresh = false;
var connectionAttempt = 0;
var tokenTimeoutID;

//sound variables;
var turnSound;
var cutSound;
var partnerSound;

var MessageType = {
	CONNECTION : "connection",
	DISCONNECTION : "disconnection",
	ROOM_NOTIFICATION : "room_notification",
	GAME_NOTIFICATION : "game_notification",
	CHAT : "chat",
	STATUS : "status",
	KICK : "kick",
	PLAYERS : "players",
	CARDS : "cards",
	BID : "bid",
	SPEC : "spec",
	PLAY : "play",
	REPLACEMENT: "replacement",
	LOYALTIES: "loyalties",
	ROUND : "round",
	SNAPSHOT : "snapshot",
	SCORE : "score"
};

var RoomStatus = {
	WAITING_FOR_PLAYERS : "WAITING_FOR_PLAYERS",
	READY_TO_DEAL : "READY_TO_DEAL",
	DEALING : "DEALING",
	BIDDING : "BIDDING",
	PLAYING : "PLAYING",
	GAME_OVER : "GAME_OVER"
}

function playSound(tone){
	try{
		if(tone!== undefined)
			tone.play();
	}catch(error){
		console.log("Error in playing sounds:"+error);
	}
}

function loadSounds(){
	// buffers automatically when created
	try{
		dealSound = new Audio("sounds/deal-cards.mp3");
		turnSound = new Audio("sounds/Pollux.ogg"); 
		cuttingSound = new Audio("sounds/cut.mp3"); 
		partnerSound = new Audio("sounds/partner.mp3");
	}catch(error){
		console.log("Error in loading sounds:"+error);
	}
}

function sessionOn() {
	connected = true;
	$('#joinInfo').hide();
	$('#room').show();
	$('#chatWindow').show();
	loadSounds();
}


function clear(){
	$('#joinInfo').hide();
	$('.pointCardsContainer').html("");
	$('.snapshot').html("").hide();
	$('#playError').hide();
	$('#tablePoints').html("");
	
	$('#lsChat').html("");
	$('#lsNotif').html("");
	
	$('#bidControl').hide(); // hide bid control(card mat)
	$('#cardMat').html("").hide(); // wipe n hide table(card mat)
	$('#bidSpecSelector').hide();
	$('.bidSpec').hide();
}

function sessionOff() {
	connected = false;
	
	// following not desirable, hence commented.
//	$('#chatWindow').resizable();
	clear();
	
	$('#chatWindow').hide();
	$('#room').hide();
	$('#joinInfo').show();
}

function showError(errorMessage) {
	$('#error').html(errorMessage).show().fadeOut(5000);
}

function setStatus(statusText) {
	
	status = statusText;
	$('#status').html(status.replace(/_/g, " ")); // replace _ with space
	
	// disable all playing cards
	$('.playable').removeClass('playable').addClass('unplayable');
	
	// clear card mat and points when game over, but after 3 seconds
	// let everyone absorb the fact that the game is over!
	if(status === RoomStatus.GAME_OVER){
		window.setTimeout(function(){
			$('#cardMat').html("").hide(); // wipe n hide table(card mat)
			$('#tablePoints').html("");
		}, 3000);
	}
	
	// clear all this whenever status changes
	
	// bid control for making bids
	$('#bidControl').hide();
	$('#bidControl1').html(""); // don't hide this, parent is hidden
	$('#bidControl2').html(""); // don't hide this, parent is hidden

	// overlay bid control shown to pick cards
	// don't wipe this, contains hard coded card deck
	// to pick partner and trump from
	$('#bidSpecSelector').hide();

	$('.bid').html(""); // clear bids inside player divs

	// clear hand only when new game is started
	if (statusText === RoomStatus.READY_TO_DEAL
			|| statusText === RoomStatus.WAITING_FOR_PLAYERS) {
		$('#myHand').html("").show(); // clear hand
		$('#cardMat').html("");
		
		// left and right ear positioned spec controls
		$('.bidSpec').hide(); // don't wipe this, contains child elements
		$('#bidTarget').html(""); // don't hide this, parent is hidden
		$('#partner').html(""); // don't hide this, parent is hidden
		$('#trump').html(""); // don't hide this, parent is hidden

		$('.loyalty').html(""); // clear loyalty
		$('.pCard').html(""); // clear partner card
		$('.points').html(""); // clear points inside player divs
		$('.pointCardsContainer').html("").hide(); // clear n hide the point cards div
		$('.snapshot').html("").hide(); // clear snapshot
		
		resetGame();

	} else if (statusText === RoomStatus.BIDDING) {
		$('.bid').show();
		$('.pointCardsContainer').hide();
	} else if (statusText === RoomStatus.PLAYING) {
		$('.bid').hide();
		$('.pointCardsContainer').show();
	}
}

function clearControls(){
	
}

function addChatMessage(message) {
	// add chat messages to chat window
	$('#lsChat').append("<li>" + message + "</li>");
	// scroll to bottom of chat window
	var chatLog = document.getElementById('chatLog');
	chatLog.scrollTop = chatLog.scrollHeight;
}

function addGameNotification(message) {
	// add notifications to notifications window
	message = "<span style='color: blue'>" + message +"</span>";
	addChatMessage(message);
}	

function addRoomNotification(message) {
	// add notifications to notifications window
	message = "<span style='color: red'>" + message +"</span>";
	addChatMessage(message);
//	$('#lsNotif').append("<li>" + message + "</li>");
//	// scroll to bottom of notif window
//	var notifLog = document.getElementById('notifLog');
//	notifLog.scrollTop = notifLog.scrollHeight;
}

function showScore(message) {
//	console.log(message);
	var players = message["players"];
	var totals = new Array();
	var scorecards = message["scorecards"];

	if (players !== undefined && players.length > 0 
			&& scorecards !== undefined
			&& scorecards.length > 0) {
		
		$('#archiveIcon').show();
	
		var scoreHTML = "<table id='scoreTable' class='scorecard'>"
			
		scoreHTML += ("<tr>");
		
		
		// header
		var width = Math.round(60/players.length);
		scoreHTML += ("<td class='score' width='5%'>#</td>");
		
		for(var i in players){
			scoreHTML += ("<td class='score' width='"+width+"%'>"+players[i]+"</td>");
			totals.push(0);
		}
		scoreHTML += ("<td class='score' width='15%'>Bid / Opp</td>");
		scoreHTML += ("<td class='score rightItem' width='20%'>Partner Trump</td>");
		
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
		
	} else {
		$('#scoreLog').html("");
		$('#gameId').html("Game 1");
	}
	// scroll to bottom of score window
	var scoreLog = document.getElementById('scoreLog');
	scoreLog.scrollTop = scoreLog.scrollHeight;
}

function onMessage(result) {
	var json = JSON.parse(result.data);
	var type = json["type"];
	var message = json["message"];

	switch (type) {
	case MessageType.CHAT:
		addChatMessage(message);
		break;
	case MessageType.CONNECTION:
		console.log(new Date().toLocaleString() + ": " + message + " connected.");
		showConnection(message);
		break;
	case MessageType.DISCONNECTION:
		showDisconnection(message);
		break;	
	case MessageType.ROOM_NOTIFICATION:
		addRoomNotification(message);
		break;	
	case MessageType.GAME_NOTIFICATION:
		addGameNotification(message);
		break;	
	case MessageType.STATUS:
		// update status on status bar
		setStatus(message);
		break;
	case MessageType.REPLACEMENT:
		// update replaced player information on the screen
		replacePlayer(JSON.parse(message));
		break;	
	case MessageType.PLAYERS:
		// use players information redraw players on table
		if(status === RoomStatus.GAME_OVER)
			window.setTimeout(function(){
				showPlayers(JSON.parse(message));
			}, 1000);
		else
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
	case MessageType.LOYALTIES:
		// update play information on the screen
		updateLoyalties(JSON.parse(message));
		break;	
	case MessageType.ROUND:
		// update round information on the screen
		showCardTable(JSON.parse(message));
		break;
	case MessageType.SNAPSHOT:
		// show what cards were dealt to every player 
		window.setTimeout(function(){
			showSnapshots(JSON.parse(message));
		}, 1200);
		break;	
	case MessageType.SCORE:
		// update round information on the screen
		showScore(JSON.parse(message));
		break;	
	case MessageType.KICK:
		// show notification, alert and close connection
		addRoomNotification(message);
		alert(message);
		socket.close();
		sessionStorage.username = undefined;
		sessionStorage.token = undefined;
		sessionStorage.tokenTS = undefined;
//		window.close();
		window.location = "/";
		break;
	default:
		// default: display it in notifications window
		// till we figure out how to handle this message
		$('#lsNotif').append("<li>" + message + "</li>");
	}
}

function onClose() {
	console.log(new Date().toLocaleString() + ": Close called");
	console.log("connected="+connected);
	
	if(connected && connectionAttempt < 5){
//		socket.close();
//		connected = false;
//		sessionOff();
		openChannel(sessionStorage.token)
	}
	else{
		forceRefresh = true;
		window.location = "/";
	}
		
//	if(!forceRefresh)
//		sessionOff();
	
//	if(!quit)
//		openNewChannel();
//	else
//		sessionOff();
}

function onError(error) {
	connectionAttempt++;
	console.log(new Date().toLocaleString() + ": Error:" + error.code + ":" + error.description);
}

function onOpened() {
	console.log(new Date().toLocaleString() + ": Connected.");
	sessionOn();
	forceRefresh = false;
	var currentTS = new Date().getTime();
	var tokenAge = currentTS - sessionStorage.tokenTS;
	var tokenExpiryAge = 115 * 60 * 1000; // 115 mins * 60 secs * 1000 ms
	var timeToExpire = tokenExpiryAge - tokenAge;
	// diffTS will be negligible for new connection
	// but significant for older connections
	// allowing us to ensure that older connections don't timeout
	console.log("time to Expire: "+timeToExpire/1000/60 + " minutes");
	
	// clear previous tokenTimeout
	window.clearTimeout(tokenTimeoutID);
	
	// set timer to disconnect and connect again after 115 mins
	// because token expires after 120 mins
	tokenTimeoutID = window.setTimeout(function(){
		forceRefresh = true;
		socket.close();
		openNewChannel(spectator);
	}, timeToExpire);
	
//	alert(new Date().toLocaleString()+":on opened waala alert");
//	
//	window.setTimeout(function(){
//		alert(new Date().toLocaleString()+"after 2 mins waala alert");
//	}, 2 * 60000);
}

function openNewChannel(isSpectator) {
	console.log(new Date().toLocaleString() + ": Requesting token...");
	$.post('/getToken', {
		u : sessionStorage.username,
		r : sessionStorage.roomName,
		s : isSpectator
	}, function(result) {
		sessionStorage.token = result.trim();
		sessionStorage.tokenTS = new Date().getTime();
		console.log(new Date().toLocaleString() + ": Token obtained: " + sessionStorage.token);
		openChannel(sessionStorage.token);
	}).fail(function(error) {
		console.log(new Date().toLocaleString() + ": Error in obtaining token: " + error.status + ":" + error.responseText)
		
		switch(error.status){
		// Authentication Error: name already in use, show error
		case 401:
			sessionOff();
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
				// if user clicks on Yes, open channel as spectator
				openNewChannel(true);
				// do we need to maintain this flag??
				spectator = true;
				
			}	
			break;
		
		default: // show error
			// sessionOff();
//			window.location = '/';
		}
		
	});
}

function openChannel(token) {
	console.log(new Date().toLocaleString() + ": Connecting... with token:" + token);
	channel = new goog.appengine.Channel(token);
	socket = channel.open();
	socket.onopen = onOpened;
	socket.onmessage = onMessage;
	socket.onerror = onError;
	socket.onclose = onClose;
}

function enter(name) {
	if (name.length >= 3 && name !== 'Name') {
		sessionStorage.roomName = $('#slRooms').val();
		sessionStorage.username = name;
//		openNewChannel(sessionStorage.spectator);
//		console.log("$('#cbSpectator').prop('checked')="+$('#cbSpectator').prop("checked") );
		var currTS = new Date().getTime();
		
		// if we already have a token, use that token to connect
		if (sessionStorage.tokenTS !== undefined 
			&& (currTS - sessionStorage.tokenTS) < (115 * 60 * 1000))
				openChannel(sessionStorage.token);
		else // else i.e. if it's missing or old, then open new channel		
			openNewChannel(spectator);
	} else {
		showError("Please enter valid name! (3 to 12 characters long)");
	}
}

$(document).ready(function() {
		
	clear();
//	console.log("sessionStorage.username="+sessionStorage.username);
	if (sessionStorage.username !== undefined && sessionStorage.username !== "undefined"){
//		console.log(sessionStorage.username.length);
		$('#txtName').val(sessionStorage.username);
		enter($('#txtName').val());
	} else {
		sessionOff();
	}
	
//	$('#bq').click(function(){
//		window.location = '/';
//	})
	
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
					r : sessionStorage.roomName,
					m : msg
				});
			$('#txtChat').val("");
			$('#txtChat').focus();
		}
	});

	$(window).on('beforeunload', function(e) {
		if (connected && !forceRefresh)
			return "Please use the Leave button to leave the game!";
	});
	
	$('#btnQuit').click(function(){
		
		if(status === RoomStatus.BIDDING)
			quit = confirm("Didn't like your cards, so chickening out!\nAre you sure you want to quit the game?");
		else if(status === RoomStatus.PLAYING)
			quit = confirm("You are in the middle of a game.\nAre you sure you want to quit the game?");
		else 
			quit = confirm("Are you sure you want to quit the game?");
		
		if(quit){
			// make sure this player is removed from the game
			$.post('/exit', {
				u : sessionStorage.username,
				r : sessionStorage.roomName,
			});
			
			socket.close();
//			window.close(); // won't allow to close
			sessionStorage.username = undefined;
			forceRefresh = true;
			window.location = "/";
		}
	});
	
	$('#chatHeader').click(function(){
		$('.chat').toggle();
	});
	
//	$('#chatWindow').draggable();
	
	$('#historyIcon').click(function(){
		window.open('/history', '_blank');
	});	
	
	$('#archiveIcon').click(function(){
		// post to /scoreboard, action: archive
		var canArchive = (status !== RoomStatus.PLAYING);
		if(!canArchive)
			canArchive = confirm("Game is in progress, scores not added to this sheet." +
					" \nAre you sure you want to archive?");
		else
			canArchive = confirm("This will archive current score sheet and " +
					"create a new one. \nAre you sure you want to do this?");
		if(canArchive){
			$.post("/scoreboard", {
				r : sessionStorage.roomName,
				action: 'archive'
			}, function(result) {
				// display success message
				$('#scoreboardError').html(result).show().fadeOut(5000);
			}).fail(function(error) {
				// display error message
				console.log("Error:"+error.responseText);
				$('#scoreboardError').html(error.responseText).show().fadeOut(5000);
			});
		}
	});

	// wait for a second after it loads, to add hover event
	window.setTimeout(function(){
		$('.handCard').hover(
		        function() {
		            $(this).animate({ 'zoom': 1.8 }, 400);
		        },
		        function() {
		            $(this).animate({ 'zoom': 1 }, 200);
		        });
	},1000);
	 
});
