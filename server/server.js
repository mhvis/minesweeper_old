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

function boardUpdateCb(x, y, value) {
    boardIo.emit('update', {x: x, y: y, value: value});
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

var board = new MinesweeperBoard(8, 10, 10, boardUpdateCb, boardEndCb);

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
                boardUpdateCb, boardEndCb);
            boardIo.emit('game', getGame());
        } catch (e) {
            console.log(e.toString());
        }
    });
});
