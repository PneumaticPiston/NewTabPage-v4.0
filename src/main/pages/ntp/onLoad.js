console.log("Loading onLoad.js");

/**
 * Stores where settings are located
 * If true, the setting is stored in chrome.storage.sync
 * If false, the setting is stored in chrome.storage.local
 */
var storageLocations = {
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

// if (storageLocations.links == true) {
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
        links: [
            { name: "Stack Overflow", url: "https://stackoverflow.com" },
            { name: "MDN Web Docs", url: "https://developer.mozilla.org" },
            { name: "W3Schools", url: "https://www.w3schools.com" }
        ]
    }
]

document.addEventListener('DOMContentLoaded', () => {
    // Get the container where groups will be added
    const groups = document.getElementById('groups-container');

    // Iterate over each group in settings.linkGroups
    linkGroups.forEach(group => {
        if(group.type == "grid") {
            let groupDiv = document.createElement('div');
            groupDiv.className = 'link-group';

            groupDiv.style.top = group.y;
            groupDiv.style.left = group.x;

            let title = document.createElement('h2');
            title.textContent = group.title;
            groupDiv.appendChild(title);

            let linksDiv = document.createElement('div');
            linksDiv.className = 'links-grid';

            group.links.forEach(link => {
                let linkElement = document.createElement('a');
                linkElement.href = link.url;
                linkElement.textContent = link.name;

                // Create favicon image
                let favicon = document.createElement('img');
                favicon.src = getFavicon(link.url);;
                favicon.alt = `${link.name} favicon`;
                favicon.className = 'favicon';

                // Insert favicon before link text
                linkElement.prepend(favicon);

                linksDiv.appendChild(linkElement);
            });

            groupDiv.appendChild(linksDiv);
            groups.appendChild(groupDiv);
        } else if(group.type == "list") {
            let groupDiv = document.createElement('div');
            groupDiv.className = 'link-group';

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