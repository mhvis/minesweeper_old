var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

server.listen(server_port, server_ip_address, function () {
    console.log("Listening on " + server_ip_address + ", server port " +
    server_port);
});

app.use(express.static('public'));

var MinesweeperBoard = require('./minesweeperboard');

var boardIo = io.of('/board');
var boardUpdateCb = function(x, y, value) {
    boardIo.emit('update', {x: x, y: y, value: value});
}
var board = new MinesweeperBoard(8, 10, 10, boardUpdateCb);

// BELOW IS NOT USED ANYMORE
/**
 * Socket requests.
 */
//io.of('/board').on('connection', function (socket) {
function nOTUSED(socket) {

  /**
   * get: id
   * Request for one or more boards using the id parameter which can be one of:
   * - a board id: to get a specific board.
   * - '*': to get all ongoing boards.
   * - something else: to get no boards (unsubscribe from past boards).
   * 
   * The server response will be with the name 'boards' and the data is an
   * object which has the board ids as keys and the board data as value.
   * 
   * For all requested boards you will later receive updates via the
   * 'update' event (data: {id, change}). All past subscriptions to former
   * boards that were set before this call are removed.
   */
  socket.on('get', function (id) {
    var boardArray = {};
    
    // Leave from all current rooms, TODO!
    /*
    var rooms = io.sockets.manager.roomClients[socket.id];
    for (var room in rooms) {
      socket.leave(room);
    }
    */

    if (id === '*') {
      for (var id in boards) {
        if (boards.hasOwnProperty(id)) {
          boardArray[id] = boards[id].get();
          socket.join(id); // Subscribe for future updates.
        }
      }
    } else if (boards.hasOwnProperty(id)) {
      boardArray[id] = boards[id].get();
      socket.join(id);
    }
    socket.emit('boards', boardArray);
  });

  /**
   * update: {id, change}
   * Updates a board.
   */
  socket.on('update', function (update) {
    if (boards.hasOwnProperty(update.id)) {
      boards[update.id].update(update.change);
    }
  });

  /**
   * add: {width, height, [mineCount]}
   * Creates a new board with given width and height. The server response with
   * an event with the name 'added' and the board id as the value.
   */
  socket.on('add', function (data) {
    if (!data.width || !data.height) {
      socket.emit('added', -1);
      return;
    }
    var mineCount = (data.mineCount) ? data.mineCount : data.width * data.height
      * 0.1;
    var boardId = boardNextId++;
    var board = new BoardController(data.width, data.height, mineCount,
      function (change) {
        boardIo.to(boardId).emit('update', {id: boardId, change: change});
      }
    );
    boards[boardId] = board;
    socket.emit('added', boardId);
  });
  
  // Temporary
  socket.on('clear', function() {
    boards = {};
    boardNextId = 0;
  });
});
