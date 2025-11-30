// Get the container where groups will be added
const groupContainer = document.getElementById('groups-container');

const editorElement = document.getElementById('group-editor');

var i = 0;
// Iterate over each group in settings.linkGroups
SETTINGS.linkGroups.forEach((group) => {
    const newGroup = document.createElement('div');
    newGroup.className = 'group';

    newGroup.dataset.index = i;

    const groupHoverPopup = document.createElement('div');
    groupHoverPopup.className = 'group-hover-popup';

    
    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.ariaLabel = 'Edit Group';
    editButton.addEventListener('click', () => {
        editGroup(newGroup.dataset.index);
    });
    groupHoverPopup.appendChild(editButton);

    const removeButton = document.createElement('button');
    removeButton.textContent = 'X';
    removeButton.ariaLabel = 'Remove Group';
    removeButton.addEventListener('click', () => {
        const indexToRemove = parseInt(newGroup.dataset.index);
        newGroup.remove();
        SETTINGS.linkGroups.splice(indexToRemove, 1);
        // Reindex all remaining groups
        reindexGroups();
        saveSettings();
    });
    groupHoverPopup.appendChild(removeButton);

    newGroup.appendChild(groupHoverPopup);

    makeDraggable(newGroup);
    if(group.type == 0) {
        // Handle grid type groups
        const h2 = document.createElement('h2');
        h2.textContent = group.name;
        h2.className = 'group-header';
        newGroup.appendChild(h2);

        const linksContainer = document.createElement('div');
        linksContainer.className = 'grid';

        // Convert percentage to px for consistency with drag system
        const canvasRect = groupContainer.getBoundingClientRect();
        const xPx = (group.x / 100) * canvasRect.width;
        const yPx = (group.y / 100) * canvasRect.height;
        newGroup.style.left = `${xPx}px`;
        newGroup.style.top = `${yPx}px`;

        linksContainer.style.gridTemplateRows = `repeat(${group.grid.r}, 1fr)`;
        linksContainer.style.gridTemplateColumns = `repeat(${group.grid.c}, 1fr)`;

        group.links.forEach(link => {
            const a = document.createElement('a');
            a.className = 'link';
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
    } else if (group.type == 1) {
        // Handle list type groups here
        const h2 = document.createElement('h2');
        h2.textContent = group.name;
        h2.className = 'group-header';
        newGroup.appendChild(h2);

        const ul = document.createElement('ul');
        ul.className = 'list';

        group.links.forEach(link => {
            const img = document.createElement('img');
            img.src = getFavicon(link.url);
            img.alt = `${link.name} Favicon`;
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.textContent = link.name;
            li.appendChild(img);
            li.appendChild(a);
            ul.appendChild(li);
        });

        newGroup.appendChild(ul);
    } else if (group.type == 2) {
        // Handle widget type groups here
        const script = document.createElement('script');
        script.defer = true;
        script.src = WIDGET_TYPES[group.id.type].variants[group.id.var].path+"?"+group.settings;
        newGroup.appendChild(script);
    }
    groupContainer.appendChild(newGroup);
    i++;
});



const background = document.querySelector(".background-image");

// Ensure bgID is a number
switch (parseInt(SETTINGS.background.bgID) || 0) {
    case 0:
        break;
    case 1: 
        if(SETTINGS.background.imageHash) {
            background.style.backgroundImage = `url('${SETTINGS.background.imageHash}')`;
            background.style.backgroundSize = 'cover';
            background.style.backgroundPosition = 'center';
        } else {
            background.style.background = '';
        }
        break;
    case 2:
        background.style.background = `linear-gradient(var(--grad-angle), var(--p-col) 0%, var(--s-col) 100%)`;
        break;
    default:
        background.style.background = '';
        break;

}
background.classList.add("loaded");

document.documentElement.setAttribute('data-theme', SETTINGS.themeID);
const themeElement = document.getElementById('theme');

themeElement.textContent = SETTINGS.themeColors;


function getFavicon(url) {
    // Use size=64 for higher resolution (Google supports 16, 32, 48, 64)

    // Add handling for sub domains

    // Default icon as SVG data URI if all else fails
    const DEFAULT_ICON = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJmZWF0aGVyIGZlYXRoZXItbGluayI+PHBhdGggZD0iTTEwIDEzYTUgNSAwIDAgMCA3LjU0LjU0bDMtM2E1IDUgMCAwIDAtNy4wNy03LjA3bC0xLjcyIDEuNzEiPjwvcGF0aD48cGF0aCBkPSJNMTQgMTFhNSA1IDAgMCAwLTcuNTQtLjU0bC0zIDNhNSA1IDAgMCAwIDcuMDcgNy4wN2wxLjcxLTEuNzEiPjwvcGF0aD48L3N2Zz4=';
    
    try {
        // Return default icon if URL is empty
        if (!url || url.trim() === '') {
            return DEFAULT_ICON;
        }
        
        // Make sure URL is properly formatted with protocol
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }
        
        // Extract domain information
        let parsedUrl;
        try {
            parsedUrl = new URL(url);
        } catch (e) {
            Debugger.error('Invalid URL format:', url, e);
            return DEFAULT_ICON;
        }
        
        const domain = parsedUrl.hostname;
        
        // Create a local favicon cache for this session if it doesn't exist
        if (!window.faviconCache) {
            window.faviconCache = new Map();
        }
        
        // Special handling for Google Calendar's dynamic favicon
        if (domain === 'calendar.google.com') {
            // Get today's date for the dynamic calendar icon
            // Since Google Calendar changes its favicon to match the current date
            const today = new Date();
            const dateString = today.getDate().toString();
            
            // Either use a static calendar icon or a dynamically generated one
            // Option 1: Use a generic calendar icon (doesn't show current date but always works)
            const calendarGenericIcon = 'https://ssl.gstatic.com/calendar/images/dynamiclogo_2020q4/calendar_' + dateString + '_2x.png';
            
            // Cache with a timestamp so it refreshes daily
            const cacheKey = `${domain}_${today.toDateString()}`;
            window.faviconCache.set(cacheKey, calendarGenericIcon);
            return calendarGenericIcon;
        }
        
        // Return cached favicon if available for other domains
        if (window.faviconCache.has(domain)) {
            return window.faviconCache.get(domain);
        }
        
        // Check for offline mode
        if (!navigator.onLine) {
            return DEFAULT_ICON;
        }
        
        // Special handling just for Google services that need specific icons
        const googleServiceIcons = {
            'mail.google.com': 'https://www.gstatic.com/images/branding/product/1x/gmail_2020q4_32dp.png',
            'drive.google.com': 'https://ssl.gstatic.com/docs/doclist/images/drive_2022q3_32dp.png',
            'docs.google.com': 'https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico',
            'sheets.google.com': 'https://ssl.gstatic.com/docs/spreadsheets/images/favicon_jfk2.png',
            'slides.google.com': 'https://ssl.gstatic.com/docs/presentations/images/favicon5.ico',
            'meet.google.com': 'https://www.gstatic.com/meet/favicon_meet_2023_32dp.png',
            'chat.google.com': 'https://www.gstatic.com/chat/favicon_chat_32px.png',
            'classroom.google.com': 'https://ssl.gstatic.com/classroom/favicon.png',
            'keep.google.com': 'https://ssl.gstatic.com/keep/icon_2020q4v2_32dp.png'
            // Calendar is handled separately above
        };
        
        // Check if this is a Google service with known icon
        if (googleServiceIcons[domain]) {
            const iconUrl = googleServiceIcons[domain];
            window.faviconCache.set(domain, iconUrl);
            return iconUrl;
        }
        
        // For non-special cases, use Google's favicon service
        const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
        
        // Cache the result for future use
        window.faviconCache.set(domain, faviconUrl);
        
        return faviconUrl;
    } catch (e) {
        Debugger.warn('Error getting favicon for URL:', url, e);
        return DEFAULT_ICON;
    }
}

// Configuration
let gridSize = 20;
let draggedElement = null;
let offsetX = 0;
let offsetY = 0;

// Make elements draggable (call this for each element)
function makeDraggable(element) {
  element.style.position = 'absolute';
  element.style.cursor = 'move';
  element.dataset.draggable = 'true'; // Mark as draggable
  element.addEventListener('mousedown', startDrag);
}

function startDrag(e) {
  // Find the draggable element (in case we clicked a child)
  draggedElement = e.target.closest('[data-draggable]');
  if (!draggedElement) return;
  
  const rect = draggedElement.getBoundingClientRect();
  const canvasRect = draggedElement.parentElement.getBoundingClientRect();
  
  offsetX = e.clientX - rect.left;
  offsetY = e.clientY - rect.top;
  
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', stopDrag);
  
  e.preventDefault();
}

function drag(e) {
  if (!draggedElement) return;
  
  const canvas = draggedElement.parentElement;
  const canvasRect = canvas.getBoundingClientRect();
  
  let x = e.clientX - canvasRect.left - offsetX;
  let y = e.clientY - canvasRect.top - offsetY;
  
  x = Math.max(0, x);
  y = Math.max(0, y);
  
  // Snap to grid while dragging
  x = Math.round(x / gridSize) * gridSize;
  y = Math.round(y / gridSize) * gridSize;
  
  draggedElement.style.left = x + 'px';
  draggedElement.style.top = y + 'px';
}

function stopDrag(e) {
  if (!draggedElement) return;
  
  try {
        const canvas = draggedElement.parentElement;
        const canvasRect = canvas.getBoundingClientRect();
        const elementIndex = parseInt(draggedElement.dataset.index); // Ensure it's a number
        
        let x = parseInt(draggedElement.style.left) || 0;
        let y = parseInt(draggedElement.style.top) || 0;
        
        // Store position as percentage for resize handling
        draggedElement.dataset.percentX = (x / canvasRect.width * 100).toFixed(2);
        draggedElement.dataset.percentY = (y / canvasRect.height * 100).toFixed(2);

        // Update settings with new position - add safety check
        if (SETTINGS.linkGroups[elementIndex]) {
            SETTINGS.linkGroups[elementIndex].x = (x / canvasRect.width * 100).toFixed(2);
            SETTINGS.linkGroups[elementIndex].y = (y / canvasRect.height * 100).toFixed(2);
        }
        
        saveSettings();
    } catch (error) {
        console.error('Error in stopDrag:', error);
    } finally {
        // Always clean up, even if there's an error
        draggedElement = null;
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('mouseup', stopDrag);
    }
}

// Handle window resize (call this on resize event)
function handleResize(canvas) {
  const elements = canvas.querySelectorAll('[data-percent-x]');
  const canvasRect = canvas.getBoundingClientRect();
  
  elements.forEach(el => {
    const percentX = parseFloat(el.dataset.percentX) || 0;
    const percentY = parseFloat(el.dataset.percentY) || 0;
    
    let x = (percentX / 100) * canvasRect.width;
    let y = (percentY / 100) * canvasRect.height;
    
    x = Math.round(x / gridSize) * gridSize;
    y = Math.round(y / gridSize) * gridSize;
    
    el.style.left = x + 'px';
    el.style.top = y + 'px';
  });
}
window.addEventListener('resize', () => handleResize(groupContainer));

function reindexGroups() {
    const groups = document.querySelectorAll('.group');
    groups.forEach((group, index) => {
        group.dataset.index = index;
    });
}

function saveSettings() {
    console.log('Saving settings...');
    // Update group positions before saving
    const groups = document.querySelectorAll('.group');
    groups.forEach((group, index) => {
        const canvasRect = groupContainer.getBoundingClientRect();
        const x = parseInt(group.style.left) || 0;
        const y = parseInt(group.style.top) || 0;
        if (SETTINGS.linkGroups[index]) {
            // Convert to percentage and ensure it's a number
            SETTINGS.linkGroups[index].x = parseFloat(((x / canvasRect.width) * 100).toFixed(2));
            SETTINGS.linkGroups[index].y = parseFloat(((y / canvasRect.height) * 100).toFixed(2));
        }
    });

    console.log('Settings to save:', JSON.stringify(SETTINGS.linkGroups, null, 2));
    saveToSettings('linkGroups', SETTINGS.linkGroups);
}

document.getElementById('save-button').addEventListener('click', () => {
    saveSettings();
});
document.getElementById('add-group-button').addEventListener('click', () => {
    // Logic to add a new group
    console.log('Add Group button clicked');

    const newGroup = document.createElement('div');
    newGroup.className = 'group';

    newGroup.dataset.index = SETTINGS.linkGroups.length;

    const groupHoverPopup = document.createElement('div');
    groupHoverPopup.className = 'group-hover-popup';

    
    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.ariaLabel = 'Edit Group';
    editButton.addEventListener('click', () => {
        editGroup(newGroup.dataset.index);
    });
    groupHoverPopup.appendChild(editButton);

    const removeButton = document.createElement('button');
    removeButton.textContent = 'X';
    removeButton.ariaLabel = 'Remove Group';
    removeButton.addEventListener('click', () => {
        const indexToRemove = parseInt(newGroup.dataset.index);
        newGroup.remove();
        SETTINGS.linkGroups.splice(indexToRemove, 1);
        // Reindex all remaining groups
        reindexGroups();
        saveSettings();
    });
    groupHoverPopup.appendChild(removeButton);

    newGroup.appendChild(groupHoverPopup);

    makeDraggable(newGroup);

    const group = {
        name: "New Group",
        x: 40,
        y: 40,
        type: 0,
        grid: {r: 1, c: 1},
        links: [

        ]
    };
    SETTINGS.linkGroups.push(group);

    // Handle grid type groups
    const h2 = document.createElement('h2');
    h2.textContent = group.name;
    h2.className = 'group-header';
    newGroup.appendChild(h2);

    const linksContainer = document.createElement('div');
    linksContainer.className = 'grid';

    // Convert percentage to px for consistency with drag system
    const canvasRect = groupContainer.getBoundingClientRect();
    const xPx = (group.x / 100) * canvasRect.width;
    const yPx = (group.y / 100) * canvasRect.height;
    newGroup.style.left = `${xPx}px`;
    newGroup.style.top = `${yPx}px`;

    linksContainer.style.gridTemplateRows = `repeat(${group.grid.r}, 1fr)`;
    linksContainer.style.gridTemplateColumns = `repeat(${group.grid.c}, 1fr)`;

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
    groupContainer.appendChild(newGroup);

    saveSettings();
});

document.getElementById('add-widget-button').addEventListener('click', () => {
    // Logic to add a new widget
    console.log('Add Widget button clicked');
});

function editGroup(index) {
    // Logic to edit the group at the given index
    console.log('Edit Group button clicked for index:', index);

    const element = document.querySelector(`.group[data-index='${index}']`);
    const group = SETTINGS.linkGroups[index];
    if (!element || !group) {
        console.error('Group element or data not found for index:', index);
        return;
    }

    console.log('Editing group:', group);
    // Open the editor with the group's data
    editorElement.style.display = 'block';

    // Populate the editor with the group's current data
    document.getElementById('group-name-input').value = group.name || '';
    document.getElementById('group-type-select').value = group.type || 0;

    // Set grid options if it's a grid type
    const gridOptions = document.getElementById('grid-options');
    const gridRowsInput = document.getElementById('grid-rows');
    const gridColumnsInput = document.getElementById('grid-columns');

    if (group.type === 0 && group.grid) {
        gridOptions.style.display = 'block';
        gridRowsInput.value = group.grid.r || 1;
        gridColumnsInput.value = group.grid.c || 1;
    } else {
        gridOptions.style.display = 'none';
    }

    // Handle type change to show/hide grid options
    const typeSelect = document.getElementById('group-type-select');
    typeSelect.onchange = () => {
        if (typeSelect.value === '0') {
            gridOptions.style.display = 'block';
        } else {
            gridOptions.style.display = 'none';
        }
    };

    // Populate links list
    const linksList = document.getElementById('group-editor-links');
    linksList.innerHTML = ''; // Clear existing links

    if (group.links && group.links.length > 0) {
        group.links.forEach((link) => {
            addLinkToEditor(linksList, link.name, link.url);
        });
    }

    // Setup Add Link button
    const addLinkBtn = document.getElementById('add-link-btn');
    addLinkBtn.onclick = () => {
        addLinkToEditor(linksList, '', '');
    };

    // Save changes when the save button is clicked
    document.getElementById('save-group-button').onclick = () => {
        console.log('Saving group changes for index:', index);

        // Update group properties
        group.name = document.getElementById('group-name-input').value;
        const newType = parseInt(document.getElementById('group-type-select').value);
        const typeChanged = group.type !== newType;
        group.type = newType;

        // Update grid settings if it's a grid type
        if (group.type === 0) {
            if (!group.grid) {
                group.grid = { r: 1, c: 1 };
            }
            group.grid.r = parseInt(gridRowsInput.value) || 1;
            group.grid.c = parseInt(gridColumnsInput.value) || 1;
        }

        // Collect all links from the editor
        const linkItems = linksList.querySelectorAll('.editor-link-item');
        group.links = [];
        linkItems.forEach(item => {
            const nameInput = item.querySelector('.link-name-input');
            const urlInput = item.querySelector('.link-url-input');
            if (nameInput && urlInput && nameInput.value.trim() && urlInput.value.trim()) {
                group.links.push({
                    name: nameInput.value.trim(),
                    url: urlInput.value.trim()
                });
            }
        });

        // Update the SETTINGS object
        SETTINGS.linkGroups[index] = group;

        // Rebuild the entire group element if type changed
        if (typeChanged) {
            rebuildGroupElement(element, group, index);
        } else {
            // Just update the header and links
            const header = element.querySelector('.group-header');
            if (header) {
                header.textContent = group.name;
            }

            // Rebuild the links display
            const linksContainer = element.querySelector('.grid, .list');
            if (linksContainer) {
                linksContainer.innerHTML = '';

                if (group.type === 0) {
                    // Grid type
                    linksContainer.className = 'grid';
                    linksContainer.style.gridTemplateRows = `repeat(${group.grid.r}, 1fr)`;
                    linksContainer.style.gridTemplateColumns = `repeat(${group.grid.c}, 1fr)`;

                    group.links.forEach(link => {
                        const a = document.createElement('a');
                        a.className = 'link';
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
                } else if (group.type === 1) {
                    // List/Stack type
                    linksContainer.className = 'list';
                    group.links.forEach(link => {
                        const img = document.createElement('img');
                        img.src = getFavicon(link.url);
                        img.alt = `${link.name} Favicon`;
                        const li = document.createElement('li');
                        const a = document.createElement('a');
                        a.textContent = link.name;
                        li.appendChild(img);
                        li.appendChild(a);
                        linksContainer.appendChild(li);
                    });
                }
            }
        }

        saveSettings();
        editorElement.style.display = 'none';
    };

    // Close the editor when the cancel button is clicked
    document.getElementById('cancel-group-button').onclick = () => {
        console.log('Cancelling group edit for index:', index);
        editorElement.style.display = 'none';
    };
}

function addLinkToEditor(linksList, name, url) {
    const li = document.createElement('li');
    li.className = 'editor-link-item';

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = name;
    nameInput.placeholder = 'Link Name';
    nameInput.className = 'link-name-input';

    const urlInput = document.createElement('input');
    urlInput.type = 'text';
    urlInput.value = url;
    urlInput.placeholder = 'URL';
    urlInput.className = 'link-url-input';

    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.className = 'remove-link-btn';
    removeBtn.onclick = () => {
        li.remove();
    };

    li.appendChild(nameInput);
    li.appendChild(urlInput);
    li.appendChild(removeBtn);
    linksList.appendChild(li);
}

function rebuildGroupElement(element, group, index) {
    // Clear the element content except for the hover popup
    const hoverPopup = element.querySelector('.group-hover-popup');
    element.innerHTML = '';
    if (hoverPopup) {
        element.appendChild(hoverPopup);
    }

    // Add header
    const h2 = document.createElement('h2');
    h2.textContent = group.name;
    h2.className = 'group-header';
    element.appendChild(h2);

    // Add links container based on type
    if (group.type === 0) {
        // Grid type
        const linksContainer = document.createElement('div');
        linksContainer.className = 'grid';
        linksContainer.style.gridTemplateRows = `repeat(${group.grid.r}, 1fr)`;
        linksContainer.style.gridTemplateColumns = `repeat(${group.grid.c}, 1fr)`;

        group.links.forEach(link => {
            const a = document.createElement('a');
            a.className = 'link';
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
        element.appendChild(linksContainer);
    } else if (group.type === 1) {
        // List/Stack type
        const ul = document.createElement('ul');
        ul.className = 'list';

        group.links.forEach(link => {
            const img = document.createElement('img');
            img.src = getFavicon(link.url);
            img.alt = `${link.name} Favicon`;
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.textContent = link.name;
            li.appendChild(img);
            li.appendChild(a);
            ul.appendChild(li);
        });
        element.appendChild(ul);
    }
}