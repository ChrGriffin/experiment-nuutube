// define the global variable vidArray for later use
// we will use this variable to store any videos we find with zero views from a single search
// then we will select one at random to display
var vidArray = [];

// this function runs when the page is loaded, and performs all the initial variable setup
$(document).ready(function(){
	var ldBtn = $(".ldBtn");

	// when the user clicks on the 'new video' button, we do two things
	ldBtn.on("click", function(){
		// first, we reset the the global variable vidArray to be an empty array
		vidArray = [];
		// then, we call the function loadVideo, which begins the process of finding a video with no views
		loadVideo();
	});
});

// this function performs the initial HTML preparations before calling the next function to load a new video
function loadVideo(){
	// first, we change the HTML of the video area to inform the user that we are searching for a video
	var vidArea = $(".vid-div");
	$(vidArea).html("<h2 class='searching'>Searching...</h2><br><image class='loading' src='images/loading.gif' alt>");
	
	// next, we transition into the first function in the chain of finding a video
	searchWord();
}

// this function connects to a random word API and passes a random word to the next function to use as a search term
function searchWord(){
	// the YouTube API doesn't allow us to simply find all recent videos
	// we need to search, using a word
	// it's possible to search using an empty string, which would match any video
	// but we're limited to 50 results total, so if none of those has zero views, we'd be stuck with no viable results
	// so we use a random word API to get a random word and search for it on YouTube
	// if there are no videos associated with that word, or if none of the videos have zero views...
	// ...we will loop back to this function and search for a new word
	var requestStr = "http://randomword.setgetgo.com/get.php";

    $.ajax({
        type: "GET",
        url: requestStr,
        dataType: "jsonp",
        // once we have our word, we callback to our next function, including our random word as the variable 'data'
        jsonpCallback: 'youtubeReq'
    });
}

// this function will connect to the YouTube API and search for videos using our random word
function youtubeReq(data){
	// we need several key components for the API call to be successful and serve our purposes
	// firstly, the API we use adds a 'new line' whitespace after each word, so we subtract the last character...
	// ...and make that word equal to the variable 'word'
	var word = data.Word.substring(0, data.Word.length - 1);
	// next, to increase our chances of getting a video with zero views, we will limit ourselves to recent videos
	// we will find the time one hour ago, and make it equal to the variable 'date'
	var today = new Date();
	// var date = ISODateString(new Date(today.getTime() - (1000*60*60)));
	// YouTube requires an API key for an API call to be successful, so we'll define it here
	var apikey = "API-KEY-HERE";
	// finally, we'll add all our elements together in a string, which we'll set to the variable 'request'
	// var request = "https://www.googleapis.com/youtube/v3/search?part=id&maxResults=50&publishedAfter=" + date + "&q=" + word + "&type=video&key=" + apikey;
	var request = "https://www.googleapis.com/youtube/v3/search?part=id&maxResults=50&q=" + word + "&type=video&key=" + apikey;

	// for debugging purposes, we can console.log the following to see what our API call is searching for
	// console.log('Searching for videos posted after ' + date + ' using the word: ' + word + '.');

	// we'll use an AJAX call to send our API request to YouTube
	$.ajax({
		type: "GET",
		url: request,
		dataType: 'json',
		success: function(data){
			// what we receive back is a JSON-formatted array
			// first, we check if the field that holds our search results is NOT empty
			// if it isn't empty, that means we found results
			if(data["items"].length > 0){
				// for debugging purpose, we can console.log the below to see what we got back.
				// console.log('Videos found! See below.');
				// console.log(data);

				// now we'll loop through each result we got back
				// the YouTube API doesn't allow us to see how many views a video has within a search
				// we need to take the id of the video and perform a new API request for information about that specific video
				for(i=0; i < data["items"].length; i++){
					// first we'll get the id of the current video and make it equal to the variable 'currVid'
					var currVid = data["items"][i]["id"]["videoId"];

					// for debugging purposes, we can console.log the id of the current video
					// console.log(currVid);

					// finally, for each video in the loop, send the id to another function...
					// ... in order to  query the YouTube API for statistics about it
					checkViews(currVid);
				}

				// once we've looped through all the videos, run another function, displayVideo
				displayVideo();

			// 'else' will run if the field that holds our search results IS empty
			// this means that our search returned zero results
			} else {
				// for debugging purposes, we can console.log that we are searching again
				// console.log('No videos found. Restarting...');

				// since we couldn't find any videos, we'll kick back to our searchWord function...
				// ...and begin a new search
				searchWord();
			}
		},
		error: function(jqXHR, textStatus, errorThrown){
			// if we encounter any errors in the AJAX call, we'll be sure to console.log them
			console.log(textStatus);
			console.log(errorThrown);
		},
		complete: function(){

		}
	});
}

// this function will check the view count of a single video, taking that videos ID on YouTube as an argument
// if it has zero, it will add it to our global array of videos
function checkViews(video){
	// first, we'll make our API key equal to to the variable 'apikey'
	var apikey = "AIzaSyBRMOvWIIhO_p41rxsrCuIITNnEUtLmEWM";
	// next, we'll construct our query using our apikey and the video ID we passed to the function...
	// ...and we'll make it equal to the variable 'request'
	var request = "https://www.googleapis.com/youtube/v3/videos?id=" + video + "&part=statistics&key=" + apikey;

	// now, we make an AJAX call to the YouTube API requesting information on that specific video
	$.ajax({
		type: "GET",
		url: request,
		dataType: 'json',
		success: function(data){
			// first, we'll make the variable 'views' equal to the viewCount field that we get back from our request
			var views = data["items"][0]["statistics"]["viewCount"];

			// next, we'll check if the viewCount is equal to 0
			if(views == "0"){
				// if it is, we add it to our global array of videos
				vidArray.push(video);

				// for debugging purposes, we can console.log that we've added a video with zero views
				// console.log("A video with zero views has been added to the array.");
			}
		},
		error: function(jqXHR, textStatus, errorThrown){
			// if we encounter any errors in the AJAX call, we'll be sure to console.log them
			console.log(textStatus);
			console.log(errorThrown);
		},
		complete: function(){

		}
	});
}

// this function will check if there is a video in our array of videos with zero views
// if there is, we will display it on the page, if not, we'll loop back and search again
function displayVideo(){
	// for debugging purposes, we can console.log our array
	console.log(vidArray);

	// first, we'll check to see if the array is empty
	// if it is NOT empty, then there is at least one video in the array, and we can display it on the page
	if(vidArray.length > 0){
		// for debugging purposes, we can console.log that we have a video with zero views
		// console.log("A video with zero views was found!");

		// we'll select a random index in our array of videos and make it equal to the variable newVid
		var newVid = vidArray[Math.floor(Math.random() * vidArray.length)];

		// next we'll find our video display div on the page and make it equal to the variable 'vidArea'
		var vidArea = $(".vid-div");
		// finally, we'll make the HTML equal to an embed code including the video ID we randomly selected
		$(vidArea).html("<iframe width='720' height='405' src='https://www.youtube.com/embed/" + newVid + "' frameborder='0' allowfullscreen></iframe>");

	// 'else' will run if the global array of videos IS empty, meaning we don't have any videos with zero views...
	// ...so we need to run another search
	} else {
		// for debugging purposes, we can console.log that we are searching again
		// console.log("None of those videos had zero views. Restarting...");

		// loop back to the function searchWord to begin a new search
		searchWord();
	}
}

// this function takes the UTC date that Javascript generates...
// ...and reformats it into the format that the YouTube API will accept
// this function was shamelessly pillaged from StackOverflow, specifically at the link below
// http://stackoverflow.com/questions/7244246/generate-an-rfc-3339-timestamp-similar-to-google-tasks-api
function ISODateString(d){
	function pad(n){
		return n<10 ? '0'+n : n
	}
	return d.getUTCFullYear()+'-'
		+ pad(d.getUTCMonth()+1)+'-'
		+ pad(d.getUTCDate())+'T'
		+ pad(d.getUTCHours())+':'
		+ pad(d.getUTCMinutes())+':'
		+ pad(d.getUTCSeconds())+'Z'
}
