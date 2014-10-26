var partnerSelected = false;
var trumpSelected = false;
var partnerCard;
var trumpSuit;
var bidTarget;
var oppTarget;
var startingSuit;
var isCut;
var points;
var myCardArray;
var tableCardArray;
var highestCard;
var tableTop = 300;
var tableLeft = 450;

// defining endsWith function for strings
if (typeof String.prototype.endsWith !== 'function') {
	String.prototype.endsWith = function(suffix) {
		return this.indexOf(suffix, this.length - suffix.length) !== -1;
	};
}

/**
 * This method displays the cards dealt to this player (me)
 * @param cardArray
 */
function showCards(cardArray) {
	myCardArray = cardArray;
	// clear hand first
	$('#myHand').html("");
	var $img;
	for (var i = 0; i < cardArray.length; i++) {
		// id is array index and card code appended to keyword myCard
		// e.g. myCard0-AS, we need index and code both, b'coz code can repeat
		// and we can't use only index, as they change on server side
		var id = 'myCard'+i+"-"+cardArray[i];
		$img = $(
				"<div id='" + id
						+ "' " // style='z-index:" + i + "'
						+ "class='handCard' style='background-image:url(/images/cards/"
						+ cardArray[i] + ".png);'/>").click(function() {
			// if it's my turn
			if (players[myIndex].turn) {
				// if I've clicked on a playable card
				if ($(this).hasClass('playable')) {
					var $card = $(this);
					var cardId = $card.prop('id');
					var splitArray = cardId.split("-");
					cardCode = splitArray[1]; 
					$.post('/play', {
						u : sessionStorage.username,
						g : sessionStorage.gameKey,
						c : cardCode,
						i : myIndex
					}, function(result) {
						// remove 1 card from array at this position
						console.log("played card successfully, now remove from hand");
						console.log("outside action position of card on screen:");
						
						var offset = $card.offset();
						console.log("bfr repos: card: top: "+ $card.offset().top +", left:" + $card.offset().left);
						$card.detach().appendTo('#cardMat');
						$('#cardMat').show();
						console.log("aft repos: card: top: "+ $card.offset().top +", left:" + $card.offset().left);
						$card.offset(offset);
						console.log("aft adjus: card: top: "+ $card.offset().top +", left:" + $card.offset().left);
						tableTop = $('#cardMat').offset().top;
						tableLeft = $('#cardMat').offset().left;
						var offset = $card.offset();
						console.log("mat: top: "+ tableTop +", left:" + tableLeft);
						console.log("card: top: "+ offset.top +", left:" + offset.left);
						
						var move = "{'margin-top': '"
							+ (Math.round(tableTop - offset.top))
							+ "px', 'margin-left': '"
							+ (Math.round(tableLeft - offset.left))
							+ "px'}";
						console.log("move="+move);
						var moveTop = tableTop - offset.top;
						var moveLeft = offset.left - tableLeft;
						
						$card.removeClass('handCard playable')
							.addClass('tableCard').animate(
//							{'margin-top':'-190px', 'margin-left':'370px'}
//							{
//						top : '-=' + moveTop,
//						left : '-=50'
//						}
					move
					, 500);
						
						var cardIndex = cardArray.indexOf(cardCode);
						myCardArray = cardArray.splice(cardIndex, 1);
						
						// TODO: show animation card moving up
						// for now, just hide
						
					}).error(function() {
						console.log("error in playing card");
						addNotification("You played an invalid card.");
						// TODO display error message: invalid move
					});
					// TODO: show animation, card moving up slightly now
					// and to the table on success above
//					$(this).animate({'margin-top':'-50px'}, 500);
					
				} else {
					// TODO display error message you can't play this card
					// if startingSuit is null, it could only mean you're
					// playing trump and it's not cut yet. Show error accdly.
					addNotification("You can't play this card.");

					// if starting suit is not null, it means you have that suit
					// and are trying to play another suit. show error accdly.
				}
			} else {
				// TODO display error message it's not your turn
				addNotification("It's not your turn to play yet.");
			}
		});

		$('#myHand').append($img);
	}
	// if it was my turn, i make the call to move to next state now
	// no need, bidding starts automatically after cards are dealt from server
	// if (player.turn)
	// startBidding();

	disableHandCards();
	if (status === RoomStatus.PLAYING && players[myIndex].turn)
		setPlayableCards();

	// show me End button (even if it's not my turn)
	showEndBtn();

}

function initializeCardSpecs() {
	// $('.cardSpec').removeClass('selected');
	// $('.suitSpec').removeClass('selected');

	$('.cardSpec').click(function() {
		$('.cardSpec').removeClass('selected');
		$(this).addClass('selected');
		partnerCard = $(this).prop('id');
		partnerSelected = true;
		checkShowDoneBtn();
	});

	$('.suitSpec').click(function() {
		$('.suitSpec').removeClass('selected');
		$(this).addClass('selected');
		trumpSuit = $(this).prop('id');
		trumpSelected = true;
		checkShowDoneBtn();
	});
}

function checkShowDoneBtn() {
	if (partnerSelected && trumpSelected) {

		var $btnDone = $(
				"<input type='button' id='btnDone' class='button green' value='Done'/>")
				.click(function() {
					// post bid to server call bid spec servlet

					$.post('/spec', {
						u : sessionStorage.username,
						g : sessionStorage.gameKey,
						p : partnerCard,
						t : trumpSuit
					}, function(result) {
						$('#bidSpec').hide(600);
						initializeRound();
						setPlayableCards(trumpSuit);
					});

				});
		$('#doneBtn').html($btnDone);
	}
}

function manageSpecMessage(json) {
	partnerCard = json["partner"];
	trumpSuit = json["trump"];
	bidTarget = json["bidTarget"];
	oppTarget = json["oppTarget"];

	var $imgPartner = $("<img class='spec' id='imgPartner' src='/images/cards/"
			+ partnerCard + ".png'/>");
	var $imgTrump = $("<img class='spec' id='imgTrump' src='/images/cards/"
			+ trumpSuit + ".png'/>");

	// some formatting
	// partner = partner.replace(/S/g, "&spades;");
	// partner = partner.replace(/H/g, "&hearts;");
	// partner = partner.replace(/C/g, "&clubs;");
	// partner = partner.replace(/D/g, "&diams;");
	// trump = "&" + trump + ";";

	// console.log("partner:" + partner);
	// console.log("trump:" + trump);

	// $('.handCard')

	$('#partnerTrump').html($imgPartner).append(" | ").append($imgTrump);
	$('#bidTarget').html(bidTarget + "/" + oppTarget).show();
	$('.bidSpec').show();
}

function initializeGame() {
	isCut = false;
}

function initializeRound() {
	startingSuit = null;
}

function disableHandCards() {
	// set all cards in hand to unplayable by default
	$('.handCard').removeClass('playable').addClass('unplayable');
}

/**
 * this method should be called only if it's my turn i.e. players[myIndex].turn
 * is true or turnIndex == myIndex depending from where it's called. and by
 * default disableHandCards should be called before it.
 */
function setPlayableCards() {
	var card;

	// if startingSuit is null/undefined
	// i.e. if I am starting this round
	if (startingSuit === undefined || startingSuit === null) {
		console.log("I am starting this round");
		// if it has been cut, everything is playable
		if (isCut)
			$('.handCard').removeClass('unplayable').addClass('playable');

		else {
			console.log("it hasn't been cut yet");

			// let's assume I have don't have non trump cards
			var hasNonTrump = false;

			// iterate through each card in hand
			for ( var i in myCardArray) {

				card = myCardArray[i];

				// if this card is not a trump suit
				if (!card.endsWith(trumpSuit)) {

					// console.log(card + " DOESN'T end with " + trumpSuit);
					// make it playable
					var id = '#myCard' + i + "-" + myCardArray[i];
					$(id).removeClass('unplayable').addClass('playable');

					// refute assumption that i don't have any
					// non trump & flag that I have at least one
					hasNonTrump = true;
				}
				// else console.log(card + " ends with " + trumpSuit);
			}
			// if after iteration, I have no non trump
			// console.log("has Non Trump:" + hasNonTrump);
			if (!hasNonTrump)
				// make everything playable
				$('.handCard').removeClass('unplayable').addClass('playable');
		}
	}
	// and if i am not starting this round
	else {
		console.log("I am NOT starting this round");

		// let's assume I don't have any card with starting suit
		var hasStartingSuit = false;

		// iterate through each card in hand
		for ( var i in myCardArray) {
			card = myCardArray[i];

			// so if this card is same as starting suit
			if (card.endsWith(startingSuit)) {

				// make it playable
				var id = '#myCard' + i + "-" + myCardArray[i];
				$(id).removeClass('unplayable').addClass('playable');

				// refute assumption that i don't have any card
				// of starting suit & flag that I have at least one
				hasStartingSuit = true;
			}
		}
		// if after iteration, I have no card with starting suit
		if (!hasStartingSuit)
			// make everything playable
			$('.handCard').removeClass('unplayable').addClass('playable');
	}
}

function managePlayMessage(json) {
	var card = json["card"];
	var newHighestCard = json["highestCard"];
	var playerIndex = json["currentIndex"];
	var nextIndex = json["nextIndex"];
	startingSuit = json["startingSuit"];
	isCut = json["cut"];
	points = json["points"];

	var currPlayer = players[playerIndex];

	// currPlayer.showCardPlayed(card);
	currPlayer.removeTurn();

	players[nextIndex].setTurn();

	console.log("card:" + card);
	console.log("played by:" + players[playerIndex]);
	console.log("next turn:" + players[nextIndex]);

	// TODO add card animation logic in place of following
	addNotification(players[playerIndex].name + " played " + card + ".");
	//playCardAnimation();

//	if(playerIndex !== myIndex)
	disableHandCards();
	console.log("myIndex=" + myIndex + " ::: nextIndex=" + nextIndex);
	if (myIndex === nextIndex)
		setPlayableCards();
}

$(document).ready(function() {
	initializeCardSpecs();
});
