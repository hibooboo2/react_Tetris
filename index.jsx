var GameBox = React.createClass({
    getInitialState: function(){
        var issues = "Not sure";
        issues = loadIssuesNumber(issues);
        console.log(issues);
        return {
                gameState: this.props.gameState,
                paused: true,
                issues: issues,
                keyMappings: this.props.keyMappings,
                keyMapping: this.props.keyMappings["default"],
                currentMap: "default"
                };
    },
     componentDidMount: function(){
        // componentDidMount is called by react when the component
        // has been rendered on the page. We can set the interval here:
        window.addEventListener('keydown', this.handleKeys);
        this.autoGravity = setInterval(this.gravity, 500+this.state.gameState.level);
    },

    componentWillUnmount: function(){
        // This method is called immediately before the component is removed
        // from the page and destroyed. We can clear the interval here:
        clearInterVal(this.autoGravity);
    },
    gravity: function(){
        if(this.state.paused) {
            return;
        }
        else if(!this.state.gameState.gameOver){
            if(this.state.gameState.fallingPiece){
                if(!this.state.gameState.moveFallingDown()){
                    this.state.gameState.dropFallingPiece();
                }else{
                    this.setState({gameState:this.state.gameState});
                }
            }
        }else{
            this.pause();
        }
    },
    restart: function(){
        if(confirm("Are You Sure You Want to Restart?")){
        this.setState({gameState:new boardEngine(),paused:true});
        }
    },
    pause: function(){
        this.state.paused = !this.state.paused;
        this.setState({paused:this.state.paused});
    },
    handleKeys:function(evt){
        var currEvent = evt;
        var key = evt.keyCode;
        console.log(key);
/*        console.log(this.state.currentMap);*/
/*        console.log(this.state.keyMapping.keys[key]);*/
        if(evt instanceof KeyboardEvent ){
            if(key === 192){
                if(this.state.currentMap === "default"){
                    this.state.currentMap = "arrows";
                }else{
                    this.state.currentMap = "default";
                }
                this.state.keyMapping = this.state.keyMappings[this.state.currentMap];
                this.setState({keyMapping:this.state.keyMapping,currentMap:this.state.currentMap});
            }else if(!this.state.paused && this.state.gameState.fallingPiece){
                if(this.state.gameState[this.state.keyMapping.keys[key].function] !== undefined){
                    this.state.gameState[this.state.keyMapping.keys[key].function]();
                }else{
                    this[this.state.keyMapping.keys[key].function]();
                }
            }else if(evt instanceof KeyboardEvent){
                if(key===32||key==13){
                    this[this.state.keyMapping.keys[key].function]();
                }
            }
        }
        this.setState({gameState:this.state.gameState});
    },
    render: function() {
        var tempBoard = this.state.gameState.getCurrentBoard();
        tempBoard.shift();
        tempBoard.shift();
        var currentIssues = this.state.issues;
        currentIssues = currentIssues.map(function(issue){
            return <p>{issue.title}</ p>;
            });
        return (
            <div className="GameBox">
            <div className="cells">
            {tempBoard.map(function(row) {
                return <div className="row">{row.map(function(cell) {
                    return <div className={"cell "+cell.getType()} style={{"backgroundColor": cell.color}}></div>;
            })}</div>;
            })}
            Current Lines cleared {this.state.gameState.level*-1}
            <hr />
            Any issues? <a href="https://github.com/hibooboo2/react_Tetris/issues" target="_blank">Issues</a>
            <hr />
            All Issues: {currentIssues}

            </div>
            <div className="Controls rightCenter">
            {this.state.keyMapping.keys.readableLines().map(function(line){
                return <p>{line}</p>
            })}
            <div className={this.state.gameState.gameOver? "gameOver" : ""}>{this.state.gameState.gameOver? "Game Over you Lost" : ""}</div>
            <button onClick={this.pause} className={this.state.paused ?"paused":"notPaused"}>Pause</button>
            {this.state.keybindings}
            </div>
            </div>
        )
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
  document.getElementById('main_Container')
);
