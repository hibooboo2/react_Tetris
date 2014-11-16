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

    addPiece: function(){
        this.state.gameState.newFallingPiece();
        this.setState({gameState:this.state.gameState});
    },

    dropPiece: function(){
        this.state.gameState.fallingPiece.dropPiece(this.state.gameState.board());
        this.state.gameState.addPiece(this.state.gameState.fallingPiece);
        this.setState({gameState:this.state.gameState});
    },

    rotatePieceClockwise: function(){
        this.state.gameState.fallingPiece.rotateClockWise(this.state.gameState.board());
        this.setState({gameState:this.state.gameState});
    },

    rotatePieceCounterClockwise: function(){
        this.state.gameState.fallingPiece.rotateCounterClockWise(this.state.gameState.board());
        this.setState({gameState:this.state.gameState});
    },

    moveLeft: function(){
        this.state.gameState.fallingPiece.shiftLeft(this.state.gameState.board());
        this.setState({gameState:this.state.gameState});
    },

    moveRight: function(){
        this.state.gameState.fallingPiece.shiftRight(this.state.gameState.board());
        this.setState({gameState:this.state.gameState});
    },

    gravity: function(){
        if(this.state.paused) {
            return;
        }
        else if(!this.state.gameState.gameOver){
            if(this.state.gameState.fallingPiece){
                if(!this.state.gameState.fallingPiece.movePieceDown(this.state.gameState.board())){
                    this.dropPiece();
                }else{
                    this.setState({gameState:this.state.gameState});
                }
            }
        }else{
            this.pause();
        }
    },

    softDrop: function(){
        if(this.state.gameState.fallingPiece && !this.state.gameState.gameOver){
            this.state.gameState.fallingPiece.movePieceDown(this.state.gameState.board());
            this.setState({gameState:this.state.gameState});
        }
    },

    holdPiece: function(){
        this.state.gameState.holdPiece();
        this.setState({gameState:this.state.gameState});
    },

    restart: function(){
        if(confirm("Are You Sure You Want to Restart?")){
        this.setState({gameState:gameEngine.newGame(),paused:true});
        }
    },

    pause: function(){
        this.state.paused = !this.state.paused;
        this.setState({paused:this.state.paused});
    },handleKeys:function(evt){
        var currEvent = evt;
        var key = evt.keyCode;
        console.log(evt);
        this.keyMappings = {
        87:this.dropPiece,
        83:this.softDrop,
        39:this.rotatePieceClockwise,
        37:this.rotatePieceCounterClockwise,
        68:this.moveRight,
        65:this.moveLeft,
        16:this.holdPiece,
        13:this.restart,
        32:this.pause
        }
        this.arrowMappings = {
        40:this.softDrop,
        38:this.rotatePieceClockwise,
        39:this.moveRight,
        37:this.moveLeft,
        16:this.holdPiece,
        13:this.restart,
        32:this.pause
        }
        if(evt instanceof KeyboardEvent ){
            if(key === 192){
                this.setState({useArrows:!this.state.useArrows});
            }else if(!this.state.paused && !this.state.useArrows){
                    if(this.keyMappings[key]!== undefined){
                        this.keyMappings[key]();
                    }
            }else if(!this.state.paused && this.state.useArrows){
                    if(this.arrowMappings[key]!== undefined){
                        this.arrowMappings[key]();
                    }
            }else if(evt instanceof KeyboardEvent && this.state.paused){
                if(key===32){
                    this.keyMappings[key]();
                }
            }
        }
    },
    render: function() {
        if(this.state.gameState.gameOver){
            alert("Gameover");
        }
        return (
            <div className="GameBox">
            <div className="cells">
            {this.state.gameState.board().map(function(row) {
                return <div className="row">{row.map(function(cell) {
                    return <div className={"cell "+cell.type} style={{"backgroundColor": cell.color}}></div>;
            })}</div>;
            })}
            Current Lines cleared {this.state.gameState.level*-1}
            Any issues? <a href="https://github.com/hibooboo2/react_Tetris/issues" target="_blank">Issues</a>
            </div>
            <div className="Controls rightCenter">
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
  <TetrisGame gameState={gameEngine.newGame()}/>,
  document.getElementById('main_Container')
);
