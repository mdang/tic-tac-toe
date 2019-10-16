import { randomColor } from './utilities.js';
import constants from './constants.js';

{
  const gameTypeSelect = document.querySelector(constants.SELECTOR_GAME_TYPE);
  const formOptions = document.querySelector(constants.SELECTOR_FORM_OPTIONS);
  const rowNumContainer = document.querySelector(constants.SELECTOR_ROW_NUM_CONTAINER);
  const rowNumInput = document.querySelector(constants.SELECTOR_ROW_NUM);
  const board = document.querySelector(constants.SELECTOR_BOARD);
  const nextPlayerName = document.querySelector(constants.SELECTOR_NEXT_NAME);
  const nextPlayerMarker = document.querySelector(constants.SELECTOR_NEXT_MARKER);

  const results = {};
  const players = {
    [constants.PLAYER_1]: {
      name: 'Player 1',
      marker: 'X',
      score: 0
    },
    [constants.PLAYER_2]: {
      name: 'Player 2',
      marker: 'O',
      score: 0
    }
  };

  let currentTurn = constants.PLAYER_1;
  let totalGamesPlayed = 0;
  let totalTurns = 0;

  const getRowNum = () => {
    return getGameType() === constants.GAME_TYPE_N_IN_A_ROW ? 
      rowNumInput.value : 
      constants.DEFAULT_ROW_NUM;
  }

  const getGameType = () => {
    return gameTypeSelect.options[gameTypeSelect.selectedIndex].value;
  }

  const swapPlayers = () => {
    if (getGameType() === constants.GAME_TYPE_RANDOM) {
      alert('Not implemented');
    } else {
      currentTurn = (currentTurn === constants.PLAYER_1) ? constants.PLAYER_2 : constants.PLAYER_1;
    }

    nextPlayerName.innerText = players[currentTurn].name;
    nextPlayerMarker.innerText = players[currentTurn].marker;
  }

  const getRowsPlayed = (completed=true) => {
    const out = [];

    for (let i = 1; i <= (getRowNum() * getRowNum()); i += getRowNum()) {
      let row = [];
      for (let j = i; j < (i + getRowNum()); j++) {
        row.push(results[j] ? results[j] : null);
      }

      out.push(row);
    }

    if (completed) {
      return out.filter(row => {
        return !row.includes(null);
      })
    }

    return out;
  }

  const getColumnsPlayed = (completed=true) => {
    const out = [];

    for (let i = 1; i <= getRowNum(); i++) {
      let col = [];
      
      for (let j = i; j <= (getRowNum() * getRowNum()); j += getRowNum()) {
        col.push(results[j] ? results[j] : null);
      }

      out.push(col);
    }

    if (completed) {
      return out.filter(col => {
        return !col.includes(null);
      })
    }

    return out;
  }

  const getDiagonalsPlayed = (completed=true) => {
    const out = [];
    const diag1 = [];
    const diag2 = [];
    const rowNum = parseInt(getRowNum(), 10);
    
    for (let i = 1; i <= (rowNum * rowNum + 1); i += (rowNum + 1)) {
      // console.log('i-1', i);
      diag1.push(results[i] ? results[i] : null);
    }

    out.push(diag1);
    
    for (let j = (rowNum * rowNum) - rowNum + 1; j >= rowNum; j -= (rowNum - 1)) {
      // console.log('j-2', j);
      diag2.push(results[j] ? results[j] : null);
    }

    out.push(diag2);

    // console.log('out', out);

    if (completed) {
      return out.filter(diag => {
        return !diag.includes(null);
      })
    }

    return out;
  }

  const checkWinnerRows = () => {
    return isWellPlayed(getRowsPlayed());
  }

  const checkWinnerColumns = () => {
    return isWellPlayed(getColumnsPlayed());
  }

  const checkWinnerDiagonals = () => {
    return isWellPlayed(getDiagonalsPlayed());
  }

  const isWellPlayed = (boxes) => {
    const winningBoxes = boxes.filter(box => {
      let winner = true;

      for (let i = 0; i < box.length - 1; i++) {
        if (box[i] !== box[i + 1]) {
          winner = false;
        }
      }

      return winner;
    })

    return winningBoxes;
  }

  const isDraw = () => {
    // @TODO: Make this smarter, calculate when there isn't a way for someone to win even with plays left
    return Object.keys(results).length === (getRowNum() * getRowNum());
  }

  const isWinner = () => {
    // Can't be a winner if there hasn't been enough turns 
    if (totalTurns < getRowNum()) {
      return false;
    }

    return (checkWinnerRows().length || checkWinnerColumns().length || checkWinnerDiagonals().length);
  }

  const handleGameChange = e => {
    switch (getGameType()) {
      case constants.GAME_TYPE_N_IN_A_ROW:
        showRowNum();
        buildGameBoard(getRowNum());
        
        break;
      case constants.GAME_TYPE_RANDOM:
      case constants.GAME_TYPE_DEFAULT:
      default:
        hideRowNum();
        buildGameBoard(constants.DEFAULT_ROW_NUM);
    }
  }

  const handleSubmit = e => {
    e.preventDefault();
    buildGameBoard(getRowNum());
  }

  const handleBoxClick = e => {
    const box = e.target;

    if (box.innerText) {
      return;
    }

    const marker = (currentTurn === constants.PLAYER_1) ? 
      players[constants.PLAYER_1].marker : 
      players[constants.PLAYER_2].marker

    totalTurns++;

    box.innerText = marker;
    results[box.getAttribute('id')] = marker;

    if (isWinner()) {
      console.log('we have a winner!');
      totalGamesPlayed++;
    } else if (isDraw()) {
      console.log('we in a draw');
      totalGamesPlayed++;
    } else {
      swapPlayers();
    }
  }

  const createBox = (id, numRows, brightnessLevel=100) => {
    const box = document.createElement('div');
    
    box.setAttribute('id', id);
    box.setAttribute('class', constants.SELECTOR_BOX.slice(1));

    box.style.background = `${ randomColor(brightnessLevel) }`;
    box.style.width = `calc((100% - (${ constants.BOARD_PADDING } * ${ numRows }px)) / ${ numRows })`;
    box.style.height = `calc((100% - (${ constants.BOARD_PADDING } * ${ numRows }px)) / ${ numRows })`;

    box.addEventListener('click', handleBoxClick);

    return box;
  }

  const hideRowNum = () => {
    rowNumContainer.style.display = 'none';
  }

  const showRowNum = () => {
    rowNumContainer.style.display = 'block';
  }

  const reset = () => {
    while (board.hasChildNodes()) {
      board.removeChild(board.lastChild);
    }
  }

  const buildGameBoard = numRows => {
    reset();
    
    for (let i = 1; i <= (numRows * numRows); i++) {
      board.append(createBox(i, numRows));
    }
  }

  const registerEventHandlers = () => {
    gameTypeSelect.addEventListener('change', handleGameChange);
    formOptions.addEventListener('submit', handleSubmit);
  }

  const init = () => {
    registerEventHandlers();
    buildGameBoard(constants.DEFAULT_ROW_NUM);
  }

  // Get the party started
  init();
}