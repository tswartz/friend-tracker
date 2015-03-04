//getAllFriends();

function scrapeFriends() {
	var friends = [];
	$("ul[data-pnref='friends'] li div.fsl.fwb.fcb a").each(function(){
		friends.push($(this).text());
	});
	return friends;
}

function getAllFriends(callback) {
	var screenHeight = $(window).height();

	// get total friend count
	var friendsTotalSpan = $("a[data-tab-key='friends'] span._gs6");
	var friendsTotal = parseInt(friendsTotalSpan.text());
	var friends = [];

	var loop = setInterval(function () {
		scrollTo(0,screenHeight);
		friends = scrapeFriends();
		screenHeight += screenHeight;
		moreAboutHeader = $("h3.uiHeaderTitle:contains('More About ')");
		if (moreAboutHeader.length > 0) {
			clearInterval(loop);
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