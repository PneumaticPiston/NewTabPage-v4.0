// Get the container where groups will be added
const groupContainer = document.getElementById('groups-container');
const editorElement = document.getElementById('group-editor');

// Configuration
const CONFIG = {
    gridSize: 20,
    defaultGroupPosition: { x: 40, y: 40 },
    defaultScale: 1,
    scaleRange: { min: 0.3, max: 3 }
};

// State management
const state = {
    draggedElement: null,
    resizedElement: null,
    offsetX: 0,
    offsetY: 0,
    initialScale: 1,
    resizeStartX: 0,
    resizeStartY: 0
};

/**
 * Initialize the editor once settings are loaded
 */
async function initializeEditor() {
    await settingsInitialized;
    
    SETTINGS.linkGroups.forEach((group, index) => {
        createGroupElement(group, index);
    });
    
    applyBackgroundSettings();
    applyThemeSettings();
    
    document.documentElement.setAttribute('data-ui-style', SETTINGS.uiStyle || 'default');
}

/**
 * Create a group element and append to container
 */
function createGroupElement(group, index) {
    const newGroup = document.createElement('div');
    newGroup.className = 'group';
    newGroup.dataset.index = index;
    
    appendGroupControls(newGroup);
    appendResizeHandle(newGroup);
    setGroupPosition(newGroup, group);
    setGroupScale(newGroup, group.scale);
    
    if (group.type === 0) {
        createGridGroup(newGroup, group);
    } else if (group.type === 1) {
        createListGroup(newGroup, group);
    } else if (group.type === 2) {
        createWidgetGroup(newGroup, group);
    }
    
    groupContainer.appendChild(newGroup);
}

/**
 * Append control buttons (edit, remove) to group
 */
function appendGroupControls(groupElement) {
    const groupHoverPopup = document.createElement('div');
    groupHoverPopup.className = 'group-hover-popup';
    
    const draggableLabel = createDraggableLabel();
    const editButton = createEditButton(groupElement);
    const removeButton = createRemoveButton(groupElement);
    
    groupHoverPopup.append(draggableLabel, editButton, removeButton);
    groupElement.appendChild(groupHoverPopup);
    
    makeDraggable(groupHoverPopup);
}

/**
 * Create draggable label
 */
function createDraggableLabel() {
    const label = document.createElement('span');
    label.textContent = 'Drag Here';
    label.className = 'draggable-label';
    return label;
}

/**
 * Create edit button for group
 */
function createEditButton(groupElement) {
    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.ariaLabel = 'Edit Group';
    editButton.addEventListener('click', () => {
        editGroup(groupElement.dataset.index);
    });
    return editButton;
}

/**
 * Create remove button for group
 */
function createRemoveButton(groupElement) {
    const removeButton = document.createElement('button');
    removeButton.textContent = 'X';
    removeButton.ariaLabel = 'Remove Group';
    removeButton.addEventListener('click', () => {
        removeGroup(groupElement);
    });
    return removeButton;
}

/**
 * Remove a group element and update settings
 */
function removeGroup(groupElement) {
    const indexToRemove = parseInt(groupElement.dataset.index);
    groupElement.remove();
    SETTINGS.linkGroups.splice(indexToRemove, 1);
    reindexGroups();
    saveSettings();
}

/**
 * Append resize handle to group
 */
function appendResizeHandle(groupElement) {
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'group-resize-handle';
    groupElement.appendChild(resizeHandle);
    makeResizable(groupElement);
}

/**
 * Set group position in pixels
 */
function setGroupPosition(groupElement, group) {
    const canvasRect = groupContainer.getBoundingClientRect();
    const xPx = (parseFloat(group.x) / 100) * canvasRect.width;
    const yPx = (parseFloat(group.y) / 100) * canvasRect.height;
    groupElement.style.left = `${xPx}px`;
    groupElement.style.top = `${yPx}px`;
}

/**
 * Set group scale transformation
 */
function setGroupScale(groupElement, scale = CONFIG.defaultScale) {
    groupElement.style.transform = `scale(${scale})`;
    groupElement.style.transformOrigin = 'top left';
    groupElement.dataset.scale = scale;
}

/**
 * Create grid type group
 */
function createGridGroup(groupElement, group) {
    appendGroupHeader(groupElement, group.name);
    
    const linksContainer = document.createElement('div');
    linksContainer.className = 'grid';
    linksContainer.style.gridTemplateRows = `repeat(${group.grid.r}, 1fr)`;
    linksContainer.style.gridTemplateColumns = `repeat(${group.grid.c}, 1fr)`;
    
    group.links.forEach(link => {
        linksContainer.appendChild(createGridLink(link));
    });
    
    groupElement.appendChild(linksContainer);
}

/**
 * Create list type group
 */
function createListGroup(groupElement, group) {
    appendGroupHeader(groupElement, group.name);
    
    const ul = document.createElement('ul');
    ul.className = 'list';
    
    group.links.forEach(link => {
        ul.appendChild(createListItem(link));
    });
    
    groupElement.appendChild(ul);
}

/**
 * Create widget type group
 */
function createWidgetGroup(groupElement, group) {
    groupElement.classList.add('widget-group');
    
    // Replace edit button with widget-specific edit
    const hoverPopup = groupElement.querySelector('.group-hover-popup');
    const originalEditBtn = hoverPopup.querySelector('button[aria-label="Edit Group"]');
    if (originalEditBtn) {
        originalEditBtn.remove();
    }
    
    const widgetEditButton = createWidgetEditButton(groupElement);
    hoverPopup.insertBefore(widgetEditButton, hoverPopup.firstChild);
    
    const script = document.createElement('script');
    script.defer = true;
    script.src = `${WIDGET_TYPES[group.id.type].variants[group.id.var].path}?${group.settings}`;
    groupElement.appendChild(script);
}

/**
 * Create widget edit button
 */
function createWidgetEditButton(groupElement) {
    const button = document.createElement('button');
    button.textContent = 'Edit';
    button.ariaLabel = 'Edit Widget';
    button.addEventListener('click', () => {
        editWidget(groupElement.dataset.index);
    });
    return button;
}

/**
 * Append group header if name exists
 */
function appendGroupHeader(groupElement, name) {
    if (name && name.trim() !== '') {
        const h2 = document.createElement('h2');
        h2.textContent = name;
        h2.className = 'group-header';
        groupElement.appendChild(h2);
    }
}

/**
 * Create a grid link element
 */
function createGridLink(link) {
    const a = document.createElement('a');
    a.className = 'link';
    a.title = link.name;
    
    const img = createFaviconImage(link);
    const span = document.createElement('span');
    span.textContent = link.name;
    
    a.append(img, span);
    return a;
}

/**
 * Create a list item element
 */
function createListItem(link) {
    const li = document.createElement('li');
    const img = createFaviconImage(link);
    const a = document.createElement('a');
    a.textContent = link.name;
    
    li.append(img, a);
    return li;
}

/**
 * Create favicon image element
 */
function createFaviconImage(link) {
    const img = document.createElement('img');
    img.src = getFavicon(link.url);
    img.alt = `${link.name} Favicon`;
    return img;
}

/**
 * Apply background settings
 */
function applyBackgroundSettings() {
    const background = document.querySelector('.background-image');
    const bgID = parseInt(SETTINGS.background.bgID) || 0;
    
    switch (bgID) {
        case 1:
            if (SETTINGS.background.imageHash) {
                background.style.backgroundImage = `url('${SETTINGS.background.imageHash}')`;
                background.style.backgroundSize = 'cover';
                background.style.backgroundPosition = 'center';
            } else {
                background.style.background = '';
            }
            break;
        case 2:
            background.style.background = 'linear-gradient(var(--grad-angle), var(--p-col) 0%, var(--s-col) 100%)';
            break;
        default:
            background.style.background = '';
    }
    
    background.classList.add('loaded');
}

/**
 * Apply theme settings
 */
function applyThemeSettings() {
    document.documentElement.setAttribute('data-theme', SETTINGS.themeID);
    const themeElement = document.getElementById('theme');
    themeElement.textContent = SETTINGS.themeData;
}

// Initialize the editor when the page loads
initializeEditor();

/**
 * Get favicon URL for a given link
 */
function getFavicon(url) {
    const DEFAULT_ICON = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJmZWF0aGVyIGZlYXRoZXItbGluayI+PHBhdGggZD0iTTEwIDEzYTUgNSAwIDAgMCA3LjU0LjU0bDMtM2E1IDUgMCAwIDAtNy4wNy03LjA3bC0xLjcyIDEuNzEiPjwvcGF0aD48cGF0aCBkPSJNMTQgMTFhNSA1IDAgMCAwLTcuNTQtLjU0bC0zIDNhNSA1IDAgMCAwIDcuMDcgNy4wN2wxLjcxLTEuNzEiPjwvcGF0aD48L3N2Zz4=';
    
    try {
        if (!url || url.trim() === '') return DEFAULT_ICON;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }
        
        const parsedUrl = new URL(url);
        const domain = parsedUrl.hostname;
        
        if (!window.faviconCache) {
            window.faviconCache = new Map();
        }
        
        // Handle Google Calendar's dynamic favicon
        if (domain === 'calendar.google.com') {
            const today = new Date();
            const dateString = today.getDate().toString();
            const calendarIcon = `https://ssl.gstatic.com/calendar/images/dynamiclogo_2020q4/calendar_${dateString}_2x.png`;
            const cacheKey = `${domain}_${today.toDateString()}`;
            window.faviconCache.set(cacheKey, calendarIcon);
            return calendarIcon;
        }
        
        if (window.faviconCache.has(domain)) {
            return window.faviconCache.get(domain);
        }
        
        if (!navigator.onLine) return DEFAULT_ICON;
        
        // Google service icons mapping
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
        };
        
        if (googleServiceIcons[domain]) {
            const iconUrl = googleServiceIcons[domain];
            window.faviconCache.set(domain, iconUrl);
            return iconUrl;
        }
        
        const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
        window.faviconCache.set(domain, faviconUrl);
        return faviconUrl;
        
    } catch (e) {
        Debugger.warn('Error getting favicon for URL:', url, e);
        return DEFAULT_ICON;
    }
}

// ============================================================================
// DRAG AND DROP FUNCTIONALITY
// ============================================================================

function makeDraggable(element) {
    element.parentElement.style.position = 'absolute';
    element.style.cursor = 'move';
    element.parentElement.dataset.draggable = 'true';
    element.addEventListener('mousedown', startDrag);
}

function startDrag(e) {
    state.draggedElement = e.target.closest('[data-draggable]');
    if (!state.draggedElement) return;
    
    const rect = state.draggedElement.getBoundingClientRect();
    state.offsetX = e.clientX - rect.left;
    state.offsetY = e.clientY - rect.top;
    
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDrag);
    e.preventDefault();
}

function drag(e) {
    if (!state.draggedElement) return;
    
    const canvas = state.draggedElement.parentElement;
    const canvasRect = canvas.getBoundingClientRect();
    
    let x = Math.max(0, e.clientX - canvasRect.left - state.offsetX);
    let y = Math.max(0, e.clientY - canvasRect.top - state.offsetY);
    
    // Snap to grid
    x = Math.round(x / CONFIG.gridSize) * CONFIG.gridSize;
    y = Math.round(y / CONFIG.gridSize) * CONFIG.gridSize;
    
    state.draggedElement.style.left = `${x}px`;
    state.draggedElement.style.top = `${y}px`;
}

function stopDrag(e) {
    if (!state.draggedElement) return;
    
    try {
        const canvas = state.draggedElement.parentElement;
        const canvasRect = canvas.getBoundingClientRect();
        const elementIndex = parseInt(state.draggedElement.dataset.index);
        
        const x = parseInt(state.draggedElement.style.left) || 0;
        const y = parseInt(state.draggedElement.style.top) || 0;
        
        state.draggedElement.dataset.percentX = (x / canvasRect.width * 100).toFixed(2);
        state.draggedElement.dataset.percentY = (y / canvasRect.height * 100).toFixed(2);
        
        if (SETTINGS.linkGroups[elementIndex]) {
            SETTINGS.linkGroups[elementIndex].x = parseFloat((x / canvasRect.width * 100).toFixed(2));
            SETTINGS.linkGroups[elementIndex].y = parseFloat((y / canvasRect.height * 100).toFixed(2));
        }
        
        saveSettings();
    } catch (error) {
        debug.error('Error in stopDrag:', error);
    } finally {
        state.draggedElement = null;
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('mouseup', stopDrag);
    }
}

// ============================================================================
// RESIZE FUNCTIONALITY
// ============================================================================

function makeResizable(element) {
    const resizeHandle = element.querySelector('.group-resize-handle');
    if (!resizeHandle) return;
    resizeHandle.addEventListener('mousedown', startResize);
}

function startResize(e) {
    state.resizedElement = e.target.closest('.group');
    if (!state.resizedElement) return;
    
    state.initialScale = parseFloat(state.resizedElement.dataset.scale) || CONFIG.defaultScale;
    state.resizeStartX = e.clientX;
    state.resizeStartY = e.clientY;
    
    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResize);
    e.preventDefault();
    e.stopPropagation();
}

function resize(e) {
    if (!state.resizedElement) return;
    
    const deltaX = e.clientX - state.resizeStartX;
    const deltaY = e.clientY - state.resizeStartY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    const direction = (deltaX + deltaY) > 0 ? 1 : -1;
    const scaleChange = (distance / 200) * direction;
    let newScale = Math.max(
        CONFIG.scaleRange.min,
        Math.min(CONFIG.scaleRange.max, state.initialScale + scaleChange)
    );
    
    newScale = Math.round(newScale * 100) / 100;
    state.resizedElement.style.transform = `scale(${newScale})`;
    state.resizedElement.dataset.scale = newScale;
}

function stopResize(e) {
    if (!state.resizedElement) return;
    
    try {
        const elementIndex = parseInt(state.resizedElement.dataset.index);
        const scale = parseFloat(state.resizedElement.dataset.scale) || CONFIG.defaultScale;
        
        if (SETTINGS.linkGroups[elementIndex]) {
            SETTINGS.linkGroups[elementIndex].scale = scale;
        }
        
        saveSettings();
    } catch (error) {
        debug.error('Error in stopResize:', error);
    } finally {
        state.resizedElement = null;
        document.removeEventListener('mousemove', resize);
        document.removeEventListener('mouseup', stopResize);
    }
}

// ============================================================================
// WINDOW RESIZE HANDLER
// ============================================================================

function handleResize(canvas) {
    const elements = canvas.querySelectorAll('[data-percent-x]');
    const canvasRect = canvas.getBoundingClientRect();
    
    elements.forEach(el => {
        const percentX = parseFloat(el.dataset.percentX) || 0;
        const percentY = parseFloat(el.dataset.percentY) || 0;
        
        let x = (percentX / 100) * canvasRect.width;
        let y = (percentY / 100) * canvasRect.height;
        
        x = Math.round(x / CONFIG.gridSize) * CONFIG.gridSize;
        y = Math.round(y / CONFIG.gridSize) * CONFIG.gridSize;
        
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
    });
}

window.addEventListener('resize', () => handleResize(groupContainer));

// ============================================================================
// GROUP MANAGEMENT
// ============================================================================

function reindexGroups() {
    const groups = document.querySelectorAll('.group');
    groups.forEach((group, index) => {
        group.dataset.index = index;
    });
}

function saveSettings() {
    debug.log('Saving settings...');
    
    const groups = document.querySelectorAll('.group');
    groups.forEach((group, index) => {
        const canvasRect = groupContainer.getBoundingClientRect();
        const x = parseInt(group.style.left) || 0;
        const y = parseInt(group.style.top) || 0;
        
        if (SETTINGS.linkGroups[index]) {
            SETTINGS.linkGroups[index].x = parseFloat(((x / canvasRect.width) * 100).toFixed(2));
            SETTINGS.linkGroups[index].y = parseFloat(((y / canvasRect.height) * 100).toFixed(2));
        }
    });
    
    debug.log('Settings to save:', JSON.stringify(SETTINGS.linkGroups, null, 2));
    saveToSettings('linkGroups', SETTINGS.linkGroups);
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

document.getElementById('save-button').addEventListener('click', saveSettings);

document.getElementById('add-group-button').addEventListener('click', () => {
    debug.log('Add Group button clicked');
    
    const newGroup = {
        name: 'New Group',
        x: CONFIG.defaultGroupPosition.x,
        y: CONFIG.defaultGroupPosition.y,
        type: 0,
        grid: { r: 1, c: 1 },
        links: []
    };
    
    SETTINGS.linkGroups.push(newGroup);
    
    const groupElement = document.createElement('div');
    groupElement.className = 'group';
    groupElement.dataset.index = SETTINGS.linkGroups.length - 1;
    
    appendGroupControls(groupElement);
    appendResizeHandle(groupElement);
    setGroupPosition(groupElement, newGroup);
    createGridGroup(groupElement, newGroup);
    
    groupContainer.appendChild(groupElement);
    saveSettings();
    
    editGroup(SETTINGS.linkGroups.length - 1);
});

document.getElementById('add-widget-button').addEventListener('click', () => {
    debug.log('Add Widget button clicked');
    showWidgetSelector();
});

// ============================================================================
// GROUP EDITOR
// ============================================================================

function editGroup(index) {
    debug.log('Edit Group button clicked for index:', index);
    
    const element = document.querySelector(`.group[data-index='${index}']`);
    const group = SETTINGS.linkGroups[index];
    
    if (!element || !group) {
        debug.error('Group element or data not found for index:', index);
        return;
    }
    
    editorElement.style.display = 'block';
    
    populateGroupEditor(group);
    setupGroupEditorEvents(group, index, element);
}

function populateGroupEditor(group) {
    document.getElementById('group-name-input').value = group.name || '';
    document.getElementById('group-type-select').value = group.type || 0;
    
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
    
    const typeSelect = document.getElementById('group-type-select');
    typeSelect.onchange = () => {
        gridOptions.style.display = typeSelect.value === '0' ? 'block' : 'none';
    };
    
    const linksList = document.getElementById('group-editor-links');
    linksList.innerHTML = '';
    
    if (group.links && group.links.length > 0) {
        group.links.forEach(link => addLinkToEditor(linksList, link.name, link.url));
    }
    
    document.getElementById('add-link-btn').onclick = () => {
        addLinkToEditor(linksList, '', '');
    };
}

function setupGroupEditorEvents(group, index, element) {
    document.getElementById('save-group-button').onclick = () => {
        debug.log('Saving group changes for index:', index);
        
        group.name = document.getElementById('group-name-input').value;
        const newType = parseInt(document.getElementById('group-type-select').value);
        const typeChanged = group.type !== newType;
        group.type = newType;
        
        if (group.type === 0) {
            if (!group.grid) group.grid = { r: 1, c: 1 };
            group.grid.r = parseInt(document.getElementById('grid-rows').value) || 1;
            group.grid.c = parseInt(document.getElementById('grid-columns').value) || 1;
        }
        
        group.links = collectLinksFromEditor();
        SETTINGS.linkGroups[index] = group;
        
        if (typeChanged) {
            rebuildGroupElement(element, group, index);
        } else {
            updateGroupContent(element, group);
        }
        
        saveSettings();
        editorElement.style.display = 'none';
    };
    
    document.getElementById('cancel-group-button').onclick = () => {
        debug.log('Cancelling group edit for index:', index);
        editorElement.style.display = 'none';
    };
}

function collectLinksFromEditor() {
    const linksList = document.getElementById('group-editor-links');
    const linkItems = linksList.querySelectorAll('.editor-link-item');
    const links = [];
    
    linkItems.forEach(item => {
        const nameInput = item.querySelector('.link-name-input');
        const urlInput = item.querySelector('.link-url-input');
        
        if (nameInput && urlInput && nameInput.value.trim() && urlInput.value.trim()) {
            links.push({
                name: nameInput.value.trim(),
                url: urlInput.value.trim()
            });
        }
    });
    
    return links;
}

function updateGroupContent(element, group) {
    const header = element.querySelector('.group-header');
    if (header) {
        header.textContent = group.name;
    }
    
    const linksContainer = element.querySelector('.grid, .list');
    if (!linksContainer) return;
    
    linksContainer.innerHTML = '';
    
    if (group.type === 0) {
        linksContainer.className = 'grid';
        linksContainer.style.gridTemplateRows = `repeat(${group.grid.r}, 1fr)`;
        linksContainer.style.gridTemplateColumns = `repeat(${group.grid.c}, 1fr)`;
        group.links.forEach(link => linksContainer.appendChild(createGridLink(link)));
    } else if (group.type === 1) {
        linksContainer.className = 'list';
        group.links.forEach(link => linksContainer.appendChild(createListItem(link)));
    }
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
    removeBtn.onclick = () => li.remove();
    
    li.append(nameInput, urlInput, removeBtn);
    linksList.appendChild(li);
}

function rebuildGroupElement(element, group, index) {
    const hoverPopup = element.querySelector('.group-hover-popup');
    element.innerHTML = '';
    
    if (hoverPopup) element.appendChild(hoverPopup);
    
    appendGroupHeader(element, group.name);
    
    if (group.type === 0) {
        createGridGroup(element, group);
    } else if (group.type === 1) {
        createListGroup(element, group);
    }
}

// ============================================================================
// WIDGET MANAGEMENT
// ============================================================================

function createWidgetPreview(typeName, variantName) {
    const preview = document.createElement('div');
    preview.className = 'widget-preview';
    
    const previewConfigs = {
        'Clock': {
            'Digital': { className: 'widget-preview-digital', text: '12:34:56' },
            'Analog': { type: 'canvas' },
            'World': { className: 'widget-preview-digital', text: '🌍 12:34' }
        },
        'Search': {
            'Bar': { className: 'widget-preview-search-bar', text: '🔍 Search...' },
            'Box': { className: 'widget-preview-search-box', text: '🔍 Search' }
        },
        'Weather': {
            'Condition': { className: 'widget-preview-weather', text: '⛅ 72°F' },
            'Forecast': { className: 'widget-preview-weather', text: '📅 5-Day' },
            'Temperature': { className: 'widget-preview-weather', text: '🌡️ 72°' }
        },
        'Timers': {
            'Timer': { className: 'widget-preview-timer', text: '⏱️ 00:00' },
            'Stopwatch': { className: 'widget-preview-timer', text: '⏱️ 00:00:00' },
            'Pomodoro': { className: 'widget-preview-timer', text: '🍅 25:00' }
        },
        'Note': { className: 'widget-preview-note', text: '📝 Note...' },
        'Todo': { className: 'widget-preview-todo', html: '☑️ Todo List<br>□ Task 1<br>□ Task 2' }
    };
    
    const config = previewConfigs[typeName]?.[variantName] || previewConfigs[typeName];
    
    if (config?.type === 'canvas') {
        const canvas = document.createElement('canvas');
        canvas.width = 60;
        canvas.height = 60;
        canvas.className = 'widget-preview-analog';
        const ctx = canvas.getContext('2d');
        
        ctx.beginPath();
        ctx.arc(30, 30, 28, 0, 2 * Math.PI);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.stroke();
        
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
    } else if (config) {
        const element = document.createElement('div');
        if (config.className) element.className = config.className;
        if (config.text) element.textContent = config.text;
        if (config.html) element.innerHTML = config.html;
        preview.appendChild(element);
    } else {
        preview.textContent = variantName;
    }
    
    return preview;
}

function showWidgetSelector() {
    const widgetSelector = document.getElementById('widget-selector');
    const widgetCategories = document.getElementById('widget-categories');
    
    widgetCategories.innerHTML = '';
    
    WIDGET_TYPES.forEach((widgetType, typeIndex) => {
        if (!widgetType.show) return;
        
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'widget-category';
        
        const categoryTitle = document.createElement('h3');
        categoryTitle.textContent = widgetType.name;
        categoryDiv.appendChild(categoryTitle);
        
        const variantsDiv = document.createElement('div');
        variantsDiv.className = 'widget-variants';
        
        widgetType.variants.forEach((variant, variantIndex) => {
            const variantButton = createWidgetVariantButton(
                widgetType.name,
                variant.name,
                typeIndex,
                variantIndex
            );
            variantsDiv.appendChild(variantButton);
        });
        
        categoryDiv.appendChild(variantsDiv);
        widgetCategories.appendChild(categoryDiv);
    });
    
    widgetSelector.style.display = 'block';
    
    document.getElementById('cancel-widget-button').onclick = () => {
        widgetSelector.style.display = 'none';
    };
}

function createWidgetVariantButton(typeName, variantName, typeIndex, variantIndex) {
    const button = document.createElement('button');
    button.className = 'widget-variant-button';
    
    const preview = createWidgetPreview(typeName, variantName);
    button.appendChild(preview);
    
    const label = document.createElement('span');
    label.textContent = variantName;
    button.appendChild(label);
    
    button.addEventListener('click', () => {
        document.getElementById('widget-selector').style.display = 'none';
        showWidgetSettings(typeIndex, variantIndex, typeName, variantName);
    });
    
    return button;
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
    
    settingsForm.innerHTML = '';
    
    const settings = existingSettings ? parseWidgetSettings(existingSettings) : {};
    
    if (editIndex !== null) {
        settingsTitle.textContent = `Edit ${typeName} - ${variantName}`;
        confirmButton.textContent = 'Save Changes';
    } else {
        settingsTitle.textContent = `Configure ${typeName} - ${variantName}`;
        confirmButton.textContent = 'Add Widget';
    }
    
    populateWidgetSettings(settingsForm, typeName, variantName, settings);
    
    settingsDialog.style.display = 'block';
    
    confirmButton.onclick = () => {
        const collectedSettings = collectWidgetSettings(typeName, variantName);
        if (editIndex !== null) {
            updateWidget(editIndex, typeIndex, variantIndex, typeName, variantName, collectedSettings);
        } else {
            addWidget(typeIndex, variantIndex, typeName, variantName, collectedSettings);
        }
        settingsDialog.style.display = 'none';
    };
    
    document.getElementById('cancel-widget-settings').onclick = () => {
        settingsDialog.style.display = 'none';
        if (editIndex === null) {
            showWidgetSelector();
        }
    };
}

function populateWidgetSettings(form, typeName, variantName, settings) {
    if (typeName === 'Clock') {
        addSelectSetting(form, 'Timezone', 'widget-timezone',
            ['local', 'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 
             'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 
             'Asia/Shanghai', 'Australia/Sydney'],
            settings.timezone || 'local');
        
        if (variantName === 'Digital') {
            addCheckboxSetting(form, 'Use 24-hour format', 'widget-format24',
                settings.format24Hour !== 'false');
            addCheckboxSetting(form, 'Show seconds', 'widget-showSeconds',
                settings.showSeconds !== 'false');
            addNumberSetting(form, 'Font Size (px)', 'widget-fontSize',
                settings.fontSize || '48', 20, 100);
        }
    } else if (typeName === 'Search') {
        const engines = [
            { name: 'Google', value: 'google' },
            { name: 'Bing', value: 'bing' },
            { name: 'DuckDuckGo', value: 'duckduckgo' },
            { name: 'Yahoo', value: 'yahoo' },
            { name: 'Brave', value: 'brave' }
        ];
        addSelectSetting(form, 'Search Engine', 'widget-search-engine',
            engines.map(e => ({ value: e.value, label: e.name })),
            settings.engine || 'google');
        addTextSetting(form, 'Placeholder Text', 'widget-placeholder',
            settings.placeholder || 'Search the web...');
        addCheckboxSetting(form, 'Show search icon', 'widget-showIcon',
            settings.showIcon !== 'false');
        addNumberSetting(form, 'Max Width (px)', 'widget-maxWidth',
            settings.maxWidth || '700', 300, 1200);
    } else if (typeName === 'Weather') {
        addTextSetting(form, 'Location', 'widget-location',
            settings.location || 'London');
        addTextSetting(form, 'API Key (OpenWeatherMap)', 'widget-apiKey',
            settings.apiKey || '', 'Get a free key from openweathermap.org');
        addSelectSetting(form, 'Units', 'widget-units',
            [{ value: 'metric', label: 'Metric (°C)' },
             { value: 'imperial', label: 'Imperial (°F)' },
             { value: 'standard', label: 'Standard (K)' }],
            settings.units || 'metric');
        
        if (variantName === 'Temperature') {
            addCheckboxSetting(form, 'Show "Feels Like" temperature', 'widget-showFeelsLike',
                settings.showFeelsLike !== 'false');
            addNumberSetting(form, 'Temperature Font Size (px)', 'widget-tempFontSize',
                settings.tempFontSize || '64', 24, 120);
        }
        
        addTextSetting(form, 'Widget Title', 'widget-title',
            settings.title || 'Weather');
    } else if (typeName === 'Note') {
        addTextSetting(form, 'Note Title', 'widget-title',
            settings.title || 'Note');
        addTextSetting(form, 'Placeholder Text', 'widget-placeholder',
            settings.placeholder || 'Write your note here...');
        addNumberSetting(form, 'Minimum Height (px)', 'widget-minHeight',
            settings.minHeight || '150', 100, 500);
        addNumberSetting(form, 'Max Width (px)', 'widget-maxWidth',
            settings.maxWidth || '400', 200, 800);
    } else if (typeName === 'Todo') {
        addTextSetting(form, 'Todo List Title', 'widget-title',
            settings.title || 'Todo List');
        addNumberSetting(form, 'Max Width (px)', 'widget-maxWidth',
            settings.maxWidth || '450', 300, 800);
        addNumberSetting(form, 'Max Height (px)', 'widget-maxHeight',
            settings.maxHeight || '400', 200, 800);
    } else if (typeName === 'Timers') {
        addTextSetting(form, 'Widget ID (for storage)', 'widget-id',
            settings.id || `timer-${Date.now()}`);
    } else {
        const infoText = document.createElement('p');
        infoText.textContent = 'This widget has minimal configuration options.';
        infoText.style.color = 'var(--t-col)';
        form.appendChild(infoText);
    }
}

function addTextSetting(form, label, id, defaultValue = '', placeholder = '') {
    const group = document.createElement('div');
    group.className = 'setting-group';
    
    const labelElem = document.createElement('label');
    labelElem.textContent = `${label}:`;
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
    labelElem.textContent = `${label}:`;
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
    labelElem.textContent = `${label}:`;
    labelElem.htmlFor = id;
    group.appendChild(labelElem);
    
    const select = document.createElement('select');
    select.id = id;
    
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
    const getElementValue = (id) => document.getElementById(id)?.value;
    const getCheckboxValue = (id) => document.getElementById(id)?.checked;
    
    const appendIfExists = (key, value) => {
        if (value !== undefined && value !== null && value !== '') {
            params.append(key, value);
        }
    };
    
    if (typeName === 'Clock') {
        const timezone = getElementValue('widget-timezone');
        if (timezone && timezone !== 'local') {
            params.append('timezone', timezone);
        }
        
        if (variantName === 'Digital') {
            appendIfExists('format24Hour', getCheckboxValue('widget-format24') ? 'true' : 'false');
            appendIfExists('showSeconds', getCheckboxValue('widget-showSeconds') ? 'true' : 'false');
            appendIfExists('fontSize', getElementValue('widget-fontSize'));
        }
    } else if (typeName === 'Search') {
        appendIfExists('engine', getElementValue('widget-search-engine'));
        appendIfExists('placeholder', getElementValue('widget-placeholder'));
        appendIfExists('showIcon', getCheckboxValue('widget-showIcon') ? 'true' : 'false');
        appendIfExists('maxWidth', getElementValue('widget-maxWidth'));
    } else if (typeName === 'Weather') {
        appendIfExists('location', getElementValue('widget-location'));
        appendIfExists('apiKey', getElementValue('widget-apiKey'));
        appendIfExists('units', getElementValue('widget-units'));
        appendIfExists('title', getElementValue('widget-title'));
        
        if (variantName === 'Temperature') {
            appendIfExists('showFeelsLike', getCheckboxValue('widget-showFeelsLike') ? 'true' : 'false');
            appendIfExists('tempFontSize', getElementValue('widget-tempFontSize'));
        }
    } else if (typeName === 'Note') {
        appendIfExists('title', getElementValue('widget-title'));
        appendIfExists('placeholder', getElementValue('widget-placeholder'));
        appendIfExists('minHeight', getElementValue('widget-minHeight'));
        appendIfExists('maxWidth', getElementValue('widget-maxWidth'));
    } else if (typeName === 'Todo') {
        appendIfExists('title', getElementValue('widget-title'));
        appendIfExists('maxWidth', getElementValue('widget-maxWidth'));
        appendIfExists('maxHeight', getElementValue('widget-maxHeight'));
    } else if (typeName === 'Timers') {
        appendIfExists('id', getElementValue('widget-id'));
    }
    
    return params.toString();
}

function addWidget(typeIndex, variantIndex, typeName, variantName, settings = '') {
    debug.log('Adding widget:', typeName, '-', variantName, 'with settings:', settings);
    
    const widgetGroup = {
        name: `${typeName} - ${variantName}`,
        x: CONFIG.defaultGroupPosition.x,
        y: CONFIG.defaultGroupPosition.y,
        type: 2,
        id: { type: typeIndex, var: variantIndex },
        settings: settings
    };
    
    SETTINGS.linkGroups.push(widgetGroup);
    
    const newGroup = document.createElement('div');
    newGroup.className = 'group';
    newGroup.dataset.index = SETTINGS.linkGroups.length - 1;
    
    appendGroupControls(newGroup);
    
    // Replace edit button with widget edit
    const hoverPopup = newGroup.querySelector('.group-hover-popup');
    const originalEditBtn = hoverPopup.querySelector('button[aria-label="Edit Group"]');
    if (originalEditBtn) originalEditBtn.remove();
    
    const widgetEditButton = createWidgetEditButton(newGroup);
    hoverPopup.insertBefore(widgetEditButton, hoverPopup.firstChild);
    
    appendResizeHandle(newGroup);
    setGroupPosition(newGroup, widgetGroup);
    
    const script = document.createElement('script');
    script.defer = true;
    script.src = `${WIDGET_TYPES[typeIndex].variants[variantIndex].path}${settings ? '?' + settings : ''}`;
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
    showWidgetSettings(typeIndex, variantIndex, widgetType.name, variant.name, group.settings, index);
}

function updateWidget(index, typeIndex, variantIndex, typeName, variantName, settings) {
    debug.log('Updating widget at index:', index, 'with settings:', settings);
    
    const group = SETTINGS.linkGroups[index];
    if (!group || group.type !== 2) {
        debug.error('Widget group not found or not a widget type for index:', index);
        return;
    }
    
    group.settings = settings;
    group.name = `${typeName} - ${variantName}`;
    group.id.type = typeIndex;
    group.id.var = variantIndex;
    
    const widgetElement = document.querySelector(`.group[data-index='${index}']`);
    if (!widgetElement) {
        debug.error('Widget element not found for index:', index);
        return;
    }
    
    const oldScript = widgetElement.querySelector('script');
    if (oldScript) oldScript.remove();
    
    const script = document.createElement('script');
    script.defer = true;
    script.src = `${WIDGET_TYPES[typeIndex].variants[variantIndex].path}${settings ? '?' + settings : ''}`;
    widgetElement.appendChild(script);
    
    saveSettings();
    
    debug.log('Reloading page to apply widget changes...');
    location.reload();
}