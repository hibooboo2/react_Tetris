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
}
Piece.prototype.color = function () {
    return this.tetromino.color;
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
    console.log(this.position);
    return moved;
};


Piece.prototype.canMove = function (currentBoard, newPosition) {
    var canMove = true;
    this.cells().map(function (cell) {
        if (!(newPosition.y < 22 && newPosition.x < 10)) {
            canMove = false;
        }
        if (canMove && currentBoard[newPosition.y][newPosition.x].occupied) {
            canMove = false;
        }
    });
    return canMove;
};

Piece.prototype.canMoveDown = function(currentBoard){
    return this.canMove(currentBoard, {x:this.position.x,y:this.position.y+1})
}

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
    var dropped = false;
    while (this.canMoveDown(currentBoard)) {
        this.movePieceDown(currentBoard);
        dropped = true;
    }
    return dropped;
};
Piece.prototype.cells = function () {
    var currentCells = [];
    this.tetromino.cells[this.rotation].map(function (row, celly) {
        row.map(function (cell, cellx) {
            if (cell) {
                currentCells.push({
                    x: cellx,
                    y: celly
                });
            }
        });
    });
    curPos = this.position;
    var color = this.color();
    currentCells.map(function (cell) {
        cell.x += curPos.x;
        cell.y += curPos.y;
        cell.color = color;
    })
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
        var moved = true;
    }
    return moved;
}
Piece.prototype.shiftRight = function (currentBoard) {
    var moved = false;
    var newPostion = {
        x: this.position.x + 1,
        y: this.position.y
    };
    if (this.canMove(currentBoard, newPostion)) {
        this.position = newPostion;
        var moved = true;
    }
    return moved;
}
Piece.prototype.rotateClockWise = function (currentBoard) {
    var rotated = false;
    var newRotation = this.rotation + 1;
    if (newRotation > 3) {
        newRotation = 0;
    }
    if (this.canRotate(currentBoard, newRotation)) {
        this.rotation = newRotation;
        var rotated = true;
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
        var rotated = true;
    }
    return rotated;
};


function shuffle(o) { //v1.0
    for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};
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
