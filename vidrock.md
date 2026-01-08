Movie Embed URL
https://vidrock.net/movie/{tmdb_id}
https://vidrock.net/movie/{imdb_id}
Example iframe:
<iframe src="https://vidrock.net/movie/tt4154796" allowfullscreen></iframe>
TV Shows Embed URL
https://vidrock.net/tv/{tmdb_id}/{season_number}/{episode_number}
https://vidrock.net/tv/{imdb_id}/{season_number}/{episode_number}
Example iframe:
<iframe src="https://vidrock.net/tv/tt0903747/1/1" allowfullscreen></iframe>
List All Movies & Series
https://vidrock.net/list/movie.json
https://vidrock.net/list/tv.json


Available URL Parameters

Customize the player behavior by adding these parameters to your URLs
autoplaybooleandefault: false

Automatically start playing the video when loaded
autonextbooleandefault: false

Plays next TV episode automatically
themehex colordefault: ffffff

Custom accent color (without #). Changes player theme colors
downloadbooleandefault: true

Show/hide the download button in player controls
nextbuttonbooleandefault: true

Show/hide next episode notification for TV shows
episodeselectorbooleandefault: true

Show/hide the season/episode selector button
langlanguage codedefault: browser lang

Auto-select subtitles by language (e.g., 'en', 'es', 'fr'). Uses 2-letter ISO codes
Parameter Examples
Enable autoplay:
?autoplay=true
Enable autonext parameter:
?autonext=true
Custom red theme:
?theme=ff6b6b
Hide download button:
?download=false


Continue Watching Feature

Track your users' watch progress across movies and TV shows. This feature enables "Continue Watching" functionality on your website.
1. Add Event Listener

Add this script where your iframe is located. For React/Next.js applications, place it in a useEffect hook.
Script

window.addEventListener('message', (event) => {
  if (event.origin !== 'https://vidrock.net') return;
  
  if (event.data?.type === 'MEDIA_DATA') {
    const mediaData = event.data.data;
    localStorage.setItem('vidRockProgress', JSON.stringify(mediaData));
  }
});

2. Stored Data Structure

The data is stored in localStorage and contains:

    Movie/Show details (title, poster, etc.)
    Watch progress (time watched, duration)
    Last watched episode for TV shows
    Episode-specific progress for shows

Example Data Structure

[
  {
    "id": 12,
    "type": "movie",
    "title": "Finding Nemo",
    "poster_path": "/eHuGQ10FUzK1mdOY69wF5pGgEf5.jpg",
    "backdrop_path": "/eCynaAOgYYiw5yN5lBwz3IxqvaW.jpg",
    "progress": {
      "watched": 64.713891,
      "duration": 6053.865999999997
    },
    "last_updated": 1732173179272
  },
  {
    "id": 52814,
    "type": "tv",
    "title": "Halo",
    "poster_path": "/4UmNhZCEu8Vt3byMvNxNEPyf8EY.jpg",
    "backdrop_path": "/zW0v2YT74C6tRafzqqBkfSqLAN0.jpg",
    "progress": {
      "watched": 0,
      "duration": 0
    },
    "last_updated": 1735651642940,
    "number_of_episodes": 17,
    "number_of_seasons": 2,
    "last_season_watched": "1",
    "last_episode_watched": "1",
    "show_progress": {
      "s1e1": {
        "season": "1",
        "episode": "1",
        "progress": {
          "watched": 3.793523,
          "duration": 3536.793000000001
        },
        "last_updated": 1735651642940
      }
    }
  }
]

Player Event Tracking New

Listen to player events to track user interactions and video playback states. Events are sent via postMessage to the parent window.
Available Events

    play - Triggered when video starts playing
    pause - Triggered when video is paused
    seeked - Triggered when user seeks to a different timestamp
    ended - Triggered when video playback ends
    timeupdate - Triggered periodically during playback

Event Data Structure
Event Object

{
  type: "PLAYER_EVENT",
  data: {
    event: "play" | "pause" | "seeked" | "ended" | "timeupdate",
    currentTime: number,
    duration: number,
    tmdbId: number,
    mediaType: "movie" | "tv",
    season?: number,
    episode?: number
  }
}

Implementation Example

window.addEventListener('message', (event) => {
  if (event.origin !== 'https://vidrock.net') return;

  if (event.data?.type === 'PLAYER_EVENT') {
    const { event: eventType, currentTime, duration } = event.data.data;
    // Handle the event
    console.log(`Player ${eventType} at ${currentTime}s of ${duration}s`);
  }
});