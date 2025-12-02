chrome.runtime.onInstalled.addListener(async (details) => {

    chrome.runtime.setUninstallURL('https://forms.gle/ENonKhwExQMowTuG8');
    
    // Handle extension updates - migrate from sync to local storage
    if (details.reason === 'update') {
        debug.log('Extension updated, checking for migration needs');
        
        // Get all data from sync storage
        const syncData = await chrome.storage.sync.get(null);
        
        // Check if there's data in sync storage that needs migration
        if (syncData && Object.keys(syncData).length > 0) {
            debug.log('Migrating data from sync to local storage');
            
            // Migrate all sync data to local storage
            await chrome.storage.local.set(syncData);
            
            // Optional: Clear sync storage after successful migration
            // Uncomment the next line if you want to clean up sync storage
            // await chrome.storage.sync.clear();
            
            debug.log('Migration completed successfully');
        } else {
            debug.log('No data found in sync storage to migrate');
        }
        
        return; // Exit early for updates, don't run install logic
    }
    
    // Check if settings already exist, regardless of install reason
    const { settings, groups } = await chrome.storage.sync.get(['settings', 'groups']);
    const hasSettings = settings && Object.keys(settings).length > 0;
    const hasGroups = groups && groups.length > 0;
    
    // If this is a fresh install OR if no settings exist, apply defaults
    if (details.reason === 'install' && !hasSettings) {
        // Set enhanced default settings if they don't exist
        if (!hasSettings) {
            
            debug.log('Applying default settings');
            await chrome.storage.sync.set({ settings: defaultSettings });
        }
        
        
        
        // Only open new tab on fresh install
        if (details.reason === 'install') {
            chrome.tabs.create({
                url: chrome.runtime.getURL('/pages/settings/settings.html?newInstall=true')
            });
        }
    }
});