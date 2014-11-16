//BoardEngine Depends on a pieceEngine.js and cellEngine.js

// BoardEngine(pieceEngine,cellEngine) will return a new Board.
var A = new function () {
    function Board() {
        this.height = 22;
        this.width = 10;
        this.usedCells = [];
        this.gameOver = false;
        this.justHeld = false;
        this.level = 0;
        this.fallingPiece = new Piece().draw();
        this.heldPiece = false;
    }
    //Get a 2d array of the usedCells for mapping.
    Board.prototype.getCurrentBoard = function () {
        var board = [[]];
        for (var i = 0; i < 22; i++) {
            board[i] = [];
            for (var j = 0; j < 10; j++) {
                board[i][j] = this.getCell(new Cell(j, i));
            }
        }
        this.usedCells.map(function (cell) {
            board[cell.y][cell.x] = cell;
        });
        this.fallingPiece.cells().map(function (cell) {
            board[cell.y][cell.x] = cell;
        });
        return board;
    };
    //Get one and only one cell with provided x and y.
    Board.prototype.getCell = function (cellGiven) {
        var matchedCells = this.usedCells.filter(function (cell) {
            return cell.x === cellGiven.x && cell.y === cellGiven.y;
        });
        return matchedCells.length === 1 ? matchedCells[0] : new Cell(cellGiven.x, cellGiven.y);
    };
    //Returns the cells where a piece would be located if placed.
    Board.prototype.getPieceCells = function (piece) {
        return piece.cells().map(function (cell) {
            return this.getCell(cell.x, cell.y);
        });
    };
    //Clears all Lines that are full.
    Board.prototype.clearLines = function () {
        console.log("Clear Lines");
        /*
    var blankRow = function () {
            var row = [];
            for (var j = 0; j < 10; j++) {
                row[j] = new Cell(0, j);
            }
            return row;
        }
    var occupiedRows = []
    x.cellsUsed.map(function (row, rowIndex) {
        var allOccupied = true;
        row.map(function (cell) {
            if (cell.type !== 2) {
                allOccupied = false;
            }
        });
        if (allOccupied) {
            occupiedRows.push(rowIndex);
        }
        return allOccupied;
    });
    if (occupiedRows.length > 0) {
        occupiedRows.map(function (rowToRemove) {
            x.cellsUsed.splice(rowToRemove, 1);
            x.level -= 1;
            x.cellsUsed.unshift(blankRow());
        });
        x.cellsUsed.map(function (row, y) {
            row.map(function (cell, x) {
                cell.x = x;
                cell.y = y;
            });
        });
    }*/
    };
    //Takes A defined Piece and adds it if it can be placed;
    Board.prototype.addPiece = function (piece) {
        var added = false;
        if (this.canAddPiece(piece)) {
            piece.cells().map(function (cell) {
                var newCell = cell.copy();
                cell.type = 2;
                this.cellsUsed.push(cell);
            });
            added = true;
        }
        return added;
    };
    //Takes a piece and tells you if it can be added;
    Board.prototype.canAddPiece = function (piece) {
        var pieceCells = this.getPieceCells(piece);
        return !piece.collidesWithCells(pieceCells);
    };

    Board.prototype.holdPiece = function () {
        if (!this.justHeld) {
            var previousHeld = this.heldPiece;
            this.heldPiece = this.fallingPiece.tetromino;
            if (previousHeld) {
                this.fallingPiece = new Piece(previousHeld);
            } else {
                this.newFallingPiece();
            }
            this.justHeld = true;
        }
    };

    Board.prototype.newFallingPiece = function () {
        this.fallingPiece = new Piece().draw();
        this.justHeld = false;
    };

    Board.prototype.dropFallingPiece = function () {
        return this.fallingPiece.dropPiece(this);
    };
    Board.prototype.rotateFallingClockWise = function () {
        return this.fallingPiece.rotateClockWise(this);
    };
    Board.prototype.rotateFallingCounterClockWise = function () {
        return this.fallingPiece.rotateCounterClockWise(this);
    };
    Board.prototype.shiftFallingLeft = function () {
        console.log(this.fallingPiece);
        console.log(this);
        return this.fallingPiece.shiftLeft(this);
    };
    Board.prototype.shiftFallingRight = function () {
        return this.fallingPiece.shiftRight(this);
    };
    Board.prototype.moveFallingDown = function () {
        return this.fallingPiece.movePieceDown(this);
    };
    return new Board();
}();
