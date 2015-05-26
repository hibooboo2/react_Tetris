// cellEngine.js relies on pieceEngine.js and boardEngine.js
var Cell = function (x, y, color, name, type) {
    "use strict";
    this.x = x ? x : 0;
    this.y = y ? y : 0;
    this.color = color ? color : "lightgrey";
    this.name = name ? name : "empty";
    this.type = type !== undefined ? type : 5;
};

Cell.prototype.types = ["ghost", "moving", "placed", "default", "offMap", "unused", "preview"];

Cell.prototype.equals = function (cell) {
    return this.x === cell.x && this.y === cell.y && this.color === cell.color && this.name === cell.name && this.type === cell.type;
};

Cell.prototype.getType = function () {
    return Cell.prototype.types[this.type];
};

Cell.prototype.copy = function () {
    var copy = new Cell(this.x, this.y, this.color, this.name, this.type);
    return copy;
};

Cell.prototype.collides = function (cell) {
    return this.x === cell.x && this.y === cell.y;
};

Cell.prototype.canMove = function (currentBoard, newPosition) {
    var newCell = this.copy();
    newCell.y += newPosition.y;
    newCell.x += newPosition.x;
    // See if the new cell collides on the board.
    return currentBoard.canAddCell(newCell);
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
Cell.prototype.fromJson = function (jsonCell) {
    if (jsonCell.x === undefined) {
        jsonCell = JSON.parse(jsonCell);
    }
    this.x = jsonCell.x;
    this.y = jsonCell.y;
    this.color = jsonCell.color;
    this.name = jsonCell.name;
    this.type = jsonCell.type;
    return this;
};
