# experiment-nuutube
One of my experiments. This will display a random YouTube video with zero views.

# How it Works
All of the functionality of this little tool happens in js/loadvideo.js. That file is heavily commented, so for a full play-by-play, you are encouraged to peruse it. This is just a short summary.

When the new video button is clicked, the script first replaces the contents of the video container with an indicator that it is searching for a video. It then accesses the public API of http://randomword.setgetgo.com, which returns a random word. The script then accesses YouTube's public API and searches for that word. Finally, it loops through all the returned results looking for videos with zero views. If none are found, it goes back to the first step and gets a new random word, repeating until it finds a video with zero views.

Once it has a video, it replaces the contents of the video container again, this time with an iframe element (the video embed).
