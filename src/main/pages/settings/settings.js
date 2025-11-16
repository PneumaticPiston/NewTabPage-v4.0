
document.documentElement.setAttribute('data-theme', SETTINGS.themeID);
const themeElement = document.getElementById('theme');

themeElement.textContent = SETTINGS.themeColors;

// Wait for settings to be initialized, then load UI
initializeSettings().then(() => {
    document.documentElement.setAttribute('data-theme', SETTINGS.themeID);
    themeElement.textContent = SETTINGS.themeColors;
    loadSettings();
    setupEventListeners();
    // Initialize theme selector after other settings are loaded
    initializeThemeSelector();
}).catch(error => {
    console.error("Failed to initialize settings:", error);
    // Fall back to default behavior even if initialization fails
    loadSettings();
    setupEventListeners();
    initializeThemeSelector();
});

/**
 * Sets up event listeners for all setting changes
 */
function setupEventListeners() {
    // Note: Theme change listeners are set up in themeLoader.js after themes are loaded
    // This is done in initializeThemeSelector() to ensure dynamic themes have listeners

    // Custom theme color changes
    const colorInputs = document.querySelectorAll('input[type="color"]');
    colorInputs.forEach(input => {
        input.addEventListener('change', () => {
            updateCustomTheme();
            saveSetting('theme');
        });
    });

    // Background type change
    const backgroundInputs = document.querySelectorAll('input[name="background-type"]');
    backgroundInputs.forEach(input => {
        input.addEventListener('change', (event) => {
            SETTINGS.background.bgID = parseInt(event.target.value);
            saveSetting('background');
        });
    });

    // Layout options change
    const layoutCheckboxes = document.querySelectorAll('.layout-options input[type="checkbox"]');
    layoutCheckboxes.forEach(input => {
        input.addEventListener('change', (event) => {
            if (event.target.id === 'show-bottom-section') {
                SETTINGS.bottom.show = event.target.checked;
            }
            saveSetting('other');
        });
    });

    // Accessibility options change
    const accessibilitySliders = document.querySelectorAll('.accessibility-options input[type="range"]');
    accessibilitySliders.forEach(input => {
        input.addEventListener('change', (event) => {
            updateAccessibilitySliderValue(event.target);
            saveAccessibilitySettings();
        });
        input.addEventListener('input', (event) => {
            updateAccessibilitySliderValue(event.target);
        });
    });

    const accessibilityCheckboxes = document.querySelectorAll('.accessibility-options input[type="checkbox"]');
    accessibilityCheckboxes.forEach(input => {
        input.addEventListener('change', () => {
            saveAccessibilitySettings();
        });
    });

    // Sync storage type changes
    const syncInputs = document.querySelectorAll('input[type="radio"][name^="storage-type-"]');
    syncInputs.forEach(input => {
        input.addEventListener('change', (event) => {
            const settingType = event.target.name.replace('storage-type-', '');
            const syncValue = event.target.value === 'sync';
            isSynced[settingType] = syncValue;
            saveSetting('sync');
        });
    });
}

/**
 * Updates the displayed value of an accessibility slider
 */
function updateAccessibilitySliderValue(input) {
    const container = input.parentElement;
    const valueSpan = container.querySelector('.slider-value');
    if (valueSpan) {
        valueSpan.textContent = input.value + '%';
    }
}

/**
 * Updates the custom theme colors in SETTINGS
 */
function updateCustomTheme() {
    const bgColor = document.getElementById('custom-bg-color')?.value || '#2e3440';
    const primaryColor = document.getElementById('custom-primary-color')?.value || '#5e81ac';
    const secondaryColor = document.getElementById('custom-secondary-color')?.value || '#88c0d0';
    const textColor = document.getElementById('custom-text-color')?.value || '#eceff4';
    const accentColor = document.getElementById('custom-accent-color')?.value || '#bf616a';

    SETTINGS.themeColors = `[data-theme="custom"]{--background-color:${bgColor};--primary-color:${primaryColor};--secondary-color:${secondaryColor};--text-color:${textColor};--accent-color:${accentColor};}`;
    
    const themeElement = document.getElementById('theme');
    if (themeElement) {
        themeElement.textContent = SETTINGS.themeColors;
    }
}

/**
 * Saves accessibility settings to storage
 */
function saveAccessibilitySettings() {
    const fontSize = document.getElementById('font-size-slider')?.value || 100;
    const uiScale = document.getElementById('scale-slider')?.value || 100;
    const reduceMotion = document.getElementById('reduce-motion')?.checked || false;
    const highContrast = document.getElementById('high-contrast')?.checked || false;

    SETTINGS.accessibility = {
        fontSize: parseInt(fontSize),
        uiScale: parseInt(uiScale),
        reduceMotion: reduceMotion,
        highContrast: highContrast
    };

    // Apply accessibility settings to document
    document.documentElement.style.fontSize = (fontSize / 100 * 16) + 'px';
    document.documentElement.style.transform = `scale(${uiScale / 100})`;
    document.documentElement.style.transformOrigin = 'top left';
    
    if (reduceMotion) {
        document.documentElement.setAttribute('data-reduce-motion', 'true');
    } else {
        document.documentElement.removeAttribute('data-reduce-motion');
    }

    if (highContrast) {
        document.documentElement.setAttribute('data-high-contrast', 'true');
    } else {
        document.documentElement.removeAttribute('data-high-contrast');
    }

    saveSetting('other');
}

/**
 * Saves a specific setting to storage
 * @param {string} settingType - The type of setting to save (background, theme, links, header, other, sync)
 */
async function saveSetting(settingType) {
    switch(settingType) {
        case 'linkGroups':
            if (isSynced.links) {
                chrome.storage.sync.set({ linkGroups: SETTINGS.linkGroups });
            } else {
                chrome.storage.local.set({ linkGroups: SETTINGS.linkGroups });
            }
            break;

        case 'theme':
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
            break;

        case 'background':
            if (isSynced.background) {
                chrome.storage.sync.set({ background: SETTINGS.background });
            } else {
                chrome.storage.local.set({ background: SETTINGS.background });
            }
            break;

        case 'header':
            if (isSynced.header) {
                chrome.storage.sync.set({ header: SETTINGS.header });
            } else {
                chrome.storage.local.set({ header: SETTINGS.header });
            }
            break;

        case 'other':
            if (isSynced.other) {
                chrome.storage.sync.set({ search: SETTINGS.search });
            } else {
                chrome.storage.local.set({ search: SETTINGS.search });
            }
            break;

        case 'sync':
            chrome.storage.local.set({ locations: isSynced });
            break;

        default:
            console.warn(`Unknown setting type: ${settingType}`);
    }

    console.log(`Setting "${settingType}" saved successfully`);
}

function loadSettings() {
    // Load and display theme setting
    const themeInput = document.querySelector(`input[name="theme-type"][value="${SETTINGS.themeID}"]`);
    if (themeInput) {
        themeInput.checked = true;
    }

    // Show/hide custom theme section
    const customSection = document.getElementById('custom-theme-section');
    if (SETTINGS.themeID === 'custom') {
        customSection.style.display = 'block';
        // Load custom theme colors
        if (SETTINGS.themeColors) {
            loadCustomThemeColors();
        }
    } else {
        customSection.style.display = 'none';
    }

    // Load and display background setting
    const bgInput = document.querySelector(`input[name="background-type"][value="${SETTINGS.background.bgID}"]`);
    if (bgInput) {
        bgInput.checked = true;
    }

    // Load layout settings
    const bottomCheckbox = document.getElementById('show-bottom-section');
    if (bottomCheckbox) {
        bottomCheckbox.checked = SETTINGS.bottom?.show || false;
    }

    // Load accessibility settings
    if (SETTINGS.accessibility) {
        const fontSizeSlider = document.getElementById('font-size-slider');
        if (fontSizeSlider) {
            fontSizeSlider.value = SETTINGS.accessibility.fontSize || 100;
            updateAccessibilitySliderValue(fontSizeSlider);
        }

        const uiScaleSlider = document.getElementById('scale-slider');
        if (uiScaleSlider) {
            uiScaleSlider.value = SETTINGS.accessibility.uiScale || 100;
            updateAccessibilitySliderValue(uiScaleSlider);
        }

        const reduceMotionCheckbox = document.getElementById('reduce-motion');
        if (reduceMotionCheckbox) {
            reduceMotionCheckbox.checked = SETTINGS.accessibility.reduceMotion || false;
        }

        const highContrastCheckbox = document.getElementById('high-contrast');
        if (highContrastCheckbox) {
            highContrastCheckbox.checked = SETTINGS.accessibility.highContrast || false;
        }

        // Apply accessibility settings to document
        document.documentElement.style.fontSize = (SETTINGS.accessibility.fontSize / 100 * 16) + 'px';
        document.documentElement.style.transform = `scale(${SETTINGS.accessibility.uiScale / 100})`;
        document.documentElement.style.transformOrigin = 'top left';
        
        if (SETTINGS.accessibility.reduceMotion) {
            document.documentElement.setAttribute('data-reduce-motion', 'true');
        }
        if (SETTINGS.accessibility.highContrast) {
            document.documentElement.setAttribute('data-high-contrast', 'true');
        }
    }

    // Load and display sync storage settings
    Object.keys(isSynced).forEach(settingType => {
        const storageType = isSynced[settingType] ? 'sync' : 'local';
        const syncInput = document.querySelector(`input[name="storage-type-${settingType}"][value="${storageType}"]`);
        if (syncInput) {
            syncInput.checked = true;
        }
    });
}

/**
 * Loads custom theme colors from SETTINGS into color picker inputs
 */
function loadCustomThemeColors() {
    // Parse the theme colors string to extract hex values
    const match = SETTINGS.themeColors.match(/--background-color:(#[0-9a-f]+);--primary-color:(#[0-9a-f]+);--secondary-color:(#[0-9a-f]+);--text-color:(#[0-9a-f]+);--accent-color:(#[0-9a-f]+)/i);
    
    if (match) {
        const bgColorInput = document.getElementById('custom-bg-color');
        const primaryColorInput = document.getElementById('custom-primary-color');
        const secondaryColorInput = document.getElementById('custom-secondary-color');
        const textColorInput = document.getElementById('custom-text-color');
        const accentColorInput = document.getElementById('custom-accent-color');

        if (bgColorInput) bgColorInput.value = match[1];
        if (primaryColorInput) primaryColorInput.value = match[2];
        if (secondaryColorInput) secondaryColorInput.value = match[3];
        if (textColorInput) textColorInput.value = match[4];
        if (accentColorInput) accentColorInput.value = match[5];
    }
}