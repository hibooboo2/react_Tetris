var GameBox = React.createClass({
    getInitialState: function(){
        return {gameState:this.props.gameState,paused:false};
    },
     componentDidMount: function(){
        // componentDidMount is called by react when the component
        // has been rendered on the page. We can set the interval here:
        this.autoGravity = setInterval(this.gravity, 500);
    },

    componentWillUnmount: function(){
        // This method is called immediately before the component is removed
        // from the page and destroyed. We can clear the interval here:
        clearInterVal(this.autoGravity);
    },

    addPiece: function(){
        this.state.gameState.currentPiece = randPiece();
        this.setState({gameState:this.state.gameState});
    },

    dropPiece: function(){
        this.state.gameState.currentPiece.dropPiece(this.state.gameState.board());
        this.state.gameState.addPiece(this.state.gameState.currentPiece);
        this.setState({gameState:this.state.gameState});
    },

    rotatePiece: function(){
        this.state.gameState.currentPiece.rotateClockWise(this.state.gameState.board());
        this.setState({gameState:this.state.gameState});
    },

    moveLeft: function(){
        this.state.gameState.currentPiece.shiftLeft(this.state.gameState.board());
        this.setState({gameState:this.state.gameState});
    },

    moveRight: function(){
        this.state.gameState.currentPiece.shiftRight(this.state.gameState.board());
        this.setState({gameState:this.state.gameState});
    },

    gravity: function(){
        if(this.state.paused) {
            return;
        }
        else if(this.state.gameState.currentPiece && !this.state.gameState.gameOver){
            if(!this.state.gameState.currentPiece.movePieceDown(this.state.gameState.board())){
                this.dropPiece();
            }else{
                this.setState({gameState:this.state.gameState});
            }
        }else{
            this.pause();
        }
    },

    softDrop: function(){
        if(this.state.gameState.currentPiece && !this.state.gameState.gameOver){
            this.state.gameState.currentPiece.movePieceDown(this.state.gameState.board());
            this.setState({gameState:this.state.gameState});
        }
    },

    restart: function(){
        if(confirm("Are You Sure You Want to Restart?")){
        this.setState({gameState:gameEngine.newGame(),paused:false});
        }
    },

    pause: function(){
        this.state.paused = !this.state.paused;
        this.setState({paused:this.state.paused});
    },
    render: function() {
        if(this.state.gameState.gameOver){
            alert("Gameover");
        }
        return (
            <div className="GameBox">
            <div className="Controls">
            <button onClick={this.addPiece}>Add Piece</button>
            <button onClick={this.dropPiece}>Drop Piece</button>
            <button onClick={this.softDrop}>Soft Drop Piece</button>
            <button onClick={this.rotatePiece}>Rotate</button>
            <button onClick={this.moveLeft}>Move Left</button>
            <button onClick={this.moveRight}>Move Right</button>
            <button onClick={this.restart}>Restart</button>
            <button onClick={this.pause} className={this.state.paused ?"paused":"notPaused"}>Pause</button>
            </div>
            {this.state.gameState.board().map(function(row) {
                return <div className="row">{row.map(function(cell) {
                    return <div className={"cell"} style={{"backgroundColor": cell.color}}>{}</div>;
            })}</div>;
            })}
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
