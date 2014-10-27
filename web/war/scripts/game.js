var centreX = 450;
var centreY = 270;
var radius = 260;
var players; // array of object players currently on screen
var positions; // array of positions these players are on.
var myIndex = 0; // default 0

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
		if (myIndex === turnIndex)
			showBidControl(highestBid);
		else {
			$('#bidControl1').html("");
			$('#bidControl2').html("");
			$('#bidControl').hide();
		}
	}
}

function declareBidWinner(winnerIndex) {
	var bidWinner = players[winnerIndex];
	bidWinner.loyalty = LoyaltyType.BIDDER;
	bidWinner.draw();
	// if this next player having won the bid is me
	if (myIndex === winnerIndex) {
		showBidSpecSelector(bidWinner);
	} else {
		$('#bidControl1').html(
				bidWinner.name + " has won the bid at " + bidWinner.bid);
		$('#bidControl1').append(
				"<br/><br/>" + bidWinner.name
						+ " is selecting Partner and Trump");
		$('#bidControl').show();
	}
}

function showBidSpecSelector(bidWinner) {
	$('#bidValue').html("Bid: " + bidWinner.bid);
	$('#bidTitle').html("You have won the bid. Please make your selection.");
	$('.bidControl').hide();
	$('#bidSpecSelector').show();
}

function showPlayers(playerJsonArray) {
	// clear canvas
	// $('canvas').clearCanvas();
	$('.pos').removeClass('turn bidder partner opponent');
	$('.pos').hide();
	$('.divName').html("");
	$('.divPoints').html("");

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

	// this loop starts from my index i.e. my position in array
	// and continues up to end of array i.e. players added after me
	for (var i = myIndex; i < playerCount; i++) {
		players[i].setPosition(positions[positionIndex++]);
		players[i].draw();
	}

	// this loop starts from 0 up to index i.e. players added before me.
	for (var i = 0; i < myIndex; i++) {
		players[i].setPosition(positions[positionIndex++]);
		players[i].draw();
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
		if (players[myIndex].turn)
			showDealBtn();
		$('#endBtn').html('');
		break;
	case RoomStatus.BIDDING:
		manageBid();
		showEndBtn();
		break;
	case RoomStatus.PLAYING:
		// if it's my turn allow me to play
		// TODO: add code to allow play
		showEndBtn();
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

function showDealBtn() {

	// ok button not needed. no redeal option either, let's keep it simple
	// var $btnOk = $(
	// "<input type='button' id='btnOk' class='button green' value='Ok'/>")
	// .click(function() {
	// console.log("calling /state to move to next state");
	// $.post('/state', {
	// u : sessionStorage.username,
	// g : sessionStorage.gameKey,
	// m : "next"
	// }, function(result) {
	// //
	// });
	// $('#deal').html("");
	// });

	var $btnDeal = $(
			"<input type='button' id='btnDeal' class='button green' value='Deal'/>")
			.click(function() {
				console.log("calling /deal to deal cards");
				$.post('/deal', {
					u : sessionStorage.username,
					g : sessionStorage.gameKey
				});
				// $(this).val("Redeal");
				// $('#deal').append($btnOk);
				$('#deal').html("");
			});

	// $('#deal').html("<img src='/images/bq-deck.png' width='80'/>");
	// $('#deal').append($btnDeal);
	$('#deal').html($btnDeal);
}

function showBidControl(highestBid) {
	var $img;
	// clear the controls first
	$('.bidControl').html("");

	// add titles
	$('#bidControl1').html("What's your bid?<br/>");

	var maxBid = (players.length === 4) ? 130 : 260;
	// pass button
	var bid = -1;
	$img = $(
			"<input type='button' id='bidBtn" + bid
					+ "' class='button green' value='PASS'/>").click(
			function() {
				console.log("calling /bid to PASS");
				$.post('/bid', {
					u : sessionStorage.username,
					g : sessionStorage.gameKey,
					i : myIndex,
					m : -1
				});
				$('.bidControl').html("");
				$('#bidControl').hide();
			});
	$('#bidControl1').append($img);
	$('#bidControl1').append("<br/>");

	for (var bid = highestBid + 5, count = 0; bid < maxBid && count < 20; bid += 5, count++) {
		$img = $(
				"<input type='button' id='bidBtn" + bid
						+ "' class='button green bidButton' value='" + bid
						+ "'/>").click(function() {
			console.log("calling /bid: " + $(this).val());
			$.post('/bid', {
				u : sessionStorage.username,
				g : sessionStorage.gameKey,
				i : myIndex,
				m : $(this).val()
			});
		});
		$('#bidControl2').append($img);
		$('#bidControl').show();
	}
}

function showEndBtn() {
	// show me End button, (even if it's not my turn)
	// TODO: check if we need this option
	var $btnEnd = $(
			"<input type='button' id='btnEnd' class='button red' value='End Game'/>")
			.click(function() {
				if (confirm("Are you sure you want to end the game?")) {
					console.log("calling /end to end game");
					$.post('/end', {
						u : sessionStorage.username,
						g : sessionStorage.gameKey
					});
					// $('#myHand').html("");
				}
			});
	$('#endBtn').html($btnEnd);
}

function Player(jsonObj) {
	// console.log("119:jsonObj:"+jsonObj);
	this.name = jsonObj["name"];
	this.loyalty = jsonObj["loyalty"];
	this.turn = jsonObj["turn"];
	this.bid = jsonObj["bid"];
	this.screenPosition; // position of player on screen (slot 0 -> 7)
	this.points = jsonObj["points"];
	this.pointCards = jsonObj["pointCards"]; // card array
	this.connected;

	this.setPosition = function(screenPos) {
		this.screenPosition = screenPos;
	}

	this.connected = function() {
		connected = true;
	}

	this.disconnected = function() {
		connected = false;
	}

	this.removeTurn = function() {
		this.turn = false;
		$('#pos' + this.screenPosition).removeClass('turn');
	}

	this.setTurn = function() {
		this.turn = true;
		$('#pos' + this.screenPosition).addClass('turn');
	}

	this.showBid = function() {
		$('#bid' + this.screenPosition).hide();
		if (this.bid > 0)
			$('#bid' + this.screenPosition).html(this.bid);
		else if (this.bid == -1)
			$('#bid' + this.screenPosition).html("PASS");
		$('#bid' + this.screenPosition).fadeIn().fadeOut().fadeIn();
	}

	this.draw = function() {
		$('#name' + this.screenPosition).html(this.name);
		$('#pos' + this.screenPosition).removeClass('inactive').addClass(
				this.loyalty).show();
		if(this.points > 0)
			$('#points' + this.screenPosition).html(this.points);
//		console.log("pointCards:"+this.pointCards);
		if(this.pointCards.length > 0)
			this.drawPointCards(this.pointCards);

		if (this.turn) {
			$('.pos').removeClass('turn');
			$('#pos' + this.screenPosition).addClass('turn');
		}
	}

	this.drawPointCards = function(pointCards){
		var $pointCard;
		$('#pointCards' + this.screenPosition).html("");
		// show if hidden
		$('#pointCards' + this.screenPosition).show();
		for (var i = 0; i < pointCards.length; i++) {
			 $pointCard = $("<img class='pointCard' id='"+this.name+i+pointCards[i]+"' src='/images/cards/" + pointCards[i] + ".png' />");
			 $('#pointCards' + this.screenPosition).append($pointCard);
		}

	}
}
