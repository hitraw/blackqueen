<!doctype html>
<!-- HTML5 shortened doctype!   -->

<html>
<head>
<meta charset="utf-8">
<title>Black Queen</title>
<link rel='stylesheet'
	href='http://fonts.googleapis.com/css?family=Trochut:700'>
<link rel="stylesheet" href="css/home.css">
<link rel="stylesheet" href="css/style.css">
<script src="/_ah/channel/jsapi" type="text/javascript"></script>
<script src="/scripts/jquery-2.1.1.min.js" type="text/javascript"></script>
<script src="/scripts/room.js" type="text/javascript"></script>
<script src="/scripts/game.js" type="text/javascript"></script>
<script src="/scripts/cards.js" type="text/javascript"></script>
</head>

<body>
	<div id="joinInfo">
		<div class="imgContainer">
			<img src="/images/bq.png" height="300" />
		</div>
		<div class="hdrContainer">
			<h1>Black Queen</h1>
			<div class="errorContainer">
				<div id="error"></div>
			</div>
			<div class="dataContainer">
				<div class="data">
					<input type="text" id="txtName" value="Name" size="30"
						maxlength="12" /> <input type="hidden" id="slGames" value="vdppl" />
					<input type="submit" id="btnEnter" value="Enter" />
				</div>
			</div>
		</div>
	</div>

	<input type="hidden" id='token'
		value='<%=request.getAttribute("token")%>' />

	<div id="room">
		<table id="roomTable">
			<tr>
				<td width="900">
					<!-- <div id="tablePoints"></div> -->
					<div id="bidSpecContainer" align="center">
						<div id="bidSpecSelector">

							<table class="bidTable">
								<tr>
									<td width="20%"><div id="doneBtn"></div></td>
									<td width="60%"><div id="bidTitle"></div></td>
									<td width="20%"><div id="bidValue"></div></td>
								</tr>
							</table>

							<hr />

							<table class="bidTable">
								<tr>
									<th class="partnerCell">Partner</th>
									<th class="trumpCell">Trump</th>
								</tr>
								<tr>
								<tr>
									<td class="partnerCell"><img id="AS" class="cardSpec"
										src="/images/cards/AS.png" /> <img id="KS" class="cardSpec"
										src="/images/cards/KS.png" /> <img id="QS" class="cardSpec"
										src="/images/cards/QS.png" /> <img id="JS" class="cardSpec"
										src="/images/cards/JS.png" /> <img id="10S" class="cardSpec"
										src="/images/cards/10S.png" /> <img id="9S" class="cardSpec"
										src="/images/cards/9S.png" /> <img id="8S" class="cardSpec"
										src="/images/cards/8S.png" /> <img id="7S" class="cardSpec"
										src="/images/cards/7S.png" /> <img id="6S" class="cardSpec"
										src="/images/cards/6S.png" /> <img id="5S" class="cardSpec"
										src="/images/cards/5S.png" /></td>
									<td class="trumpCell"><img id="S" class="suitSpec"
										src="/images/cards/S.png" /></td>
								</tr>
								<tr>
									<td class="partnerCell"><img id="AH" class="cardSpec"
										src="/images/cards/AH.png" /> <img id="KH" class="cardSpec"
										src="/images/cards/KH.png" /> <img id="QH" class="cardSpec"
										src="/images/cards/QH.png" /> <img id="JH" class="cardSpec"
										src="/images/cards/JH.png" /> <img id="10H" class="cardSpec"
										src="/images/cards/10H.png" /> <img id="9H" class="cardSpec"
										src="/images/cards/9H.png" /> <img id="8H" class="cardSpec"
										src="/images/cards/8H.png" /> <img id="7H" class="cardSpec"
										src="/images/cards/7H.png" /> <img id="6H" class="cardSpec"
										src="/images/cards/6H.png" /> <img id="5H" class="cardSpec"
										src="/images/cards/5H.png" /></td>
									<td class="trumpCell"><img id="H" class="suitSpec"
										src="/images/cards/H.png" /></td>
								</tr>
								<tr>
									<td class="partnerCell"><img id="AC" class="cardSpec"
										src="/images/cards/AC.png" /> <img id="KC" class="cardSpec"
										src="/images/cards/KC.png" /> <img id="QC" class="cardSpec"
										src="/images/cards/QC.png" /> <img id="JC" class="cardSpec"
										src="/images/cards/JC.png" /> <img id="10C" class="cardSpec"
										src="/images/cards/10C.png" /> <img id="9C" class="cardSpec"
										src="/images/cards/9C.png" /> <img id="8C" class="cardSpec"
										src="/images/cards/8C.png" /> <img id="7C" class="cardSpec"
										src="/images/cards/7C.png" /> <img id="6C" class="cardSpec"
										src="/images/cards/6C.png" /> <img id="5C" class="cardSpec"
										src="/images/cards/5C.png" /></td>
									<td class="trumpCell"><img id="C" class="suitSpec"
										src="/images/cards/C.png" /></td>
								</tr>
								<tr>
									<td class="partnerCell"><img id="AD" class="cardSpec"
										src="/images/cards/AD.png" /> <img id="KD" class="cardSpec"
										src="/images/cards/KD.png" /> <img id="QD" class="cardSpec"
										src="/images/cards/QD.png" /> <img id="JD" class="cardSpec"
										src="/images/cards/JD.png" /> <img id="10D" class="cardSpec"
										src="/images/cards/10D.png" /> <img id="9D" class="cardSpec"
										src="/images/cards/9D.png" /> <img id="8D" class="cardSpec"
										src="/images/cards/8D.png" /> <img id="7D" class="cardSpec"
										src="/images/cards/7D.png" /> <img id="6D" class="cardSpec"
										src="/images/cards/6D.png" /> <img id="5D" class="cardSpec"
										src="/images/cards/5D.png" /></td>
									<td class="trumpCell"><img id="D" class="suitSpec"
										src="/images/cards/D.png" /></td>
								</tr>
							</table>
						</div>
					</div>

					<div id="gameTableContainer" align="center">

						<table id="gameTable">
							<tr class="header">
								<td width="30%"><div id="gameId" align="left"></div></td>
								<td width="40%"><div id="status"></div></td>
								<td width="30%"><div id="endBtn" align="right"></div></td>
							</tr>
							<!-- Top row -->
							<tr class="tblRow">
								<td width="30%">
									<div class="bidSpec">
										Partner &nbsp; | &nbsp;&nbsp; Trump
										<div id="partnerTrump"></div>
									</div>

								</td>
								<td width="40%">
									<div id="pos4" class="pos inactive">
										<div class="nameContainer">
											<div id="loyalty4" class="loyalty"></div>
											<div id="name4" class="name"></div>
											<div id="points4" class="points"></div>
										</div>
										<div id="pointCards4" class="pointCardsContainer">
										<!-- 	<table class="tblPoints">
												<tr class="top">
													<td width="5%" class="suit top">&spades;</td>
													<td width="45%" id="spades4" class="points top"></td>
													<td width="5%" class="suit right top">&hearts;</td>
													<td width="40%" id="hearts4" class="points top"></td>
												</tr>
												<tr>
													<td width="5%" class="suit">&clubs;</td>
													<td width="45%" id="clubs4" class="points"></td>
													<td width="5%" class="suit right">&diams;</td>
													<td width="45%" id="diams4" class="points"></td>
												</tr>
											</table> -->
										</div>
										<div id="bid4" class="bid"></div>
									</div>
								</td>
								<td width="30%">
									<div id="targetContainer" class="bidSpec">
										Target
										<div id="bidTarget"></div>
									</div>

								</td>
							</tr>

							<!-- Middle rows -->
							<tr class="tblRow">
								<td><div id="pos3" class="pos inactive">
										<div class="nameContainer">
											<div id="loyalty3" class="loyalty"></div>
											<div id="name3" class="name"></div>
											<div id="points3" class="points"></div>
										</div>
										<div id="pointCards3" class="pointCardsContainer">
										<!-- 	<table class="tblPoints">
												<tr class="top">
													<td width="5%" class="suit top">&spades;</td>
													<td width="45%" id="spades3" class="points top"></td>
													<td width="5%" class="suit right top">&hearts;</td>
													<td width="40%" id="hearts3" class="points top"></td>
												</tr>
												<tr>
													<td width="5%" class="suit">&clubs;</td>
													<td width="45%" id="clubs3" class="points"></td>
													<td width="5%" class="suit right">&diams;</td>
													<td width="45%" id="diams3" class="points"></td>
												</tr>
											</table> -->
										</div>
										<div id="bid3" class="bid"></div>
									</div></td>
								<td rowspan="3">
									<div id="cardMat"></div>
									<div id="bidControl">
										<div id="bidControl1" class="bidControl"></div>
										<div id="bidControl2" class="bidControl"></div>
									</div>
								</td>
								<td><div id="pos5" class="pos inactive">
										<div class="nameContainer">
											<div id="loyalty5" class="loyalty"></div>
											<div id="name5" class="name"></div>
											<div id="points5" class="points"></div>
										</div>
										<div id="pointCards5" class="pointCardsContainer">
											<!-- <table class="tblPoints">
												<tr class="top">
													<td width="5%" class="suit top">&spades;</td>
													<td width="45%" id="spades5" class="points top"></td>
													<td width="5%" class="suit right top">&hearts;</td>
													<td width="40%" id="hearts5" class="points top"></td>
												</tr>
												<tr>
													<td width="5%" class="suit">&clubs;</td>
													<td width="45%" id="clubs5" class="points"></td>
													<td width="5%" class="suit right">&diams;</td>
													<td width="45%" id="diams5" class="points"></td>
												</tr>
											</table> -->
										</div>
										<div id="bid5" class="bid"></div>
									</div></td>
							</tr>
							<tr class="tblRow">
								<td><div id="pos2" class="pos inactive">
										<div class="nameContainer">
											<div id="loyalty2" class="loyalty"></div>
											<div id="name2" class="name"></div>
											<div id="points2" class="points"></div>
										</div>
										<div id="pointCards2" class="pointCardsContainer">
											<!-- <table class="tblPoints">
												<tr class="top">
													<td width="5%" class="suit top">&spades;</td>
													<td width="45%" id="spades2" class="points top"></td>
													<td width="5%" class="suit right top">&hearts;</td>
													<td width="40%" id="hearts2" class="points top"></td>
												</tr>
												<tr>
													<td width="5%" class="suit">&clubs;</td>
													<td width="45%" id="clubs2" class="points"></td>
													<td width="5%" class="suit right">&diams;</td>
													<td width="45%" id="diams2" class="points"></td>
												</tr>
											</table> -->
										</div>
										<div id="bid2" class="bid"></div>
									</div></td>
								<td><div id="pos6" class="pos inactive">
										<div class="nameContainer">
											<div id="loyalty6" class="loyalty"></div>
											<div id="name6" class="name"></div>
											<div id="points6" class="points"></div>
										</div>
										<div id="pointCards6" class="pointCardsContainer">
											<!-- <table class="tblPoints">
												<tr class="top">
													<td width="5%" class="suit top">&spades;</td>
													<td width="45%" id="spades6" class="points top"></td>
													<td width="5%" class="suit right top">&hearts;</td>
													<td width="40%" id="hearts6" class="points top"></td>
												</tr>
												<tr>
													<td width="5%" class="suit">&clubs;</td>
													<td width="45%" id="clubs6" class="points"></td>
													<td width="5%" class="suit right">&diams;</td>
													<td width="45%" id="diams6" class="points"></td>
												</tr>
											</table> -->
										</div>
										<div id="bid6" class="bid"></div>
									</div></td>
							</tr>
							<tr class="tblRow">
								<td><div id="pos1" class="pos inactive">
										<div class="nameContainer">
											<div id="loyalty1" class="loyalty"></div>
											<div id="name1" class="name"></div>
											<div id="points1" class="points"></div>
										</div>
										<div id="pointCards1" class="pointCardsContainer">
											<!-- <table class="tblPoints">
												<tr class="top">
													<td width="5%" class="suit top">&spades;</td>
													<td width="45%" id="spades1" class="points top"></td>
													<td width="5%" class="suit right top">&hearts;</td>
													<td width="40%" id="hearts1" class="points top"></td>
												</tr>
												<tr>
													<td width="5%" class="suit">&clubs;</td>
													<td width="45%" id="clubs1" class="points"></td>
													<td width="5%" class="suit right">&diams;</td>
													<td width="45%" id="diams1" class="points"></td>
												</tr>
											</table> -->
										</div>
										<div id="bid1" class="bid"></div>
									</div></td>
								<td><div id="pos7" class="pos inactive">
										<div class="nameContainer">
											<div id="loyalty7" class="loyalty"></div>
											<div id="name7" class="name"></div>
											<div id="points7" class="points"></div>
										</div>
										<div id="pointCards7" class="pointCardsContainer">
											<!-- <table class="tblPoints">
												<tr class="top">
													<td width="5%" class="suit top">&spades;</td>
													<td width="45%" id="spades7" class="points top"></td>
													<td width="5%" class="suit right top">&hearts;</td>
													<td width="40%" id="hearts7" class="points top"></td>
												</tr>
												<tr>
													<td width="5%" class="suit">&clubs;</td>
													<td width="45%" id="clubs7" class="points"></td>
													<td width="5%" class="suit right">&diams;</td>
													<td width="45%" id="diams7" class="points"></td>
												</tr>
											</table> -->
										</div>
										<div id="bid7" class="bid"></div>
									</div></td>
							</tr>

							<!-- My object -->
							<tr class="tblRow">
								<td><div id="deal" align="right"></div></td>
								<td><div id="pos0" class="pos inactive">
										<div class="nameContainer">
											<div id="loyalty0" class="loyalty"></div>
											<div id="name0" class="name"></div>
											<div id="points0" class="points"></div>
										</div>
										<div id="pointCards0" class="pointCardsContainer">
											<!-- <table class="tblPoints">
												<tr class="top">
													<td width="5%" class="suit top">&spades;</td>
													<td width="45%" id="spades0" class="points top"></td>
													<td width="5%" class="suit right top">&hearts;</td>
													<td width="40%" id="hearts0" class="points top"></td>
												</tr>
												<tr>
													<td width="5%" class="suit">&clubs;</td>
													<td width="45%" id="clubs0" class="points"></td>
													<td width="5%" class="suit right">&diams;</td>
													<td width="45%" id="diams0" class="points"></td>
												</tr>
											</table> -->
										</div>
										<div id="bid0" class="bid"></div>
									</div></td>
								<td>
									<div id="end"></div>
								</td>
							</tr>

							<!-- My cards -->
							<tr height="110px">
								<td colspan="3">
									<div id="myHand"></div>
									<div id="playError"></div>
								</td>
							</tr>


						</table>
					</div>
				</td>

				<td>
					<div id="boardContainer" align="right">

						<!-- <div id="notifWindow" class="logWindow">
							<div class="header">&nbsp;Notifications</div>
							<div id="notifLog" class="log">
								<ul id="lsNotif" class="list">
								</ul>
							</div>
						</div> -->
						<div id="scoreWindow" class="logWindow">
							<div class="header">&nbsp;Score Board</div>
							<div id="scoreLog" class="log">
							</div>
						</div>

						<div id="chatWindow" class="logWindow">
							<div class="header">&nbsp;Message Board</div>
							<div id="chatLog" class="log">
								<ul id="lsChat" class="list">

								</ul>
							</div>
						</div>
						<div id="chatText">
								<input type="text" id="txtChat" />
						</div>

					</div>
				</td>
			</tr>
		</table>
	</div>
</body>
</html>

