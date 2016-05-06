/* globals module */
/**
 * Minesweeper board model and controller.
 * @module minesweeperboard
 */

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
 * Generates an array of length mineCount with {x, y}-shaped random mine
 * locations.
 * 
 * @private
 */
function generateRandomMineLocations(width, height, mineCount) {
    'use strict';
    var locations = [];
    var result = [];
    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            locations.push({x: x, y: y});
        }
    }
    for (var i = 0; i < mineCount; i++) {
        var index = Math.floor(Math.random() * locations.length);
        result.push(locations[index]);
        locations.splice(index, 1);
    }
    return result;
}
/**
 * Generates an exposed board from random mines.
 * 
 * @private
 */
function generateExposedBoard(width, height, mines) {
    'use strict';
    var board = [];
    for (var y = 0; y < height; y++) {
        board.push([]);
        for (var x = 0; x < width; x++) {
            board[y][x] = 0;
        }
    }
    mines.forEach(function(mine) {
        board[mine.y][mine.x] = 'M';
        forEachNeighbor(mine.x, mine.y, width, height, function(x, y) {
            if (board[y][x] != 'M') {
                board[y][x] += 1;
            }
        });
    });
    board.forEach(function(row) {
        for (var i = 0; i < row.length; i++) {
            row[i] = row[i].toString();
        }
    });
    return board;
}

/**
 * Runs the given callback for all neighbors.
 * 
 * @private
 * @param {number} xCoord - The x-coordinate.
 * @param {number} yCoord - The y-coordinate.
 * @param {number} width - The width of the grid.
 * @param {number} height - The height of the grid.
 * @param {locationCallback} cb - The callback.
 */
function forEachNeighbor(xCoord, yCoord, width, height, cb) {
    var directions = [{x: 0, y: 1}, {x: 1, y: 1}, {x: 1, y: 0}, {x: 1, y: -1},
    {x: 0, y: -1}, {x: -1, y: -1}, {x: -1, y: 0}, {x: -1, y: 1}];
    directions.forEach(function(dir) {
        var x = xCoord + dir.x;
        var y = yCoord + dir.y;
        if (x >= 0 && x < width && y >= 0 && y < height) {
            cb(x, y);
        }
    });
}
/**
 * A callback that provides a location.
 * 
 * @callback locationCallback
 * @param {number} x - The x-coordinate.
 * @param {number} y - The y-coordinate.
 */

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
    this.grid = generateBoard(width, height);
    
    /**
     * The total number of hidden mines.
     * 
     * @type {number}
     */
    this.mineCount = mineCount;
    
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
    
    // The mine locations.
    var mines = generateRandomMineLocations(width, height, mineCount);
    // The fully exposed (hidden/private) board.
    var exposedGrid = generateExposedBoard(width, height, mines);
    // The number of remaining tiles that need to be exposed is kept track of,
    // to easily check when the game is ended.
    var exposedRemaining = width * height - mineCount;
    
    /**
     * Mark or unmark an unexposed tile.
     * 
     * @param {number} x - The x-coordinate.
     * @param {number} y - The y-coordinate.
     */
    this.mark = function(x, y) {
        if (this.grid[y][x] != ' ' && this.grid[y][x] != 'm') {
            throw new Error("Tile is exposed.");
        }
        if (this.end) {
            throw new Error("Game has ended.");
        }
        if (this.grid[y][x] == ' ') {
            this.grid[y][x] = 'm';
        } else {
            this.grid[y][x] = ' ';
        }
        cb(x, y, this.grid[y][x]); // Callback.
    };
    
    /**
     * Exposes the given tiles and adjacent tiles.
     * 
     * @param {number} x - The x-coordinate.
     * @param {number} y - The y-coordinate.
     */
    this.expose = function(x, y) {
        if (this.grid[y][x] != ' ') {
            throw new Error("Tile is already exposed.");
        }
        if (this.end) {
            throw new Error("Game has ended.");
        }
        this.grid[y][x] = exposedGrid[y][x];
        exposedRemaining--;
        cb(x, y, this.grid[y][x]); // Callback.
        if (this.grid[y][x] == '0') {
            var that = this;
            forEachNeighbor(x, y, width, height, function(x2, y2) {
                if (that.grid[y2][x2] == ' ') {
                    // Expose recursively.
                    that.expose(x2, y2);
                }
            });
        }
        if (this.grid[y][x] == 'M' || exposedRemaining === 0) {
            // End game when a mine exploded or all tiles are exposed.
            this.end = Math.round(Date.now() / 1000);
            this.mines = mines;
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
