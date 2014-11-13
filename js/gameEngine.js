var gameEngine = {
    initialgameState: function () {
        var x = {};
        x.gameOver = false;
        x.currentPiece = new Piece(allTetromino.I, {
            x: 2,
            y: 0
        });
        x.currentPiece = null;
        x.heldPiece = {};
        x.peices = [];
        x.board = function () {
            var currentBoard = [[]];
            for (var i = 0; i < 22; i++) {
                currentBoard[i] = [];
                for (var j = 0; j < 10; j++) {
                    currentBoard[i][j] = {
                        occupied: false,
                        color: "grey"
                    };
                }
            }
            if (x.peices.length > 0) {
                x.peices.map(function (cell) {
                    if (0 <= cell.y <= 21 && 0 <= cell.x <= 9) {
                        currentBoard[cell.y][cell.x] = {
                            occupied: true,
                            color: cell.color
                        };
                    }
                });
            }
            if (x.currentPiece && x.currentPiece.color != "brown") {
                x.currentPiece.cells().map(function (cell) {
                    if (0 <= cell.y <= 21 && 0 <= cell.x <= 9) {
                        currentBoard[cell.y][cell.x] = {
                            occupied: true,
                            color: x.currentPiece.color()
                        };
                    }
                });
            }
            return currentBoard;
        };
        x.addPiece = function (piece) {
            var collides = false;
            x.peices.map(function (cell) {
                if (piece.collidesWithCell(cell)) {
                    collides = true;
                }
            });
            if (!collides) {
                piece.cells().map(function (cell) {
                    x.peices.push(cell);
                })
            }
            if (!collides && piece == x.currentPiece) {
                x.currentPiece = new Piece();
            }
            if (collides) {
                x.gameOver = true;
            }
            return this;
        };
        return x;
    },
    rotatePiece: {},
    holdPiece: {}

};

var gameA = gameEngine.initialgameState();
var pieceToAdd = new Piece(randPiece(),{x:0,y:0},Math.floor(Math.random()*3));
pieceToAdd.rotateClockWise(gameA.board());
pieceToAdd.movePieceDown(gameA.board());
pieceToAdd.movePieceDown(gameA.board());
pieceToAdd.movePieceDown(gameA.board());
pieceToAdd.movePieceDown(gameA.board());
pieceToAdd.movePieceDown(gameA.board());
pieceToAdd.movePieceDown(gameA.board());
pieceToAdd.movePieceDown(gameA.board());
pieceToAdd.movePieceDown(gameA.board());
pieceToAdd.movePieceDown(gameA.board());
pieceToAdd.movePieceDown(gameA.board());
pieceToAdd.movePieceDown(gameA.board());
pieceToAdd.movePieceDown(gameA.board());
pieceToAdd.movePieceDown(gameA.board());
pieceToAdd.movePieceDown(gameA.board());
pieceToAdd.movePieceDown(gameA.board());
pieceToAdd.movePieceDown(gameA.board());
pieceToAdd.movePieceDown(gameA.board());
pieceToAdd.movePieceDown(gameA.board());
pieceToAdd.movePieceDown(gameA.board());
pieceToAdd.movePieceDown(gameA.board());
console.log(pieceToAdd.position);
gameA.addPiece(pieceToAdd);
//pieceToAdd = new Piece(randPiece());
//pieceToAdd.dropPiece(gameA.board());
//console.log(pieceToAdd.position);
//gameA.addPiece(pieceToAdd);
