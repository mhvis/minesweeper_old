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
        var mineCount = parseInt(document.getElementById('mineCount').value, 10) || 4;
        // Temporary begin
        BOARD.clear();
        boards.innerHTML = '';
        // Temporary end
        
        BOARD.add(width, height, mineCount, function(id) {
            console.log('Added board with id: ' + id + '.');
            BOARD.get(id, function(container) {
                boards.appendChild(container);
                newGame.innerHTML = 'New game';
            });
        });
        newGame.innerHTML = 'Creating...';
    };
    
    // Presets
    function clearNewGame(width, height, mineCount) {
        BOARD.clear();
        boards.innerHTML = '';
        BOARD.add(width, height, mineCount, function(id) {
            BOARD.get(id, function(container) {
                boards.appendChild(container);
            });
        });
    }
    document.getElementById('presetHardVertical').onclick = function(event) {
        clearNewGame(16, 30, 99);
    };
    document.getElementById('presetHardHorizontal').onclick = function(event) {
        clearNewGame(30, 16, 99);
    };
};

