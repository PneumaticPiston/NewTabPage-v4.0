import { themes } from '../global-constants.js';

const settings = {
    showThemes: true,
    themes: function() {
        // Import the themes variable from /pages/global-constants.js
        // In a Chromium extension, use import if your scripts are modules (type="module" or .mjs files)
        return themes;
    },
    showStyles: false,
    styles: [
        {name: "Skeumorphic"},
        {name: "Flat"},
        {name: "Material"},
        {name: "Minimal"},
        {name: "Neumorphic"}
    ],
    showBackground: true

}