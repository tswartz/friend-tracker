var cachedFriends;
var friends;
var friendCount;
var currentUser;

function initializeFriends() {
	if (!localStorage.getItem(currentUser)) {
		localStorage.setItem(currentUser, "{}");
	}
	if (!localStorageGet("friends") && !localStorageGet("friendCount")) {
		localStorageSet("friends", []);
		localStorageSet("friendCount", 0);
	}
	cachedFriends = localStorageGet("friends");
	cachedFriendCount = localStorageGet("friendCount");

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
		localStorageSet("friends", friends);
		localStorageSet("friendCount", friendCount);
		initializeFriends();
	}
}

function localStorageGet(property) {
	var friendDataString = localStorage.getItem(currentUser);
	var friendData = JSON.parse(friendDataString);
	return friendData[property];
}

function localStorageSet(property, value) {
	var friendDataString = localStorage.getItem(currentUser);
	var friendData = JSON.parse(friendDataString);
	friendData[property] = value;
	friendDataString = JSON.stringify(friendData);
	return localStorage.setItem(currentUser, friendDataString);
}


document.addEventListener('DOMContentLoaded', function() {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
	    var url = tabs[0].url;
	    url = url.replace("https://www.facebook.com/", "");
	    url = url.replace("/friends", "");
	    currentUser = url;
	    initializeFriends();
	  	document.getElementById('get-friends').addEventListener('click', sendRequest);
	  	document.getElementById('cache-friends').addEventListener('click', cacheFriends);
	});    
});
