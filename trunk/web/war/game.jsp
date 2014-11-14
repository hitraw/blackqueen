<!doctype html>
<!-- HTML5 shortened doctype!   -->

<html>
<head>
<meta charset="utf-8">
<title>Black Queen</title>
<link rel="image_src" href="http://blackqueen.in/images/bq.png" />
<meta property="og:title" content="Black Queen" />
<meta property="og:image" content="http://blackqueen.in/images/bq.png" />
<link rel="stylesheet" type='text/css'
	href="/css/jquery-ui.css" />
<link rel='stylesheet' type='text/css'
	href='http://fonts.googleapis.com/css?family=Trochut:700' />
<link rel='stylesheet' type='text/css'
	href='http://fonts.googleapis.com/css?family=Just+Another+Hand' />
<link rel="stylesheet" type='text/css' href="css/home.css" />
<link rel="stylesheet" type='text/css' href="css/style.css" />

<script src="/scripts/jquery-2.1.1.min.js" type="text/javascript"></script>
<script src="/scripts/jquery-ui.js" type="text/javascript"></script>

<script src="/_ah/channel/jsapi" type="text/javascript"></script>
<script src="/scripts/room.js" type="text/javascript"></script>
<script src="/scripts/game.js" type="text/javascript"></script>
<script src="/scripts/cards.js" type="text/javascript"></script>

</head>

<body>

	<div id="room">
		<table id="roomTable">
			<tr>
				<td>
					<div id="bidSpecContainer" align="center">
						<div id="bidSpecSelector">

							
						</div>
					</div>

					<div id="gameTableContainer" align="center">
						<div style="height: 22px">
							<table class="gameTable">
								<tr class="header">
									<td width="30%">
										<div id="endBtn" style="float: left; text-align: left;"></div>
										<div id="gameId" style="float: left; text-align: left; margin-left: 5px; margin-top: 2px;"></div>
									</td>
									<td width="40%"><div id="status"></div></td>
									<td width="30%"><div id="quitBtn" align="right">
										<input type="button" class="button red" id="btnQuit" value="Leave" />
									</div></td>
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
										<div id="snapshot4" class="snapshot"></div>
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
										<div id="snapshot3" class="snapshot"></div>
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
										<div id="snapshot5" class="snapshot"></div>
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
										<div id="snapshot2" class="snapshot"></div>
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
										<div id="snapshot6" class="snapshot"></div>
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
										<div id="snapshot1" class="snapshot"></div>
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
										<div id="snapshot7" class="snapshot"></div>
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
										<div id="snapshot0" class="snapshot"></div>
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

