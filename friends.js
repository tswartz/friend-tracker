//getAllFriends();

function scrapeFriends() {
	var friends = [];
	$("ul[data-pnref='friends'] li div.fsl.fwb.fcb a").each(function(){
		friends.push($(this).text());
	});
	return friends;
}

function getAllFriends(callback) {
	var inProgressText = "Don't touch anything or navigate away, Friend Tracker is busy at work right now!";
	$("body").prepend($("<div id='in-progress-warning'>" + inProgressText + "</div>"));
	$("body").prepend($("<div id='in-progress-cover'/>"));
	var screenHeight = $(window).height();
	var friends = [];
	var loop = setInterval(function () {
		scrollTo(0,screenHeight);
		friends = scrapeFriends();
		screenHeight += screenHeight;
		moreAboutHeader = $("h3.uiHeaderTitle:contains('More About ')");
		if (moreAboutHeader.length > 0) {
			clearInterval(loop);
			$('#in-progress-warning').remove();
			$('#in-progress-cover').remove();
			callback(friends);
		}
	},1000);
	
}

chrome.runtime.onConnect.addListener(function(port) {
  port.onMessage.addListener(function(msg) {
  	getAllFriends(function (friends) {
  		port.postMessage({friends: friends});
  	});
  });
});