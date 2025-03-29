# przwl-mark

A lightning-fast Chrome extension that revolutionizes your bookmarking experience with powerful features and elegant design.

## ✨ Features

- 🚀 **Lightning-Fast Bookmarking**: Save pages instantly with a single keyboard shortcut
- 📁 **Smart Organization**: Create custom folders and organize bookmarks with drag-and-drop ease
- 🔍 **Powerful Search**: Find bookmarks instantly with real-time search and filtering
- 🌓 **Seamless Dark Mode**: Beautiful interface that adapts to your system theme
- ✏️ **One-Click Management**: Edit titles, URLs, and organize bookmarks with minimal clicks
- 🔔 **Instant Feedback**: Get elegant notifications when bookmarks are saved or updated
- ⌨️ **Keyboard-First Design**: Quick access to all features with intuitive shortcuts
- 🎨 **Modern UI**: Clean, responsive interface that works perfectly on all screen sizes
- 🔄 **Sync Ready**: Your bookmarks sync automatically across devices
- 🛡️ **Privacy Focused**: No data collection, just pure bookmarking functionality

## 🚀 Installation

1. Clone this repository:
```bash
git clone https://github.com/prajwalbanstola/przwl-mark.git
```

2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the `przwl-mark` directory

## 💡 Usage

### Quick Bookmarking
- Press `Ctrl+Shift+K` (Windows/Linux) or `Cmd+Shift+K` (Mac) to instantly bookmark the current page
- Click the extension icon and use the "Bookmark Current Page" button for visual bookmarking

### Managing Bookmarks
- Access your bookmarks by clicking the extension icon
- Use the powerful search bar to find bookmarks instantly
- Edit bookmark details with a single click
- Delete bookmarks with confirmation to prevent accidents
- Create and organize folders with drag-and-drop simplicity

### Customization
- Toggle between light and dark themes for comfortable viewing
- Enable/disable notifications to your preference
- Customize your bookmarking experience with various options

## 🛠️ Development

### Prerequisites
- Node.js (for icon generation)
- Chrome browser
- Basic understanding of JavaScript and Chrome Extensions API

### Setup
1. Install dependencies:
```bash
npm install
```

2. Generate icons:
```bash
node create_icons.js
```

### Project Structure
```
przwl-mark/
├── manifest.json      # Extension configuration
├── popup.html        # Main extension popup interface
├── popup.js         # Popup functionality
├── background.js    # Background service worker
├── styles.css       # Styling and theming
├── create_icons.js  # Icon generation script
└── icons/          # Extension icons
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Chrome Extensions API for providing powerful extension capabilities
- Material Design Icons for beautiful UI elements
- All contributors who help improve this extension
- The open-source community for inspiration and support

## 💬 Support

Have questions or suggestions? We'd love to hear from you!
- Open an issue in the GitHub repository
- Star the project if you find it useful
- Share with others who might benefit from it

## 👤 Author

**Prajwal Banstola**
- GitHub: [@prajwalbanstola](https://github.com/prajwalbanstola)
- Passionate about creating efficient tools for better productivity

---

Made with ❤️ for better bookmarking | Crafted by Prajwal Banstola 
