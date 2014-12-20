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
            useGhost: true,
            canPreview: true,
            fullScreen: false,
            announcer: true
        };
        this.gameOver = false;
        this.justHeld = false;
        this.score = new Score();
        this.fallingPiece = false;
        this.heldPiece = false;
        this.started = false;
        this.useAutoSave = false;
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
        if (this.fallingPiece) {
            this.fallingPiece.cells().map(function (cell) {
                board[cell.y][cell.x] = cell.copy();
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
            cellToReturn.type = 3;
        }

        return cellToReturn;
    };


    Board.prototype.canAddCell = function (cell) {
        var cellToUse = this.getCell(cell);
        return this.cellOnBoard(cell) && cellToUse.type !== 4 && cell.collides(cellToUse) && cellToUse.type === 3;
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
                row[j] = new Cell(0, j, "lightgrey", "empty", 3);
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
        if (occupiedRows.length > 0) {
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
                this.fallingPiece = new this.pieceEngine.newPiece(previousHeld,{
                    x: 3,
                    y: 0
                }, 0, 1);
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
        if (moved) {
            this.score.didScore(5);
        }
        return moved;
    };
    Board.prototype.restart = function () {
        this.newBoard();
        this.gameOver = false;
        this.justHeld = false;
        this.level = 0;
        this.fallingPiece = false;
        this.heldPiece = false;
        this.score = new Score();
        this.started = false;
    };
    Board.prototype.newBoard = function () {
        for (var i = 0; i < this.height; i++) {
            this.usedCells[i] = [];
            for (var j = 0; j < this.width; j++) {
                this.usedCells[i][j] = new Cell(j, i, "lightgrey", "empty", 3);
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
    Board.prototype.fromJson = function (previousBoardJSON) {
        previousBoardJSON = JSON.parse(previousBoardJSON);
        this.height = previousBoardJSON.height;
        this.width = previousBoardJSON.width;
        this.usedCells = previousBoardJSON.usedCells.map(function (row) {
            return row.map(function (cell) {
                return new Cell().fromJson(cell);
            });
        });
        this.settings = {
            canHold: previousBoardJSON.settings.canHold,
            useGhost: previousBoardJSON.settings.useGhost,
            canPreview: previousBoardJSON.settings.canPreview,
            fullScreen: previousBoardJSON.settings.fullScreen,
            announcer: previousBoardJSON.settings.announcer
        };
        this.gameOver = previousBoardJSON.gameOver;
        this.justHeld = previousBoardJSON.justHeld;
        this.score = new Score().fromJson(previousBoardJSON.score);
        this.fallingPiece = new Piece().fromJson(previousBoardJSON.fallingPiece);
        this.heldPiece = previousBoardJSON.heldPiece;
        this.started = previousBoardJSON.started;
        this.useAutoSave = previousBoardJSON.useAutoSave;
        return this;
    }
    return Board;
}();
