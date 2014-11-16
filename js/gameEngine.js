var gameEngine = {
    newGame: function () {
        var x = {};
        x.boardEngine = new BoardEngine();
        x.gameOver = false;
        x.justHeld = false;
        x.level = 0;
        x.fallingPiece = new Piece().draw();
        x.heldPiece = false;
        x.board = x.boardEngine.getCurrentBoard;
        x.addPiece = x.boardEngine.addPiece;
        x.newFallingPiece = function(){
            x.fallingPiece = new Piece().draw();
            x.justHeld = false;
        }
        x.holdPiece = function () {
            if (!x.justHeld) {
                var previousHeld = x.heldPiece;
                x.heldPiece = x.fallingPiece.tetromino;
                if(previousHeld){
                    x.fallingPiece = new Piece(previousHeld);
                }else{
                    x.newFallingPiece();
                }
                x.justHeld = true;
            }
        };
        x.clearLines = x.boardEngine.clearLines;
        return x;
    }
};
