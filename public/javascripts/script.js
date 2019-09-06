
var table = document.getElementById("onlineUsersTable");

$("#logout").on('click', function(){
	socket.emit('logout', socket.id);
});
socket.on('user_info', function(user){
	me = user;
});
socket.on('onlineUsers', function(users){
	if (table) {
		table.innerHTML = "";
		for (var i = 0; i < users.length; i++) {
			addUserRow(users[i]);
		}
	}
});
socket.on('invite_player', function(who){
	var f1 = function() {
		socket.emit('invatation_answer', {answer: "yes", player: me._id, invitor: who.info._id, socket: socket.id, invitorSocket: who.invitorSocket});
		$('body').css("cursor", "progress");
	};
	var f2 = function() {
		socket.emit('invatation_answer', {answer: "no", player: me._id, invitor: who.info._id, socket: socket.id, invitorSocket: who.invitorSocket});
	};
	setModal("Invatation",who.info.username + " invited you to play.", button1 = {needed: true, id: "inviteA", class: "btn btn-success", text: "Accept", dismiss: true, listener: f1}, button2 = {needed: true, id: "inviteD", class: "btn btn-danger", text: "Decline", dismiss: true, listener: f2})
	$('#modals').modal();
});
socket.on('logout', function(data){
	var f1 = function() {
		if (data) {
			window.location.replace("users/logout");
		}else{
			window.location.replace("/");
		}
	}
	setModal("You are logged out.","You were logged out from another browser window.", button1 = {needed: true, id: "ok", class: "btn btn-success", text: "OK", dismiss: true, listener: f1});
	$('#modals').on('click', f1);
	$('#modals').modal();
});
socket.on('redirect', function(room){
	$('body').css("cursor", "default");
	localStorage.setItem('room', JSON.stringify(room));
	window.location.replace("game");
});
socket.on('declinedGame', function(data){
	setModal("Info",data);
	$('#modals').modal();
	$('body').css("cursor", "default");
});
socket.on('close_modals', function(){
	$('#modals').hide();
});
socket.on('playing_mode', function() {
	$('#disable_game').css('display', 'block');
})

function addUserRow(user){
	if(me !== null){
		if (user.userId !== me._id && user.connectionCount > 0) {
			var row = table.insertRow(0);
			var cell1 = row.insertCell(0);
			var cell2 = row.insertCell(1);
			var cell3 = row.insertCell(2);
			cell1.innerHTML = user.username;
			cell2.innerHTML = user.wins;
			cell3content = "";
			if (user.status == false) {
				cell3content = "<button id='invite_btn' data-player="+ user.userId +" class='btn btn-success'>Invite</button>";
			}else{
				cell3content = "<button id='invite_btn' data-player="+ user.userId +" class='btn btn-danger' title='This player is playing right now.' disabled>Invite</button>";
			}
			cell3.innerHTML = cell3content;
			document.getElementById("invite_btn").onclick = function() {invite(this.dataset.player)};
		}
	}
}
function invite(playerid) {
	if (me.status) {
		$('#disable_game').css('display', 'block');
	}else{
		socket.emit('invite_player', {playerid: playerid, invitor: me, invitorSocket: socket.id});
		$('body').css("cursor", "progress");
	}
}


