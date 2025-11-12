
document.documentElement.setAttribute('data-theme', SETTINGS.themeID);
const themeElement = document.getElementById('theme');

themeElement.textContent = SETTINGS.themeColors;

loadSettings();

const background = document.querySelector('input[name="background-type"]');

background.addEventListener('change', (event) => {
    SETTINGS.background.showImage = bg.value;
    saveSettings();
});



window.addEventListener('beforeunload', () => {
    saveSettings();
});

async function saveSettings() {
    // Save linkGroups
    if (isSynced.links) {
        chrome.storage.sync.set({ linkGroups: SETTINGS.linkGroups });
    } else {
        chrome.storage.local.set({ linkGroups: SETTINGS.linkGroups });
    }

    // Save theme settings
    if (isSynced.theme) {
        chrome.storage.sync.set({ 
            themeID: SETTINGS.themeID, 
            themeColors: SETTINGS.themeColors 
        });
    } else {
        chrome.storage.local.set({ 
            themeID: SETTINGS.themeID, 
            themeColors: SETTINGS.themeColors 
        });
    }

    // Save background settings
    if (isSynced.background) {
        chrome.storage.sync.set({ background: SETTINGS.background });
    } else {
        chrome.storage.local.set({ background: SETTINGS.background });
    }

    // Save search settings
    if (isSynced.other) {
        chrome.storage.sync.set({ search: SETTINGS.search });
    } else {
        chrome.storage.local.set({ search: SETTINGS.search });
    }
    
    // Save header settings
    if (isSynced.header) {
        chrome.storage.sync.set({ header: SETTINGS.header });
    } else {
        chrome.storage.local.set({ header: SETTINGS.header });
    }

    console.log("Settings saved successfully");
}

function loadSettings() {
    // Background image
    document.querySelector(`input[name="background-type"][value="${SETTINGS.background.bgID}"]`).setAttribute('checked', true);
}