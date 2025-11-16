/**
 * Stores where settings are located
 * If true, the setting is stored in chrome.storage.sync
 * If false, the setting is stored in chrome.storage.local
 */
var isSynced = {
    theme: true,
    links: false,
    background: false,
    header: false,
    other: false
};

/**
 * The settings object contains various configuration options for the application.
 */
const SETTINGS = {
    linkGroups: [
        {
            name: "Test Group 1",
            x: 10,
            y: 10,
            type: "grid",
            grid: {
                c: 2,
                r: 1,
                overflow: "x"
            },
            links: [
                {name: "YouTube", url: "https://www.youtube.com"},
                {name: "GitHub", url: "https://www.github.com"},
                {name: "GitLab", url: "https://www.gitlab.com"}
            ]
        },
        {
            name: "Test Group 2",
            x: 30,
            y: 30,
            type: "grid",
            grid: {
                c: 1,
                r: 3,
                overflow: "y"
            },
            links: [
                {name: "Stack Overflow", url: "https://stackoverflow.com"},
                {name: "MDN Web Docs", url: "https://developer.mozilla.org"},
                {name: "Reddit", url: "https://www.reddit.com"}
            ]
        },
        {
            name: "Test Group 3",
            x: 50,
            y: 50,
            type: "list",
            grid: {
                c: 3,
                r: 2,
                overflow: "y"
            },
            links: [
                {name: "Twitter", url: "https://twitter.com"},
                {name: "LinkedIn", url: "https://linkedin.com"},
                {name: "Facebook", url: "https://facebook.com"},
                {name: "Instagram", url: "https://instagram.com"}
            ]
        }
    ],
    themeID: "ocean",
    themeColors: `[data-theme="custom"]{--background-color:#2e3440;--primary-color:#5e81ac;--secondary-color:#88c0d0;--text-color:#eceff4;--accent-color:#bf616a;}`,
    background: {
        imageHash: "",
        bgID: 1
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
                {name: "Google Maps", url: "https://maps.google.com"},
                {name: "Google Drive", url: "https://drive.google.com"},
                {name: "Google Docs", url: "https://docs.google.com"},
                {name: "Google Sheets", url: "https://sheets.google.com"},
                {name: "Google Slides", url: "https://slides.google.com"},
                {name: "Google Calendar", url: "https://calendar.google.com"},
                {name: "Google Photos", url: "https://photos.google.com"},
                {name: "Google News", url: "https://news.google.com"},
                {name: "Google Translate", url: "https://translate.google.com"},
                {name: "Google Keep", url: "https://keep.google.com"},
                {name: "Google Shopping", url: "https://shopping.google.com"},
                {name: "Google Play", url: "https://play.google.com"},
                {name: "Google Books", url: "https://books.google.com"},
                {name: "Google Scholar", url: "https://scholar.google.com"},
                {name: "Google Forms", url: "https://forms.google.com"}
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
                SETTINGS.linkGroups = data.linkGroups;
            }
        });
    } else {
        chrome.storage.local.get(["linkGroups"], (data) => {
            if (data.linkGroups) {
                SETTINGS.linkGroups = data.linkGroups;
            }
        });
    }

    if (isSynced.theme) {
        chrome.storage.sync.get(["themeID", "themeColors"], (data) => {
            if (data.themeID) {
                SETTINGS.themeID = data.themeID;
            }
            if (data.themeColors) {
                SETTINGS.themeColors = data.themeColors;
            }
        });
    } else {
        chrome.storage.local.get(["themeID", "themeColors"], (data) => {
            if (data.themeID) {
                SETTINGS.themeID = data.themeID;
            }
            if (data.themeColors) {
                SETTINGS.themeColors = data.themeColors;
            }
        });
    }

    if (isSynced.background) {
        chrome.storage.sync.get(["background"], (data) => {
            if (data.background) {
                SETTINGS.background = data.background;
            }
        });
    } else {
        chrome.storage.local.get(["background"], (data) => {
            if (data.background) {
                SETTINGS.background = data.background;
            }
        });
    }
}


