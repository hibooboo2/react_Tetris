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
    var functions = {
        drop: {
            function: "dropFallingPiece",
            english: "Drop Current Piece."
        },
        softDrop: {
            function: "moveFallingDown",
            english: "Soft Drop Current Piece"
        },
        rotateClockWise: {
            function: "rotateFallingClockWise",
            english: "Rotate Piece ClockWise"
        },
        rotateCounterClockWise: {

        },
        shiftRight: {
            function: "shiftFallingRight",
            english: "Shift Piece Right"
        },
        shiftLeft: {
            function: "shiftFallingLeft",
            english: "Shift Piece Left"
        },
        hold: {
            function: "holdPiece",
            english: "Hold Current Piece For Later"
        },
        restart: {
            function: "restart",
            english: "Restart Game"
        },
        pause: {
            function: "pause",
            english: "Play / Pause Game"
        },
        changeMapping: {
            function: "changeMapping",
            english: "Switch mapping between Arrows and wasd"
        }
    }
    var remapToDefaultKeys = {
        keys: {
            87: functions.drop,
            83: functions.softDrop,
            39: functions.rotateClockWise,
            37: functions.rotateCounterClockWise,
            68: functions.shiftRight,
            65: functions.shiftLeft,
            16: functions.hold,
            13: functions.restart,
            32: functions.pause,
            192: functions.changeMapping,
            readableLine: function (key) {
                var readable;
                if (this[key] !== undefined) {
                    readable = codeToKey[key] + " = " + this[key].english;
                }
                return readable;
            },
            readableLines: function () {
                var lines = [];
                for (var i = 0; i < 200; i++) {
                    if (this.readableLine(i)) {
                        lines.push(this.readableLine(i));
                    }
                }
                return lines;
            }
        },
    };
    var remapToArrowKeys = {
        keys: {
            40: functions.softDrop,
            38: functions.rotateClockWise,
            39: functions.shiftRight,
            37: functions.shiftLeft,
            16: functions.hold,
            13: functions.restart,
            32: functions.pause,
            192: functions.changeMapping,
            readableLine: function (key) {
                var readable;
                if (this[key] !== undefined) {
                    readable = codeToKey[key] + " = " + this[key].english;
                }
                return readable;
            },
            readableLines: function () {
                var lines = [];
                for (var i = 0; i < 200; i++) {
                    if (this.readableLine(i)) {
                        lines.push(this.readableLine(i));
                    }
                }
                return lines;
            }
        },
    };
    return {
        default: remapToDefaultKeys,
        arrows: remapToArrowKeys
    };
};
