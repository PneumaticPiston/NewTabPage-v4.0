/**
 * Dynamically loads theme definitions from styles.css and generates theme selector UI
 */

/**
 * Extracts all theme definitions from a CSS string
 * @returns {Promise<Array>} Array of theme objects with name and colors
 */
async function loadThemesFromCSS() {
    try {
        const response = await fetch('/styles.css');
        const cssText = await response.text();

        // Regular expression to match [data-theme="..."] blocks
        const themeRegex = /\[data-theme="([^"]+)"\]\s*{([^}]+)}/g;
        const themes = [];
        let match;

        while ((match = themeRegex.exec(cssText)) !== null) {
            const themeName = match[1];
            const cssVars = match[2];

            // Extract color variables from the CSS block
            const colors = {
                backgroundColor: extractCSSVariable(cssVars, '--background-color'),
                primaryColor: extractCSSVariable(cssVars, '--primary-color'),
                secondaryColor: extractCSSVariable(cssVars, '--secondary-color'),
                textColor: extractCSSVariable(cssVars, '--text-color'),
                accentColor: extractCSSVariable(cssVars, '--accent-color')
            };

            themes.push({
                name: themeName,
                displayName: formatThemeName(themeName),
                colors: colors
            });
        }

        // Add custom theme option
        themes.push({
            name: 'custom',
            displayName: 'Custom',
            colors: null
        });

        return themes;
    } catch (error) {
        console.error('Error loading themes from CSS:', error);
        return [];
    }
}

/**
 * Extracts a CSS variable value from a CSS declaration block
 * @param {string} cssBlock - The CSS block content
 * @param {string} varName - The variable name to extract
 * @returns {string} The hex color value or empty string if not found
 */
function extractCSSVariable(cssBlock, varName) {
    const regex = new RegExp(`${varName}\\s*:\\s*([^;]+);`);
    const match = cssBlock.match(regex);
    return match ? match[1].trim() : '';
}

/**
 * Formats a theme name for display (converts kebab-case to Title Case)
 * @param {string} themeName - The theme name to format
 * @returns {string} Formatted theme name
 */
function formatThemeName(themeName) {
    return themeName
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Generates the HTML for theme cards with pie chart visualization
 * @param {Array} themes - Array of theme objects
 * @returns {string} HTML string for theme cards
 */
function generateThemeCardsHTML(themes) {
    return themes.map(theme => {
        const isCustom = theme.name === 'custom';
        
        if (isCustom) {
            // For custom theme, show a generic placeholder
            return `
                <div class="theme-card">
                    <input type="radio" id="theme-${theme.name}" name="theme-type" value="${theme.name}">
                    <label for="theme-${theme.name}" class="card-label">
                        <div class="card-preview theme-preview custom-preview">
                            <div class="pie-chart">
                                <div class="pie-segment" style="background: conic-gradient(#999 0deg 72deg, #777 72deg 144deg, #555 144deg 216deg, #444 216deg 288deg, #666 288deg 360deg);"></div>
                            </div>
                        </div>
                        <span class="card-title">${theme.displayName}</span>
                    </label>
                </div>
            `;
        }
        
        const bg = theme.colors?.backgroundColor || '#999999';
        const primary = theme.colors?.primaryColor || '#666666';
        const secondary = theme.colors?.secondaryColor || '#888888';
        const text = theme.colors?.textColor || '#333333';
        const accent = theme.colors?.accentColor || '#aaaaaa';
        
        // Create a conic gradient pie chart with 5 segments (72 degrees each)
        const pieGradient = `conic-gradient(${bg} 0deg 72deg, ${primary} 72deg 144deg, ${secondary} 144deg 216deg, ${text} 216deg 288deg, ${accent} 288deg 360deg)`;
        
        return `
            <div class="theme-card">
                <input type="radio" id="theme-${theme.name}" name="theme-type" value="${theme.name}">
                <label for="theme-${theme.name}" class="card-label">
                    <div class="card-preview theme-preview">
                        <div class="pie-chart" style="background: ${pieGradient};"></div>
                    </div>
                    <span class="card-title">${theme.displayName}</span>
                </label>
            </div>
        `;
    }).join('');
}

/**
 * Initializes the theme selector UI with dynamically loaded themes
 */
async function initializeThemeSelector() {
    try {
        const themes = await loadThemesFromCSS();
        const themeContainer = document.getElementById('theme-options');

        if (themeContainer && themes.length > 0) {
            themeContainer.innerHTML = generateThemeCardsHTML(themes);
            
            // Re-attach event listeners for newly created theme inputs
            attachThemeChangeListeners();
            
            console.log(`Loaded ${themes.length} themes successfully`);
            return themes;
        } else {
            console.warn('Theme container not found or no themes loaded');
            return [];
        }
    } catch (error) {
        console.error('Error initializing theme selector:', error);
        return [];
    }
}

/**
 * Attaches change event listeners to theme radio buttons
 */
function attachThemeChangeListeners() {
    const themeInputs = document.querySelectorAll('input[name="theme-type"]');
    themeInputs.forEach(input => {
        // Remove existing listeners by cloning
        const newInput = input.cloneNode(true);
        input.parentNode.replaceChild(newInput, input);
    });

    // Now attach fresh listeners
    document.querySelectorAll('input[name="theme-type"]').forEach(input => {
        input.addEventListener('change', (event) => {
            SETTINGS.themeID = event.target.value;
            document.documentElement.setAttribute('data-theme', SETTINGS.themeID);
            
            // Show/hide custom theme color picker
            const customSection = document.getElementById('custom-theme-section');
            if (event.target.value === 'custom') {
                customSection.style.display = 'block';
            } else {
                customSection.style.display = 'none';
            }
            
            saveSetting('theme');
        });
    });
}
