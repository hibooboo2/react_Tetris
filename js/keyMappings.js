var keyMappings = function () {
    var codeToKey = {
        65: "a",
        68: "d",
        83: "s",
        87: "w",
        37: "Left",
        39: "Right",
        40: "Down",
        38: "Up",
        32: "Space",
        13: "Enter",
        16: "Shift",
        192: "`"
    };
    var remapToDefaultKeys = {
        keys: {
            87: {
                function: "dropFallingPiece",
                english: "Drop Current Piece."
            },
            83: {
                function: "moveFallingDown",
                english: "Soft Drop Current Piece"
            },
            39: {
                function: "rotateFallingClockWise",
                english: "Rotate Piece ClockWise"
            },
            37: {
                function: "rotateFallingCounterClockWise",
                english: "Rotate Piece CounterClockWise"
            },
            68: {
                function: "shiftFallingRight",
                english: "Shift Piece Right"
            },
            65: {
                function: "shiftFallingLeft",
                english: "Shift Piece Left"
            },
            16: {
                function: "holdPiece",
                english: "Hold Current Piece For Later"
            },
            13: {
                function: "restart",
                english: "Restart Game"
            },
            32: {
                function: "pause",
                english: "Pause Game"
            },
            readableLine: function (key) {
                var readable;
                if(this[key]!==undefined){
                   readable = codeToKey[key] + " = " + this[key].english;
                }
                return readable;
            },
            readableLines: function () {
                var lines = [];
                for (var i = 0;i < 200;i++){
                    if(this.readableLine(i)){
                        lines.push(this.readableLine(i));
                    }
                }
                return lines;
            }
        },
    };
    var remapToArrowKeys = {
        keys: {
            40: {
                function: "moveFallingDown",
                english: "Soft Drop Current Piece"
            },
            38: {
                function: "rotateFallingClockWise",
                english: "Rotate Piece ClockWise"
            },
            39: {
                function: "shiftFallingRight",
                english: "Shift Piece Right"
            },
            37: {
                function: "shiftFallingLeft",
                english: "Shift Piece Left"
            },
            16: {
                function: "holdPiece",
                english: "Hold Current Piece For Later"
            },
            13: {
                function: "restart",
                english: "Restart Game"
            },
            32: {
                function: "pause",
                english: "Pause Game"
            },
            readableLine: function (key) {
                return codeToKey[key] + " = " + this[key].english;
            }
        },
    };
    return {
        default: remapToDefaultKeys,
        arrows: remapToArrowKeys
    };
};
