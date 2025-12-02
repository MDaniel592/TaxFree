# <sub><img src="https://raw.githubusercontent.com/MDaniel592/TaxFree/main/MV3/img/taxfree_64x64.png" width="64px" height="64px"></sub> TaxFree

Remove VAT/TAX from EU Amazon products and calculate local pricing instantly.

**Current Version: 0.4.0.5** | [Changelog](./CHANGELOG.md) | [Contributing](./CONTRIBUTING.md)

---

## 🎯 Features

### Price Tax Removal
Automatically removes VAT from product prices on European Amazon sites and displays the pre-tax price in a clear, easy-to-read format.

### Custom Tax Calculation
Input your country's tax rate (0-100%) to see what you'd pay with local VAT applied. Perfect for comparing prices across EU markets.

### Shipping Availability Detection (SendHerePlz)
Instantly identifies products that cannot be shipped to your location on search results:
- Red highlighting for non-deliverable items
- Warning icon indicators
- Alternative seller information when available

### URL Shortening (ShortLinks)
Converts long Amazon URLs to short `/dp/ASIN` format for easy sharing on social media and messaging apps.

---

## 🌍 Supported Regions

| Country | Domain | VAT Rate |
|---------|--------|----------|
| Spain | amazon.es | 21% |
| France | amazon.fr | 20% |
| Germany | amazon.de | 19%-21% |
| Italy | amazon.it | 22% |
| United Kingdom | amazon.co.uk | 20% |

---

## 🚀 Installation

### Chrome/Edge (Recommended)
1. Visit [Chrome Web Store](https://chrome.google.com/webstore) and search for "TaxFree"
2. Click **Add to Chrome** and confirm permissions
3. The extension icon appears in your toolbar

### Firefox
1. Visit [Firefox Add-ons](https://addons.mozilla.org) and search for "TaxFree"
2. Click **Add to Firefox** and confirm permissions
3. The extension icon appears in your toolbar

### Manual Installation (Development)
1. Clone this repository: `git clone https://github.com/MDaniel592/TaxFree.git`
2. Navigate to the `MV3` folder (current version)
3. **Chrome**: Go to `chrome://extensions` → Enable Developer Mode → Load unpacked → Select `MV3` folder
4. **Firefox**: Go to `about:debugging` → This Firefox → Load Temporary Add-on → Select `manifest.json`

---

## 💡 How It Works

### Product Pages
When you visit a product page on a supported Amazon domain:
1. Extension extracts the current price with VAT
2. Calculates the VAT-free price using the country's tax rate
3. Displays the price directly below the original price
4. If you set a custom tax rate, also shows the price with your local VAT

### Search Results
When browsing search results with SendHerePlz enabled:
1. Extension asynchronously checks each product's delivery status
2. Non-deliverable items are highlighted in red with a warning icon
3. Alternative seller information is displayed when available
4. Long URLs are shortened to `/dp/ASIN` format for easier sharing

---

## ⚙️ Settings

Access settings by clicking the TaxFree icon in your toolbar:

| Setting | Description | Default |
|---------|-------------|---------|
| **TaxFree** | Enable/disable VAT removal on product pages | Enabled |
| **TAX Percent** | Set your country's tax rate (0-100%) | 0% |
| **SendHerePlz** | Highlight non-deliverable products on search | Enabled |
| **ShortLinks** | Shorten URLs on search results | Enabled |

All settings persist across browser sessions and take effect immediately.

---

## 🛠️ Architecture

### Core Components

**popup.js/popup.html**
- User interface for settings management
- Toggles for features and tax percentage input
- Localization support (English, Spanish)

**taxfree.js** (Content Script)
- Extracts product prices from Amazon's DOM
- Performs tax calculations
- Injects custom price displays

**search.js** (Content Script)
- Monitors search result pages
- Detects shipping availability
- Implements URL shortening

**background.js**
- Service Worker initialization
- Handles URL monitoring and data routing
- Persists user preferences

**storage.js**
- Manages all persistent storage operations
- Handles inter-script communication
- Defers save operations for performance

### Data Flow
```
popup.js → storage.js → chrome.storage.local
                           ↓
background.js ← watches URL changes ← content scripts
                                        ↓
            taxfree.js (product pages)
            search.js (search results)
```

---

## 📊 Browser Compatibility

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 88+ | ✅ Supported (MV3) |
| Edge | 88+ | ✅ Supported (MV3) |
| Firefox | 109+ | ✅ Supported (MV3) |
| Safari | 15+ | ⚠️ Not tested |

**Note:** MV2 (Manifest Version 2) is deprecated and no longer maintained as of v0.4.0.5.

---

## 🐛 Troubleshooting

### Prices not showing?
- Verify the extension is enabled in your toolbar
- Ensure you're on a supported Amazon domain
- Check that the product is available for delivery
- Try reloading the page (Ctrl+R)

### SendHerePlz not working?
- Make sure the feature is enabled in settings
- Allow a few seconds for the extension to check delivery status
- Some products may not show delivery information

### URL not shortening?
- Verify ShortLinks is enabled in settings
- Check that you're viewing search results (not product pages)
- Some URLs may not contain valid ASIN codes

---

## 🔒 Privacy & Permissions

This extension:
- ✅ Works entirely locally—no data is sent to external servers
- ✅ Only accesses Amazon product and search pages
- ✅ Stores settings only in your browser's local storage
- ✅ Does not collect user data or browsing history

**Required Permissions:**
- `storage`: Save your preferences locally
- `tabs`: Monitor page navigation for feature activation

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for:
- Code style guidelines
- How to report bugs
- How to propose new features
- Development setup instructions

---

## 📜 License & Attribution

This project is open source. We gratefully acknowledge:

**Third-Party Dependencies:**
- [ClearURLs](https://github.com/ClearURLs/Addon) | GNU LGPLv3
- [Bootstrap 5](https://github.com/twbs/bootstrap) | MIT
- [SendHerePlz](https://github.com/sdelquin/sendhereplz) | GNU GPLv3
- [jQuery 3.6.1](https://github.com/jquery/jquery) | MIT
- [Popper.js](https://popper.js.org) | MIT

**Icons & Design:**
- Tax icon by [Smashicons - Flaticon](https://www.flaticon.com/free-icons/tax)

---

## 📞 Support

- 🐛 [Report a Bug](https://github.com/MDaniel592/TaxFree/issues)
- 💬 [Request a Feature](https://github.com/MDaniel592/TaxFree/issues)
- 📧 Contact: [See GitHub Profile](https://github.com/MDaniel592)

---

**Made with ❤️ by MDaniel | [Follow on GitHub](https://github.com/MDaniel592)**
