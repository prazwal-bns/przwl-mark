document.addEventListener('DOMContentLoaded', async () => {
  // Initialize UI elements
  const bookmarkCurrentBtn = document.getElementById('bookmarkCurrent');
  const chooseFolderBtn = document.getElementById('chooseFolder');
  const newFolderBtn = document.getElementById('newFolder');
  const searchInput = document.getElementById('searchInput');
  const recentBookmarksList = document.getElementById('recentBookmarksList');
  const themeToggle = document.getElementById('themeToggle');
  const darkModeCheckbox = document.getElementById('darkMode');
  const readLaterCheckbox = document.getElementById('readLater');

  // Modal elements
  const folderModal = document.getElementById('folderModal');
  const newFolderModal = document.getElementById('newFolderModal');
  const editModal = document.getElementById('editModal');
  const folderTree = document.getElementById('folderTree');
  const bookmarkTitle = document.getElementById('bookmarkTitle');
  const bookmarkUrl = document.getElementById('bookmarkUrl');
  const bookmarkFolder = document.getElementById('bookmarkFolder');
  const newFolderName = document.getElementById('newFolderName');

  // Load saved settings
  const { darkMode = false, readLater = false } = await chrome.storage.sync.get(['darkMode', 'readLater']);
  darkModeCheckbox.checked = darkMode;
  readLaterCheckbox.checked = readLater;
  updateTheme(darkMode);

  // Load all bookmarks
  loadAllBookmarks();

  // Event Listeners
  bookmarkCurrentBtn.addEventListener('click', async () => {
    bookmarkCurrentBtn.disabled = true;
    try {
      await chrome.runtime.sendMessage({ action: 'bookmarkCurrent' });
    } catch (error) {
      console.error('Error bookmarking page:', error);
      alert('Error bookmarking page. Please try again.');
    } finally {
      bookmarkCurrentBtn.disabled = false;
    }
  });

  chooseFolderBtn.addEventListener('click', async () => {
    try {
      const tree = await chrome.bookmarks.getTree();
      showFolderSelector(tree);
    } catch (error) {
      console.error('Error loading folders:', error);
      alert('Error loading folders. Please try again.');
    }
  });

  newFolderBtn.addEventListener('click', () => {
    newFolderModal.style.display = 'block';
    newFolderName.value = '';
  });

  // Modal close buttons
  document.querySelectorAll('.close-button').forEach(button => {
    button.addEventListener('click', () => {
      folderModal.style.display = 'none';
      editModal.style.display = 'none';
      newFolderModal.style.display = 'none';
    });
  });

  // Cancel buttons
  document.getElementById('cancelFolder').addEventListener('click', () => {
    folderModal.style.display = 'none';
  });

  document.getElementById('cancelEdit').addEventListener('click', () => {
    editModal.style.display = 'none';
  });

  document.getElementById('cancelNewFolder').addEventListener('click', () => {
    newFolderModal.style.display = 'none';
  });

  // Confirm folder selection
  document.getElementById('confirmFolder').addEventListener('click', () => {
    const selectedFolder = folderTree.querySelector('.selected');
    if (selectedFolder) {
      const folderId = selectedFolder.dataset.id;
      chrome.storage.sync.set({ bookmarkFolderId: folderId });
      folderModal.style.display = 'none';
      loadAllBookmarks(); // Refresh bookmarks after folder selection
    }
  });

  // Confirm new folder creation
  document.getElementById('confirmNewFolder').addEventListener('click', async () => {
    const folderName = newFolderName.value.trim();
    if (!folderName) {
      alert('Please enter a folder name');
      return;
    }

    const confirmBtn = document.getElementById('confirmNewFolder');
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Creating...';

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'createFolder',
        title: folderName
      });

      if (response.success) {
        newFolderModal.style.display = 'none';
        loadAllBookmarks();
      } else {
        alert('Error creating folder: ' + response.error);
      }
    } catch (error) {
      console.error('Error creating folder:', error);
      alert('Error creating folder. Please try again.');
    } finally {
      confirmBtn.disabled = false;
      confirmBtn.textContent = 'Create Folder';
    }
  });

  // Confirm bookmark edit
  document.getElementById('confirmEdit').addEventListener('click', async () => {
    const currentBookmark = editModal.dataset.bookmarkId;
    if (!currentBookmark) return;

    const confirmBtn = document.getElementById('confirmEdit');
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Saving...';

    try {
      await chrome.bookmarks.update(currentBookmark, {
        title: bookmarkTitle.value,
        url: bookmarkUrl.value
      });
      editModal.style.display = 'none';
      loadAllBookmarks();
    } catch (error) {
      console.error('Error updating bookmark:', error);
      alert('Error updating bookmark. Please try again.');
    } finally {
      confirmBtn.disabled = false;
      confirmBtn.textContent = 'Save Changes';
    }
  });

  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    filterBookmarks(searchTerm);
  });

  themeToggle.addEventListener('click', () => {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    const newTheme = !isDark;
    document.body.setAttribute('data-theme', newTheme ? 'dark' : 'light');
    chrome.storage.sync.set({ darkMode: newTheme });
  });

  darkModeCheckbox.addEventListener('change', (e) => {
    updateTheme(e.target.checked);
    chrome.storage.sync.set({ darkMode: e.target.checked });
  });

  readLaterCheckbox.addEventListener('change', (e) => {
    chrome.storage.sync.set({ readLater: e.target.checked });
  });
});

// Function to load all bookmarks
async function loadAllBookmarks() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getAllBookmarks' });
    const recentBookmarksList = document.getElementById('recentBookmarksList');
    recentBookmarksList.innerHTML = '';

    if (!response.bookmarks || response.bookmarks.length === 0) {
      recentBookmarksList.innerHTML = '<div class="no-bookmarks">No bookmarks yet</div>';
      return;
    }

    // Process bookmarks tree
    function processBookmarks(nodes) {
      nodes.forEach(node => {
        if (node.url) {
          // This is a bookmark
          const bookmarkElement = createBookmarkElement({
            id: node.id,
            title: node.title,
            url: node.url
          });
          recentBookmarksList.appendChild(bookmarkElement);
        } else if (node.children) {
          // This is a folder, process its children
          processBookmarks(node.children);
        }
      });
    }

    processBookmarks(response.bookmarks);
  } catch (error) {
    console.error('Error loading bookmarks:', error);
    const recentBookmarksList = document.getElementById('recentBookmarksList');
    recentBookmarksList.innerHTML = '<div class="error-message">Error loading bookmarks. Please try again.</div>';
  }
}

// Function to create bookmark element
function createBookmarkElement(bookmark) {
  const div = document.createElement('div');
  div.className = 'bookmark-item';
  
  const title = document.createElement('span');
  title.className = 'bookmark-title';
  title.textContent = bookmark.title;
  
  const actions = document.createElement('div');
  actions.className = 'bookmark-actions';
  
  const editBtn = document.createElement('button');
  editBtn.textContent = 'Edit';
  editBtn.className = 'action-button edit-button';
  editBtn.onclick = (e) => {
    e.stopPropagation();
    showEditModal(bookmark);
  };
  
  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Delete';
  deleteBtn.className = 'action-button delete-button';
  deleteBtn.onclick = (e) => {
    e.stopPropagation();
    showDeleteConfirmation(bookmark);
  };
  
  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);
  
  div.appendChild(title);
  div.appendChild(actions);
  
  div.onclick = () => {
    chrome.tabs.create({ url: bookmark.url });
  };
  
  return div;
}

// Function to show edit modal
function showEditModal(bookmark) {
  const editModal = document.getElementById('editModal');
  const bookmarkTitle = document.getElementById('bookmarkTitle');
  const bookmarkUrl = document.getElementById('bookmarkUrl');
  
  bookmarkTitle.value = bookmark.title;
  bookmarkUrl.value = bookmark.url;
  editModal.dataset.bookmarkId = bookmark.id;
  editModal.style.display = 'block';
}

// Function to show delete confirmation
function showDeleteConfirmation(bookmark) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.style.display = 'block';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>Delete Bookmark</h2>
        <button class="close-button">&times;</button>
      </div>
      <div class="modal-body">
        <p>Are you sure you want to delete "${bookmark.title}"?</p>
      </div>
      <div class="modal-footer">
        <button class="secondary-button" id="cancelDelete">Cancel</button>
        <button class="primary-button" id="confirmDelete">Delete</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  modal.querySelector('.close-button').onclick = () => modal.remove();
  modal.querySelector('#cancelDelete').onclick = () => modal.remove();
  modal.querySelector('#confirmDelete').onclick = async () => {
    try {
      await chrome.bookmarks.remove(bookmark.id);
      modal.remove();
      loadAllBookmarks();
    } catch (error) {
      console.error('Error deleting bookmark:', error);
      alert('Error deleting bookmark. Please try again.');
    }
  };
}

// Function to show folder selector
function showFolderSelector(tree) {
  const folderTree = document.getElementById('folderTree');
  folderTree.innerHTML = '';
  
  function createFolderElement(node) {
    const div = document.createElement('div');
    div.className = 'folder-item';
    div.dataset.id = node.id;
    div.textContent = node.title;
    
    if (node.children) {
      const subFolders = document.createElement('div');
      subFolders.className = 'sub-folders';
      node.children.forEach(child => {
        if (!child.url) { // Only show folders, not bookmarks
          subFolders.appendChild(createFolderElement(child));
        }
      });
      div.appendChild(subFolders);
    }
    
    div.onclick = (e) => {
      e.stopPropagation();
      folderTree.querySelectorAll('.folder-item').forEach(item => {
        item.classList.remove('selected');
      });
      div.classList.add('selected');
    };
    
    return div;
  }
  
  tree.forEach(node => {
    if (!node.url) { // Only show folders, not bookmarks
      folderTree.appendChild(createFolderElement(node));
    }
  });
  
  document.getElementById('folderModal').style.display = 'block';
}

// Function to filter bookmarks
function filterBookmarks(searchTerm) {
  const bookmarks = document.querySelectorAll('.bookmark-item');
  bookmarks.forEach(bookmark => {
    const title = bookmark.querySelector('.bookmark-title').textContent.toLowerCase();
    bookmark.style.display = title.includes(searchTerm) ? 'flex' : 'none';
  });
}

// Function to update theme
function updateTheme(isDark) {
  document.body.setAttribute('data-theme', isDark ? 'dark' : 'light');
  const themeToggle = document.getElementById('themeToggle');
  themeToggle.textContent = isDark ? 'Light Mode' : 'Dark Mode';
} 