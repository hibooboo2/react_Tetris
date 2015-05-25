if( window.location.host === "tetris.jamescarlharris.com"){

}
var GameBox = React.createClass({
    getInitialState: function(){
        //var level = parseInt(prompt("Starting Level?",1));
        //this.props.gameState.score.level = level;
        if(window.localStorage.board !== null && window.localStorage.board !== undefined && window.localStorage.board !== "null"){
            console.log(window.localStorage.board);
            this.props.gameState = new boardEngine().fromJson(window.localStorage.board);
        }
        this.props.gameState.settings = window.localStorage.settings !== undefined ? JSON.parse(window.localStorage.settings): {
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
            issues: issues,
            keyMappings: this.props.keyMappings,
            keyMapping: this.props.keyMappings["default"],
            currentMap: "default",
            closeGameoverScreen: true
        };
    },
     componentDidMount: function(){
        // componentDidMount is called by react when the component
        // has been rendered on the page. We can set the interval here:
        window.addEventListener('keydown', this.handleKeys);
        document.getElementById("TetrisSong").playbackRate = this.state.gameState.score.getPlaybackRate();
        this.autoGravity = setTimeout(this.gravity, this.state.gameState.score.getDelay());
    },
    componentWillUnmount: function(){
        // This method is called immediately before the component is removed
        // from the page and destroyed. We can clear the interval here:
        //clearInterval(this.autoGravity);
    },
    gravity: function(){
        this.autoGravity = setTimeout(this.gravity, this.state.gameState.score.getDelay());
        try {
            this.state.gameState.gravity();
        } catch(err) {
            if (err === this.state.gameState.gameOverConst){
                this.pause();
            }
        } finally {
            this.setState({gameState:this.state.gameState, closeGameoverScreen:this.state.closeGameoverScreen});
        }
    },pickAlevel:function(){
        var level = parseInt(prompt("Starting Level?"));
        this.state.gameState.restart();
        this.state.gameState.score.level = level;
        this.setState({gameState:this.state.gameState});
    },
    restart: function(){
        if(confirm("Are You Sure You Want to Restart?")){
        this.state.gameState.restart();
        this.setState({gameState:this.state.gameState,paused:true,closeGameoverScreen:true});
        }
    },changeMapping:function(){
        if(this.state.currentMap === "default"){
                this.state.currentMap = "arrows";
            }else{
                this.state.currentMap = "default";
            }
        this.state.keyMapping = this.state.keyMappings[this.state.currentMap];
    },
    pause: function(){
        this.state.gameState.pause();
        window.localStorage.settings = JSON.stringify(this.state.gameState.settings);
        this.setState({gameState: this.state.gameState});
    },
    play: function(){
        this.state.gameState.paused = false;
        this.state.gameState.started = true;
        var newFalling = this.state.gameState.pieceEngine.draw();
        this.playBlock("FirstPiece",newFalling.name());
        var gameState = this.state.gameState;
        if(gameState.settings.announcer){
            setTimeout(function(){
                gameState.fallingPiece = newFalling;
            },8800);
        }else{
            gameState.fallingPiece = newFalling;
        }
        this.setState({gameState:this.state.gameState});
    },
    handleKeys:function(evt){
        var key = evt.keyCode;
        if (this.state.keyMapping.keys[key] === undefined){
            return;
        }
        console.log(this.state.keyMapping.keys[key].function);
        if(evt instanceof KeyboardEvent){
            if(!this.state.gameState.gameOver && !this.state.gameState.paused &&
                this.state.gameState.fallingPiece && this.state.keyMapping.keys[key] !== undefined){
                if(this.state.gameState[this.state.keyMapping.keys[key].function] !== undefined){
                    this.state.gameState[this.state.keyMapping.keys[key].function]();
                    if (this.state.keyMapping.keys[key].function === "dropFallingPiece" ){
                        this.playBlock(this.state.gameState.fallingPiece.name());
                    }
                }else{
                    this[this.state.keyMapping.keys[key].function]();
                }
            }else if(evt instanceof KeyboardEvent){
                if(key === 32||key === 13||key === 192 || key === 76){
                    this[this.state.keyMapping.keys[key].function]();
                }
            }
        }
        document.getElementById("TetrisSong").playbackRate = this.state.gameState.score.getPlaybackRate();
        this.setState({gameState:this.state.gameState,keyMapping:this.state.keyMapping,currentMap:this.state.currentMap});
    },toggleGhost:function(){
        this.state.gameState.settings.useGhost = !this.state.gameState.settings.useGhost;
        this.setState({gameState:this.state.gameState});
    },togglePreview:function(){
        this.state.gameState.settings.canPreview = !this.state.gameState.settings.canPreview;
        this.setState({gameState:this.state.gameState});
    },toggleHold:function(){
        this.state.gameState.settings.canHold = !this.state.gameState.settings.canHold;
        this.setState({gameState:this.state.gameState});
    },closeGameoverScreen: function(){
        this.state.closeGameoverScreen = true;
        this.setState({closeGameoverScreen:this.state.closeGameoverScreen});
    },togglefullScreen:function(){
        this.state.gameState.settings.fullScreen = !this.state.gameState.settings.fullScreen;
        if(this.state.gameState.settings.fullScreen){
            document.getElementsByClassName("GameBox")[0].style.fontSize = (Math.floor(window.innerHeight/50))+"px";
        }else{
            document.getElementsByClassName("GameBox")[0].style.fontSize = "12px";
            }
        this.setState({gameState:this.state.gameState});
    },playBlock: function(pieceName,secondPiece){
        var playBlock = this.playBlock;
        var godBlocks = {
                            FirstPiece:{start:3.7,end:12.5},
                            Tetris:{start:76.5,end:80.6},
                            L:{start:13,end:14.4},
                            I:{start:110,end:111.8},
                            S:{start:41,end:42},
                            Z:{start:64.4,end:66.3},
                            O:{start:19,end:20.4},
                            T:{start:34,end:35.4},
                            J:{start:27,end:28.8}
                        }
        var volume = 1;
        var announcer =this.state.gameState.settings.announcer;
        var playSegment = function(time){
        var godSong = document.getElementById("GodSong");
            if(godSong && announcer){
                godSong.currentTime = time.start;
                godSong.muted = false;
                godSong.volume = volume;
                godSong.play();
                setTimeout(function(){
                    if(pieceName!=="FirstPiece"){
                        godSong.pause();
                        godSong.muted = true;
                    }else{
                        godSong.pause();
                        godSong.muted = true;
                        playBlock(secondPiece);
                    }
                    },(time.end-time.start)*1000);
            }
        }
        if(godBlocks[pieceName]){
            playSegment(godBlocks[pieceName]);
        }
    },toggleAnnouncer:function(){
        this.state.gameState.settings.announcer = !this.state.gameState.settings.announcer;
        window.localStorage.announcer = this.state.gameState.settings.announcer;
        this.setState({gameState:this.state.gameState});
    },toggleAutoSave:function(){
        this.state.gameState.settings.useAutoSave = !this.state.gameState.settings.useAutoSave;
        this.setState({gameState:this.state.gameState});
    },
    drawPiece: function(aPiece) {
        return <TetrisPiece piece={aPiece}/>
    },
    render: function() {
        var tempBoard = this.state.gameState.getCurrentBoard();
        tempBoard.shift();
        tempBoard.shift();
        var currentIssues = this.state.issues;
        currentIssues = currentIssues.map(function(issue){
            return <p>{issue.title}</ p>;
            });
        var positionCell = function(cell){
            return {
                        top:(2*cell.y)+"em",
                        left:(cell.x*2)+"em",
                        backgroundColor:cell.color
                    };
        };
        var drawnBoard = <div className={"cells"}>
                            {tempBoard.map(function(row) {
                                return row.map(function(cell) {
                                    return <div className={"TetrisCell "+cell.getType()} style={positionCell(cell)}></div>;
                            });
                            })}
                            <p>Total Lines cleared: {this.state.gameState.score.linesCleared}</p>
                            <p>Next Level Up</p>
                            <p>From Lines Cleared = {this.state.gameState.score.nextLevelUp().linesToLevelUp}</p>
                            <p className={this.state.gameState.score.nextLevelUp().linesFromTetris ? "enabled" : "disabled"}>Go for a tetris to Levelup!</p>
                        </div>;
        var drawnHeld = false
        if(this.state.gameState.heldPiece){
            drawnHeld = <TetrisPiece piece={this.state.gameState.heldPiece}/>;
        };
        return (
            <div className="GameBox">
                {drawnBoard}
                    <div className="Controls">
                    </div>
                    <div className={this.state.closeGameoverScreen? "disabled" : "gameOver"}>
                        <p>Congratulations! </p>
                        <p>You got to level {this.state.gameState.score.level}</p>
                        <p>Your Score was {this.state.gameState.score.getValue()}</p>
                        <p>You Cleared {this.state.gameState.score.linesCleared} lines!</p>
                        <p>You got {this.state.gameState.score.singles} Singles!</p>
                        <p>You got {this.state.gameState.score.doubles} Doubles!</p>
                        <p>You got {this.state.gameState.score.triples} Triples!</p>
                        <p>You got {this.state.gameState.score.tetrises} Tetrises!</p>
                        <p>Good Job!</p>
                        <input onClick={this.closeGameoverScreen} className="button" type="button" value="Close"/>
                    </div>
                    <div className={this.state.gameState.paused? "pauseScreen" : "disabled"}>

                        <p onClick={this.state.gameState.started ? this.pause : this.play} className={"pauseLabel "+(this.state.gameState.paused ?"paused":"notPaused")}>{this.state.gameState.paused ?"Play":"Pause"}</p>
                        <div className="keyMappings">
                        {this.state.keyMapping.keys.readableLines().map(function(line){
                            return <p className="leftAlign">{line}</p>
                        })}
                        </ div>
                        <div>
                        </div>
                        <div className="Settings">
                            <input onClick={this.toggleAutoSave} className={this.state.gameState.settings.useAutoSave ? "off":"on"} type="button" value="Auto Save"/>
                            <input onClick={this.toggleGhost} className={this.state.gameState.settings.useGhost ? "off":"on"} type="button" value="Ghost"/>
                            <input onClick={this.togglePreview} className={this.state.gameState.settings.canPreview ? "off":"on"} type="button" value="Preview"/>
                            <input onClick={this.toggleHold} className={this.state.gameState.settings.canHold ? "off":"on"} type="button" value="Hold"/>
                            <input onClick={this.togglefullScreen} className={this.state.gameState.settings.fullScreen ? "off":"on"} type="button" value="Fullscreen"/>
                            <input onClick={this.toggleAnnouncer} className={this.state.gameState.settings.announcer ? "off":"on"} type="button" value="Announcer"/>
                            <TetrisSong/>
                        </ div>
                        <div className ="Issues">
                        <hr />
                        Any New issues? <a href="https://github.com/hibooboo2/react_Tetris/issues" target="_blank">Add Them</a>
                        <hr />
                        All Issues: {this.state.issues.length}
                        {currentIssues}
                        </ div>

                    </div>
                <div>
                    <div className={"previewBox "+(this.state.gameState.settings.canPreview ? "enabled":"disabled")}>
                            Preview:

                            Next Piece:
                            <div style={{position:"absolute",top:"0em"}}>
                                <TetrisPiece piece={this.state.gameState.pieceEngine.que.slice(0).reverse()[0]}/>
                            </div>
                            <div style={{position:"absolute",top:"8em"}}>
                                <TetrisPiece piece={this.state.gameState.pieceEngine.que.slice(0).reverse()[1]}/>
                            </div>
                    </ div>
                    <div className={"heldBox "+(this.state.gameState.settings.canHold ? "enabled":"disabled")}>
                            <div style={{top: "0em",position: "absolute"}} className="inline">Currently Holding:</div>
                            {drawnHeld}
                    </ div>
                </div>
                <div className="ScoreBox">
                    <p>Level: {this.state.gameState.score.level}</p>
                    <p>Score: {this.state.gameState.score.getValue()}</p>
                </div>
                <audio id="GodSong" width="0" height="0" loop="1" autoPlay="1" muted>
                    <source src={"http://hibooboo2.github.io/react_Tetris/audio/test.mp3"} type="audio/mp3" />
                    Your browser does not support the video tag.
                </audio>
            </div>
        )
    }
});

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


var TetrisPiece = React.createClass({
    getInitialState: function(){
        return {piece:this.props.piece};
    },
    render: function() {
        var positionCell = function(cell){
            return {
                        top:(cell.y*2)+"em",
                        left:(cell.x*2)+"em",
                        backgroundColor: cell.color
                    };

        };
        var cells = this.props.piece.cells();
        var theCells = cells.map(function(cell){
            return (
                        <div className={"TetrisCell "+cell.getType()}
                                    style={positionCell(cell)}>
                        </div>
                    )
        });
        var theCells = <div className="TetrisPiece">
                        {theCells}
                        </div>;
        return theCells;
    }
});

var TetrisSong = React.createClass({
    getInitialState: function(){
        return {
                volume: window.localStorage.gameVolume !== undefined ? parseFloat(window.localStorage.gameVolume): 0.5,
                muted: window.localStorage.gameMuted !== undefined ? JSON.parse(window.localStorage.gameMuted): false,
                };
    },componentDidMount: function(){
        document.getElementById("TetrisSong").muted = this.state.muted;
        document.getElementById("TetrisSong").volume = this.state.volume;
    },
    volumeUp: function(){
        this.state.volume = this.state.volume +0.05;
        this.state.volume = this.state.volume > 1 ? 1: this.state.volume ;
        this.state.muted = false;
        document.getElementById("TetrisSong").volume = this.state.volume;
        document.getElementById("TetrisSong").muted = false;
        window.localStorage.gameVolume = this.state.volume;
        window.localStorage.gameMuted = this.state.muted;
        this.setState({volume:this.state.volume,muted:this.state.muted});
    },
    volumeDown: function(){
        this.state.volume = this.state.volume -0.10;
        this.state.volume = this.state.volume < 0 ? 0: this.state.volume ;
        this.state.muted = false;
        document.getElementById("TetrisSong").volume = this.state.volume;
        document.getElementById("TetrisSong").muted = false;
        window.localStorage.gameVolume = this.state.volume;
        window.localStorage.gameMuted = this.state.muted;
        this.setState({volume:this.state.volume,muted:this.state.muted});
    },
    togglePlay: function(){
        if(!this.state.muted){
            this.state.muted = true;
            document.getElementById("TetrisSong").muted = true;
        }else{
            this.state.muted = false;
            document.getElementById("TetrisSong").muted = false;

        }
        window.localStorage.gameMuted = this.state.muted;
        this.setState({muted:this.state.muted});
    },
    render: function() {

        return (
                <div className="TetrisSong" style={{margin:"0.1em"}}>
                    <audio id="TetrisSong" width="200" height="50" loop="1" autoPlay="1">
                        <source src={"audio/tetrisSong.mp4"} type="video/mp4" />
                        Your browser does not support the video tag.
                    </audio>
                        <img onClick={this.togglePlay} height="20px" width="20px" src={!this.state.muted ? "https://cdn1.iconfinder.com/data/icons/material-audio-video/20/pause-circle-outline-128.png" : "https://cdn1.iconfinder.com/data/icons/material-audio-video/20/play-circle-fill-128.png"} alt="Play Pause Button"/>
                    <img onClick={this.volumeDown} height="20px" width="20px" alt="Volume Down" src="https://cdn2.iconfinder.com/data/icons/freecns-cumulus/16/519648-152_VolumeDown-128.png"/>
                    <img onClick={this.volumeUp} height="20px" width="20px" alt="Volume Up" src="https://cdn2.iconfinder.com/data/icons/freecns-cumulus/16/519649-153_VolumeUp-128.png"/>
                </div>
                );
            }
});

var TetrisGame = React.createClass({
    render: function() {
        return (
                    <div className="TetrisGame">
                        <GameBox gameState={this.props.gameState} keyMappings={this.props.keyMappings}/>
                    </div>
                );
        }
    });

var theKeys = keyMappings();

React.render(
  <TetrisGame gameState={new BoardEngine()} keyMappings={theKeys}/>,
  document.getElementById('main_Container')
);
