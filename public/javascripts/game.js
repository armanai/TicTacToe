const gnsp = io('/game');
let game;
let player1;
let player2; //opponent
//X ===> 1
//O ===> -1


var room = JSON.parse(localStorage.getItem('room'));

var p1 = new Player(room.players.me.username, room.players.me.symbol, room.players.me.wins, room.players.me.id, room.players.me.turn);
var p2 = new Player(room.players.opponent.username, room.players.opponent.symbol, room.players.opponent.wins, room.players.opponent.id, room.players.opponent.turn);

if (p1.turn) {
	game = new TicTacToe(room.id, room.board, room, p1, p2, p1);
}else{
	game = new TicTacToe(room.id, room.board, room, p1, p2, p2);
}

gnsp.emit('setRoomSocket', {roomId: game.roomId, id: room.players.me.id});

$("#player1 .username").text(p1.name);
$("#player2 .username").text(p2.name);
$("#player1 .wins").text(p1.wins);
$("#player2 .wins").text(p2.wins);

gnsp.on('endGame', function(data){
	game.endGame(data.row, data.col, data.num, data.winner);
});

gnsp.on('move', function(data){
	game.updateBoard(data.row,data.col,data.num);
});

gnsp.on('restartGame', function(data){
	setModal("Info",data);
	$('#modals').modal();
	game.restartGame();
	game.refreshBoard();
});

gnsp.on('disconnected', function(data){
	var f1 = function() {
		window.location.replace("/");
	};
	setModal("Info",data.message, button1 = {needed: true, id: "ok", class: "btn btn-success", text: "OK", dismiss: true, listener: f1});
	$('#modals').on('click', f1);
	$('#modals').modal();
});


gnsp.on('chat', function(message){
    insertChat("you", message);
    $('#menu-toggle').addClass("activeChat");
});

$(".mytext").on("keyup", function(e){
    if (e.which == 13){
        var text = $(this).val();
        if (text !== ""){
            insertChat("me", text); 
            gnsp.emit('chat', {message: text, towhom: game.player2.id});              
            $(this).val('');
        }
    }
});
$("#menu-toggle").click(function(e) {
	e.preventDefault();
	$("#wrapper").toggleClass("toggled");
	$('#menu-toggle').removeClass("activeChat");
});
document.getElementById("refresh").onclick = function() {
	game.restartGame();
	game.refreshBoard();
	gnsp.emit('restartGame', {message : game.player1.name + " restarted the game!", towhom: game.player2.id});
};
document.getElementById("home-redirect").onclick = function() {
	window.location.replace("/");
};