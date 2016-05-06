var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(process.env.PORT || '8080', '0.0.0.0', function () {
  console.log('App listening at http://%s:%s', server.address().address,
    server.address().port);
  console.log('Press Ctrl+C to quit.');
});

app.use(express.static('public'));

var MinesweeperBoard = require('./minesweeperboard');

var boardIo = io.of('/board');

function boardUpdatesCb(updates) {
    boardIo.emit('updates', updates);
}
function boardEndCb(end, mines) {
    boardIo.emit('end', {end: end, mines: mines});
}
function getGame() {
    return {
        grid: board.grid,
        mineCount: board.mineCount,
        start: board.start,
        end: board.end,
        mines: board.mines
    };
}

var board = new MinesweeperBoard(8, 10, 10, boardUpdatesCb, boardEndCb);

boardIo.on('connection', function(socket) {
  socket.emit('game', getGame());
  socket.on('mark', function(loc) {
    try {
      board.mark(loc.x, loc.y);
    } catch (e) {
      console.log(e.toString());
    }
  });
  socket.on('expose', function(loc) {
    try {
      board.expose(loc.x, loc.y);
    } catch (e) {
      console.log(e.toString());
    }
  });
  socket.on('new', function(data) {
    try {
      board = new MinesweeperBoard(data.width, data.height, data.mineCount,
        boardUpdatesCb, boardEndCb);
      boardIo.emit('game', getGame());
    } catch (e) {
      console.log(e.toString());
    }
  });
});
