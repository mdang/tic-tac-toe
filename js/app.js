console.log('app.js loaded');

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

  let currentTurn = constants.PLAYER_1;
  let players = {};
  players[constants.PLAYER_1] = {
    name: 'Player 1',
    score: 0,
    marker: 'X'
  }
  players[constants.PLAYER_2] = {
    name: 'Player 2',
    score: 0,
    marker: 'O'
  }

  const getRowNum = () => {
    return rowNumInput.value;
  }

  const getGameType = () => {
    return gameTypeSelect.options[gameTypeSelect.selectedIndex].value;
  }

  const changeTurn = () => {
    if (getGameType() === constants.GAME_TYPE_RANDOM) {
      alert('not implemented');
    } else {
      currentTurn = (currentTurn === constants.PLAYER_1) ? constants.PLAYER_2 : constants.PLAYER_1;
    }

    // Next up
    nextPlayerName.innerText = players[currentTurn].name;
    nextPlayerMarker.innerText = players[currentTurn].marker;
  }

  const handleGameChange = e => {
    const gameType = getGameType();

    switch (gameType) {
      case constants.GAME_TYPE_N_IN_A_ROW:
        showRowNum();
        buildGameBoard(rowNumInput.value);
        
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

    box.innerText = (currentTurn === constants.PLAYER_1) ? 
      players[constants.PLAYER_1].marker : 
      players[constants.PLAYER_2].marker

    changeTurn();
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
    
    const totalBoxes = numRows * numRows;

    for (let i = 1; i <= totalBoxes; i++) {
      const box = createBox(i, numRows);
      board.append(box);
    }
  }

  const addEventHandlers = () => {
    gameTypeSelect.addEventListener('change', handleGameChange);
    formOptions.addEventListener('submit', handleSubmit);
  }

  // Initialize the game
  addEventHandlers();
  buildGameBoard(constants.DEFAULT_ROW_NUM);
}