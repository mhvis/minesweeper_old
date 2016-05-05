/* globals module */
/**
 * Minesweeper board model and controller.
 * @module minesweeperboard
 */

/**
 * The eight possible directions.
 * 
 * @private
 */
var directions = [{x: 0, y: 1}, {x: 1, y: 1}, {x: 1, y: 0}, {x: 1, y: -1},
{x: 0, y: -1}, {x: -1, y: -1}, {x: -1, y: 0}, {x: -1, y: 1}];

/**
 * Generates a non-exposed board (thus with only unexposed tiles).
 * 
 * @private
 */
function generateBoard(width, height) {
    'use strict';
    var board = [];
    for (var y = 0; y < height; y++) {
        board.push([]);
        for (var x = 0; x < width; x++) {
            board[y][x] = ' ';
        }
    }
    return board;
}

/**
 * Generates an exposed board with random mines.
 * 
 * @private
 */
function generateExposedBoard(width, height, mineCount) {
    'use strict';
    var board = [], i, x, y;
    for (y = 0; y < height; y++) {
        board.push([]);
        for (x = 0; x < width; x++) {
            board[y][x] = 0;
        }
    }
    var locations = [];
    for (y = 0; y < height; y++) {
        for (x = 0; x < width; x++) {
            locations.push({x: x, y: y});
        }
    }
    for (i = 0; i < mineCount; i++) {
        var index = Math.floor(Math.random() * locations.length);
        var loc = locations[index];
        locations.splice(index, 1);
        board[loc.y][loc.x] = 'M';
        for (var dir in directions) {
            if (board[loc.y + dir.y][loc.x + dir.x] != 'M') {
                board[loc.y + dir.y][loc.x + dir.x] += 1;
            }
        }
    }
    return board;
}

/**
 * Represents a random minesweeper board. See all variables attached to 'this'
 * for the public API. Only interact via functions, all other variables are
 * read-only.
 * 
 * @constructor
 * @param {number} width - The width of the board.
 * @param {number} height - The height of the board.
 * @param {number} mineCount - The number of mines to randomly hide.
 * @param {updateCallback} cb - A callback that is called when the board is
 * changed.
 */
module.exports = function(width, height, mineCount, cb) {
    'use strict';
    
    /**
     * The current state of the board as a two-dimensional array (with unexposed
     * tiles).
     * 
     * @type {array}
     */
    this.state = generateBoard(width, height);
    
    /**
     * The start timestamp.
     * 
     * @type {number}
     */
    this.start = Math.round(Date.now() / 1000);
    
    /**
     * The end timestamp, false when game has not ended.
     */
    this.end = false;
    
    /**
     * An array of {x, y}-shaped objects representing mine locations, when the
     * game has ended. False when the game has not ended.
     */
    this.mines = false;
    
    // The fully exposed (hidden/private) board.
    var exposedBoard = generateExposedBoard(width, height, mineCount);
    
    /**
     * Mark or unmark an unexposed tile.
     * 
     * @param {number} x - The x-coordinate.
     * @param {number} y - The y-coordinate.
     */
    this.mark = function(x, y) {
        if (this.state[y][x] != ' ' && this.state[y][x] != 'm') {
            throw new Error("Tile is exposed.");
        }
        if (this.end) {
            throw new Error("Game has ended.");
        }
        if (this.state[y][x] == ' ') {
            this.state[y][x] = 'm';
        } else {
            this.state[y][x] = ' ';
        }
        cb(x, y, this.state[y][x]); // Callback.
    };
    
    /**
     * Exposes the given tiles and adjacent tiles.
     * 
     * @param {number} x - The x-coordinate.
     * @param {number} y - The y-coordinate.
     */
    this.expose = function(x, y) {
        if (this.state[y][x] != ' ') {
            throw new Error("Tile is already exposed.");
        }
        if (this.end) {
            throw new Error("Game has ended.");
        }
        this.state[y][x] = exposedBoard[y][x];
        cb(x, y, this.state[y][x]); // Callback.
        if (this.state[y][x] == '0') {
            for (var dir in directions) {
                if (this.state[y + dir.y][x + dir.x] == ' ') {
                    // Expose recursively.
                    this.expose(x + dir.x, y + dir.y);
                }
            }
        } else if (this.state[y][x] == 'M') {
            // End game when a mine was exposed.
            this.end = Math.round(Date.now() / 1000);
            this.mines = [];
            // Fill mines array.
            for (y = 0; y < exposedBoard.length; y++) {
                for (x = 0; x < exposedBoard[y].length; x++) {
                    if (exposedBoard[y][x] == 'M') {
                        this.mines.push({x: x, y: y});
                    }
                }
            }
        }
    };
};

/**
 * This callback is called when the board state changes.
 * 
 * @callback updateCallback
 * @param {number} x - The x-coordinate.
 * @param {number} y - The y-coordinate.
 * @param {string} value - The new value.
 */
