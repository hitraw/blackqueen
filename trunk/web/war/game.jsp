<!doctype html>
<!-- HTML5 shortened doctype!   -->

<html>
<head>
<meta charset="utf-8">
<title>Black Queen</title>
<link rel="stylesheet" type='text/css'
	href="/css/jquery-ui.css">
<link rel='stylesheet' type='text/css'
	href='http://fonts.googleapis.com/css?family=Trochut:700'>
<link rel='stylesheet' type='text/css'
	href='http://fonts.googleapis.com/css?family=Just+Another+Hand'>
<link rel="stylesheet" type='text/css' href="css/home.css">
<link rel="stylesheet" type='text/css' href="css/style.css">

<script src="/scripts/jquery-2.1.1.min.js" type="text/javascript"></script>
<script src="/scripts/jquery-ui.js" type="text/javascript"></script>

<script src="/_ah/channel/jsapi" type="text/javascript"></script>
<script src="/scripts/room.js" type="text/javascript"></script>
<script src="/scripts/game.js" type="text/javascript"></script>
<script src="/scripts/cards.js" type="text/javascript"></script>

</head>

<body>

	<div id="joinInfo">
		<div class="imgContainer">
			<a href="/"><img id="bq" src="/images/bq.png" height="300" /></a>
		</div>
		<div class="hdrContainer">
			<h1>Black Queen</h1>
			<div class="errorContainer">
				<div id="error"></div>
			</div>
			<div class="dataContainer">
				<div class="data">
					<input type="text" id="txtName" value="Name" size="30"
						maxlength="12" /> <input type="hidden" id="slRooms" value="vdppl" />
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
				<td>
					<div id="bidSpecContainer" align="center">
						<div id="bidSpecSelector">

							<table class="bidTable">
								<tr>
									<td width="15%"><div id="doneBtn"></div></td>
									<td width="70%"><div id="bidTitle"></div></td>
									<td width="15%"><!-- <div id="bidValue"> --></div></td>
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
						<div style="height: 22px">
							<table class="gameTable">
								<tr class="header">
									<td width="30%"><div id="gameId" align="left"></div></td>
									<td width="40%"><div id="status"></div></td>
									<td width="30%"><div id="endBtn" align="right"></div></td>
								</tr>
							</table>
						</div>
						
						<table class="gameTable">
							
							<!-- Top row -->
							<tr class="tblRow">
								<td width="30%">
									<div class="bidSpec">
											<div style="width:90px; float: left; text-align:center; border-bottom: 1px solid;">Partner</div>
											<div style="width:20px; float: left; text-align:center; border-bottom: 1px solid;">|</div>
											<div style="width:90px; float: left; text-align:center; border-bottom: 1px solid;">Trump</div>
										<!-- Partner &nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp; Trump &nbsp;&nbsp;&nbsp; -->
										<div id="partnerTrump">
											<div id="partner" class="specContainer"></div>
											<div style="width:20px; float: left; text-align:center;">|</div>
											<div id="trump" class="specContainer"></div>
										</div>
									</div>

								</td>
								<td width="40%">
									<div id="pos4" class="pos inactive">
										<div class="nameContainer">
											<div id="loyalty4" class="loyalty"></div>
											<div id="name4" class="name"></div>
											<div id="pCard4" class="pCard"></div>
										</div>
										<div id="pointCards4" class="pointCardsContainer"></div>
										<div id="points4" class="points"></div>
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
											<div id="pCard3" class="pCard"></div>
										</div>
										<div id="pointCards3" class="pointCardsContainer"></div>
										<div id="points3" class="points"></div>
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
											<div id="pCard5" class="pCard"></div>
										</div>
										<div id="pointCards5" class="pointCardsContainer"></div>
										<div id="points5" class="points"></div>
										<div id="bid5" class="bid"></div>
									</div></td>
							</tr>
							<tr class="tblRow">
								<td><div id="pos2" class="pos inactive">
										<div class="nameContainer">
											<div id="loyalty2" class="loyalty"></div>
											<div id="name2" class="name"></div>
											<div id="pCard2" class="pCard"></div>
										</div>
										<div id="pointCards2" class="pointCardsContainer"></div>
										<div id="points2" class="points"></div>
										<div id="bid2" class="bid"></div>
									</div></td>
								<td><div id="pos6" class="pos inactive">
										<div class="nameContainer">
											<div id="loyalty6" class="loyalty"></div>
											<div id="name6" class="name"></div>
											<div id="pCard6" class="pCard"></div>
										</div>
										<div id="pointCards6" class="pointCardsContainer"></div>
										<div id="points6" class="points"></div>
										<div id="bid6" class="bid"></div>
									</div></td>
							</tr>
							<tr class="tblRow">
								<td><div id="pos1" class="pos inactive">
										<div class="nameContainer">
											<div id="loyalty1" class="loyalty"></div>
											<div id="name1" class="name"></div>
											<div id="pCard1" class="pCard"></div>
										</div>
										<div id="pointCards1" class="pointCardsContainer"></div>
										<div id="points1" class="points"></div>
										<div id="bid1" class="bid"></div>
									</div></td>
								<td><div id="pos7" class="pos inactive">
										<div class="nameContainer">
											<div id="loyalty7" class="loyalty"></div>
											<div id="name7" class="name"></div>
											<div id="pCard7" class="pCard"></div>
										</div>
										<div id="pointCards7" class="pointCardsContainer"></div>
										<div id="points7" class="points"></div>
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
											<div id="pCard0" class="pCard"></div>
										</div>
										<div id="pointCards0" class="pointCardsContainer"></div>
										<div id="points0" class="points"></div>
										<div id="bid0" class="bid"></div>
									</div></td>
								<td>
									<div id="end"></div>
								</td>
							</tr>

							<!-- My cards -->
							<tr height="150px">
								<td colspan="3">
									<div id="myHand"></div>
									<div id="playError"></div>
								</td>
							</tr>


						</table>
					</div>
				</td>

				<td width="420px" align="right">
					<div id="boardContainer" align="right">

						<div id="scoreWindow" class="logWindow">
							<div id="iconTray" style='height: 60px; text-align: right;'>
								<img id='historyIcon' class='scoreboardIcon' 
									src='/images/history.png' title='View previous scoresheets'/> 
								<img id='archiveIcon' class='scoreboardIcon'
									src='/images/archive.png' title='Archive and create new scoresheet' />
								<div id="scoreboardError"></div>

							</div>
							<div class="papyrusHeader">&nbsp;Scores</div>
							<div id="scoreLog" class="log">
<!-- 
								<table class="scorecard">
									<tr>
										<td class='score' width="5%">#</td>
										<td class='score' width="15%">Bid / Opp</td>
										<td class='score' width="20%">Partner Trump</td>
										<td class='score' width="10%">Hitesh</td>
										<td class='score' width="10%">Vedavyas</td>
										<td class='score' width="10%">Barkha</td>
										<td class='score' width="10%">Aarti</td>
										<td class='score' width="10%">Handsome Hunk</td>
										<td class='score' width="10%">Giant Robot</td>
									</tr>
									<tr>
										<td class='score'>0</td>
										<td class='score'>888/888</td>
										<td class='score'>A&spades;/&clubs;</td>
										<td class='score number'><b>160</b></td>
										<td class='score number'>0</td>
										<td class='score number'>160</td>
										<td class='score number'>0</td>
										<td class='score number'>160</td>
										<td class='score number'>0</td>
									</tr>
									<tr>
										<th class='score' colspan="3">TOTAL</th>
										<th class='score number'><b>160</b></th>
										<th class='score number'>0</th>
										<th class='score number'>160</th>
										<th class='score number'>0</th>
										<th class='score number'>160</th>
										<th class='score number'>0</th>
									</tr>
								</table>

 -->
							</div>
						</div>

						<!-- <div id="notifWindow" class="logWindow">
							<div class="papyrusHeader">&nbsp;Notifications</div>
							<div id="notifLog" class="log">
								<ul id="lsNotif" class="list">
								</ul>
							</div>
						</div> -->


					</div>
				</td>
			</tr>
		</table>
	</div>
	<div id="chatWindow" class="logWindow">
		<table style="width: 100%; height: 100%;">
			<tr>
				<td style="vertical-align: bottom; text-align: center">
					<div id="chatHeader" class="header">&nbsp;Message Board</div>
					<div class="chat">
						<div id="chatLog" class="log">
							<ul id="lsChat" class="list">

							</ul>
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

