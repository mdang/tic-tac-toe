console.log('app.js loaded');

import { randomColor } from './utilities.js';

((window, document) => {
  const gameTypeSelector = document.getElementById('game-type');
  const formOptions = document.getElementById('form-options');

  const getRowNum = () => {
    return document.getElementById('row-num').value;
  }

  const getGameType = () => {
    return gameTypeSelector.options[gameTypeSelector.selectedIndex].value;
  }

  const createBox = (id, numRows, brightnessLevel=100) => {
    const board = document.querySelector('.board');
    const box = document.createElement('div');
    
    box.setAttribute('id', id);
    box.setAttribute('class', 'box');
    box.setAttribute('style', `background: ${ randomColor(brightnessLevel) }; width: calc((100% - (8 * ${ numRows }px)) / ${ numRows }); height: calc((100% - (8 * ${ numRows }px)) / ${ numRows })`);

    board.append(box);
  }

  const reset = () => {
    const board = document.querySelector('.board');

    while (board.hasChildNodes()) {
      board.removeChild(board.lastChild);
    }
  }

  const buildGameBoard = numRows => {
    reset();
    
    const totalBoxes = numRows * numRows;
    const board = document.querySelector('.board');

    for (let i = 1; i <= totalBoxes; i++) {
      createBox(i, numRows);
    }
  }

  gameTypeSelector.addEventListener('change', () => {
    const gameType = getGameType();

    switch (gameType) {
      case 'n-in-a-row':
        document.getElementById('row-num-container').setAttribute('style', 'display: block');
        buildGameBoard(document.getElementById('row-num').value);
        
        break;
      case 'random':
      default: 
        document.getElementById('row-num-container').setAttribute('style', 'display: none');
        buildGameBoard(3);
    }
  });

  formOptions.addEventListener('submit', e => {
    e.preventDefault();

    buildGameBoard(getRowNum());
  });

  // Initialize the game
  buildGameBoard(getRowNum());
})(window, document);