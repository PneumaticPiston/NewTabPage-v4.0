const WIDGET_TYPES = [
    {
        show: true,
        name: 'Clock',
        variants: [
            {name: 'Digital', path: '../widgets/clock/digital.js'}, 
            {name: 'Analog', path: '../widgets/clock/analog.js'}, 
            {name: 'World', path: '../widgets/clock/world.js'}
        ],
        defaultID: 0
    },
    {
        show: true,
        name: 'Timers',
        variants: [
            {name: 'Timer', path: '../widgets/timer/timer.js'}, 
            {name: 'Stopwatch', path: '../widgets/timer/stopwatch.js'}, 
            {name: 'Pomodoro', path: '../widgets/timer/pomodoro.js'}
        ],
        defaultID: 0
    },
    {
        show: true,
        name: 'Weather',
        variants: [
            {name: 'Condition', path: '../widgets/weather/condition.js'}, 
            {name: 'Forecast', path: '../widgets/weather/forecast.js'}, 
            {name: 'Temperature', path: '../widgets/weather/temperature.js'}
        ],
        defaultID: 0
    },
    {
        show: true,
        name: 'Note',
        variants: [
            {name: 'Simple', path: '../widgets/note/simple.js'}
        ],
        defaultID: 0
    },
    {  
        show: true,
        name: 'Todo',
        variants: [
            {name: 'Simple', path: '../widgets/todo/simple.js'}, 
            {name: 'Detailed', path: '../widgets/todo/detailed.js'}
        ],
        defaultID: 0
    },
    {
        show: false,
        name: 'RSS',
        variants: [
            {name: 'Feed', path: '../widgets/rss/feed.js'}, 
            {name: 'Headline', path: '../widgets/rss/headline.js'}
        ],
        defaultID: 0
    },
    {
        show: false,
        name: 'Google',
        variants: [
            {name: 'Mail', path: '../widgets/google/mail.js'}, 
            {name: 'Calendar', path: '../widgets/google/calendar.js'}, 
            {name: 'Docs', path: '../widgets/google/docs.js'}, 
            {name: 'Drive', path: '../widgets/google/drive.js'}
        ],
        defaultID: 0
    }
];