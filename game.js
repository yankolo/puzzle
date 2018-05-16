var game = {};

var timerInterval;
var currentAnimationTimeOut;
var gameReadyToSave = false;

function playGame(imageSrc, array, moves, seconds) {
	var board = document.querySelector("#board");
	var movesCounter = document.querySelector("#moves-counts");
	var timer = document.querySelector("#stopwatch");
	var nullIndex;
	
	game.image = imageSrc;
	
	if (array !== undefined && moves !== undefined && seconds !== undefined) {
		game.moves = moves;
		game.totalSeconds = seconds;
		game.array = array;
		
		nullIndex = findNullIndex();
		
		setImages();
		
		recreateBoard();
		movesCounter.innerHTML = game.moves;
		timer.innerHTML = formatTime(game.totalSeconds);
		
		setUserInputs();
		startTimer();
		gameReadyToSave = true;
	} else {
		game.moves = 0;
		game.totalSeconds = 0;
		game.array = [
    		[0, 1, 2, 3],
    		[4, 5, 6, 7],
    		[8, 9, 10, 11],
			[12, 13, 14, 15]
		];
			
		nullIndex = findNullIndex();
		
		setImages();
		
		shuffle(150, 25);
	}
	
	function movePiece (index) {
		var startIndex = index;
		var endIndex = nullIndex;
		var move = new Move(startIndex, endIndex);
		
		var temp = game.array[index.row][index.col];
		game.array[index.row][index.col] = 15;
		game.array[nullIndex.row][nullIndex.col] = temp;
		
		nullIndex = index;
		
		return move;
	}
	
	function pieceClick(e) {
		var index = getarrayIndex(e.currentTarget);
		var move = movePiece(index);
		
		clearActivePieces();
		animateMove(move, callback);
		
		function callback() {
			rearrangeBoardDivs(move);
			
			if (verifyIfWin()) {
				stopGame();
				if (typeof(Storage) !== "undefined") {
					saveHighScore(game.totalSeconds, game.moves);
				}
				console.log("win!");
			} else {
				setUserInputs();
			}
		}
		
		incrementMoves();
	}
	
	function animateMove(move, callback) {
		var startDiv = board.children[getNodeIndex(move.startIndex)];
		
		var animationTime = parseFloat(window.getComputedStyle(board).getPropertyValue("transition-duration")) * 1000;
	
		startDiv.style.top = (6 + move.endIndex.row * 122) + "px";
		startDiv.style.left = (6 + move.endIndex.col * 122) + "px";
		
		currentAnimationTimeOut = setTimeout(callback, animationTime);
	}
	
	function rearrangeBoardDivs(move) {
		var startDiv = board.children[getNodeIndex(move.startIndex)];
		var endDiv = board.children[getNodeIndex(move.endIndex)];
		
		var temp = document.createElement("div");
		board.insertBefore(temp, startDiv);
		
		board.insertBefore(startDiv, endDiv);
		board.insertBefore(endDiv, temp);
		
		board.removeChild(temp);
	}

	function startTimer() {
		timerInterval = setInterval(function() {
			game.totalSeconds += 1;
			
			timer.innerHTML = formatTime(game.totalSeconds);
		}, 1000);
		
	}
	
	function incrementMoves () {
		game.moves++;
		movesCounter.innerHTML = game.moves;
	}
	
	function setUserInputs() {
		var clickableIndexes = getClickableIndexes();
		
		for (var i = 0; i < clickableIndexes.length; i++) {
			var div = board.children[getNodeIndex(clickableIndexes[i])];
			
			div.className = "active-piece";
			div.addEventListener("click", pieceClick, false);
		}
	}

	function clearActivePieces() {
		var active_pieces = board.getElementsByClassName("active-piece");
		while (active_pieces.length != 0) {
			active_pieces[0].removeEventListener("click", pieceClick, false);
			active_pieces[0].classList.remove("active-piece");
		}
		
	}

	function getarrayIndex(div) {
		var parent = div.parentElement;
		
		var childIndex;
		for (var i = 0; i < parent.children.length; i++) 
			if (parent.children[i] == div)
				childIndex = i;
				
		return new Index(Math.floor(childIndex / 4), childIndex % 4);
	}
	
	function getNodeIndex(arrayIndex) {
		return arrayIndex.row * 4 + arrayIndex.col;
	}
		
	
	function shuffle (moves, moveTime) {
		board.style.transitionDuration = (moveTime / 1000) + "s";
		
		// Setup previous index so the board shuffles better (will not redo the same move)
		var previousIndex = new Index(0, 0);
		
		var counter = 0;
		movePieceRandomly();
		
		function movePieceRandomly() {
			var clickableIndexes = getClickableIndexes();
			var randomIndex;
			do {
				randomIndex = clickableIndexes[Math.floor(Math.random() * clickableIndexes.length)];
			} while (game.array[randomIndex.row][randomIndex.col] == game.array[previousIndex.row][previousIndex.col]);
			previousIndex = nullIndex;
			
			var move = movePiece(randomIndex);
			
			animateMove(move, callback);
			
			counter++;
			
			function callback() {
				rearrangeBoardDivs(move);
				
				if (counter < moves)
					movePieceRandomly();
				else {
					moveNullToCorner();
				}
			}
		}
	}
	
	function moveNullToCorner() {
		var newIndex = new Index(nullIndex.row + 1, nullIndex.col);
		
		if (!isInRange(newIndex))
			newIndex = new Index(nullIndex.row, nullIndex.col + 1);
		
		if (isInRange(newIndex)) {
			var move = movePiece(newIndex);
			animateMove(move, function () {
				rearrangeBoardDivs(move);
				moveNullToCorner();
			});
		} else {
			board.style.transitionDuration = "0.200s";
			setUserInputs();
			startTimer();
			gameReadyToSave = true;
		}
	}
	
	function findNullIndex () {
		for (var row = 0; row < game.array.length; row++)
			for (var col = 0; col < game.array.length; col++)
				if (game.array[row][col] === 15)
					return new Index(row, col);
	}
	
	function getClickableIndexes () {
		var possibleIndexes = [
			new Index(nullIndex.row + 1, nullIndex.col), 
			new Index(nullIndex.row - 1, nullIndex.col), 
			new Index(nullIndex.row, nullIndex.col + 1), 
			new Index(nullIndex.row, nullIndex.col - 1)
		];
		
		var clickableIndexes = [];
		for (var i = 0; i < possibleIndexes.length; i++) {
			if (isInRange(possibleIndexes[i])) {
				clickableIndexes.push(possibleIndexes[i]);
			}
		}
		
		return clickableIndexes;
	}
	
	function isInRange(index) {
		if (index.row < 0 || index.col < 0 || index.row >= game.array.length || index.col >= game.array.length) {
			return false;
		}
		return true;
	}
	
	function setImages() {
		var url = "url('" + game.image + "')";
		for (var i = 0; i < 15; i++) {
			var index = getarrayIndex(board.children[i]);
			board.children[i].style.backgroundImage = url;
			board.children[i].style.backgroundPosition = "left -" + (index.col * 120) +"px top -" + (index.row * 120) + "px";
		}
	}
	
	function recreateBoard() {
		var temp = document.createElement("div");
		for (var row = 0; row < game.array.length; row++) 
			for (var col = 0; col < game.array[row].length; col++) {
				var pieceDiv = board.querySelector("#piece" + game.array[row][col]);
				temp.appendChild(pieceDiv);
			}
		board.innerHTML = temp.innerHTML;
	}
	
	function verifyIfWin() {
		var winningArray = [
    		[0, 1, 2, 3],
    		[4, 5, 6, 7],
    		[8, 9, 10, 11],
			[12, 13, 14, 15]
		];
		
		for (var row = 0; row < game.array.length; row++)
			for (var col = 0; col < game.array.length; col++) {
				if (game.array[row][col] != winningArray[row][col])
					return false;
			}
		return true;
	}
}

function stopGame() {
	clearInterval(timerInterval);
	clearTimeout(currentAnimationTimeOut);
}

function Index(row, col) {
	this.row = row;
	this.col = col;
}
	
function Move(startIndex, endIndex) {
	this.startIndex = startIndex;
	this.endIndex = endIndex;
}


