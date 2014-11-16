// cellEngine.js relies on pieceEngine.js and boardEngine.js
function Cell(x, y, color, name, type) {
    this.x = x ? x : 0;
    this.y = y ? y : 0;
    this.color = color ? color : "lightgrey";
    this.name = name ? name : "empty";
    this.type = type ? type : 3;
}

Cell.prototype.types = ["ghost", "moving", "placed", "default", "offMap"];

Cell.prototype.equals = function (cell) {
    return this.x === cell.x && this.y === cell.y && this.color === cell.color && this.name === cell.name && this.type === cell.type;
};

Cell.prototype.getType = function () {
    return Cell.prototype.types[this.type];
};

Cell.prototype.copy = function () {
    return new Cell(this.x, this.y, this.color, this.name, this.type);
};

Cell.prototype.collides = function (cell) {
    return this.x === cell.x && this.y === cell.y && cell.type === 2;
};

Cell.prototype.canMove = function (currentBoard, newPosition) {
    var newCell = this.copy();
    newCell.y += newPosition.y;
    newCell.x += newPosition.x;
    // See if the new cell collides on the board.
    var boardCell = currentBoard.getCell(newCell);
//    console.log("Cell requested: "+newCell.x+" "+newCell.y);
//    console.log(boardCell);
    return boardCell.type !== 2 && boardCell.type !== 4 && currentBoard.cellOnBoard(newCell);
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
