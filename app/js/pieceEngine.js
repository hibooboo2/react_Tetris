//pieceEngine.js relys on cellEngine.js,pieces.json, and boardEngine.js
function PieceEngine() {

    function newPiece(tetromino, position, rotation, type) {
        "use strict";
        this.tetromino = tetromino ? tetromino : allTetromino[0];
        this.rotation = rotation ? rotation : 0;
        this.position = position ? position : {
            x: 3,
            y: 0
        };
        this.type = type ? type : 5;
    };

    this.newPiece = newPiece;

    this.newPiece.prototype.getType = function () {
        return Cell.prototype.types[this.type];
    };

    this.newPiece.prototype.copy = function () {
        return new newPiece(this.tetromino, {
            x: this.position.x,
            y: this.position.y
        }, this.rotation, this.type);
    };

    this.newPiece.prototype.equals = function (piece) {
        return piece.type === this.type && this.position.x === piece.position.x && this.position.y === piece.position.y && this.rotation === piece.rotation;
    };

    this.newPiece.prototype.name = function () {
        return this.tetromino.name;
    };

    this.newPiece.prototype.color = function () {
        return this.tetromino.color;
    };

    this.newPiece.prototype.collides = function (piece) {
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

    this.newPiece.prototype.collidesWithCell = function (cellToCheck) {
        var collides = false;
        this.cells().map(function (cell) {
            if (cell.collides(cellToCheck)) {
                collides = true;
            }
        });
        return collides;
    };

    this.newPiece.prototype.collidesWithCells = function (cells) {
        var collided = false;
        for (var i = 0; i < cells.length; i++) {
            if (this.collidesWithCell(cells[i])) {
                collided = true;
            }
        }
        return collided;
    };

    this.newPiece.prototype.movePiece = function (currentBoard, newPostion) {
        var moved = false;
        if (this.canMove(currentBoard, newPostion)) {
            this.position.y += newPostion.y;
            this.position.x += newPostion.x;
            moved = true;
        }
        return moved;
    };

    this.newPiece.prototype.movePieceDown = function (currentBoard) {
        var newPostion = {
            x: 0,
            y: 1
        };
        return this.movePiece(currentBoard, newPostion);
    };

    this.newPiece.prototype.canMove = function (currentBoard, newPosition) {
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

    this.newPiece.prototype.canMoveDown = function (currentBoard) {
        return this.canMove(currentBoard, {
            x: 0,
            y: 1
        });
    };

    this.newPiece.prototype.canRotate = function (currentBoard, newRotation) {
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

    this.newPiece.prototype.dropPiece = function (currentBoard) {
        var curPosy = this.position.y;
        var curPosx = this.position.x;
        while (this.movePieceDown(currentBoard)) {}
        return this.position.y === curPosy;
    };

    this.newPiece.prototype.ghost = function (currentBoard) {
        var ghostCopy = this.copy();
        ghostCopy.type = 0;
        ghostCopy.dropPiece(currentBoard);
        return ghostCopy;
    };

    this.newPiece.prototype.cells = function () {
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

    this.newPiece.prototype.cells2d = function () {
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

    this.newPiece.prototype.shiftLeft = function (currentBoard) {
        var newPostion = {
            x: -1,
            y: 0
        };
        return this.movePiece(currentBoard, newPostion);
    };

    this.newPiece.prototype.shiftRight = function (currentBoard) {
        var newPostion = {
            x: 1,
            y: 0
        };
        return this.movePiece(currentBoard, newPostion);
    };

    this.newPiece.prototype.rotateClockWise = function (currentBoard) {
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

    this.newPiece.prototype.rotateCounterClockWise = function (currentBoard) {
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

    this.rand = function () {
        var aRandPiece = new this.newPiece(this.shuffledPieces.pop(), {
            x: 3,
            y: 0
        }, 0, 6);
        return aRandPiece;
    };

    this.draw = function () {
        while (this.que.length < 7) {
            if (this.shuffledPieces.length === 0) {
                this.shuffledPieces = this.shuffle(allTetromino);
            }
            this.que.unshift(this.rand());
        }
        var drawnPiece = this.que.pop();
        drawnPiece.type = 1;
        return drawnPiece;
    };

    this.shuffle = function (array) { //v1.0
        array = array.slice(0);
        var currentIndex = array.length,
            temporaryValue, randomIndex;
        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;

    };

    this.shuffledPieces = allTetromino.slice();

    this.shuffle(this.shuffledPieces);
    this.que = [];
    for (var i = 0; i < this.shuffledPieces.length; i++) {
        this.que.push(new this.newPiece(this.shuffledPieces[i]));
    };

    this.newPiece.prototype.fromJson = function (jsonPiece) {
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

    return this;
}
