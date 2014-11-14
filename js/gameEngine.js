var gameEngine = {
    newGame: function () {
        var x = {};
        x.gameOver = false;
        x.currentPiece = randPiece();
        x.heldPiece = {};
        x.cellsUsed = [];
        x.board = function () {
            var currentBoard = [[]];
            for (var i = 0; i < 22; i++) {
                currentBoard[i] = [];
                for (var j = 0; j < 10; j++) {
                    currentBoard[i][j] = new Cell(i, j, "lightgrey", "empty", false);
                }
            }
            x.cellsUsed.map(function (cell) {
                if (0 <= cell.y <= 21 && 0 <= cell.x <= 9) {
                    if (currentBoard[cell.y] && currentBoard[cell.y][cell.x]) {
                        currentBoard[cell.y][cell.x] = cell;
                    }
                }
            });
            if (x.currentPiece) {
                x.currentPiece.cells().map(function (cell) {
                    if (0 <= cell.y <= 21 && 0 <= cell.x <= 9) {
                        currentBoard[cell.y][cell.x] = cell;
                        cell.currentPiece = true;
                    }
                console.log(cell);
                });
            }
            //clearLines(currentBoard);
            return currentBoard;
        };
        x.addPiece = function (piece) {
            var collides = false;
            console.log("In Add Piece:");
            console.log(piece);
            var collided = x.cellsUsed.filter(function (cell) {
                return piece.collidesWithCell(cell);
            });
            if (piece == x.currentPiece) {
                x.currentPiece = new Piece(randPiece());
            }
            if (collided.length < 1) {
                piece.cells().map(function (cell) {
                    x.cellsUsed.push(cell);
                });
            }
            if (collided.length > 0) {
                x.gameOver = true;
            }
            console.log("Collided Cells:" + collided.length);
            return this;
        };

        function clearLines(currentBoard) {
            var linesToClear = [];
            for (var i = 0; i < 22; i++) {
                var allOccupied = true;
                for (var j = 0; j < 10; j++) {
                    if (!currentBoard[i][j].occupied) {
                        allOccupied = false;
                    }
                }
                if (allOccupied) {
                    linesToClear.push(i);
                }
            }
            if (linesToClear.length > 0) {
                x.cellsUsed = x.cellsUsed.filter(function (cell) {
                    return !(linesToClear.indexOf(cell.y) > -1);
                });
            }
            console.log("Lines needing clearing: " + linesToClear.length);
        }
        return x;
    },
    rotatePiece: {},
    holdPiece: {}

};
