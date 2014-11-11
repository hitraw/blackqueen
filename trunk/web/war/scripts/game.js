var centreX = 450;
var centreY = 270;
var radius = 260;
var players; // array of object players currently on screen
var positions; // array of positions these players are on.
var myIndex = undefined; // default undefined, 0 will create controls for spectators
var title = 'Black Queen';
var turnTitle = 'BQ - Your Turn!';

var LoyaltyType = {
	NEUTRAL : "neutral",
	BIDDER : "bidder",
	PARTNER : "partner",
	OPPONENT : "opponent"
};

function manageBidMessage(json) {
	var currentBid = json["currentBid"];
	var highestBid = json["highestBid"];
	var playerIndex = json["currentIndex"];
	var nextIndex = json["nextIndex"];

	var gameIndex = json["gameNo"];
	if (gameIndex !== undefined && gameIndex >= 0)
		$('#gameId').html("Game " + (gameIndex + 1));

	var currPlayer = players[playerIndex];

	currPlayer.bid = currentBid;
	currPlayer.showBid();
	currPlayer.removeTurn();

	players[nextIndex].setTurn();

	determineBidWinner(nextIndex, highestBid);
}

function determineBidWinner(turnIndex, highestBid) {
	Player 
	player = players[turnIndex];
	// if existing bid of this player matches highest bid
	// bid has been won by this player
	if (player.bid === highestBid) {
		declareBidWinner(turnIndex);
	} else { // bidding is going on
		// if this next player having turn is me
		if (turnIndex === myIndex){
			showBidControl(highestBid);
			highlightTurn();
		} else {
			$('.bidControl1').html("");
			$('#bidControl').hide();
		}
	}
}

function declareBidWinner(winnerIndex) {
	var bidWinner = players[winnerIndex];
	var bidTarget = bidWinner.bid;
	var maxTarget = (players.length === 4) ? 130 : 260;
	var oppTarget = maxTarget - bidTarget + 5;
	$('#bidTarget').html(bidTarget + "/" + oppTarget).show();
	$('.bidSpec').show();
	
	bidWinner.loyalty = LoyaltyType.BIDDER;
	bidWinner.draw();
	//TODO: Play winning bid/round sound
	
	// if this next player having won the bid is me
	if (winnerIndex === myIndex) {
		showBidSpecSelector(bidWinner);
		highlightTurn();
	} else {
		$('#bidControl1').html(
				bidWinner.name + " wins the bid at " + bidWinner.bid);
		$('#bidControl1').append(
				"<br/><br/>" + bidWinner.name
						+ " is selecting Partner and Trump");
		$('#bidControl').show();
	}
	
	
}

function showBidSpecSelector(bidWinner) {
//	$('#bidValue').html("Bid: " + bidWinner.bid);
	$('#bidSpecSelector').load("bidSpecSelector.html", function(){
		initializeCardSpecs();
		
		$('#bidTitle').html("You have won the bid. Please make your selection.");
		$('.bidControl').hide();
		$('#room').addClass('curtain');
		
		// get position of base, top and selector 
		var basePosition = $('#pos0').offset();
		var topPosition = $('#targetContainer').offset();
		var selPosition = $('#bidSpecSelector').offset();
		
		// calculate horizontal center of game table
		var centerLeft = basePosition.left + $('#pos0').width()/2;
//		console.log("centerLeft:"+centerLeft);
		
		// calculate 'left' position of selector
		var targetLeft = centerLeft - $('#bidSpecSelector').width()/2;
//		console.log("targetLeft="+targetLeft);
		
		//calculate vertical position of selecter
		var targetTop = topPosition.top + $('#targetContainer').height() + 15; 
		
		// update selector position
//		console.log(selPosition);
		selPosition = {top: targetTop, left: targetLeft};
//		console.log(selPosition);
		
		$('#bidSpecSelector').offset(selPosition);

		// show selector
		$('#bidSpecSelector').show();
	});
}

function highlightTurn(){
	playSound(turnSound);
	document.title = turnTitle;
	window.setTimeout(function(){
		// if after 20 seconds user has still not played
		// and status is still bidding/playing 
		if(document.title === turnTitle && !disableAlert){ 
			if(status === RoomStatus.BIDDING || status === RoomStatus.PLAYING )
				playSound(turnSound);
			else turnOver();
		}
	}, 20000); 
}

function turnOver(){
	document.title = title;
}

function showPlayers(playerJsonArray) {
	// clear canvas
	// $('canvas').clearCanvas();
	$('.pos').removeClass('turn bidder partner opponent');
	$('.pos').hide();
	$('.name').html("");
	$('.points').html("");
	$('.loyalty').html("");
	$('.pCard').html("");

	var playerCount = playerJsonArray.length;
	switch (playerCount) {
	case 1:
		positions = [ 0 ];
		break;
	case 2:
		positions = [ 0, 4 ];
		break;
	case 3:
		positions = [ 0, 3, 5 ];
		break;
	case 4:
		positions = [ 0, 2, 4, 6 ];
		break;
	case 5:
		positions = [ 0, 1, 3, 5, 7 ];
		break;
	case 6:
		positions = [ 0, 1, 3, 4, 5, 7 ];
		break;
	case 8:
		positions = [ 0, 1, 2, 3, 4, 5, 6, 7 ];
		break;
	}
	players = new Array(); // array of player objects
	var player; // temp multi purpose player variable
	var highestBid = 0;
	var positionIndex = 0;
	var bidWon = false;

	for (var i = 0; i < playerCount; i++) {
		player = new Player(playerJsonArray[i]);
		players.push(player);
		if (player["name"] === sessionStorage.username)
			myIndex = i;
	}

	// startIndex should be either myIndex or in case of spectators, 0
	var startIndex = myIndex !== undefined? myIndex: 0;
	
	// this loop starts from my index i.e. my position in array
	// and continues up to end of array i.e. players added after me
	for (var i = startIndex; i < playerCount; i++) {
		players[i].setPosition(positions[positionIndex++]);
		players[i].draw();
	}

	// this loop starts from 0 up to index i.e. players added before me.
	for (var i = 0; i < startIndex; i++) {
		players[i].setPosition(positions[positionIndex++]);
		players[i].draw();
	}
	
	if(status === RoomStatus.PLAYING){
		// set point cards visible
		$('.pointCardsContainer').show();
		$('.points').show();
	}
	
	manageControls();
}

/**
 * function to show relevant controls/fields as per status
 */
function manageControls() {
	// console.log(status);
	switch (status) {
	case RoomStatus.WAITING_FOR_PLAYERS:
		$('#endBtn').html(''); // clear end button div
		$('#deal').html(''); // clear deal button div
		// more cleanup code, maybe from setStatus needs to move here
		// or this needs to go there!
		break;
	case RoomStatus.READY_TO_DEAL:
		// show me deal button if it's my turn
		if (myIndex!== undefined && players[myIndex].turn)
			showDealBtn();
		$('#endBtn').html('');
		break;
	case RoomStatus.BIDDING:
		manageBid();
		if(!spectator)
			showEndBtn();
		break;
	case RoomStatus.PLAYING:
		if(!spectator)
			showEndBtn();
		break;
	case RoomStatus.GAME_OVER:
		if(!spectator)
			showEndBtn();
		showFinalScore();
		break;
	default:
		break;
	}
}

/**
 * function to manage the bid related fields
 */
function manageBid() {
	var player, turnIndex;
	var highestBid = 0;
	for (var i = 0; i < players.length; i++) {
		player = players[i];
		if (player.turn)
			turnIndex = i;
		if (player.bid > highestBid)
			highestBid = player.bid;
		player.showBid();
	}
	determineBidWinner(turnIndex, highestBid);
}

function showFinalScore(){
	for (var i in players)
		players[i].showScore();
	
	$('.pointCardsContainer').show(); //.fadeIn(500).fadeOut(1000).fadeIn(500);
	$('.points').show(); //.fadeIn(500).fadeOut(1000).fadeIn(500);
//	$('.snapshot').show();
	// commenting below, because actual score is shown on score sheet
	// let this table show what players have earned
//	$('.pointCardsContainer').fadeOut(1000).fadeIn(500).fadeOut(100,
//			function() {
//				//	show score in place of point cards, but after fading out
//				// till then let points flash
//				$('.bid').fadeIn(500);
//			});
}

function showSnapshots(snapshotsArray){
	var snapshotArray, card, player;
	for(var i in players){
		player = players[i];
		player.drawSnapshot(snapshotsArray[i]);
		snapshotArray = snapshotsArray[i];
	}
	$('#myHand').fadeOut(500, function(){
		$('.snapshot').fadeIn(500);
	})
	
}

function showDealBtn() {
	var $btnDeal = $(
			"<input type='button' id='btnDeal' class='button green' value='Deal'/>")
			.click(function() {
				console.log("calling /deal to deal cards");
				$.post('/deal', {
					u : sessionStorage.username,
					r : sessionStorage.roomName
				});
				$('#deal').html("");
			});
	$('#deal').html($btnDeal);
}

function showBidControl(highestBid) {
	var $img;
	// clear the controls first
	$('.bidControl').html("");

	// add titles
	$('#bidControl1').html("What's your bid?<br/>");

	var maxBid = (players.length === 4) ? 130 : 260;
	var maxCount = (players.length === 4) ? 10 : 15;
	// pass button
	var bid = -1;
	$img = $(
			"<input type='button' id='bidBtn" + bid
					+ "' class='button green' value='PASS'/>").click(
			function() {
				console.log("calling /bid to PASS");
				$.post('/bid', {
					u : sessionStorage.username,
					r : sessionStorage.roomName,
					i : myIndex,
					m : -1
				});
				$('.bidControl').html("");
				$('#bidControl').hide();
				turnOver();
			});
	$('#bidControl1').append($img);
	$('#bidControl1').append("<br/>");

	for (var bid = highestBid + 5, count = 0; bid < maxBid && count < maxCount; bid += 5, count++) {
		$img = $(
				"<input type='button' id='bidBtn" + bid
						+ "' class='button green bidButton' value='" + bid
						+ "'/>").click(function() {
			console.log("calling /bid: " + $(this).val());
			$.post('/bid', {
				u : sessionStorage.username,
				r : sessionStorage.roomName,
				i : myIndex,
				m : $(this).val()
			});
			$('.bidControl').html("");
			$('#bidControl').hide();
			turnOver();
		});
		$('#bidControl2').append($img);
	}
	$('.bidControl').show();
	$('#bidControl').show();
}

function showEndBtn() {
	// show me End button, (even if it's not my turn), but only if i am not spectator
	var $btnEnd = $(
			"<input type='button' id='btnEnd' class='button red' value='Start New '/>")
			.click(function() {
				var startNew = (status === RoomStatus.GAME_OVER);
				if(!startNew)
					startNew = confirm("Game is in progress. Points will not be recorded. \nAre you sure you want to end this game and start new one?") 
				if (startNew) {
					console.log("calling /end to end game");
					$.post('/end', {
						u : sessionStorage.username,
						r : sessionStorage.roomName
					});
					// $('#myHand').html("");
				}
			});
	$('#endBtn').html($btnEnd);
}

function replacePlayer(replacement){
	var	type = replacement["type"];
	var	playerIndex = replacement["index"];
	var oldName = replacement["previous"];
	var newName = replacement["name"];

	if(type === "player")
		addRoomNotification(newName + " joined, occupying " + oldName);
	else
		addRoomNotification(oldName + " left, leaving vacant " + newName);

	// if it's not me, update the name on screen
	if(newName !== sessionStorage.username){
		var	player = players[playerIndex];
		player.setName(newName);
	}
	// what if it's me? well entire screen will be drawn afresh
	// no need to update it then.
	
}

function showDisconnection(playerName){
//	addRoomNotification(playerName + " disconnected.");
	console.log(playerName + " disconnected.");
	for(var i in players){
		if(players[i].name === playerName)
			players[i].showDisconnected();
	}
}

function showConnection(playerName){
//	addRoomNotification(playerName + " connected.");
	console.log(playerName + " connected.");
	for(var i in players){
		if(players[i].name === playerName)
			players[i].showConnected();
	}
}

function updateLoyalties(loyalties){
	var loyaltyObj, playerIndex, player;
	playSound(partnerSound);
	for(var i in loyalties){
		loyaltyObj = loyalties[i];
		playerIndex = loyaltyObj["index"];
		player = players[playerIndex];
		player.setLoyalty(loyaltyObj["loyalty"]);
	}
}

function Player(jsonObj) {
	// console.log("119:jsonObj:"+jsonObj);
	this.name = jsonObj["name"];
	this.connected = jsonObj["connected"];
	this.loyalty = jsonObj["loyalty"];
	this.turn = jsonObj["turn"];
	this.bid = jsonObj["bid"];
	this.screenPosition; // position of player on screen (slot 0 -> 7)
	this.points = jsonObj["points"];
	this.pointCards = jsonObj["pointCards"]; // card array
	this.score = jsonObj["score"];

	this.setPosition = function(screenPos) {
		this.screenPosition = screenPos;
	}

	this.showConnected = function() {
		this.connected = true;
		$('#name' + this.screenPosition).removeClass('blinker');
//		$('#pos' + this.screenPosition).removeClass('disconnected');
//		$('#pos' + this.screenPosition).addClass('connected');
	}

	this.showDisconnected = function() {
		this.connected = false;
		$('#name' + this.screenPosition).addClass('blinker');
//		$('#pos' + this.screenPosition).removeClass('connected');
//		$('#pos' + this.screenPosition).addClass('disconnected');
	}

	this.removeTurn = function() {
		this.turn = false;
		$('#pos' + this.screenPosition).removeClass('turn');
	}

	this.setTurn = function() {
		this.turn = true;
		$('#pos' + this.screenPosition).addClass('turn');
	}
	
	this.setName = function(newName) {
		this.name = newName;
		$('#name' + this.screenPosition).html(this.name);
	}
	
	this.setLoyalty = function(newLoyalty) {
		this.loyalty = newLoyalty;
		this.showLoyalty();
	}
	
	this.setPoints = function(newPoints) {
		this.points = newPoints;
		this.showPoints();
	}

	this.showBid = function() {
		$('#bid' + this.screenPosition).hide();
		if (this.bid > 0)
			$('#bid' + this.screenPosition).html(this.bid);
		else if (this.bid == -1)
			$('#bid' + this.screenPosition).html("PASS");
		$('#bid' + this.screenPosition).fadeIn().fadeOut().fadeIn();
	}

	/**
	 * We are using the same control for score
	 * as the one we used for bid
	 */
	this.showScore = function() {
//		$('#bid' + this.screenPosition).hide();
//		$('#bid' + this.screenPosition).html(this.score);
	}

	
	this.draw = function() {
		
		// show name in center
		$('#name' + this.screenPosition).html(this.name);
		
		// show connectivity
		if(this.connected)
			this.showConnected();
		else
			this.showDisconnected();
		
		// show loyalty flag on the left
		this.showLoyalty();
		
		// show collected points on the right
		this.showPoints();
		
		// draw point cards below
		if(this.pointCards.length > 0)
			this.drawPointCards(this.pointCards);

		// add border if it's the player's turn
		if (this.turn) {
			$('.pos').removeClass('turn');
			$('#pos' + this.screenPosition).addClass('turn');
		}
	}
	
	this.showPoints = function(){
		// just draw don't show, let them be shown together from calling function
		$('#points' + this.screenPosition).hide();
		
		if(this.points > 0)
			$('#points' + this.screenPosition).html(this.points);
	}
	
	this.showLoyalty = function(){
		$('#pos' + this.screenPosition).removeClass('inactive neutral').addClass(
				this.loyalty).show();
	}	
	
	this.showLoyalty = function(){
		$('#pos' + this.screenPosition).removeClass('inactive neutral').addClass(
				this.loyalty).show();
//		console.log("loyalty of " + this.name + ":" + this.loyalty);
		switch(this.loyalty){
		case LoyaltyType.BIDDER:
			$('#loyalty' + this.screenPosition).html("Bidder");
			break;
		case LoyaltyType.OPPONENT:
			$('#loyalty' + this.screenPosition).html("Opponent");
			break;
		case LoyaltyType.PARTNER:
			$('#loyalty' + this.screenPosition).html("Partner");
			var partner = partnerCard;
			// some formatting
			if(partner !== undefined){
				
//				console.log("Partner:"+partner);
				partner = partner.replace(/H/g, "&hearts;")
				partner = partner.replace(/S/g, "&spades;");
				partner = partner.replace(/C/g, "&clubs;");
				partner = partner.replace(/D/g, "&diams;");
//				console.log("Formatted Partner:"+partner);
				if(partnerCard.endsWith("H") || partnerCard.endsWith("D"))
					partner = "<span style='color: red'>"
							+ partner + "</span>";
//				console.log("Colored Partner:"+partner);
				$('#pCard' + this.screenPosition).html(partner);
			}
			break;	
		default:
			$('#loyalty' + this.screenPosition).html("");
			break;	
		}
	}

	this.drawPointCards = function(pointCards){
		var $pointCard;
		$('#pointCards' + this.screenPosition).html("");

		for (var i = 0; i < pointCards.length; i++) {
//			 $pointCard = $("<div class='pointCard' id='"+this.name+i+pointCards[i]+
//				"' style='background-image:url(/images/cards/" + pointCards[i] + ".png);'/>");
			 $pointCard = $("<img class='pointCard' id='" + this.name+i+pointCards[i] 
			 	+ "' src='/images/cards/" + pointCards[i] + ".png' />");
			 $('#pointCards' + this.screenPosition).append($pointCard);
		}
		
		// just draw don't show, let them be shown together from calling function
		$('#pointCards' + this.screenPosition).hide();
	}
	
	this.drawSnapshot = function(cards){
		var $card, card;
//		console.log("Cards="+ cards);
		$('#snapshot' + this.screenPosition).html("");

		for (var i = 0; i < cards.length; i++) {
			card = cards[i];
			$card = $("<div class='snapshotCard' id='"+this.name+i+card['code']+
				"' style='background-image:url(/images/cards/" + card['code'] + ".png);'/>");
			if(card['played'])
				 $card.addClass('played');
			 
			$('#snapshot' + this.screenPosition).append($card);
		}
		
	}
}
