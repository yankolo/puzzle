document.addEventListener("DOMContentLoaded", init, false);

var g = {};
g.lang = "en";

function init() {
	g.startButton = document.querySelector(".button.start");
	g.help = document.querySelector("#help");
	g.helpButton = document.querySelector("#help-icon div");
	g.helpCloseButtun = document.querySelector("#help-close-button");
	g.highScoreButton = document.querySelector("#highscore-button");
	g.saveLoadButton = document.querySelector("#save-button");
	g.settingsButton = document.querySelector("#settings-button");
	
	g.startButton.addEventListener("click", loadGame , false);
	g.helpButton.addEventListener("click", openHelp, false);
	g.helpCloseButtun.addEventListener("click", closeHelp, false);
	g.highScoreButton.addEventListener("click", openHighScorePopup, false);
	g.saveLoadButton.addEventListener("click", openSaveLoad, false);
	g.settingsButton.addEventListener("click", openSettings, false);
}

function loadGame(image, array, moves, seconds) {
	var mainContent = document.querySelector("#main-content");
	var game;
	var randomImageSrc;
	
	requestHTML("resources/html/" + g.lang + "/game.html", requestStatusChange);
	
	function requestStatusChange () {
		if (this.readyState == 4 && this.status == 200) {
			game = this.responseXML.querySelector("#game");
		
			if (image !== undefined && array !== undefined && moves !== undefined && seconds !== undefined) {
				var startGameDiv = document.querySelector("#start-game");
				var gameDiv = document.querySelector("#game");
				
				if (startGameDiv)
					mainContent.removeChild(startGameDiv);
				else if (gameDiv) {
					stopGame();
					mainContent.removeChild(gameDiv);
				}

				mainContent.appendChild(game);
				
				playGame(image, array, moves, seconds);
			} else {
				var category = getCategory();
			
				var request = new XMLHttpRequest();
				request.onreadystatechange = categoryListLoaded;
				request.open("GET", "game_images/" + category + ".txt", true);
				request.send();
				
				mainContent.removeChild(document.querySelector("#start-game"));
				mainContent.appendChild(game);
			}

		}
	}
	
	function categoryListLoaded () {
		if (this.readyState == 4 && this.status == 200) {
			var possibleImages = this.responseText.split(",");
			var randomIndex = Math.floor(Math.random() * possibleImages.length);
			
			randomImageSrc = possibleImages[randomIndex];
			
			// Caching all the images in the specified category
			var tempImage = new Image();
			for (var i = 0; i < possibleImages.length; i++) {
				tempImage.src = possibleImages[i];
			}
			
			playGame(randomImageSrc);
			
		}
	}	
}
	
function openHelp() {
	g.help.style.left = 0;
	
	// Change Help Button so it will close the help when the help has opened
	g.helpButton.removeEventListener("click", openHelp, false);
	g.helpButton.addEventListener("click", closeHelp, false);
	
	// Setup event listener on the body element to close the help when user
	// clicks anywhere but on the help (achieved using stopPropagation on help div)
	document.body.addEventListener("click", closeHelp, false);
	g.help.addEventListener("click", function (e) {e.stopPropagation();}, false);
}

function closeHelp() {
	g.help.style.left = "-275px";
	
	// Change Help Button so it will open the help when the help has closed
	g.helpButton.removeEventListener("click", closeHelp, false);
	g.helpButton.addEventListener("click", openHelp, false);
	
	// Remove event listener from the body element (which was closing the help)
	// when the help has closed
	document.body.removeEventListener("click", closeHelp, false);
}

function openHighScorePopup() {
	requestHTML("resources/html/" + g.lang + "/highscores.html", requestStatusChange);
	
	function requestStatusChange() {
		if (this.readyState == 4 && this.status == 200) {
			var popup = this.responseXML.querySelector("#popup");
		
			insertPopupToDOM(popup);
			if (typeof(Storage) !== "undefined") {
				initScores();
			}
		}
	}
}

function openSaveLoad() {
	requestHTML("resources/html/" + g.lang + "/save.html", requestStatusChange);
	
	function requestStatusChange() {
		if (this.readyState == 4 && this.status == 200) {
			var popup = this.responseXML.querySelector("#popup");
		
			insertPopupToDOM(popup);
			if (typeof(Storage) !== "undefined") {
				initSaves();
			}
		}
	}
}

function openSettings() {
	requestHTML("resources/html/" + g.lang + "/settings.html", requestStatusChange);
	
	function requestStatusChange() {
		if (this.readyState == 4 && this.status == 200) {
			var popup = this.responseXML.querySelector("#popup");
			
			if (document.querySelector("#popup"))
				closePopup();
		
			insertPopupToDOM(popup);
			
			popup.addEventListener("click", function (e) {
				if (e.target.classList.contains("selection-option")) {
					var lang = e.target.innerHTML;
					if (lang == "English") {
						lang = "en";
					} else if (lang == "Français") {
						lang = "fr";
					}
					changeLanguage(lang);
				}
			});
			
			
			var gameDiv = document.querySelector("#game");
			if (gameDiv) {
				var startNewGameButton = popup.querySelector(".start-new-game-button");
				startNewGameButton.classList.remove("disabled-button");
				
				startNewGameButton.addEventListener("click", function () {
					var gameDiv = document.querySelector("#game");
					requestHTML("resources/html/" + g.lang + "/startgame.html", callback);

					
					function callback() {
						if (this.readyState == 4 && this.status == 200) {
							var mainContent = document.querySelector("#main-content");
							var startGame = this.responseXML.querySelector("#start-game");
							
							stopGame();
							
							mainContent.removeChild(gameDiv);
							mainContent.appendChild(startGame);
							
							g.startButton = document.querySelector(".button.start");
							g.startButton.addEventListener("click", loadGame , false);
							
							closePopup();
						}
					}
				});
			}
		}
	}
}

function insertPopupToDOM(popup) {
	document.body.appendChild(popup);
	popup.querySelector("#popup-close-button").addEventListener("click", closePopup, false);
	popup.querySelector("#popup-small-close-button").addEventListener("click", closePopup, false);
}

function closePopup() {
	document.body.removeChild(document.querySelector("#popup"));
}

function requestHTML(file, callback) {
	var request = new XMLHttpRequest();
	request.onreadystatechange = callback;
	request.open("GET", file, true);
	request.responseType = "document";
	request.send();
}

function getCategory() {
	var category = document.querySelector("#category-selection .selected-option").innerHTML;
	
	if (g.lang == "fr") {
		switch (category) {
			case "Nature":
				category = "nature";
				break;
			case "Nourriture":
				category = "food";
				break;
			case "Animaux":
				category = "animals";
				break;
			case "Architecture":
				category = "architecture";
				break;
		}
	}
	
	if (g.lang == "en") {
		switch (category) {
			case "Nature":
				category = "nature";
				break;
			case "Food":
				category = "food";
				break;
			case "Animals":
				category = "animals";
				break;
			case "Architecture":
				category = "architecture";
				break;
		}
	}
	
	return category;
}

function changeLanguage (lang) {
	g.lang = lang;
	
	openSettings();
	
	var gameDiv = document.querySelector("#game");
	var startGameDiv = document.querySelector("#start-game");
	
	requestHTML("resources/html/" + g.lang + "/index.html", indexLoaded);
	
	if (gameDiv)
		requestHTML("resources/html/" + g.lang + "/game.html", gameLoaded);
	
	function indexLoaded() {
		if (this.readyState == 4 && this.status == 200) {
			var newHelp = this.responseXML.querySelector("#help");
			var oldHelp = document.querySelector("#help");
			
			oldHelp.querySelector("h2").textContent = newHelp.querySelector("h2").textContent;
			oldHelp.querySelector("#help-text").innerHTML = newHelp.querySelector("#help-text").innerHTML;
			oldHelp.querySelector("#help-close-button p").textContent = newHelp.querySelector("#help-close-button p").textContent;
			
			var newMain = this.responseXML.querySelector("#main-content");
			var oldMain = document.querySelector("#main-content");
			
			oldMain.querySelector("#game-title").textContent = newMain.querySelector("#game-title").textContent;
			oldMain.querySelector("#visits-text").textContent = newMain.querySelector("#visits-text").textContent;
			
			
			if (startGameDiv) {
				var newSelection = this.responseXML.querySelector("#category-selection");
				var oldSelection = document.querySelector("#category-selection");
				
				oldSelection.innerHTML = newSelection.innerHTML;
				
				var newStart = this.responseXML.querySelector(".button.start p");
				var oldStart = document.querySelector(".button.start p");
				
				oldStart.textContent = newStart.textContent;
			}
		}
	}
	
	function gameLoaded () {
		if (this.readyState == 4 && this.status == 200) {
			var newStats = this.responseXML.querySelector("#game-stats");
			var oldStats = gameDiv.querySelector("#game-stats");
			
			oldStats.querySelector("#moves p:first-child").textContent = newStats.querySelector("#moves p:first-child").textContent;
			oldStats.querySelector("#time p:first-child").textContent = newStats.querySelector("#time p:first-child").textContent;
		}
	}
}