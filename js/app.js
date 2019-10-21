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

  // Used to store all the plays during the current game
  const results = {};
  // Players available for this game
  const players = {
    [constants.PLAYER_1]: {
      // TODO Allow user to enter their name
      name: 'Player 1', 
      // TODO Allow user to select their marker 
      marker: 'X', 
      score: 0
    },
    [constants.PLAYER_2]: {
      // TODO Allow user to enter their name
      name: 'Player 2', 
      // TODO Allow user to select their marker
      marker: 'O',
      score: 0
    }
  };

  // Winning sequence of boxes and the position within the board of that sequence
  let winner = {};
  // Current player 
  let currentTurn = constants.PLAYER_1;
  // Total number of games played between these players
  let totalGamesPlayed = 0;
  // Total number of turns for the current game
  let totalTurns = 0;

  /**
   * Get the number of columns/rows the board contains
   * @return {number} 
   */
  const getRowNum = () => {
    return getGameType() === constants.GAME_TYPE_N_IN_A_ROW ? 
      parseInt(rowNumInput.value, 10) : 
      constants.DEFAULT_ROW_NUM;
  }

  /**
   * Get the type of game being played
   * @return {string} 
   */
  const getGameType = () => {
    return gameTypeSelect.options[gameTypeSelect.selectedIndex].value;
  }

  /**
   * Return a random player in the game
   * @return {string}
   */
  const getRandomPlayer = () => {
    const randomPlayers = Object.keys(players);

    return randomPlayers[Math.floor(Math.random() * randomPlayers.length)];
  }

  /**
   * Swap the players after a turn
   * @param {boolean} reset Whether a new game is being started
   * @return {void}
   */
  const swapPlayers = (reset=false) => {
    if (reset) {
      currentTurn = (getGameType() === constants.GAME_TYPE_RANDOM) ? getRandomPlayer() : constants.PLAYER_1;
    } else {
      currentTurn = (getGameType() === constants.GAME_TYPE_RANDOM) ? 
        getRandomPlayer() : 
        (currentTurn === constants.PLAYER_1) ? constants.PLAYER_2 : constants.PLAYER_1;
    }

    nextPlayerName.innerText = players[currentTurn].name;
    nextPlayerMarker.innerText = players[currentTurn].marker;
  }

  /**
   * Get the rows on the current board
   * @param {boolean} completed Only return rows that have been completed
   * @return {array} 
   */
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

  /**
   * Get the columns on the current board
   * @param {boolean} completed Only return columns that have been completed
   * @return {array} 
   */
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

  /**
   * Get the diagonals on the current board
   * @param {boolean} completed Only return diagonals that have been completed
   * @return {array} 
   */
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

  /**
   * Check the rows on the board for a win
   * @return {object} 
   */
  const checkWinnerRows = () => {
    return isWellPlayed(getRowsPlayed(), constants.CONTEXT_ROW);
  }

  /**
   * Check the columns on the board for a win
   * @return {object} 
   */
  const checkWinnerColumns = () => {
    return isWellPlayed(getColumnsPlayed(), constants.CONTEXT_COLUMN);
  }

  /**
   * Check the diagonals on the board for a win
   * @return {object} 
   */
  const checkWinnerDiagonals = () => {
    return isWellPlayed(getDiagonalsPlayed(), constants.CONTEXT_DIAGONAL);
  }

  /**
   * Determine if a sequence of boxes match
   * @param {array} boxes A series of boxes to check if they all match
   * @param {string} context How the current series of boxes are arranged on the board
   * @return {object} 
   */
  const isWellPlayed = (boxes, context) => {
    let j = 0;
    // Where the winning sequence exists on the board
    let position = null; 

    // Will only be populated if all the boxes within the series match
    const matches = boxes.filter(box => {
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

    return winner = {
      isWin: !!(matches.length),
      context: context,
      position: position,
      boxes: matches
    };
  }

  /**
   * Did the current turn result in a draw
   * @return {boolean} 
   */
  const isDraw = () => {
    // TODO: Make this smarter, calculate when there isn't a way for someone to win even with plays left
    return Object.keys(results).length === (getRowNum() * getRowNum());
  }

  /**
   * Did the current turn resulted in a win
   * @return {boolean} 
   */
  const isWinner = () => {
    // Can't be a winner if there hasn't been enough turns played
    if (totalTurns < getRowNum()) {
      return false;
    }

    return (checkWinnerRows().isWin || checkWinnerColumns().isWin || checkWinnerDiagonals().isWin);
  }

  /**
   * Display the winning sequence of the game
   * @return {void} 
   */
  const displayWinner = () => {
    const children = board.childNodes;
    const boxes = Array.from(children);
    const rowNum = getRowNum();
    const skip = [];

    // Determine which ones not to dim
    switch (winner.context) {
      case constants.CONTEXT_COLUMN:
        for (let c = winner.position + 1; c <= rowNum * rowNum; c += rowNum) {
          skip.push(c);
        }

        break;
      case constants.CONTEXT_DIAGONAL:
          if (winner.position === 0) {
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

        if (winner.position !== 0) {
          start = (winner.position * rowNum + 1);
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

  /**
   * Visually display a draw game
   * @return {void} 
   */
  const displayDraw = () => {
    const children = board.childNodes;
    const boxes = Array.from(children);

    boxes.forEach(box => {
      dimBox(box);
    });
  }

  /**
   * Dim a box element on the page
   * @return {void} 
   */
  const dimBox = box => {
    box.style.background = constants.DISPLAY_LOSING_BOX_BACKGROUND;
    box.style.color = constants.DISPLAY_LOSING_BOX_COLOR;
  }

  /**
   * Switch to a different game type
   * @return {void} 
   */
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

  /**
   * Handle a request to change the number of boxes in the game
   * @return {void} 
   */
  const handleSubmit = e => {
    e.preventDefault();
    buildGameBoard(getRowNum());
  }

  /**
   * Handle a request to add a marker to a box on the board
   * @return {void} 
   */
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
      removeBoxListeners();
      hideNextUp();
      displayWinner();
    } else if (isDraw()) {
      console.log('no where to go from here');
      updateTotalGames();
      removeBoxListeners();
      hideNextUp();
      displayDraw();
    }

    swapPlayers();
  }

  /**
   * Update the game score for players
   * @param {string} The player to update
   * @return {void} 
   */
  const updateGameScore = currentTurn => {
    const score = (currentTurn === constants.PLAYER_1) ? p1Score : p2Score;
    
    players[currentTurn].score++;
    score.innerText = players[currentTurn].score;
  }

  /**
   * Update the total games played
   * @return {void} 
   */
  const updateTotalGames = () => {
    totalGamesPlayed++;
    totalGames.innerText = totalGamesPlayed;
  }

  /**
   * Create a box element to place on the board
   * Depends on the `randomColor` utility function
   * @param {number} id Id of the box element
   * @param {number} numRows The number of boxes of each row/column on the board
   * @param {number} brightness The brightness level of the background color of the box
   * @return {element} 
   */
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

  /**
   * Hide the option to set the number of rows/columns
   * @return {void} 
   */
  const hideRowNum = () => {
    rowNumContainer.style.display = 'none';
  }

  /**
   * Show the option to set the number of rows/columns
   * @return {void} 
   */
  const showRowNum = () => {
    rowNumContainer.style.display = 'block';
  }

  /**
   * Hide the next player display
   * @return {void} 
   */
  const hideNextUp = () => {
    nextUp.style.display = 'none';
  }

  /**
   * Show the next player display
   * @return {void} 
   */
  const showNextUp = () => {
    nextUp.style.display = 'block';
  }

  /**
   * Remove the event handlers associated with all the boxes on the board
   * @return {void} 
   */
  const removeBoxListeners = () => {
    const children = board.childNodes;
    const boxes = Array.from(children);

    boxes.forEach(box => {
      box.removeEventListener('click', handleBoxClick);
    });
  }

  /**
   * Reset the current game 
   * @return {void} 
   */
  const reset = () => {
    Object.keys(results).forEach(key => delete results[key]);
    Object.keys(winner).forEach(key => delete winner[key]);
    
    removeBoxListeners();

    while (board.hasChildNodes()) {
      board.removeChild(board.lastChild);
    }
  }

  /**
   * Handle a new game request by the user
   * @return {void} 
   */
  const handleNewGame = e => {
    e.preventDefault();

    totalTurns = 0;

    swapPlayers(true);
    buildGameBoard(getRowNum());
    showNextUp();
  }

  /**
   * Handle a reset all request by the user
   * @return {void} 
   */
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

  /**
   * Build the game board based on the number of columns/rows requested
   * @param {number} numRows The number of rows/columns to build out
   * @return {void} 
   */
  const buildGameBoard = numRows => {
    reset();

    const fragment = document.createDocumentFragment();
    
    for (let i = 1; i <= (numRows * numRows); i++) {
      fragment.append(createBox(i, numRows));
    }

    board.append(fragment);
  }

  /**
   * Register the event handlers needed to make the game work
   * @return {void} 
   */
  const registerEventHandlers = () => {
    gameTypeSelect.addEventListener('change', handleGameChange);
    formOptions.addEventListener('submit', handleSubmit);
    newGame.addEventListener('click', handleNewGame);
    resetAll.addEventListener('click', handleResetAll);
  }

  /**
   * Run initialization sequence for a page load
   * @return {void} 
   */
  const init = () => {
    registerEventHandlers();
    buildGameBoard(constants.DEFAULT_ROW_NUM);
  }

  // Get the party started
  init();
}