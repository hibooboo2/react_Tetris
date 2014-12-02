if (window.location.host === "tetris.jamescarlharris.com") {

}
var GameBox = React.createClass({
    displayName: 'GameBox',
    getInitialState: function () {
        //var level = parseInt(prompt("Starting Level?",1));
        //this.props.gameState.score.level = level;
        if (window.localStorage.board !== null && window.localStorage.board !== undefined && window.localStorage.board !== "null") {
            console.log(window.localStorage.board);
            this.props.gameState = new boardEngine().fromJson(window.localStorage.board);
        }
        this.props.gameState.settings = window.localStorage.settings !== undefined ? JSON.parse(window.localStorage.settings) : {
            canHold: true,
            useGhost: true,
            canPreview: true,
            fullScreen: false,
            announcer: true,
            useAutoSave: false
        };
        var issues = "Not sure..";
        issues = loadIssuesNumber(issues);
        return {
            gameState: this.props.gameState,
            paused: true,
            issues: issues,
            keyMappings: this.props.keyMappings,
            keyMapping: this.props.keyMappings["default"],
            currentMap: "default",
            closeGameoverScreen: true,
        };
    },
    componentDidMount: function () {
        // componentDidMount is called by react when the component
        // has been rendered on the page. We can set the interval here:
        window.addEventListener('keydown', this.handleKeys);
        document.getElementById("TetrisSong").playbackRate = this.state.gameState.score.getPlaybackRate();
        this.autoGravity = setTimeout(this.gravity, this.state.gameState.score.getDelay());
    },

    componentWillUnmount: function () {
        // This method is called immediately before the component is removed
        // from the page and destroyed. We can clear the interval here:
        //clearInterval(this.autoGravity);
    },
    gravity: function () {
        this.autoGravity = setTimeout(this.gravity, this.state.gameState.score.getDelay());
        if (this.state.paused) {
            return;
        } else if (!this.state.gameState.gameOver) {
            if (this.state.gameState.fallingPiece) {
                if (!this.state.gameState.moveFallingDown()) {
                    if (this.state.gameState.settings.useAutoSave) {
                        window.localStorage.board = JSON.stringify(this.state.gameState);
                        console.log(window.localStorage.board);
                    } else {
                        window.localStorage.board = null;
                    }
                    this.state.gameState.dropFallingPiece();
                    document.getElementById("TetrisSong").playbackRate = this.state.gameState.score.getPlaybackRate();
                    this.playBlock(this.state.gameState.fallingPiece.name());
                } else {}
            }
        } else {
            this.state.closeGameoverScreen = false;
            this.pause();
        }
        this.setState({
            gameState: this.state.gameState,
            closeGameoverScreen: this.state.closeGameoverScreen
        });
    },
    pickAlevel: function () {
        var level = parseInt(prompt("Starting Level?"));
        this.state.gameState.restart();
        this.state.gameState.score.level = level;
        this.setState({
            gameState: this.state.gameState,
            paused: true
        });
    },
    restart: function () {
        if (confirm("Are You Sure You Want to Restart?")) {
            this.state.gameState.restart();
            this.setState({
                gameState: this.state.gameState,
                paused: true,
                closeGameoverScreen: true
            });
        }
    },
    changeMapping: function () {
        if (this.state.currentMap === "default") {
            this.state.currentMap = "arrows";
        } else {
            this.state.currentMap = "default";
        }
        this.state.keyMapping = this.state.keyMappings[this.state.currentMap];
    },
    pause: function () {
        if (this.state.gameState.gameOver && this.state.paused) {
            this.restart();
        }
        if (this.state.gameState.started) {
            this.state.paused = !this.state.paused;
        }
        window.localStorage.settings = JSON.stringify(this.state.gameState.settings);
        this.setState({
            paused: this.state.paused
        });
    },
    play: function () {
        this.state.paused = false;
        this.state.gameState.started = true;
        var newFalling = this.state.gameState.pieceEngine.draw();
        this.playBlock("FirstPiece", newFalling.name());
        gameState = this.state.gameState;
        if (this.state.gameState.settings.announcer) {
            setTimeout(function () {
                gameState.fallingPiece = newFalling;
            }, 8800);
        } else {
            gameState.fallingPiece = newFalling;
        }
        this.setState({
            paused: this.state.paused,
            gameState: this.state.gameState
        });
    },
    handleKeys: function (evt) {
        var currEvent = evt;
        var key = evt.keyCode;
        //console.log(key);
        if (evt instanceof KeyboardEvent) {
            if (!this.state.paused && this.state.gameState.fallingPiece && this.state.keyMapping.keys[key] !== undefined) {
                if (this.state.gameState[this.state.keyMapping.keys[key].function] !== undefined) {
                    this.state.gameState[this.state.keyMapping.keys[key].function]();
                    if (this.state.keyMapping.keys[key].function === "dropFallingPiece") {
                        this.playBlock(this.state.gameState.fallingPiece.name());
                    }
                } else {
                    this[this.state.keyMapping.keys[key].function]();
                }
            } else if (evt instanceof KeyboardEvent) {
                if (key === 32 || key === 13 || key === 192) {
                    this[this.state.keyMapping.keys[key].function]();
                }
            }
        }
        document.getElementById("TetrisSong").playbackRate = this.state.gameState.score.getPlaybackRate();
        this.setState({
            gameState: this.state.gameState,
            keyMapping: this.state.keyMapping,
            currentMap: this.state.currentMap
        });
    },
    toggleGhost: function () {
        this.state.gameState.settings.useGhost = !this.state.gameState.settings.useGhost;
        this.setState({
            gameState: this.state.gameState
        });
    },
    togglePreview: function () {
        this.state.gameState.settings.canPreview = !this.state.gameState.settings.canPreview;
        this.setState({
            gameState: this.state.gameState
        });
    },
    toggleHold: function () {
        this.state.gameState.settings.canHold = !this.state.gameState.settings.canHold;
        this.setState({
            gameState: this.state.gameState
        });
    },
    closeGameoverScreen: function () {
        this.state.closeGameoverScreen = true;
        this.setState({
            closeGameoverScreen: this.state.closeGameoverScreen
        });
    },
    togglefullScreen: function () {
        this.state.gameState.settings.fullScreen = !this.state.gameState.settings.fullScreen;
        if (this.state.gameState.settings.fullScreen) {
            document.getElementsByClassName("GameBox")[0].style.fontSize = (Math.floor(window.innerHeight / 50)) + "px";
        } else {
            document.getElementsByClassName("GameBox")[0].style.fontSize = "12px";
        }
        this.setState({
            gameState: this.state.gameState
        });
    },
    playBlock: function (pieceName, secondPiece) {
        var playBlock = this.playBlock;
        var godBlocks = {
            FirstPiece: {
                start: 3.7,
                end: 12.5
            },
            Tetris: {
                start: 76.5,
                end: 80.6
            },
            L: {
                start: 13,
                end: 14.4
            },
            I: {
                start: 110,
                end: 111.8
            },
            S: {
                start: 41,
                end: 42
            },
            Z: {
                start: 64.4,
                end: 66.3
            },
            O: {
                start: 19,
                end: 20.4
            },
            T: {
                start: 34,
                end: 35.4
            },
            J: {
                start: 27,
                end: 28.8
            }
        }
        var volume = 1;
        var announcer = this.state.gameState.settings.announcer;
        var playSegment = function (time) {
            var godSong = document.getElementById("GodSong");
            if (godSong && announcer) {
                godSong.currentTime = time.start;
                godSong.muted = false;
                godSong.volume = volume;
                godSong.play();
                setTimeout(function () {
                    if (pieceName !== "FirstPiece") {
                        godSong.pause();
                        godSong.muted = true;
                    } else {
                        godSong.pause();
                        godSong.muted = true;
                        playBlock(secondPiece);
                    }
                }, (time.end - time.start) * 1000);
            }
        }
        if (godBlocks[pieceName]) {
            playSegment(godBlocks[pieceName]);
        }
    },
    toggleAnnouncer: function () {
        this.state.gameState.settings.announcer = !this.state.gameState.settings.announcer;
        window.localStorage.announcer = this.state.gameState.settings.announcer;
        this.setState({
            gameState: this.state.gameState
        });
    },
    toggleAutoSave: function () {
        this.state.gameState.settings.useAutoSave = !this.state.gameState.settings.useAutoSave;
        this.setState({
            gameState: this.state.gameState
        });
    },
    drawPiece: function (aPiece) {
        return React.createElement(TetrisPiece, {
            piece: aPiece
        })
    },
    render: function () {
        var tempBoard = this.state.gameState.getCurrentBoard();
        tempBoard.shift();
        tempBoard.shift();
        var currentIssues = this.state.issues;
        currentIssues = currentIssues.map(function (issue) {
            return React.createElement("p", null, issue.title);
        });
        var positionCell = function (cell) {
            return {
                top: (2 * cell.y) + "em",
                left: (cell.x * 2) + "em",
                backgroundColor: cell.color
            };
        };
        var drawnBoard = React.createElement("div", {
                className: "cells"
            },
            tempBoard.map(function (row) {
                return row.map(function (cell) {
                    return React.createElement("div", {
                        className: "TetrisCell " + cell.getType(),
                        style: positionCell(cell)
                    });
                });
            }),
            React.createElement("p", null, "Total Lines cleared: ", this.state.gameState.score.linesCleared),
            React.createElement("p", null, "Next Level Up"),
            React.createElement("p", null, "From Lines Cleared = ", this.state.gameState.score.nextLevelUp().linesToLevelUp),
            React.createElement("p", {
                className: this.state.gameState.score.nextLevelUp().linesFromTetris ? "enabled" : "disabled"
            }, "Go for a tetris to Levelup!")
        );
        var drawnHeld = false
        if (this.state.gameState.heldPiece) {
            drawnHeld = React.createElement(TetrisPiece, {
                piece: new this.state.gameState.pieceEngine.newPiece(this.state.gameState.heldPiece, 0, 0, 6)
            });
        };
        return (
            React.createElement("div", {
                    className: "GameBox"
                },
                drawnBoard,
                React.createElement("div", {
                    className: "Controls"
                }),
                React.createElement("div", {
                        className: this.state.closeGameoverScreen ? "disabled" : "gameOver"
                    },
                    React.createElement("p", null, "Congratulations! "),
                    React.createElement("p", null, "You got to level ", this.state.gameState.score.level),
                    React.createElement("p", null, "Your Score was ", this.state.gameState.score.score),
                    React.createElement("p", null, "You Cleared ", this.state.gameState.score.linesCleared, " lines!"),
                    React.createElement("p", null, "You got ", this.state.gameState.score.singles, " Singles!"),
                    React.createElement("p", null, "You got ", this.state.gameState.score.doubles, " Doubles!"),
                    React.createElement("p", null, "You got ", this.state.gameState.score.triples, " Triples!"),
                    React.createElement("p", null, "You got ", this.state.gameState.score.tetrises, " Tetrises!"),
                    React.createElement("p", null, "Good Job!"),
                    React.createElement("input", {
                        onClick: this.closeGameoverScreen,
                        className: "button",
                        type: "button",
                        value: "Close"
                    })
                ),
                React.createElement("div", {
                        className: this.state.paused ? "pauseScreen" : "disabled"
                    },

                    React.createElement("p", {
                        onClick: this.state.gameState.started ? this.pause : this.play,
                        className: "pauseLabel " + (this.state.paused ? "paused" : "notPaused")
                    }, this.state.paused ? "Play" : "Pause"),
                    React.createElement("div", {
                            className: "keyMappings"
                        },
                        this.state.keyMapping.keys.readableLines().map(function (line) {
                            return React.createElement("p", {
                                className: "leftAlign"
                            }, line)
                        })
                    ),
                    React.createElement("div", null),
                    React.createElement("div", {
                            className: "Settings"
                        },
                        React.createElement("input", {
                            onClick: this.toggleAutoSave,
                            className: this.state.gameState.settings.useAutoSave ? "off" : "on",
                            type: "button",
                            value: "Auto Save"
                        }),
                        React.createElement("input", {
                            onClick: this.toggleGhost,
                            className: this.state.gameState.settings.useGhost ? "off" : "on",
                            type: "button",
                            value: "Ghost"
                        }),
                        React.createElement("input", {
                            onClick: this.togglePreview,
                            className: this.state.gameState.settings.canPreview ? "off" : "on",
                            type: "button",
                            value: "Preview"
                        }),
                        React.createElement("input", {
                            onClick: this.toggleHold,
                            className: this.state.gameState.settings.canHold ? "off" : "on",
                            type: "button",
                            value: "Hold"
                        }),
                        React.createElement("input", {
                            onClick: this.togglefullScreen,
                            className: this.state.gameState.settings.fullScreen ? "off" : "on",
                            type: "button",
                            value: "Fullscreen"
                        }),
                        React.createElement("input", {
                            onClick: this.toggleAnnouncer,
                            className: this.state.gameState.settings.announcer ? "off" : "on",
                            type: "button",
                            value: "Announcer"
                        }),
                        React.createElement(TetrisSong, null)
                    ),
                    React.createElement("div", {
                            className: "Issues"
                        },
                        React.createElement("hr", null),
                        "Any New issues? ", React.createElement("a", {
                            href: "https://github.com/hibooboo2/react_Tetris/issues",
                            target: "_blank"
                        }, "Add Them"),
                        React.createElement("hr", null),
                        "All Issues: ", this.state.issues.length,
                        currentIssues
                    )

                ),
                React.createElement("div", null,
                    React.createElement("div", {
                            className: "previewBox " + (this.state.gameState.settings.canPreview ? "enabled" : "disabled")
                        },
                        "Preview:" + ' ' +

                        "Next Piece:",
                        React.createElement("div", {
                                style: {
                                    position: "absolute",
                                    top: "0em"
                                }
                            },
                            React.createElement(TetrisPiece, {
                                piece: this.state.gameState.pieceEngine.que.slice(0).reverse()[0]
                            })
                        ),
                        React.createElement("div", {
                                style: {
                                    position: "absolute",
                                    top: "8em"
                                }
                            },
                            React.createElement(TetrisPiece, {
                                piece: this.state.gameState.pieceEngine.que.slice(0).reverse()[1]
                            })
                        )
                    ),
                    React.createElement("div", {
                            className: "heldBox " + (this.state.gameState.settings.canHold ? "enabled" : "disabled")
                        },
                        React.createElement("div", {
                            style: {
                                top: "0em",
                                position: "absolute"
                            },
                            className: "inline"
                        }, "Currently Holding:"),
                        drawnHeld
                    )
                ),
                React.createElement("div", {
                        className: "ScoreBox"
                    },
                    React.createElement("p", null, "Level: ", this.state.gameState.score.level),
                    React.createElement("p", null, "Score: ", this.state.gameState.score.score)
                ),
                React.createElement("audio", {
                        id: "GodSong",
                        width: "0",
                        height: "0",
                        loop: "1",
                        autoPlay: "1",
                        muted: true
                    },
                    React.createElement("source", {
                        src: "http://hibooboo2.github.io/react_Tetris/audio/test.mp3",
                        type: "audio/mp3"
                    }),
                    "Your browser does not support the video tag."
                ),
                React.createElement(ChatBox, {
                    piece: this.state.gameState.pieceEngine.que.slice(0).reverse()[3]
                })
            )
        )
    }
});
/*

var TetrisPreview = React.createClass({
    render: function() {
            var thePieces = Piece.prototype.que.map(function(piece){
                var cells = piece.cells2d();
                var theCells = cells.map(function(row){
                    return (
                            <div className="TetrisPiece">
                                <div className="row"> {row.map(function(aCell){
                                    return (
                                        <div className={"TetrisCell "+aCell.getType()}
                                                style={{"backgroundColor": aCell.type !==5 ? aCell.color:"lightgrey"}}>
                                        </div>
                                    );
                                    })}
                                </ div>
                            </ div>
                    )
                });
        });
        return (
                <div className="TetrisPreview">
                    {thePieces}
                </div>
                );
            }
});
*/

var TetrisPiece = React.createClass({
    displayName: 'TetrisPiece',
    getInitialState: function () {
        return {
            piece: this.props.piece
        };
    },
    render: function () {
        var positionCell = function (cell) {
            return {
                top: (cell.y * 2) + "em",
                left: (cell.x * 2) + "em",
                backgroundColor: cell.color
            };

        };
        var cells = this.props.piece.cells();
        var theCells = cells.map(function (cell) {
            return (
                React.createElement("div", {
                    className: "TetrisCell " + cell.getType(),
                    style: positionCell(cell)
                })
            )
        });
        var theCells = React.createElement("div", {
                className: "TetrisPiece"
            },
            theCells
        );
        return theCells;
    }
});

var ChatBox = React.createClass({
    displayName: 'ChatBox',
    getInitialState: function () {
        return {
            messages: ["Hello", "JAmes"]
        };
    },
    componentDidMount: function () {
        // componentDidMount is called by react when the component
        // has been rendered on the page. We can set the interval here:
        var socket = io.connect();
        this.socket = socket;
        //var name = window.localStorage.name ? window.localStorage.name :    prompt("What is your name?");
        var sendMessageButton = document.getElementById("sendMessage");
        this.state.name = prompt("What is your name?");
        window.localStorage.name = name;
        sendMessageButton.onclick = this.sendMessage;
        this.socket.on('new message', this.newMessage);
        messageBox.onkeydown = function (evt) {
            if (evt.keyCode === 17) {
                this.sendMessage();
            }
        };
        this.socket.emit("login", {
            name: name
        });
        this.setState({
            name: this.state.name,
            socket: socket
        });
    },
    newMessage: function (data) {
        this.state.messages.push(data.message);
        this.socket.emit("recieved", data);
        console.log(data);
        this.setState({
            messages: this.state.messages
        });
    },
    sendMessage: function () {
        var messageBox = document.getElementById("messageBox");
        if (messageBox.value !== "") {
            messageBox.value.split(":")
            this.socket.emit("send message", {
                from: this.state.name,
                message: messageBox.value,
                to: ""
            });
            messageBox.value = "";
        }
    },
    render: function () {
        return (
            React.createElement("div", {
                    className: "ChatBox"
                },
                this.state.messages.map(function (message) {
                    return React.createElement("p", null)
                }),

                React.createElement("input", {
                    id: "messageBox"
                }),
                React.createElement("button", {
                    id: "sendMessage"
                }, "Send Message")
            )
        );
    }

});


var TetrisSong = React.createClass({
    displayName: 'TetrisSong',
    getInitialState: function () {
        return {
            volume: window.localStorage.gameVolume !== undefined ? parseFloat(window.localStorage.gameVolume) : 0.5,
            muted: window.localStorage.gameMuted !== undefined ? JSON.parse(window.localStorage.gameMuted) : false,
        };
    },
    componentDidMount: function () {
        document.getElementById("TetrisSong").muted = this.state.muted;
        document.getElementById("TetrisSong").volume = this.state.volume;
    },
    volumeUp: function () {
        this.state.volume = this.state.volume + 0.05;
        this.state.volume = this.state.volume > 1 ? 1 : this.state.volume;
        this.state.muted = false;
        document.getElementById("TetrisSong").volume = this.state.volume;
        document.getElementById("TetrisSong").muted = false;
        window.localStorage.gameVolume = this.state.volume;
        window.localStorage.gameMuted = this.state.muted;
        this.setState({
            volume: this.state.volume,
            muted: this.state.muted
        });
    },
    volumeDown: function () {
        this.state.volume = this.state.volume - 0.10;
        this.state.volume = this.state.volume < 0 ? 0 : this.state.volume;
        this.state.muted = false;
        document.getElementById("TetrisSong").volume = this.state.volume;
        document.getElementById("TetrisSong").muted = false;
        window.localStorage.gameVolume = this.state.volume;
        window.localStorage.gameMuted = this.state.muted;
        this.setState({
            volume: this.state.volume,
            muted: this.state.muted
        });
    },
    togglePlay: function () {
        if (!this.state.muted) {
            this.state.muted = true;
            document.getElementById("TetrisSong").muted = true;
        } else {
            this.state.muted = false;
            document.getElementById("TetrisSong").muted = false;

        }
        window.localStorage.gameMuted = this.state.muted;
        this.setState({
            muted: this.state.muted
        });
    },
    render: function () {

        return (
            React.createElement("div", {
                    className: "TetrisSong",
                    style: {
                        margin: "0.1em"
                    }
                },
                React.createElement("audio", {
                        id: "TetrisSong",
                        width: "200",
                        height: "50",
                        loop: "1",
                        autoPlay: "1"
                    },
                    React.createElement("source", {
                        src: "audio/tetrisSong.mp4",
                        type: "video/mp4"
                    }),
                    "Your browser does not support the video tag."
                ),
                React.createElement("img", {
                    onClick: this.togglePlay,
                    height: "20px",
                    width: "20px",
                    src: !this.state.muted ? "https://cdn1.iconfinder.com/data/icons/material-audio-video/20/pause-circle-outline-128.png" : "https://cdn1.iconfinder.com/data/icons/material-audio-video/20/play-circle-fill-128.png",
                    alt: "Play Pause Button"
                }),
                React.createElement("img", {
                    onClick: this.volumeDown,
                    height: "20px",
                    width: "20px",
                    alt: "Volume Down",
                    src: "https://cdn2.iconfinder.com/data/icons/freecns-cumulus/16/519648-152_VolumeDown-128.png"
                }),
                React.createElement("img", {
                    onClick: this.volumeUp,
                    height: "20px",
                    width: "20px",
                    alt: "Volume Up",
                    src: "https://cdn2.iconfinder.com/data/icons/freecns-cumulus/16/519649-153_VolumeUp-128.png"
                })
            )
        );
    }
});

var TetrisGame = React.createClass({
    displayName: 'TetrisGame',
    render: function () {
        return (
            React.createElement("div", {
                    className: "TetrisGame"
                },
                React.createElement(GameBox, {
                    gameState: this.props.gameState,
                    keyMappings: this.props.keyMappings
                })
            )
        );
    }
});

var theKeys = keyMappings();

React.render(
    React.createElement(TetrisGame, {
        gameState: new boardEngine(),
        keyMappings: theKeys
    }),
    document.getElementById('main_Container')
);
