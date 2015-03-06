var cachedFriends;
var friends;
var friendCount;
var currentUser;

function initializeFriends() {
	if (!localStorage.getItem(currentUser)) {
		hide("previous-friends-data");
		hide("current-friends-data");
		document.getElementById("cache-friends").setAttribute("disabled", "true");
		var friendData = {friends:[], friendCount:0};
		friendData = JSON.stringify(friendData);
		localStorage.setItem(currentUser, friendData);
	} else {
		retrieveCachedFriends();
	}
}

function retrieveCachedFriends() {
	cachedFriends = localStorageGet("friends");
	var cachedFriendCount = localStorageGet("friendCount");

	hide("initialize-message");
	show("previous-friends-data");
	setText('previous-friends', cachedFriendCount);
	hide("current-friends-data");
	document.getElementById("cache-friends").setAttribute("disabled", "true");
}


function sendRequest() {
  	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
	    var tab = tabs[0];
	    var port = chrome.tabs.connect(tabs[0].id);
	    port.onMessage.addListener(trackFriends);
		port.postMessage({});
	});

}

function trackFriends(response) {
	var initialFriendScrape = localStorageGet("friendCount") == 0;
	friends = response.friends;
	friendCount = response.friendCount
	if (initialFriendScrape) {
		cacheFriends(); 
	} else {
		var gainedFriends = _.difference(friends, cachedFriends);
		var lostFriends = _.difference(cachedFriends, friends);
		show("current-friends-data");
		setText('current-friends', friendCount);
		setText('gained-friends', "(" + gainedFriends.length + ") " + gainedFriends);
		setText('lost-friends', "(" + lostFriends.length + ") " + lostFriends);
		document.getElementById('cache-friends').removeAttribute("disabled");
	}
}

function setText(id, text) {
	document.getElementById(id).innerText = text;
}

function cacheFriends() {
	if (friends.length > 0) {
		localStorageSet("friends", friends);
		localStorageSet("friendCount", friendCount);
		retrieveCachedFriends();
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

function isValidUrl(url) {
	var re = "^https://www.facebook.com/[^/]*/friends$";
	return url.match(re);
}

function setCurrentUser(url) {
	url = url.replace("https://www.facebook.com/", "");
    url = url.replace("/friends", "");
    currentUser = url;
}

function show(id) {
	document.getElementById(id).className = "";
}

function hide(id) {
	document.getElementById(id).className = "hidden";
}

// Set everything up after loading DOM
document.addEventListener('DOMContentLoaded', function() {
	document.getElementById('get-friends').addEventListener('click', function(){sendRequest()});
  	document.getElementById('cache-friends').addEventListener('click', cacheFriends);
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
	    var url = tabs[0].url;
	    if (!isValidUrl(url)) {
	    	hide("friend-tracker-ui");
	    	return;
	    }
	    hide("wrong-url-message");
	    setCurrentUser(url);
	    initializeFriends();
	});    
});
