console.log('app.js loaded');

(function(window) {
  const gameTypeSelector = document.getElementById('game-type');

  // https://stackoverflow.com/a/17373688
  // Value from 0 - 255 for brightness level
  const randomColor = brightness => {
    const randomChannel = brightness => {
      let r = 255 - brightness;
      let n = 0|((Math.random() * r) + brightness);
      let s = n.toString(16);
      return (s.length === 1) ? '0' + s : s;
    }

    return '#' + randomChannel(brightness) + randomChannel(brightness) + randomChannel(brightness);
  }

  const createBox = (id, numRows, brightnessLevel=100) => {
    const board = document.querySelector('.board');
    const box = document.createElement('div');
    
    box.setAttribute('id', id);
    box.setAttribute('class', 'box');
    box.setAttribute('style', `background: ${ randomColor(brightnessLevel) }; width: calc((100% - (8 * ${ numRows }px)) / ${ numRows }); height: calc((100% - (8 * ${ numRows }px)) / ${ numRows })`);

    board.append(box);
  }

  const buildGameBoard = numRows => {
    // TODO: Clear game board 
    
    const totalBoxes = numRows * numRows;
    const board = document.querySelector('.board');

    for (let i = 1; i <= totalBoxes; i++) {
      createBox(i, numRows);
    }
  }

  gameTypeSelector.addEventListener('change', () => {
    const gameType = gameTypeSelector.options[gameTypeSelector.selectedIndex].value;

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

  // Initialize the game
  buildGameBoard(document.getElementById('row-num').value);
})(window);