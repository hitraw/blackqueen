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
var highestCard;
var $myCard;
var disableAlert = false;
var posDefined = false;
var justPlayed = false;
var tableClearing = false;
var cardpos; 

function resetGame() {
	posDefined = false;
	cardpos = undefined;
	isCut = false;
	partnerCard = undefined;
	trumpSuit = undefined;
	resetRound();
}

function resetRound() {
	posDefined = false;
	startingSuit = undefined;
	highestCard = undefined;
	disableAlert = false;
}


function defineCardPos(){
	
	if(!posDefined || cardpos === undefined){
		
		// need this to be visible because all positions are relative to this
		$('#cardMat').show();
//		console.log("defining Card Pos on table...");
//	   	console.log("mat width="+$('#cardMat').width());
	   	var margin0 = 120 - 35;
	   	var matWidth = $('#cardMat').width();
	   	var matLeft = $('#cardMat').offset().left;
	   	var matRight = matLeft + matWidth; 
	   	
		cardpos = [	// array of card positions for players 0 to 7
		            {top: $('#pos0').offset().top - 120, left: $('#pos0').offset().left + margin0},
		            {top: $('#pos1').offset().top - 60, left: matLeft + matWidth/2 - 90},
		            {top: $('#pos2').offset().top, left: matLeft + matWidth/2 - 90},
		            {top: $('#pos3').offset().top + 60, left: matLeft + matWidth/2 - 90},
		            {top: $('#pos4').offset().top + 120, left: $('#pos4').offset().left + margin0},
		            {top: $('#pos5').offset().top + 60, left: matRight - matWidth/2 + 20},
		            {top: $('#pos6').offset().top, left: matRight - matWidth/2 + 20},
		            {top: $('#pos7').offset().top - 60, left: matRight - matWidth/2 + 20}
		           ];
		posDefined = true;
	}
}

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
	defineCardPos();
	myCardArray = new Array();
	// clear hand first
	$('#myHand').html("");
	var $img;
	
	if(cardArray.length > 0){
		playSound(dealSound);
	
		for (var i = 0; i < cardArray.length; i++) {
			// id is array index and card code appended to keyword myCard
			// e.g. myCard0-AS, we need index and code both, b'coz code can repeat
			// and we can't use only index, as they change on server side
			var id = 'myCard'+i+"-"+cardArray[i];
			myCardArray.push(id);
			$img = $(
					"<div id='" + id
							+ "' " // style='z-index:" + i + "'
							+ "class='handCard' style='background-image:url(/images/cards/"
							+ cardArray[i] + ".png);'/>")
							.click(function() {
				// if it's my turn
				if (myIndex !== undefined && players[myIndex].turn) {
					// if I've clicked on a playable card
					if ($(this).hasClass('playable')) {
						justPlayed = true;
						$myCard = $(this);
						var cardId = $myCard.prop('id');
						var splitArray = cardId.split("-");
						var cardCode = splitArray[1]; 
						$.post('/play', {
							u : sessionStorage.username,
							r : sessionStorage.roomName,
							c : cardCode,
							i : myIndex
						}, function(result) {
							// remove 1 card from array at this position
	//						console.log("played card successfully, now remove from hand");
							// do we even need to maintain myCardArray?? 
							// YES!!! we use this in setPlayable to check which cards
							// remain in our hand  
							// comment for now TODO: check later
							var cardIndex = myCardArray.indexOf(cardId);
							myCardArray.splice(cardIndex, 1);
							
							// retrieve and store the offset in a temp variable
							// because it's gonna change after moving it to #cardMat
							var offset = $myCard.offset();
	
							// adjust classes of the card and remove click event
							$myCard.removeClass('handCard unplayable playable').off();
							$myCard.addClass('tableCard');
							
							// detach $card from #myHand and attach it to #cardMat
							$myCard.detach().appendTo('#cardMat');
	
							// #cardMat might be hidden, let's show it!
							$('#cardMat').show(); 
							
							// assign it's old position back to the card, so we
							// can show it getting animated from there itself!
							$myCard.offset(offset);
							
	//						console.log("source: top: "+ offset.top +", left:" + offset.left);
	//						console.log("target: top: "+ cardpos[0].top +", left:" + cardpos[0].left);
		
							// build our move string
							var moveTop = Math.round(cardpos[0].top - offset.top);
							var moveLeft = Math.round(cardpos[0].left - offset.left);
							
							// move the card
							$myCard.animate(
	//							{'margin-top': moveTop + 'px', 'margin-left': moveLeft + 'px'}
								{top: cardpos[0].top, left: cardpos[0].left}
								, 500);
							
							// change title back to normal
							turnOver();
							
							justPlayed = false;
						}).error(function() {
							console.log("error in playing card");
							// TODO display error message: invalid move
							showPlayError("You played an invalid card.");
							
							// if somehow user managed to play an invalid card
							// allow him to play again
							setPlayableCards();
							
							justPlayed = false;
						});
						// while the card is being played, make sure to...
						// disable cards in my hand
						disableHandCards();
						
					} else {
						
						if(status === RoomStatus.BIDDING){
							showPlayError("Patience, we are still in bidding stage!");
						}
						else if(status === RoomStatus.GAME_OVER){
							showPlayError("This game is over! Please start new game!");
						}
						else{
							if(justPlayed)
								showPlayError("Relax, you just played! Please wait a moment!");
							else if(tableClearing)
								showPlayError("Please wait a moment for table to clear!");
							// display error message you can't play this card
							// if startingSuit is null, it could only mean you're
							// playing trump and it's not cut yet. Show error accdly.
							else if(startingSuit === undefined || startingSuit === null)
								showPlayError("It hasn't been cut yet. You can't start with cutting!");
		
							// if starting suit is not null, it means you have that suit
							// and are trying to play another suit. show error accdly.
							else
								showPlayError("You can't play different suit. You have this suit!");
						}
					}
				} else {
					if(status === RoomStatus.BIDDING)
						showPlayError("Patience, we are still in bidding stage!");
					else
						// display error message it's not your turn
						showPlayError("Don't get too excited, please wait for your turn!");
				}
			});
	
			$('#myHand').append($img);
		}
		
		// if it was my turn, i make the call to move to next state now
		// no need, bidding starts automatically after cards are dealt from server
		// if (player.turn)
		// startBidding();
	
		disableHandCards();
		if (status === RoomStatus.PLAYING && myIndex !== undefined 
				&& players[myIndex].turn)
			setPlayableCards();
	
		// show me End button (even if it's not my turn)
		showEndBtn();
	}
}

function showPlayError(error){
	
	var $handOffset = $('#myHand').offset();
	var $errOffset = {
		left : $('#myHand').offset().left + $('#myHand').width() / 2
				- $('#playError').width() / 2 - 12,
		top : $('#myHand').offset().top + $('#myHand').height() / 2
				- $('#playError').height() / 2
	};
	$('#playError').offset($errOffset);
	$('#playError').html(error).show().fadeOut(5000);
}

function initializeCardSpecs() {
	$('.cardSpec').removeClass('selected');
	$('.suitSpec').removeClass('selected');

	$('.cardSpec').click(function() {
		$('.cardSpec').removeClass('selected');
		$(this).addClass('selected');
		partnerCard = $(this).prop('id');
		partnerSelected = true;
		disableAlert = true;
		checkShowDoneBtn();
		
		// CR to display partner above while selection
		$clone = $(this).clone().removeClass('cardSpec selected').addClass('spec');
		$clone.click(function(){
			partnerCard = undefined;
			partnerSelected = false;
			$('.cardSpec').removeClass('selected');
			$('#doneBtn').html("");
			$(this).remove();
		});
		$('#partner').html($clone);
	});

	$('.suitSpec').click(function() {
		$('.suitSpec').removeClass('selected');
		$(this).addClass('selected');
		trumpSuit = $(this).prop('id');
		trumpSelected = true;
		disableAlert = true;
		checkShowDoneBtn();
		
		// CR to display trump above while selection
		$clone = $(this).clone().removeClass('suitSpec selected').addClass('spec');
		$clone.click(function(){
			trumpSuit = undefined;
			trumpSelected = false;
			$('.suitSpec').removeClass('selected');
			$('#doneBtn').html("");
			$(this).remove();
		});
		$('#trump').html($clone);
		
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
						r : sessionStorage.roomName,
						p : partnerCard,
						t : trumpSuit
					}, function(result) {
						$('#bidSpec').hide(600);
						$('#room').removeClass('curtain');
						resetRound();
//						setPlayableCards();
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
	
	var gameIndex = json["gameNo"];
	if (gameIndex !== undefined && gameIndex > 0)
		$('#gameId').html("Game " + (gameIndex + 1));

	var $imgPartner = $("<img class='spec' id='imgPartner' src='/images/cards/"
			+ partnerCard + ".png'/>");
	var $imgTrump = $("<img class='spec' id='imgTrump' src='/images/cards/"
			+ trumpSuit + ".png'/>");

	$('#partner').html($imgPartner);
	$('#trump').html($imgTrump);
	$('.bidSpec').show();
	
	$('#bidTarget').html(bidTarget + "/" + oppTarget).show();
	
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
//		console.log("I am starting this round. cut="+isCut);
		// if it has been cut, everything is playable
		if (isCut)
			$('.handCard').removeClass('unplayable').addClass('playable');

		else {
//			console.log("it hasn't been cut yet");

			// let's assume I have don't have non trump cards
			var hasNonTrump = false;
			
			// iterate through each card in hand
			for (var i in myCardArray) {

				var cardId = myCardArray[i];
				var splitArray = cardId.split("-");
				card = splitArray[1];

//				console.log("card:"+card);
//				console.log("trumpSuit:"+trumpSuit);
				
				// if this card is not a trump suit
				if (!card.endsWith(trumpSuit)) {

					// make it playable
					$('#'+ cardId).removeClass('unplayable').addClass('playable');

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
//		console.log("I am NOT starting this round");

		// let's assume I don't have any card with starting suit
		var hasStartingSuit = false;

		// iterate through each card in hand
		for ( var i in myCardArray) {
			var cardId = myCardArray[i];
			var splitArray = cardId.split("-");
			card = splitArray[1];

			// so if this card is same as starting suit
			if (card.endsWith(startingSuit)) {
				
//				console.log("I have the card "+ card + " of suit " + startingSuit);
				// make it playable
				$('#'+ cardId).removeClass('unplayable').addClass('playable');

				// refute assumption that i don't have any card
				// of starting suit & flag that I have at least one
				hasStartingSuit = true;
			}
		}
		// if after iteration, I have no card with starting suit
		if (!hasStartingSuit)
			// make everything in my hand playable
			$('.handCard').removeClass('unplayable').addClass('playable');
	}
	highlightTurn();
}

function showCardTable(json){
//	$('#cardMat').html("");
	$('#tablePoints').html("");
	highestCard = json["highestCard"];
	startingSuit = json["startingSuit"];
	isCut = json["cut"];
	points = json["points"];
	
	var cards = json["table"]; // array might need parsing
	var indices = json["indices"]; // array might need parsing

	var gameIndex = json["gameNo"];
	if (gameIndex !== undefined && gameIndex > 0)
		$('#gameId').html("Game " + (gameIndex + 1));
	
//	console.log("table cards:" + cards);
//	console.log("played by i:" + indices);

	// if there are any cards on table
	if(cards.length > 0){
		// show them
		for (var i = 0; i < cards.length; i++){ 
			
			var index = indices[i];
			var j = i;
			// TODO Remove following card play notification
			//	addGameNotification(players[index].name + " played " + cards[i] + ".");
			
			// show played cards including my own played card, after couple of seconds
			// let my hand cards load first
			showCardsSeq(cards[i],indices[i]);
		}	
		// show the total points on the table if more than 0
		// if(points > 0)	// for now show 0 as well
		$('#tablePoints').html(points).show();
	}
	// else i.e if no cards on the table, it means new round
	else{
		console.log("No cards on the table");
		// clearing out code moved to end of round in managePlayMessage()
	}
	
	// disable cards in my hand
	disableHandCards();
	
	// if it's my turn now, set & enable my playable cards
	if (status === RoomStatus.PLAYING && myIndex !== undefined 
			&& players[myIndex].turn){
//		console.log("showCardTable::: status="+status+", myIndex="+myIndex);
		setPlayableCards();
	}	
}

function showCardsSeq(card, index){
	window.setTimeout(function(){
		showPlayedCard(card, index);
	}, 1000);
}

function managePlayMessage(json) {
	
	// first thing we do is...
	// disable cards in my hand
	disableHandCards();
	
	var card = json["card"];
	var playerIndex = json["currentIndex"];
	var nextIndex = json["nextIndex"];
	startingSuit = json["startingSuit"];
	highestCard = json["highestCard"];
	var isCutNow = json["cut"];
	var points = json["points"];
	var isRoundOver = json["roundOver"];

	var currPlayer = players[playerIndex];

	// currPlayer.showCardPlayed(card);
	currPlayer.removeTurn();

	players[nextIndex].setTurn();

//	console.log("card:" + card);
//	console.log("played by:" + players[playerIndex]);
//	console.log("next turn:" + players[nextIndex]);
//	console.log("points on table:" + points);

	// TODO Remove following card play notification
	// addGameNotification(players[playerIndex].name + " played " + card + ".");

	// if you want to display total points of cards on table
	$('#tablePoints').html(points).show();

	// card animation and visibility manipulation
	if (playerIndex !== myIndex)
		//if it's not my card show played card
		showPlayedCard(card,playerIndex);
	// else it's my card being played
	else {// if it's my card, then set highest
		if(card === highestCard){
			// remove previous
			$('.highestCard').removeClass('highestCard');
			// mark this as highest
			$myCard.addClass('highestCard');
		}
	}
	
	// if hasn't been cut before and been cut now
	if(!isCut && isCutNow){
		// play the cutting sound
		playSound(cuttingSound);
		
		// save that it's been cut now, so sound not played again
		isCut = isCutNow;
	}
	
	if (isRoundOver) {
		// declare the winner of this round
		declareRoundWinner(json);
		
		// reset round level variables and controls
		resetRound();
	}
	else {
		// if it's my turn now, set my playable cards
		if (status === RoomStatus.PLAYING && nextIndex === myIndex){
			setPlayableCards();
		}
	}	
}

function declareRoundWinner(json){
	
	tableClearing = true;
	
	var roundWinnerIndex = json["winnerIndex"];
	var pointCardsJsonObj = JSON.parse(json["winnerPointCards"]);
	var roundWinnerPoints = pointCardsJsonObj["points"];
	var roundWinnerPointCards = pointCardsJsonObj["cards"];
	var roundPoints = json["points"];
	
	var roundWinner = players[roundWinnerIndex];
	addGameNotification(roundWinner.name
			+ " wins the round: " + roundPoints + " points");
	
	// show animation for cards on table going to winner
	var positionIndex = roundWinner.screenPosition;
	var position = $('#pos' + positionIndex).offset();
	
	// first let's wait for 1 sec for all card animations to complete
	// actually let's wait for 3 seconds to let users grasp what happened.
	window.setTimeout(function() {
		// then let's fade out cards on the table slowly
		$('.tableCard').fadeOut({
			// queue: false so fadeOut and animate happen in parallel
			queue : false,	
			duration : 'slow'
		});
		// and animate them at same time towards the winner
		$('.tableCard').animate({
			left : position.left,
			top : position.top
		}, 'slow', function() {
			// when done,
			// show the pointCards in player objects on screen
			// (already drawn by this time by Player object)
			// but only if there are any points in this round :)
			if (roundPoints > 0){
				roundWinner.drawPointCards(roundWinnerPointCards);
				roundWinner.setPoints(roundWinnerPoints);
				$('.pointCardsContainer').fadeIn({
					duration : 500
				});
				$('.points').fadeIn({
					duration : 500
				});
				
			}
			// finally clear out #cardMat and #tablePoints controls
			$('#cardMat').html("");
			$('#tablePoints').html("");
		});
		
		// and if it's my turn now, set my playable cards & highlight my turn
		if (status === RoomStatus.PLAYING && myIndex !== undefined 
				&& players[myIndex].turn)
			setPlayableCards();
		
		tableClearing = false;
	}, 2500);
		
}
	
function showPlayedCard(card, playerIndex){

	// make sure card positions are defined
	defineCardPos();
	
	// create non clickable card object at player position
	var id = "p" + playerIndex + "card" + card;
	var $card = $("<div id='" + id + "' "
			+ "class='tableCard' style='background-image:url(/images/cards/"
			+ card + ".png);'/>");
	// get player offset
	
	// get player position on table
	var position = players[playerIndex].screenPosition;
//	console.log("position: " + position);

	// get offset of this player on the table
	var startingOffset = $('#pos' + position).offset();
//	console.log("starting offset: " + startingOffset.top + ", "
//			+ startingOffset.left);

	// get the target offset of the card for this table position
	var endingOffset = cardpos[position];
//	console.log("ending offset: " + endingOffset.top + ", "
//			+ endingOffset.left);

	// add card to #cardMat div
	$card.appendTo('#cardMat');
	// but set it's offset to player position (outside mat)
	$card.offset(startingOffset);

	// show #cardMat just in case it's hidden
	$('#cardMat').show();

	// build our move variables
	var moveTop = Math.round(endingOffset.top - startingOffset.top);
	var moveLeft = Math.round(endingOffset.left - startingOffset.left);
//	console.log("move: " + moveTop + ", " + moveLeft);
	
	// move the card from player into #cardMat
	$card.animate(
		{top : endingOffset.top, left : endingOffset.left}
		, 500);
	
	// TODO: if being cut for first time, play the cut sound
	
	if(card === highestCard){
		// remove previous
		$('.highestCard').removeClass('highestCard');
		// mark this as highest
		$card.addClass('highestCard');
	}
		
//		for(var e=0; e<8; e++)
//			console.log("top, left coordinates of pos"+e+":"
//					+ $('#pos'+e).offset().top + ", "
//					+ $('#pos'+e).offset().left);
//	
}
