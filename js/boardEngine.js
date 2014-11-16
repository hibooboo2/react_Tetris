//BoardEngine Depends on a pieceEngine.js and cellEngine.js

// new BoardEngine() will return a new Board.
var BoardEngine = function () {
        this.height = 22;
        this.width = 10;
        this.usedCells = [];
    }
    //Get a 2d array of the usedCells for mapping.
BoardEngine.prototype.getCurrentBoard = function () {
    var board = [[]];
    for (var i = 0; i < 22; i++) {
        board[i] = [];
        for (var j = 0; j < 10; j++) {
            var newCell = new Cell(j, i);
            board[i][j] = this.getCell(j, i);
        }
    }
    this.usedCells.map(function (cell) {
        board[cell.y][cell.x] = cell;
    });
    return board;
}

//Get one and only one cell with provided x and y.
BoardEngine.prototype.getCell = function (cellGiven) {
    var matchedCells = this.usedCells.filter(function (cell) {
        return cell.x === cellGiven.x && cell.y === cellGiven.y;
    });
    return matchedCells.length === 1 ? matchedCells[0] : new Cell(x, y);
}
//Returns the cells where a piece would be located if placed.
BoardEngine.prototype.getPieceCells = function (piece) {
    return piece.cells().map(this.getCell);
};
//Clears all Lines that are full.
BoardEngine.prototype.clearLines = function () {
    console.log("Clear Lines");
}
//Takes A defined Piece and adds it if it can be placed;
BoardEngine.prototype.addPiece = function (piece) {
    var added = false;
    if (this.canAddPiece(piece)) {
        piece.cells().map(function (cell) {
            cell.type = 2;
            this.cellsUsed.push(cell);
        });
        added = true;
    }
    return added;
}
//Takes a piece and tells you if it can be added;
BoardEngine.prototype.canAddPiece = function (piece) {
    var pieceCells = this.getPieceCells(piece);
    return !piece.collidesWithCells(pieceCells);
}
