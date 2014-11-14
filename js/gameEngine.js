var gameEngine = {
    initialgameState: function () {
        var x = {};
        x.gameOver = false;
        x.currentPiece = new Piece(randPiece());
        x.heldPiece = {};
        x.peices = [];
        x.board = function () {
            var currentBoard = [[]];
            console.log(x.peices);
            for (var i = 0; i < 22; i++) {
                currentBoard[i] = [];
                for (var j = 0; j < 10; j++) {
                    currentBoard[i][j] = {
                        x: i,
                        y: j,
                        color: "lightgrey",
                        occupied: false
                    };
                }
            }
            x.peices.map(function (cell) {
                if (0 <= cell.y <= 21 && 0 <= cell.x <= 9) {
                    if (currentBoard[cell.y] && currentBoard[cell.y][cell.x]) {
                        currentBoard[cell.y][cell.x] = {
                            x: cell.x,
                            y: cell.y,
                            color: cell.color,
                            occupied: true
                        };
                    }
                }
            });
            if (x.currentPiece && x.currentPiece.color != "brown") {
                x.currentPiece.cells().map(function (cell) {
                    if (0 <= cell.y <= 21 && 0 <= cell.x <= 9) {
                        currentBoard[cell.y][cell.x] = {
                            x: cell.x,
                            y: cell.y,
                            color: x.currentPiece.color(),
                            occupied: false
                        };
                    }
                });
            }
            return currentBoard;
        };
        x.addPiece = function (piece) {
            var collides = false;
            console.log("In Add Piece:");
            console.log(piece);
            var collided = x.peices.filter(function (cell) {
                return piece.collidesWithCell(cell);
            });
            if (piece == x.currentPiece) {
                x.currentPiece = new Piece(randPiece());
            }
            if (!collided.length > 0) {
                piece.cells().map(function (cell) {
                    x.peices.push(cell);
                });
            }
            if (collided.length > 0) {
                x.gameOver = true;
            }
            console.log("Collided Cells:" + collided.length);
            return this;
        };
        return x;
    },
    rotatePiece: {},
    holdPiece: {}

};

var gameA = gameEngine.initialgameState();
