//pieceEngine.js relies on cellEngine.js,pieces.json, and boardEngine.js
"use strict";
function PieceEngine() {  // jshint ignore:line
    this.rand = function () {
        var aRandPiece = new Piece(this.shuffledPieces.pop(), {
            x: 3,
            y: 0
        }, 0, 6);
        return aRandPiece;
    };

    this.draw = function () {
        while (this.que.length < 7) {
            if (this.shuffledPieces.length === 0) {
                this.shuffledPieces = this.shuffle(allTetromino);  // jshint ignore:line
            }
            this.que.unshift(this.rand());
        }
        var drawnPiece = this.que.pop();
        drawnPiece.type = 1;
        return drawnPiece;
    };

    this.fromHeld = function (heldPiece) {
        return new Piece(heldPiece.tetromino, {x:3,y:0},0,1);
    }

    this.shuffle = function (array) { //v1.0
        array = array.slice(0);
        var currentIndex = array.length,
            temporaryValue, randomIndex;
        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;

    };
    this.shuffledPieces = allTetromino.slice(0);  // jshint ignore:line
    this.que = [];

    this.shuffle(this.shuffledPieces);
    for (var i = 0; i < this.shuffledPieces.length; i++) {
        this.que.push(new Piece(this.shuffledPieces[i]));
    }
    this.shuffle(this.shuffledPieces);
    this.Piece = Piece;

    return this;
}
