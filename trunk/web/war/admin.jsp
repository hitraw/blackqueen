<!doctype html>
<!-- HTML5 shortened doctype!   -->

<%@page import="com.bq.room.manager.RoomManagerFactory"%>
<html>
<head>
<meta charset="utf-8">
<title>Black Queen Admin</title>
<script src="/_ah/channel/jsapi"></script>
<script src="scripts/jquery-2.1.1.min.js"></script>
<script src="scripts/admin.js"></script>
</head>

<body>
	<div id="joinInfo">
		<h1>&spades; Black Queen Admin</h1>
		<div class="errorContainer">
			<div id="error"></div>
		</div>
		<div class="data">
			<select id="slRooms">
				<%
					String[] rooms = RoomManagerFactory.getInstance().getRoomList();
									for (int i = 0; i < rooms.length; i++) {
				%>
				<option value="<%=rooms[i]%>">
					<%=rooms[i]%>
				</option>
				<%
					}
				%>
			</select> <input type="submit" id="btnLookup" value="Show Players" />
		</div>
		<div id="result">
			<!-- 
			<table id="result" border="1">
			</table>
 -->
		</div>
	</div>

</body>
</html>
