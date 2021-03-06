//getAllFriends();

function scrapeFriends() {
	var friends = [];
	$("ul[data-pnref='friends'] li div.fsl.fwb.fcb a").each(function(){
		friends.push($(this).text());
	});
	return friends;
}

// not all friends are displayed in friends list depending on privacy settings
// the count listed at the top is more accurate than getting friend array length
function scrapeFriendCount() {
	return $("a[href$='friends_all'] span._3d0").text();
}

function addLoadingCover() {
	var inProgressText = "Don't touch anything or navigate away, Friend Tracker is busy at work right now!";
	$("body").prepend($("<div id='in-progress-warning'>" + inProgressText + "</div>"));
	$("body").prepend($("<div id='in-progress-cover'/>"));
}

function removeLoadingCover() {
	$('#in-progress-warning').remove();
	$('#in-progress-cover').remove();
}

function getAllFriends(callback) {
	addLoadingCover()
	var screenHeight = $(window).height();
	var friends = [];
	var loop = setInterval(function () {
		friends = scrapeFriends();
		var moreAboutHeader = $("h3.uiHeaderTitle:contains('More About ')");
		if (moreAboutHeader.length > 0) {
			clearInterval(loop);
			removeLoadingCover();
			var friendCount = scrapeFriendCount();
			callback({friends: friends, friendCount: friendCount});
		}
		screenHeight += screenHeight;
		scrollTo(0,screenHeight);
	},1000);
	
}

chrome.runtime.onConnect.addListener(function(port) {
  port.onMessage.addListener(function(msg) {
  	getAllFriends(function (friendData) {
  		port.postMessage(friendData);
  	});
  });
});