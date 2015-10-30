var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(process.env.PORT);

app.use(express.static('public'));

//var board = require('board');

var board;

io.on('connection', function (socket) {
  socket.emit('board', board);
  
  socket.on('board', function(data) {
    board = data;
    socket.broadcast.emit('board', board);
  });
  
  socket.on('cursor', function(data) {
    socket.broadcast.emit('cursor', data);
  });
});