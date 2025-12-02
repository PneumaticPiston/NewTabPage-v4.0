// Get the container where groups will be added
const groupContainer = document.getElementById('groups-container');

const editorElement = document.getElementById('group-editor');

/**
 * Initialize the editor once settings are loaded
 */
async function initializeEditor() {
    // Wait for settings to be loaded from storage
    await settingsInitialized;

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

    // Set position for all group types - convert percentage to px for consistency with drag system
    const canvasRect = groupContainer.getBoundingClientRect();
    const xPx = (parseFloat(group.x) / 100) * canvasRect.width;
    const yPx = (parseFloat(group.y) / 100) * canvasRect.height;
    newGroup.style.left = `${xPx}px`;
    newGroup.style.top = `${yPx}px`;

    if(group.type == 0) {
        // Handle grid type groups
        const h2 = document.createElement('h2');
        h2.textContent = group.name;
        h2.className = 'group-header';
        newGroup.appendChild(h2);

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

    themeElement.textContent = SETTINGS.themeData;
}

// Initialize the editor when the page loads
initializeEditor();


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
            SETTINGS.linkGroups[elementIndex].x = parseFloat((x / canvasRect.width * 100).toFixed(2));
            SETTINGS.linkGroups[elementIndex].y = parseFloat((y / canvasRect.height * 100).toFixed(2));
        }
        
        saveSettings();
    } catch (error) {
        debug.error('Error in stopDrag:', error);
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
    debug.log('Saving settings...');
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

    debug.log('Settings to save:', JSON.stringify(SETTINGS.linkGroups, null, 2));
    saveToSettings('linkGroups', SETTINGS.linkGroups);
}

document.getElementById('save-button').addEventListener('click', () => {
    saveSettings();
});
document.getElementById('add-group-button').addEventListener('click', () => {
    // Logic to add a new group
    debug.log('Add Group button clicked');

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
    const xPx = (parseFloat(group.x) / 100) * canvasRect.width;
    const yPx = (parseFloat(group.y) / 100) * canvasRect.height;
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

    // Open the editor for the newly created group
    editGroup(SETTINGS.linkGroups.length - 1);
});

document.getElementById('add-widget-button').addEventListener('click', () => {
    // Logic to add a new widget
    debug.log('Add Widget button clicked');
    showWidgetSelector();
});

function editGroup(index) {
    // Logic to edit the group at the given index
    debug.log('Edit Group button clicked for index:', index);

    const element = document.querySelector(`.group[data-index='${index}']`);
    const group = SETTINGS.linkGroups[index];
    if (!element || !group) {
        debug.error('Group element or data not found for index:', index);
        return;
    }

    debug.log('Editing group:', group);
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
        debug.log('Saving group changes for index:', index);

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
        debug.log('Cancelling group edit for index:', index);
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

function createWidgetPreview(typeName, variantName) {
    const preview = document.createElement('div');
    preview.className = 'widget-preview';

    switch (typeName) {
        case 'Clock':
            if (variantName === 'Digital') {
                const digitalTime = document.createElement('div');
                digitalTime.className = 'widget-preview-digital';
                digitalTime.textContent = '12:34:56';
                preview.appendChild(digitalTime);
            } else if (variantName === 'Analog') {
                const canvas = document.createElement('canvas');
                canvas.width = 60;
                canvas.height = 60;
                canvas.className = 'widget-preview-analog';
                const ctx = canvas.getContext('2d');
                // Draw simple clock face
                ctx.beginPath();
                ctx.arc(30, 30, 28, 0, 2 * Math.PI);
                ctx.strokeStyle = '#333';
                ctx.lineWidth = 2;
                ctx.stroke();
                // Draw clock hands (10:10 position)
                ctx.beginPath();
                ctx.moveTo(30, 30);
                ctx.lineTo(30, 15);
                ctx.strokeStyle = '#333';
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(30, 30);
                ctx.lineTo(42, 30);
                ctx.strokeStyle = '#333';
                ctx.lineWidth = 2;
                ctx.stroke();
                preview.appendChild(canvas);
            } else if (variantName === 'World') {
                const worldText = document.createElement('div');
                worldText.className = 'widget-preview-digital';
                worldText.textContent = '🌍 12:34';
                preview.appendChild(worldText);
            }
            break;
        case 'Search':
            if (variantName === 'Bar') {
                const searchBar = document.createElement('div');
                searchBar.className = 'widget-preview-search-bar';
                searchBar.textContent = '🔍 Search...';
                preview.appendChild(searchBar);
            } else if (variantName === 'Box') {
                const searchBox = document.createElement('div');
                searchBox.className = 'widget-preview-search-box';
                searchBox.textContent = '🔍 Search';
                preview.appendChild(searchBox);
            }
            break;
        case 'Weather':
            const weatherIcon = document.createElement('div');
            weatherIcon.className = 'widget-preview-weather';
            if (variantName === 'Condition') {
                weatherIcon.textContent = '⛅ 72°F';
            } else if (variantName === 'Forecast') {
                weatherIcon.textContent = '📅 5-Day';
            } else if (variantName === 'Temperature') {
                weatherIcon.textContent = '🌡️ 72°';
            }
            preview.appendChild(weatherIcon);
            break;
        case 'Timers':
            const timerText = document.createElement('div');
            timerText.className = 'widget-preview-timer';
            if (variantName === 'Timer') {
                timerText.textContent = '⏱️ 00:00';
            } else if (variantName === 'Stopwatch') {
                timerText.textContent = '⏱️ 00:00:00';
            } else if (variantName === 'Pomodoro') {
                timerText.textContent = '🍅 25:00';
            }
            preview.appendChild(timerText);
            break;
        case 'Note':
            const noteDiv = document.createElement('div');
            noteDiv.className = 'widget-preview-note';
            noteDiv.textContent = '📝 Note...';
            preview.appendChild(noteDiv);
            break;
        case 'Todo':
            const todoDiv = document.createElement('div');
            todoDiv.className = 'widget-preview-todo';
            todoDiv.innerHTML = '☑️ Todo List<br>□ Task 1<br>□ Task 2';
            preview.appendChild(todoDiv);
            break;
        default:
            preview.textContent = variantName;
    }

    return preview;
}

function showWidgetSelector() {
    const widgetSelector = document.getElementById('widget-selector');
    const widgetCategories = document.getElementById('widget-categories');

    // Clear existing content
    widgetCategories.innerHTML = '';

    // Populate widget categories
    WIDGET_TYPES.forEach((widgetType, typeIndex) => {
        // Only show widgets that have show: true
        if (!widgetType.show) {
            return;
        }

        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'widget-category';

        const categoryTitle = document.createElement('h3');
        categoryTitle.textContent = widgetType.name;
        categoryDiv.appendChild(categoryTitle);

        const variantsDiv = document.createElement('div');
        variantsDiv.className = 'widget-variants';

        widgetType.variants.forEach((variant, variantIndex) => {
            const variantButton = document.createElement('button');
            variantButton.className = 'widget-variant-button';

            // Add preview
            const preview = createWidgetPreview(widgetType.name, variant.name);
            variantButton.appendChild(preview);

            // Add label
            const label = document.createElement('span');
            label.textContent = variant.name;
            variantButton.appendChild(label);

            variantButton.addEventListener('click', () => {
                widgetSelector.style.display = 'none';
                showWidgetSettings(typeIndex, variantIndex, widgetType.name, variant.name);
            });
            variantsDiv.appendChild(variantButton);
        });

        categoryDiv.appendChild(variantsDiv);
        widgetCategories.appendChild(categoryDiv);
    });

    // Show the widget selector
    widgetSelector.style.display = 'block';

    // Setup cancel button
    document.getElementById('cancel-widget-button').onclick = () => {
        widgetSelector.style.display = 'none';
    };
}

function showWidgetSettings(typeIndex, variantIndex, typeName, variantName) {
    const settingsDialog = document.getElementById('widget-settings-dialog');
    const settingsForm = document.getElementById('widget-settings-form');
    const settingsTitle = document.getElementById('widget-settings-title');

    // Clear existing settings
    settingsForm.innerHTML = '';
    settingsTitle.textContent = `Configure ${typeName} - ${variantName}`;

    // Generate settings based on widget type
    if (typeName === 'Clock') {
        // Timezone setting
        const timezoneGroup = document.createElement('div');
        timezoneGroup.className = 'setting-group';

        const timezoneLabel = document.createElement('label');
        timezoneLabel.textContent = 'Timezone:';
        timezoneLabel.htmlFor = 'widget-timezone';
        timezoneGroup.appendChild(timezoneLabel);

        const timezoneSelect = document.createElement('select');
        timezoneSelect.id = 'widget-timezone';
        const timezones = [
            'Local', 'UTC', 'America/New_York', 'America/Chicago', 'America/Denver',
            'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Asia/Tokyo',
            'Asia/Shanghai', 'Australia/Sydney'
        ];
        timezones.forEach(tz => {
            const option = document.createElement('option');
            option.value = tz;
            option.textContent = tz;
            timezoneSelect.appendChild(option);
        });
        timezoneGroup.appendChild(timezoneSelect);
        settingsForm.appendChild(timezoneGroup);

        // Show background setting
        const backgroundGroup = document.createElement('div');
        backgroundGroup.className = 'setting-group';

        const backgroundLabel = document.createElement('label');
        backgroundLabel.textContent = 'Show Background:';
        backgroundGroup.appendChild(backgroundLabel);

        const checkboxWrapper = document.createElement('div');
        checkboxWrapper.className = 'checkbox-wrapper';

        const backgroundCheckbox = document.createElement('input');
        backgroundCheckbox.type = 'checkbox';
        backgroundCheckbox.id = 'widget-background';
        backgroundCheckbox.checked = true;
        checkboxWrapper.appendChild(backgroundCheckbox);

        const checkboxLabel = document.createElement('label');
        checkboxLabel.htmlFor = 'widget-background';
        checkboxLabel.textContent = 'Display widget background';
        checkboxWrapper.appendChild(checkboxLabel);

        backgroundGroup.appendChild(checkboxWrapper);
        settingsForm.appendChild(backgroundGroup);

    } else if (typeName === 'Search') {
        // Search engine setting
        const engineGroup = document.createElement('div');
        engineGroup.className = 'setting-group';

        const engineLabel = document.createElement('label');
        engineLabel.textContent = 'Search Engine:';
        engineLabel.htmlFor = 'widget-search-engine';
        engineGroup.appendChild(engineLabel);

        const engineSelect = document.createElement('select');
        engineSelect.id = 'widget-search-engine';
        const engines = [
            { name: 'Google', value: 'https://www.google.com/search?q=' },
            { name: 'Bing', value: 'https://www.bing.com/search?q=' },
            { name: 'DuckDuckGo', value: 'https://duckduckgo.com/?q=' },
            { name: 'Yahoo', value: 'https://search.yahoo.com/search?p=' },
            { name: 'Brave', value: 'https://search.brave.com/search?q=' }
        ];
        engines.forEach(engine => {
            const option = document.createElement('option');
            option.value = engine.value;
            option.textContent = engine.name;
            engineSelect.appendChild(option);
        });
        engineGroup.appendChild(engineSelect);
        settingsForm.appendChild(engineGroup);

        // Show background setting
        const backgroundGroup = document.createElement('div');
        backgroundGroup.className = 'setting-group';

        const backgroundLabel = document.createElement('label');
        backgroundLabel.textContent = 'Show Background:';
        backgroundGroup.appendChild(backgroundLabel);

        const checkboxWrapper = document.createElement('div');
        checkboxWrapper.className = 'checkbox-wrapper';

        const backgroundCheckbox = document.createElement('input');
        backgroundCheckbox.type = 'checkbox';
        backgroundCheckbox.id = 'widget-background';
        backgroundCheckbox.checked = true;
        checkboxWrapper.appendChild(backgroundCheckbox);

        const checkboxLabel = document.createElement('label');
        checkboxLabel.htmlFor = 'widget-background';
        checkboxLabel.textContent = 'Display widget background';
        checkboxWrapper.appendChild(checkboxLabel);

        backgroundGroup.appendChild(checkboxWrapper);
        settingsForm.appendChild(backgroundGroup);

    } else {
        // Default settings for other widgets
        const infoText = document.createElement('p');
        infoText.textContent = 'This widget has no additional settings.';
        infoText.style.color = 'var(--t-col)';
        settingsForm.appendChild(infoText);
    }

    // Show the settings dialog
    settingsDialog.style.display = 'block';

    // Setup confirm button
    document.getElementById('add-widget-confirm').onclick = () => {
        const settings = collectWidgetSettings(typeName);
        addWidget(typeIndex, variantIndex, typeName, variantName, settings);
        settingsDialog.style.display = 'none';
    };

    // Setup cancel button
    document.getElementById('cancel-widget-settings').onclick = () => {
        settingsDialog.style.display = 'none';
        // Show widget selector again
        showWidgetSelector();
    };
}

function collectWidgetSettings(typeName) {
    const params = new URLSearchParams();

    if (typeName === 'Clock') {
        const timezone = document.getElementById('widget-timezone')?.value;
        const showBackground = document.getElementById('widget-background')?.checked;

        if (timezone && timezone !== 'Local') {
            params.append('timezone', timezone);
        }
        if (showBackground !== undefined) {
            params.append('background', showBackground ? '1' : '0');
        }

    } else if (typeName === 'Search') {
        const searchEngine = document.getElementById('widget-search-engine')?.value;
        const showBackground = document.getElementById('widget-background')?.checked;

        if (searchEngine) {
            params.append('engine', encodeURIComponent(searchEngine));
        }
        if (showBackground !== undefined) {
            params.append('background', showBackground ? '1' : '0');
        }
    }

    return params.toString();
}

function addWidget(typeIndex, variantIndex, typeName, variantName, settings = '') {
    debug.log('Adding widget:', typeName, '-', variantName, 'with settings:', settings);

    const newGroup = document.createElement('div');
    newGroup.className = 'group';
    newGroup.dataset.index = SETTINGS.linkGroups.length;

    // Add hover popup for editing/removing
    const groupHoverPopup = document.createElement('div');
    groupHoverPopup.className = 'group-hover-popup';

    const removeButton = document.createElement('button');
    removeButton.textContent = 'X';
    removeButton.ariaLabel = 'Remove Widget';
    removeButton.addEventListener('click', () => {
        const indexToRemove = parseInt(newGroup.dataset.index);
        newGroup.remove();
        SETTINGS.linkGroups.splice(indexToRemove, 1);
        reindexGroups();
        saveSettings();
    });
    groupHoverPopup.appendChild(removeButton);

    newGroup.appendChild(groupHoverPopup);

    makeDraggable(newGroup);

    // Create the widget group data
    const widgetGroup = {
        name: `${typeName} - ${variantName}`,
        x: 40,
        y: 40,
        type: 2, // Widget type
        id: {
            type: typeIndex,
            var: variantIndex
        },
        settings: settings
    };

    SETTINGS.linkGroups.push(widgetGroup);

    // Set position
    const canvasRect = groupContainer.getBoundingClientRect();
    const xPx = (parseFloat(widgetGroup.x) / 100) * canvasRect.width;
    const yPx = (parseFloat(widgetGroup.y) / 100) * canvasRect.height;
    newGroup.style.left = `${xPx}px`;
    newGroup.style.top = `${yPx}px`;

    // Add the widget script
    const script = document.createElement('script');
    script.defer = true;
    script.src = WIDGET_TYPES[typeIndex].variants[variantIndex].path + (settings ? '?' + settings : '');
    newGroup.appendChild(script);

    groupContainer.appendChild(newGroup);

    saveSettings();
}