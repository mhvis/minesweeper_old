
var BoardView = function(container, board, update) {
    this._board = board;
    this._controls = document.createElement('canvas');
    this._controls.className = 'boardControls';
    container.appendChild(this._controls);
    this._canvas = document.createElement('canvas');
    this._canvas.className = 'boardCanvas';
    container.appendChild(this._canvas);
    this._cursor = document.createElement('canvas');
    this._cursor.className = 'boardCursor';
    container.appendChild(this._cursor);
};

BoardView.prototype.update = function(change) {
    
};