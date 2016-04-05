var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var cookieSession = require('cookie-session');

var server_port = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 80;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || process.env.IP ||
  '127.0.0.1';

server.listen(server_port, server_ip_address, function () {
  console.log("Listening on " + server_ip_address + ", server_port " +
    server_port);
});

app.use(cookieSession({
  name: 'session',
  keys: ['ankieisawesome', 'dicewaretodo']
}));

app.use(express.static('public'));

app.get('/views', function (req, res, next) {
  // Update views
  req.session.views = (req.session.views || 0) + 1;

  // Write response
  res.send(req.session.views + ' views');
});


var BoardController = require('./boardcontroller.js');
var boards = {};
var boardNextId = 0;
var boardIo = io.of('/board');

/**
 * Socket requests.
 */
boardIo.on('connection', function (socket) {

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
    
    socket.rooms.forEach(function (room) { // Leave from all current rooms.
      socket.leave(room);
    });
    
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
   * add: {width, height}
   * Creates a new board with given width and height. The server response with
   * an event with the name 'added' and the board id as the value.
   */
  socket.on('add', function (data) {
    if (!data.width || !data.height) {
      socket.emit('added', -1);
      return;
    }
    var mineCount = data.width * data.height * 0.01;
    var boardId = boardNextId++;
    var board = new BoardController(data.width, data.height, mineCount,
      function (change) {
        boardIo.to(boardId).emit('update', {id: boardId, change: change});
      }
    );
    boards[boardId] = board;
    socket.emit('added', boardId);
  });
});