// Available video sources for the app. Each source defines how to build
// the player embed URL for movies and TV shows.
window.SOURCES = [
    {
        id: 'rive',
        name: 'RiveStream',
        movie: 'https://rivestream.org/embed?type=movie&id={id}',
        tv: 'https://rivestream.org/embed?type=tv&id={id}&season={season}&episode={episode}'
    }
];
