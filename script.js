document.addEventListener("DOMContentLoaded", function () {
	

	document.body.addEventListener("click", activateDropDown, false);
	
	function activateDropDown (e) {
		var element = e.target;
		if (element.classList.contains("selected-option")) {
			var options = element.parentElement.querySelector(".options");
			if (!options.classList.contains("active-options"))
				options.classList.add("active-options");
			else if (options.classList.contains("active-options"))
				options.classList.remove("active-options");
		} else if (element.classList.contains("selection-option")) {
			var selectedOption = element.parentElement.parentElement.querySelector(".selected-option");
			selectedOption.innerHTML = element.innerHTML;
			document.querySelector(".active-options").classList.remove("active-options");
		} else {
			var lists = document.querySelectorAll(".active-options");
			for (var i = 0; i < lists.length; i++) {
				lists[i].classList.remove("active-options");
			}
		}
	}
});

function formatTime(totalSeconds) {
	var seconds;
	var minutes;
	var hours;
	
	hours = Math.floor(totalSeconds / 3600);
	minutes = Math.floor((totalSeconds - (hours * 3600)) / 60);
	seconds = totalSeconds - (hours * 3600) - (minutes * 60);
	
	if (hours < 10)
		hours = "0" + hours;
	if (minutes < 10)
		minutes = "0" + minutes;
	if (seconds < 10)
		seconds = "0" + seconds;
	
	var finalString = hours + ":" + minutes + ":" + seconds;
	
	return finalString;
}

function getSeconds(formattedTime) {
	var time = formattedTime.split(":");
	
	var seconds = time[0];
	var minutes = time[1];
	var hours = time[2];
	
	var totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
	
	return totalSeconds;
}