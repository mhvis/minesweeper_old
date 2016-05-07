/**
 * Hybrid store/actor/back-end communicator.
 *
 * Game model:
 * game: {
 *   grid: [
 *     [' ', ' ', '0', '1', 'm', ...], // A row
 *     [' ', ...], // Next row
 *     ...
 *   ]
 *   mineCount: 10,
 *   start: 123456789, // Game start moment
 *   end: 123456790, // Game end moment, false when game is still ongoing
 *   mines: [{x: 2, y: 4}, ...] // Mines array, false or empty when not ended
 * }
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

socket.on('updates', function(updates) {
    updates.forEach(function(update) {
        game.grid[update.y][update.x] = update.value;
    });
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
