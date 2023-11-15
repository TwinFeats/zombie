var MindSweeper = (function() {
	var playerName, boardWidth, boardHeight, numBrains, numShotguns;
	var board = [];
	var clues = [];
	
	function getBoardWidth() {
		return boardWidth;
	}
	
	function getBoardHeight() {
		return boardHeight;
	}
	
	function getNumBrains() {
		return numBrains;
	}
	
	function getNumShotguns() {
		return numShotguns;
	}
	
	function newGame(name, width, height, brains, shotguns) {
		board = [];
		clues = [];
		if (arguments.length == 5) {
			playerName = name;
			boardWidth = width;
			boardHeight = height;
			numBrains = brains;
			numShotguns = shotguns;
		}
		for (var i = 0; i < boardHeight; i++) {
			board[i] = new Array(boardWidth);			
			clues[i] = new Array(boardWidth);
			for (var j = 0; j < boardWidth; j++) {
				board[i][j] = {shotgun: 0, brain: 0, hasBrain: false, hasShotgun: false};
				clues[i][j] = "";
			}
		}
		for (i = 0; i < numBrains; i++) {
			do {
				var row = Math.floor(Math.random() * boardHeight);
				var column = Math.floor(Math.random() * boardWidth);
			} while (board[row][column].hasBrain);
			board[row][column].hasBrain = true;
		}
		
		for (i = 0; i < numShotguns; i++) {
			do {
				var row = Math.floor(Math.random() * boardHeight);
				var column = Math.floor(Math.random() * boardWidth);
			} while (board[row][column].hasBrain || board[row][column].hasShotgun);
			board[row][column].hasShotgun = true;
		}
		
		for (row = 0; row < boardHeight; row++) {
			for (col = 0; col < boardWidth; col++) {
				if (board[row][col].hasBrain) {
					for (var newRow = row - 1; newRow <= row + 1; newRow++) {
						for (var newCol = col - 1; newCol <= col + 1; newCol++) {
							if ((newRow >= 0 && newRow < boardHeight) && 
								(newCol >= 0 && newCol < boardWidth)) {
								if (!board[newRow][newCol].hasBrain && !board[newRow][newCol].hasShotgun) {
									board[newRow][newCol].brain += 1;
								}
							}
						}
					}
				}
				else if (board[row][col].hasShotgun) {
					for (var newRow = row - 1; newRow <= row + 1; newRow++) {
						for (var newCol = col - 1; newCol <= col + 1; newCol++) {
							if ((newRow >= 0 && newRow < boardHeight) && 
								(newCol >= 0 && newCol < boardWidth)) {
								if (!board[newRow][newCol].hasBrain && !board[newRow][newCol].hasShotgun) {
									board[newRow][newCol].shotgun += 1;
								}
							}
						}
					}
				}
			}
		}
		
		return this;
	}
	
	function checkBoardShow(boardShow, row, col) {
		for (var i = 0; i < boardShow.length; i++) {
			if (boardShow[i].row == row && boardShow[i].col == col) {
				return true;
			}
		}
		
		return false;
	}
	
	function alreadyShown(row, col) {
		return clues[row][col] != "";
	}
	
	function updateBoard(row, col, boardShow) {
		if (alreadyShown(row,col)) {
			return;
		}
		boardShow.push({
			row: row,
			col: col,
			value: board[row][col]
		});
		if (board[row][col].hasShotgun) {
			console.log("You lose");
			return "You lose";
		}
		if (board[row][col].hasBrain) {
			return boardShow;
		}
		
		if (board[row][col].brain == 0 && board[row][col].shotgun == 0) {
			for (var newRow = row - 1; newRow <= row + 1; newRow++) {
				for (var newCol = col -1; newCol <= col + 1; newCol++) {
					if ((newRow >= 0 && newRow < board.length) && 
							(newCol >= 0 && newCol < board[newRow].length)) {						
						if (!(newRow == row && newCol == col) && !alreadyShown(newRow,newCol)) {							
							if (!checkBoardShow(boardShow, newRow, newCol)) {
								if (board[newRow][newCol].brain == 0 && board[newRow][newCol].shotgun == 0) {
									updateBoard(newRow, newCol, boardShow);
								}
								else {
									if (!checkBoardShow(boardShow, newRow, newCol)) {
										boardShow.push({
											row: newRow,
											col: newCol,
											value: board[newRow][newCol]
										})
									}
								}
							}
						}
					}
				}
			}
		}
		return boardShow;
	}
	
	function getBoard() {
		return board;
	}
	
	function makePlay(row, col) {
		var results = updateBoard(row,col,[]);
		if (Array.isArray(results)) {
			for (var i=0;i<results.length;i++) {
				clues[results[i].row][results[i].col] = results[i].value;
			}
		}
		return results;
	}
	
	function getEmpty() {
		var list = [];
		for (var r=0;r<boardHeight;r++) {
			for (var c=0;c<boardWidth;c++) {
				if (!board[r][c].hasShotgun && !board[r][c].hasBrain && board[r][c].brain == 0 && board[r][c].shotgun == 0) {
					list.push({row:r, col:c});
				}
			}
		}
		return list;
	}
	
	return {
		newGame: newGame,
		makePlay: makePlay,
		getBoard: getBoard,
		getBoardHeight: getBoardHeight,
		getBoardWidth: getBoardWidth,
		getNumBrains: getNumBrains,
		getNumShotguns: getNumShotguns,
		alreadyShown: alreadyShown,
		getEmpty: getEmpty
	}
});