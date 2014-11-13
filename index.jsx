var GameBox = React.createClass({
    getInitialState: function(){
        return {gameState:this.props.gameState,ticked:0};
    },
     componentDidMount: function(){

        // componentDidMount is called by react when the component
        // has been rendered on the page. We can set the interval here:
        this.gravity = setInterval(this.tick, 10);
    },

    componentWillUnmount: function(){

        // This method is called immediately before the component is removed
        // from the page and destroyed. We can clear the interval here:
        clearInterVal(this.gravity);
    },

    tick: function(){

        // This function is called every 50 ms. It updates the
        // elapsed counter. Calling setState causes the component to be re-rendered
        console.log("Ticked" + this.state.ticked);
        this.state.gameState.currentPiece= randPiece().movePieceDown();
        this.setState({gameState:this.state.gameState,ticked:this.state.ticked+1});
    },
    render: function() {
        return (
            <div className="GameBox">{this.state.gameState.gameOver +" "} <button onClick={this.tick}>Add Piece</button>
            {this.state.gameState.board().map(function(row) {
                return <div className="row">{row.map(function(cell) {
                    var cellState= cell.occupied ? "occupied" : "free";
                    return <div className={"cell"} style={{"backgroundColor": cell.color}}></div>;
            })}</div>;
            })}
            {console.log(this.state.gameState.cells)}
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
