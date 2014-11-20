var Score = function () {
    "use strict";
    this.level = 0;
    this.score = 0;
    this.linesCleared = 0;
    this.singles = 0;
    this.doubles = 0;
    this.triples = 0;
    this.tetrises = 0;
    this.comboCount = 0;
    this.lastCleared = 0;
};

Score.prototype.linesToScore = ["hardDrop", "single", "double", "triple", "tetris", "softDrop"];

Score.prototype.single = function () {
    this.score += 100 * (this.level + 1);
    this.singles += 1;
};
Score.prototype.double = function () {
    this.score += 300 * (this.level + 1);
    this.doubles += 1;
};
Score.prototype.triple = function () {
    this.score += 500 * (this.level + 1);
    this.triples += 1;
};
Score.prototype.tetris = function () {
    this.score += 800 * (this.level + 1);
    this.tetrises += 1;
};
Score.prototype.combo = function () {
    this.score += 50 * this.comboCount * this.level;
    this.comboCount += 1;
};
Score.prototype.softDrop = function () {
    this.score += 1 * (this.level + 1);
};
Score.prototype.hardDrop = function (cellsDropped) {
    var scoreToAdd = (2 * (this.level + 1) * (cellsDropped + 1)) + 20;
    this.score += scoreToAdd;
};
Score.prototype.levelUp = function (lines) {
    this.lastCleared += lines;
    if (this.lastCleared / (this.level / 2) >= 5 || (lines === 4 && this.lastCleared >= 20)) {
        this.lastCleared = 0;
        this.level += 1;
    }
};
Score.prototype.getScore = function () {
    return this.score;
};
Score.prototype.getDelay = function () {
    return 800 - (this.level * 50);
};
Score.prototype.didScore = function (lines) {
    console.log("Called Did score: " + lines);
    this.linesCleared += lines !== 5 ? lines : 0;
    console.log(lines !== 5 ? lines : 0);
    this.levelUp(lines !== 5 ? lines : 0);
    this[Score.prototype.linesToScore[lines]](lines);
};
