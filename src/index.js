import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

// squares is a matrix

function Square(props) {
  return (
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i, j) {
    return (
      <Square
        value={this.props.squares[i][j]}
        onClick={() => this.props.onClick(i,j)}
      />
    );
  }

  render() {
    const gameBoard = this.props.squares;
    const matrix = [];

    for (let i = 0; i < gameBoard.length; i++) {
      const row = gameBoard[i];
      const items = [];
      
      for (let j = 0; j < row.length; j++) {
        items.push(this.renderSquare(i,j))
      };
      
      matrix.push(<div className="board-row">{items}</div>);
    };
    return (
      <div>
        {matrix}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoaded: false,
      error: null,
      createdTime: null,
      finishedTime: null,
      status: null,
      fieldBoard: [],
      gameBoard: [],
      markerCounter: 1,
      markerText: 'Discover',
      history: [{
        squares: Array(9).fill(null),
      }],
      stepNumber: 0,
    };
  }
  
  componentDidMount() {
    fetch("https://minesweeperdemo.herokuapp.com/games/", {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      // body: JSON.stringify({
      //   firstParam: 'yourValue',
      //   secondParam: 'yourOtherValue'
      // })
    })
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            isLoaded: true,
            createdTime: result.created_time,
            status:result.status,
            fieldBoard: result.field_board,
            gameBoard: result.game_board,
          });
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      )
  }

  handleClick(i,j) {
    const gameBoard = this.state.gameBoard;
    const fieldBoard = this.state.fieldBoard.slice();
    const markerCounter = this.state.markerCounter;
    const squares = gameBoard.slice();
    let status;
    status = calculateStatus(fieldBoard, squares);
    
    if (status != 'started' || squares[i][j] == 'x' || squares[i][j] == 'm') {
      return;
    }

    squares[i][j] = getNextVal(fieldBoard[i][j], markerCounter);
    this.setState({
      gameBoard: squares,
    });
  }

  updateMarker() {
    const newMarkerCounter = (this.state.markerCounter + 1) % 3;
    let text;
    if (newMarkerCounter == 1) {
      text = 'Discover';
    } else if (newMarkerCounter == 2) {
      text = 'Flag';
    } else {
      text = 'Question';
    }
    this.setState({
      markerCounter: newMarkerCounter,
      markerText: text,
    });
  }

  render() {
    const gameBoard = this.state.gameBoard.slice();
    const fieldBoard = this.state.fieldBoard.slice();
    const markerText = this.state.markerText;
    const status = calculateStatus(fieldBoard, gameBoard);

    let resultMessage;
    if (status == 'started') {
      resultMessage = 'You are doing great!';
    } else if (status == 'won') {
      resultMessage = 'You won!!';
    } else {
      resultMessage = 'You lost! :(';
    }

    return (
      <div className="game">
        <div className="game-board">
          <div className="game-info">
            <div>{resultMessage}</div>
            <div>
              <button onClick={() => this.updateMarker()}>{markerText}</button>
            </div>
          </div>
          <Board
            squares={this.state.gameBoard}
            onClick={(i,j) => this.handleClick(i,j)}
          />
        </div>
      </div>
    );
  }
}

function calculateStatus(fieldBoard, gameBoard) {
  let isComplete;
  isComplete = true;
  for (let i = 0; i < gameBoard.length; i++) {
    const rowGame = gameBoard[i];
    const rowField = fieldBoard[i];
    
    for (let j = 0; j < rowGame.length; j++) {
      if (rowGame[j] == 'm') {
        return 'lost';
      }
      if (rowField[j] == '' && rowGame[j] != 'x') {
        isComplete = false;
      }
    };
    
  };
  if (isComplete) {
    return 'won';
  } else {
    return 'started';
  }
}

function getNextVal(fieldCell, markerCounter) {
  if (markerCounter == 1) {
    return fieldCell == '' ? 'x' : 'm';
  } else if (markerCounter == 2) {
    return 'f';
  } else {
    return '?';
  }
}


// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
  