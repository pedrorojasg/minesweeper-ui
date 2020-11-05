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
        onClick={() => this.props.onClick(i)}
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

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    const moves = history.map((step, move) => {
      const desc = move ?
        'Go to move #' + move :
        'Go to game start';
      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });

    let status;
    if (winner) {
      status = 'Winner: ' + winner;
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={this.state.fieldBoard}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

function calculateWinner(squares) {
  return null;
}


// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
  