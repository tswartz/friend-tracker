
var cachedFriends;
var friends;

function initializeFriends() {
	if (!localStorage.getItem("friends")) {
		localStorage.setItem("friends", []);
	}
	cachedFriends = localStorage.getItem("friends").split(",");
	friends = [];

	setText('previous-friends', cachedFriends.length);	
}


function sendRequest() {
  	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
	    var tab = tabs[0];
	    var port = chrome.tabs.connect(tabs[0].id);
		port.postMessage({counter: 1});
		port.onMessage.addListener(trackFriends);
	});

}

function trackFriends(response) {
	friends = response.friends;
	var gainedFriends = _.difference(friends, cachedFriends);
	var lostFriends = _.difference(cachedFriends, friends);
	setText('current-friends', friends.length);
	setText('gained-friends', "(" + gainedFriends.length + ") " + gainedFriends);
	setText('lost-friends', "(" + lostFriends.length + ") " + lostFriends);
}

function setText(id, text) {
	document.getElementById(id).innerText = text;
}

function cacheFriends() {
	if (friends.length > 0) {
		localStorage.setItem("friends", friends);
		initializeFriends();
	}
}

document.addEventListener('DOMContentLoaded', function() {
	initializeFriends();
  	document.getElementById('get-friends').addEventListener('click', sendRequest);
  	document.getElementById('cache-friends').addEventListener('click', cacheFriends);
});