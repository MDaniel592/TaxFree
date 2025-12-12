# <sub><img src="https://raw.githubusercontent.com/MDaniel592/TaxFree/main/MV3/img/taxfree_64x64.png" width="64px" height="64px"></sub> TaxFree

Remove VAT/TAX from EU Amazon products and calculate local pricing instantly.

**Current Version: 0.5.0** | [Chrome Web Store](#) | [Firefox Add-ons](#)

---

## 🎯 Features

### 💰 Price Tax Removal
Automatically removes VAT from product prices on European Amazon sites and displays the pre-tax price in a clear, easy-to-read format.

### 🧮 Custom Tax Calculation
Input your country's tax rate (0-100%) to see what you'd pay with local VAT applied. Perfect for comparing prices across EU markets.

### 🔗 URL Shortening (ShortLinks)
Converts long Amazon URLs to short `/dp/ASIN` format for easy sharing on social media and messaging apps.

---

## 🌍 Supported Regions

| Country | Domain | VAT Rate |
|---------|--------|----------|
| 🇪🇸 Spain | amazon.es | 21% |
| 🇫🇷 France | amazon.fr | 20% |
| 🇩🇪 Germany | amazon.de | 19% |
| 🇮🇹 Italy | amazon.it | 22% |
| 🇬🇧 United Kingdom | amazon.co.uk | 20% |

---

## 🚀 Installation

### Chrome/Edge
1. Download from [Chrome Web Store](#)
2. Click **Add to Chrome** and confirm permissions
3. The extension icon appears in your toolbar

### Firefox
1. Download from [Firefox Add-ons](#)
2. Click **Add to Firefox** and confirm permissions
3. The extension icon appears in your toolbar

### Manual Installation (Developers)
```bash
git clone https://github.com/MDaniel592/TaxFree.git
cd TaxFree/MV3
```

**Chrome/Edge**:
- Go to `chrome://extensions`
- Enable "Developer mode"
- Click "Load unpacked"
- Select the `MV3` folder

**Firefox**:
- Go to `about:debugging`
- Click "This Firefox"
- Click "Load Temporary Add-on"
- Select `manifest.json` from `MV3` folder

---

## 💡 How to Use

### On Product Pages
1. Visit any product on a supported Amazon domain
2. Look below the original price to see:
   - **Price Tax Free**: Product price without VAT
   - **Price with new VAT**: (If you set a custom tax %) Price with your local VAT

### On Search Results
- Product URLs are automatically shortened to `/dp/ASIN` format
- Makes links cleaner and easier to share

### Settings
Click the TaxFree icon in your toolbar to configure:
- **TaxFree Toggle**: Enable/disable VAT removal
- **Tax Percent**: Set your country's VAT rate (0-100%)
- **ShortLinks**: Enable/disable URL shortening

---

## 🔒 Privacy & Security

This extension:
- ✅ Works **100% locally**—no data sent to external servers
- ✅ Only accesses Amazon product and search pages
- ✅ Stores settings **only** in your browser's local storage
- ✅ **Does not** collect, track, or share any user data
- ✅ Open source—audit the code yourself!

**Required Permissions:**
- `storage`: Save your preferences locally
- `tabs`: Monitor Amazon pages to activate features

---

## 🛠️ Technical Details

### Architecture
- **Manifest V3** (latest Chrome extension standard)
- **Content Scripts**: Extract and modify Amazon page content
- **Service Worker**: Lightweight background processing
- **Direct Storage**: Uses `chrome.storage.local` for settings

### Files Overview
```
MV3/
├── background/background.js      # Service worker
├── content_scripts/
│   ├── taxfree.js               # Price calculation & display
│   └── search.js                # URL shortening
├── core_js/
│   ├── popup.js                 # Settings UI logic
│   └── write_version.js         # Version display
├── html/popup.html              # Settings interface
└── manifest.json                # Extension configuration
```

---

## 🐛 Troubleshooting

**Prices not showing?**
- Ensure you're on a supported Amazon domain
- Check that TaxFree is enabled in settings
- Reload the page (Ctrl+R / Cmd+R)

**Settings not saving?**
- Close and reopen the popup
- Check browser console for errors (F12)

**Extension not working after update?**
- Reload the extension: `chrome://extensions` → Click reload button
- Clear browser cache and reload Amazon

---

## 📝 Changelog

### v0.5.0 (2025-12-12)
**Major Refactoring**
- 🗑️ Removed: SendHerePlz (shipping detection) feature
- 🐛 Fixed: Random ID bug causing price cleanup issues
- 🐛 Fixed: Currency format error for German Amazon
- 🐛 Fixed: ShortLinks breaking non-product URLs
- 🔒 Security: Removed all `eval()` usage
- ⚡ Optimized: Simplified storage system (~30% code reduction)
- 🧹 Cleaned: Removed unused files and dependencies

### v0.4.0.6
- Fixed duplicate "Precio con nuevo IVA" display
- Improved delivery detection
- Better referral link removal
- Price parsing fixes for values >999

[View Full Changelog](./CHANGELOG.md)

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit: `git commit -m "Add amazing feature"`
5. Push: `git push origin feature/amazing-feature`
6. Open a Pull Request

**Bug Reports**: [Open an issue](https://github.com/MDaniel592/TaxFree/issues) with:
- Browser and extension version
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)

---

## 📜 License

This project is open source.

### Third-Party Credits
- [Bootstrap 5](https://github.com/twbs/bootstrap) - MIT License
- [jQuery 3.6.1](https://github.com/jquery/jquery) - MIT License
- [Popper.js](https://popper.js.org) - MIT License
- Tax icon by [Smashicons - Flaticon](https://www.flaticon.com/free-icons/tax)

---

## 📞 Support

- 🐛 [Report Issues](https://github.com/MDaniel592/TaxFree/issues)
- 💬 [Request Features](https://github.com/MDaniel592/TaxFree/issues/new)
- 📧 [GitHub Profile](https://github.com/MDaniel592)

---

**Made with ❤️ for savvy EU shoppers**

⭐ If you find this useful, please star the repo on GitHub!
