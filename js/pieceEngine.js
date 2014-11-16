//pieceEngine.js relys on cellEngine.js and boardEngine.js
function Piece(tetromino, position, rotation, type) {
    this.tetromino = tetromino ? tetromino : allTetromino.Z;
    this.rotation = rotation ? rotation : 0;
    this.position = position ? position : {
        x: 3,
        y: 0
    };
    this.type = type ? type : 3;
}

Piece.prototype.getType = function () {
    return Cell.prototype.types[this.type];
}

Piece.prototype.copy = function () {
    return new Piece(this.tetromino, this.position, this.rotation, this.type);
}

Piece.prototype.equals = function (piece) {
    return this.cells().filter(function (cell) {
        return piece.cells().filter(function (thisCell) {
            return thisCell.equals(cell);
        }).length === 1;

    }).length === 4;
};

Piece.prototype.name = function () {
    return this.tetromino.name;
};

Piece.prototype.color = function () {
    return this.tetromino.color;
};

Piece.prototype.collides = function (piece) {
    var collides = false;
    this.cells().map(function (cell) {
        piece.cells().map(function (cellB) {
            if (cell.collides(cellB)) {
                collides = true;
            }
        })
    });
    return collides;
};

Piece.prototype.collidesWithCell = function (cellToCheck) {
    var collides = false;
    this.cells().map(function (cell) {
        if (cell.collides(cellToCheck)) {
            collides = true;
        }
    });
    return collides;
};

Piece.prototype.collidesWithCells = function (cells) {
    return cells.reduce(function (cellA, cellB) {
        return this.collidesWithCell(cellA) || this.collidesWithCell(cellB);
    })
}

Piece.prototype.movePiece = function (currentBoard, newPostion) {
    var moved = false;
    if (this.canMove(currentBoard, newPostion)) {
        this.position.y += newPostion.y;
        this.position.x += newPostion.x;
        moved = true;
    }
    return moved;
};

Piece.prototype.movePieceDown = function (currentBoard) {
    var newPostion = {
        x: 0,
        y: 1
    };
    return this.movePiece(currentBoard, newPostion);
};

Piece.prototype.canMove = function (currentBoard, newPosition) {
    return this.cells().reduce(function (cellA, cellB) {
        return cellA.canMove(currentBoard, newPosition) && cellB.canMove(currentBoard, newPosition);
    });
};

Piece.prototype.canMoveDown = function (currentBoard) {
    return this.cells().reduce(function (cellA, cellB) {
        return cellA.canMoveDown(currentBoard) && cellB.canMoveDown(currentBoard);
    })
};

Piece.prototype.canRotate = function (currentBoard, newRotation) {
    var canRotate = true;
    var oldRotation = this.rotation;
    this.rotation = newRotation;
    this.cells().map(function (cell) {
        if (currentBoard.getCell(cell.x, cell.y).type === 2) {
            canRotate = false;
        }
    });
    this.rotation = oldRotation;
    return canRotate;
};

Piece.prototype.dropPiece = function (currentBoard) {
    var curPosy = this.position.y;
    var curPosx = this.position.x;
    while (this.movePieceDown(currentBoard)) {}
    return this.position.y === curPosy;
};

Piece.prototype.ghost = function (currentBoard) {
    var ghostPiece = this.copy();
    ghostPiece.dropPiece(currentBoard);
    return ghostPiece;
}

Piece.prototype.cells = function () {
    var currentCells = [];
    var startingPos = this.position;
    var color = this.color();
    var name = this.name();
    var type = this.type;
    this.tetromino.cells[this.rotation].map(function (row, celly) {
        row.map(function (cell, cellx) {
            if (cell) {
                var cellToAdd = new Cell(cellx + startingPos.x, celly + startingPos.y, color, name, type);
                currentCells.push(cellToAdd);
            }
        });
    });
    return currentCells;
};

Piece.prototype.shiftLeft = function (currentBoard) {
    var newPostion = {
        x: -1,
        y: 0
    };
    return this.movePiece(currentBoard, newPostion);
};

Piece.prototype.shiftRight = function (currentBoard) {
    var newPostion = {
        x: 1,
        y: 0
    };
    return this.movePiece(currentBoard, newPostion);
};

Piece.prototype.rotateClockWise = function (currentBoard) {
    var rotated = false;
    var newRotation = this.rotation + 1;
    if (newRotation > 3) {
        newRotation = 0;
    }
    if (this.canRotate(currentBoard, newRotation)) {
        this.rotation = newRotation;
        rotated = true;
    }
    return rotated;
};

Piece.prototype.rotateCounterClockWise = function (currentBoard) {
    var rotated = false;
    var newRotation = this.rotation - 1;
    if (newRotation < 0) {
        newRotation = 3;
    }
    if (this.canRotate(currentBoard, newRotation)) {
        this.rotation = newRotation;
        rotated = true;
    }
    return rotated;
};

Piece.prototype.rand = function () {
    if (Piece.prototype.nextPieceNumber > 5) {
        Piece.prototype.nextPieceNumber = -1;
        Piece.prototype.shuffle(Piece.prototype.pieceLetters);
    }
    Piece.prototype.nextPieceNumber += 1;
    return new Piece(allTetromino[Piece.prototype.pieceLetters[Piece.prototype.nextPieceNumber]], {
        x: 3,
        y: 0
    }, 0, 0);
};

Piece.prototype.draw = function () {
    Piece.prototype.que.unshift(Piece.prototype.rand());
    var drawnPiece = Piece.prototype.que.pop();
    return drawnPiece;
};

Piece.prototype.shuffle = function (o) { //v1.0
    for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}

Piece.prototype.nextPieceNumber = -1;
Piece.prototype.que = [Piece.prototype.rand(),Piece.prototype.rand(),Piece.prototype.rand(),Piece.prototype.rand()];
Piece.prototype.pieceLetters = ["I", "J", "L", "S", "T", "O", "Z"];
Piece.prototype.shuffle(Piece.prototype.pieceLetters);
