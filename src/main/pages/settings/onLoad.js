import { themes } from '../global.js';
import { applyTheme } from '../global.js';

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

applyTheme();