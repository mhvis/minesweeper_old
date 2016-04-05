/* globals BOARD io */
window.onload = function() {
    var boards = document.getElementById('boards');
    var newGame = document.getElementById('new');
    BOARD.init(io);
    BOARD.getAll(function(containers) {
        containers.forEach(function(container) {
            boards.appendChild(container);
        });
    });
    newGame.onclick = function(event) {
        var width = parseInt(document.getElementById('boardWidth').value, 10) || 4;
        var height = parseInt(document.getElementById('boardHeight').value, 10) || 4;
        BOARD.add(width, height, function(id) {
            console.log('Added board with id: ' + id + '.');
            BOARD.get(id, function(container) {
                boards.appendChild(container);
                newGame.innerHTML = 'New game';
            });
        });
        newGame.innerHTML = 'Creating...';
    }
};

