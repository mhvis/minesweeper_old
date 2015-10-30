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

//var board = require('board');

var board;

io.on('connection', function (socket) {
  socket.emit('board', board);

  socket.on('board', function (data) {
    board = data;
    socket.broadcast.emit('board', board);
  });

  socket.on('cursor', function (data) {
    socket.broadcast.emit('cursor', data);
  });
});