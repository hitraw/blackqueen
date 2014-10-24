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

if (typeof String.prototype.endsWith !== 'function') {
    String.prototype.endsWith = function(suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };
}

function showCards(cardArray) {
	console.log(myIndex + ":" + cardArray);
	myCardArray = cardArray;
	// clear hand first
	$('#myHand').html("");
	var $img;
	for (var i = 0; i < cardArray.length; i++) {
		// id is array index appended to keyword card
		// so card0 to card9 or card15
		$img = $(
				"<img id=myCard" + i + " style='z-index:'" + i + "'"
						+ " class='handCard' src='/images/cards/"
						+ cardArray[i] + ".png'/>").click(function() {
			// if it's my turn
			if (players[myIndex].turn) {
				// if I've clicked on a playable card
				if ($(this).hasClass('playable')) {
					// TODO call /play and send this card + player info
					$.post('/play', {
						u : sessionStorage.username,
						g : sessionStorage.gameKey,
						c : card,
						i : myIndex
					}, function(result) {
						// $('#bidSpec').hide(600);
					});
					// TODO: show animation, card moving to table
				} else {
					// TODO display error message you can't play this card
					// if startingSuit is null, it could only mean you're
					// playing
					// trump and it's not cut yet. Show error accdly.

					// if starting suit is not null, it means you have that suit
					// and are trying to play another suit. show error accdly.
				}
			} else {
				// TODO display error message it's not your turn
			}
		});
		
		$('#myHand').append($img);
	}
	// if it was my turn, i make the call to move to next state now
	// no need, bidding starts automatically after cards are dealt from server
	// if (player.turn)
	// startBidding();

	disableHandCards();
	if (players[myIndex].turn)
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
					console.log("partnerCard=" + partnerCard);
					console.log("trumpSuit=" + trumpSuit);

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

	console.log("partner:" + partnerCard);
	console.log("trump:" + trumpSuit);

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
		// it it has been cut, everything is playable
		if (isCut)
			$('.handCard').removeClass('unplayable').addClass('playable');

		else {
			console.log("it hasn't been cut yet");
			
			// let's assume I have don't have non trump cards
			var hasNonTrump = false;

			// iterate through each card in hand
			for (var i in myCardArray) {
				
				card = myCardArray[i];
				console.log(i+":"+card);

				// if this card is not a trump suit
				if (!card.endsWith(trumpSuit)) {

					console.log(card + " DOESN'T end with " + trumpSuit);
					// make it playable
					$('#myCard' + i).removeClass('unplayable').addClass(
							'playable');

					// refute assumption that i don't have any
					// non trump & flag that I have at least one
					hasNonTrump = true;
				}
				else console.log(card + " ends with " + trumpSuit);
			}
			// if after iteration, I have no non trump
			console.log("has Non Trump:" + hasNonTrump);
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
				$('#myCard' + i).removeClass('unplayable').addClass('playable');

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
	var highestCard = json["highestCard"];
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

	disableHandCards();
	if (myIndex === nextIndex)
		setPlayableCards();
}

$(document).ready(function() {
	initializeCardSpecs();
});
