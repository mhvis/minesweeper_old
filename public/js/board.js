/**
 * The BOARD global consists of all board client code (including BoardView).
 * 
 * The public API in the BOARD object has the following functions:
 * - init: io
 * - add: width, height
 * - get: id, fn
 * - getAll: fn
 * 
 * See the definitions at the end of this document for extensive descriptions.
 */
var BOARD = function () {

    var BoardView = function () {
        /**
         * BoardView is all HTML GUI code. This is the constructor.
         */
        var BoardView = function (board, update) {
            var that = this;
            this.container = document.createElement('span');

            this._canvasW = 15 * board[0].length; // Resolution
            this._canvasH = 15 * board.length;
            this._boardW = board[0].length;
            this._boardH = board.length;
            this._canvas = document.createElement('canvas');
            this._canvas.width = this._canvasW;
            this._canvas.height = this._canvasH;
            this._ctx = this._canvas.getContext('2d');
            this.container.appendChild(this._canvas);
            for (var y = 0; y < board.length; y++) {
                for (var x = 0; x < board[y].length; x++) {
                    drawTile(this, x, y, board[y][x]);
                }
            }
            this.container.oncontextmenu = function (event) {
                event.preventDefault();
                event.stopPropagation();
                return false;
            };
            this._canvas.onmousedown = function (event) {
                var xOffset = event.offsetX;
                var yOffset = event.offsetY;
                var w = that._canvas.clientWidth;
                var h = that._canvas.clientHeight;
                var x = Math.floor(xOffset / w * that._boardW);
                var y = Math.floor(yOffset / h * that._boardH);
                var what = (event.which == 3) ? 'mark' : 'expose';
                update({
                    x: x,
                    y: y,
                    what: what
                });
                /*if (what == 'mark') {
                    drawTile(that, x, y, 'm');
                }
                else if (what == 'expose') {
                    drawTile(that, x, y, 0);
                }*/
            };

        };

        BoardView.prototype.update = function (change) {
            drawTile(this, change.x, change.y, change.value);
        };

        function drawTile(boardView, x, y, value) {
            var ctx = boardView._ctx;
            var tileX = (x / boardView._boardW) * boardView._canvasW;
            var tileY = (y / boardView._boardH) * boardView._canvasH;
            var tileW = boardView._canvasW / boardView._boardW;
            var tileH = boardView._canvasH / boardView._boardH;

            ctx.clearRect(tileX, tileY, tileW, tileH);

            // Draw outline
            if (value !== ' ' && value !== 'm') {
                ctx.fillStyle = '#BBB';
                ctx.strokeStyle = '#999';
            }
            else {
                ctx.fillStyle = '#888';
                ctx.strokeStyle = '#666';
            }
            ctx.fillRect(tileX, tileY, tileW, tileH);
            ctx.strokeRect(tileX, tileY, tileW, tileH);

            ctx.font = tileH + 'px monospace';

            switch (value) {
            case 'M':
                ctx.fillStyle = '#000';
                ctx.fillText('*', tileX + tileW / 5, tileY + tileH / 1.05);
                break;
            case 'm':
                ctx.fillStyle = '#f00';
                ctx.fillText('M', tileX + tileW / 5, tileY + tileH / 1.25);
                break;
            case ' ':
            case 0:
                break;
            default:
                switch (value) {
                case 1:
                    ctx.fillStyle = '#00f';
                    break;
                case 2:
                    ctx.fillStyle = '#070';
                    break;
                case 3:
                    ctx.fillStyle = '#c00';
                    break;
                case 4:
                case 5:
                    ctx.fillStyle = '#528';
                    break;
                }
                ctx.fillText(value, tileX + tileW / 5, tileY + tileH / 1.25);
                break;
            }
        }

        return BoardView;
    }();

    /**
     * The board manager communicates with the server and creates BoardViews
     * from boards received from the server.
     */
    var boardManager = function () {
        var socket;
        var boardViews = {};

        /**
         * Creates a new board view from given id and board, updates boardViews.
         * Returns the container of the created view.
         */
        function createBoardView(id, board) {
            var view = new BoardView(board, function (change) {
                socket.emit('update', {
                    id: id,
                    change: change
                });
            });
            boardViews[id] = view;
            return view.container;
        }

        /**
         * Loops over an object of boards from the server, creates a board for
         * each board in the object. Returns an array with containers.
         */
        function createBoardViews(boards) {
            var containers = [];
            for (var id in boards) {
                if (boards.hasOwnProperty(id)) {
                    containers.push(createBoardView(id, boards[id]));
                }
            }
            return containers;
        }

        return {
            /**
             * Initializes the board manager, creates a connection.
             * 
             * io: the global socket 'io' object.
             */
            init: function (io) {
                socket = io.connect('/board');
                socket.on('update', function (update) {
                    if (boardViews.hasOwnProperty(update.id)) {
                        boardViews[update.id].update(update.change);
                    }
                });
            },

            /**
             * Creates a new board on the server with given width and height.
             */
            add: function (width, height, mineCount, fn) {
                socket.emit('add', {
                    width: width,
                    height: height,
                    mineCount: mineCount
                });
                socket.once('added', function (id) {
                    if (id == -1) {
                        return;
                    }
                    fn(id);
                });
            },

            /**
             * Requests a single board with given id, returns a DOM element with
             * the board in the callback function 'fn'.
             */
            get: function (id, fn) {
                socket.emit('get', id);
                socket.once('boards', function (boards) {
                    var containers = createBoardViews(boards);
                    fn(containers[0]);
                });
            },

            /**
             * Requests all boards from the server, runs the callback function
             * 'fn' when the response arrived, with the containers in an array
             * as parameter.
             */
            getAll: function (fn) {
                socket.emit('get', '*');
                socket.once('boards', function (boards) {
                    var containers = createBoardViews(boards);
                    fn(containers);
                });
            },
            
            // Temporary
            clear: function() {
                socket.emit('clear');
            }

        };
    }();

    return boardManager;
}();