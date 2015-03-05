var cachedFriends;
var friends;
var friendCount;

function initializeFriends() {
	if (!localStorage.getItem("friends") && !localStorage.getItem("friendCount")) {
		localStorage.setItem("friends", []);
		localStorage.setItem("friendCount", 0);
	}
	cachedFriends = localStorage.getItem("friends").split(",");
	cachedFriendCount = localStorage.getItem("friendCount");

	setText('previous-friends', cachedFriendCount);
	document.getElementById("current-friends-data").className = "hidden";
	document.getElementById("cache-friends").setAttribute("disabled", "true");
}


function sendRequest() {
  	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
	    var tab = tabs[0];
	    var port = chrome.tabs.connect(tabs[0].id);
	    port.onMessage.addListener(trackFriends);
		port.postMessage();
	});

}

function trackFriends(response) {
	friends = response.friends;
	friendCount = response.friendCount
	var gainedFriends = _.difference(friends, cachedFriends);
	var lostFriends = _.difference(cachedFriends, friends);
	document.getElementById("current-friends-data").className = "";
	setText('current-friends', friendCount);
	setText('gained-friends', "(" + gainedFriends.length + ") " + gainedFriends);
	setText('lost-friends', "(" + lostFriends.length + ") " + lostFriends);
	document.getElementById('cache-friends').removeAttribute("disabled");
}

function setText(id, text) {
	document.getElementById(id).innerText = text;
}

function cacheFriends() {
	if (friends.length > 0) {
		localStorage.setItem("friends", friends);
		localStorage.setItem("friendCount", friendCount);
		initializeFriends();
	}
}

document.addEventListener('DOMContentLoaded', function() {
	initializeFriends();
  	document.getElementById('get-friends').addEventListener('click', sendRequest);
  	document.getElementById('cache-friends').addEventListener('click', cacheFriends);
});