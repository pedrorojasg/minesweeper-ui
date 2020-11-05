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
      history: [{
        squares: Array(9).fill(null),
      }],
      stepNumber: 0,
    };
  }
  
  componentDidMount() {
    fetch("https://minesweeperdemo.herokuapp.com/games/d54540c9-604f-4429-9ead-a0c90eb5cf8c/")
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
    const status = calculateStatus(gameBoard);
    const squares = gameBoard.slice();
    
    console.log(status);
    if (status != 'started') {
      return;
    }
    console.log('pass');
    squares[i][j] = 'y';
    console.log(squares);
    this.setState({
      gameBoard: squares,
    });
  }

  jumpTo(step) {
    // Not used
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  render() {
    const gameBoard = this.state.gameBoard;
    const status = calculateStatus(gameBoard);

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
          <Board
            squares={this.state.gameBoard}
            onClick={(i,j) => this.handleClick(i,j)}
          />
        </div>
        <div className="game-info">
          <div>{resultMessage}</div>
        </div>
      </div>
    );
  }
}

function calculateStatus(squares) {
  return 'started';
}


// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
  