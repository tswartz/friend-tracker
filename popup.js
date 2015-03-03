if (!localStorage.getItem("friends")) {
	localStorage.setItem("friends", []);
}
var cachedFriends = localStorage.getItem("friends").split(",");


function sendRequest() {
  	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
	    var tab = tabs[0];
	    var port = chrome.tabs.connect(tabs[0].id);
		port.postMessage({counter: 1});
		port.onMessage.addListener(trackFriends);
	});

}

function trackFriends(response) {
	var friends = response.friends;
	var newFriends = _.difference(friends, cachedFriends);
	var lostFriends = _.difference(cachedFriends, friends);
	console.log(newFriends, lostFriends);
}

document.addEventListener('DOMContentLoaded', function() {
  	document.getElementById('get-friends').addEventListener('click', sendRequest);
});