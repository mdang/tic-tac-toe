console.log('app.js loaded');

(function(window) {
  

  

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
    const totalBoxes = numRows * numRows;
    const board = document.querySelector('.board');

    for (let i = 1; i <= totalBoxes; i++) {
      createBox(i, numRows);
    }
  }

  buildGameBoard(document.getElementById('row-num').value);
})(window);