"use strict";
function Piece(tetromino, position, rotation, type) {
    this.tetromino = tetromino ? tetromino : allTetromino[0];  // jshint ignore:line
    this.rotation = rotation ? rotation : 0;  // jshint ignore:line
    this.position = position ? position : {  // jshint ignore:line
        x: 3,
        y: 0
    };
    this.type = type ? type : 5;  // jshint ignore:line
}

Piece.prototype.getType = function () {
    return Cell.prototype.types[this.type];  // jshint ignore:line
};

Piece.prototype.copy = function () {
    return new Piece(this.tetromino, {
        x: this.position.x,
        y: this.position.y
    }, this.rotation, this.type);
};

Piece.prototype.equals = function (piece) {
    return piece.type === this.type && this.position.x === piece.position.x &&
        this.position.y === piece.position.y && this.rotation === piece.rotation;
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
        });
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
    var collided = false;
    for (var i = 0; i < cells.length; i++) {
        if (this.collidesWithCell(cells[i])) {
            collided = true;
        }
    }
    return collided;
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
    var pieceCanMove = {
        x: this.position.x + newPosition.x,
        y: this.position.y + newPosition.y
    };
    this.cells().map(function (cell) {
        if (!cell.canMove(currentBoard, newPosition)) {
            pieceCanMove = false;
        }
    });
    return pieceCanMove;
};

Piece.prototype.canMoveDown = function (currentBoard) {
    return this.canMove(currentBoard, {
        x: 0,
        y: 1
    });
};

Piece.prototype.canRotate = function (currentBoard, newRotation) {
    var canRotate = true;
    var oldRotation = this.rotation;
    this.rotation = newRotation;
    this.cells().map(function (cell) {
        var canAdd = currentBoard.canAddCell(cell);
        if (!canAdd) {
            canRotate = false;
        }
    });
    this.rotation = oldRotation;
    return canRotate;
};

Piece.prototype.dropPiece = function (currentBoard) {
    var curPosy = this.position.y;
    while (this.movePieceDown(currentBoard)) {};
    return this.position.y === curPosy;  // jshint ignore:line
};

Piece.prototype.ghost = function (currentBoard) {
    var ghostCopy = this.copy();
    ghostCopy.type = 0;
    ghostCopy.dropPiece(currentBoard);
    return ghostCopy;
};

Piece.prototype.cells = function () {
    var currentCells = [];
    var startingPos = this.position;
    var color = this.color();
    var name = this.name();
    var type = this.type;
    this.tetromino.cells[this.rotation].map(function (row, celly) {
        row.map(function (cell, cellx) {
            if (cell) {
                var cellToAdd = new Cell(cellx + startingPos.x, celly + startingPos.y, color, name, type);  // jshint ignore:line
                currentCells.push(cellToAdd);
            }
        });
    });
    return currentCells;
};

Piece.prototype.cells2d = function () {
    var currentCells = [];
    var startingPos = this.position;
    var color = this.color();
    var name = this.name();
    var type = this.type;
    this.tetromino.cells[this.rotation].map(function (row, celly) {
        currentCells[celly] = [];
        row.map(function (cell, cellx) {
            var cellToAdd = new Cell(cellx + startingPos.x, celly + startingPos.y, color, name, cell ? type : 5);
            currentCells[celly].push(cellToAdd);

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
    if (newRotation > this.tetromino.cells.length - 1) {
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

Piece.prototype.fromJson = function (jsonPiece) {
    if (jsonPiece.tetromino === undefined) {
        jsonPiece = JSON.parse(jsonPiece);
    }
    if (jsonPiece) {
        this.tetromino = jsonPiece.tetromino;
        this.rotation = jsonPiece.rotation;
        this.position = {
            x: jsonPiece.position.x,
            y: jsonPiece.position.y
        };
        this.type = jsonPiece.type;
        return this;
    } else {
        return false;
    }
};