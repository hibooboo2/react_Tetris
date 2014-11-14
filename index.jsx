var GameBox = React.createClass({
    getInitialState: function(){
        return {gameState:this.props.gameState,ticked:0};
    },
     componentDidMount: function(){
        // componentDidMount is called by react when the component
        // has been rendered on the page. We can set the interval here:
        this.tick = setInterval(this.gravity, 100);
    },

    componentWillUnmount: function(){
        // This method is called immediately before the component is removed
        // from the page and destroyed. We can clear the interval here:
        clearInterVal(this.tick);
    },

    addPiece: function(){
        this.state.gameState.currentPiece = new Piece(randPiece());
        this.setState({gameState:this.state.gameState});
    },dropPiece: function(){
        this.state.gameState.currentPiece.dropPiece(this.state.gameState.board());
        this.state.gameState.addPiece(this.state.gameState.currentPiece);
        this.state.gameState.currentPiece = new Piece(randPiece());
        this.setState({gameState:this.state.gameState});
    },rotatePiece: function(){
        this.state.gameState.currentPiece.rotateClockWise(this.state.gameState.board());
        this.setState({gameState:this.state.gameState});
    },moveLeft: function(){
        this.state.gameState.currentPiece.shiftLeft(this.state.gameState.board());
        this.setState({gameState:this.state.gameState});
    },moveRight: function(){
        this.state.gameState.currentPiece.shiftRight(this.state.gameState.board());
        this.setState({gameState:this.state.gameState});
    },gravity: function(){
        if(this.state.gameState.currentPiece && !this.state.gameState.gameOver){
            if(!this.state.gameState.currentPiece.movePieceDown(this.state.gameState.board())){
                this.dropPiece();
            }else{
                this.setState({gameState:this.state.gameState});
            }
        }else{
            this.restart();
        }
    },restart: function(){
        this.setState({gameState:gameEngine.initialgameState()})
    },
    render: function() {
        if(this.state.gameState.gameOver){
            alert("Gameover");
        };
        return (
            <div className="GameBox">
            <div className="Controls">
            <button onClick={this.addPiece}>Add Piece</button>
            <button onClick={this.dropPiece}>Drop Piece</button>
            <button onClick={this.gravity}>Soft Drop Piece</button>
            <button onClick={this.rotatePiece}>Rotate</button>
            <button onClick={this.moveLeft}>Move Left</button>
            <button onClick={this.moveRight}>Move Right</button>
            <button onClick={this.restart}>Restart</button>
            </div>
            {this.state.gameState.board().map(function(row) {
                return <div className="row">{row.map(function(cell) {
                    return <div className={"cell"} style={{"backgroundColor": cell.color}}></div>;
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
  <TetrisGame gameState={gameA}/>,
  document.getElementById('main_Container')
);
