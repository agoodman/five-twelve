var args = arguments[0] || {};
var board;
var cells;
var labels;
var score;

var addTile = function() {
	var found = false;
	var x, y;
	while (!found) {
		x = Math.floor(Math.random() * 4);
		y = Math.floor(Math.random() * 4);
		if (board[x][y] == 0) {
			found = true;
		}
	}

	board[x][y] = 2;
	labels[x][y].text = board[x][y];
	
	score += 2;
};

var canAddTile = function() {
	for (var i = 0; i < 4; i++) {
		for (var j = 0; j < 4; j++) {
			if (board[i][j] == 0) {
				return true;
			}
		}
	}
	return false;
};

var canCollapseTiles = function() {
	for(var i=0;i<4;i++) {
		for(var j=0;j<3;j++) {
			if( board[i][j]!=0 && board[i][j]==board[i][j+1] ) {
				return true;
			}
		}
	}
	for(var j=0;j<4;j++) {
		for(var i=0;i<3;i++) {
			if( board[i][j]!=0 && board[i][j]==board[i+1][j] ) {
				return true;
			}
		}
	}
	return false;
};

var collapseRows = function() {
	for (var i = 0; i < 4; i++) {
		for (var j = 0; j < 3; j++) {
			if (board[i][j] != 0 && board[i][j] == board[i][j + 1]) {
				board[i][j] *= 2;
				board[i][j + 1] = 0;
				score += board[i][j];
			}
		}
	}
};

var collapseCols = function() {
	for (var j = 0; j < 4; j++) {
		for (var i = 0; i < 3; i++) {
			if (board[i][j] != 0 && board[i][j] == board[i+1][j]) {
				board[i][j] *= 2;
				board[i+1][j] = 0;
				score += board[i][j];
			}
		}
	}
};

var initBoard = function() {
	$.board.removeAllChildren();
	board = [];
	cells = [];
	labels = [];
	for (var i = 0; i < 4; i++) {
		board[i] = [];
		cells[i] = [];
		labels[i] = [];
		for (var j = 0; j < 4; j++) {
			board[i][j] = 0;
			cells[i][j] = Ti.UI.createView({
				width : 80,
				height : 80,
				backgroundColor : "#ffffff",
			});
			labels[i][j] = Ti.UI.createLabel({
				top : 5,
				left : 5,
				width : 70,
				height : 70,
				textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER,
				backgroundColor : "#88aaaa",
				color : "#ffffff",
			});
			cells[i][j].add(labels[i][j]);
			$.board.add(cells[i][j]);
		}
	}
	addTile();
};

var isRowEmpty = function(aRow, aCol, aDir) {
	var isEmpty = true;
	if (aDir) {
		for (var j = aCol || 0; j < 4; j++) {
			if (board[aRow][j] > 0) {
				isEmpty = false;
				break;
			}
		}
		return isEmpty;
	} else {
		for (var j = aCol || 3; j >= 0; j--) {
			if (board[aRow][j] > 0) {
				isEmpty = false;
				break;
			}
		}
		return isEmpty;
	}
};

var isColEmpty = function(aCol, aRow, aDir) {
	var isEmpty = true;
	if (aDir) {
		for (var i = aRow || 0; i < 4; i++) {
			if (board[i][aCol] > 0) {
				isEmpty = false;
				break;
			}
		}
		return isEmpty;
	} else {
		for (var i = aRow || 3; i >= 0; i--) {
			if (board[i][aCol] > 0) {
				isEmpty = false;
				break;
			}
		}
		return isEmpty;
	}
};

var printBoard = function() {
	for (var i = 0; i < 4; i++) {
		var tRow = "";
		for (var j = 0; j < 4; j++) {
			tRow += board[i][j] + " ";
		}
		Ti.API.info(tRow);
	}
};

var renderBoard = function() {
	// paint cells
	$.lblScore.text = score;
	for (var i = 0; i < 4; i++) {
		for (var j = 0; j < 4; j++) {
			if (board[i][j] > 0) {
				labels[i][j].text = board[i][j];
			} else {
				labels[i][j].text = null;
			}
		}
	}
};

var resetBoard = function() {
	score = 0;
};

var settleDown = function() {
	// process each col of the board
	for (var j = 0; j < 4; j++) {
		// check for empty col
		if (isColEmpty(j)) {
			Ti.API.info("col " + j + " is empty");
			continue;
		} else {
			Ti.API.info("col " + j + " is not empty");
		}

		// shift non-zero values to the bottom
		for (var i = 3; i > 0; i--) {
			var attempts = 0;
			while (attempts++ < 4 && board[i][j] == 0) {
				Ti.API.info("shifting rows in " + j + " above " + i + " downward");
				for (var k = i; k > 0; k--) {
					Ti.API.info("shift " + (k - 1) + "," + j + "(" + board[k-1][j] + ") to " + k + "," + j);
					board[k][j] = board[k-1][j];
					board[k-1][j] = 0;
					printBoard();
				}
			}
		}
	}
};

var settleLeft = function() {
	// process each row of the board
	for (var i = 0; i < 4; i++) {
		// check for empty row
		if (isRowEmpty(i)) {
			Ti.API.info("row " + i + " is empty");
			continue;
		} else {
			Ti.API.info("row " + i + " is not empty");
		}

		// shift non-zero values to the left
		for (var j = 0; j < 4; j++) {
			while (!isRowEmpty(i, j + 1, true) && board[i][j] == 0) {
				Ti.API.info("shifting cols in " + i + " right of " + j + " to the left");
				for (var k = j; k < 3; k++) {
					Ti.API.info("shift " + i + "," + (k + 1) + "(" + board[i][k + 1] + ") to " + i + "," + k);
					board[i][k] = board[i][k + 1];
					board[i][k + 1] = 0;
				}
				printBoard();
			}
		}
	}
};

var settleRight = function() {
	// process each row of the board
	for (var i = 0; i < 4; i++) {
		// check for empty row
		if (isRowEmpty(i)) {
			Ti.API.info("row " + i + " is empty");
			continue;
		} else {
			Ti.API.info("row " + i + " is not empty");
		}

		// shift non-zero values to the right
		for (var j = 3; j > 0; j--) {
			var attempts = 0;
			while (attempts++ < 4 && !isRowEmpty(i, j - 1, false) && board[i][j] == 0) {
				Ti.API.info("shifting cols in " + i + " left of " + j + " to the right");
				for (var k = j; k > 0; k--) {
					Ti.API.info("shift " + i + "," + (k - 1) + "(" + board[i][k - 1] + ") to " + i + "," + k);
					board[i][k] = board[i][k - 1];
					board[i][k - 1] = 0;
					printBoard();
				}
			}
		}
	}
};

var settleUp = function() {
	// process each col of the board
	for (var j = 0; j < 4; j++) {
		// check for empty col
		if (isColEmpty(j)) {
			Ti.API.info("col " + j + " is empty");
			continue;
		} else {
			Ti.API.info("col " + j + " is not empty");
		}

		// shift non-zero values to the top
		for (var i = 0; i < 4; i++) {
			var attempts = 0;
			while (attempts++ < 4 && board[i][j] == 0) {
				Ti.API.info("shifting rows in " + j + " below " + i + " upward");
				for (var k = i; k < 3; k++) {
					Ti.API.info("shift " + (k + 1) + "," + j + "(" + board[k+1][j] + ") to " + k + "," + j);
					board[k][j] = board[k+1][j];
					board[k+1][j] = 0;
					printBoard();
				}
			}
		}
	}
};

initBoard();
resetBoard();
renderBoard();

$.board.addEventListener('swipe', function(e) {
	Ti.API.info("swipe " + e.direction);
	if (canAddTile()) {
		addTile();
	} else if (!canCollapseTiles()) {
		Ti.API.info("game over");
		alert("game over");
		return;
	}
	if (e.direction == 'left') {
		settleLeft();
		collapseRows();
		settleLeft();
	} else if (e.direction == 'right') {
		settleRight();
		collapseRows();
		settleRight();
	} else if (e.direction == 'up') {
		settleUp();
		collapseCols();
		settleUp();
	} else if (e.direction == 'down') {
		settleDown();
		collapseCols();
		settleDown();
	}
	renderBoard();
});
