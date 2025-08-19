const WIDGET_TYPES = {
    clock: {
        variants: ['digital', 'analog', 'world'],
        defaultID: 0
    },
    weather: {
        variants: ['condition', 'forecast', 'temperature'],
        defaultID: 0
    },
    note: {
        variants: ['simple'],
        defaultID: 0
    },
    todo: {
        variants: ['simple', 'detailed'],
        defaultID: 0
    },
    rss: {
        variants: ['feed', 'headline'],
        defaultID: 0
    },
    quickcopy: {
        variants: ['text'],
        defaultID: 0
    },
    google: {
        variants: ['mail', 'calendar', 'docs', 'drive'],
        defaultID: 0
    },
    timer: {
        variants: ['countdown', 'stopwatch', 'pomodoro'],
        defaultID: 0
    },
    mediaControls: {
        variants: ['playback', 'volume', 'playlist'],
        defaultID: 0
    }
}

function buildWidgetHTML(widget) {
    // This function will return the HTML for a widget based on its type and settings
    // For now, it will just return a placeholder
    return null;
}