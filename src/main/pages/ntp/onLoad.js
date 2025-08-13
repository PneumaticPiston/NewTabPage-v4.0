var ntpSettings = {
    themeID: null,
    background: {
        imageHash: null,
        showImage: false
    },
    header: {
        // The height of the header in pixels
        height: 10,
        // How to handle overflow in the header
        overflow: "scroll-x",
        // Whether or not to show the header
        showHeader: false,
        // Whether or not to show the date/time in the header
        time: {
            showTime: true,
            showDate: true,
            showSeconds: true,
            showDayOfWeek: true
        },
        // Whether or not to show the weather/condition/temperature in the header
        weather: {
            showWeather: true,
            showTemperature: true,
            showCondition: true
        },
        // The links to show in the header
        links: [
            {name: "Google", url: "https://www.google.com",},
            {name: "Gmail", url: "https://mail.google.com"}
        ],
        // The apps dropdown in the header and whether or not to show it
        appsDropdown: {
            showAppsDropdown: true,
            apps: [
                {name: "Google", url: "https://www.google.com"},
                {name: "Gmail", url: "https://mail.google.com"},
                {name: "YouTube", url: "https://www.youtube.com"},
                {name: "Google Maps", url: "https://maps.google.com"}
            ]
        }
    },
    // The search bar and its settings
    search: {
        showSearch: true,
        showIcon: true,
        searchEngine: "Google",
        searchEngines: [
            {name: "Google", url: "https://www.google.com/search?q="},
            {name: "Bing", url: "https://www.bing.com/search?q="},
            {name: "DuckDuckGo", url: "https://duckduckgo.com/?q="},
            {name: "Yahoo", url: "https://search.yahoo.com/search?p="},
            {name: "Ecosia", url: "https://www.ecosia.org/search?q="},
            {name: "Startpage", url: "https://www.startpage.com/do/search?q="}
        ]
    },
    linkGroups: [
        {
            name: "Test Group 1",
            showName: true,
            pos: {
                x: 0,
                y: 0
            },
            type: "grid",
            grid: {
                c: 3,
                r: 2,
                overflow: "scroll-x"
            },
            links: [
                {name: "YouTube", url: "https://www.youtube.com"}
            ]
        }
    ],
    bottom: {
        show: false,
        sections: [
            
        ]
    }
}