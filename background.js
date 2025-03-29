// Initialize extension folder
chrome.runtime.onInstalled.addListener(async () => {
  try {
    // Check if przwl-mark folder already exists
    const existingFolders = await chrome.bookmarks.search({
      title: 'przwl-mark'
    });
    
    if (existingFolders.length === 0) {
      // Create a dedicated folder for przwl-mark extension
      const folder = await chrome.bookmarks.create({
        parentId: '1', // "Other Bookmarks" folder
        title: 'przwl-mark',
        index: 0
      });
      
      // Store the folder ID
      await chrome.storage.sync.set({ bookmarkFolderId: folder.id });
    } else {
      // Use existing folder
      await chrome.storage.sync.set({ bookmarkFolderId: existingFolders[0].id });
    }
  } catch (error) {
    console.error('Error initializing przwl-mark folder:', error);
  }
});

// Listen for keyboard shortcut command
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'quick-bookmark') {
    await bookmarkCurrentPage();
  }
});

// Function to get or create przwl-mark folder
async function getQuickBookmarksFolder() {
  const { bookmarkFolderId } = await chrome.storage.sync.get('bookmarkFolderId');
  
  if (bookmarkFolderId) {
    try {
      const folder = await chrome.bookmarks.get(bookmarkFolderId);
      return folder[0];
    } catch (error) {
      console.error('Error getting przwl-mark folder:', error);
    }
  }
  
  // If folder doesn't exist or there was an error, create a new one
  const existingFolders = await chrome.bookmarks.search({
    title: 'przwl-mark'
  });
  
  if (existingFolders.length > 0) {
    await chrome.storage.sync.set({ bookmarkFolderId: existingFolders[0].id });
    return existingFolders[0];
  }
  
  const folder = await chrome.bookmarks.create({
    parentId: '1',
    title: 'przwl-mark',
    index: 0
  });
  
  await chrome.storage.sync.set({ bookmarkFolderId: folder.id });
  return folder;
}

// Function to bookmark the current page
async function bookmarkCurrentPage() {
  try {
    // Get current tab information
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Get or create przwl-mark folder
    const folder = await getQuickBookmarksFolder();
    
    // Check if bookmark already exists in our folder
    const existingBookmarks = await chrome.bookmarks.search({
      url: tab.url
    });
    
    // Filter existing bookmarks to only check those in our folder
    const existingInFolder = existingBookmarks.filter(bookmark => bookmark.parentId === folder.id);
    
    if (existingInFolder.length > 0) {
      showNotification('Bookmark already exists!');
      return;
    }
    
    // Create new bookmark in our folder
    const bookmark = await chrome.bookmarks.create({
      parentId: folder.id,
      title: tab.title,
      url: tab.url,
      index: 0
    });
    
    showNotification('Bookmark saved successfully!');
    
    // Store in recent bookmarks
    const { recentBookmarks = [] } = await chrome.storage.local.get('recentBookmarks');
    recentBookmarks.unshift({
      id: bookmark.id,
      title: bookmark.title,
      url: bookmark.url,
      dateAdded: new Date().toISOString()
    });
    
    // Keep only the last 10 bookmarks
    await chrome.storage.local.set({
      recentBookmarks: recentBookmarks.slice(0, 10)
    });
    
  } catch (error) {
    console.error('Error saving bookmark:', error);
    showNotification('Error saving bookmark. Please try again.');
  }
}

// Function to create a new folder
async function createNewFolder(parentId, title) {
  try {
    const folder = await chrome.bookmarks.create({
      parentId: parentId,
      title: title,
      index: 0
    });
    return folder;
  } catch (error) {
    console.error('Error creating folder:', error);
    throw error;
  }
}

// Function to show notifications
function showNotification(message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon48.png',
    title: 'przwl-mark',
    message: message
  });
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getRecentBookmarks') {
    chrome.storage.local.get('recentBookmarks', (result) => {
      sendResponse({ recentBookmarks: result.recentBookmarks || [] });
    });
    return true; // Will respond asynchronously
  }
  
  if (request.action === 'bookmarkCurrent') {
    bookmarkCurrentPage();
  }
  
  if (request.action === 'getAllBookmarks') {
    getQuickBookmarksFolder()
      .then(async (folder) => {
        if (!folder) {
          sendResponse({ bookmarks: [] });
          return;
        }
        
        const folderTree = await chrome.bookmarks.getSubTree(folder.id);
        sendResponse({ bookmarks: folderTree });
      })
      .catch(error => {
        console.error('Error getting bookmarks:', error);
        sendResponse({ bookmarks: [] });
      });
    return true;
  }

  if (request.action === 'createFolder') {
    getQuickBookmarksFolder()
      .then(folder => {
        return createNewFolder(folder.id, request.title);
      })
      .then(folder => {
        sendResponse({ success: true, folder });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }
}); 