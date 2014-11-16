//BoardEngine Depends on a pieceEngine.js and cellEngine.js

// BoardEngine() will return a new Board.
var boardEngine = function () {
    function Board() {
        this.height = 22;
        this.width = 10;
        this.usedCells = [[]];
        for (var i = 0; i < this.height; i++) {
            this.usedCells[i] = [];
            for (var j = 0; j < this.width; j++) {
                this.usedCells[i][j] = new Cell(j, i);
            }
        }
        this.gameOver = false;
        this.justHeld = false;
        this.level = 0;
        this.fallingPiece = new Piece().draw();
        this.heldPiece = false;
    }
    //Get a 2d array of the usedCells for mapping.
    Board.prototype.getCurrentBoard = function () {
        var board = [[]];
        for (var i = 0; i < this.height; i++) {
            board[i] = [];
            for (var j = 0; j < this.width; j++) {
                board[i][j] = this.usedCells[i][j].copy();
            }
        }
        this.fallingPiece.cells().map(function (cell) {
            board[cell.y][cell.x] = cell.copy();
            board[cell.y][cell.x].type = 1;
        });
        //        var ghostPiece = this.fallingPiece.copy();
        //        ghostPiece.dropPiece(this);
        //        ghostPiece.cells().map(function (cell) {
        //            board[cell.y][cell.x] = cell.copy();
        //            board[cell.y][cell.x].type = 0;
        //        });

        return board;
    };
    //Get one and only one cell with provided x and y.
    Board.prototype.getCell = function (cellGiven) {
        var cellToReturn = null;
        if (this.cellOnBoard(cellGiven)) {
            cellToReturn = this.usedCells[cellGiven.y][cellGiven.x].copy();
        } else {
            cellToReturn = new Cell(cellGiven.x, cellGiven.y);
            cellToReturn.type = 4;
            //            console.log("Cell Given: ");
            //            console.log(cellGiven);
            //            console.log("Returned: " + cellGiven.x + " " + cellGiven.y);
            //            console.log(cellToReturn);
        }

        return cellToReturn;
    };


    Board.prototype.canAddCell = function (cell) {
        return this.cellOnBoard(cell) && this.getCell(cell).type !== 4 && !cell.collides(this.getCell(cell));
    };
    Board.prototype.addCell = function (cell) {
        var added = false;
        if (this.canAddCell(cell)) {
            this.usedCells[cell.y][cell.x] = cell.copy();
            this.usedCells[cell.y][cell.x].type = 2;
            added = true;
        }
        return added;
    };
    //Returns the cells where a piece would be located if placed.
    Board.prototype.getPieceCells = function (piece) {
        var theOrigCells = piece.cells();
        var pieceCells = [];
        for (var i = 0; i < theOrigCells.length; i++) {
            pieceCells.push(this.getCell(theOrigCells[i]));
        }
        return pieceCells;
    };
    Board.prototype.cellOnBoard = function (cellGiven) {
        return cellGiven.x < this.width && cellGiven.y < this.height && cellGiven.x >= 0 && cellGiven.y >= 0;
    };
    //Clears all Lines that are full.
    Board.prototype.clearLines = function () {
        console.log("Clear Lines");

        var blankRow = function () {
            var row = [];
            for (var j = 0; j < 10; j++) {
                row[j] = new Cell(0, j);
            }
            return row;
        };
        var occupiedRows = [];
        this.usedCells.map(function (row, rowIndex) {
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
        for (var i = 0;i <occupiedRows.length; i++) {
            this.usedCells.splice(occupiedRows[i], 1);
            this.level -= 1;
            this.usedCells.unshift(blankRow());
            this.usedCells.map(function (row, y) {
                row.map(function (cell, x) {
                    cell.x = x;
                    cell.y = y;
                });
            });
        }
    };
    //Takes A defined Piece and adds it if it can be placed;
    Board.prototype.addPiece = function (piece) {
        var added = false;
        if (this.canAddPiece(piece)) {
            var pieceCells = piece.cells();
            for (var i = 0; i < pieceCells.length; i++) {
                this.addCell(pieceCells[i]);
            }
            added = true;
        }
        if (piece.equals(this.fallingPiece)) {
            this.newFallingPiece();
        }
        if (!added){
            this.gameOver = true;
        }
        this.clearLines();
        return added;
    };
    //Takes a piece and tells you if it can be added;
    Board.prototype.canAddPiece = function (piece) {
        var canAddPiece = true;
        var pieceCells = this.getPieceCells(piece);
        for (var i = 0; i < pieceCells.length; i++) {
            if (!this.canAddCell(pieceCells[i])) {
                canAddPiece = false;
            }
        }
        return canAddPiece;
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
        this.fallingPiece.dropPiece(this);
        this.addPiece(this.fallingPiece);
        return true;
    };
    Board.prototype.rotateFallingClockWise = function () {
        return this.fallingPiece.rotateClockWise(this);
    };
    Board.prototype.rotateFallingCounterClockWise = function () {
        return this.fallingPiece.rotateCounterClockWise(this);
    };
    Board.prototype.shiftFallingLeft = function () {
        return this.fallingPiece.shiftLeft(this);
    };
    Board.prototype.shiftFallingRight = function () {
        return this.fallingPiece.shiftRight(this);
    };
    Board.prototype.moveFallingDown = function () {
        return this.fallingPiece.movePieceDown(this);
    };
    return Board;
}();
