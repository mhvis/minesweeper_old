/* main canvas */
var canvas = document.getElementById('canvas');
var w = 600;
var h = 600;
canvas.width = w;
canvas.height = h;
var ctx = canvas.getContext('2d');


var cursor = document.getElementById('cursor');
cursor.width = w;
cursor.height = h;
var cursorctx = cursor.getContext('2d');


/* game settings */
var boardWidth = 8;
var boardHeight = 8;
var board;
var stopGame = false;
var time = 0;
var mineCount = 0;

/* controls canvas */
var controls = document.getElementById('controls');
var cw = w;
var ch = 150;
controls.width = cw;
controls.height = ch;
var cctx = controls.getContext('2d');

/* controls canvas settings */
var cfontsize = 100;
var smiley = {
	// 0 = neutral, 1 = happy, 2 = sad, 3 = dead
	mood : 0
};

document.addEventListener('DOMContentLoaded', function() {
	newGame();
	resize(true);
});

function setSize(width, height) {
	boardWidth = width;
	boardHeight = height;

	newGame();
	
	uploadBoard();
};

function changeWidth(width) {
	boardWidth = width;
	boardHeight = width;

	newGame();
	
	uploadBoard();
};

window.addEventListener('resize', resize);

var oldWidth = window.innerWidth;

function resize(forceRun) {
	if ((typeof (window.innerWidth) == 'number' &&
		oldWidth != window.innerWidth) || forceRun === true) {
		var innerWidth = window.innerWidth;
		oldWidth = window.innerWidth;

		if (innerWidth < 600) {
			canvas.width = innerWidth;
			canvas.height = innerWidth;
			w = canvas.width;
			h = canvas.height;
			controls.width = w;
			cw = w;
			cfontsize = w/8;
		} else {
			canvas.width = 600;
			canvas.height = 600;
			w = 600;
			h = 600;
			controls.width = w;
			cw = w;
			cfontsize = 100;
		}

		drawTiles();
		drawControls();
	}
};

function drawControls() {
	cctx.clearRect(0,0,cw,ch);
	cctx.fillStyle = '#888';
	cctx.fillRect(cw/2 - 60, 15, 120, 120);

	cctx.fillRect(15, 15, cw/2 - 90, 120);
	cctx.fillRect(cw - (cw/2 - 75), 15, cw/2 - 90, 120);

	// Draw base of smiley
	cctx.strokeStyle = '#000';
	cctx.fillStyle = '#ff0';
	cctx.lineWidth = 2;

	cctx.beginPath();
	cctx.arc(cw/2, ch/2, 50, 0, 2*Math.PI);
	cctx.fill();
	cctx.stroke();
	cctx.closePath();

	switch(smiley.mood) {
		case 0:
			cctx.strokeStyle = '#000';
			cctx.fillStyle = '#fff';
			cctx.lineWidth = 2;

			// Left eye
			cctx.beginPath();
			cctx.arc(cw/2-20,55,5,0,2*Math.PI);
			cctx.fill();
			cctx.stroke();
			cctx.closePath();

			// Right eye
			cctx.beginPath();
			cctx.arc(cw/2+20,55,5,0,2*Math.PI);
			cctx.fill();
			cctx.stroke();
			cctx.closePath();

			// Mouth
			cctx.beginPath();
			cctx.moveTo(cw/2-20,100);
			cctx.lineTo(cw/2+20,100);
			cctx.stroke();
			cctx.closePath();
			break;
		case 1:
			cctx.strokeStyle = '#000';
			cctx.fillStyle = '#fff';
			cctx.lineWidth = 2;

			// Left eye
			cctx.beginPath();
			cctx.arc(cw/2-20,55,5,0,2*Math.PI);
			cctx.fill();
			cctx.stroke();
			cctx.closePath();

			// Right eye
			cctx.beginPath();
			cctx.arc(cw/2+20,55,5,0,2*Math.PI);
			cctx.fill();
			cctx.stroke();
			cctx.closePath();

			// Mouth
			cctx.beginPath();
			cctx.arc(cw/2,80,30,0.05*Math.PI,0.95*Math.PI);
			cctx.stroke();
			cctx.closePath();
			break;
		case 2:
			cctx.strokeStyle = '#000';
			cctx.fillStyle = '#fff';
			cctx.lineWidth = 2;

			// Left eye
			cctx.beginPath();
			cctx.arc(cw/2-20,55,5,0,2*Math.PI);
			cctx.fill();
			cctx.stroke();
			cctx.closePath();

			// Right eye
			cctx.beginPath();
			cctx.arc(cw/2+20,55,5,0,2*Math.PI);
			cctx.fill();
			cctx.stroke();
			cctx.closePath();

			// Mouth
			cctx.beginPath();
			cctx.arc(cw/2,105,30,-0.05*Math.PI,1.05*Math.PI,true);
			cctx.stroke();
			cctx.closePath();
			break;
		case 3:
			cctx.strokeStyle = '#000';
			cctx.fillStyle = '#fff';
			cctx.lineWidth = 2;

			// Left eye
			cctx.beginPath();
			cctx.moveTo(cw/2-25,50);
			cctx.lineTo(cw/2-15,60);
			cctx.stroke();
			cctx.moveTo(cw/2-15,50);
			cctx.lineTo(cw/2-25,60);
			cctx.stroke();
			cctx.closePath();

			// Right eye
			cctx.beginPath();
			cctx.moveTo(cw/2+25,50);
			cctx.lineTo(cw/2+15,60);
			cctx.stroke();
			cctx.moveTo(cw/2+15,50);
			cctx.lineTo(cw/2+25,60);
			cctx.stroke();
			cctx.closePath();

			// Mouth
			cctx.beginPath();
			cctx.arc(cw/2,105,30,-0.05*Math.PI,1.05*Math.PI,true);
			cctx.stroke();
			cctx.closePath();
			break;
	}

	// draw mines
	var mineString = "";
	if (mineCount < 10) mineString = "00" + Math.max(mineCount, 0);
	else if (mineCount < 100) mineString = "0" + mineCount;
	else mineString = mineCount;

	cctx.fillStyle = '#fff';
	cctx.font = cfontsize + 'px monospace';
	cctx.fillText(mineString, (((cw/2 - 90) - cctx.measureText(mineString).width) / 2) + 15, ch/2 + cfontsize/3);

	// draw time
	var timeString = "";
	if (time < 10) timeString = "00" + time;
	else if (time < 100) timeString = "0" + time;
	else timeString = time;

	cctx.fillStyle = '#fff';
	cctx.font = cfontsize + 'px monospace';
	cctx.fillText(timeString, (cw - (cw/2 - 90)) + (((cw/2 - 90) - cctx.measureText(timeString).width) / 2) - 15, ch/2 + cfontsize/3);
};

function timeLoop() {
	if (!stopGame) {
		if (time < 999) time += 1;
		drawControls();
	}

	setTimeout(timeLoop, 1000);
}timeLoop();

function tile(value) {
	this.isExposed = false;
	this.val = value;
	this.isAMine = false;
	this.isFlagged = false;
};

// canvas.onmousedown = function(event) {
// 	if (!stopGame) {
// 		var x = event.offsetX;
// 		var y = event.offsetY;

// 		var blockX = Math.floor((x/w)*boardWidth);
// 		var blockY = Math.floor((y/h)*boardHeight);

// 		if (blockX >= boardWidth)
// 			blockX = boardWidth-1;
// 		if (blockY >= boardHeight)
// 			blockY = boardHeight-1;

// 		if (event.which == 1) {
// 			if (!board[blockY][blockX].isAMine) {
// 				exposeNeighbours(blockX, blockY);
// 			} else{
// 				lose(blockX, blockY);
// 			}
// 		}
// 		if (event.which == 3) {
// 			markMine(blockX, blockY);
// 		}

// 		drawTiles();

// 		checkWin();
// 	}
// 	/* globals uploadBoard */
// 	uploadBoard();
// };
// canvas.oncontextmenu = function(event) {
// 	event.preventDefault();
// 	event.stopPropagation();
// 	return false;
// };
// canvas.onmousemove = function(event) {
// 	var x = event.offsetX;
// 	var y = event.offsetY;
	
// 	var relX = x / w;
// 	var relY = y / h;
	
// 	socket.emit('cursor', { x:relX, y:relY });
// };

cursor.onmousedown = function(event) {
	if (!stopGame) {
		var x = event.offsetX;
		var y = event.offsetY;

		var blockX = Math.floor((x/w)*boardWidth);
		var blockY = Math.floor((y/h)*boardHeight);

		if (blockX >= boardWidth)
			blockX = boardWidth-1;
		if (blockY >= boardHeight)
			blockY = boardHeight-1;

		if (event.which == 1) {
			if (!board[blockY][blockX].isAMine) {
				exposeNeighbours(blockX, blockY);
			} else{
				lose(blockX, blockY);
			}
		}
		if (event.which == 3) {
			markMine(blockX, blockY);
		}

		drawTiles();

		checkWin();
	}
	/* globals uploadBoard */
	uploadBoard();
};
cursor.oncontextmenu = function(event) {
	event.preventDefault();
	event.stopPropagation();
	return false;
};
cursor.onmousemove = function(event) {
	var x = event.offsetX;
	var y = event.offsetY;
	
	var relX = x / w;
	var relY = y / h;
	
	socket.emit('cursor', { x:relX, y:relY });
};

controls.onclick = function(event) {
	newGame();
	
	uploadBoard();
};
controls.oncontextmenu = function(event) {
	event.preventDefault();
	event.stopPropagation();
	return false;
};

function newGame() {
	stopGame = false;
	smiley.mood = 0;
	time = 0;
	// mineCount = 0;

	createBoard();
	randomizeBoard();
	generateNumbers();

	drawTiles();
	drawControls();
};

function createBoard() {
	board = [];

	for (var y = 0; y < boardHeight; y++) {
		var data = [];
		for (var x = 0; x < boardWidth; x++) {
			data.push(new tile(0));
		}
		board.push(data);
	}
};

function randomizeBoard() {
	/* old algorithm */
	// for (var y = 0; y < boardHeight; y++) {
	// 	for (var x = 0; x < boardWidth; x++) {
	// 		var rnd = Math.ceil(Math.random() * 10);

	// 		// 1/10th chance to place a mine
	// 		if (rnd == 1) {
	// 			board[y][x].isAMine = true;
	// 			mineCount++;
	// 		}
	// 	}
	// }

	mineCount = Math.ceil((boardWidth*boardHeight)/10);

	var array = [];

	for (var y = 0; y < boardHeight; y++) {
		for (var x = 0; x < boardWidth; x++) {
			array.push({x:x, y:y});
		}
	}

	for (var i = array.length - 1; i >= array.length - mineCount; i--) {
		var rnd = Math.floor(Math.random() * (i + 1));

		var b = array[i];
		array[i] = array[rnd];
		array[rnd] = b;

		board[array[i].y][array[i].x].isAMine = true;
	}
};

function generateNumbers() {
	for (var y = 0; y < boardHeight; y++) {
		for (var x = 0; x < boardWidth; x++) {
			if (board[y][x].isAMine) {
				if (y > 0 && !board[y-1][x].isAMine) board[y-1][x].val++;
				if (y > 0 && x < boardWidth-1 && !board[y-1][x+1].isAMine) board[y-1][x+1].val++;
				if (x < boardWidth-1 && !board[y][x+1].isAMine) board[y][x+1].val++;
				if (y < boardHeight-1 && x < boardWidth-1 && !board[y+1][x+1].isAMine) board[y+1][x+1].val++;
				if (y < boardHeight-1 && !board[y+1][x].isAMine) board[y+1][x].val++;
				if (y < boardHeight-1 && x > 0 && !board[y+1][x-1].isAMine) board[y+1][x-1].val++;
				if (x > 0 && !board[y][x-1].isAMine) board[y][x-1].val++;
				if (y > 0 && x > 0 && !board[y-1][x-1].isAMine) board[y-1][x-1].val++;
			}
		}
	}
};

function markMine(x, y) {
	if (!board[y][x].isExposed) {
		if (board[y][x].isFlagged) {
			board[y][x].isFlagged = false;
			mineCount++;
		}
		else {
			board[y][x].isFlagged = true;
			mineCount--;
		}

		drawControls();
	}
};

function checkWin() {
	for (var y = 0; y < boardHeight; y++) {
		for (var x = 0; x < boardWidth; x++) {
			if (board[y][x].isAMine && !board[y][x].isFlagged) return;
			if (!board[y][x].isAMine && board[y][x].isFlagged) return;
			if (!board[y][x].isExposed && !board[y][x].isAMine && !board[y][x].isFlagged) return;
		}
	}

	stopGame = true;

	smiley.mood = 1;
	drawControls();
};

function lose(x, y) {
	board[y][x].isExposed = true;

	stopGame = true;

	smiley.mood = 3;
	drawControls();
};

function exposeNeighbours(x, y) {
	if (board[y][x].isExposed) return;
	if (board[y][x].isAMine) return;
	if (board[y][x].isFlagged) return;
	if (board[y][x].val != 0) {
		board[y][x].isExposed = true;
		return;
	}

	board[y][x].isExposed = true;

	if (y > 0) exposeNeighbours(x, y-1);
	if (y > 0 && x < boardWidth-1) exposeNeighbours(x+1, y-1);
	if (x < boardWidth-1) exposeNeighbours(x+1, y);
	if (y < boardHeight-1 && x < boardWidth-1) exposeNeighbours(x+1, y+1);
	if (y < boardHeight-1) exposeNeighbours(x, y+1);
	if (y < boardHeight-1 && x > 0) exposeNeighbours(x-1, y+1);
	if (x > 0) exposeNeighbours(x-1, y);
	if (y > 0 && x > 0) exposeNeighbours(x-1, y-1);
};

function drawTiles() {
	ctx.clearRect(0,0,w,h);

	for (var y = 0; y < boardHeight; y++) {
		for (var x = 0; x < boardWidth; x++) {
			var tile = board[y][x];

			// Draw outline
			if (tile.isExposed) {
				ctx.fillStyle = '#BBB';
				ctx.strokeStyle = '#999';
			} else {
				ctx.fillStyle = '#888';
				ctx.strokeStyle = '#666';
			}

			ctx.fillRect(x*(w/boardWidth),y*(h/boardHeight),w/boardWidth,h/boardHeight);
			ctx.strokeRect(x*(w/boardWidth),y*(h/boardHeight),w/boardWidth,h/boardHeight);

			var fontWidth = (h/boardHeight);
			ctx.font = fontWidth + 'px monospace';

			// Draw number/mine
			if (tile.isExposed) {
				if (tile.val != 0) {
					if (tile.val == 1) ctx.fillStyle = '#00f';
					else if (tile.val == 2) ctx.fillStyle = '#070';
					else if (tile.val == 3) ctx.fillStyle = '#c00';
					else if (tile.val == 4 || tile.val == 5) ctx.fillStyle = '#528';

					ctx.fillText(tile.val, fontWidth/5 + (x*(w/boardWidth)), fontWidth/1.25 + (y*(h/boardHeight)));
				}

				if (tile.isAMine) {
					ctx.fillStyle = '#000';
					ctx.fillText('*', fontWidth/5 + (x*(w/boardWidth)), fontWidth/1.05 + (y*(h/boardHeight)));
				}
			} else if (tile.isFlagged) {
				ctx.fillStyle = '#f00';
				ctx.fillText('M', fontWidth/5 + (x*(w/boardWidth)), fontWidth/1.25 + (y*(h/boardHeight)));
			}
		}
	}
};

function drawCursor(cursor) {
	cursorctx.clearRect(0,0,w,h);
	cursorctx.fillStyle = '#f00';
	cursorctx.fillRect(cursor.x*w - 5, cursor.y*h - 5, 10, 10);
};