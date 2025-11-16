const WIDGET_TYPES = [
    {
        show: true,
        name: 'Clock',
        variants: [
            {name: 'Digital', path: '/pages/widgets/clock/digital.js'}, 
            {name: 'Analog', path: '/pages/widgets/clock/analog.js'}, 
            {name: 'World', path: '/pages/widgets/clock/world.js'}
        ]
    },
    {
        show: true,
        name: 'Timers',
        variants: [
            {name: 'Timer', path: '/pages/widgets/timer/timer.js'}, 
            {name: 'Stopwatch', path: '/pages/widgets/timer/stopwatch.js'}, 
            {name: 'Pomodoro', path: '/pages/widgets/timer/pomodoro.js'}
        ]
    },
    {
        show: true,
        name: 'Search',
        variants: [
            {name: 'Bar', path: '/pages/widgets/search/bar.js'},
            {name: 'Box', path: '/pages/widgets/search/box.js'}
        ]
    },
    {
        show: true,
        name: 'Weather',
        variants: [
            {name: 'Condition', path: '/pages/widgets/weather/condition.js'}, 
            {name: 'Forecast', path: '/pages/widgets/weather/forecast.js'}, 
            {name: 'Temperature', path: '/pages/widgets/weather/temperature.js'}
        ]
    },
    {
        show: true,
        name: 'Note',
        variants: [
            {name: 'Simple', path: '/pages/widgets/note/simple.js'}
        ]
    },
    {  
        show: true,
        name: 'Todo',
        variants: [
            {name: 'Simple', path: '/pages/widgets/todo/simple.js'}, 
            {name: 'Detailed', path: '/pages/widgets/todo/detailed.js'}
        ]
    },
    {
        show: false,
        name: 'RSS',
        variants: [
            {name: 'Feed', path: '/pages/widgets/rss/feed.js'}, 
            {name: 'Headline', path: '/pages/widgets/rss/headline.js'}
        ]
    },
    {
        show: false,
        name: 'Google',
        variants: [
            {name: 'Mail', path: '/pages/widgets/google/mail.js'}, 
            {name: 'Calendar', path: '/pages/widgets/google/calendar.js'}, 
            {name: 'Docs', path: '/pages/widgets/google/docs.js'}, 
            {name: 'Drive', path: '/pages/widgets/google/drive.js'}
        ]
    }
];