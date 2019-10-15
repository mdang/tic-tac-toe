console.log('app.js loaded');

import { randomColor } from './utilities.js';
import constants from './constants.js';

{
  const gameTypeSelect = document.querySelector(constants.SELECTOR_GAME_TYPE);
  const formOptions = document.querySelector(constants.SELECTOR_FORM_OPTIONS);
  const rowNumContainer = document.querySelector(constants.SELECTOR_ROW_NUM_CONTAINER);
  const rowNumInput = document.querySelector(constants.SELECTOR_ROW_NUM);
  const board = document.querySelector(constants.SELECTOR_BOARD);

  const getRowNum = () => {
    return rowNumInput.value;
  }

  const getGameType = () => {
    return gameTypeSelect.options[gameTypeSelect.selectedIndex].value;
  }

  const createBox = (id, numRows, brightnessLevel=100) => {
    const box = document.createElement('div');
    
    box.setAttribute('id', id);
    box.setAttribute('class', constants.SELECTOR_BOX.slice(1));

    box.style.background = `${ randomColor(brightnessLevel) }`;
    box.style.width = `calc((100% - (8 * ${ numRows }px)) / ${ numRows })`;
    box.style.height = `calc((100% - (8 * ${ numRows }px)) / ${ numRows })`;

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
    gameTypeSelect.addEventListener('change', e => {
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
    });
  
    formOptions.addEventListener('submit', e => {
      e.preventDefault();
      buildGameBoard(getRowNum());
    });
  }

  // Initialize the game
  addEventHandlers();
  buildGameBoard(constants.DEFAULT_ROW_NUM);
}