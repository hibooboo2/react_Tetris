var GameBox = React.createClass({
    getInitialState: function(){
        return {gameState:this.props.gameState,paused:true};
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
/*        console.log(evt);*/
/*        console.log(this.state.gameState);*/
        this.keyMappings = {
            87:"dropFallingPiece",
            83:"moveFallingDown",
            39:"rotateFallingClockWise",
            37:"rotateFallingCounterClockWise",
            68:"shiftFallingRight",
            65:"shiftFallingLeft",
            16:"holdPiece",
            13:this.restart,
            32:this.pause
        };
        this.arrowKeys = {
            40:"moveFallingDown",
            38:"rotateFallingClockWise",
            39:"shiftFallingRight",
            37:"shiftFallingLeft",
            16:"holdPiece"
        };
        if(evt instanceof KeyboardEvent ){
            if(key === 192){
                this.setState({useArrows:!this.state.useArrows});
            }else if(!this.state.paused && this.state.gameState.fallingPiece&& !this.state.useArrows){
                if(this.state.gameState[this.keyMappings[key]] !== undefined){
                    this.state.gameState[this.keyMappings[key]]();
                }else{
                    this.keyMappings[key]();
                }
            }else if(!this.state.paused && this.state.gameState.fallingPiece && this.state.useArrows){
                if(this.state.gameState[this.arrowKeys[key]] !== undefined){
                    this.state.gameState[this.arrowKeys[key]]();
                }else{
                    this.arrowKeys[key]();
                }
            }else if(evt instanceof KeyboardEvent){
                if(key===32||key==13){
                    this.keyMappings[key]();
                }
            }
        }
        this.setState({gameState:this.state.gameState});
    },
    render: function() {
        var tempBoard = this.state.gameState.getCurrentBoard();
        tempBoard.shift();
        tempBoard.shift();
        return (
            <div className="GameBox">
            <div className="cells">
            {tempBoard.map(function(row) {
                return <div className="row">{row.map(function(cell) {
                    return <div className={"cell "+cell.getType()} style={{"backgroundColor": cell.color}}></div>;
            })}</div>;
            })}
            Current Lines cleared {this.state.gameState.level*-1}
            Any issues? <a href="https://github.com/hibooboo2/react_Tetris/issues" target="_blank">Issues</a>
            </div>
            <div className="Controls rightCenter">
            <div className={this.state.gameState.gameOver? "gameOver" : ""}>{this.state.gameState.gameOver? "Game Over you Lost" : ""}</div>
            <button onClick={this.pause} className={this.state.paused ?"paused":"notPaused"}>Pause</button>
            a = left d= right s= softdrop w=harddrop Left/Right=rotate Space=Pause/Unpause Enter=Restart Hold Piece=Shift
            </div>
            </div>
        )
    }
});


var TetrisGame = React.createClass({
  render: function() {
    return (
      <div className="TetrisGame">
        <GameBox gameState={this.props.gameState}/>
      </div>
    );
  }
});

React.render(
  <TetrisGame gameState={new boardEngine()}/>,
  document.getElementById('main_Container')
);
