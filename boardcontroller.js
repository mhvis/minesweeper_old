'use strict';

/**
 * Location constructor.
 */
function Location(board, x, y) {
    this.board = board;
    this.x = x;
    this.y = y;
}

/**
 * Get an array with all neighbours of this location.
 */
Location.prototype.neighbours = function () {
    var xDir = [0, 1, 1, 1, 0, -1, -1, -1];
    var yDir = [-1, -1, 0, 1, 1, 1, 0, -1];
    var neighbours = [];
    var b = this.board;
    for (var i = 0; i < xDir.length; i++) {
        var x = this.x + xDir[i];
        var y = this.y + yDir[i];
        if (y >= 0 && y < b.length && x >= 0 && x < b[y].length) {
            neighbours.push(new Location(b, x, y));
        }
    }
    return neighbours;
};

/**
 * Returns the value at this location.
 */
Location.prototype.get = function () {
    return this.board[this.y][this.x];
};

/**
 * Updates the value at this location, optionally firing an update callback.
 */
Location.prototype.set = function (value, fn) {
    this.board[this.y][this.x] = value;
    if (typeof fn !== "undefined") {
        fn({
            x: this.x,
            y: this.y,
            value: value
        });
    }
};

/**
 * Generates a not exposed board (thus with only unexposed tiles).
 */
function generateBoard(width, height) {
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
 */
function generateExposedBoard(width, height, mineCount) {
    var board = [];
    for (var y = 0; y < height; y++) {
        board.push([]);
        for (var x = 0; x < width; x++) {
            board[y][x] = 0;
        }
    }
    var locations = [];
    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            locations.push(new Location(board, x, y));
        }
    }
    for (var i = locations.length - 1; i >= locations.length - mineCount; i--) {
        var rnd = Math.floor(Math.random() * (i + 1));
        var loc = locations[rnd];
        locations[rnd] = locations[i];
        locations[i] = loc;
        loc.set('M');
        loc.neighbours().forEach(function (neighbour) {
            var value = neighbour.get();
            if (value != 'M') {
                neighbour.set(value + 1);
            }
        });
    }
    return board;
}

/**
 * Exposes the tiles at given location+board, using the given exposed board.
 */
/*function expose(location, exposedLocation, fn) {
    location.set(exposedLocation.get(), fn);
    if (location.get() === 0) {
        location.neighbours().forEach(function (neighbour) {
            if (neighbour.get() === ' ') {
                var neighbourExposed = new Location(exposedLocation.board,
                    neighbour.x, neighbour.y);
                expose(neighbour, neighbourExposed, fn);
            }
        });
    }
}/**/

/**
 * Exposes the tiles at given location+board, using the given exposed board.
 */
/**/function expose(location, exposedLocation, fn) {
    var exposedBoard = exposedLocation.board;
    var queue = [location];
    while (queue.length > 0) {
        var loc = queue.shift();
        if (loc.get() !== ' ') {
            continue;
        }
        var exposedLoc = new Location(exposedBoard, loc.x, loc.y);
        loc.set(exposedLoc.get(), fn);
        if (loc.get() === 0) {
            queue.push.apply(queue, loc.neighbours());
        }
    }
}/**/

/**
 * BoardController constructor.
 */
function BoardController(width, height, mineCount, fn) {
    this._board = generateBoard(width, height);
    this._exposedBoard = generateExposedBoard(width, height, mineCount);
    this._time = Date.now();
    this._fn = fn;
}

/**
 * The change object is expected to have following format:
 * {x, y, what: ('expose'|'mark')}.
 */
BoardController.prototype.update = function (change) {
    var loc = new Location(this._board, change.x, change.y);
    switch (change.what) {
    case 'expose':
        if (loc.get() == ' ') {
            var exposedLoc = new Location(this._exposedBoard, change.x,
                change.y);
            expose(loc, exposedLoc, this._fn);
        }
        break;
    case 'mark':
        if (loc.get() == ' ') {
            loc.set('m', this._fn);
        }
        else if (loc.get() == 'm') {
            loc.set(' ', this._fn);
        }
        break;
    }
};

BoardController.prototype.get = function () {
    return this._board;
};

BoardController.prototype.toString = function () {
    return this._board.toString();
};

module.exports = BoardController;