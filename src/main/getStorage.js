/**
 * Debug logging utility
 */
const debug = {
    log: function(...args) {
        if (this.enabled) {
            console.log(...args);
        }
    },
    error: function(...args) {
        if (this.enabled) {
            console.error(...args);
        }
    },
    warn: function(...args) {
        if (this.enabled) {
            console.warn(...args);
        }
    },
    enabled: false
};

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
    bottom: false,
    accessibility: true,
    other: false
};

/**
 * This is hard coded with default settings but will be overwritten by stored settings on load. 
 * Users can reset to these defaults by clearing their storage. 
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
                // Columns and rows for grid layout
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
            // Not necessary for widget, should not be saved to storage
            name: "Test Group 4",
            x: 70,
            y: 70,
            type: 2,
            // Widget specific settings
            id: {
                type: 0,
                var: 0
            },
            // A URL query string containing any settings for the widget
            settings: ""
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
        items: [
            
        ]
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
    },
    uiStyle: "default"
}

function saveToSettings(key, value) {
    let syncKey;
    switch (key) {
        case "linkGroups":
            SETTINGS.linkGroups = value;
            syncKey = 'links';
            break;
        case "themeID":
        case "themeData":
            if (key === "themeID") {
                SETTINGS.themeID = value;
            } else {
                SETTINGS.themeData = value;
            }
            syncKey = 'theme';
            break;
        case "background":
            SETTINGS.background = value;
            syncKey = 'background';
            break;
        case "header":
            SETTINGS.header = value;
            syncKey = 'header';
            break;
        case "bottom":
            SETTINGS.bottom = value;
            syncKey = 'bottom';
            break;
        case "accessibility":
            SETTINGS.accessibility = value;
            syncKey = 'accessibility';
            break;
        case "uiStyle":
            SETTINGS.uiStyle = value;
            syncKey = 'other';
            break;
        default:
            debug.warn("Unknown SETTINGS key:", key);
            syncKey = 'other';
    }

    debug.log(`Saving ${key} to ${isSynced[syncKey] ? "sync" : "local"} storage`);

    if (isSynced[syncKey]) {
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
 * Promise that resolves when all settings are initialized
 * Other scripts should await this before using SETTINGS
 */
let settingsInitialized = null;

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
            isSynced.bottom = locations.locations.bottom !== undefined ? locations.locations.bottom : isSynced.bottom;
            isSynced.accessibility = locations.locations.accessibility !== undefined ? locations.locations.accessibility : isSynced.accessibility;
            isSynced.other = locations.locations.other !== undefined ? locations.locations.other : isSynced.other;
        }

        // Load all settings in parallel
        await Promise.all([
            loadLinkGroupsFromStorage(),
            loadThemeFromStorage(),
            loadBackgroundFromStorage(),
            loadHeaderFromStorage(),
            loadBottomFromStorage(),
            loadAccessibilityFromStorage(),
            loadUIStyleFromStorage()
        ]);

        debug.log("All settings loaded successfully");
    } catch (error) {
        debug.error("Error initializing settings:", error);
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
            debug.log("Loaded linkGroups from " + (isSynced.links ? "sync" : "local") + " storage");
        }
    } catch (error) {
        debug.error("Error loading linkGroups:", error);
    }
}

/**
 * Loads theme settings from the appropriate storage
 */
async function loadThemeFromStorage() {
    try {
        const storageArea = isSynced.theme ? chrome.storage.sync : chrome.storage.local;
        const data = await chromeStorageGet(storageArea, ["themeID", "themeData"]);
        if (data.themeID) {
            SETTINGS.themeID = data.themeID;
        }
        if (data.themeData) {
            SETTINGS.themeData = data.themeData;
        }
        debug.log("Loaded theme settings from " + (isSynced.theme ? "sync" : "local") + " storage");
    } catch (error) {
        debug.error("Error loading theme:", error);
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
        debug.log("Loaded background settings from " + (isSynced.background ? "sync" : "local") + " storage");
    } catch (error) {
        debug.error("Error loading background:", error);
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
        debug.log("Loaded header settings from " + (isSynced.header ? "sync" : "local") + " storage");
    } catch (error) {
        debug.error("Error loading header:", error);
    }
}

/**
 * Loads bottom settings from the appropriate storage
 */
async function loadBottomFromStorage() {
    try {
        const storageArea = isSynced.bottom ? chrome.storage.sync : chrome.storage.local;
        const data = await chromeStorageGet(storageArea, ["bottom"]);
        if (data.bottom) {
            SETTINGS.bottom = data.bottom;
        }
        debug.log("Loaded bottom settings from " + (isSynced.bottom ? "sync" : "local") + " storage");
    } catch (error) {
        debug.error("Error loading bottom:", error);
    }
}

/**
 * Loads accessibility settings from the appropriate storage
 */
async function loadAccessibilityFromStorage() {
    try {
        const storageArea = isSynced.accessibility ? chrome.storage.sync : chrome.storage.local;
        const data = await chromeStorageGet(storageArea, ["accessibility"]);
        if (data.accessibility) {
            SETTINGS.accessibility = data.accessibility;
        }
        debug.log("Loaded accessibility settings from " + (isSynced.accessibility ? "sync" : "local") + " storage");
    } catch (error) {
        debug.error("Error loading accessibility:", error);
    }
}

/**
 * Loads UI style settings from the appropriate storage
 */
async function loadUIStyleFromStorage() {
    try {
        const storageArea = isSynced.other ? chrome.storage.sync : chrome.storage.local;
        const data = await chromeStorageGet(storageArea, ["uiStyle"]);
        if (data.uiStyle) {
            SETTINGS.uiStyle = data.uiStyle;
        }
        debug.log("Loaded UI style from " + (isSynced.other ? "sync" : "local") + " storage");
    } catch (error) {
        debug.error("Error loading UI style:", error);
    }
}

// Initialize settings when script loads and expose the promise
settingsInitialized = initializeSettings();


