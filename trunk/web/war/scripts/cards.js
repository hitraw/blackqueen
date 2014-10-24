var partnerSelected = false;
var trumpSelected = false;
var partnerCard;
var trumpCard;
var myCardArray;

function showCards(cardArray) {
	console.log(myIndex + ":" + cardArray);
	myCardArray = cardArray;
	// clear hand first
	$('#myHand').html("");
	var $img;
	for (var i = 0; i < cardArray.length; i++) {
		$img = $("<img id='" + cardArray[i] + "'"
				+ " class='handCard unplayable' src='/images/cards/" + cardArray[i]
				+ ".png'/>")
				.click(function(){
					// if it's my turn 
					if(players[myIndex].turn){
						// if I've clicked on a playable card
						if($(this).hasClass('playable')){
							// TODO call /play and send this card + player info
							$.post('/play', {
								u : sessionStorage.username,
								g : sessionStorage.gameKey,
								c : card,
								i : myIndex
							}, function(result) {
								//$('#bidSpec').hide(600);
							});
							// TODO: show animation, card moving to table
						}
						else{
							// TODO display error message you can't play this card
							// if startingSuit is null, it could only mean you're playing 
							// trump and it's not cut yet. Show error accdly.
							
							// if starting suit is not null, it means you have that suit
							// and are trying to play another suit. show error accdly.
						}
					} 
					else{ 
						// TODO display error message it's not your turn
					}
				});
		// add click event and hover events on this card object;
		$('#myHand').append($img);
	}
	// if it was my turn, i make the call to move to next state now
	// no need, bidding starts automatically after cards are dealt from server
	// if (player.turn)
	// startBidding();

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
		trumpCard = $(this).prop('id');
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
					console.log("trumpCard=" + trumpCard);

					$.post('/spec', {
						u : sessionStorage.username,
						g : sessionStorage.gameKey,
						p : partnerCard,
						t : trumpCard
					}, function(result) {
						$('#bidSpec').hide(600);
					});

				});
		$('#doneBtn').html($btnDone);
	}
}

function managePlayMessage(json) {
	var card = json["card"];
	var highestCard = json["highestCard"];
	var playerIndex = json["currentIndex"];
	var nextIndex = json["nextIndex"];

	console.log("card:" + card);
	console.log("played by:" + players[playerIndex]);
	console.log("next turn:" + players[nextIndex])

}


function manageSpecMessage(json) {
	var partner = json["partner"];
	var trump = json["trump"];
	var bidTarget = json["bidTarget"];
	var oppTarget = json["oppTarget"];

	console.log("partner:" + partner);
	console.log("trump:" + trump);

	var $imgPartner = $("<img class='spec' id='imgPartner' src='/images/cards/"
			+ partner + ".png'/>");
	var $imgTrump = $("<img class='spec' id='imgTrump' src='/images/cards/"
			+ trump + ".png'/>");

	// some formatting
//	partner = partner.replace(/S/g, "&spades;");
//	partner = partner.replace(/H/g, "&hearts;");
//	partner = partner.replace(/C/g, "&clubs;");
//	partner = partner.replace(/D/g, "&diams;");
//	trump = "&" + trump + ";";

//	console.log("partner:" + partner);
//	console.log("trump:" + trump);
	
//	$('.handCard')

	$('#partnerTrump').html($imgPartner).append(" / ").append($imgTrump);
	$('#bidTarget').html(bidTarget + "/" + oppTarget).show()
	$('.bidSpec').show();
}

$(document).ready(function() {
	initializeCardSpecs();
});
