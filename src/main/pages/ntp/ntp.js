console.log("Loading onLoad.js");

const linkTemplate = {
    grid: function(group) {
        return `<div class="group grid" style="left: ${group.x}; top: ${group.y};">
            <h2>${group.title}</h2>
            <div class="links">
                ${group.links.map(link => `<a href="${link.url}">${link.name}</a>`).join('')}
            </div>
        `;
    }
}

document.getElementById('settings-button').addEventListener('click', () => {
    window.location.href = '/pages/settings/settings.html';
});

// Get the container where groups will be added
const groupContainer = document.getElementById('groups-container');

// Iterate over each group in settings.linkGroups
SETTINGS.linkGroups.forEach(group => {
    if(group.type == "grid") {
        // Build the grid group dynamically with JavaScript
        let template = document.createElement('div');
        template.className = 'group grid';
        template.style.position = "absolute";
        template.style.left = `${group.x}px`;
        template.style.top = `${group.y}px`;

        // Title

        if (!group.title || group.title.trim() === "") {
            
        } else {
            const title = document.createElement('h2');
            title.textContent = group.title;
            template.appendChild(title);
        }

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



const background = document.querySelector(".background-image");
if(SETTINGS.background.showImage && SETTINGS.background.imageHash) {
    background.style.backgroundImage = `url(${SETTINGS.background.imageHash})`;
}
background.classList.add("loaded");

document.documentElement.setAttribute('data-theme', SETTINGS.themeID);
const themeElement = document.getElementById('theme');

themeElement.textContent = SETTINGS.themeColors;


function getFavicon(url) {
    // Use size=64 for higher resolution (Google supports 16, 32, 48, 64)

    // Add handling for sub domains

    return `https://www.google.com/s2/favicons?sz=64&domain=${new URL(url).hostname}`;
}