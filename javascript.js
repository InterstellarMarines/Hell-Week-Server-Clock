// name: Name/region of server
// time: Number of minutes after midnight UTC
// ip:   IP address of the server
// port: Port the server is running on
var serverInfo = [{
	"name": "US West",
	"time": 0,
	"ip": "162.244.52.235",
	"port": "7100"
}, {
	"name": "US East",
	"time": 180,
	"ip": "162.244.55.37",
	"port": "7100"
}, {
	"name": "Europe 1",
	"time": 1080,
	"ip": "31.204.154.239",
	"port": "7165"
}, {
	"name": "Europe 2",
	"time": 1200,
	"ip": "31.204.131.35",
	"port": "7200"
}];

// Number of seconds after game start when late join ends
var lateJoinTime = 600;

document.addEventListener("DOMContentLoaded", function() {
	var serverListingDOM = document.getElementsByClassName("server")[0].outerHTML;

	for (var i = 0; i < serverInfo.length - 1; i++) {
		document.querySelector("body > div").innerHTML += "\n" + serverListingDOM;
	}

	for (var i = 0; i < serverInfo.length; i++) {
		document.getElementsByClassName("server")[i].getElementsByClassName("name")[0].innerHTML = serverInfo[i].name;
		document.getElementsByClassName("server")[i].getElementsByClassName("time")[0].innerHTML = formatMinutesSinceMidnight(serverInfo[i].time - new Date().getTimezoneOffset());
		document.getElementsByClassName("server")[i].getElementsByClassName("join")[0].firstChild.href = "steam://run/236370//connect=" + serverInfo[i].ip + " port=" + serverInfo[i].port;
	}

	updateTimer();

	setInterval(function() {
		updateTimer();
	}, 1000);

	if (!("Notification" in window)) {
		document.getElementsByClassName("notifications")[0].outerHTML = "";
	}

	if (Notification.permission === "granted") {
		notificationInfo();
	}
});

function updateTimer() {
	var secondsSinceLocalMidnight = Math.floor((new Date() - new Date().setHours(0, 0, 0, 0)) / 1000);

	for (var i = 0; i < document.getElementsByClassName("server").length; i++) {
		var secondsSinceServerMidnight = (serverInfo[i].time - new Date().getTimezoneOffset()) * 60;
		var countdownSeconds = secondsSinceServerMidnight - secondsSinceLocalMidnight;
		document.getElementsByClassName("server")[i].getElementsByClassName("countdown")[0].innerHTML = formatCountdownSeconds(countdownSeconds);

		if (countdownSeconds <= -lateJoinTime) {
			countdownSeconds += 3600 * 24;
		}

		var joinButton = document.getElementsByClassName("server")[i].getElementsByClassName("join")[0].firstChild;

		if (countdownSeconds < 0 && countdownSeconds > -lateJoinTime && joinButton.className === "disabled") {
			enableJoin(joinButton);
			notificationShow(i);
		} else if (countdownSeconds >= 0 && joinButton.className !== "disabled") {
			disableJoin(joinButton);
		}
	}
}

function enableJoin(element) {
	element.innerHTML = "JOIN";
	element.className = "";
}

function disableJoin(element) {
	element.innerHTML = "SOON";
	element.className = "disabled";
}

function formatCountdownSeconds(seconds) {
	if (seconds < 0 && seconds > -lateJoinTime) {
		var timeLeft = lateJoinTime + seconds;
		var minutes = Math.floor(timeLeft / 60);
		var seconds = timeLeft - minutes * 60;
		if (seconds < 10) {
			seconds = "0" + seconds;
		}
		return -minutes + ":" + seconds;
	} else {
		while (seconds < 0) {
			seconds += 3600 * 24;
		}

		var hours = Math.floor(seconds / 3600);
		seconds -= hours * 3600;
		var minutes = Math.floor(seconds / 60);
		seconds -= minutes * 60;

		if (hours < 10) {
			hours = "0" + hours;
		}
		if (minutes < 10) {
			minutes = "0" + minutes;
		}
		if (seconds < 10) {
			seconds = "0" + seconds;
		}

		return hours + ":" + minutes + ":" + seconds;
	}
}

function formatMinutesSinceMidnight(minutes) {
	if (minutes < 0) {
		minutes += 60 * 24;
	}

	var hours = Math.floor(minutes / 60);
	var minutes = minutes - hours * 60;
	var period = "AM";

	if (minutes < 10) {
		minutes = "0" + minutes;
	}

	if (hours > 12) {
		period = "PM";
		hours -= 12;
	}

	return hours + ":" + minutes + " " + period;
}

function notificationShow(i) {
	if (("Notification" in window) && Notification.permission === "granted") {
		var notification = new Notification("Hell Week open in " + serverInfo[i].name, {"body": "Click to join now", "icon": "icon.png"});
		notification.onclick = function() {
			window.location = "steam://run/236370//connect=" + serverInfo[i].ip + " port=" + serverInfo[i].port;
		};
	}
}

function notificationRequest() {
	Notification.requestPermission(function(response) {
		if (response === "granted") {
			notificationInfo();
		}
	});
}

function notificationInfo() {
	document.getElementsByClassName("notifications")[0].innerHTML = "<p>You will receive desktop notifications when each Hell Week comes online.<br /><br />Keep this page open!</p>";
}
