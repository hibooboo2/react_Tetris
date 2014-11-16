function Cell(x, y, color, name, occupied, currentPiece) {
    this.x = x ? x : 0;
    this.y = y ? y : 0;
    this.color = color ? color : "pink";
    this.name = name ? name : "Pinky";
    this.occupied = occupied ? occupied : false;
    this.currentPiece = currentPiece ? currentPiece : false;
}

Cell.prototype.equals = function (cell) {
    return this.x === cell.x && this.y === cell.y && this.color === cell.color && this.name === cell.name && this.occupied === cell.occupied;
};
Cell.prototype.copy = function () {
    return {
        x: this.x,
        y: this.y,
        color: this.color,
        name: this.name,
        occupied: this.occupied,
        currentPiece:this.currentPiece
    };
};
Cell.prototype.collides = function (cell) {
    return this.x === cell.x && this.y === cell.y;
};
Cell.prototype.canMove = function (currentBoard, newPosition) {
    var canMove = true;
    if (this.y + newPosition.y > 21 || this.x + newPosition.x > 9) {
        canMove = false;
    } else {
        if (!(currentBoard[this.y + newPosition.y] && currentBoard[this.y + newPosition.y][this.x + newPosition.x])) {
            canMove = false;
        }
        if (canMove && currentBoard[this.y + newPosition.y][this.x + newPosition.x].occupied === true && !currentBoard[this.y + newPosition.y][this.x + newPosition.x].currentPiece) {
            console.log("Cell can't move: x: " + (newPosition.x) + " y: " + (newPosition.y));
            console.log(currentBoard[this.y + newPosition.y][this.x + newPosition.x]);
            canMove = false;
        }
    }
    return canMove;
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
