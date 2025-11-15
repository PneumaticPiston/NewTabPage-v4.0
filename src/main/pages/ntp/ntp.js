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
SETTINGS.linkGroups.forEach((group) => {
    const newGroup = document.createElement('div');
    newGroup.className = 'group';
    console.log(group);
    if(group.type == "grid") {
        const h2 = document.createElement('h2');
        h2.textContent = group.name;
        h2.className = 'group-header';
        newGroup.appendChild(h2);

        const linksContainer = document.createElement('div');
        linksContainer.className = 'grid';

        newGroup.style.left = `${group.x}vw`;
        newGroup.style.top = `${group.y}vh`;

        linksContainer.style.gridTemplateRows = `repeat(${group.grid.r}, 1fr)`;
        linksContainer.style.gridTemplateColumns = `repeat(${group.grid.c}, 1fr)`;

        if(group.grid.overlow == "x") {
            newGroup.style.overflowX = 'scroll';
            newGroup.style.overflowY = 'hidden';
        } else if (group.grid.overflow == "y") {
            newGroup.style.overflowX = 'hidden';
            newGroup.style.overflowY = 'scroll';
        } else {
            newGroup.style.overflowX = 'hidden';
        }

        group.links.forEach(link => {
            const a = document.createElement('a');
            a.className = 'link';
            a.href = link.url;
            a.title = link.name;

            const img = document.createElement('img');
            img.src = getFavicon(link.url);
            img.alt = `${link.name} Favicon`;

            const span = document.createElement('span');
            span.textContent = link.name;

            a.appendChild(img);
            a.appendChild(span);
            linksContainer.appendChild(a);
        });
        newGroup.appendChild(linksContainer);
    } else if (group.type == "list") {
        // Handle list type groups here
        const h2 = document.createElement('h2');
        h2.textContent = group.name;
        h2.className = 'group-header';
        newGroup.appendChild(h2);

        const ul = document.createElement('ul');
        ul.className = 'list';

        group.links.forEach(link => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = link.url;
            a.textContent = link.name;
            li.appendChild(a);
            ul.appendChild(li);
        });

        newGroup.appendChild(ul);
    } else if (group.type == "widget") {
        // Handle widget type groups here
        const script = document.createElement('script');
        script.defer = true;
        script.src = WIDGET_TYPES[group.id.type].variants[group.id.var].path;
        newGroup.appendChild(script);
    }
    groupContainer.appendChild(newGroup);
});



const background = document.querySelector(".background-image");
if(SETTINGS.background.bgID == 1 && SETTINGS.background.imageHash) {
    background.style.backgroundImage = `url(${SETTINGS.background.imageHash})`;
}

if(SETTINGS.background.bgID == 2) {
    // Add gradient background
    background.style.background = `linear-gradient(var(--grad-angle), var(--primary-color) 0%, var(--secondary-color) 100%)`;
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