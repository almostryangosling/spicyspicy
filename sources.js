// Available video sources for the app. Each source defines how to build
// the player embed URL for movies and TV shows.
window.SOURCES = [
    {
        id: 'primewire',
        name: 'PrimeWire',
        movie: 'https://primewire.tf/embed/movie?tmdb={id}',
        tv: 'https://primewire.tf/embed/tv?tmdb={id}&season={season}&episode={episode}'
    },
    {
        id: 'neoserver',
        name: 'Neo Server',
        movie: 'https://vidrock.net/movie/{id}?autoplay=true&autonext=true&theme=f5f5f5',
        tv: 'https://vidrock.net/tv/{id}/{season}/{episode}?autoplay=true&autonext=true&theme=f5f5f5'
    }
];





