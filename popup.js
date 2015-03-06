var cachedFriends;
var friends;
var friendCount;
var currentUser;

function initializeFriends() {
	if (!localStorage.getItem(currentUser)) {
		document.getElementById("previous-friends-data").className = "hidden";
		document.getElementById("current-friends-data").className = "hidden";
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

	document.getElementById("initialize-message").className = "hidden"
	document.getElementById("previous-friends-data").className = "";
	setText('previous-friends', cachedFriendCount);
	document.getElementById("current-friends-data").className = "hidden";
	document.getElementById("cache-friends").setAttribute("disabled", "true");
}


function sendRequest() {
	var msgData = {"initialize": false}
	if (localStorageGet("friendCount") == 0) {
		var msgData = {"initialize": true}
	}
  	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
	    var tab = tabs[0];
	    var port = chrome.tabs.connect(tabs[0].id);
	    port.onMessage.addListener(trackFriends);
		port.postMessage(msgData);
	});

}

function trackFriends(response) {
	friends = response.friends;
	friendCount = response.friendCount
	if (response.initialize) {
		cacheFriends(); 
	} else {
		var gainedFriends = _.difference(friends, cachedFriends);
		var lostFriends = _.difference(cachedFriends, friends);
		document.getElementById("current-friends-data").className = "";
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

function testValidUrl(url) {
	var re = "^https://www.facebook.com/[^/]*/friends$";
	return url.match(re);
}

document.addEventListener('DOMContentLoaded', function() {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
	    var url = tabs[0].url;
	    if (!testValidUrl(url)) {
	    	document.getElementById("friend-tracker-ui").className = "hidden";
	    	return;
	    }
	    document.getElementById("wrong-url-message").className = "hidden";
	    url = url.replace("https://www.facebook.com/", "");
	    url = url.replace("/friends", "");
	    currentUser = url;
	    initializeFriends();
	    document.getElementById('get-friends').addEventListener('click', function(){sendRequest()});
	  	document.getElementById('cache-friends').addEventListener('click', cacheFriends);
	});    
});
