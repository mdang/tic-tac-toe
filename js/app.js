import { qs, randomColor } from './utilities.js';
import constants from './constants.js';

{
  const gameTypeSelect = qs(constants.SELECTOR_GAME_TYPE);
  const formOptions = qs(constants.SELECTOR_FORM_OPTIONS);
  const rowNumContainer = qs(constants.SELECTOR_ROW_NUM_CONTAINER);
  const rowNumInput = qs(constants.SELECTOR_ROW_NUM);
  const board = qs(constants.SELECTOR_BOARD);
  const nextPlayerName = qs(constants.SELECTOR_NEXT_NAME);
  const nextPlayerMarker = qs(constants.SELECTOR_NEXT_MARKER);
  const nextUp = qs(constants.SELECTOR_NEXT_UP);
  const newGame = qs(constants.SELECTOR_NEW_GAME);
  const resetAll = qs(constants.SELECTOR_RESET_ALL);
  const p1Score = qs(constants.SELECTOR_PLAYER_1_SCORE);
  const p2Score = qs(constants.SELECTOR_PLAYER_2_SCORE);
  const totalGames = qs(constants.SELECTOR_TOTAL_GAMES);

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

  let winningBoxes = {};
  let currentTurn = constants.PLAYER_1;
  let totalGamesPlayed = 0;
  let totalTurns = 0;

  const getRowNum = () => {
    return getGameType() === constants.GAME_TYPE_N_IN_A_ROW ? 
      parseInt(rowNumInput.value, 10) : 
      constants.DEFAULT_ROW_NUM;
  }

  const getGameType = () => {
    return gameTypeSelect.options[gameTypeSelect.selectedIndex].value;
  }

  const getRandomPlayer = () => {
    const randomPlayers = Object.keys(players);

    return randomPlayers[Math.floor(Math.random() * randomPlayers.length)];
  }

  const swapPlayers = (reset=false) => {
    if (reset) {
      currentTurn = constants.PLAYER_1;
    } else {
      currentTurn = (getGameType() === constants.GAME_TYPE_RANDOM) ? 
        getRandomPlayer() : 
        (currentTurn === constants.PLAYER_1) ? constants.PLAYER_2 : constants.PLAYER_1;
    }

    nextPlayerName.innerText = players[currentTurn].name;
    nextPlayerMarker.innerText = players[currentTurn].marker;
  }

  const getRowsPlayed = (completed=false) => {
    const out = [];
    const rowNum = getRowNum();

    for (let i = 1; i <= (rowNum * rowNum); i += rowNum) {
      let row = [];
      for (let j = i; j < (i + rowNum); j++) {
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

  const getColumnsPlayed = (completed=false) => {
    const out = [];
    const rowNum = getRowNum();

    for (let i = 1; i <= rowNum; i++) {
      let col = [];
      
      for (let j = i; j <= (rowNum * rowNum); j += rowNum) {
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

  const getDiagonalsPlayed = (completed=false) => {
    const out = [];
    const diag1 = [];
    const diag2 = [];
    const rowNum = getRowNum();
    
    for (let i = 1; i <= (rowNum * rowNum + 1); i += (rowNum + 1)) {
      diag1.push(results[i] ? results[i] : null);
    }
    out.push(diag1);
    
    for (let j = (rowNum * rowNum) - rowNum + 1; j >= rowNum; j -= (rowNum - 1)) {
      diag2.push(results[j] ? results[j] : null);
    }
    out.push(diag2);

    if (completed) {
      return out.filter(diag => {
        return !diag.includes(null);
      })
    }

    return out;
  }

  const checkWinnerRows = () => {
    return isWellPlayed(getRowsPlayed(), constants.CONTEXT_ROW);
  }

  const checkWinnerColumns = () => {
    return isWellPlayed(getColumnsPlayed(), constants.CONTEXT_COLUMN);
  }

  const checkWinnerDiagonals = () => {
    return isWellPlayed(getDiagonalsPlayed(), constants.CONTEXT_DIAGONAL);
  }

  const isWellPlayed = (boxes, context) => {
    let j = 0;
    let position = null;

    const winning = boxes.filter(box => {
      let winner = true;

      for (let i = 0; i < box.length - 1; i++) {
        if (!box[i]) {
          j++;
          return false;
        }
        
        if (box[i] !== box[i + 1]) {
          winner = false;
        }
      }

      winner ? position = j : j++;

      return winner;
    })

    return winningBoxes = {
      context: context,
      position: position,
      winningBoxes: winning
    };
  }

  const isDraw = () => {
    // @TODO: Make this smarter, calculate when there isn't a way for someone to win even with plays left
    return Object.keys(results).length === (getRowNum() * getRowNum());
  }

  const isWinner = () => {
    // Can't be a winner if there hasn't been enough turns played
    if (totalTurns < getRowNum()) {
      return false;
    }

    return (checkWinnerRows().winningBoxes.length || checkWinnerColumns().winningBoxes.length || checkWinnerDiagonals().winningBoxes.length);
  }

  const displayWinner = () => {
    const children = board.childNodes;
    const boxes = Array.from(children);
    const rowNum = getRowNum();
    const skip = [];

    // Determine which ones not to dim
    switch (winningBoxes.context) {
      case constants.CONTEXT_COLUMN:
        for (let c = winningBoxes.position + 1; c <= rowNum * rowNum; c += rowNum) {
          skip.push(c);
        }

        break;
      case constants.CONTEXT_DIAGONAL:
          if (winningBoxes.position === 0) {
            for (let i = 1; i <= (rowNum * rowNum + 1); i += (rowNum + 1)) {
              skip.push(i);
            }
          } else {
            for (let j = (rowNum * rowNum) - rowNum + 1; j >= rowNum; j -= (rowNum - 1)) {
              skip.push(j);
            }
          }

        break;
      case constants.CONTEXT_ROW:
      default:
        let start = 1;

        if (winningBoxes.position !== 0) {
          start = (winningBoxes.position * rowNum + 1);
        }

        for (let r = start; r < start + rowNum; r++) {
          skip.push(r);
        }
    }

    const filteredBoxes = boxes.filter(box => {
      return !(skip.includes(parseInt(box.id, 10)));
    });

    filteredBoxes.forEach(box => {
      dimBox(box);
    });
  }

  const displayDraw = () => {
    const children = board.childNodes;
    const boxes = Array.from(children);

    boxes.forEach(box => {
      dimBox(box);
    });
  }

  const dimBox = box => {
    box.style.background = constants.DISPLAY_LOSING_BOX_BACKGROUND;
    box.style.color = constants.DISPLAY_LOSING_BOX_COLOR;
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
      players[constants.PLAYER_2].marker;

    totalTurns++;

    box.innerText = marker;
    results[box.id] = marker;

    if (isWinner()) {
      console.log('winner winner, chicken dinner!');
      updateGameScore(currentTurn);
      updateTotalGames();
      removeBoxEventListeners();
      hideNextUp();
      displayWinner();
    } else if (isDraw()) {
      console.log('no where to go from here');
      updateTotalGames();
      removeBoxEventListeners();
      hideNextUp();
      displayDraw();
    }

    swapPlayers();
  }

  const updateGameScore = currentTurn => {
    const score = (currentTurn === constants.PLAYER_1) ? p1Score : p2Score;
    
    players[currentTurn].score++;
    score.innerText = players[currentTurn].score;
  }

  const updateTotalGames = () => {
    totalGamesPlayed++;
    totalGames.innerText = totalGamesPlayed;
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

  const hideNextUp = () => {
    nextUp.style.display = 'none';
  }

  const showNextUp = () => {
    nextUp.style.display = 'block';
  }

  const removeBoxEventListeners = () => {
    const children = board.childNodes;
    const boxes = Array.from(children);

    boxes.forEach(box => {
      box.removeEventListener('click', handleBoxClick);
    });
  }

  const reset = () => {
    Object.keys(results).forEach(key => delete results[key]);
    Object.keys(winningBoxes).forEach(key => delete winningBoxes[key]);
    
    removeBoxEventListeners();

    while (board.hasChildNodes()) {
      board.removeChild(board.lastChild);
    }
  }

  const handleNewGame = e => {
    e.preventDefault();

    swapPlayers(true);
    buildGameBoard(getRowNum());
    showNextUp();
  }

  const handleResetAll = e => {
    e.preventDefault();

    currentTurn = constants.PLAYER_1;
    totalGamesPlayed = 0;
    totalTurns = 0;
    players[constants.PLAYER_1].score = 0;
    players[constants.PLAYER_2].score = 0;
    gameTypeSelect.options.selectedIndex = 0;
    p1Score.innerText = 0;
    p2Score.innerText = 0;

    swapPlayers(true);
    buildGameBoard(constants.DEFAULT_ROW_NUM);
    updateTotalGames();
    showNextUp();
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
    newGame.addEventListener('click', handleNewGame);
    resetAll.addEventListener('click', handleResetAll);
  }

  const init = () => {
    registerEventHandlers();
    buildGameBoard(constants.DEFAULT_ROW_NUM);
  }

  // Get the party started
  init();
}