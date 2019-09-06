var _ = require('lodash')
var User = require('../models/user')
exports = module.exports = function(io, gnsp) {
	gnsp.on('connection', function(socket) {
		console.log('connected to room')
		var userid = socket.handshake.session.passport.user

		User.getUserById(userid, function(err, user) {
			if (err) throw err
			var userSockets = user.gameSockets
			if (userSockets != undefined) {
				userSockets.push(socket.id)
			} else {
				userSockets = [socket.id]
			}
			updateGameSockets(userid, userSockets)
			updateOnlineUserStatusByID(userid, true)
			updateConnectionCount(userid, 1)
			io.sockets.emit('onlineUsers', onlineUsers)
		})

		printOnlineUsers()

		socket.on('setRoomSocket', function(data) {
			socket.join(data.roomId)
		})

		socket.on('endGame', function(data) {
			var playerSockets = getGameSocketsByID(data.towhom)
			_.forEach(playerSockets, function(userSocket) {
				gnsp
					.to(userSocket)
					.emit('endGame', {
						winner: data.winner,
						num: data.num,
						row: data.row,
						col: data.col
					})
			})
		})

		socket.on('chat', function(data) {
			var playerSockets = getGameSocketsByID(data.towhom)
			console.log('got the message')
			_.forEach(playerSockets, function(userSocket) {
				gnsp.to(userSocket).emit('chat', data.message)
			})
		})

		socket.on('restartGame', function(data) {
			var playerSockets = getGameSocketsByID(data.towhom)
			_.forEach(playerSockets, function(userSocket) {
				gnsp.to(userSocket).emit('restartGame', data.message)
			})
		})

		socket.on('move', function(data) {
			printOnlineUsers()
			var playerSockets = getGameSocketsByID(data.towhom)
			_.forEach(playerSockets, function(userSocket) {
				gnsp
					.to(userSocket)
					.emit('move', { num: data.num, row: data.row, col: data.col })
			})
		})

		socket.on('updatewins', function(data) {
			updateOnlineUserWinsByID(data.id, data.wins)
		})

		socket.on('disconnect', function() {
			console.log('disconnected from game')
			updateConnectionCount(userid, -1)
			var opponentID = getOpponentsIdByMyID(userid)
			updateOnlineUserStatusByID(userid, false)
			if (opponentID !== null) {
				var sockets = getGameSocketsByID(opponentID)
				_.forEach(sockets, function(userSocket) {
					gnsp
						.to(userSocket)
						.emit('disconnected', {
							message:
								getOnlineUserByUserId(userid).username +
								' has disconnected. We will redirect you to homepage.'
						})
				})
			}
			deleteGameSocket(userid, socket.id)
		})
	})
}
