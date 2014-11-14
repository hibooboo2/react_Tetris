var gameEngine = {
    newGame: function () {
        var x = {};
        x.gameOver = false;
        x.currentPiece = randPiece();
        x.heldPiece = null;
        x.cellsUsed = [[]];
        for (var i = 0; i < 22; i++) {
            x.cellsUsed[i] = [];
            for (var j = 0; j < 10; j++) {
                x.cellsUsed[i][j] = new Cell(j, i, "lightgrey", "empty", false);
            }
        }
        x.board = function () {
            var currentBoard = x.cellsUsed.map(function (row) {
                return row.map(function (cell) {
                    return cell.copy();
                })
            });
            if (x.currentPiece) {
                x.currentPiece.cells().map(function (cell) {
                    if (0 <= cell.y <= 21 && 0 <= cell.x <= 9) {
                        currentBoard[cell.y][cell.x] = cell;
                        cell.currentPiece = true;
                    }
                });
            }
            return currentBoard;
        };
        x.addPiece = function (piece) {
            var collides = false;
            console.log("In Add Piece:");
            console.log(piece);
            var collided = piece.cells().filter(function (cell) {
                var doCollide = false;
                if (x.cellsUsed[cell.x] && x.cellsUsed[cell.x][cell.y]) {
                    doCollide = cell.collides(x.cellsUsed[cell.x][cell.y]);
                } else {
                    console.log("Cell Not Defined");
                }
                return doCollide;
            });
            if (collided.length < 1) {
                piece.cells().map(function (cell) {
                    if (!x.cellsUsed[cell.y]) {
                        x.cellsUsed[cell.y] = [];
                    }
                    x.cellsUsed[cell.y][cell.x] = cell;
                });
            }
            if (piece.equals(x.currentPiece)) {
                x.currentPiece = randPiece();
            }
            if (collided.length > 0) {
                //x.gameOver = true;
            }
            console.log("Collided Cells:" + collided.length);
            x.clearLines();
            return this;
        };
        x.clearLines = function () {
            var occupiedRows = []
            var randCell = new Cell();
            randCell.occupied = true;
            x.cellsUsed.map(function (row, rowIndex) {
                console.log("row:");
                console.log(row);
                var allOccupied = true;
                row.map(function (cell) {
                    if (!cell.occupied) {
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
                    x.cellsUsed.unshift(x.blankRow());
                });
                x.cellsUsed.map(function (row, y) {
                    row.map(function (cell, x) {
                        cell.x = x;
                        cell.y = y;
                    });
                });
            }
        }
        x.blankRow = function () {
            var row = [];
            for (var j = 0; j < 10; j++) {
                row[j] = new Cell(0, j, "lightgrey", "empty", false);
            }
            return row;
        }
        return x;
    }
};
