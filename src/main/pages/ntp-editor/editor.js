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

    const draggableLabel = document.createElement('span');
    draggableLabel.textContent = 'Drag Here';
    draggableLabel.className = 'draggable-label';
    groupHoverPopup.appendChild(draggableLabel);

    
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

    // Add resize handle
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'group-resize-handle';
    newGroup.appendChild(resizeHandle);

    makeDraggable(groupHoverPopup);
    makeResizable(newGroup);

    // Set position for all group types - convert percentage to px for consistency with drag system
    const canvasRect = groupContainer.getBoundingClientRect();
    const xPx = (parseFloat(group.x) / 100) * canvasRect.width;
    const yPx = (parseFloat(group.y) / 100) * canvasRect.height;
    newGroup.style.left = `${xPx}px`;
    newGroup.style.top = `${yPx}px`;

    // Apply scale if it exists
    const scale = group.scale || 1;
    newGroup.style.transform = `scale(${scale})`;
    newGroup.style.transformOrigin = 'top left';
    newGroup.dataset.scale = scale;

    if(group.type == 0) {
        // Handle grid type groups
        if(group.name === null || group.name === undefined || group.name.trim() === "") {
        } else {
            const h2 = document.createElement('h2');
            h2.textContent = group.name;
            h2.className = 'group-header';
            newGroup.appendChild(h2);
        }

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
        if(group.name === null || group.name === undefined || group.name.trim() === "") {
        } else {
            const h2 = document.createElement('h2');
            h2.textContent = group.name;
            h2.className = 'group-header';
            newGroup.appendChild(h2);
        }

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
        newGroup.classList.add('widget-group');

        // Add edit button for widgets in hover popup (before the script)
        const widgetEditButton = document.createElement('button');
        widgetEditButton.textContent = 'Edit';
        widgetEditButton.ariaLabel = 'Edit Widget';
        widgetEditButton.addEventListener('click', () => {
            editWidget(newGroup.dataset.index);
        });
        // Insert edit button before the remove button in hover popup
        groupHoverPopup.insertBefore(widgetEditButton, groupHoverPopup.firstChild);

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

    // Apply UI style
    document.documentElement.setAttribute('data-ui-style', SETTINGS.uiStyle || 'default');
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
    element.parentElement.style.position = 'absolute';
    element.style.cursor = 'move';
    element.parentElement.dataset.draggable = 'true'; // Mark as draggable
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

// Resize functionality
let resizedElement = null;
let initialScale = 1;
let initialDistance = 0;
let resizeStartX = 0;
let resizeStartY = 0;

function makeResizable(element) {
  const resizeHandle = element.querySelector('.group-resize-handle');
  if (!resizeHandle) return;

  resizeHandle.addEventListener('mousedown', startResize);
}

function startResize(e) {
  // Find the resizable element
  resizedElement = e.target.closest('.group');
  if (!resizedElement) return;

  // Get initial scale
  initialScale = parseFloat(resizedElement.dataset.scale) || 1;

  // Store initial mouse position
  resizeStartX = e.clientX;
  resizeStartY = e.clientY;

  // Calculate initial distance from top-left corner
  const rect = resizedElement.getBoundingClientRect();
  initialDistance = Math.sqrt(Math.pow(rect.width, 2) + Math.pow(rect.height, 2));

  document.addEventListener('mousemove', resize);
  document.addEventListener('mouseup', stopResize);

  e.preventDefault();
  e.stopPropagation(); // Prevent drag from starting
}

function resize(e) {
  if (!resizedElement) return;

  // Calculate distance moved
  const deltaX = e.clientX - resizeStartX;
  const deltaY = e.clientY - resizeStartY;
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

  // Calculate new scale (positive if dragging away from origin, negative if toward)
  const direction = (deltaX + deltaY) > 0 ? 1 : -1;
  const scaleChange = (distance / 200) * direction; // Adjust sensitivity here
  let newScale = Math.max(0.3, Math.min(3, initialScale + scaleChange)); // Clamp between 0.3 and 3

  // Round to 2 decimal places
  newScale = Math.round(newScale * 100) / 100;

  // Apply scale
  resizedElement.style.transform = `scale(${newScale})`;
  resizedElement.dataset.scale = newScale;
}

function stopResize(e) {
  if (!resizedElement) return;

  try {
    const elementIndex = parseInt(resizedElement.dataset.index);
    const scale = parseFloat(resizedElement.dataset.scale) || 1;

    // Update settings with new scale
    if (SETTINGS.linkGroups[elementIndex]) {
      SETTINGS.linkGroups[elementIndex].scale = scale;
    }

    saveSettings();
  } catch (error) {
    debug.error('Error in stopResize:', error);
  } finally {
    // Always clean up
    resizedElement = null;
    document.removeEventListener('mousemove', resize);
    document.removeEventListener('mouseup', stopResize);
  }
}

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

    // Add resize handle
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'group-resize-handle';
    newGroup.appendChild(resizeHandle);

    makeDraggable(newGroup);
    makeResizable(newGroup);

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
    
    if(group.name === null || group.name === undefined || group.name.trim() === "") {
    } else {
        const h2 = document.createElement('h2');
        h2.textContent = group.name;
        h2.className = 'group-header';
        newGroup.appendChild(h2);
    }
    
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

function parseWidgetSettings(settingsString) {
    const params = new URLSearchParams(settingsString);
    const settings = {};
    for (const [key, value] of params) {
        settings[key] = value;
    }
    return settings;
}

function showWidgetSettings(typeIndex, variantIndex, typeName, variantName, existingSettings = null, editIndex = null) {
    const settingsDialog = document.getElementById('widget-settings-dialog');
    const settingsForm = document.getElementById('widget-settings-form');
    const settingsTitle = document.getElementById('widget-settings-title');
    const confirmButton = document.getElementById('add-widget-confirm');

    // Clear existing settings
    settingsForm.innerHTML = '';

    // Parse existing settings if in edit mode
    const settings = existingSettings ? parseWidgetSettings(existingSettings) : {};

    // Set dialog title and button text based on mode
    if (editIndex !== null) {
        settingsTitle.textContent = `Edit ${typeName} - ${variantName}`;
        confirmButton.textContent = 'Save Changes';
    } else {
        settingsTitle.textContent = `Configure ${typeName} - ${variantName}`;
        confirmButton.textContent = 'Add Widget';
    }

    // Generate settings based on widget type
    if (typeName === 'Clock') {
        // Timezone setting
        addSelectSetting(settingsForm, 'Timezone', 'widget-timezone',
            ['local', 'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
             'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Asia/Shanghai', 'Australia/Sydney'],
            settings.timezone || 'local');

        if (variantName === 'Digital') {
            // 24-hour format
            addCheckboxSetting(settingsForm, 'Use 24-hour format', 'widget-format24',
                settings.format24Hour !== 'false');

            // Show seconds
            addCheckboxSetting(settingsForm, 'Show seconds', 'widget-showSeconds',
                settings.showSeconds !== 'false');

            // Font size
            addNumberSetting(settingsForm, 'Font Size (px)', 'widget-fontSize',
                settings.fontSize || '48', 20, 100);
        }

    } else if (typeName === 'Search') {
        // Search engine setting
        const engines = [
            { name: 'Google', value: 'google' },
            { name: 'Bing', value: 'bing' },
            { name: 'DuckDuckGo', value: 'duckduckgo' },
            { name: 'Yahoo', value: 'yahoo' },
            { name: 'Brave', value: 'brave' }
        ];
        addSelectSetting(settingsForm, 'Search Engine', 'widget-search-engine',
            engines.map(e => ({ value: e.value, label: e.name })),
            settings.engine || 'google');

        // Placeholder text
        addTextSetting(settingsForm, 'Placeholder Text', 'widget-placeholder',
            settings.placeholder || 'Search the web...');

        // Show icon
        addCheckboxSetting(settingsForm, 'Show search icon', 'widget-showIcon',
            settings.showIcon !== 'false');

        // Max width
        addNumberSetting(settingsForm, 'Max Width (px)', 'widget-maxWidth',
            settings.maxWidth || '700', 300, 1200);

    } else if (typeName === 'Weather') {
        // Location
        addTextSetting(settingsForm, 'Location', 'widget-location',
            settings.location || 'London');

        // API Key
        addTextSetting(settingsForm, 'API Key (OpenWeatherMap)', 'widget-apiKey',
            settings.apiKey || '', 'Get a free key from openweathermap.org');

        // Units
        addSelectSetting(settingsForm, 'Units', 'widget-units',
            [{ value: 'metric', label: 'Metric (°C)' },
             { value: 'imperial', label: 'Imperial (°F)' },
             { value: 'standard', label: 'Standard (K)' }],
            settings.units || 'metric');

        if (variantName === 'Temperature') {
            // Show feels like
            addCheckboxSetting(settingsForm, 'Show "Feels Like" temperature', 'widget-showFeelsLike',
                settings.showFeelsLike !== 'false');

            // Temperature font size
            addNumberSetting(settingsForm, 'Temperature Font Size (px)', 'widget-tempFontSize',
                settings.tempFontSize || '64', 24, 120);
        }

        // Title
        addTextSetting(settingsForm, 'Widget Title', 'widget-title',
            settings.title || 'Weather');

    } else if (typeName === 'Note') {
        // Title
        addTextSetting(settingsForm, 'Note Title', 'widget-title',
            settings.title || 'Note');

        // Placeholder
        addTextSetting(settingsForm, 'Placeholder Text', 'widget-placeholder',
            settings.placeholder || 'Write your note here...');

        // Min height
        addNumberSetting(settingsForm, 'Minimum Height (px)', 'widget-minHeight',
            settings.minHeight || '150', 100, 500);

        // Max width
        addNumberSetting(settingsForm, 'Max Width (px)', 'widget-maxWidth',
            settings.maxWidth || '400', 200, 800);

    } else if (typeName === 'Todo') {
        // Title
        addTextSetting(settingsForm, 'Todo List Title', 'widget-title',
            settings.title || 'Todo List');

        // Max width
        addNumberSetting(settingsForm, 'Max Width (px)', 'widget-maxWidth',
            settings.maxWidth || '450', 300, 800);

        // Max height
        addNumberSetting(settingsForm, 'Max Height (px)', 'widget-maxHeight',
            settings.maxHeight || '400', 200, 800);

    } else if (typeName === 'Timers') {
        // Widget ID for storage
        addTextSetting(settingsForm, 'Widget ID (for storage)', 'widget-id',
            settings.id || `timer-${Date.now()}`);
    } else {
        // Default settings for other widgets
        const infoText = document.createElement('p');
        infoText.textContent = 'This widget has minimal configuration options.';
        infoText.style.color = 'var(--t-col)';
        settingsForm.appendChild(infoText);
    }

    // Show the settings dialog
    settingsDialog.style.display = 'block';

    // Setup confirm button
    confirmButton.onclick = () => {
        const collectedSettings = collectWidgetSettings(typeName, variantName);
        if (editIndex !== null) {
            // Edit mode - update existing widget
            updateWidget(editIndex, typeIndex, variantIndex, typeName, variantName, collectedSettings);
        } else {
            // Add mode - create new widget
            addWidget(typeIndex, variantIndex, typeName, variantName, collectedSettings);
        }
        settingsDialog.style.display = 'none';
    };

    // Setup cancel button
    document.getElementById('cancel-widget-settings').onclick = () => {
        settingsDialog.style.display = 'none';
        if (editIndex === null) {
            // Only show widget selector if we're not in edit mode
            showWidgetSelector();
        }
    };
}

// Helper functions to create form elements
function addTextSetting(form, label, id, defaultValue = '', placeholder = '') {
    const group = document.createElement('div');
    group.className = 'setting-group';

    const labelElem = document.createElement('label');
    labelElem.textContent = label + ':';
    labelElem.htmlFor = id;
    group.appendChild(labelElem);

    const input = document.createElement('input');
    input.type = 'text';
    input.id = id;
    input.value = defaultValue;
    if (placeholder) input.placeholder = placeholder;
    group.appendChild(input);

    form.appendChild(group);
}

function addNumberSetting(form, label, id, defaultValue = '0', min = 0, max = 1000) {
    const group = document.createElement('div');
    group.className = 'setting-group';

    const labelElem = document.createElement('label');
    labelElem.textContent = label + ':';
    labelElem.htmlFor = id;
    group.appendChild(labelElem);

    const input = document.createElement('input');
    input.type = 'number';
    input.id = id;
    input.value = defaultValue;
    input.min = min;
    input.max = max;
    group.appendChild(input);

    form.appendChild(group);
}

function addCheckboxSetting(form, label, id, defaultChecked = true) {
    const group = document.createElement('div');
    group.className = 'setting-group';

    const checkboxWrapper = document.createElement('div');
    checkboxWrapper.className = 'checkbox-wrapper';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = id;
    checkbox.checked = defaultChecked;
    checkboxWrapper.appendChild(checkbox);

    const labelElem = document.createElement('label');
    labelElem.htmlFor = id;
    labelElem.textContent = label;
    checkboxWrapper.appendChild(labelElem);

    group.appendChild(checkboxWrapper);
    form.appendChild(group);
}

function addSelectSetting(form, label, id, options, defaultValue = '') {
    const group = document.createElement('div');
    group.className = 'setting-group';

    const labelElem = document.createElement('label');
    labelElem.textContent = label + ':';
    labelElem.htmlFor = id;
    group.appendChild(labelElem);

    const select = document.createElement('select');
    select.id = id;

    // Handle both simple arrays and arrays of objects
    options.forEach(opt => {
        const option = document.createElement('option');
        if (typeof opt === 'object') {
            option.value = opt.value;
            option.textContent = opt.label;
        } else {
            option.value = opt;
            option.textContent = opt;
        }
        if (option.value === defaultValue) {
            option.selected = true;
        }
        select.appendChild(option);
    });

    group.appendChild(select);
    form.appendChild(group);
}

function collectWidgetSettings(typeName, variantName) {
    const params = new URLSearchParams();

    if (typeName === 'Clock') {
        const timezone = document.getElementById('widget-timezone')?.value;
        if (timezone && timezone !== 'local') {
            params.append('timezone', timezone);
        }

        if (variantName === 'Digital') {
            const format24 = document.getElementById('widget-format24')?.checked;
            const showSeconds = document.getElementById('widget-showSeconds')?.checked;
            const fontSize = document.getElementById('widget-fontSize')?.value;

            if (format24 !== undefined) {
                params.append('format24Hour', format24 ? 'true' : 'false');
            }
            if (showSeconds !== undefined) {
                params.append('showSeconds', showSeconds ? 'true' : 'false');
            }
            if (fontSize) {
                params.append('fontSize', fontSize);
            }
        }

    } else if (typeName === 'Search') {
        const searchEngine = document.getElementById('widget-search-engine')?.value;
        const placeholder = document.getElementById('widget-placeholder')?.value;
        const showIcon = document.getElementById('widget-showIcon')?.checked;
        const maxWidth = document.getElementById('widget-maxWidth')?.value;

        if (searchEngine) {
            params.append('engine', searchEngine);
        }
        if (placeholder) {
            params.append('placeholder', placeholder);
        }
        if (showIcon !== undefined) {
            params.append('showIcon', showIcon ? 'true' : 'false');
        }
        if (maxWidth) {
            params.append('maxWidth', maxWidth);
        }

    } else if (typeName === 'Weather') {
        const location = document.getElementById('widget-location')?.value;
        const apiKey = document.getElementById('widget-apiKey')?.value;
        const units = document.getElementById('widget-units')?.value;
        const title = document.getElementById('widget-title')?.value;

        if (location) {
            params.append('location', location);
        }
        if (apiKey) {
            params.append('apiKey', apiKey);
        }
        if (units) {
            params.append('units', units);
        }
        if (title) {
            params.append('title', title);
        }

        if (variantName === 'Temperature') {
            const showFeelsLike = document.getElementById('widget-showFeelsLike')?.checked;
            const tempFontSize = document.getElementById('widget-tempFontSize')?.value;

            if (showFeelsLike !== undefined) {
                params.append('showFeelsLike', showFeelsLike ? 'true' : 'false');
            }
            if (tempFontSize) {
                params.append('tempFontSize', tempFontSize);
            }
        }

    } else if (typeName === 'Note') {
        const title = document.getElementById('widget-title')?.value;
        const placeholder = document.getElementById('widget-placeholder')?.value;
        const minHeight = document.getElementById('widget-minHeight')?.value;
        const maxWidth = document.getElementById('widget-maxWidth')?.value;

        if (title) {
            params.append('title', title);
        }
        if (placeholder) {
            params.append('placeholder', placeholder);
        }
        if (minHeight) {
            params.append('minHeight', minHeight);
        }
        if (maxWidth) {
            params.append('maxWidth', maxWidth);
        }

    } else if (typeName === 'Todo') {
        const title = document.getElementById('widget-title')?.value;
        const maxWidth = document.getElementById('widget-maxWidth')?.value;
        const maxHeight = document.getElementById('widget-maxHeight')?.value;

        if (title) {
            params.append('title', title);
        }
        if (maxWidth) {
            params.append('maxWidth', maxWidth);
        }
        if (maxHeight) {
            params.append('maxHeight', maxHeight);
        }

    } else if (typeName === 'Timers') {
        const id = document.getElementById('widget-id')?.value;
        if (id) {
            params.append('id', id);
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

    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.ariaLabel = 'Edit Widget';
    editButton.addEventListener('click', () => {
        editWidget(newGroup.dataset.index);
    });
    groupHoverPopup.appendChild(editButton);

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

    // Add resize handle
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'group-resize-handle';
    newGroup.appendChild(resizeHandle);

    makeDraggable(newGroup);
    makeResizable(newGroup);

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

function editWidget(index) {
    debug.log('Edit Widget button clicked for index:', index);

    const group = SETTINGS.linkGroups[index];
    if (!group || group.type !== 2) {
        debug.error('Widget group not found or not a widget type for index:', index);
        return;
    }

    const typeIndex = group.id.type;
    const variantIndex = group.id.var;
    const widgetType = WIDGET_TYPES[typeIndex];
    const variant = widgetType.variants[variantIndex];

    debug.log('Editing widget:', widgetType.name, '-', variant.name);

    // Show widget settings dialog in edit mode
    showWidgetSettings(typeIndex, variantIndex, widgetType.name, variant.name, group.settings, index);
}

function updateWidget(index, typeIndex, variantIndex, typeName, variantName, settings) {
    debug.log('Updating widget at index:', index, 'with settings:', settings);

    const group = SETTINGS.linkGroups[index];
    if (!group || group.type !== 2) {
        debug.error('Widget group not found or not a widget type for index:', index);
        return;
    }

    // Update the widget settings in SETTINGS
    group.settings = settings;
    group.name = `${typeName} - ${variantName}`;
    group.id.type = typeIndex;
    group.id.var = variantIndex;

    // Find the widget element in the DOM
    const widgetElement = document.querySelector(`.group[data-index='${index}']`);
    if (!widgetElement) {
        debug.error('Widget element not found for index:', index);
        return;
    }

    // Remove the old script element
    const oldScript = widgetElement.querySelector('script');
    if (oldScript) {
        oldScript.remove();
    }

    // Add the new widget script with updated settings
    const script = document.createElement('script');
    script.defer = true;
    script.src = WIDGET_TYPES[typeIndex].variants[variantIndex].path + (settings ? '?' + settings : '');
    widgetElement.appendChild(script);

    saveSettings();

    // Reload the page to properly reinitialize the widget
    debug.log('Reloading page to apply widget changes...');
    location.reload();
}