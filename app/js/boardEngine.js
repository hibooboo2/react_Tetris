//BoardEngine Depends on a pieceEngine.js and cellEngine.js

// BoardEngine() will return a new Board.
var BoardEngine = function () {  // jshint ignore:line
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
            announcer: true,
            useAutoSave: false
        };
        this.gameOver = false;
        this.justHeld = false;
        this.score = new Score(); // jshint ignore:line
        this.fallingPiece = false;
        this.heldPiece = false;
        this.started = false;
        this.pieceEngine = new PieceEngine();  // jshint ignore:line
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
            if (this.settings.useGhost) {
                this.fallingPiece.ghost(this).cells().map(function (cell) {
                    board[cell.y][cell.x] = cell.copy();
                });
            }
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
            cellToReturn = new Cell(cellGiven.x, cellGiven.y);  // jshint ignore:line
            cellToReturn.type = 4;
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
                row[j] = new Cell(0, j, "lightgrey", "empty", 3);  // jshint ignore:line
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
            });  // jshint ignore:line
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
                }, 0, 6);
            } else {
                this.newFallingPiece();
            }
            this.justHeld = true;
        }
    };

    Board.prototype.newFallingPiece = function () {
        if (!this.isGameOver()) {
            this.fallingPiece = this.pieceEngine.draw();
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
        this.score = new Score();   // jshint ignore:line
        this.started = false;
    };
    Board.prototype.newBoard = function () {
        for (var i = 0; i < this.height; i++) {
            this.usedCells[i] = [];
            for (var j = 0; j < this.width; j++) {
                this.usedCells[i][j] = new Cell(j, i, "lightgrey", "empty", 3);  // jshint ignore:line
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
                if (cell.type === 2) {
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
                return new Cell().fromJson(cell);  // jshint ignore:line
            });
        });
        this.settings = {
            canHold: previousBoardJSON.settings.canHold,
            useGhost: previousBoardJSON.settings.useGhost,
            canPreview: previousBoardJSON.settings.canPreview,
            fullScreen: previousBoardJSON.settings.fullScreen,
            announcer: previousBoardJSON.settings.announcer,
            useAutoSave: previousBoardJSON.settings.useAutoSave
        };
        this.gameOver = previousBoardJSON.gameOver;
        this.justHeld = previousBoardJSON.justHeld;
        this.score = new Score().fromJson(previousBoardJSON.score);  // jshint ignore:line
        this.fallingPiece = new this.pieceEngine.newPiece().fromJson(previousBoardJSON.fallingPiece);
        this.heldPiece = previousBoardJSON.heldPiece;
        this.started = previousBoardJSON.started;
        return this;
    };
    return new Board();
};
