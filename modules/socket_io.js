var _ = require('lodash');
var User = require('../models/user');

manageLogOut= function(data){
  var user = getOnlineUserBySocket(data);
  if (user.connectionCount <= 0) {
    window.location.replace("users/logout");
  }else{
    var sockets = getSockets(data);
    if (!_.isEmpty(sockets) || sockets != null){
      _.forEach(sockets, function(userSocket) {
        if (socket.id !== userSocket) {
          if(io.sockets.connected[userSocket] != undefined){
            io.sockets.connected[userSocket].emit("logout");
          }
        }
      });
      deleteSocket(userid, socket.id);
    }
  }
}

exports = module.exports = function(io){
  io.on('connection', function (socket) {
    var userid = socket.handshake.session.passport.user;
    User.getUserById(userid, function(err, user){
      if (err) throw err;
      var onlineuser = getOnlineUserByUserId(user._id);
      if (_.isEmpty(onlineuser) || onlineuser == null) {
        var newUser = {
          userId: user._id,
          type: user.type,
          username: user.username,
          wins: user.wins,
          status: false,
          sockets: [socket.id],
          gameSockets: [],
          waitingSocket: [],
          connectionCount: 0
        };
        socket.emit('user_info', user);
        addOnlineUser(newUser);
        updateConnectionCount(userid, 1);
      }else{
        updateConnectionCount(userid, 1);
        console.log("the user is already online");
        var userSockets = onlineuser.sockets;
        userSockets.push(socket.id);
        console.log(userSockets);
        updateSockets(userid, userSockets);
        socket.emit('user_info', user);
        console.log("HEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEREEEEEEEEEEEEEEEEEEEEEEEEEEEE "+onlineuser.status)
        if (onlineuser.status) {
          if (!(onlineuser.gameSockets.indexOf(socket.id) > -1)) {
            io.sockets.connected[socket.id].emit("playing_mode");
          }
        }
      }
      io.sockets.emit('onlineUsers', onlineUsers);
    });
    socket.on('invite_player', function(info){
      var onlineUser = getOnlineUserByUserId(info.playerid);
      var userSockets = onlineUser.sockets;
      _.forEach(userSockets, function(socket) {
        io.sockets.connected[socket].emit("invite_player", {info: info.invitor, invitorSocket: info.invitorSocket}); 
      });
    });
    socket.on('invatation_answer', function(data){

      var invitedSocket = data.socket;
      var invitorSocket = data.invitorSocket;

      var invited = getOnlineUserBySocket(invitedSocket);
      var invitor = getOnlineUserBySocket(invitorSocket);

      var invitedSockets = getSocketsByID(invited.userId);
      var invitorSockets = getSocketsByID(invitor.userId);

      if (data.answer === "yes") {

        _.forEach(_.concat(invitedSockets, invitorSockets), function(socket) {
          if ((socket != invitedSocket) && (socket != invitorSocket)) {
            io.sockets.connected[socket].emit("playing_mode");
            io.sockets.connected[socket].emit("close_modals");
          } 
        });

        var newRoom = uniqueID();
        var room = {
          id : newRoom,
          players : {me :       {id : invited.userId, username : invited.username, symbol : "X",wins:0, turn: true},
          opponent : {id : invitor.userId, username : invitor.username, symbol : "O" , wins:0,turn: false}},
          board : [[0,0,0],
          [0,0,0],
          [0,0,0]]
        }


        if(io.sockets.connected[invitedSocket] != undefined){
          updateWaitingSockets(invited.userId, [invitedSocket]);
          deleteSocket(userid, invitedSocket);
          io.sockets.connected[invitedSocket].emit("redirect", room);
        }
        

        room.players = {me :       {id : invitor.userId, username : invitor.username, symbol : "O",wins:0, turn: false},
        opponent : {id : invited.userId , username : invited.username, symbol : "X", wins:0,turn: true}};
        

        if(io.sockets.connected[invitorSocket] != undefined){
          updateWaitingSockets(invitor.userId, [invitorSocket]);
          deleteSocket(userid, invitorSocket);
          io.sockets.connected[invitorSocket].emit("redirect", room);
        }

        rooms.push(room);

        updateOnlineUserStatusByID(invitor.userId, true);
        updateOnlineUserStatusByID(invited.userId, true);

        io.sockets.emit('onlineUsers', onlineUsers);
      }else{
        if(io.sockets.connected[invitorSocket] != undefined){
          io.sockets.connected[invitorSocket].emit("declinedGame", getOnlineUserByUserId(data.player).username + " declined game.");
        }
      }
      _.forEach(invitedSockets, function(socket) {
        if (socket != invitedSocket) {
          io.sockets.connected[socket].emit("close_modals");
        } 
      });
    });
    socket.on('logout', function(data){
      var user = getOnlineUserBySocket(data);
      if (user != null) {
        if (user.connectionCount <= 0) {
          console.log("LOGOUT: I have <= 0 --- " + user.connectionCount);
        }else{
          console.log("LOGOUT: I have > 0 --- " + user.connectionCount);
          var sockets = getSockets(data);
          if (!_.isEmpty(sockets) || sockets != null){
            _.forEach(sockets, function(userSocket) {
              if (socket.id !== userSocket) {
                if(io.sockets.connected[userSocket] != undefined){
                  io.sockets.connected[userSocket].emit("logout", false);
                }
              }
            });
            deleteSocket(userid, socket.id);
          }
        }
      }
    })
    socket.on('disconnect', function(){
      console.log("disconnected");
      updateConnectionCount(userid, -1);
      deleteSocket(userid, socket.id);
      io.sockets.emit('onlineUsers', onlineUsers);
    });

    console.log("connected");
  });
}