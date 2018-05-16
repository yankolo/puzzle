document.addEventListener("DOMContentLoaded", function () {
	var visits = document.querySelector("#visits-number");
	
	(function countVisits() {
		var cookies = document.cookie.split(";");
		var visitCount;
		for (var i = 0; i < cookies.length; i++) {
			var cookieParts = cookies[i].split("=");
			if (cookieParts[0] === "visitCount") {
				visitCount = cookieParts[1];
			}
		}
		
		if (!visitCount) {
			document.cookie = "visitCount = 1" + ";expires=" + new Date(new Date().getTime()+1000*60*60*24*365).toUTCString();
			visits.appendChild(document.createTextNode("1"));
		} else {
			visitCount = parseInt(visitCount) + 1;
			document.cookie = "visitCount = " + visitCount + ";expires=" + new Date(new Date().getTime()+1000*60*60*24*365).toUTCString();
			visits.appendChild(document.createTextNode(visitCount));
		}
	}) ();
	
});

function initSaves () {
	var savesListContainer = document.querySelector("#saves-list-container");
	var submitSaveButton = document.querySelector(".submit-save-button");
	var saveInput = document.querySelector("#new-save-input");
	var savesTable = document.querySelector("#saves-table tbody");
	
	savesListContainer.addEventListener("click", loadSave, false);
	savesListContainer.addEventListener("click", deleteSave, false);
	submitSaveButton.addEventListener("click", function () {saveGame(saveInput.value);}, false);
	saveInput.addEventListener("keyup", submitOnEnter, false);
	
	displaySaves();
	
	function displaySaves() {
		savesTable.innerHTML = "";
		if (localStorage.saves) {
			var saves = localStorage.saves.split(";;;");
			for (var i = 0; i < saves.length; i++) {
				var currentSave = saves[i].split(":::");
				var saveId = currentSave[0];
				var saveName = currentSave[1];
				
				savesTable.appendChild(createSaveRow(saveName, saveId));
			}
		}
	}
	
	function saveGame (name) {
		if (gameReadyToSave == false)
			return;
		
		if (name == "")
			name = "Game";
		
		var saveIdList = savesTable.querySelector(".save-id");
		var saveId;
		var idAlreadyInList;
		
		if (saveIdList) {
			do {
				saveId = Math.floor(Math.random() * 100000000);
    			for (var i = 0; i < saveIdList.length; i++) {
    			    if (saveIdList[i].textContent === randomNumber) {
    			        idAlreadyInList = true;
    			    }
    			}
    			idAlreadyInList = false;
			} while (idAlreadyInList);
		} else {
			saveId = Math.floor(Math.random() * 100000000);
		}
		
		
		var gameString = JSON.stringify(game);
		
		if (localStorage.saves)
			localStorage.saves = localStorage.saves + ";;;" + saveId + ":::" + name + ":::" + gameString;
		else 
			localStorage.saves = saveId + ":::" + name + ":::" + gameString;
		
		displaySaves();
	}
	
	function loadSave (e) {
		if (e.target.classList.contains("load-button") || e.target.parentElement.classList.contains("load-button")) {
			
			var trList = savesTable.querySelectorAll("tr");
			
			var clickedTr;
			for (var i = 0; i < trList.length; i++) {
				if (trList[i].contains(e.target))
					clickedTr = trList[i];
			}
			
			var saveId = clickedTr.querySelector(".save-id").textContent;
			
			var gameString;
			var saves = localStorage.saves.split(";;;");
			for (i = 0; i < saves.length; i++) {
				var currentSave = saves[i].split(":::");
				if (currentSave[0] == saveId)
					gameString = currentSave[2];
			}
			
			var gameObject = JSON.parse(gameString);
			
			loadGame(gameObject.image, gameObject.array, gameObject.moves, gameObject.totalSeconds);
			closePopup();
		}
	}
	
	function deleteSave(e) {
		if (e.target.classList.contains("delete-button")) {
			var trList = savesTable.querySelectorAll("tr");
			
			var clickedTr;
			for (var i = 0; i < trList.length; i++) {
				if (trList[i].contains(e.target))
					clickedTr = trList[i];
			}
			
			var saveId = clickedTr.querySelector(".save-id").textContent;
			
			var saves = localStorage.saves.split(";;;");
			localStorage.removeItem("saves");
			for (var i = 0; i < saves.length; i++) {
				var currentSave = saves[i].split(":::");
				if (currentSave[0] != saveId) {
					if (!localStorage.saves) {
						localStorage.saves = currentSave[0] + ":::" + currentSave[1] + ":::" + currentSave[2];
					} else {
						localStorage.saves = localStorage.saves + ";;;" + currentSave[0] + ":::" + currentSave[1] + ":::" + currentSave[2];
					}
				}
			}
			
			displaySaves();
		}
	}
	
	function createSaveRow(name, id) {
		var tr = document.createElement("tr");
		
		var tdName = document.createElement("td");
		var nameTextNode = document.createTextNode(name);
		
		tdName.appendChild(nameTextNode);
		
		var tdLoadButton = document.createElement("td");
		var divLoadButton = document.createElement("div");
		divLoadButton.classList.add("load-button");
		var loadButtonP = document.createElement("p");
		var loadButtonText;
		if (g.lang == "en") {
			loadButtonText = document.createTextNode("Load");
		} else if (g.lang == "fr") {
			loadButtonText = document.createTextNode("Jouer");
		}
		
		
		loadButtonP.appendChild(loadButtonText);
		divLoadButton.appendChild(loadButtonP);
		tdLoadButton.appendChild(divLoadButton);
		
		var tdDeleteButton = document.createElement("td");
		var divDeleteButton = document.createElement("div");
		divDeleteButton.classList.add("delete-button");
		
		tdDeleteButton.appendChild(divDeleteButton);
		
		tr.appendChild(tdName);
		tr.appendChild(tdLoadButton);
		tr.appendChild(tdDeleteButton);
		
		var saveP = document.createElement("p");
		saveP.classList.add("save-id");
		saveP.style.display = "none";
		var saveId = document.createTextNode(id);
		saveP.appendChild(saveId);
		
		tr.appendChild(saveP);

		return tr;
	}
	
	function submitOnEnter(e) {
		if (e.code === "Enter" || e.keyCode === 0x13) {
			submitSaveButton.click();
		}
	}
}

function initScores () {
	var scoresTable = document.querySelector("#highscore-table-values tbody");
	
	displayScores();
	
	function displayScores() {
		scoresTable.innerHTML = "";
		if (localStorage.scores) {
			var scores = localStorage.scores.split(";;;");
			for (var i = 0; i < scores.length; i++) {
				var score = scores[i].split(",");
				var seconds = formatTime(score[0]);
				var moves = score[1];
				var date = score[2];
				
				scoresTable.appendChild(createScoreRow(seconds, moves, date));
			}
		}
	}
	
	function createScoreRow (seconds, moves, date) {
		var tr = document.createElement("tr");
		
		var secondsTextNode = document.createTextNode(seconds);
		var movesTextNode = document.createTextNode(moves);
		var dateTextNode = document.createTextNode(date);
		
		var tdSeconds = document.createElement("td");
		var tdMoves = document.createElement("td");
		var tdDate = document.createElement("td");
		
		tdSeconds.appendChild(secondsTextNode);
		tdMoves.appendChild(movesTextNode);
		tdDate.appendChild(dateTextNode);
		
		tr.appendChild(tdSeconds);
		tr.appendChild(tdMoves);
		tr.appendChild(tdDate);
		
		return tr;
	}
}

function saveHighScore (seconds, moves)  {
	var date = new Date();
	var dd = date.getDate();
	var mm = date.getMonth() +1 ;
	var yyyy = date.getFullYear();
	date = mm + '/' + dd + '/' + yyyy;

	if (localStorage.scores) {
		var scores = localStorage.scores.split(";;;");
		localStorage.removeItem("scores");
		
		var insertionIndex;
		for (var i = 0; i < scores.length; i++) {
			var currentScore = scores[i].split(",");
			if (seconds < currentScore[0]) {
				insertionIndex = i;
				break;
			}
		}
		if (insertionIndex === undefined) {
			insertionIndex = scores.length;
		}
		
		// Insert score at the correct insertion index
		scores.splice(insertionIndex, 0, seconds + "," + moves + "," + date);
		
		for (i = 0; i < scores.length; i++) {
			if (i == 0) {
				localStorage.scores = scores[i];
			} else {
				localStorage.scores = localStorage.scores + ";;;" + scores[i];
			}
		}
		
	} else {
		localStorage.scores = seconds + "," + moves + "," + date;
	}
	
}

