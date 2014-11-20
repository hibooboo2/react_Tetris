//BoardEngine Depends on a pieceEngine.js and cellEngine.js

// BoardEngine() will return a new Board.
var boardEngine = function () {
    "use strict";
    function Board() {
        this.height = 22;
        this.width = 10;
        this.usedCells = [[]];
        this.newBoard();
        this.settings = {
            canHold: true,
            useGhost: false,
            canPreview: true,
            fullScreen: false
        };
        this.gameOver = false;
        this.justHeld = false;
        this.score = new Score();
        this.fallingPiece = new Piece().draw();
        this.heldPiece = false;
    }
    //Get a 2d array of the usedCells for mapping.
    Board.prototype.getCurrentBoard = function () {
        var board = [];
        for (var i = 0; i < this.height; i++) {
            board[i] = [];
            for (var j = 0; j < this.width; j++) {
                board[i].push(this.usedCells[i][j].copy());
            }
        }
        this.fallingPiece.cells().map(function (cell) {
            board[cell.y][cell.x] = cell.copy();
        });
        if (this.settings.useGhost) {
            this.fallingPiece.cells().map(function (cell) {
                var newCell = cell.copy();
                newCell.type = 0;
                board[newCell.y][newCell.x] = newCell;
            });
        }
        return board;
    };
    //Get one and only one cell with provided x and y.
    Board.prototype.getCell = function (cellGiven) {
        var cellToReturn = null;
        if (this.cellOnBoard(cellGiven)) {
            cellToReturn = this.usedCells[cellGiven.y][cellGiven.x].copy();
        } else {
            cellToReturn = new Cell(cellGiven.x, cellGiven.y);
            cellToReturn.type = 5;
        }

        return cellToReturn;
    };


    Board.prototype.canAddCell = function (cell) {
        var cellToUse = this.getCell(cell);
        return this.cellOnBoard(cell) && cellToUse.type !== 4 && cell.collides(cellToUse) && cellToUse.type === 5;
    };
    Board.prototype.canAddCells = function (cells) {
        var cellsCanBeAdded = true;
        for (var i = 0; i < cells.length; i++) {
            if (!this.canAddCell(cells[i])) {
                cellsCanBeAdded = false;
            }
        }
        return cellsCanBeAdded;
    };
    Board.prototype.addCell = function (cell) {
        var added = false;
        if (this.canAddCell(cell)) {
            var cellCopy = cell.copy();
            cellCopy.type = 2;
            this.usedCells[cell.y][cell.x] = cellCopy;
            added = true;
        }
        return added;
    };
    Board.prototype.cellOnBoard = function (cellGiven) {
        return cellGiven.x < this.width && cellGiven.y < this.height && cellGiven.x >= 0 && cellGiven.y >= 0;
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
        this.clearLines();
        if (piece.equals(this.fallingPiece) && added) {
            this.newFallingPiece();
        }
        return added;
    };
    //Clears all Lines that are full.
    Board.prototype.clearLines = function () {
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
        if(occupiedRows.length>0){
            this.score.didScore(occupiedRows.length);
        }
        for (var i = 0; i < occupiedRows.length; i++) {
            this.usedCells.splice(occupiedRows[i], 1);
            this.usedCells.unshift(blankRow());
            this.usedCells.map(function (row, y) {
                row.map(function (cell, x) {
                    cell.x = x;
                    cell.y = y;
                });
            });
        }
    };
    //Takes a piece and tells you if it can be added;
    Board.prototype.canAddPiece = function (piece) {
        var pieceCells = piece.cells();
        return this.canAddCells(pieceCells);
    };

    Board.prototype.holdPiece = function () {
        if (!this.justHeld && this.settings.canHold) {
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
        if (!this.isGameOver()) {
            this.fallingPiece = new Piece().draw();
            this.justHeld = false;
            //this.ghostPiece = this.fallingPiece.ghost(this);
        }
    };

    Board.prototype.dropFallingPiece = function () {
        this.fallingPiece.dropPiece(this);
        this.addPiece(this.fallingPiece);
        this.score.didScore(0);
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
        var moved = this.fallingPiece.movePieceDown(this);
        if(moved){
            this.score.didScore(5);
        }
        return moved;
    };
    Board.prototype.restart = function () {
        this.newBoard();
        this.gameOver = false;
        this.justHeld = false;
        this.level = 0;
        this.fallingPiece = new Piece().draw();
        this.heldPiece = false;
        this.score = new Score();
    };
    Board.prototype.newBoard = function () {
        for (var i = 0; i < this.height; i++) {
            this.usedCells[i] = [];
            for (var j = 0; j < this.width; j++) {
                this.usedCells[i][j] = new Cell(j, i);
            }
        }
    };
    Board.prototype.getFallingPiece = function () {
        return this.fallingPiece;
    };
    Board.prototype.isGameOver = function () {
        var isGameOver = false;
        var rows = [this.usedCells[0], this.usedCells[1]];
        rows.map(function (row) {
            row.map(function (cell) {
                if (cell.type == 2) {
                    isGameOver = true;
                }
            });
        });
        if (isGameOver) {
            this.gameOver = isGameOver;
        }
        return isGameOver;
    };
    return Board;
}();
