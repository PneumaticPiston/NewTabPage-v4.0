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
    /*
     * type: 0 = grid
     *       1 = list
     *       2 = widget
     */
    linkGroups: [
        {
            name: "Test Group 1",
            x: 10,
            y: 10,
            type: 0,
            grid: {
                c: 2,
                r: 1
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
            type: 0,
            grid: {
                c: 1,
                r: 3
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
            type: 1,
            grid: {
                c: 3,
                r: 2
            },
            links: [
                {name: "Twitter", url: "https://twitter.com"},
                {name: "LinkedIn", url: "https://linkedin.com"},
                {name: "Facebook", url: "https://facebook.com"},
                {name: "Instagram", url: "https://instagram.com"}
            ]
        }
    ],
    themeID: "nord",
    themeData: `[data-theme="custom"]{--b-col:#2e3440;--p-col:#5e81ac;--s-col:#88c0d0;--t-col:#eceff4;--a-col:#bf616a;}`,
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
    },
    accessibility: {
        fontSize: 100,
        uiScale: 100,
        reduceMotion: false,
        highContrast: false
    }
}

function saveToSettings(key, value) {
    console.log(`Saving ${key} to ${isSynced.links ? "sync" : "local"} storage`);
    switch (key) {
        case "linkGroups":
            SETTINGS.linkGroups = value;
            break;
        case "themeID":
            SETTINGS.themeID = value;
            break;
        case "themeData":
            SETTINGS.themeData = value;
            break;
        case "background":
            SETTINGS.background = value;
            break;
        case "header":
            SETTINGS.header = value;
            break;
        default:
            console.warn("Unknown SETTINGS key:", key);
    }
    if (isSynced.links) {
        chrome.storage.sync.set({[key]: value});
    } else {
        chrome.storage.local.set({[key]: value});
    }
}

/**
 * Promisified chrome.storage.get for easier async/await usage
 */
function chromeStorageGet(storageArea, keys) {
    return new Promise((resolve, reject) => {
        storageArea.get(keys, (result) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(result);
            }
        });
    });
}

/**
 * Initializes all settings by loading from storage
 */
async function initializeSettings() {
    try {
        // First, load the sync location preferences
        const locations = await chromeStorageGet(chrome.storage.local, ["locations"]);
        if (locations && locations.locations) {
            isSynced.theme = locations.locations.theme !== undefined ? locations.locations.theme : isSynced.theme;
            isSynced.links = locations.locations.links !== undefined ? locations.locations.links : isSynced.links;
            isSynced.background = locations.locations.background !== undefined ? locations.locations.background : isSynced.background;
            isSynced.header = locations.locations.header !== undefined ? locations.locations.header : isSynced.header;
            isSynced.other = locations.locations.other !== undefined ? locations.locations.other : isSynced.other;
        }

        // Load all settings in parallel
        await Promise.all([
            loadLinkGroupsFromStorage(),
            loadThemeFromStorage(),
            loadBackgroundFromStorage(),
            loadHeaderFromStorage()
        ]);

        console.log("All settings loaded successfully");
    } catch (error) {
        console.error("Error initializing settings:", error);
    }
}

/**
 * Loads link groups from the appropriate storage
 */
async function loadLinkGroupsFromStorage() {
    try {
        const storageArea = isSynced.links ? chrome.storage.sync : chrome.storage.local;
        const data = await chromeStorageGet(storageArea, ["linkGroups"]);
        if (data.linkGroups) {
            SETTINGS.linkGroups = data.linkGroups;
            console.log("Loaded linkGroups from " + (isSynced.links ? "sync" : "local") + " storage");
        }
    } catch (error) {
        console.error("Error loading linkGroups:", error);
    }
}

/**
 * Loads theme settings from the appropriate storage
 */
async function loadThemeFromStorage() {
    try {
        const storageArea = isSynced.theme ? chrome.storage.sync : chrome.storage.local;
        const data = await chromeStorageGet(storageArea, ["themeID", "themeColors"]);
        if (data.themeID) {
            SETTINGS.themeID = data.themeID;
        }
        if (data.themeColors) {
            SETTINGS.themeColors = data.themeColors;
        }
        console.log("Loaded theme settings from " + (isSynced.theme ? "sync" : "local") + " storage");
    } catch (error) {
        console.error("Error loading theme:", error);
    }
}

/**
 * Loads background settings from the appropriate storage
 */
async function loadBackgroundFromStorage() {
    try {
        const storageArea = isSynced.background ? chrome.storage.sync : chrome.storage.local;
        const data = await chromeStorageGet(storageArea, ["background"]);
        if (data.background) {
            SETTINGS.background = data.background;
        }
        console.log("Loaded background settings from " + (isSynced.background ? "sync" : "local") + " storage");
    } catch (error) {
        console.error("Error loading background:", error);
    }
}

/**
 * Loads header settings from the appropriate storage
 */
async function loadHeaderFromStorage() {
    try {
        const storageArea = isSynced.header ? chrome.storage.sync : chrome.storage.local;
        const data = await chromeStorageGet(storageArea, ["header"]);
        if (data.header) {
            SETTINGS.header = data.header;
        }
        console.log("Loaded header settings from " + (isSynced.header ? "sync" : "local") + " storage");
    } catch (error) {
        console.error("Error loading header:", error);
    }
}

// Initialize settings when script loads
initializeSettings();


