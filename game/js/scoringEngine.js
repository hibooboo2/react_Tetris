var Score = function () {
    "use strict";
    this.level = 0;
    this._score = 0;
    this.linesCleared = 0;
    this.singles = 0;
    this.doubles = 0;
    this.triples = 0;
    this.tetrises = 0;
    this.comboCount = 0;
    this.lastCleared = 0;
    this.gameOver = false;
};


Score.prototype.linesToScore = ["hardDrop", "single", "double", "triple", "tetris", "softDrop"];
Score.prototype._gameOver = function(){
    "use strict";
    if (this.gameOver){
        throw "GameOver";
    }
    return false;
}

Score.prototype.single = function () {
    if (!this._gameOver()) {
        this._score += 100 * (this.level + 1);
        this.singles += 1;
    }
};
Score.prototype.double = function () {
    if (!this._gameOver()) {
        this._score += 300 * (this.level + 1);
        this.doubles += 1;
    }
};
Score.prototype.triple = function () {
    if (!this._gameOver){
        this._score += 500 * (this.level + 1);
        this.triples += 1;
    }
};
Score.prototype.tetris = function () {
    if (!this._gameOver()) {
        this._score += 800 * (this.level + 1);
        this.tetrises += 1;
    }
};
Score.prototype.combo = function () {
    if (!this._gameOver()) {
        this._score += 50 * this.comboCount * this.level;
        this.comboCount += 1;
    }
};
Score.prototype.softDrop = function () {
    if (!this._gameOver()) {
        this._score += 1 * (this.level + 1);
    }
};
Score.prototype.hardDrop = function (cellsDropped) {
    if (!this._gameOver()) {
        var scoreToAdd = (2 * (this.level + 1) * (cellsDropped + 1)) + 20;
        this._score += scoreToAdd;
    }
};
Score.prototype.levelUp = function (lines) {
    if (!this._gameOver()) {
        this.lastCleared += lines;
        if (this.lastCleared >= this.levelUpFactor().lines || (lines === 4 && this.lastCleared >= this.levelUpFactor().tetris)) {
            this.lastCleared = 0;
            this.level += 1;
        }
    }
};
Score.prototype.levelUpFactor = function () {
    return {
        lines: (this.level / 2) * 5,
        tetris: (((this.level / 2) * 2))
    };
};
Score.prototype.nextLevelUp = function () {
    return {
        linesToLevelUp: this.lastCleared + " / " + this.levelUpFactor().lines,
        linesFromTetris: this.lastCleared >= this.levelUpFactor().tetris
    };
};
Score.prototype.getValue = function () {
    return this._score;
};
Score.prototype.getDelay = function () {
    return 800 - (this.level * 50);
};
Score.prototype.getPlaybackRate = function () {
    return 0.113 * this.level + 0.8;
};
Score.prototype.didScore = function (lines) {
    if (!this._gameOver()) {
        this.linesCleared += lines !== 5 ? lines : 0;
        this.levelUp(lines !== 5 ? lines : 0);
        this[Score.prototype.linesToScore[lines]](lines);
    }
};
Score.prototype.fromJson = function (previousScore) {
    if (previousScore.level === undefined) {
        previousScore = JSON.parse(previousScore);
    }
    this.level = previousScore.level;
    this._score = previousScore.score;
    this.linesCleared = previousScore.linesCleared;
    this.singles = previousScore.singles;
    this.doubles = previousScore.doubles;
    this.triples = previousScore.triples;
    this.tetrises = previousScore.tetrises;
    this.comboCount = previousScore.comboCount;
    this.lastCleared = previousScore.lastCleared;
    return this;
};
