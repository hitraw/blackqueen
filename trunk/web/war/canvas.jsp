<!doctype html>
<!-- HTML5 shortened doctype!   -->

<%@page import="com.bq.room.manager.RoomManagerFactory"%>
<html>
<head>
<meta charset="utf-8">
<title>Black Queen</title>
<link rel="stylesheet" href="css/style.css">
<script src="/_ah/channel/jsapi"></script>
<script src="scripts/jquery-2.1.1.min.js"></script>
<script src="scripts/jcanvas.min.js"></script>
<script src="scripts/playercanvas.js"></script>
<script src="scripts/game.js"></script>
</head>

<body>
	<div id="joinInfo">
		<h1>&spades; Black Queen</h1>
		<div class="errorContainer">
			<div id="error"></div>
		</div>
		<div class="data">
			<input type="text" id="txtName" value="Name" size="30" maxlength="10" />
			<input type="hidden" id="slGames" value="vdppl" />
			<!-- 	<select
							id="slGames">
							<option>--Select Game Room--</option>
							<%//			String[] games = GameManagerFactory.getInstance().getGameList();
			//			for (int i = 0; i < games.length; i++) {%>
							<option value="<%//games[i]%>"><%//games[i]%></option>
							<%//			}%>
						</select> -->
			<input type="submit" id="btnEnter" value="Enter" />
		</div>
	</div>

	<div id="game">
		<table id="gameTable">
			<tr>
				<td rowspan="3" width="900">
					<div align="center">
						<div id="status"></div>
						<canvas id="cardTable" width="900" height="560"></canvas>
					</div>
				</td>
				<td class="rightTop">
				<div align="right">
					<div id="notifWindow" class="logWindow" draggable="true">
						<div class="header">&nbsp;Notifications</div>
						<div id="notifLog" class="log">
							<ul id="lsNotif" class="list">
							</ul>
						</div>
					</div>
					</div>
				</td>
			</tr>
			<tr>
				<td class="rightBottom">
				<div align="right">
					<div id="pointsWindow" class="logWindow" draggable="true">
						<div class="header">&nbsp;Points</div>
						<div id="pointsLog" class="log">
							<ul id="lsPoints" class="list">
							</ul>
						</div>
					</div>
					</div>
				</td>
			</tr>
			<tr>
				<td class="rightBottom">
					<div align="right">
						<div id="chatWindow" class="logWindow" draggable="true">
							<div class="header">&nbsp;Chat</div>
							<div id="chatLog">
								<ul id="lsChat" class="list">

								</ul>
							</div>
							<div id="chatText">
								<input type="text" id="txtChat" />
							</div>
						</div>
					</div>
				</td>
			</tr>
		</table>
	</div>
	<!-- 
    <table>
      <tr>
        <td colspan="2" style="font-weight:bold;">Available Servlets:</td>        
      </tr>
      <tr>
        <td><a href="blackqueen">Black Queen</a></td>
      </tr>
    </table>
     -->
</body>
</html>
