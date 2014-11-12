var GameBox = React.createClass({
    getInitialState: function(){
        return {gameState:this.props.gameState};
    },
    render: function() {
        return (
            <div className="GameBox">{this.state.gameState.gameOver +" "}
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
