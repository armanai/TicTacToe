  var _ = require('lodash');
  updateWaitingSockets = function(userid, userSocket){
    var index = 0;
    _.forEach(onlineUsers, function(user) {
      if (String(user.userId) === String(userid)) {
        onlineUsers[index].waitingSocket = userSocket;
      }
      index++;
    });
  }
  getOnlineUserByUserId = function(id){
    var onlineUser = null;
    _.forEach(onlineUsers, function(user) {
      if (String(user.userId) === String(id)) {
        onlineUser = user;
      }
    });
    return onlineUser;
  } 
  getRoomByUserID = function(userid){
    var room = null;
    _.forEach(rooms, function(r) {
      if (String(r.players.me.id) === String(userid)) {
        room = r;
      }else if(String(r.players.opponent.id) === String(userid)){
        room = r;
      }
    });
    return room;
  }
  getOpponentsIdByMyID = function(userid){
    var id = null;
    _.forEach(rooms, function(room) {
      if (String(room.players.me.id) === String(userid)) {
        id = room.players.opponent.id;
      }else if(String(room.players.opponent.id) === String(userid)){
        id = room.players.me.id;
      }
    });
    return id;
  }
  getRoomById = function(id){
    var room = null;
    _.forEach(rooms, function(uroom) {
      if (String(uroom.id) === String(id)) {
        room = uroom;
      }
    });
    return room;
  }
  getOnlineUserBySocket = function(usersocket){
    var onlineUser = null;
    _.forEach(onlineUsers, function(user) {
     _.forEach(user.sockets, function(socket){
      if (String(socket) === String(usersocket)) {
        onlineUser = user;
      }
    });
   });
    return onlineUser;
  }
  getSocketsByID = function(userid){
    var sockets = null;
    _.forEach(onlineUsers, function(user) {
      if (String(user.userId) === String(userid)) {
        sockets = user.sockets;
      }
    });
    return sockets;
  }
  getGameSocketsByID = function(userid){
    var sockets = null;
    _.forEach(onlineUsers, function(user) {
      if (String(user.userId) === String(userid)) {
        sockets = user.gameSockets;
      }
    });
    return sockets;
  }
  getWinsByID = function(userid){
    var wins = null;
    _.forEach(onlineUsers, function(user) {
      if (String(user.userId) === String(userid)) {
        wins = user.wins;
      }
    });
    return wins;
  }
  getSockets = function(usersocket){
    var sockets = null;
    _.forEach(onlineUsers, function(user) {
      _.forEach(user.sockets, function(socket){
        if (String(socket) === String(usersocket)) {
          sockets = user.sockets;
        }
      });
    });
    return sockets;
  }
  getNumOfSockets = function(userid){
    var sockets = 0;
    _.forEach(onlineUsers, function(user) {
      if (String(user.userId) === String(userid)) {
        sockets = user.sockets.length;
      }
    });
    return sockets;
  }
  removeOnlineUser = function(id){
    var index = 0;
    _.forEach(onlineUsers, function(user) {
      if (String(user.userId) === String(id)) {
        onlineUsers.splice(index, 1);
      }
      index++;
    });
  }
  addOnlineUser = function(user){
    onlineUsers.push(user);
  }
  updateSockets = function(userid, userSockets){
    var index = 0;
    _.forEach(onlineUsers, function(user) {
      if (String(user.userId) === String(userid)) {
        onlineUsers[index].sockets = userSockets;
      }
      index++;
    });
  }
  updateGameSockets = function(userid, userSockets){
    var index = 0;
    _.forEach(onlineUsers, function(user) {
      if (String(user.userId) === String(userid)) {
        onlineUsers[index].gameSockets = userSockets;
      }
      index++;
    });
  }
  deleteSocket = function(userid, usersocket){
    var index = 0;
    _.forEach(onlineUsers, function(user) {
      if (String(user.userId) === String(userid)) {
        var sockets = onlineUsers[index].sockets;
        sockets.splice(sockets.indexOf(usersocket), 1);
        onlineUsers[index].sockets = sockets;
      }
      index++;
    });
  }
  deleteGameSocket = function(userid, usersocket){
    var index = 0;
    _.forEach(onlineUsers, function(user) {
      if (String(user.userId) === String(userid)) {
        var sockets = onlineUsers[index].gameSockets;
        sockets.splice(sockets.indexOf(usersocket), 1);
        onlineUsers[index].gameSockets = sockets;
      }
      index++;
    });
  }
  printOnlineUsers = function(){
    console.log("Printing online users");
    console.log("[")
    _.forEach(onlineUsers, function(user) {
      console.log(user);
    });
    console.log("]")
  }
  updateOnlineUserStatusByID = function(id, s){
    var index = 0;
    _.forEach(onlineUsers, function(user) {
      if (String(user.userId) === String(id)) {
        onlineUsers[index].status = s;
      }
      index++;
    });
  }
  updateOnlineUserWinsByID = function(id, w){
    var index = 0;
    _.forEach(onlineUsers, function(user) {
      if (String(user.userId) === String(id)) {
        if (w > onlineUsers[index].wins) {
          onlineUsers[index].wins = w;
        }
      }
      index++;
    });
  }
  printRooms = function(){
    console.log("Printing room");
    console.log("[")
    _.forEach(rooms, function(user) {
      console.log(user);
    });
    console.log("]")
  }
  updateWinsByRoom = function(id){
    var index = 0;
    _.forEach(rooms, function(uroom) {
      if (String(uroom.id) === String(id)) {
        var p1Wins = uroom.players.me.wins;
        var p2Wins = uroom.players.opponent.wins;
        if (p1Wins > p2Wins) {
          updateOnlineUserWinsByID(uroom.players.me.id, p1Wins);
        }else if (p2Wins > p1Wins) {
          updateOnlineUserWinsByID(uroom.players.opponent.id, p2Wins);
        }else{
          if (getWinsByID(uroom.players.me.id) < p1Wins) {
            updateOnlineUserWinsByID(uroom.players.me.id, p1Wins);
          }else if(getWinsByID(uroom.players.opponent.id) < p2Wins){
            updateOnlineUserWinsByID(uroom.players.opponent.id, p2Wins);
          }
        }
      }
      index++;
    });
  }
  updateConnectionCount = function(id, num){
    var index = 0;
    _.forEach(onlineUsers, function(user) {
      if (String(user.userId) === String(id)) {
        var currCount = user.connectionCount + num;
        onlineUsers[index].connectionCount = currCount;
      }
      index++;
    });
  }
  uniqueID = function(){
    return 'room-' + Math.random().toString(36).substr(2, 16);
  }


module.exports = {
    updateWinsByRoom: updateWinsByRoom,
    uniqueID: uniqueID,
    printRooms: printRooms,
    updateOnlineUserWinsByID: updateOnlineUserWinsByID,
    updateOnlineUserStatusByID: updateOnlineUserStatusByID,
    printOnlineUsers: printOnlineUsers,
    deleteGameSocket: deleteGameSocket,
    deleteSocket: deleteSocket,
    updateGameSockets: updateGameSockets,
    updateSockets: updateGameSockets,
    addOnlineUser: addOnlineUser,
    removeOnlineUser: removeOnlineUser,
    getNumOfSockets: getNumOfSockets,
    getSockets: getSockets,
    getWinsByID: getWinsByID,
    getGameSocketsByID: getGameSocketsByID,
    getSocketsByID: getSocketsByID,
    getOnlineUserBySocket: getOnlineUserBySocket,
    getRoomById: getRoomById,
    getOpponentsIdByMyID: getOpponentsIdByMyID,
    getRoomByUserID: getRoomByUserID,
    getOnlineUserByUserId: getOnlineUserByUserId,
    updateWaitingSockets: updateWaitingSockets,
    updateConnectionCount: updateConnectionCount
};