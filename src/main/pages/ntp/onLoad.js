console.log("Loading onLoad.js");

/**
 * Stores where settings are located
 * If true, the setting is stored in chrome.storage.sync
 * If false, the setting is stored in chrome.storage.local
 */
var isSynced = {
    theme: true,
    links: true,
    background: true,
    header: true,
    other: true
};

/**
 * Retrieves the storage locations of settings and updates the storageLocations object.
 */
chrome.storage.local.get(["locations"], (locations) => {
    isSynced.links = locations.links;
    isSynced.theme = locations.theme;
    isSynced.background = locations.background;
});

if (isSynced.links == true) {
    chrome.storage.sync.get(["linkGroups"], (data) => {
        if (data.linkGroups) {
            const linkGroups = data.linkGroups;
        }
    });
} else {
    chrome.storage.local.get(["linkGroups"], (data) => {
        if (data.linkGroups) {
            const linkGroups = data.linkGroups;
        }
    });
}

const linkGroups = [
    {
        type: "grid",
        title: "Favorites",
        x: "10",
        y: "10",
        links: [
            { name: "Google", url: "https://www.google.com" },
            { name: "YouTube", url: "https://www.youtube.com" },
            { name: "GitHub", url: "https://www.github.com" },
            { name: "Reddit", url: "https://www.reddit.com" }
        ]
    },
    {
        type: "list",
        title: "Work",
        x: "10",
        y: "400",
        links: [
            { name: "Stack Overflow", url: "https://stackoverflow.com" },
            { name: "MDN Web Docs", url: "https://developer.mozilla.org" },
            { name: "W3Schools", url: "https://www.w3schools.com" }
        ]
    }
]

const linkTemplate = {
    grid: function(group) {
        `<div class="group grid" style="left: ${group.x}; top: ${group.y};">
            <h2>${group.title}</h2>
            <div class="links">
                ${group.links.map(link => `<a href="${link.url}">${link.name}</a>`).join('')}
            </div>
        `
    }
}

document.addEventListener('DOMContentLoaded', () => {

    document.getElementById('settings-button').addEventListener('click', () => {
        window.location.href = '/pages/settings/settings.html';
    });
    // Get the container where groups will be added
    const groupContainer = document.getElementById('groups-container');

    // Iterate over each group in settings.linkGroups
    linkGroups.forEach(group => {
        if(group.type == "grid") {
            // Build the grid group dynamically with JavaScript
            let template = document.createElement('div');
            template.className = 'group grid';
            template.style.left = `${group.x}px`;
            template.style.top = `${group.y}px`;

            // Title
            const title = document.createElement('h2');
            title.textContent = group.title;
            template.appendChild(title);

            // Links container
            const linksDiv = document.createElement('div');
            linksDiv.className = 'links';

            group.links.forEach(link => {
                const a = document.createElement('a');
                a.className = 'link';
                a.href = link.url;
                a.target = '_blank';
                a.title = link.name;

                const img = document.createElement('img');
                img.src = getFavicon(link.url);
                img.alt = `${link.name} Favicon`;

                const span = document.createElement('span');
                span.textContent = link.name;

                a.appendChild(img);
                a.appendChild(span);
                linksDiv.appendChild(a);
            });

            template.appendChild(linksDiv);
            groupContainer.appendChild(template);
        } else if(group.type == "list") {
            
        }
    });
});

function getFavicon(url) {
    // Use size=64 for higher resolution (Google supports 16, 32, 48, 64)

    // Add handling for sub domains

    return `https://www.google.com/s2/favicons?sz=64&domain=${new URL(url).hostname}`;
}