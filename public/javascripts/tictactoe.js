class TicTacToe {

	constructor(roomId, board, room, player1, player2, turn) {
		this.roomId = roomId;
		this.board = board;
		this.player1 = player1;
		this.player2 = player2;
		this.currentPlayer = turn;
		this.room = room;
		this.moves = 0;
		this.addHandlersToBoard();
		this.refreshRoom();
		$("#turn").text((this.currentPlayer === this.player1)? "It is your turn" : "Waiting for opponent.");
	}
	addHandlersToBoard(){
		$("#board tr").each(function(){
			$(this).find("td").each(function(){
				$(this).on("click", function(e) {
					game.move($(this).data('row'), $(this).data('col'));
				});
			});
		});
	}
	getClickedField(row, col){
		return $("#board tr").eq(row).find("td").eq(col);
	}
	move(row, col){
		var clickedField = this.getClickedField(row, col);
		var dataPoints = 0;
		if ((this.currentPlayer !== this.player1) || !game) {
			setModal("Info","It is not your turn!");
			$('#modals').modal();
			return;
		}
		if (clickedField.data('points') !== 0) {
			return;
		}

		if (this.currentPlayer.symbol == "X") {
			dataPoints = 1;
		}else{
			dataPoints = -1;
		}

		this.updateBoard(row,col,dataPoints);
		var winner = this.checkWin();
		if (winner !== null) {
			this.endGame(row, col, dataPoints, winner);
			gnsp.emit('endGame', {num: dataPoints, row: row, col: col, winner: winner, towhom: this.player2.id});
		}else if ((winner === null) && (this.moves === 9)) {
			this.endGame(row, col, dataPoints, winner);
			gnsp.emit('endGame', {num: dataPoints, row: row, col: col, winner: null, towhom: this.player2.id});
		}else{
			console.log(this.moves);
			console.log("sending move no winner")
			gnsp.emit('move' , {num: dataPoints, row: row, col: col, towhom: this.player2.id});
		}
	}
	updateBoard(row, col, num){
		this.moves++;
		var clickedField = this.getClickedField(row, col);
		this.board[row][col] = num;
		clickedField.data('points', num);
		if (num == 1) {
			clickedField.addClass("clicked x");
		}else{
			clickedField.addClass("clicked o");
		}
		this.setCurrentPlayer();
	}
	checkWin(){
		var winner = null;
		var board = this.board;
		var p1 = (this.player1.symbol === "X") ? this.player1 : this.player2;
		var p2 = (this.player2.symbol === "O") ? this.player2 : this.player1;

		//checking rows
		for(var i = 0; i<3;i++){
			var sumPoints = 0;
			for(var j = 0; j<3;j++){
				sumPoints += board[i][j];
			}
			if(sumPoints === 3){
				winner = p1;
			}
			else if(sumPoints === -3){
				winner = p2;
			}
		}

		//checking cols
		for(var i = 0; i<3;i++){
			var sumPoints  = 0;
			for(var j = 0; j<3;j++){
				sumPoints  += board[j][i];
			}
			if(sumPoints === 3){
				winner = p1;
			}
			else if(sumPoints === -3){
				winner = p2;
			}
		}

		//diagonaly
		if(board[0][0] + board[1][1] + board[2][2] === 3){
			winner = p1;
		}
		else if(board[0][0] + board[1][1] + board[2][2] === -3){
			winner = p2;
		}

		if(board[2][0] + board[1][1] + board[0][2] === 3){
			winner = p1;
		}
		else if(board[2][0] + board[1][1] + board[0][2] === -3){
			winner = p2;
		}

		return winner;
	}
	endGame(row, col, num, winner){
		this.updateBoard(row, col, num);
		if (winner) {
			if (winner.id === this.player1.id) {
				console.log(winner.id + " " + this.player1.id);
				setModal("Info","You won!");
				$('#modals').modal();
				this.updateWins(this.player1);
				this.setTurn(true, false);
			}else{
				setModal("Info",this.player2.name + " won!");
				$('#modals').modal();
				this.updateWins(this.player2);
				this.setTurn(false, true);
			}
		}else{
			setModal("Info","Tie!");
			$('#modals').modal();
			this.setTurn((this.player1.turn === true) ? false : true , (this.player2.turn === true) ? false : true );
		}
		this.disableBoard();
		$("#turn").text("Game over");
		gnsp.emit('updatewins' , {id: this.player1.id, wins: this.player1.wins});
	}
	setTurn(player1Turn, player2Turn){
		this.player1.turn = player1Turn;
		this.player2.turn = player2Turn;
	}
	updateWins(winner){
		winner.increseWins();
		$("#player1 .wins").text(this.player1.wins);
		$("#player2 .wins").text(this.player2.wins);
	}
	setCurrentPlayer(){
		this.currentPlayer = (this.currentPlayer === this.player1) ? this.player2 : this.player1;
		$("#turn").text((this.currentPlayer === this.player1)? "It is your turn" : "Waiting for opponent.");
	}
	refreshBoard(){
		this.board = [["","",""],["","",""],["","",""]];
		$("#board tr").each(function(){
			$(this).find("td").each(function(){
				$(this).data("points", 0);
				$(this).removeAttr('class');
				console.log("removing classes x o");
			});
		});
	}
	refreshRoom(){
		this.room.board = this.board;
		localStorage.setItem('room', JSON.stringify(this.room));
	}
	restartGame(){
		if (this.player1.turn) {
			this.currentPlayer = this.player1;
		}else{
			this.currentPlayer = this.player2;
		}
		$("#turn").text((this.currentPlayer === this.player1)? "It is your turn" : "Waiting for opponent.");
		this.moves = 0;
		this.addHandlersToBoard();
		this.refreshBoard();
		this.room = {
			id : this.roomId,
			players : {me :{id: this.player1.id, username: this.player1.name,symbol: this.player1.symbol, wins: this.player1.wins, turn: this.player1.turn},
			opponent : {id: this.player2.id, username: this.player2.name, symbol: this.player2.symbol, wins: this.player2.wins, turn: this.player2.turn}},
			board : this.board
		}
	}
	disableBoard(){
		$("#board tr").each(function(){
			$(this).find("td").each(function(){
				$(this).off();
			});
		});
	}
}
class Player{
	constructor(name, symbol, wins, id, turn) {
		this.name = name;
		this.symbol = symbol;
		this.wins = wins;
		this.id = id;
		this.turn = turn;
	}
	increseWins(){
		this.wins = this.wins + 1;
	}
}






