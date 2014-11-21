if( window.location.host==="tetris.jamescarlharris.com"){

}
var GameBox = React.createClass({
    getInitialState: function(){
        //var level = parseInt(prompt("Starting Level?",1));
        //this.props.gameState.score.level = level;
        this.props.gameState.settings.announcer = window.localStorage.announcer !== undefined ? JSON.parse(window.localStorage.announcer): true;
        var issues = "Not sure..";
        issues = loadIssuesNumber(issues);
        return {
                gameState: this.props.gameState,
                paused: true,
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
        this.autoGravity = setTimeout(this.gravity, this.state.gameState.score.getDelay());
    },

    componentWillUnmount: function(){
        // This method is called immediately before the component is removed
        // from the page and destroyed. We can clear the interval here:
        //clearInterval(this.autoGravity);
    },
    gravity: function(){
        this.autoGravity = setTimeout(this.gravity, this.state.gameState.score.getDelay());
        if(this.state.paused) {
            return;
        }
        else if(!this.state.gameState.gameOver){
            if(this.state.gameState.fallingPiece){
                if(!this.state.gameState.moveFallingDown()){
                    this.state.gameState.dropFallingPiece();
                    this.playBlock(this.state.gameState.fallingPiece.name());
                }else{
                }
            }
        }else{
            this.state.closeGameoverScreen = false;
            this.pause();
        }
        this.setState({gameState:this.state.gameState,closeGameoverScreen:this.state.closeGameoverScreen});
    },pickAlevel:function(){
        var level = parseInt(prompt("Starting Level?"));
        this.state.gameState.restart();
        this.state.gameState.score.level = level;
        this.setState({gameState:this.state.gameState,paused:true});
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
        if(this.state.gameState.gameOver&&this.state.paused){
            this.restart();
        }
        this.state.paused = !this.state.paused;
        this.setState({paused:this.state.paused});
    },
    handleKeys:function(evt){
        var currEvent = evt;
        var key = evt.keyCode;
        //console.log(key);
        if(evt instanceof KeyboardEvent){
            if(!this.state.paused && this.state.gameState.fallingPiece && this.state.keyMapping.keys[key] !== undefined){
                if(this.state.gameState[this.state.keyMapping.keys[key].function] !== undefined){
                    this.state.gameState[this.state.keyMapping.keys[key].function]();
                }else{
                    this[this.state.keyMapping.keys[key].function]();
                }
            }else if(evt instanceof KeyboardEvent){
                if(key === 32||key === 13||key === 192){
                    this[this.state.keyMapping.keys[key].function]();
                }
            }
        }
        if (this.state.keyMapping.keys[key].function === "dropFallingPiece" ){
            this.playBlock(this.state.gameState.fallingPiece.name());
        }
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
            document.getElementsByClassName("GameBox")[0].style.fontSize = (Math.floor(window.innerWidth/70))+"px";
        }else{
            document.getElementsByClassName("GameBox")[0].style.fontSize = "12px";
            }
        this.setState({gameState:this.state.gameState});
    },
    playBlock: function(pieceName){
        console.log("Play Called:" + pieceName);
        var godBlocks = {
                            FirstPiece:{start:15.4,end:16.8},
                            L:{start:13,end:14},
                            I:{start:110,end:111.8},
                            S:{start:41,end:41.95},
                            Z:{start:64.4,end:66.2},
                            O:{start:19,end:20.4},
                            T:{start:34,end:35.4},
                            J:{start:27,end:28.6}
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
                    godSong.pause()
                    godSong.muted = true;
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
    },
    drawPiece: function(aPiece) {
        var positionCell = function(cell){
            return {
                        top:(cell.y*2)+"em",
                        left:(cell.x*2)+"em",
                        backgroundColor: cell.color
                    };

        };
        var cells = aPiece.cells();
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
        var ghostPiece = {};
        if (this.state.gameState.settings.useGhost){
            var fallingCopy = this.state.gameState.fallingPiece.ghost(this.state.gameState);
            var ghostPiece = this.drawPiece(fallingCopy);
        }

        var drawnBoard = <div className={"cells"}>
                            {tempBoard.map(function(row) {
                                return row.map(function(cell) {
                                    return <div className={"TetrisCell "+cell.getType()} style={positionCell(cell)}></div>;
                            });
                            })}
                            {ghostPiece}
                            <p>Total Lines cleared: {this.state.gameState.score.linesCleared}</p>
                            <p>Next Level Up</p>
                            <p>From Lines Cleared = {this.state.gameState.score.nextLevelUp().linesToLevelUp}</p>
                            <p className={this.state.gameState.score.nextLevelUp().linesFromTetris ? "enabled" : "disabled"}>Go for a tetris to Levelup!</p>
                        </div>;
        var drawnHeld = false
        if(this.state.gameState.heldPiece){
            drawnHeld = this.drawPiece(new Piece(this.state.gameState.heldPiece,0,0,6));
        };
        return (
            <div className="GameBox">
                {drawnBoard}
                    <div className="Controls">
                        <div className="keyMappings">
                        {this.state.keyMapping.keys.readableLines().map(function(line){
                            return <p className="leftAlign">{line}</p>
                        })}
                        </ div>
                        <div>
                        <p className={"pauseLabel "+(this.state.paused ?"paused":"notPaused")}>{this.state.paused ?"Play":"Pause"}</p>
                        </div>
                        <div className="Settings">
                            <input onClick={this.toggleGhost} className={this.state.gameState.settings.useGhost ? "off":"on"} type="button" value="Ghost"/>
                            <input onClick={this.togglePreview} className={this.state.gameState.settings.canPreview ? "off":"on"} type="button" value="Preview"/>
                            <input onClick={this.toggleHold} className={this.state.gameState.settings.canHold ? "off":"on"} type="button" value="Hold"/>
                            <input onClick={this.togglefullScreen} className={this.state.gameState.settings.fullScreen ? "off":"on"} type="button" value="Fullscreen"/>
                            <input onClick={this.toggleAnnouncer} className={this.state.gameState.settings.announcer ? "off":"on"} type="button" value="Announcer"/>
                            <TetrisSong/>
                        </ div>
                    </div>
                    <div className ="Issues">
                    <hr />
                    Any New issues? <a href="https://github.com/hibooboo2/react_Tetris/issues" target="_blank">Add Them</a>
                    <hr />
                    All Issues: {this.state.issues.length}
                    {currentIssues}
                    </ div>
                    <div className={this.state.closeGameoverScreen? "disabled" : "gameOver"}>
                        <p>Congratulations! </p>
                        <p>You got to level {this.state.gameState.score.level}</p>
                        <p>Your Score was {this.state.gameState.score.score}</p>
                        <p>You Cleared {this.state.gameState.score.linesCleared} lines!</p>
                        <p>You got {this.state.gameState.score.singles} Singles!</p>
                        <p>You got {this.state.gameState.score.doubles} Doubles!</p>
                        <p>You got {this.state.gameState.score.triples} Triples!</p>
                        <p>You got {this.state.gameState.score.tetrises} Tetrises!</p>
                        <p>Good Job!</p>
                        <input onClick={this.closeGameoverScreen} className="button" type="button" value="Close"/>
                    </div>
                    <div className={this.state.paused? "pauseScreen" : "disabled"}>
                        Paused
                    </div>
                <div>
                    <div className={"previewBox "+(this.state.gameState.settings.canPreview ? "enabled":"disabled")}>
                            Preview:

                            Next Piece:
                            <div style={{position:"absolute",top:"0em"}}>{this.drawPiece(Piece.prototype.que.slice(0).reverse()[0])}</div>

                            <div style={{position:"absolute",top:"8em"}}>{this.drawPiece(Piece.prototype.que.slice(0).reverse()[1])}</div>
                    </ div>
                    <div className={"heldBox "+(this.state.gameState.settings.canHold ? "enabled":"disabled")}>
                            <div style={{top: "0em",position: "absolute"}} className="inline">Currently Holding:</div>
                            {drawnHeld}
                    </ div>
                </div>
                <div className="ScoreBox">
                    <p>Level: {this.state.gameState.score.level}</p>
                    <p>Score: {this.state.gameState.score.score}</p>
                </div>
                <audio id="GodSong" width="0" height="0" loop="1" autoPlay="1" muted>
                    <source src={"audio/god.mp4"} type="video/mp4" />
                    Your browser does not support the video tag.
                </audio>
            </div>
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

var TetrisSong = React.createClass({
    getInitialState: function(){
        return {
                volume: window.localStorage.gameVolume !== undefined ? parseFloat(window.localStorage.gameVolume): 0.5,
                };
    },componentDidMount: function(){
        document.getElementById("TetrisSong").volume = this.state.volume;
    },
    toggleVideo: function(){
        this.state.volume = this.state.volume +0.05;
        if(this.state.volume> 1){
            this.state.volume = 0;
            document.getElementById("TetrisSong").muted = true;
        }
        document.getElementById("TetrisSong").volume = this.state.volume;
        document.getElementById("TetrisSong").muted = false;
        window.localStorage.gameVolume = this.state.volume;
        this.setState({volume:this.state.volume});
    },
    render: function() {

        return (
                <div className="TetrisSong">
                    <audio id="TetrisSong" width="200" height="50" loop="1" autoPlay="1">
                        <source src={"audio/tetrisSong.mp4"} type="video/mp4" />
                        Your browser does not support the video tag.
                    </audio>
                    <input className={!this.state.volume ? "on":"off"} type="button"
                        onClick={this.toggleVideo} value={!this.state.volume? "Muted":"Volume: "+Math.floor(this.state.volume*100)+"%"}></input>
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
  <TetrisGame gameState={new boardEngine()} keyMappings={theKeys}/>,
/*  <TetrisPiece thePiece={new Piece().draw()}/>,*/
  document.getElementById('main_Container')
);
