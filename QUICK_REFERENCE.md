# TaxFree Quick Reference Guide

## 🚀 Quick Start for Users

### Installation
- **Chrome:** [Web Store](https://chrome.google.com/webstore) → Search "TaxFree"
- **Firefox:** [Add-ons](https://addons.mozilla.org) → Search "TaxFree"
- **Manual:** Clone repo → Load unpacked from `MV3` folder

### Features
- **Tax Removal** - See prices without VAT
- **Custom Tax** - Input your country's tax rate
- **Shipping Check** - Red highlights for non-deliverable items
- **URL Shortening** - Convert long URLs to /dp/ASIN

### Supported Sites
- amazon.es (Spain)
- amazon.fr (France)
- amazon.de (Germany)
- amazon.it (Italy)
- amazon.co.uk (UK)

---

## 👨‍💻 Quick Start for Developers

### Development Setup
```bash
# Clone repository
git clone https://github.com/MDaniel592/TaxFree.git
cd TaxFree

# Load in Chrome
# 1. Go to chrome://extensions
# 2. Enable Developer Mode
# 3. Click Load unpacked
# 4. Select MV3 folder

# Load in Firefox
# 1. Go to about:debugging
# 2. Click This Firefox
# 3. Load Temporary Add-on
# 4. Select MV3/manifest.json
```

### Project Structure
```
MV3/
├── manifest.json           # Extension config
├── background/             # Service worker
├── content_scripts/        # Page scripts
│   ├── taxfree.js         # Price handling
│   └── search.js          # Search results
├── core_js/               # Core logic
│   ├── popup.js           # Settings UI
│   ├── storage.js         # Storage manager
│   └── write_version.js   # Version utils
├── css/                   # Stylesheets
├── html/                  # HTML pages
│   └── popup.html         # Settings popup
└── _locales/              # Translations
    ├── en/
    └── es/
```

### Making Changes
1. **Create feature branch** - `git checkout -b feature/description`
2. **Make changes** - Edit files and test
3. **Test thoroughly** - Check console for errors
4. **Write clear commit** - `git commit -m "feat: description"`
5. **Submit PR** - Create pull request with description

### Testing Checklist
- [ ] Product pages show correct prices
- [ ] Custom tax calculation works
- [ ] Search results show shipping status
- [ ] URLs are shortened correctly
- [ ] No console errors
- [ ] Works in Chrome and Firefox
- [ ] Works on all 5 Amazon sites

---

## 📚 Documentation Map

| Document | Purpose | Audience |
|----------|---------|----------|
| README.md | User guide and overview | Everyone |
| CONTRIBUTING.md | Development guidelines | Developers |
| CHANGELOG.md | Version history | Everyone |
| IMPROVEMENTS.md | What was improved | Developers |
| Code comments | Implementation details | Developers |

---

## 🔍 Code Navigation

### Finding Things

**By Feature:**
- Price handling → `MV3/content_scripts/taxfree.js`
- Search results → `MV3/content_scripts/search.js`
- Settings UI → `MV3/core_js/popup.js`
- Data storage → `MV3/core_js/storage.js`

**By File:**
- `background.js` - Extension startup and page monitoring
- `popup.js` - Settings interface and user preferences
- `storage.js` - All storage operations
- `taxfree.js` - Price extraction and calculation
- `search.js` - Search results enhancement

**By Function:**
Use Ctrl+F to search for `function name` or `functionName()`

### Code Style

**Error Handling:**
```javascript
try {
  // Code that might fail
} catch (error) {
  console.error("[TaxFree Component] Error message:", error);
}
```

**Logging:**
```javascript
console.log("[TaxFree Component] Message");
console.warn("[TaxFree Component] Warning");
console.error("[TaxFree Component ERROR] Error");
```

**Documentation:**
```javascript
/**
 * Function description
 * @param {type} name - Parameter description
 * @returns {type} Return description
 */
```

---

## ⚙️ Configuration

### manifest.json
```json
{
  "manifest_version": 3,
  "version": "0.4.0.5",
  "description": "Discount the TAX/VAT applied to all products",
  "permissions": ["storage", "tabs"],
  "content_scripts": [
    {
      "matches": ["https://www.amazon.*/*"],
      "js": ["content_scripts/taxfree.js"]
    }
  ]
}
```

### Default Settings
- TaxFreeStatus: true (VAT removal enabled)
- sendHerePlzStatus: true (Shipping detection enabled)
- ShortLinkStatus: true (URL shortening enabled)
- TaxFreePercent: 0 (Custom tax rate)

---

## 🐛 Debugging

### Check Console
1. Right-click page → Inspect → Console tab
2. Look for `[TaxFree...]` messages
3. Red errors show problems
4. Yellow warnings show potential issues

### Common Issues

**Prices not showing?**
- Check if product page loads completely
- Look for console errors
- Verify extension is enabled
- Check if product is deliverable

**SendHerePlz not working?**
- Allow a few seconds for detection
- Check console for network errors
- Verify feature is enabled
- Try refreshing the page

**Settings not saving?**
- Check browser storage is enabled
- Look for storage errors in console
- Try reloading the page
- Check browser permissions

---

## 📞 Getting Help

### For Users
- Check README.md
- Read Troubleshooting section
- Open GitHub issue
- Check existing issues first

### For Developers
- Read CONTRIBUTING.md
- Check code comments
- Read function JSDoc
- Look at similar code for patterns

---

## 🔐 Security & Privacy

### What We Access
- Product pages (amazon.*.*)
- Search result pages (amazon.*.*)
- Browser storage (user settings only)
- Nothing else

### What We Don't Do
- Don't send data to external servers
- Don't track user behavior
- Don't modify other websites
- Don't access sensitive data

### Permissions
- `storage` - Save settings locally
- `tabs` - Monitor page navigation

---

## 🎯 Development Tips

### Before Starting
1. Read CONTRIBUTING.md
2. Check existing issues
3. Plan your changes
4. Test your understanding

### While Coding
1. Write clear comments
2. Add JSDoc documentation
3. Handle errors properly
4. Test as you code
5. Keep it simple

### Before Submitting
1. Test thoroughly
2. Check for console errors
3. Verify all features work
4. Update documentation
5. Write clear commit messages

---

## 📊 Current Features

### Fully Implemented
- ✅ VAT removal on product pages
- ✅ Custom tax rate calculation
- ✅ Shipping availability detection
- ✅ URL shortening
- ✅ Multi-language support
- ✅ Settings persistence
- ✅ Error handling
- ✅ Comprehensive documentation

### Not Yet Implemented
- Price history tracking
- Multi-device sync
- Mobile app version
- Advanced filtering
- Browser sync

---

## 🚀 Performance Tips

### For Users
- Extension uses minimal resources
- Only runs on Amazon sites
- Works with infinite scroll
- Fast price detection
- Lightweight storage

### For Developers
- Use const/let (not var)
- Avoid unnecessary DOM queries
- Cache DOM element references
- Use event delegation
- Debounce repeated operations

---

## 📈 Metrics & Stats

### Size
- Core code: ~800 lines (excluding libraries)
- Documentation: ~1500 lines
- Comments: 175+ JSDoc + inline
- Total: ~2300 lines of code/docs

### Browser Support
- Chrome 88+
- Edge 88+
- Firefox 109+

### Countries Supported
- Spain (amazon.es)
- France (amazon.fr)
- Germany (amazon.de)
- Italy (amazon.it)
- UK (amazon.co.uk)

### Languages
- English (en)
- Spanish (es)

---

## 🎓 Learning Path

### For New Developers
1. Read README.md
2. Read CONTRIBUTING.md
3. Review code structure
4. Read function comments
5. Look at examples
6. Make small changes
7. Submit PR

### For Code Review
1. Check code style
2. Look for error handling
3. Verify documentation
4. Test functionality
5. Suggest improvements

---

## 🔗 Useful Links

- [GitHub Repository](https://github.com/MDaniel592/TaxFree)
- [Chrome Web Store](https://chrome.google.com/webstore)
- [Firefox Add-ons](https://addons.mozilla.org)
- [Chrome API Docs](https://developer.chrome.com/docs/extensions/)
- [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

---

## ✅ Checklist

### Before Publishing
- [ ] Code reviewed
- [ ] Tests passed
- [ ] Documentation updated
- [ ] No console errors
- [ ] Works on all Amazon sites
- [ ] Tested in Chrome and Firefox
- [ ] Version number updated
- [ ] Changelog updated

### After Publishing
- [ ] Monitor for issues
- [ ] Respond to feedback
- [ ] Fix bugs promptly
- [ ] Plan next features
- [ ] Update documentation

---

**Last Updated:** December 2, 2025
**Version:** 0.4.0.5
**Status:** Complete