function Piece(tetromino, position, rotation) {
    this.tetromino = tetromino ? tetromino : allTetromino.I;
    this.rotation = rotation ? rotation : 0;
    this.position = position ? position : {
        x: 3,
        y: 0
    };
}

Piece.prototype.name = function () {
    return this.tetromino.name;
};
Piece.prototype.color = function () {
    return this.tetromino.color;
};

Piece.prototype.collides = function (piece) {
    var collides = false;
    this.cells().map(function (cell) {
        piece.cells().map(function (cellToComp) {
            if (cell.x == cellToComp.x && cell.y == cellToComp.y) {
                collides = true;
            }
        });
    });
    return collides;
};
Piece.prototype.collidesWithCell = function (cellToCheck) {
    var collides = false;
    this.cells().map(function (cell) {
        if (cell.x == cellToCheck.x && cell.y == cellToCheck.y) {
            collides = true;
        }

    });
    return collides;
};
Piece.prototype.movePieceDown = function (currentBoard) {
    var moved = false;
    var newPostion = {
        x: this.position.x,
        y: this.position.y + 1
    };
    if (this.canMove(currentBoard, newPostion)) {
        this.position = newPostion;
        moved = true;
    }
    return moved;
};


Piece.prototype.canMove = function (currentBoard, newPosition) {
    var canMoveArr = [];
    var curPos = this.position;
    this.position = newPosition;
    canMoveArr = this.cells().map(function (cell) {
        var canMove = true;
        if ((cell.y > 21 || cell.x > 9)) {
            canMove = false;
            console.log("Made False");
        } else {
            if(!(currentBoard[cell.y]&&currentBoard[cell.y][cell.x])){
                canMove = false;
            }
            if (canMove && currentBoard[cell.y][cell.x].occupied === true) {
                canMove = false;
            }
        }
        if (!canMove) {
            console.log("Cell can't move: x: " + (cell.x) + " y: " + (cell.y));
        }
        return canMove;
    });
    console.log(this.cells());
    this.position = curPos;
    return canMoveArr.reduce(function (a, b) {
        return a && b;
    });
};

Piece.prototype.canMoveDown = function (currentBoard) {
    return this.canMove(currentBoard, {
        x: this.position.x,
        y: this.position.y + 1
    });
};

Piece.prototype.canRotate = function (currentBoard, newRotation) {
    var canMove = true;
    var oldRotation = this.rotation;
    this.rotation = newRotation;
    this.cells().map(function (cell) {
        if (cell.y > 21 || cell.x > 9) {
            canMove = false;
        }
        if (canMove && currentBoard[cell.y][cell.x].occupied) {
            canMove = false;
        }
    });
    this.rotation = oldRotation;
    return canMove;
};

Piece.prototype.dropPiece = function (currentBoard) {
    while (this.canMoveDown(currentBoard)) {
        this.movePieceDown(currentBoard);
    }
    return true;
};
Piece.prototype.cells = function () {
    var currentCells = [];
    var curPos = this.position;
    var color = this.color();
    this.tetromino.cells[this.rotation].map(function (row, celly) {
        row.map(function (cell,cellx) {
            if (cell) {
                currentCells.push({
                    x: cellx + curPos.x,
                    y: celly + curPos.y,
                    color: color
                });
            }
        });
    });
    console.log(currentCells);
    return currentCells;
};

Piece.prototype.shiftLeft = function (currentBoard) {
    var moved = false;
    var newPostion = {
        x: this.position.x - 1,
        y: this.position.y
    };
    if (this.canMove(currentBoard, newPostion)) {
        this.position = newPostion;
        moved = true;
    }
    return moved;
};
Piece.prototype.shiftRight = function (currentBoard) {
    var moved = false;
    var newPostion = {
        x: this.position.x + 1,
        y: this.position.y
    };
    if (this.canMove(currentBoard, newPostion)) {
        this.position = newPostion;
        moved = true;
    }
    return moved;
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


function shuffle(o) { //v1.0
    for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}
var nextPiece = -1;
var pieceLetters = ["I", "J", "L", "S", "T", "O", "Z"];
shuffle(pieceLetters);
var randPiece = function () {
    nextPiece += 1;
    if (nextPiece > 6) {
        nextPiece = -1;
        shuffle(pieceLetters);
    }
    return allTetromino[pieceLetters[nextPiece]];
};
