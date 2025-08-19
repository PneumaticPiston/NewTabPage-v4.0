/**
 * This will be used to easily hide or show settings in the options page.
 */

console.log(themes);
const settings = {
    showThemes: true,
    themes: function() {
        // Import the themes variable from /pages/global-constants.js
        // In a Chromium extension, use import if your scripts are modules (type="module" or .mjs files)
        return themes;
    },
    showStyles: false,
    showBackground: true

}

var isSynced = {
    theme: true,
    links: true,
    background: true,
    header: true,
    settings: true
};

/**
 * Retrieves the storage locations of settings and updates the storageLocations object.
 */
chrome.storage.local.get(["locations"], (locations) => {
    isSynced.theme = locations.theme;
    isSynced.background = locations.background;
});

if (isSynced.links == true) {
    chrome.storage.sync.get(["settings"], (data) => {
        if (data.settings) {
            settings.background = data.settings.background;
            settings.themeID = data.settings.themeID;
            
        }
    });
} else {
    chrome.storage.local.get(["settings"], (data) => {
        if (data.linkGroups) {
            
        }
    });
}