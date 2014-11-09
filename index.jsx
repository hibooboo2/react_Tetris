var TetrisGame,
    GameBox,
    GamePieces,
    Piece,
    PieceCell,
    PreviewPane,
    GameControls,
    PlayBtn,
    SaveBtn,
    PauseBtnl,
    ScorePane;


var TetrisGame = React.createClass({
  render: function() {
    return (
      <div className="TetrisGame">
        <GameBox/>
        <PreviewPane/>
        <GameControls/>
      </div>
    );
  }
});

React.render(
  <TetrisGame/>,
  document.getElementById('main_Container')
);
