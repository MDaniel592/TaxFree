# Changelog

All notable changes to TaxFree are documented in this file.

---

## [0.5.0] - 2025-12-12

### 🚨 Breaking Changes
- **Removed SendHerePlz feature**: Shipping availability detection has been completely removed to simplify the extension and improve performance

### 🐛 Bug Fixes
- **Fixed random ID bug** in taxfree.js that prevented proper cleanup of old price elements
- **Fixed currency format error** for German Amazon (DE) when handling euro symbol
- **Fixed ShortLinks bug** that was replacing ALL links in product containers, breaking vendor and offer links

### 🔒 Security Improvements
- **Removed all `eval()` usage** from popup.js (3 instances eliminated)
- **Simplified storage architecture** by removing unnecessary message passing layer
- Direct use of `chrome.storage.local` instead of custom storage wrapper

### ⚡ Performance & Code Quality
- **Reduced codebase by ~30%**:
  - search.js: 462 → 240 lines (-48%)
  - popup.js: 407 → 320 lines (-21%)
- **Removed deprecated files**:
  - storage.js (unnecessary abstraction layer)
  - loader.css (only used by SendHerePlz)
  - products.css (only used by SendHerePlz)
- **Simplified architecture**: Direct storage access, no background script messaging
- **Better code organization**: Clearer function names and documentation

### 🧹 Cleanup
- Removed unused CSS from manifest.json
- Removed SendHerePlz references from:
  - popup.html (UI element)
  - popup.js (settings handling)
  - background.js (initialization)
  - Localization files (en/messages.json, es/messages.json)

### 📝 Documentation
- Updated README.md with current features
- Simplified documentation structure
- Removed outdated markdown files

---

## [0.4.0.6] - 2024-XX-XX

### Fixed
- Duplicate "Precio con nuevo IVA" display on product pages
- Improved delivery detection reliability
- Better removal of referral links in search results
- Price parsing for values higher than 999 with multiple dots

---

## [0.4.0.5] - 2024-12-02

### Added
- Comprehensive error handling throughout codebase
- Enhanced logging with consistent formatting
- JSDoc documentation for all functions
- Defensive checks in product price parsing
- Input validation for tax percentage (0-100%)
- Timeout handling for fetch operations in search results

### Changed
- **Complete code refactoring** for better maintainability
- **Improved README.md** with feature overview and troubleshooting
- **Better currency handling** for different symbols and decimal separators
- Separate handling for German language detection (DE_EN variant)

### Fixed
- Duplicate "DE" country key in tax rates (now DE and DE_EN)
- Missing error handling in popup event listeners
- Unsafe DOM access in search results handler
- Incomplete validation of tax percentage input
- Race condition in storage initialization
- Improper cleanup of loading indicators

### Deprecated
- **Manifest Version 2 (MV2)** - no longer maintained
  - Last supported version: 0.4.0.4
  - Users should migrate to MV3

---

## [0.4.0.4] - Previous Releases

- Last version supporting Manifest Version 2 (MV2)
- Core functionality for VAT removal and price display
- SendHerePlz shipping detection feature (removed in v0.5.0)
- ShortLinks URL shortening feature
- Multi-language support (English, Spanish)

---

## Versioning

TaxFree uses semantic versioning: `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes or major feature removal
- **MINOR**: New features or significant improvements
- **PATCH**: Bug fixes and minor improvements

---

## Support

For issues, questions, or suggestions:
- 🐛 [Report Issues](https://github.com/MDaniel592/TaxFree/issues)
- 💬 [Request Features](https://github.com/MDaniel592/TaxFree/issues/new)
- 📖 [Read README](./README.md)
