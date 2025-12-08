
// Theme data structure containing all predefined themes
const THEMES = {
    'light': { name: 'Light', colors: { b: '#ffffff', p: '#2f3a44', s: '#f3f4f6', t: '#111827', a: '#3b82f6' } },
    'dark': { name: 'Dark', colors: { b: '#0b1220', p: '#111827', s: '#0f1724', t: '#e6eef6', a: '#60a5fa' } },
    'modern-dark': { name: 'Modern Dark', colors: { b: '#1a1b26', p: '#2b2d42', s: '#8d99ae', t: '#edf2f4', a: '#ef233c' } },
    'light-minimal': { name: 'Light Minimal', colors: { b: '#f1faee', p: '#457b9d', s: '#a8dadc', t: '#1d3557', a: '#e63946' } },
    'forest': { name: 'Forest', colors: { b: '#b7e4c7', p: '#2d6a4f', s: '#95d5b2', t: '#081c15', a: '#d8a47f' } },
    'ocean': { name: 'Ocean', colors: { b: '#caf0f8', p: '#023e8a', s: '#48cae4', t: '#03045e', a: '#ff9e00' } },
    'sunset': { name: 'Sunset', colors: { b: '#ffbf69', p: '#582f0e', s: '#f77f00', t: '#003049', a: '#d62828' } },
    'cyberpunk': { name: 'Cyberpunk', colors: { b: '#120458', p: '#2b0f54', s: '#7209b7', t: '#f72585', a: '#00ff9f' } },
    'midnight-blue': { name: 'Midnight Blue', colors: { b: '#0a1128', p: '#0c2340', s: '#1d4e89', t: '#ecf0f1', a: '#3da5d9' } },
    'emerald-dark': { name: 'Emerald Dark', colors: { b: '#082c14', p: '#064420', s: '#0b6e4f', t: '#d8f3dc', a: '#83e377' } },
    'slate-blue': { name: 'Slate Blue', colors: { b: '#0f172a', p: '#1e3a8a', s: '#3b82f6', t: '#f8fafc', a: '#22d3ee' } },
    'deep-purple': { name: 'Deep Purple', colors: { b: '#2e1065', p: '#4c1d95', s: '#7c3aed', t: '#f5f3ff', a: '#2dd4bf' } },
    'nord': { name: 'Nord', colors: { b: '#2e3440', p: '#5e81ac', s: '#88c0d0', t: '#eceff4', a: '#bf616a' } },
    'rose-gold': { name: 'Rose Gold', colors: { b: '#f9f2f5', p: '#c17f98', s: '#dda5b6', t: '#442c37', a: '#e8b4bc' } },
    'neon-night': { name: 'Neon Night', colors: { b: '#0f0f0f', p: '#1e0b28', s: '#530068', t: '#f2ebf2', a: '#00ff95' } },
    'autumn': { name: 'Autumn', colors: { b: '#f4e9d2', p: '#884a39', s: '#c38154', t: '#402218', a: '#f76b15' } },
    'pastel': { name: 'Pastel', colors: { b: '#fef6ff', p: '#b8c0ff', s: '#ffd6ff', t: '#5c5470', a: '#9bf6ff' } },
    'monochrome': { name: 'Monochrome', colors: { b: '#f5f5f5', p: '#333333', s: '#777777', t: '#111111', a: '#bbbbbb' } },
    'dark-rose': { name: 'Dark Rose', colors: { b: '#1a1118', p: '#2c1f26', s: '#4a3641', t: '#f2e9ed', a: '#d64b8b' } }
};

/**
 * Minifies CSS by removing unnecessary whitespace and newlines
 * @param {string} css - The CSS to minify
 * @returns {string} - Minified CSS
 */
function minifyCSS(css) {
    return css
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/\s*([{}:;,])\s*/g, '$1') // Remove spaces around special characters
        .trim();
}

/**
 * Unminifies CSS by adding proper formatting and indentation
 * @param {string} css - The minified CSS to format
 * @returns {string} - Formatted CSS
 */
function unminifyCSS(css) {
    if (!css || css.trim() === '') return '';

    return css
        .replace(/\{/g, ' {\n    ') // Add newline and indent after opening brace
        .replace(/;/g, ';\n    ') // Add newline and indent after semicolon
        .replace(/\}/g, '\n}') // Add newline before closing brace
        .replace(/\s+\}/g, '\n}') // Clean up spacing before closing brace
        .trim();
}

document.documentElement.setAttribute('data-theme', SETTINGS.themeID);
const themeElement = document.getElementById('theme');

// Unminify and display the theme data
themeElement.textContent = unminifyCSS(SETTINGS.themeData);

// Wait for settings to be initialized, then load UI
initializeSettings().then(() => {
    document.documentElement.setAttribute('data-theme', SETTINGS.themeID);
    // Unminify the CSS for display in the editor
    themeElement.textContent = unminifyCSS(SETTINGS.themeData);
    generateThemeCards();
    loadSettings();
    setupEventListeners();
}).catch(error => {
    debug.error("Failed to initialize settings:", error);
    // Fall back to default behavior even if initialization fails
    generateThemeCards();
    loadSettings();
    setupEventListeners();
});

/**
 * Generates theme cards for all available themes
 */
function generateThemeCards() {
    const themeOptions = document.getElementById('theme-options');
    if (!themeOptions) {
        debug.error('Theme options container not found');
        return;
    }

    // Clear existing content
    themeOptions.innerHTML = '';

    // Generate cards for each predefined theme
    Object.entries(THEMES).forEach(([themeId, themeData]) => {
        const themeCard = createThemeCard(themeId, themeData);
        themeOptions.appendChild(themeCard);
    });

    // Add custom theme card at the end
    const customCard = createCustomThemeCard();
    themeOptions.appendChild(customCard);
}

/**
 * Creates a theme card element
 */
function createThemeCard(themeId, themeData) {
    const card = document.createElement('div');
    card.className = 'theme-card';

    const input = document.createElement('input');
    input.type = 'radio';
    input.id = `theme-${themeId}`;
    input.name = 'theme-type';
    input.value = themeId;
    input.checked = SETTINGS.themeID === themeId;

    const label = document.createElement('label');
    label.htmlFor = `theme-${themeId}`;
    label.className = 'card-label';

    const preview = document.createElement('div');
    preview.className = 'card-preview theme-preview';

    // Create color palette display
    const colorPalette = document.createElement('div');
    colorPalette.className = 'color-palette';
    colorPalette.innerHTML = `
        <div class="color-row">
            <div class="color-swatch" style="background-color: ${themeData.colors.b}" title="Background"></div>
            <div class="color-swatch" style="background-color: ${themeData.colors.p}" title="Primary"></div>
            <div class="color-swatch" style="background-color: ${themeData.colors.s}" title="Secondary"></div>
        </div>
        <div class="color-row">
            <div class="color-swatch" style="background-color: ${themeData.colors.t}" title="Text"></div>
            <div class="color-swatch" style="background-color: ${themeData.colors.a}" title="Accent"></div>
        </div>
    `;

    preview.appendChild(colorPalette);
    label.appendChild(preview);

    const title = document.createElement('span');
    title.className = 'card-title';
    title.textContent = themeData.name;
    label.appendChild(title);

    card.appendChild(input);
    card.appendChild(label);

    return card;
}

/**
 * Creates the custom theme card
 */
function createCustomThemeCard() {
    const card = document.createElement('div');
    card.className = 'theme-card';

    const input = document.createElement('input');
    input.type = 'radio';
    input.id = 'theme-custom';
    input.name = 'theme-type';
    input.value = 'custom';
    input.checked = SETTINGS.themeID === 'custom';

    const label = document.createElement('label');
    label.htmlFor = 'theme-custom';
    label.className = 'card-label';

    const preview = document.createElement('div');
    preview.className = 'card-preview theme-preview';
    preview.innerHTML = '<div class="custom-theme-icon">✏️</div>';

    label.appendChild(preview);

    const title = document.createElement('span');
    title.className = 'card-title';
    title.textContent = 'Custom';
    label.appendChild(title);

    card.appendChild(input);
    card.appendChild(label);

    return card;
}

/**
 * Sets up event listeners for all setting changes
 */
function setupEventListeners() {

    // Theme selection change
    const themeInputs = document.querySelectorAll('input[name="theme-type"]');
    themeInputs.forEach(input => {
        input.addEventListener('change', (event) => {
            const newThemeID = event.target.value;
            debug.log('Theme changed to:', newThemeID);
            SETTINGS.themeID = newThemeID;

            // Apply theme immediately
            document.documentElement.setAttribute('data-theme', newThemeID);

            // Show/hide custom theme section
            const customSection = document.getElementById('custom-theme-section');
            if (newThemeID === 'custom') {
                customSection.style.display = 'block';
            } else {
                customSection.style.display = 'none';
            }

            saveSetting('theme');
            debug.log('Theme saved:', SETTINGS.themeID);
        });
    });

    // Custom theme CSS editor change
    const themeEditor = document.getElementById('theme');
    if (themeEditor) {
        themeEditor.addEventListener('input', () => {
            updateCustomTheme();
        });
    }

    // Background type change
    const backgroundInputs = document.querySelectorAll('input[name="background-type"]');
    backgroundInputs.forEach(input => {
        input.addEventListener('change', (event) => {
            const newBgID = parseInt(event.target.value);
            debug.log('Background type changed to:', newBgID);
            SETTINGS.background.bgID = newBgID;
            saveSetting('background');
            debug.log('Background saved:', SETTINGS.background);
        });
    });

    // UI Style selection change
    const uiStyleInputs = document.querySelectorAll('input[name="ui-style"]');
    uiStyleInputs.forEach(input => {
        input.addEventListener('change', (event) => {
            const newUIStyle = event.target.value;
            debug.log('UI Style changed to:', newUIStyle);
            SETTINGS.uiStyle = newUIStyle;

            // Apply UI style immediately
            document.documentElement.setAttribute('data-ui-style', newUIStyle);

            saveUIStyle();
            debug.log('UI Style saved:', SETTINGS.uiStyle);
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

    // API key visibility toggle
    const toggleApiKeyBtn = document.getElementById('toggle-api-key-visibility');
    const apiKeyInput = document.getElementById('openweather-api-key');
    if (toggleApiKeyBtn && apiKeyInput) {
        toggleApiKeyBtn.addEventListener('click', () => {
            if (apiKeyInput.type === 'password') {
                apiKeyInput.type = 'text';
                toggleApiKeyBtn.textContent = '🙈';
            } else {
                apiKeyInput.type = 'password';
                toggleApiKeyBtn.textContent = '👁️';
            }
        });
    }

    // API key save button
    const saveApiKeyBtn = document.getElementById('save-api-key-btn');
    if (saveApiKeyBtn && apiKeyInput) {
        saveApiKeyBtn.addEventListener('click', () => {
            saveApiKey();
        });

        // Also save on Enter key
        apiKeyInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                saveApiKey();
            }
        });
    }

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
                    debug.log('File selected:', file.name, 'Size:', file.size);
                    // Calculate file hash
                    const fileHash = await calculateFileHash(file);
                    debug.log('File hash calculated:', fileHash);

                    // Read file as data URL
                    const reader = new FileReader();
                    reader.onload = async (e) => {
                        const dataUrl = e.target.result;

                        // Check size - with unlimitedStorage we can handle larger files
                        const sizeInMB = dataUrl.length / (1024 * 1024);
                        if (sizeInMB > 50) {
                            debug.error('Image file is too large to save. Max 50MB allowed. Current:', sizeInMB.toFixed(2), 'MB');
                            alert('Image file is too large. Please use an image smaller than 50MB.');
                            return;
                        }

                        SETTINGS.background.imageHash = dataUrl;
                        SETTINGS.background.fileHash = fileHash;
                        SETTINGS.background.bgID = 1; // Ensure bgID is set to custom
                        debug.log('Background settings updated:', {
                            bgID: SETTINGS.background.bgID,
                            hasImageHash: !!SETTINGS.background.imageHash,
                            hasFileHash: !!SETTINGS.background.fileHash,
                            sizeInMB: sizeInMB.toFixed(2)
                        });

                        // ALWAYS save background image to local storage separately
                        // This ensures it persists even when switching background types
                        chrome.storage.local.set({
                            backgroundImage: dataUrl,
                            backgroundImageHash: fileHash
                        }, () => {
                            if (chrome.runtime.lastError) {
                                debug.error('Error saving background image to storage:', chrome.runtime.lastError);
                            } else {
                                debug.log('Background image saved to local storage successfully');
                            }
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
                            debug.log('Preview image updated');
                        }

                        // Save to storage
                        await saveSetting('background');
                    };
                    reader.readAsDataURL(file);
                } catch (error) {
                    debug.error('Error processing file:', error);
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
                debug.log('Upload placeholder clicked');
                if (fileInput) {
                    fileInput.click();
                } else {
                    debug.error('File input not found');
                }
            });
        }
    } else {
        debug.warn('Custom background card not found');
    }
}


/**
 * Updates the custom theme colors in SETTINGS
 * Minifies the CSS before saving to storage
 */
function updateCustomTheme() {
    const themeElement = document.getElementById('theme');
    if (!themeElement) {
        debug.error('Theme element not found');
        return;
    }
    // Minify the CSS before saving to storage
    SETTINGS.themeData = minifyCSS(themeElement.textContent);
    saveSetting('theme');
}

/**
 * Saves the OpenWeatherMap API key to storage
 */
function saveApiKey() {
    const apiKeyInput = document.getElementById('openweather-api-key');
    const statusDiv = document.getElementById('api-key-status');

    if (!apiKeyInput || !statusDiv) {
        debug.error('API key input or status div not found');
        return;
    }

    const apiKey = apiKeyInput.value.trim();

    if (!apiKey) {
        statusDiv.textContent = 'Please enter an API key';
        statusDiv.style.color = '#f44336';
        setTimeout(() => {
            statusDiv.textContent = '';
        }, 3000);
        return;
    }

    // Save to local storage
    chrome.storage.local.set({ openWeatherApiKey: apiKey }, () => {
        if (chrome.runtime.lastError) {
            debug.error('Error saving API key:', chrome.runtime.lastError);
            statusDiv.textContent = 'Error saving API key';
            statusDiv.style.color = '#f44336';
        } else {
            debug.log('API key saved successfully');
            statusDiv.textContent = 'API key saved successfully!';
            statusDiv.style.color = '#4CAF50';

            // Clear status message after 3 seconds
            setTimeout(() => {
                statusDiv.textContent = '';
            }, 3000);
        }
    });
}

/**
 * Loads the OpenWeatherMap API key from storage
 */
function loadApiKey() {
    chrome.storage.local.get(['openWeatherApiKey'], (result) => {
        if (result.openWeatherApiKey) {
            const apiKeyInput = document.getElementById('openweather-api-key');
            if (apiKeyInput) {
                apiKeyInput.value = result.openWeatherApiKey;
                debug.log('API key loaded');
            }
        }
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
 * Saves UI style to storage
 */
function saveUIStyle() {
    if (isSynced.other) {
        chrome.storage.sync.set({ uiStyle: SETTINGS.uiStyle });
        debug.log('UI style saved to sync storage');
    } else {
        chrome.storage.local.set({ uiStyle: SETTINGS.uiStyle });
        debug.log('UI style saved to local storage');
    }
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
                debug.log('linkGroups saved to sync storage');
            } else {
                chrome.storage.local.set({ linkGroups: SETTINGS.linkGroups });
                debug.log('linkGroups saved to local storage');
            }
            break;

        case 'theme':
            if (isSynced.theme) {
                chrome.storage.sync.set({
                    themeID: SETTINGS.themeID,
                    themeData: SETTINGS.themeData
                });
                debug.log('theme saved to sync storage');
            } else {
                chrome.storage.local.set({
                    themeID: SETTINGS.themeID,
                    themeData: SETTINGS.themeData
                });
                debug.log('theme saved to local storage');
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
            debug.log('Saving background to', isSynced.background ? 'sync' : 'local', 'storage:', backgroundDataStr);
            storageArea.set({ background: bgData }, () => {
                if (chrome.runtime.lastError) {
                    debug.error('Error saving background:', chrome.runtime.lastError);
                } else {
                    debug.log('Background saved successfully');
                }
            });
            break;

        case 'header':
            if (isSynced.header) {
                chrome.storage.sync.set({ header: SETTINGS.header });
                debug.log('header saved to sync storage');
            } else {
                chrome.storage.local.set({ header: SETTINGS.header });
                debug.log('header saved to local storage');
            }
            break;

        case 'other':
            if (isSynced.other) {
                chrome.storage.sync.set({ search: SETTINGS.search });
                debug.log('other settings saved to sync storage');
            } else {
                chrome.storage.local.set({ search: SETTINGS.search });
                debug.log('other settings saved to local storage');
            }
            break;

        case 'sync':
            chrome.storage.local.set({ locations: isSynced }, () => {
                if (chrome.runtime.lastError) {
                    debug.error('Error saving sync locations:', chrome.runtime.lastError);
                } else {
                    debug.log('Sync locations saved successfully');
                }
            });
            break;

        default:
            debug.warn(`Unknown setting type: ${settingType}`);
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
        if (SETTINGS.themeData) {
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
    // Always try to load from storage, regardless of current bgID
    chrome.storage.local.get(['backgroundImage'], (result) => {
        const previewImg = document.querySelector('.custom-preview .preview-image');
        if (previewImg) {
            if (result.backgroundImage) {
                previewImg.src = result.backgroundImage;
                previewImg.style.display = 'block';
                // Update SETTINGS if not already set
                if (!SETTINGS.background.imageHash) {
                    SETTINGS.background.imageHash = result.backgroundImage;
                }
                debug.log('Background preview loaded from storage');
            } else if (SETTINGS.background.imageHash) {
                previewImg.src = SETTINGS.background.imageHash;
                previewImg.style.display = 'block';
                debug.log('Background preview loaded from SETTINGS');
            } else {
                previewImg.style.display = 'none';
            }
        }
    });

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

    // Load and display UI style setting
    const uiStyleInput = document.querySelector(`input[name="ui-style"][value="${SETTINGS.uiStyle || 'default'}"]`);
    if (uiStyleInput) {
        uiStyleInput.checked = true;
    }
    // Apply UI style to document
    document.documentElement.setAttribute('data-ui-style', SETTINGS.uiStyle || 'default');

    // Load API key
    loadApiKey();
}

/**
 * Loads custom theme colors from SETTINGS into color picker inputs
 */
function loadCustomThemeColors() {
    // Parse the theme colors string to extract hex values
    const match = SETTINGS.themeData.match(/--b-col:(#[0-9a-f]+);--p-col:(#[0-9a-f]+);--s-col:(#[0-9a-f]+);--t-col:(#[0-9a-f]+);--a-col:(#[0-9a-f]+)/i);
    
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

document.getElementById('to-editor').addEventListener('click', () => {
    window.location.href = '/pages/ntp-editor/editor.html';
});