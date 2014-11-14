function Cell(x, y, color, name, occupied) {
    this.x = x ? x : 0;
    this.y = y ? y : 0;
    this.color = color ? color : "pink";
    this.name = name ? name : "Pinky";
    this.occupied = occupied ? occupied : false;
}

Cell.prototype.equals = function (cell) {
    return this.x === cell.x && this.y === cell.y && this.color === cell.color && this.name === cell.name && this.occupied === cell.occupied;
};
Cell.prototype.collides = function (cell) {
    return this.x === cell.x && this.y === cell.y;
};
Cell.prototype.canMove = function (currentBoard, newPosition) {
    var canMove = true;
    if (this.y + newPosition.y > 21 || this.x + newPosition.x > 9) {
        canMove = false;
    } else {
        if (!(currentBoard[this.y + newPosition.y] && currentBoard[this.y + newPosition.y][this.x + newPosition.x])) {
            canMove = false;
        }
        if (canMove && currentBoard[this.y + newPosition.y][this.x + newPosition.x].occupied === true && !currentBoard[this.y + newPosition.y][this.x + newPosition.x].currentPiece) {
            console.log("Cell can't move: x: " + (newPosition.x) + " y: " + (newPosition.y));
            console.log(currentBoard[this.y + newPosition.y][this.x + newPosition.x]);
            canMove = false;
        }
    }
    return canMove;
};
Cell.prototype.canMoveDown = function (currentBoard) {
    return this.canMove(currentBoard, {
        x: 0,
        y: 1
    });
};
Cell.prototype.moveDown = function (currentBoard) {
    var moved = false;
    if (this.canMoveDown(currentBoard)) {
        this.y += 1;
        moved = true;
    }
    return moved;
};

function Piece(tetromino, position, rotation, occupied) {
    this.tetromino = tetromino ? tetromino : allTetromino.Z;
    this.rotation = rotation ? rotation : 0;
    this.occupied = occupied ? occupied : false;
    this.position = position ? position : {
        x: 3,
        y: 0
    };
}

Piece.prototype.equals = function (piece) {
    return this.cells().filter(function (cell) {
        var sameCells = piece.cells().filter(function (thisCell) {
            return thisCell.equals(cell);
        })
        return sameCells.length === 1;

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
        if (piece.collidesWithCell(cell)) {
            collides = true;
        }
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
    var canMoveArr = [];
    canMoveArr = this.cells().map(function (cell) {
        return cell.canMove(currentBoard, newPosition);
    });
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
        if (canMove && currentBoard[cell.y][cell.x].occupied && !currentBoard[cell.y][cell.x].currentPiece) {
            canMove = false;
        }
    });
    this.rotation = oldRotation;
    return canMove;
};

Piece.prototype.dropPiece = function (currentBoard) {
    var curPosy = this.position.y;
    var curPosx = this.position.x;
    while (this.movePieceDown(currentBoard)) {
    }
    return this.position.y===curPosy;
};
Piece.prototype.cells = function () {
    var currentCells = [];
    var startingPos = this.position;
    var color = this.color();
    var name = this.name();
    var occupied = this.occupied;
    this.tetromino.cells[this.rotation].map(function (row, celly) {
        row.map(function (cell, cellx) {
            if (cell) {
                currentCells.push(new Cell(cellx + startingPos.x, celly + startingPos.y, color, name, occupied));
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


function shuffle(o) { //v1.0
    for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}
var nextPiece = -1;
var pieceLetters = ["I", "J", "L", "S", "T", "O", "Z"];
shuffle(pieceLetters);
var randPiece = function () {
    if (nextPiece > 5) {
        nextPiece = -1;
        shuffle(pieceLetters);
    }
    nextPiece += 1;
    return new Piece(allTetromino[pieceLetters[nextPiece]], {
        x: 3,
        y: 0
    }, 0, true);
};
