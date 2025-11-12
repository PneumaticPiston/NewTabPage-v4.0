/**
 * Stores where settings are located
 * If true, the setting is stored in chrome.storage.sync
 * If false, the setting is stored in chrome.storage.local
 */
var isSynced = {
    theme: false,
    links: false,
    background: false,
    header: false,
    other: false
};

/**
 * The settings object contains various configuration options for the application.
 */
const SETTINGS = {
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
            x: 50,
            y: 500,
            type: "grid",
            grid: {
                c: 3,
                r: 2,
                overflow: "scroll-x"
            },
            links: [
                {name: "YouTube", url: "https://www.youtube.com"},
                {name: "GitHub", url: "https://www.github.com"}
            ]
        }
    ],
    themeID: "light",
    themeColors: `[data-theme="custom"]{--background-color:#2e3440;--primary-color:#5e81ac;--secondary-color:#88c0d0;--text-color:#eceff4;--accent-color:#bf616a;}`,
    background: {
        imageHash: "",
        bgID: 0
    },
    header: {
        // The height of the header in pixels
        height: 50,
        // Whether or not to show the header
        showHeader: false,
        // The links to show in the header
        links: [
            {name: "Google", url: "https://www.google.com"},
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
    bottom: {
        show: false,
        sections: [
            
        ]
    }
}

/**
 * Retrieves the storage locations of settings and updates the storageLocations object.
 */
chrome.storage.local.get(["locations"], (locations) => {
    if (!locations) {
        console.error("No locations found");
        return;
    }
    isSynced.theme = locations.theme;
    isSynced.links = locations.links;
    isSynced.background = locations.background;
});

async function getStorageLocations() {
    if (isSynced.links) {
        chrome.storage.sync.get(["linkGroups"], (data) => {
            if (data.linkGroups) {
                settings.linkGroups = data.linkGroups;
            }
        });
    } else {
        chrome.storage.local.get(["linkGroups"], (data) => {
            if (data.linkGroups) {
                settings.linkGroups = data.linkGroups;
            }
        });
    }

    if (isSynced.theme) {
        chrome.storage.sync.get(["themeID", "themeColors"], (data) => {
            if (data.themeID) {
                settings.themeID = data.themeID;
            }
            if (data.themeColors) {
                settings.themeColors = data.themeColors;
            }
        });
    } else {
        chrome.storage.local.get(["themeID", "themeColors"], (data) => {
            if (data.themeID) {
                settings.themeID = data.themeID;
            }
            if (data.themeColors) {
                settings.themeColors = data.themeColors;
            }
        });
    }

    if (isSynced.background) {
        chrome.storage.sync.get(["background"], (data) => {
            if (data.background) {
                settings.background = data.background;
            }
        });
    } else {
        chrome.storage.local.get(["background"], (data) => {
            if (data.background) {
                settings.background = data.background;
            }
        });
    }
}


