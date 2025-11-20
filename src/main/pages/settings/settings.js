
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

    // Background type change
    const backgroundInputs = document.querySelectorAll('input[name="background-type"]');
    backgroundInputs.forEach(input => {
        input.addEventListener('change', (event) => {
            const newBgID = parseInt(event.target.value);
            console.log('Background type changed to:', newBgID);
            SETTINGS.background.bgID = newBgID;
            saveSetting('background');
            console.log('Background saved:', SETTINGS.background);
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

    // File input handling for background image
    const fileInput = document.getElementById('bg-file-input-custom');
    if (fileInput) {
        fileInput.addEventListener('change', async (event) => {
            const file = event.target.files[0];
            if (file) {
                try {
                    console.log('File selected:', file.name, 'Size:', file.size);
                    // Calculate file hash
                    const fileHash = await calculateFileHash(file);
                    console.log('File hash calculated:', fileHash);
                    
                    // Read file as data URL
                    const reader = new FileReader();
                    reader.onload = async (e) => {
                        const dataUrl = e.target.result;
                        
                        // Check size before saving (Chrome storage limit is ~10MB per item)
                        const sizeInMB = dataUrl.length / (1024 * 1024);
                        if (sizeInMB > 5) {
                            console.error('Image file is too large to save. Max 5MB allowed. Current:', sizeInMB.toFixed(2), 'MB');
                            alert('Image file is too large. Please use an image smaller than 5MB.');
                            return;
                        }
                        
                        SETTINGS.background.imageHash = dataUrl;
                        SETTINGS.background.fileHash = fileHash;
                        SETTINGS.background.bgID = 1; // Ensure bgID is set to custom
                        console.log('Background settings updated:', {
                            bgID: SETTINGS.background.bgID,
                            hasImageHash: !!SETTINGS.background.imageHash,
                            hasFileHash: !!SETTINGS.background.fileHash,
                            sizeInMB: sizeInMB.toFixed(2)
                        });
                        
                        // Update UI to reflect custom background is now selected
                        const customBgRadio = document.getElementById('bg-custom');
                        if (customBgRadio) {
                            customBgRadio.checked = true;
                        }
                        
                        // Update preview
                        const previewImg = document.querySelector('.custom-preview .preview-image');
                        if (previewImg) {
                            previewImg.src = dataUrl;
                            previewImg.style.display = 'block';
                            console.log('Preview image updated');
                        }
                        
                        // Save to storage
                        await saveSetting('background');
                    };
                    reader.readAsDataURL(file);
                } catch (error) {
                    console.error('Error processing file:', error);
                }
            }
        });
    }

    // Trigger file input click when custom background card is clicked
    const customBgCard = document.querySelector('.background-card[data-type="custom"]');
    if (customBgCard) {
        const uploadPlaceholder = customBgCard.querySelector('.upload-placeholder');
        if (uploadPlaceholder) {
            uploadPlaceholder.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Upload placeholder clicked');
                if (fileInput) {
                    fileInput.click();
                } else {
                    console.error('File input not found');
                }
            });
        }
    } else {
        console.warn('Custom background card not found');
    }
}


/**
 * Updates the custom theme colors in SETTINGS
 */
function updateCustomTheme() {
    const themeElement = document.getElementById('theme');
    if (!themeElement) {
        console.error('Theme element not found');
        return;
    }
    SETTINGS.themeColors = themeElement.textContent;
    saveSetting('theme');
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
 * Calculates the SHA-256 hash of a file
 * @param {File} file - The file to hash
 * @returns {Promise<string>} - The hex string representation of the file hash
 */
async function calculateFileHash(file) {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
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
                console.log('linkGroups saved to sync storage');
            } else {
                chrome.storage.local.set({ linkGroups: SETTINGS.linkGroups });
                console.log('linkGroups saved to local storage');
            }
            break;

        case 'theme':
            if (isSynced.theme) {
                chrome.storage.sync.set({ 
                    themeID: SETTINGS.themeID, 
                    themeColors: SETTINGS.themeColors 
                });
                console.log('theme saved to sync storage');
            } else {
                chrome.storage.local.set({ 
                    themeID: SETTINGS.themeID, 
                    themeColors: SETTINGS.themeColors 
                });
                console.log('theme saved to local storage');
            }
            break;

        case 'background':
            const storageArea = isSynced.background ? chrome.storage.sync : chrome.storage.local;
            const bgData = {
                bgID: SETTINGS.background.bgID,
                imageHash: SETTINGS.background.imageHash || "",
                fileHash: SETTINGS.background.fileHash || ""
            };
            const backgroundDataStr = JSON.stringify(bgData);
            console.log('Saving background to', isSynced.background ? 'sync' : 'local', 'storage:', backgroundDataStr);
            storageArea.set({ background: bgData }, () => {
                if (chrome.runtime.lastError) {
                    console.error('Error saving background:', chrome.runtime.lastError);
                } else {
                    console.log('Background saved successfully');
                }
            });
            break;

        case 'header':
            if (isSynced.header) {
                chrome.storage.sync.set({ header: SETTINGS.header });
                console.log('header saved to sync storage');
            } else {
                chrome.storage.local.set({ header: SETTINGS.header });
                console.log('header saved to local storage');
            }
            break;

        case 'other':
            if (isSynced.other) {
                chrome.storage.sync.set({ search: SETTINGS.search });
                console.log('other settings saved to sync storage');
            } else {
                chrome.storage.local.set({ search: SETTINGS.search });
                console.log('other settings saved to local storage');
            }
            break;

        case 'sync':
            chrome.storage.local.set({ locations: isSynced }, () => {
                if (chrome.runtime.lastError) {
                    console.error('Error saving sync locations:', chrome.runtime.lastError);
                } else {
                    console.log('Sync locations saved successfully');
                }
            });
            break;

        default:
            console.warn(`Unknown setting type: ${settingType}`);
    }
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

    // Load background image preview if available
    if (SETTINGS.background.bgID === 1 && SETTINGS.background.imageHash) {
        const previewImg = document.querySelector('.custom-preview .preview-image');
        if (previewImg) {
            previewImg.src = SETTINGS.background.imageHash;
            previewImg.style.display = 'block';
            console.log('Background preview loaded');
        }
    } else {
        const previewImg = document.querySelector('.custom-preview .preview-image');
        if (previewImg) {
            previewImg.style.display = 'none';
        }
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
    const match = SETTINGS.themeColors.match(/--b-col:(#[0-9a-f]+);--p-col:(#[0-9a-f]+);--s-col:(#[0-9a-f]+);--t-col:(#[0-9a-f]+);--a-col:(#[0-9a-f]+)/i);
    
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