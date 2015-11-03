var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var server_port = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 80;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || process.env.IP ||
  '127.0.0.1';

server.listen(server_port, server_ip_address, function () {
  console.log("Listening on " + server_ip_address + ", server_port " +
    server_port);
});

app.use(express.static('public'));

var BoardController = require('boardcontroller.js');
var boards = {};
var boardNextId = 0;
var boardIo = io.of('/board');

boardIo.on('connection', function (socket) {

  socket.on('get', function (id) {
    if (boards.hasOwnProperty(id)) {
      socket.emit('board', {
        id: id,
        board: boards[id].get()
      });
      socket.join(id);
    }
  });

  socket.on('getAll', function () {
    for (var id in boards) {
      if (boards.hasOwnProperty(id)) {
        socket.emit('board', {
          id: id,
          board: boards[id].get()
        });
        socket.join(id);
      }
    }
  });

  socket.on('unsubscribe', function (id) {
    socket.leave(id);
  });

  socket.on('update', function (update) {
    if (boards.hasOwnProperty(update.id)) {
      boards[update.id].update(update.change);
    }
  });

  socket.on('add', function (data) {
    var mineCount = data.width * data.height * 0.10;
    var boardId = boardNextId++;
    var board = new BoardController(data.width, data.height, mineCount,
      function (change) {
        boardIo.to(boardId).emit('update', {
          id: boardId,
          change: change
        });
      }
    );
    boards[boardId] = board;
    socket.emit('added', boardId);
  });
});