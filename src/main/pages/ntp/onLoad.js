console.log("Loading onLoad.js");

/**
 * Stores where settings are located
 * If true, the setting is stored in chrome.storage.sync
 * If false, the setting is stored in chrome.storage.local
 */
var storedLocations = {
    theme: true,
    links: true,
    background: true,
    header: true,
    other: true
};

/**
 * Retrieves the storage locations of settings and updates the storageLocations object.
 */
// chrome.storage.local.get(["locations"], (locations) => {
//     storageLocations.links = locations.links;
//     storageLocations.theme = locations.theme;
//     storageLocations.background = locations.background;
// });

// if (storedLocations.links == true) {
//     chrome.storage.sync.get(["linkGroups"], (data) => {
//         if (data.linkGroups) {
//             const linkGroups = data.linkGroups;
//         }
//     });
// } else {
//     chrome.storage.local.get(["linkGroups"], (data) => {
//         if (data.linkGroups) {
//             const linkGroups = data.linkGroups;
//         }
//     });
// }

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
    // Get the container where groups will be added
    const groupContainer = document.getElementById('groups-container');

    // Iterate over each group in settings.linkGroups
    linkGroups.forEach(group => {
        if(group.type == "grid") {

        } else if(group.type == "list") {
            let groupDiv = document.createElement('div');
            groupDiv.classList = 'group list';

            let title = document.createElement('h2');
            title.textContent = group.title;
            groupDiv.appendChild(title);

            let linksList = document.createElement('ul');
            linksList.className = 'links-list';

            group.links.forEach(link => {
                let listItem = document.createElement('li');

                let linkElement = document.createElement('a');
                linkElement.href = link.url;
                linkElement.textContent = link.name;

                // Create favicon image
                let favicon = document.createElement('img');
                favicon.src = getFavicon(link.url);
                favicon.alt = `${link.name} favicon`;
                favicon.className = 'favicon';

                // Insert favicon before link text
                linkElement.prepend(favicon);

                listItem.appendChild(linkElement);
                linksList.appendChild(listItem);
            });

            groupDiv.appendChild(linksList);
            groups.appendChild(groupDiv);
        }
    });
});

function getFavicon(url) {
    return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}`;
}