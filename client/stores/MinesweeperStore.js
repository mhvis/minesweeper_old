/**
 * Hybrid store/actor/back-end communicator.
 */

import io from 'socket.io-client';

var socket = io('/board');

var game = {
    grid: [[' ', ' '], [' ', ' ']],
    mineCount: 1,
    start: 1,
    end: false,
    mines: false
};
var listener = false;

socket.on('game', function(newGame) {
    game = newGame;
    notifyListeners();
});

socket.on('update', function(data) {
    game.grid[data.y][data.x] = data.value;
    notifyListeners();
});
socket.on('end', function(data) {
    game.end = data.end;
    game.mines = data.mines;
    notifyListeners();
});

function notifyListeners() {
    if (listener) {
        listener();
    }
}

var MinesweeperStore = {
    getGame: function() {
        return game;
    },
    
    setListener: function(cb) {
        listener = cb;
    },
    
    mark: function(x, y) {
        game.grid[y][x] = game.grid[y][x] == 'm' ? ' ' : 'm';
        notifyListeners();
        socket.emit('mark', {x: x, y: y});
    },

    expose: function(x, y) {
        game.grid[y][x] = ' ';
        notifyListeners();
        socket.emit('expose', {x: x, y: y});
    },

    newGame: function(width, height, mineCount) {
        socket.emit('new', {width: width, height: height, mineCount:
            mineCount});
    }
}

export default MinesweeperStore;
