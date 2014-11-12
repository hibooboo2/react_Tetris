var gameEngine = {
    initialgameState: function () {
        var x = {};
        x.gameOver = false;
        x.heldPiece = {};
        x.currentPiece = {};
        x.cells = [];
        for (var i = 0; i < 22; i++) {
            x.cells.push([]);
            for (var j = 0; j < 10; j++) {
                x.cells[i].push({
                    occupied: false,
                    color: "grey"
                });
            }
        }
        x.peices = new Array();
        x.board = function () {
            var currentBoard = x.cells.map(function (row) {
                return row.map(function (cell) {
                    return cell;
                })
            });
            if (x.peices.length > 0) {
                console.log(x.peices);
                x.peices.map(function (pieceToDisplay) {
                    pieceToDisplay.cells.map(function (cell) {
                        currentBoard[cell.y][cell.x].occupied = true;
                        currentBoard[cell.y][cell.x].color = pieceToDisplay.color;
                    })
                });
            }
            return currentBoard;
        }
        x.addPiece = function (piece) {
            var collides = false;
            this.peices.map(function (pieceToComp) {
                if (pieceToComp.collides(piece)) {
                    collides = true;
                }
            })
            if (!collides) {
                this.peices.push(piece);
            }
            console.log("The Piece collided: " + collides);
            console.log(piece.name);
            return collides;
        }
        x.dropPiece = function (piece) {
            var currentBoard = this.board();
            while (piece.canMoveDown(currentBoard)) {
                piece = piece.movePieceDown();
            }
            return piece;
        }
        return x;
    },
    rotatePiece: {},
    holdPiece: {}

};

function Piece(name, cells, color) {
    this.name = name;
    this.color = color ? color : "brown";
    this.cells = cells;
}

Piece.prototype.collides = function (piece) {
    var collides = false;
    this.cells.map(function (cell) {
        piece.cells.map(function (cellToComp) {
            if (cell.x == cellToComp.x && cell.y == cellToComp.y) {
                collides = true;
            }
        });
    });
    return collides;
}
Piece.prototype.movePieceDown = function () {
    var newPiece = new Piece(this.name, this.cells.map(function (cell) {
        var newCell = {
            x: cell.x,
            y: cell.y + 1
        };
        return newCell;
    }),this.color)
    return newPiece;
};

Piece.prototype.canMoveDown = function (currentBoard) {
    var canMoveDown = true;
    this.cells.map(function (cell) {
        if (cell.y + 1 > 21) {
            canMoveDown = false;
        }
        if (canMoveDown && currentBoard[cell.y + 1][cell.x].occupied) {
            canMoveDown = false;
        }
    })
    return canMoveDown;
};

var pieces = [];
(function () {
    pieces.push(new Piece("I", [
        {
            x: 2,
            y: 0
        },
        {
            x: 3,
            y: 0
        },
        {
            x: 4,
            y: 0
        },
        {
            x: 5,
            y: 0
        }
    ], "Cyan"));
    pieces.push(new Piece("O", [
        {
            x: 2,
            y: 0
        },
        {
            x: 3,
            y: 0
        },
        {
            x: 2,
            y: 1
        },
        {
            x: 3,
            y: 1
        }
    ], "Yellow"));
    pieces.push(new Piece("T", [
        {
            x: 2,
            y: 1
        },
        {
            x: 3,
            y: 1
        },
        {
            x: 4,
            y: 1
        },
        {
            x: 3,
            y: 0
        }
    ], "Purple"));
    pieces.push(new Piece("S", [
        {
            x: 2,
            y: 1
        },
        {
            x: 3,
            y: 1
        },
        {
            x: 3,
            y: 0
        },
        {
            x: 4,
            y: 0
        }
    ], "Green"));
    pieces.push(new Piece("Z", [
        {
            x: 2,
            y: 0
        },
        {
            x: 3,
            y: 0
        },
        {
            x: 3,
            y: 1
        },
        {
            x: 4,
            y: 1
        }
    ], "Red"));
    pieces.push(new Piece("J", [
        {
            x: 2,
            y: 1
        },
        {
            x: 2,
            y: 0
        },
        {
            x: 3,
            y: 0
        },
        {
            x: 4,
            y: 0
        }
    ], "Blue"));
    pieces.push(new Piece("L", [
        {
            x: 2,
            y: 1
        },
        {
            x: 3,
            y: 1
        },
        {
            x: 4,
            y: 1
        },
        {
            x: 4,
            y: 0
        }
    ], "Orange"));
})();

var randPiece = function () {
    //    return pieces[4];
    return pieces[Math.floor((Math.random() * 7))];
};

var gameA = gameEngine.initialgameState();
gameA.addPiece(gameA.dropPiece(randPiece()));
gameA.addPiece(gameA.dropPiece(randPiece()));
gameA.addPiece(gameA.dropPiece(randPiece()));
gameA.addPiece(gameA.dropPiece(randPiece()));
gameA.addPiece(gameA.dropPiece(randPiece()));
gameA.addPiece(gameA.dropPiece(randPiece()));
gameA.addPiece(gameA.dropPiece(randPiece()));
gameA.addPiece(gameA.dropPiece(randPiece()));
gameA.addPiece(gameA.dropPiece(randPiece()));
gameA.addPiece(randPiece());
